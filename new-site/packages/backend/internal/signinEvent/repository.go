package signinEvent

import (
	"errors"
	"fmt"
	"slices"
	"strings"
	"time"

	"gorm.io/gorm"
)

var (
	ErrDuplicateInscription   = errors.New("inscription already exists")
	ErrOverlappingInscription = errors.New("overlapping inscription")
	ErrAlreadyRegistered      = errors.New("inscription already registered")
	ErrEventFull              = errors.New("event is full")
)

// isConfirmedStatus reports whether a status occupies a confirmed slot and
// therefore counts against the event's max_participants.
func isConfirmedStatus(status RegistrationStatus) bool {
	return status == StatusRegistered || status == StatusWaitingDonation
}

// papfeStatusColumn derives the user's PAPFE review state from the users and
// papfe_documents joins added by joinUserInfo.
const papfeStatusColumn = "CASE WHEN NOT users.has_papfe THEN 'Sem PAPFE' " +
	"WHEN papfe_documents.is_approved IS NULL THEN 'Pendente' " +
	"WHEN papfe_documents.is_approved = true THEN 'Aprovado' " +
	"ELSE 'Rejeitado' END AS papfe_status"

// userInfoColumns are the read-only SigninEvent fields filled from the joins.
const userInfoColumns = "users.name AS user_name, users.email AS user_email, " + papfeStatusColumn

// signinWithUserInfoColumns lists signin_events columns explicitly instead of
// signin_events.*: AutoMigrate also creates (always empty) user_name,
// user_email and papfe_status columns on the table, which would collide with
// the joined values of the same name.
const signinWithUserInfoColumns = "signin_events.user_number, signin_events.event_name, " +
	"signin_events.event_init_date, signin_events.user_wait_list_position, signin_events.status, " +
	userInfoColumns

// joinUserInfo adds the joins needed to fill user_name, user_email and
// papfe_status on signin_events queries.
func joinUserInfo(q *gorm.DB) *gorm.DB {
	return q.Joins("LEFT JOIN users ON users.user_number = signin_events.user_number").
		Joins("LEFT JOIN papfe_documents ON papfe_documents.user_email = users.email")
}

// findSigninWithUserInfo fetches a single inscription with its user data, so
// admin mutations return the same shape as the backoffice listing.
func findSigninWithUserInfo(db *gorm.DB, userNumber uint, eventName string, initDate time.Time) (*SigninEvent, error) {
	var signin SigninEvent
	err := joinUserInfo(db.Table("signin_events").Select(signinWithUserInfoColumns)).
		Where("signin_events.user_number = ? AND signin_events.event_name = ? AND signin_events.event_init_date = ?",
			userNumber, eventName, initDate).
		First(&signin).Error
	if err != nil {
		return nil, err
	}

	return &signin, nil
}

type SigninEventRepository interface {
	// CreateAtomicSignin serializes via per-user + per-event advisory locks,
	// checks for duplicate and overlapping inscriptions, then inserts.
	CreateAtomicSignin(userNumber uint, eventName string, initDate time.Time, maxParticipants uint, targetEndDate time.Time) (*SigninEvent, error)
	// CreateAdminSignin is the admin variant: only the per-event advisory lock
	// is acquired and no overlap check is performed (admins bypass that rule).
	// Confirmed statuses are rejected with ErrEventFull when the event has no
	// vacancies left (maxParticipants > 0).
	CreateAdminSignin(userNumber uint, eventName string, initDate time.Time, status RegistrationStatus, maxParticipants uint) (*SigninEvent, error)
	// RemoveAtomicSignin deletes an inscription and atomically decrements the
	// queue positions of the inscriptions that came after it, all under the
	// per-event advisory lock. When a confirmed slot is vacated in a limited
	// event, the first waitlisted user is promoted to StatusWaitingDonation.
	RemoveAtomicSignin(userNumber uint, eventName string, initDate time.Time, maxParticipants uint) error
	GetByUserEventAndInitDate(userNumber uint, eventName string, initDate time.Time) (*SigninEvent, error)
	FindActiveByUser(userNumber uint) ([]SigninEventsDetailed, error)
	UpdateByComposite(userNumber uint, eventName string, initDate time.Time, updated *SigninEvent) error
	GetAll(query SigninEventListQuery) (*SigninEventListResult, error)
	// CountConfirmedSignins returns the number of active confirmed inscriptions
	// (Inscrito or Aguardando Aprovação) for an event. It is the base used to
	// derive a waitlisted user's relative queue position (absolute position
	// minus this count).
	// RegisterAtomicSignin promotes an inscription to StatusRegistered atomically
	// under the per-event advisory lock, preventing races with RotateAtomicSignins.
	// Promoting a non-confirmed inscription is rejected with ErrEventFull when the
	// event has no vacancies left; already-confirmed inscriptions (e.g. approving
	// "Aguardando Aprovação") do not consume an extra slot and are always allowed.
	RegisterAtomicSignin(userNumber uint, eventName string, initDate time.Time, maxParticipants uint) (*SigninEvent, error)
	// UpdateAdminSigninStatus changes an inscription's status atomically under the
	// per-event advisory lock. It reorders all waitlist positions after the change
	// and promotes the first eligible waitlisted user to StatusWaitingDonation if a
	// confirmed slot was vacated.
	UpdateAdminSigninStatus(userNumber uint, eventName string, initDate time.Time, newStatus RegistrationStatus, maxParticipants uint) (*SigninEvent, error)
	// RotateAtomicSignins removes all WaitingDonation inscriptions, promotes
	// waitlisted users to fill the remaining vacancies as StatusWaitingDonation,
	// and reorders all queue positions, atomically under the per-event advisory
	// lock. Returns all active signins and the numbers of users just promoted
	// from the waitlist.
	RotateAtomicSignins(eventName string, initDate time.Time, maxParticipants uint) ([]SigninEvent, []uint, error)
	// FetchUserInfosByNumbers returns name and email for the given user numbers,
	// used to notify promoted users after a queue rotation.
	FetchUserInfosByNumbers(userNumbers []uint) ([]PromotedUserInfo, error)
	// GetStatusCounts returns the count of active inscriptions per status for
	// the given event (or all events when eventName is empty).
	GetStatusCounts(eventName string) (*SigninEventStatusCounts, error)
}

type signinEventRepository struct {
	db *gorm.DB
}

func NewSigninEventRepository(db *gorm.DB) SigninEventRepository {
	return &signinEventRepository{db: db}
}

func (r *signinEventRepository) CreateAtomicSignin(userNumber uint, eventName string, initDate time.Time, maxParticipants uint, targetEndDate time.Time) (*SigninEvent, error) {
	var result *SigninEvent

	err := r.db.Transaction(func(tx *gorm.DB) error {
		// Per-user lock (bigint form) — serializes all concurrent inscription
		// attempts for the same user, preventing the TOCTOU race on the overlap
		// check below. Lock order must always be: user first, then event.
		if err := tx.Exec("SELECT pg_advisory_xact_lock(?)", int64(userNumber)).Error; err != nil {
			return err
		}

		// Per-event lock (two int4 form) — prevents count races between
		// concurrent inscriptions in the same event.
		if err := tx.Exec(
			"SELECT pg_advisory_xact_lock(hashtext(?), hashtext(?))",
			eventName, initDate.Format(time.RFC3339),
		).Error; err != nil {
			return err
		}

		// Duplicate check (inside both locks for a clean conflict error).
		var existing SigninEvent
		if err := tx.Where("user_number = ? AND event_name = ? AND event_init_date = ?",
			userNumber, eventName, initDate).First(&existing).Error; err == nil {
			return ErrDuplicateInscription
		} else if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}

		// Overlap check — must run inside the user advisory lock so that two
		// concurrent requests for overlapping events cannot both pass this check
		// before either inserts.
		var overlapping []SigninEvent
		if err := tx.Table("signin_events").
			Select("signin_events.*").
			Joins("JOIN events ON events.name = signin_events.event_name AND events.init_date = signin_events.event_init_date").
			Where("signin_events.user_number = ?", userNumber).
			Where("NOT (signin_events.event_name = ? AND signin_events.event_init_date = ?)", eventName, initDate).
			Where("signin_events.status != ?", StatusCancelled).
			Where("events.init_date < ? AND ? < events.end_date", targetEndDate, initDate).
			Limit(1).
			Scan(&overlapping).Error; err != nil {
			return err
		}
		if len(overlapping) > 0 {
			return ErrOverlappingInscription
		}

		var count int64
		if err := tx.Model(&SigninEvent{}).
			Where("event_name = ? AND event_init_date = ? AND status != ?", eventName, initDate, StatusCancelled).
			Count(&count).Error; err != nil {
			return err
		}

		status := StatusWaitingDonation
		if maxParticipants > 0 && count >= int64(maxParticipants) {
			status = StatusWaitListed
		}

		signin := &SigninEvent{
			UserNumber:           userNumber,
			EventName:            eventName,
			EventInitDate:        initDate,
			UserWaitListPosition: uint(count + 1),
			Status:               status,
		}

		if err := tx.Create(signin).Error; err != nil {
			return err
		}

		result = signin
		return nil
	})

	return result, err
}

func (r *signinEventRepository) CreateAdminSignin(userNumber uint, eventName string, initDate time.Time, status RegistrationStatus, maxParticipants uint) (*SigninEvent, error) {
	var result *SigninEvent

	err := r.db.Transaction(func(tx *gorm.DB) error {
		// Per-user lock first — same ordering as CreateAtomicSignin so that a
		// concurrent user self-registration's overlap check sees this admin
		// insertion once committed, preventing silent double-booking.
		if err := tx.Exec("SELECT pg_advisory_xact_lock(?)", int64(userNumber)).Error; err != nil {
			return err
		}

		if err := tx.Exec(
			"SELECT pg_advisory_xact_lock(hashtext(?), hashtext(?))",
			eventName, initDate.Format(time.RFC3339),
		).Error; err != nil {
			return err
		}

		var existing SigninEvent
		if err := tx.Where("user_number = ? AND event_name = ? AND event_init_date = ?",
			userNumber, eventName, initDate).First(&existing).Error; err == nil {
			return ErrDuplicateInscription
		} else if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}

		// Admins bypass the overlap rule but must not overbook a limited event:
		// a confirmed status (Inscrito / Aguardando Aprovação) is rejected when
		// there is no vacancy left.
		if isConfirmedStatus(status) && maxParticipants > 0 {
			var confirmedCount int64
			if err := tx.Model(&SigninEvent{}).
				Where("event_name = ? AND event_init_date = ? AND (status = ? OR status = ?)",
					eventName, initDate, StatusRegistered, StatusWaitingDonation).
				Count(&confirmedCount).Error; err != nil {
				return err
			}
			if confirmedCount >= int64(maxParticipants) {
				return ErrEventFull
			}
		}

		var count int64
		if err := tx.Model(&SigninEvent{}).
			Where("event_name = ? AND event_init_date = ? AND status != ?", eventName, initDate, StatusCancelled).
			Count(&count).Error; err != nil {
			return err
		}

		signin := &SigninEvent{
			UserNumber:           userNumber,
			EventName:            eventName,
			EventInitDate:        initDate,
			UserWaitListPosition: uint(count + 1),
			Status:               status,
		}

		if err := tx.Create(signin).Error; err != nil {
			return err
		}

		created, err := findSigninWithUserInfo(tx, userNumber, eventName, initDate)
		if err != nil {
			return err
		}

		result = created
		return nil
	})

	return result, err
}

func (r *signinEventRepository) RemoveAtomicSignin(userNumber uint, eventName string, initDate time.Time, maxParticipants uint) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		// Per-event lock — prevents a concurrent CreateAtomicSignin from
		// inserting a new position between the delete and the promote step,
		// which would cause the newly inserted position to be decremented into
		// the confirmed slot range and then promoted a second time (overbooking).
		if err := tx.Exec(
			"SELECT pg_advisory_xact_lock(hashtext(?), hashtext(?))",
			eventName, initDate.Format(time.RFC3339),
		).Error; err != nil {
			return err
		}

		var signin SigninEvent
		if err := tx.Where("user_number = ? AND event_name = ? AND event_init_date = ?",
			userNumber, eventName, initDate).First(&signin).Error; err != nil {
			return err
		}

		if err := tx.Where("user_number = ? AND event_name = ? AND event_init_date = ?",
			userNumber, eventName, initDate).Delete(&SigninEvent{}).Error; err != nil {
			return err
		}

		// Always decrement regardless of status: a Cancelled row set via
		// UpdateSigninAdmin was never decremented at cancel time, so physically
		// deleting it here must close the gap.
		if signin.UserWaitListPosition > 0 {
			if err := tx.Model(&SigninEvent{}).
				Where("event_name = ? AND event_init_date = ? AND user_wait_list_position > ?",
					eventName, initDate, signin.UserWaitListPosition).
				Update("user_wait_list_position", gorm.Expr("user_wait_list_position - 1")).Error; err != nil {
				return err
			}
		}

		// Exactly one confirmed slot was vacated — promote only the first
		// waitlisted user still within the limit. Unlimited events (0) never
		// have waitlisted users, so no promotion is needed.
		if isConfirmedStatus(signin.Status) && maxParticipants > 0 {
			sub := tx.Model(&SigninEvent{}).
				Select("user_number").
				Where("event_name = ? AND event_init_date = ? AND status = ? AND user_wait_list_position <= ?",
					eventName, initDate, StatusWaitListed, maxParticipants).
				Order("user_wait_list_position asc").
				Limit(1)
			if err := tx.Model(&SigninEvent{}).
				Where("event_name = ? AND event_init_date = ? AND user_number IN (?)",
					eventName, initDate, sub).
				Update("status", StatusWaitingDonation).Error; err != nil {
				return err
			}
		}

		return nil
	})
}

func (r *signinEventRepository) GetByUserEventAndInitDate(userNumber uint, eventName string, initDate time.Time) (*SigninEvent, error) {
	return findSigninWithUserInfo(r.db, userNumber, eventName, initDate)
}

func (r *signinEventRepository) FindActiveByUser(userNumber uint) ([]SigninEventsDetailed, error) {
	var signins []SigninEventsDetailed

	err := r.db.Table("signin_events").
		Select("signin_events.user_number, signin_events.event_name, signin_events.event_init_date, "+
			"events.end_date AS event_end_date, events.type AS event_type, events.location AS event_location, "+
			"events.description AS event_description, "+
			"CASE WHEN signin_events.status = ? AND events.max_participants > 0 "+
			"AND signin_events.user_wait_list_position > events.max_participants "+
			"THEN signin_events.user_wait_list_position - events.max_participants "+
			"ELSE signin_events.user_wait_list_position END AS user_wait_list_position, "+
			"signin_events.status", StatusWaitListed).
		Joins("JOIN events ON events.name = signin_events.event_name AND events.init_date = signin_events.event_init_date").
		Where("signin_events.user_number = ? AND signin_events.status != ?", userNumber, StatusCancelled).
		Order("signin_events.event_init_date asc").
		Scan(&signins).Error
	if err != nil {
		return nil, err
	}

	return signins, nil
}

func (r *signinEventRepository) UpdateByComposite(userNumber uint, eventName string, initDate time.Time, updated *SigninEvent) error {
	result := r.db.Model(&SigninEvent{}).
		Where("user_number = ? AND event_name = ? AND event_init_date = ?", userNumber, eventName, initDate).
		Updates(map[string]any{
			"user_number":             updated.UserNumber,
			"event_name":              updated.EventName,
			"event_init_date":         updated.EventInitDate,
			"user_wait_list_position": updated.UserWaitListPosition,
			"status":                  updated.Status,
		})

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}

	return nil
}

func applyBaseFilters(q *gorm.DB, query SigninEventListQuery) *gorm.DB {
	if query.StatusFilter != "" {
		q = q.Where("signin_events.status = ?", query.StatusFilter)
	}
	if query.EventNameFilter != "" {
		q = q.Where("signin_events.event_name = ?", query.EventNameFilter)
	}
	return q
}

func (r *signinEventRepository) GetAll(query SigninEventListQuery) (*SigninEventListResult, error) {
	var signins []SigninEvent
	var totalRecords int64
	var filteredRecords int64

	sortClause, err := resolveSortClause(query.SortBy, query.SortOrder)
	if err != nil {
		return nil, err
	}

	// totalRecords respeita os filtros base (StatusFilter/EventNameFilter) para que
	// a paginação faça sentido em contextos que sempre restringem o conjunto (ex: confirmações).
	baseCount := applyBaseFilters(r.db.Model(&SigninEvent{}), query)
	if err := baseCount.Count(&totalRecords).Error; err != nil {
		return nil, err
	}

	// papfe_status e user_name são calculados via joins em users/papfe_documents;
	// o count também precisa dessas tabelas quando o filtro referencia essas expressões.
	countBase := applyBaseFilters(r.db.Model(&SigninEvent{}), query)
	if query.SearchBy == "papfe_status" || query.SearchBy == "user_name" {
		countBase = joinUserInfo(countBase)
	}
	filteredQuery := applySearchFilter(countBase, query)
	if err := filteredQuery.Count(&filteredRecords).Error; err != nil {
		return nil, err
	}

	// Os joins de users/papfe_documents são adicionados antes do filtro para que
	// applySearchFilter possa referenciar essas tabelas (ex.: papfe_status).
	dataBase := joinUserInfo(
		applyBaseFilters(
			r.db.Table("signin_events").
				Select("signin_events.user_number, signin_events.event_name, signin_events.event_init_date, "+
					"CASE WHEN signin_events.status = ? AND events.max_participants > 0 "+
					"AND signin_events.user_wait_list_position > events.max_participants "+
					"THEN signin_events.user_wait_list_position - events.max_participants "+
					"ELSE signin_events.user_wait_list_position END AS user_wait_list_position, "+
					"signin_events.status, "+userInfoColumns, StatusWaitListed).
				Joins("LEFT JOIN events ON events.name = signin_events.event_name AND events.init_date = signin_events.event_init_date"),
			query,
		),
	)
	err = applySearchFilter(dataBase, query).
		Order(sortClause).Limit(query.Limit).Offset(query.Offset).Scan(&signins).Error
	if err != nil {
		return nil, err
	}

	return &SigninEventListResult{
		Signins:         signins,
		TotalRecords:    totalRecords,
		FilteredRecords: filteredRecords,
	}, nil
}

func (r *signinEventRepository) RegisterAtomicSignin(userNumber uint, eventName string, initDate time.Time, maxParticipants uint) (*SigninEvent, error) {
	var result *SigninEvent

	err := r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Exec(
			"SELECT pg_advisory_xact_lock(hashtext(?), hashtext(?))",
			eventName, initDate.Format(time.RFC3339),
		).Error; err != nil {
			return err
		}

		var signin SigninEvent
		if err := tx.Where("user_number = ? AND event_name = ? AND event_init_date = ?",
			userNumber, eventName, initDate).First(&signin).Error; err != nil {
			return err
		}

		if signin.Status == StatusRegistered {
			return ErrAlreadyRegistered
		}

		// Promoting a non-confirmed inscription consumes a slot, so it must not
		// exceed the event capacity. Already-confirmed inscriptions (e.g. an
		// "Aguardando Aprovação" being approved) occupy a slot already and are
		// always allowed.
		if !isConfirmedStatus(signin.Status) && maxParticipants > 0 {
			var confirmedCount int64
			if err := tx.Model(&SigninEvent{}).
				Where("event_name = ? AND event_init_date = ? AND (status = ? OR status = ?)",
					eventName, initDate, StatusRegistered, StatusWaitingDonation).
				Count(&confirmedCount).Error; err != nil {
				return err
			}
			if confirmedCount >= int64(maxParticipants) {
				return ErrEventFull
			}
		}

		if err := tx.Model(&SigninEvent{}).
			Where("user_number = ? AND event_name = ? AND event_init_date = ?",
				userNumber, eventName, initDate).
			Update("status", StatusRegistered).Error; err != nil {
			return err
		}

		registered, err := findSigninWithUserInfo(tx, userNumber, eventName, initDate)
		if err != nil {
			return err
		}

		result = registered
		return nil
	})

	return result, err
}

func (r *signinEventRepository) UpdateAdminSigninStatus(userNumber uint, eventName string, initDate time.Time, newStatus RegistrationStatus, maxParticipants uint) (*SigninEvent, error) {
	var result *SigninEvent

	err := r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Exec(
			"SELECT pg_advisory_xact_lock(hashtext(?), hashtext(?))",
			eventName, initDate.Format(time.RFC3339),
		).Error; err != nil {
			return err
		}

		var signin SigninEvent
		if err := tx.Where("user_number = ? AND event_name = ? AND event_init_date = ?",
			userNumber, eventName, initDate).First(&signin).Error; err != nil {
			return err
		}

		oldStatus := signin.Status

		// A manual transition into a confirmed status consumes a slot and must
		// not overbook a limited event. Transitions between confirmed statuses
		// (e.g. "Inscrito" <-> "Aguardando Aprovação") keep the same count and
		// are always allowed.
		if isConfirmedStatus(newStatus) && !isConfirmedStatus(oldStatus) && maxParticipants > 0 {
			var confirmedCount int64
			if err := tx.Model(&SigninEvent{}).
				Where("event_name = ? AND event_init_date = ? AND (status = ? OR status = ?)",
					eventName, initDate, StatusRegistered, StatusWaitingDonation).
				Count(&confirmedCount).Error; err != nil {
				return err
			}
			if confirmedCount >= int64(maxParticipants) {
				return ErrEventFull
			}
		}

		if err := tx.Model(&SigninEvent{}).
			Where("user_number = ? AND event_name = ? AND event_init_date = ?",
				userNumber, eventName, initDate).
			Update("status", newStatus).Error; err != nil {
			return err
		}

		// Reorder all active (non-Cancelled) positions to a gapless 1..N sequence
		// so that status transitions do not leave holes in the waitlist order.
		if err := tx.Exec(`
			WITH ranked AS (
				SELECT user_number,
				       ROW_NUMBER() OVER (ORDER BY user_wait_list_position ASC) AS new_pos
				FROM signin_events
				WHERE event_name = ? AND event_init_date = ? AND status != ?
			)
			UPDATE signin_events se
			SET user_wait_list_position = r.new_pos
			FROM ranked r
			WHERE se.user_number = r.user_number
			  AND se.event_name = ?
			  AND se.event_init_date = ?
		`, eventName, initDate, StatusCancelled, eventName, initDate).Error; err != nil {
			return err
		}

		// If a confirmed slot was vacated, count remaining confirmed users and
		// promote the first eligible waitlisted user if a vacancy still exists.
		// The changed user is excluded from promotion to avoid immediately
		// re-promoting someone the admin just demoted to WaitListed.
		wasConfirmed := isConfirmedStatus(oldStatus)
		isNowUnconfirmed := newStatus == StatusCancelled || newStatus == StatusWaitListed
		if wasConfirmed && isNowUnconfirmed && maxParticipants > 0 {
			var confirmedCount int64
			if err := tx.Model(&SigninEvent{}).
				Where("event_name = ? AND event_init_date = ? AND (status = ? OR status = ?)",
					eventName, initDate, StatusRegistered, StatusWaitingDonation).
				Count(&confirmedCount).Error; err != nil {
				return err
			}

			if confirmedCount < int64(maxParticipants) {
				sub := tx.Model(&SigninEvent{}).
					Select("user_number").
					Where("event_name = ? AND event_init_date = ? AND status = ? AND user_number != ?",
						eventName, initDate, StatusWaitListed, userNumber).
					Order("user_wait_list_position asc").
					Limit(1)

				if err := tx.Model(&SigninEvent{}).
					Where("event_name = ? AND event_init_date = ? AND status = ? AND user_number IN (?)",
						eventName, initDate, StatusWaitListed, sub).
					Update("status", StatusWaitingDonation).Error; err != nil {
					return err
				}
			}
		}

		updated, err := findSigninWithUserInfo(tx, userNumber, eventName, initDate)
		if err != nil {
			return err
		}

		result = updated
		return nil
	})

	return result, err
}

func (r *signinEventRepository) RotateAtomicSignins(eventName string, initDate time.Time, maxParticipants uint) ([]SigninEvent, []uint, error) {
	var result []SigninEvent
	var promotedUserNumbers []uint

	err := r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Exec(
			"SELECT pg_advisory_xact_lock(hashtext(?), hashtext(?))",
			eventName, initDate.Format(time.RFC3339),
		).Error; err != nil {
			return err
		}

		if err := tx.Where("event_name = ? AND event_init_date = ? AND status = ?",
			eventName, initDate, StatusWaitingDonation).
			Delete(&SigninEvent{}).Error; err != nil {
			return err
		}

		var registeredCount int64
		if err := tx.Model(&SigninEvent{}).
			Where("event_name = ? AND event_init_date = ? AND status = ?",
				eventName, initDate, StatusRegistered).
			Count(&registeredCount).Error; err != nil {
			return err
		}

		toPromote := int(maxParticipants) - int(registeredCount)
		if toPromote > 0 {
			if err := tx.Model(&SigninEvent{}).
				Select("user_number").
				Where("event_name = ? AND event_init_date = ? AND status = ?",
					eventName, initDate, StatusWaitListed).
				Order("user_wait_list_position asc").
				Limit(toPromote).
				Pluck("user_number", &promotedUserNumbers).Error; err != nil {
				return err
			}

			if err := tx.Model(&SigninEvent{}).
				Where("event_name = ? AND event_init_date = ? AND status = ? AND user_number IN (?)",
					eventName, initDate, StatusWaitListed, promotedUserNumbers).
				Update("status", StatusWaitingDonation).Error; err != nil {
				return err
			}
		}

		// Reorder all active positions to a gapless 1..N sequence using a
		// window function — replaces the N individual UPDATE calls.
		if err := tx.Exec(`
			WITH ranked AS (
				SELECT user_number,
				       ROW_NUMBER() OVER (ORDER BY user_wait_list_position ASC) AS new_pos
				FROM signin_events
				WHERE event_name = ? AND event_init_date = ? AND status != ?
			)
			UPDATE signin_events se
			SET user_wait_list_position = r.new_pos
			FROM ranked r
			WHERE se.user_number = r.user_number
			  AND se.event_name = ?
			  AND se.event_init_date = ?
		`, eventName, initDate, StatusCancelled, eventName, initDate).Error; err != nil {
			return err
		}

		if err := joinUserInfo(tx.Table("signin_events").Select(signinWithUserInfoColumns)).
			Where("signin_events.event_name = ? AND signin_events.event_init_date = ? AND signin_events.status != ?",
				eventName, initDate, StatusCancelled).
			Order("signin_events.user_wait_list_position asc").
			Find(&result).Error; err != nil {
			return err
		}

		return nil
	})

	return result, promotedUserNumbers, err
}

func (r *signinEventRepository) FetchUserInfosByNumbers(userNumbers []uint) ([]PromotedUserInfo, error) {
	if len(userNumbers) == 0 {
		return nil, nil
	}
	var infos []PromotedUserInfo
	err := r.db.Table("users").
		Select("user_number, name, email").
		Where("user_number IN (?)", userNumbers).
		Scan(&infos).Error
	return infos, err
}

func (r *signinEventRepository) GetStatusCounts(eventName string) (*SigninEventStatusCounts, error) {
	type row struct {
		Status string
		Count  int64
	}
	var rows []row
	q := r.db.Model(&SigninEvent{}).
		Select("status, COUNT(*) as count").
		Where("status != ?", StatusCancelled).
		Group("status")
	if eventName != "" {
		q = q.Where("event_name = ?", eventName)
	}
	if err := q.Scan(&rows).Error; err != nil {
		return nil, err
	}
	counts := &SigninEventStatusCounts{}
	for _, row := range rows {
		switch RegistrationStatus(row.Status) {
		case StatusRegistered:
			counts.Inscrito = row.Count
		case StatusWaitingDonation:
			counts.AguardandoAprovacao = row.Count
		case StatusWaitListed:
			counts.ListaDeEspera = row.Count
		}
	}
	return counts, nil
}

func applySearchFilter(dbQuery *gorm.DB, query SigninEventListQuery) *gorm.DB {
	if query.SearchBy == "" || query.SearchValue == "" {
		return dbQuery
	}

	switch query.SearchBy {
	case "user_number":
		return dbQuery.Where("signin_events.user_number::text ILIKE ?", "%"+query.SearchValue+"%")
	case "event_name":
		return dbQuery.Where("signin_events.event_name ILIKE ?", "%"+query.SearchValue+"%")
	case "event_init_date":
		parsedTime, _ := time.Parse(time.RFC3339, query.SearchValue)
		return dbQuery.Where("DATE(signin_events.event_init_date) = DATE(?)", parsedTime)
	case "status":
		return dbQuery.Where("signin_events.status ILIKE ?", "%"+query.SearchValue+"%")
	case "user_name":
		// user_name vem do join com users (via joinUserInfo)
		return dbQuery.Where("users.name ILIKE ?", "%"+query.SearchValue+"%")
	case "user_wait_list_position":
		return dbQuery.Where("signin_events.user_wait_list_position = ?", query.SearchValue)
	case "papfe_status":
		// papfe_status é uma expressão CASE sobre users/papfe_documents; as tabelas
		// devem estar joinadas antes de chamar esta função (ver GetAll).
		return dbQuery.Where(
			"CASE WHEN NOT users.has_papfe THEN 'Sem PAPFE' "+
				"WHEN papfe_documents.is_approved IS NULL THEN 'Pendente' "+
				"WHEN papfe_documents.is_approved = true THEN 'Aprovado' "+
				"ELSE 'Rejeitado' END ILIKE ?",
			"%"+query.SearchValue+"%",
		)
	default:
		return dbQuery
	}
}

func resolveSortClause(sortBy string, sortOrder string) (string, error) {
	allowedSortFields := []string{
		"user_number",
		"event_name",
		"event_init_date",
		"status",
		"user_wait_list_position",
		"status_priority",
	}

	field := strings.ToLower(sortBy)
	isAllowedField := slices.Contains(allowedSortFields, field)
	if !isAllowedField {
		return "", fmt.Errorf("invalid sort field")
	}

	order := strings.ToLower(sortOrder)
	if order != "asc" && order != "desc" {
		return "", fmt.Errorf("invalid sort order")
	}

	if field == "status_priority" {
		// Agrupa pelo status na ordem de operação do evento — Inscrito,
		// Aguardando Aprovação, Lista de Espera (na ordem da fila) e por fim
		// Cancelado — desempatando por evento e posição de inscrição.
		statusPriority := fmt.Sprintf(`CASE signin_events.status
			WHEN '%s' THEN 1
			WHEN '%s' THEN 2
			WHEN '%s' THEN 3
			WHEN '%s' THEN 4
			ELSE 5 END`, StatusRegistered, StatusWaitingDonation, StatusWaitListed, StatusCancelled)
		return statusPriority + " " + order +
			", signin_events.event_name asc" +
			", signin_events.user_wait_list_position asc" +
			", signin_events.user_number asc", nil
	}

	// Qualifica a coluna para que o ORDER BY não resolva para o alias
	// projetado (o CASE de user_wait_list_position), que zera os status
	// não-espera e embaralharia a ordenação.
	return "signin_events." + field + " " + order, nil
}

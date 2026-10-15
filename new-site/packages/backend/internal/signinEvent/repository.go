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

type SigninEventRepository interface {
	// CreateAtomicSignin serializes via per-user + per-event advisory locks,
	// checks for duplicate and overlapping inscriptions, then inserts.
	CreateAtomicSignin(userNumber uint, eventName string, initDate time.Time, maxParticipants uint, targetEndDate time.Time) (*SigninEvent, error)
	// CreateAdminSignin is the admin variant: only the per-event advisory lock
	// is acquired and no overlap check is performed (admins bypass that rule).
	// Confirmed statuses are rejected with ErrEventFull when the event has no
	// vacancies left (maxParticipants > 0).
	CreateAdminSignin(userNumber uint, eventName string, initDate time.Time, status RegistrationStatus, maxParticipants uint) (*SigninEvent, error)
	// RemoveAtomicSignin deletes an inscription and atomically decrements
	// queue positions and promotes waitlisted users, all under the per-event
	// advisory lock so concurrent inscriptions cannot race the promotion step.
	RemoveAtomicSignin(userNumber uint, eventName string, initDate time.Time, maxParticipants uint) error
	GetByUserEventAndInitDate(userNumber uint, eventName string, initDate time.Time) (*SigninEvent, error)
	FindActiveByUser(userNumber uint) ([]SigninEventsDetailed, error)
	UpdateByComposite(userNumber uint, eventName string, initDate time.Time, updated *SigninEvent) error
	GetAll(query SigninEventListQuery) (*SigninEventListResult, error)
	// CountConfirmedSignins returns the number of active confirmed inscriptions
	// (Inscrito or Aguardando Aprovação) for an event. It is the base used to
	// derive a waitlisted user's relative queue position (absolute position
	// minus this count).
	CountConfirmedSignins(eventName string, initDate time.Time) (uint, error)
	// RegisterAtomicSignin promotes an inscription to StatusRegistered atomically
	// under the per-event advisory lock, preventing races with RotateAtomicSignins.
	// Promoting a non-confirmed inscription is rejected with ErrEventFull when the
	// event has no vacancies left; already-confirmed inscriptions (e.g. approving
	// "Aguardando Aprovação") do not consume an extra slot and are always allowed.
	RegisterAtomicSignin(userNumber uint, eventName string, initDate time.Time, maxParticipants uint) (*SigninEvent, error)
	// UpdateAdminSigninStatus changes an inscription's status atomically under the
	// per-event advisory lock. It reorders all waitlist positions after the change
	// and promotes the first eligible waitlisted user if a confirmed slot was vacated.
	UpdateAdminSigninStatus(userNumber uint, eventName string, initDate time.Time, newStatus RegistrationStatus, maxParticipants uint) (*SigninEvent, error)
	// RotateAtomicSignins removes all WaitingDonation inscriptions, promotes
	// waitlisted users to fill vacancies, and reorders all queue positions,
	// atomically under the per-event advisory lock.
	RotateAtomicSignins(eventName string, initDate time.Time, maxParticipants uint) ([]SigninEvent, error)
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

		result = signin
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

		if signin.Status == StatusRegistered || signin.Status == StatusWaitingDonation {
			if maxParticipants > 0 {
				// Limited event: exactly one vacancy was freed — promote only the
				// highest-priority waitlisted user now within the limit.
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
			} else {
				// Unlimited event: no capacity constraint — promote all waitlisted.
				if err := tx.Model(&SigninEvent{}).
					Where("event_name = ? AND event_init_date = ? AND status = ?",
						eventName, initDate, StatusWaitListed).
					Update("status", StatusWaitingDonation).Error; err != nil {
					return err
				}
			}
		}

		return nil
	})
}

func (r *signinEventRepository) GetByUserEventAndInitDate(userNumber uint, eventName string, initDate time.Time) (*SigninEvent, error) {
	var signin SigninEvent
	err := r.db.Where("user_number = ? AND event_name = ? AND event_init_date = ?", userNumber, eventName, initDate).First(&signin).Error
	if err != nil {
		return nil, err
	}

	return &signin, nil
}

// confirmedCountJoin aggregates the number of confirmed (Inscrito or Aguardando
// Aprovação) inscriptions per event. A waitlisted inscription's relative queue
// position is its absolute position minus this count — more accurate than
// subtracting max_participants, which only holds when the event is completely
// full (e.g. it breaks after running the queue or after cancellations).
const confirmedCountJoin = `LEFT JOIN (
		SELECT event_name, event_init_date, COUNT(*) AS confirmed_count
		FROM signin_events
		WHERE status IN (?, ?)
		GROUP BY event_name, event_init_date
	) confirmed_signins
		ON confirmed_signins.event_name = signin_events.event_name
		AND confirmed_signins.event_init_date = signin_events.event_init_date`

// relativeWaitListPositionSelect projects the relative queue position for
// waitlisted inscriptions. Every other status has no meaningful queue position
// and projects 0, which the JSON `omitempty` drops entirely.
const relativeWaitListPositionSelect = `CASE
		WHEN signin_events.status = ?
		THEN GREATEST(signin_events.user_wait_list_position - COALESCE(confirmed_signins.confirmed_count, 0), 1)
		ELSE 0 END`

func (r *signinEventRepository) FindActiveByUser(userNumber uint) ([]SigninEventsDetailed, error) {
	var signins []SigninEventsDetailed

	err := r.db.Table("signin_events").
		Select("signin_events.user_number, signin_events.event_name, signin_events.event_init_date, "+
			"events.end_date AS event_end_date, events.type AS event_type, events.location AS event_location, "+
			"events.description AS event_description, "+
			relativeWaitListPositionSelect+" AS user_wait_list_position, "+
			"signin_events.status", StatusWaitListed).
		Joins("JOIN events ON events.name = signin_events.event_name AND events.init_date = signin_events.event_init_date").
		Joins(confirmedCountJoin, StatusRegistered, StatusWaitingDonation).
		Where("signin_events.user_number = ? AND signin_events.status != ?", userNumber, StatusCancelled).
		Order("signin_events.event_init_date asc").
		Scan(&signins).Error
	if err != nil {
		return nil, err
	}

	return signins, nil
}

func (r *signinEventRepository) CountConfirmedSignins(eventName string, initDate time.Time) (uint, error) {
	var count int64
	err := r.db.Model(&SigninEvent{}).
		Where("event_name = ? AND event_init_date = ? AND (status = ? OR status = ?)",
			eventName, initDate, StatusRegistered, StatusWaitingDonation).
		Count(&count).Error
	if err != nil {
		return 0, err
	}

	return uint(count), nil
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

func (r *signinEventRepository) GetAll(query SigninEventListQuery) (*SigninEventListResult, error) {
	var signins []SigninEvent
	var totalRecords int64
	var filteredRecords int64

	sortClause, err := resolveSortClause(query.SortBy, query.SortOrder)
	if err != nil {
		return nil, err
	}

	if err := r.db.Model(&SigninEvent{}).Count(&totalRecords).Error; err != nil {
		return nil, err
	}

	filteredQuery := applySearchFilter(r.db.Model(&SigninEvent{}), query)
	if err := filteredQuery.Count(&filteredRecords).Error; err != nil {
		return nil, err
	}

	dataQuery := applySearchFilter(r.db.Table("signin_events"), query)
	err = dataQuery.
		Select("signin_events.user_number, signin_events.event_name, signin_events.event_init_date, "+
			relativeWaitListPositionSelect+" AS user_wait_list_position, "+
			"signin_events.status, users.name AS user_name", StatusWaitListed).
		Joins(confirmedCountJoin, StatusRegistered, StatusWaitingDonation).
		Joins("LEFT JOIN users ON users.user_number = signin_events.user_number").
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

		signin.Status = StatusRegistered
		result = &signin
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
		wasConfirmed := oldStatus == StatusRegistered || oldStatus == StatusWaitingDonation
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

		if err := tx.Where("user_number = ? AND event_name = ? AND event_init_date = ?",
			userNumber, eventName, initDate).First(&signin).Error; err != nil {
			return err
		}

		result = &signin
		return nil
	})

	return result, err
}

func (r *signinEventRepository) RotateAtomicSignins(eventName string, initDate time.Time, maxParticipants uint) ([]SigninEvent, error) {
	var result []SigninEvent

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
			sub := tx.Model(&SigninEvent{}).
				Select("user_number").
				Where("event_name = ? AND event_init_date = ? AND status = ?",
					eventName, initDate, StatusWaitListed).
				Order("user_wait_list_position asc").
				Limit(toPromote)

			if err := tx.Model(&SigninEvent{}).
				Where("event_name = ? AND event_init_date = ? AND status = ? AND user_number IN (?)",
					eventName, initDate, StatusWaitListed, sub).
				Update("status", StatusRegistered).Error; err != nil {
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

		if err := tx.Where("event_name = ? AND event_init_date = ? AND status != ?",
			eventName, initDate, StatusCancelled).
			Order("user_wait_list_position asc").
			Find(&result).Error; err != nil {
			return err
		}

		return nil
	})

	return result, err
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

	// Qualifica a coluna para que o ORDER BY não resolva para o alias
	// projetado (o CASE de user_wait_list_position), que zera os status
	// não-espera e embaralharia a ordenação.
	return "signin_events." + field + " " + order, nil
}

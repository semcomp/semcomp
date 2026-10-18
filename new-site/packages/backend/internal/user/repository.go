package user

import (
	"backend/internal/apierrors"
	"errors"
	"fmt"
	"slices"
	"strings"
	"time"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// UserRepository define as operações de acesso a dados para a entidade User.
type UserRepository interface {
	Create(user *User) error
	GetByID(id uint) (*User, error)
	GetByEmail(email string) (*User, error)
	GetByVerificationTokenHash(hash string) (*User, error)
	GetAll(query UserListQuery) (*UserListResult, error)
	Update(user *User) error
	Delete(id uint) error
}

// userRepository é a implementação de UserRepository baseada no GORM.
type userRepository struct {
	db *gorm.DB
}

// NewUserRepository inicializa e retorna uma nova instância de UserRepository.
func NewUserRepository(db *gorm.DB) UserRepository {
	return &userRepository{db: db}
}

// Create insere um novo registro de usuário no banco de dados.
func (r *userRepository) Create(user *User) error {
	return r.db.Create(user).Error
}

// GetByID busca um usuário pelo ID único especificado.
func (r *userRepository) GetByID(id uint) (*User, error) {
	var user User
	err := r.db.First(&user, id).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, apierrors.NotFoundError("Usuário não encontrado", err)
	}

	return &user, err
}

// GetByEmail busca um usuário que corresponda ao email informado.
func (r *userRepository) GetByEmail(email string) (*User, error) {
	var user User
	err := r.db.Where("email = ?", email).First(&user).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, apierrors.ValidationError("Email não encontrado", err)
	}

	return &user, err
}

// GetByVerificationTokenHash busca um usuário pelo hash do token de verificação de e-mail.
func (r *userRepository) GetByVerificationTokenHash(hash string) (*User, error) {
	var user User
	err := r.db.Where("verification_token_hash = ?", hash).First(&user).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, apierrors.NotFoundError("Token de verificação não encontrado", err)
	}

	return &user, err
}

func applySearchFilter(dbQuery *gorm.DB, query UserListQuery) *gorm.DB {
	if query.SearchBy == "" || query.SearchValue == "" {
		return dbQuery
	}

	switch query.SearchBy {
	case "user_number":
		return dbQuery.Where("user_number = ?", query.SearchValue)
	case "name":
		return dbQuery.Where("name ILIKE ?", "%"+query.SearchValue+"%")
	case "email":
		return dbQuery.Where("email ILIKE ?", "%"+query.SearchValue+"%")
	case "age":
		return dbQuery.Where("age = ?", query.SearchValue)
	case "gender":
		return dbQuery.Where("gender ILIKE ?", "%"+query.SearchValue+"%")
	case "city":
		return dbQuery.Where("city ILIKE ?", "%"+query.SearchValue+"%")
	case "education":
		return dbQuery.Where("education ILIKE ?", "%"+query.SearchValue+"%")
	case "has_papfe":
		return dbQuery.Where("has_papfe = ?", query.SearchValue)
	case "disabilities":
    	return dbQuery.Where("disabilities ILIKE ?", "%"+query.SearchValue+"%")
	case "profession":
		return dbQuery.Where("profession ILIKE ?", "%"+query.SearchValue+"%")
	case "linkedin":
		return dbQuery.Where("linkedin ILIKE ?", "%"+query.SearchValue+"%")
	case "telegram":
		return dbQuery.Where("telegram ILIKE ?", "%"+query.SearchValue+"%")
	case "presence_rate":
		return dbQuery.Where("presence_rate = ?", query.SearchValue)
	case "quer_cracha":
		return dbQuery.Where("quer_cracha = ?", query.SearchValue)
	case "autoriza_compartilhamento":
		return dbQuery.Where("autoriza_compartilhamento = ?", query.SearchValue)
	default:
		return dbQuery
	}
}

func resolveSortClause(sortBy string, sortOrder string) (string, error) {
	allowedSortFields := []string{
		"user_number",
		"name",
		"email",
		"age",
		"gender",
		"city",
		"education",
		"has_papfe",
		"profession",
		"linkedin",
		"telegram",
		"presence_rate",
		"quer_cracha",
		"autoriza_compartilhamento",
		"disabilities",
	}

	field := strings.ToLower(sortBy)
	isAllowedField := slices.Contains(allowedSortFields, field)
	if !isAllowedField {
		return "", fmt.Errorf("Valor inválido para campo 'sort_by' ")
	}

	order := strings.ToLower(sortOrder)
	if order != "asc" && order != "desc" {
		return "", fmt.Errorf("Valor inválido para campo 'sort_order' ")
	}

	return field + " " + order, nil
}

// GetAll retorna uma lista de todos os usuários cadastrados, com os devidos filtros e
// ordenações aplicados.
func (r *userRepository) GetAll(query UserListQuery) (*UserListResult, error) {
	var users []User
	var totalRecords int64
	var filteredRecords int64

	sortClause, err := resolveSortClause(query.SortBy, query.SortOrder)
	if err != nil {
		return nil, err
	}

	if err := r.db.Model(&User{}).Count(&totalRecords).Error; err != nil {
		return nil, err
	}

	filteredQuery := applySearchFilter(r.db.Model(&User{}), query)
	if err := filteredQuery.Count(&filteredRecords).Error; err != nil {
		return nil, err
	}

	dataQuery := applySearchFilter(r.db.Model(&User{}), query)
	err = dataQuery.Order(sortClause).Limit(query.Limit).Offset(query.Offset).Find(&users).Error
	if err != nil {
		return nil, err
	}

	return &UserListResult{
		Users:           ToSafeUsers(users),
		TotalRecords:    totalRecords,
		FilteredRecords: filteredRecords,
	}, nil
}

// Update salva as modificações de um registro de usuário existente no banco de dados.
func (r *userRepository) Update(user *User) error {
	return r.db.Save(user).Error
}

// Delete realiza a exclusão de um usuário identificando-o pelo ID.
func (r *userRepository) Delete(id uint) error {
	return r.db.Delete(&User{}, id).Error
}

type PapfeDocumentListQuery struct {
	Limit       int
	Offset      int
	SortBy      string
	SortOrder   string
	SearchBy    string
	SearchValue string
}

type PapfeDocumentListResult struct {
	Documents       []PapfeDocumentInfo `json:"papfe_documents"`
	TotalRecords    int64               `json:"total_records"`
	FilteredRecords int64               `json:"filtered_records"`
}

// PapfeDocumentRepository define as operações de acesso a dados para comprovantes PAPFE.
type PapfeDocumentRepository interface {
	FindByEmail(email string) (*PapfeDocument, error)
	GetAll(query PapfeDocumentListQuery) (*PapfeDocumentListResult, error)
	FindAll() ([]PapfeDocumentInfo, error)
	FindInfoByEmail(email string) (*PapfeDocumentInfo, error)
	Upsert(doc *PapfeDocument) error
	UpdateApproval(email string, approved bool, rejectionReason *string) error
	DeleteByEmail(email string) error
}

type papfeDocumentRepository struct {
	db *gorm.DB
}

func NewPapfeDocumentRepository(db *gorm.DB) PapfeDocumentRepository {
	return &papfeDocumentRepository{db: db}
}

// papfeInfoQuery monta a projeção denormalizada (join com users) compartilhada por
// FindAll e FindInfoByEmail.
func (r *papfeDocumentRepository) papfeInfoQuery() *gorm.DB {
	return r.db.Table("papfe_documents pd").
		Select("pd.id, u.user_number, u.name AS user_name, pd.user_email, pd.filename, pd.content_type, pd.uploaded_at, pd.is_approved, pd.rejection_reason").
		Joins("JOIN users u ON u.email = pd.user_email")
}

func applyPapfeSearchFilter(dbQuery *gorm.DB, query PapfeDocumentListQuery) *gorm.DB {
	if query.SearchBy == "" || query.SearchValue == "" {
		return dbQuery
	}
	switch query.SearchBy {
	case "user_name":
		return dbQuery.Where("u.name ILIKE ?", "%"+query.SearchValue+"%")
	case "uploaded_at":
		return dbQuery.Where("DATE(pd.uploaded_at)::text ILIKE ?", "%"+query.SearchValue+"%")
	case "status":
		switch strings.ToLower(query.SearchValue) {
		case "aprovado":
			return dbQuery.Where("pd.is_approved = ?", true)
		case "rejeitado":
			return dbQuery.Where("pd.is_approved = ?", false)
		case "pendente":
			return dbQuery.Where("pd.is_approved IS NULL")
		}
	}
	return dbQuery
}

func resolvePapfeSortClause(sortBy, sortOrder string) (string, error) {
	allowed := []string{"user_name", "uploaded_at"}
	field := strings.ToLower(sortBy)
	if !slices.Contains(allowed, field) {
		return "", fmt.Errorf("invalid sort field")
	}
	order := strings.ToLower(sortOrder)
	if order != "asc" && order != "desc" {
		return "", fmt.Errorf("invalid sort order")
	}
	columnMap := map[string]string{
		"user_name":   "u.name",
		"uploaded_at": "pd.uploaded_at",
	}
	return columnMap[field] + " " + order, nil
}

func (r *papfeDocumentRepository) GetAll(query PapfeDocumentListQuery) (*PapfeDocumentListResult, error) {
	var totalRecords int64
	var filteredRecords int64
	results := make([]PapfeDocumentInfo, 0)

	sortClause, err := resolvePapfeSortClause(query.SortBy, query.SortOrder)
	if err != nil {
		return nil, apierrors.ValidationError("Campo de ordenação inválido para PAPFE", err)
	}

	baseCount := r.db.Table("papfe_documents pd").
		Joins("JOIN users u ON u.email = pd.user_email")

	if err := baseCount.Count(&totalRecords).Error; err != nil {
		return nil, apierrors.InternalServerError("Erro ao contar comprovantes PAPFE", err)
	}

	if err := applyPapfeSearchFilter(baseCount, query).Count(&filteredRecords).Error; err != nil {
		return nil, apierrors.InternalServerError("Erro ao contar comprovantes PAPFE filtrados", err)
	}

	err = applyPapfeSearchFilter(r.papfeInfoQuery(), query).
		Order(sortClause).
		Limit(query.Limit).
		Offset(query.Offset).
		Scan(&results).Error
	if err != nil {
		return nil, apierrors.InternalServerError("Erro ao listar comprovantes PAPFE", err)
	}

	return &PapfeDocumentListResult{
		Documents:       results,
		TotalRecords:    totalRecords,
		FilteredRecords: filteredRecords,
	}, nil
}

// FindAll retorna metadados de todos os comprovantes PAPFE, com nome e número do usuário.
func (r *papfeDocumentRepository) FindAll() ([]PapfeDocumentInfo, error) {
	var result []PapfeDocumentInfo
	err := r.papfeInfoQuery().
		Order("pd.uploaded_at DESC").
		Scan(&result).Error
	if err != nil {
		return nil, apierrors.InternalServerError("Erro ao listar comprovantes PAPFE", err)
	}
	return result, nil
}

// FindInfoByEmail retorna a projeção do comprovante PAPFE de um usuário pelo e-mail.
// Usa Scan (não First), que não retorna gorm.ErrRecordNotFound quando não há linhas —
// por isso checamos ID == 0.
func (r *papfeDocumentRepository) FindInfoByEmail(email string) (*PapfeDocumentInfo, error) {
	var info PapfeDocumentInfo
	if err := r.papfeInfoQuery().Where("pd.user_email = ?", email).Scan(&info).Error; err != nil {
		return nil, apierrors.InternalServerError("Erro ao buscar comprovante PAPFE", err)
	}
	if info.ID == 0 {
		return nil, apierrors.NotFoundError("Comprovante PAPFE não encontrado", nil)
	}
	return &info, nil
}

// FindByEmail busca o comprovante PAPFE de um usuário pelo e-mail.
func (r *papfeDocumentRepository) FindByEmail(email string) (*PapfeDocument, error) {
	var doc PapfeDocument
	err := r.db.Where("user_email = ?", email).First(&doc).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apierrors.NotFoundError("Comprovante PAPFE não encontrado", err)
		}
		return nil, apierrors.InternalServerError("Erro ao buscar comprovante PAPFE", err)
	}
	return &doc, nil
}

// Upsert insere ou atualiza o comprovante PAPFE de um usuário (único por e-mail).
func (r *papfeDocumentRepository) Upsert(doc *PapfeDocument) error {
	return r.db.Omit("User").
		Clauses(clause.OnConflict{
			Columns:   []clause.Column{{Name: "user_email"}},
			DoUpdates: clause.AssignmentColumns([]string{"filename", "content_type", "file_path", "uploaded_at", "is_approved", "rejection_reason"}),
		}).
		Create(doc).Error
}

// UpdateApproval atualiza o status de aprovação do comprovante PAPFE de um usuário.
// rejectionReason só deve ser não-nulo quando approved=false (rejeição); em qualquer
// outro caso deve vir nil para limpar o motivo.
func (r *papfeDocumentRepository) UpdateApproval(email string, approved bool, rejectionReason *string) error {
	result := r.db.Model(&PapfeDocument{}).
		Where("user_email = ?", email).
		Updates(map[string]interface{}{
			"is_approved":      approved,
			"rejection_reason": rejectionReason,
		})
	if result.Error != nil {
		return apierrors.InternalServerError("Erro ao atualizar aprovação do comprovante PAPFE", result.Error)
	}
	if result.RowsAffected == 0 {
		return apierrors.NotFoundError("Comprovante PAPFE não encontrado para o usuário", nil)
	}
	return nil
}

// DeleteByEmail remove o comprovante PAPFE associado ao e-mail informado.
func (r *papfeDocumentRepository) DeleteByEmail(email string) error {
	return r.db.Where("user_email = ?", email).Delete(&PapfeDocument{}).Error
}

// BadgeDeliveryRepository define as operações de acesso a dados para entrega de crachás.
type BadgeDeliveryRepository interface {
	GetAll(page, limit int, sortBy, sortOrder, searchBy, searchValue string) (*BadgeDeliveryListResult, error)
	Mark(userNumber uint, adminEmail string) error
	Unmark(userNumber uint) error
}

type badgeDeliveryRepository struct {
	db *gorm.DB
}

func NewBadgeDeliveryRepository(db *gorm.DB) BadgeDeliveryRepository {
	return &badgeDeliveryRepository{db: db}
}

// GetAll retorna todos os usuários com quer_cracha=true, com o status de entrega do crachá.
func (r *badgeDeliveryRepository) GetAll(page, limit int, sortBy, sortOrder, searchBy, searchValue string) (*BadgeDeliveryListResult, error) {
	allowedSortFields := []string{"name", "user_number"}
	field := strings.ToLower(sortBy)
	if !slices.Contains(allowedSortFields, field) {
		return nil, apierrors.ValidationError("Campo de ordenação inválido para entregas de crachá", nil)
	}
	ord := strings.ToLower(sortOrder)
	if ord != "asc" && ord != "desc" {
		return nil, apierrors.ValidationError("Direção de ordenação inválida", nil)
	}
	order := field + " " + ord

	type row struct {
		UserNumber  uint
		Name        string
		Email       string
		Delivered   bool
		DeliveredAt *time.Time
		AdminEmail  string
	}

	rows := make([]row, 0)
	var total int64
	var filtered int64

	baseCount := r.db.Table("users u").
		Joins("LEFT JOIN badge_deliveries bd ON bd.user_number = u.user_number").
		Where("u.quer_cracha = true")

	if err := baseCount.Count(&total).Error; err != nil {
		return nil, apierrors.InternalServerError("Erro ao contar usuários com crachá", err)
	}

	applyBadgeSearch := func(q *gorm.DB) *gorm.DB {
		if searchBy == "" || searchValue == "" {
			return q
		}
		switch searchBy {
		case "name":
			return q.Where("u.name ILIKE ?", "%"+searchValue+"%")
		case "email":
			return q.Where("u.email ILIKE ?", "%"+searchValue+"%")
		case "user_number":
			return q.Where("u.user_number::text ILIKE ?", "%"+searchValue+"%")
		case "delivered":
			switch strings.ToLower(searchValue) {
			case "true", "sim", "entregue":
				return q.Where("bd.user_number IS NOT NULL")
			case "false", "não", "nao", "pendente":
				return q.Where("bd.user_number IS NULL")
			}
		}
		return q
	}

	if err := applyBadgeSearch(baseCount).Count(&filtered).Error; err != nil {
		return nil, apierrors.InternalServerError("Erro ao contar entregas de crachá filtradas", err)
	}

	offset := (page - 1) * limit

	dataQuery := r.db.Table("users u").
		Select("u.user_number, u.name, u.email, CASE WHEN bd.user_number IS NOT NULL THEN true ELSE false END AS delivered, bd.delivered_at, bd.admin_email").
		Joins("LEFT JOIN badge_deliveries bd ON bd.user_number = u.user_number").
		Where("u.quer_cracha = true")

	err := applyBadgeSearch(dataQuery).
		Order("u." + order).
		Limit(limit).
		Offset(offset).
		Scan(&rows).Error
	if err != nil {
		return nil, apierrors.InternalServerError("Erro ao listar entregas de crachá", err)
	}

	infos := make([]BadgeDeliveryInfo, 0, len(rows))
	for _, r := range rows {
		infos = append(infos, BadgeDeliveryInfo{
			UserNumber:  fmt.Sprintf("%05d", r.UserNumber),
			Name:        r.Name,
			Email:       r.Email,
			Delivered:   r.Delivered,
			DeliveredAt: r.DeliveredAt,
			AdminEmail:  r.AdminEmail,
		})
	}

	return &BadgeDeliveryListResult{
		Users:           infos,
		TotalRecords:    total,
		FilteredRecords: filtered,
	}, nil
}

// Mark insere ou atualiza o registro de entrega do crachá para um usuário.
func (r *badgeDeliveryRepository) Mark(userNumber uint, adminEmail string) error {
	var count int64
	if err := r.db.Model(&User{}).Where("user_number = ? AND quer_cracha = true", userNumber).Count(&count).Error; err != nil {
		return apierrors.InternalServerError("Erro ao verificar usuário", err)
	}
	if count == 0 {
		return apierrors.NotFoundError("Usuário não encontrado ou não solicitou crachá", nil)
	}

	delivery := BadgeDelivery{
		UserNumber: userNumber,
		AdminEmail: adminEmail,
	}
	return r.db.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "user_number"}},
		DoUpdates: clause.AssignmentColumns([]string{"delivered_at", "admin_email"}),
	}).Create(&delivery).Error
}

// Unmark remove o registro de entrega do crachá para um usuário.
func (r *badgeDeliveryRepository) Unmark(userNumber uint) error {
	result := r.db.Delete(&BadgeDelivery{}, userNumber)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return apierrors.NotFoundError("Registro de entrega de crachá não encontrado", nil)
	}
	return nil
}

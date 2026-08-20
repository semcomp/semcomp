package user

import (
	"backend/internal/apierrors"
	"errors"
	"fmt"
	"slices"
	"strings"

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
		return dbQuery.Where("EXISTS (SELECT 1 FROM unnest(disabilities) AS disability WHERE disability ILIKE ?)", "%"+query.SearchValue+"%")
	case "profession":
		return dbQuery.Where("profession ILIKE ?", "%"+query.SearchValue+"%")
	case "linkedin":
		return dbQuery.Where("linkedin ILIKE ?", "%"+query.SearchValue+"%")
	case "telegram":
		return dbQuery.Where("telegram ILIKE ?", "%"+query.SearchValue+"%")
	case "presence_rate":
		return dbQuery.Where("presence_rate = ?", query.SearchValue)
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

// PapfeDocumentRepository define as operações de acesso a dados para comprovantes PAPFE.
type PapfeDocumentRepository interface {
	FindByEmail(email string) (*PapfeDocument, error)
	FindAll() ([]PapfeDocumentInfo, error)
	Upsert(doc *PapfeDocument) error
	UpdateApproval(email string, approved bool) error
	DeleteByEmail(email string) error
}

type papfeDocumentRepository struct {
	db *gorm.DB
}

func NewPapfeDocumentRepository(db *gorm.DB) PapfeDocumentRepository {
	return &papfeDocumentRepository{db: db}
}

// FindAll retorna metadados de todos os comprovantes PAPFE, com nome e número do usuário.
func (r *papfeDocumentRepository) FindAll() ([]PapfeDocumentInfo, error) {
	var result []PapfeDocumentInfo
	err := r.db.Table("papfe_documents pd").
		Select("pd.id, u.user_number, u.name AS user_name, pd.user_email, pd.filename, pd.content_type, pd.uploaded_at, pd.is_approved").
		Joins("JOIN users u ON u.email = pd.user_email").
		Order("pd.uploaded_at DESC").
		Scan(&result).Error
	if err != nil {
		return nil, apierrors.InternalServerError("Erro ao listar comprovantes PAPFE", err)
	}
	return result, nil
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
			DoUpdates: clause.AssignmentColumns([]string{"filename", "content_type", "file_path", "uploaded_at", "is_approved"}),
		}).
		Create(doc).Error
}

// UpdateApproval atualiza o status de aprovação do comprovante PAPFE de um usuário.
func (r *papfeDocumentRepository) UpdateApproval(email string, approved bool) error {
	result := r.db.Model(&PapfeDocument{}).
		Where("user_email = ?", email).
		Update("is_approved", approved)
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

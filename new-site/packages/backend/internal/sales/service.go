package sales

import (
	"errors"
	"strconv"
	"strings"

	"backend/internal/apierrors"
	"backend/internal/product"
	"gorm.io/gorm"
)

type SaleService interface {
	CreateSale(userNumber uint, request CreateSaleRequest) (*Sale, error)
	GetSaleByID(userNumber uint, saleID uint) (*Sale, error)
	GetUserSales(userNumber uint) ([]Sale, error)
	GetAllSales(page int, limit int, sortBy string, sortOrder string, searchBy string, searchValue string) (*SaleListResult, error)
	UpdateSaleByID(id string, request UpdateSaleRequest) (*Sale, error)
	DeleteSaleByID(id string) error

	// Operação de Item (Backoffice)
	UpdateItemPickup(itemID string, request UpdateSaleItemPickupRequest) (*SaleItem, error)
}

type saleService struct {
	saleRepo    SaleRepository
	productRepo product.ProductRepository
}

func NewSaleService(saleRepo SaleRepository, productRepo product.ProductRepository) SaleService {
	return &saleService{
		saleRepo:    saleRepo,
		productRepo: productRepo,
	}
}

func (s *saleService) CreateSale(userNumber uint, request CreateSaleRequest) (*Sale, error) {
	var totalAmount float64
	var saleItems []SaleItem

	for _, itemReq := range request.Items {
		prod, err := s.productRepo.GetByID(itemReq.ProductID)
		if err != nil {
			return nil, apierrors.ValidationError("O produto com ID "+strconv.Itoa(int(itemReq.ProductID))+" não foi encontrado", err)
		}

		if !prod.IsSelling {
			return nil, apierrors.ValidationError("O produto '"+strconv.Itoa(int(prod.ID))+"' não está mais disponível para venda", nil)
		}

		unitPrice := prod.Price
		quantity := itemReq.Quantity

		totalAmount += unitPrice * float64(quantity)

		saleItems = append(saleItems, SaleItem{
			ProductID:  prod.ID,
			Quantity:   quantity,
			UnitPrice:  unitPrice,
			IsPickedUp: false, // Default na criação do pedido
		})
	}

	newSale := Sale{
		SaleUserNumber:      userNumber,
		Status:              request.Status,
		PaymentMethod:       request.PaymentMethod,
		TotalAmount:         totalAmount,
		Items:               saleItems,
		DietaryRestrictions: request.DietaryRestrictions,
	}

	if err := s.saleRepo.Create(&newSale); err != nil {
		return nil, apierrors.InternalServerError("Erro ao criar pedido", err)
	}

	createdSale, err := s.saleRepo.GetByID(newSale.ID)
	if err != nil {
		return nil, apierrors.InternalServerError("Pedido criado, mas ocorreu um erro ao carregar os dados", err)
	}

	return createdSale, nil
}

func (s *saleService) GetSaleByID(userNumber uint, saleID uint) (*Sale, error) {
	sale, err := s.saleRepo.GetByID(saleID)
	if err != nil {
		return nil, apierrors.InternalServerError("Erro ao buscar a venda", err)
	}

	if sale.SaleUserNumber != userNumber {
		return nil, apierrors.NotFoundError("Venda não encontrada ou não pertence ao usuário", nil)
	}

	return sale, nil
}

func (s *saleService) GetUserSales(userNumber uint) ([]Sale, error) {
	sales, err := s.saleRepo.GetByUserNumber(userNumber)
	if err != nil {
		return nil, apierrors.InternalServerError("Erro ao buscar compras", err)
	}
	return sales, nil
}

func (s *saleService) GetAllSales(page int, limit int, sortBy string, sortOrder string, searchBy string, searchValue string) (*SaleListResult, error) {
	if page < 1 {
		return nil, apierrors.ValidationError("Page deve ser maior que 0", nil)
	}
	if limit < 1 {
		return nil, apierrors.ValidationError("Limit deve ser maior que 0", nil)
	}
	if sortBy == "" {
		sortBy = "created_at"
	}
	if sortOrder == "" {
		sortOrder = "desc"
	}

	sortBy = strings.ToLower(sortBy)
	sortOrder = strings.ToLower(sortOrder)

	allowedSortFields := map[string]bool{
		"id":           true,
		"status":       true,
		"total_amount": true,
		"created_at":   true,
	}
	if !allowedSortFields[sortBy] {
		return nil, apierrors.ValidationError("Parâmetro 'sort_by' inválido", nil)
	}

	offset := (page - 1) * limit
	query := SaleListQuery{
		Limit:       limit,
		Offset:      offset,
		SortBy:      sortBy,
		SortOrder:   sortOrder,
		SearchBy:    searchBy,
		SearchValue: searchValue,
	}

	return s.saleRepo.GetAll(query)
}

func (s *saleService) UpdateSaleByID(id string, request UpdateSaleRequest) (*Sale, error) {
	parsedID, err := strconv.ParseUint(id, 10, 64)
	if err != nil {
		return nil, apierrors.ValidationError("ID da venda inválido", err)
	}

	_, err = s.saleRepo.GetByID(uint(parsedID))
	if err != nil {
		return nil, err
	}

	updateData := make(map[string]interface{})
	if request.Status != "" {
		updateData["status"] = request.Status
	}
	if request.PaymentMethod != "" {
		updateData["payment_method"] = request.PaymentMethod
	}
	if request.DietaryRestrictions != "" {
		updateData["dietary_restrictions"] = request.DietaryRestrictions
	}

	if len(updateData) > 0 {
		err = s.saleRepo.UpdateByID(uint(parsedID), updateData)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, apierrors.NotFoundError("Venda não encontrada", err)
			}
			return nil, apierrors.InternalServerError("Erro ao atualizar venda", err)
		}
	}

	return s.saleRepo.GetByID(uint(parsedID))
}

func (s *saleService) DeleteSaleByID(id string) error {
	parsedID, err := strconv.ParseUint(id, 10, 64)
	if err != nil {
		return apierrors.ValidationError("ID da venda inválido", err)
	}

	err = s.saleRepo.DeleteByID(uint(parsedID))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return apierrors.NotFoundError("Venda não encontrada", err)
		}
		return apierrors.InternalServerError("Erro ao deletar venda", err)
	}
	return nil
}

func (s *saleService) UpdateItemPickup(itemID string, request UpdateSaleItemPickupRequest) (*SaleItem, error) {
	parsedID, err := strconv.ParseUint(itemID, 10, 64)
	if err != nil {
		return nil, apierrors.ValidationError("ID do item inválido", err)
	}

	err = s.saleRepo.UpdateItemPickup(uint(parsedID), request.IsPickedUp)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apierrors.NotFoundError("Item da venda não encontrado", err)
		}
		return nil, apierrors.InternalServerError("Erro ao atualizar status de retirada", err)
	}

	return s.saleRepo.GetSaleItemByID(uint(parsedID))
}
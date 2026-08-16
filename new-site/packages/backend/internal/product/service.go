package product

import (
	"errors"
	"fmt"
	"strconv"
	"strings"

	"backend/internal/apierrors"

	"gorm.io/gorm"
)

type ProductService interface {
	CreateProduct(request CreateProductRequest) (*Product, error)
	BulkCreateProducts(request BulkCreateProductsRequest) ([]Product, error)
	GetProductByID(id string) (*Product, error)
	DeleteProductByID(id string) error
	UpdateProductByID(id string, request UpdateProductRequest) (*Product, error)
	GetProducts(page int, limit int, sortBy string, sortOrder string, searchBy string, searchValue string, typeFilter string) (*ProductListResult, error)
}

type productService struct {
	repo ProductRepository
}

func NewProductService(repo ProductRepository) ProductService {
	return &productService{repo: repo}
}

// buildComboItems valida a lista de itens de um combo e retorna os ComboItems prontos
// para persistir. excludeProductID é o ID do produto sendo atualizado (para impedir que
// um combo referencie a si mesmo); passe nil na criação, onde ainda não existe ID.
func (s *productService) buildComboItems(items []ComboItemRequest, excludeProductID *uint) ([]ComboItem, error) {
	if len(items) == 0 {
		return nil, apierrors.ValidationError("Um combo deve conter ao menos um item", nil)
	}

	const minComboTotalItems = 2

	seen := make(map[uint]bool, len(items))
	totalQuantity := 0

	for _, it := range items {
		if excludeProductID != nil && it.ItemID == *excludeProductID {
			return nil, apierrors.ValidationError("Um combo não pode conter a si mesmo como item", nil)
		}
		if seen[it.ItemID] {
			return nil, apierrors.ValidationError(
				"Item duplicado na lista do combo: ID "+strconv.Itoa(int(it.ItemID))+" (ajuste a quantidade em vez de repetir o item)",
				nil,
			)
		}
		seen[it.ItemID] = true
		totalQuantity += it.Quantity

		item, err := s.repo.GetByID(it.ItemID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, apierrors.ValidationError("Item do combo não encontrado: ID "+strconv.Itoa(int(it.ItemID)), nil)
			}
			return nil, apierrors.InternalServerError("Erro ao validar item do combo", err)
		}
		if item.Type == ProductTypeCombo {
			return nil, apierrors.ValidationError("Um combo não pode conter outro combo como item: ID "+strconv.Itoa(int(it.ItemID)), nil)
		}
	}

	if totalQuantity < minComboTotalItems {
		return nil, apierrors.ValidationError("Um combo deve conter mais de um item (quantidade total mínima: 2)", nil)
	}

	comboItems := make([]ComboItem, 0, len(items))
	for _, it := range items {
		comboItems = append(comboItems, ComboItem{ItemID: it.ItemID, Quantity: it.Quantity})
	}
	return comboItems, nil
}

func (s *productService) CreateProduct(request CreateProductRequest) (*Product, error) {
	product := Product{
		Type:        request.Type,
		IsSelling:   request.IsSelling,
		Price:       request.Price,
		PictureURL:  request.PictureURL,
		Description: request.Description,
	}

	switch request.Type {
	case ProductTypeKit:
		if request.Kit == nil {
			return nil, apierrors.ValidationError("Dados do kit são obrigatórios para produtos do tipo KIT", nil)
		}
		product.Kit = &Kit{
			Name:       request.Kit.Name,
			Size:       request.Kit.Size,
			Color:      request.Kit.Color,
			IsBabydoll: request.Kit.IsBabydoll,
		}
		product.Name = request.Kit.Name

	case ProductTypeCoffee:
		if request.Coffee == nil {
			return nil, apierrors.ValidationError("Dados do coffee são obrigatórios para produtos do tipo COFFEE", nil)
		}
		product.Coffee = &Coffee{
			Name:     request.Coffee.Name,
			DateTime: request.Coffee.DateTime,
		}
		product.Name = request.Coffee.Name

	case ProductTypeCombo:
		if strings.TrimSpace(request.Name) == "" {
			return nil, apierrors.ValidationError("Nome é obrigatório para produtos do tipo COMBO", nil)
		}
		comboItems, err := s.buildComboItems(request.Items, nil)
		if err != nil {
			return nil, err
		}
		product.Name = request.Name
		product.ComboItems = comboItems

	default:
		return nil, apierrors.ValidationError("Tipo de produto inválido", nil)
	}

	if err := s.repo.Create(&product); err != nil {
		return nil, apierrors.InternalServerError("Erro ao criar produto", err)
	}

	// Recarrega o produto com Preloads para retornar dados completos
	created, err := s.repo.GetByID(product.ID)
	if err != nil {
		return nil, apierrors.InternalServerError("Erro ao buscar produto criado", err)
	}

	return created, nil
}

func (s *productService) BulkCreateProducts(request BulkCreateProductsRequest) ([]Product, error) {
	products := make([]*Product, 0, len(request.Products))
	for i, req := range request.Products {
		p := &Product{
			Type:        req.Type,
			IsSelling:   req.IsSelling,
			Price:       req.Price,
			PictureURL:  req.PictureURL,
			Description: req.Description,
		}
		switch req.Type {
		case ProductTypeKit:
			if req.Kit == nil {
				return nil, apierrors.ValidationError(fmt.Sprintf("Produto %d: dados do kit são obrigatórios", i+1), nil)
			}
			p.Kit = &Kit{
				Name:       req.Kit.Name,
				Size:       req.Kit.Size,
				Color:      req.Kit.Color,
				IsBabydoll: req.Kit.IsBabydoll,
			}
			p.Name = req.Kit.Name
		case ProductTypeCoffee:
			if req.Coffee == nil {
				return nil, apierrors.ValidationError(fmt.Sprintf("Produto %d: dados do coffee são obrigatórios", i+1), nil)
			}
			p.Coffee = &Coffee{
				Name:     req.Coffee.Name,
				DateTime: req.Coffee.DateTime,
			}
			p.Name = req.Coffee.Name
		case ProductTypeCombo:
			if strings.TrimSpace(req.Name) == "" {
				return nil, apierrors.ValidationError(fmt.Sprintf("Produto %d: nome é obrigatório para COMBO", i+1), nil)
			}
			comboItems, err := s.buildComboItems(req.Items, nil)
			if err != nil {
				return nil, err
			}
			p.Name = req.Name
			p.ComboItems = comboItems
		default:
			return nil, apierrors.ValidationError(fmt.Sprintf("Produto %d: tipo inválido", i+1), nil)
		}
		products = append(products, p)
	}

	created, err := s.repo.BulkCreate(products)
	if err != nil {
		return nil, apierrors.InternalServerError("Erro ao criar produtos em lote", err)
	}
	return created, nil
}

func (s *productService) GetProductByID(id string) (*Product, error) {
	parsedID, err := strconv.ParseUint(id, 10, 64)
	if err != nil {
		return nil, apierrors.ValidationError("ID do produto inválido", err)
	}

	product, err := s.repo.GetByID(uint(parsedID))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apierrors.NotFoundError("Produto não encontrado", err)
		}
		return nil, apierrors.InternalServerError("Erro ao buscar produto", err)
	}
	return product, nil
}

func (s *productService) DeleteProductByID(id string) error {
	parsedID, err := strconv.ParseUint(id, 10, 64)
	if err != nil {
		return apierrors.ValidationError("ID do produto inválido", err)
	}

	// Verifica se o produto existe
	_, err = s.repo.GetByID(uint(parsedID))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return apierrors.NotFoundError("Produto não encontrado", err)
		}
		return apierrors.InternalServerError("Erro ao buscar produto", err)
	}

	// Bloqueia deleção se o produto é item de algum combo
	count, err := s.repo.CountComboItemRefs(uint(parsedID))
	if err != nil {
		return apierrors.InternalServerError("Erro ao verificar referências do produto", err)
	}
	if count > 0 {
		return apierrors.ConflictError("Produto não pode ser removido pois é item de um ou mais combos", nil)
	}

	err = s.repo.DeleteByID(uint(parsedID))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return apierrors.NotFoundError("Produto não encontrado", err)
		}
		return apierrors.InternalServerError("Erro ao deletar produto", err)
	}
	return nil
}

func (s *productService) UpdateProductByID(id string, request UpdateProductRequest) (*Product, error) {
	parsedID, err := strconv.ParseUint(id, 10, 64)
	if err != nil {
		return nil, apierrors.ValidationError("ID do produto inválido", err)
	}

	// Verifica se o produto existe
	_, err = s.repo.GetByID(uint(parsedID))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apierrors.NotFoundError("Produto não encontrado", err)
		}
		return nil, apierrors.InternalServerError("Erro ao buscar produto", err)
	}

	product := Product{
		Type:        request.Type,
		IsSelling:   request.IsSelling,
		Price:       request.Price,
		PictureURL:  request.PictureURL,
		Description: request.Description,
	}

	productIDForSelfCheck := uint(parsedID)

	switch request.Type {
	case ProductTypeKit:
		if request.Kit == nil {
			return nil, apierrors.ValidationError("Dados do kit são obrigatórios para produtos do tipo KIT", nil)
		}
		product.Kit = &Kit{
			Name:       request.Kit.Name,
			Size:       request.Kit.Size,
			Color:      request.Kit.Color,
			IsBabydoll: request.Kit.IsBabydoll,
		}
		product.Name = request.Kit.Name

	case ProductTypeCoffee:
		if request.Coffee == nil {
			return nil, apierrors.ValidationError("Dados do coffee são obrigatórios para produtos do tipo COFFEE", nil)
		}
		product.Coffee = &Coffee{
			Name:     request.Coffee.Name,
			DateTime: request.Coffee.DateTime,
		}
		product.Name = request.Coffee.Name

	case ProductTypeCombo:
		if strings.TrimSpace(request.Name) == "" {
			return nil, apierrors.ValidationError("Nome é obrigatório para produtos do tipo COMBO", nil)
		}
		comboItems, err := s.buildComboItems(request.Items, &productIDForSelfCheck)
		if err != nil {
			return nil, err
		}
		product.Name = request.Name
		product.ComboItems = comboItems

	default:
		return nil, apierrors.ValidationError("Tipo de produto inválido", nil)
	}

	err = s.repo.UpdateByID(uint(parsedID), &product)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apierrors.NotFoundError("Produto não encontrado", err)
		}
		return nil, apierrors.InternalServerError("Erro ao atualizar produto", err)
	}

	// Recarrega o produto atualizado
	updated, err := s.repo.GetByID(uint(parsedID))
	if err != nil {
		return nil, apierrors.InternalServerError("Erro ao buscar produto atualizado", err)
	}

	return updated, nil
}

func (s *productService) GetProducts(page int, limit int, sortBy string, sortOrder string, searchBy string, searchValue string, typeFilter string) (*ProductListResult, error) {
	if page < 1 {
		return nil, apierrors.ValidationError("Page deve ser maior que 0", nil)
	}
	if limit < 1 {
		return nil, apierrors.ValidationError("Limit deve ser maior que 0", nil)
	}

	if sortBy == "" {
		sortBy = "id"
	}
	if sortOrder == "" {
		sortOrder = "asc"
	}

	sortBy = strings.ToLower(sortBy)
	sortOrder = strings.ToLower(sortOrder)

	allowedSortFields := map[string]bool{
		"id":         true,
		"type":       true,
		"is_selling": true,
		"price":      true,
	}
	if !allowedSortFields[sortBy] {
		return nil, apierrors.ValidationError("Parâmetro 'sort_by' inválido", nil)
	}
	if sortOrder != "asc" && sortOrder != "desc" {
		return nil, apierrors.ValidationError("Parâmetro 'sort_order' inválido", nil)
	}

	if (searchBy == "" && searchValue != "") || (searchBy != "" && searchValue == "") {
		return nil, apierrors.ValidationError("Parâmetro 'search_by' e 'search_value' devem ser fornecidos juntos", nil)
	}

	if searchBy != "" {
		searchBy = strings.ToLower(searchBy)
		allowedSearchFields := map[string]bool{
			"id":           true,
			"is_selling":   true,
			"price":        true,
			"kit.name":     true,
			"kit.size":     true,
			"kit.color":    true,
			"coffee.name":  true,
		}
		if !allowedSearchFields[searchBy] {
			return nil, apierrors.ValidationError("Parâmetro 'search_by' inválido", nil)
		}
	}

	if typeFilter != "" {
		typeFilter = strings.ToUpper(typeFilter)
		allowedTypes := map[string]bool{"KIT": true, "COFFEE": true, "COMBO": true}
		if !allowedTypes[typeFilter] {
			return nil, apierrors.ValidationError("Parâmetro 'type' inválido", nil)
		}
	}

	offset := (page - 1) * limit
	query := ProductListQuery{
		Limit:       limit,
		Offset:      offset,
		SortBy:      sortBy,
		SortOrder:   sortOrder,
		SearchBy:    searchBy,
		SearchValue: searchValue,
		TypeFilter:  typeFilter,
	}

	return s.repo.GetProducts(query)
}

package product

import (
	"errors"
	"strconv"
	"strings"
	"time"

	"backend/internal/apierrors"

	"gorm.io/gorm"
)

type ProductService interface {
	CreateProduct(request CreateProductRequest) (*Product, error)
	GetProductByID(id string) (*Product, error)
	DeleteProductByID(id string) error
	UpdateProductByID(id string, request UpdateProductRequest) (*Product, error)
	GetProducts(page int, limit int, sortBy string, sortOrder string, searchBy string, searchValue string) (*ProductListResult, error)
	InitializeProducts() error
}

type productService struct {
	repo ProductRepository
}

func NewProductService(repo ProductRepository) ProductService {
	return &productService{repo: repo}
}

const (
	initialCoffeeName  = "Coffee Break Semcomp"
	initialCoffeePrice = 12.0
	initialComboPrice  = 20.0
)

func (s *productService) InitializeProducts() error {
	seedProducts, err := s.repo.GetProducts(ProductListQuery{
		Limit:       1000,
		Offset:      0,
		SortBy:      "id",
		SortOrder:   "asc",
		SearchBy:    "",
		SearchValue: "",
	})
	if err != nil {
		return apierrors.InternalServerError("Erro ao carregar produtos iniciais", err)
	}

	var coffeeID uint
	coffeeExists := false
	comboExists := false

	for i := range seedProducts.Products {
		product := seedProducts.Products[i]
		if product.Type == ProductTypeCoffee && product.Coffee != nil && product.Coffee.Name == initialCoffeeName {
			coffeeID = product.ID
			coffeeExists = true
		}
	}

	if !coffeeExists {
		coffee, err := s.CreateProduct(CreateProductRequest{
			Type:      ProductTypeCoffee,
			IsSelling: true,
			Price:     initialCoffeePrice,
			Coffee: &CreateCoffeeRequest{
				Name:     initialCoffeeName,
				DateTime: time.Date(2026, time.August, 1, 9, 0, 0, 0, time.UTC),
			},
		})
		if err != nil {
			return err
		}
		coffeeID = coffee.ID
	}

	for i := range seedProducts.Products {
		product := seedProducts.Products[i]
		if product.Type != ProductTypeCombo {
			continue
		}
		if product.Price == initialComboPrice && len(product.ComboItems) == 1 && product.ComboItems[0].ItemID == coffeeID {
			comboExists = true
			break
		}
	}

	if !comboExists {
		_, err := s.CreateProduct(CreateProductRequest{
			Type:      ProductTypeCombo,
			IsSelling: true,
			Price:     initialComboPrice,
			Items:     []uint{coffeeID},
		})
		if err != nil {
			return err
		}
	}

	return nil
}

func (s *productService) CreateProduct(request CreateProductRequest) (*Product, error) {
	product := Product{
		Type:      request.Type,
		IsSelling: request.IsSelling,
		Price:     request.Price,
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

	case ProductTypeCoffee:
		if request.Coffee == nil {
			return nil, apierrors.ValidationError("Dados do coffee são obrigatórios para produtos do tipo COFFEE", nil)
		}
		product.Coffee = &Coffee{
			Name:     request.Coffee.Name,
			DateTime: request.Coffee.DateTime,
		}

	case ProductTypeCombo:
		if len(request.Items) == 0 {
			return nil, apierrors.ValidationError("Um combo deve conter ao menos um item", nil)
		}

		// Valida que os itens existem e não são combos
		for _, itemID := range request.Items {
			item, err := s.repo.GetByID(itemID)
			if err != nil {
				if errors.Is(err, gorm.ErrRecordNotFound) {
					return nil, apierrors.ValidationError("Item do combo não encontrado: ID "+strconv.Itoa(int(itemID)), nil)
				}
				return nil, apierrors.InternalServerError("Erro ao validar item do combo", err)
			}
			if item.Type == ProductTypeCombo {
				return nil, apierrors.ValidationError("Um combo não pode conter outro combo como item: ID "+strconv.Itoa(int(itemID)), nil)
			}
		}

		comboItems := make([]ComboItem, 0, len(request.Items))
		for _, itemID := range request.Items {
			comboItems = append(comboItems, ComboItem{ItemID: itemID})
		}
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
		Type:      request.Type,
		IsSelling: request.IsSelling,
		Price:     request.Price,
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

	case ProductTypeCoffee:
		if request.Coffee == nil {
			return nil, apierrors.ValidationError("Dados do coffee são obrigatórios para produtos do tipo COFFEE", nil)
		}
		product.Coffee = &Coffee{
			Name:     request.Coffee.Name,
			DateTime: request.Coffee.DateTime,
		}

	case ProductTypeCombo:
		if len(request.Items) == 0 {
			return nil, apierrors.ValidationError("Um combo deve conter ao menos um item", nil)
		}

		// Valida que os itens existem e não são combos
		for _, itemID := range request.Items {
			item, err := s.repo.GetByID(itemID)
			if err != nil {
				if errors.Is(err, gorm.ErrRecordNotFound) {
					return nil, apierrors.ValidationError("Item do combo não encontrado: ID "+strconv.Itoa(int(itemID)), nil)
				}
				return nil, apierrors.InternalServerError("Erro ao validar item do combo", err)
			}
			if item.Type == ProductTypeCombo {
				return nil, apierrors.ValidationError("Um combo não pode conter outro combo como item: ID "+strconv.Itoa(int(itemID)), nil)
			}
		}

		comboItems := make([]ComboItem, 0, len(request.Items))
		for _, itemID := range request.Items {
			comboItems = append(comboItems, ComboItem{ItemID: itemID})
		}
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

func (s *productService) GetProducts(page int, limit int, sortBy string, sortOrder string, searchBy string, searchValue string) (*ProductListResult, error) {
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
			"type":       true,
			"is_selling": true,
			"price":      true,
		}
		if !allowedSearchFields[searchBy] {
			return nil, apierrors.ValidationError("Parâmetro 'search_by' inválido", nil)
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
	}

	return s.repo.GetProducts(query)
}

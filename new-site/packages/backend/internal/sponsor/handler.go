package sponsor

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"backend/internal/apierrors"

	"github.com/gin-gonic/gin"
)

type SponsorHandler struct {
	service SponsorService
}

func NewSponsorHandler(service SponsorService) *SponsorHandler {
	return &SponsorHandler{service: service}
}

// GetSponsors retorna a lista pública de patrocinadores do ano corrente.
// @Summary Lista patrocinadores públicos
// @Tags Sponsors
// @Produce json
// @Success 200 {array} sponsor.PublicSponsor
// @Router /sponsors [get]
func (h *SponsorHandler) GetSponsors(c *gin.Context) {
	sponsors, err := h.service.GetPublicSponsors()
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}
	c.Set("responseMessage", "Patrocinadores listados com sucesso!")
	c.JSON(http.StatusOK, sponsors)
}

// RecordClick incrementa o contador de cliques e retorna o website do patrocinador.
// @Summary Registra clique em patrocinador
// @Tags Sponsors
// @Produce json
// @Param cnpj path string true "CNPJ do patrocinador (14 dígitos)"
// @Success 200 {object} map[string]string
// @Router /sponsors/{cnpj}/click [post]
func (h *SponsorHandler) RecordClick(c *gin.Context) {
	cnpj := c.Param("cnpj")
	sp, err := h.service.RecordClick(cnpj)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}
	c.Set("responseMessage", "Clique registrado!")
	c.JSON(http.StatusOK, gin.H{"website": sp.Website})
}

// GetAllSponsors lista patrocinadores com paginação (backoffice).
// @Summary Lista todos os patrocinadores (admin)
// @Tags Sponsors Backoffice
// @Security BearerAuth
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Router /admin/sponsors [get]
func (h *SponsorHandler) GetAllSponsors(c *gin.Context) {
	page, limit, sortBy, sortOrder, searchBy, searchValue, err := parsePaginationParams(c)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}
	result, err := h.service.GetSponsors(page, limit, sortBy, sortOrder, searchBy, searchValue)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}
	c.Set("responseMessage", "Patrocinadores listados com sucesso!")
	c.JSON(http.StatusOK, gin.H{
		"page":             page,
		"limit":            limit,
		"sort_by":          sortBy,
		"sort_order":       sortOrder,
		"search_by":        searchBy,
		"search_value":     searchValue,
		"total_records":    result.TotalRecords,
		"filtered_records": result.FilteredRecords,
		"sponsors":         result.Sponsors,
	})
}

// GetSponsorByCNPJ retorna um patrocinador pelo CNPJ (backoffice).
// @Summary Busca patrocinador por CNPJ (admin)
// @Tags Sponsors Backoffice
// @Security BearerAuth
// @Produce json
// @Param cnpj path string true "CNPJ do patrocinador"
// @Success 200 {object} sponsor.Sponsor
// @Router /admin/sponsors/{cnpj} [get]
func (h *SponsorHandler) GetSponsorByCNPJ(c *gin.Context) {
	sp, err := h.service.GetSponsorByCNPJ(c.Param("cnpj"))
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}
	c.Set("responseMessage", "Patrocinador encontrado!")
	c.JSON(http.StatusOK, sp)
}

// CreateSponsor cria um novo patrocinador (backoffice).
// Aceita multipart/form-data: campos CNPJ, name, website, logo_url (URL) ou logo (arquivo).
// @Summary Cria patrocinador (admin)
// @Tags Sponsors Backoffice
// @Security BearerAuth
// @Accept multipart/form-data
// @Produce json
// @Router /admin/sponsors [post]
func (h *SponsorHandler) CreateSponsor(c *gin.Context) {
	var req CreateSponsorRequest
	if err := c.ShouldBind(&req); err != nil {
		apierrors.HandleAPIError(c, apierrors.ValidationError("Dados inválidos", err))
		return
	}

	logo, err := resolveLogoField(c, req.CNPJ, req.LogoURL)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}

	sp, err := h.service.CreateSponsor(req, logo)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}
	c.Set("responseMessage", "Patrocinador criado com sucesso!")
	c.JSON(http.StatusCreated, gin.H{"message": "Patrocinador criado com sucesso!", "sponsor": sp})
}

// UpdateSponsor atualiza um patrocinador (backoffice).
// @Summary Atualiza patrocinador (admin)
// @Tags Sponsors Backoffice
// @Security BearerAuth
// @Accept multipart/form-data
// @Produce json
// @Param cnpj path string true "CNPJ do patrocinador"
// @Router /admin/sponsors/{cnpj} [put]
func (h *SponsorHandler) UpdateSponsor(c *gin.Context) {
	cnpj := c.Param("cnpj")

	var req UpdateSponsorRequest
	if err := c.ShouldBind(&req); err != nil {
		apierrors.HandleAPIError(c, apierrors.ValidationError("Dados inválidos", err))
		return
	}

	current, svcErr := h.service.GetSponsorByCNPJ(cnpj)
	if svcErr != nil {
		apierrors.HandleAPIError(c, svcErr)
		return
	}

	logo, err := resolveLogoField(c, cnpj, req.LogoURL)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}

	if logo == "" {
		logo = current.Logo
	}

	// Arquivo antigo órfão → deleta do disco
	if logo != current.Logo && strings.HasPrefix(current.Logo, "uploads/") {
		if err := os.Remove(current.Logo); err != nil {
			log.Printf("[sponsor] falha ao remover logo antiga %q: %v", current.Logo, err)
		} else {
			log.Printf("[sponsor] logo antiga removida: %q", current.Logo)
		}
	}

	sp, err := h.service.UpdateSponsor(cnpj, req, logo)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}
	c.Set("responseMessage", "Patrocinador atualizado com sucesso!")
	c.JSON(http.StatusOK, gin.H{"message": "Patrocinador atualizado com sucesso!", "sponsor": sp})
}

// DeleteSponsor remove um patrocinador (backoffice).
// @Summary Remove patrocinador (admin)
// @Tags Sponsors Backoffice
// @Security BearerAuth
// @Param cnpj path string true "CNPJ do patrocinador"
// @Router /admin/sponsors/{cnpj} [delete]
func (h *SponsorHandler) DeleteSponsor(c *gin.Context) {
	cnpj := c.Param("cnpj")

	current, svcErr := h.service.GetSponsorByCNPJ(cnpj)
	if svcErr != nil {
		apierrors.HandleAPIError(c, svcErr)
		return
	}

	if err := h.service.DeleteSponsor(cnpj); err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}

	if strings.HasPrefix(current.Logo, "uploads/") {
		if err := os.Remove(current.Logo); err != nil {
			log.Printf("[sponsor] falha ao remover logo de patrocinador deletado %q: %v", current.Logo, err)
		} else {
			log.Printf("[sponsor] logo removida após deleção do patrocinador: %q", current.Logo)
		}
	}

	c.Set("responseMessage", "Patrocinador removido com sucesso!")
	c.JSON(http.StatusOK, gin.H{"message": "Patrocinador removido com sucesso!"})
}

// GetSponsorPackages lista os pacotes de um patrocinador.
// @Summary Lista pacotes de patrocinador (admin)
// @Tags Sponsors Backoffice
// @Security BearerAuth
// @Param cnpj path string true "CNPJ do patrocinador"
// @Param year query int false "Filtrar por ano"
// @Router /admin/sponsors/{cnpj}/packages [get]
func (h *SponsorHandler) GetSponsorPackages(c *gin.Context) {
	cnpj := c.Param("cnpj")
	year := 0
	if y := c.Query("year"); y != "" {
		parsed, err := strconv.Atoi(y)
		if err != nil {
			apierrors.HandleAPIError(c, apierrors.ValidationError("Parâmetro 'year' inválido", err))
			return
		}
		year = parsed
	}
	pkgs, err := h.service.GetPackages(cnpj, year)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}
	c.Set("responseMessage", "Pacotes listados com sucesso!")
	c.JSON(http.StatusOK, pkgs)
}

// AddSponsorPackage adiciona um pacote a um patrocinador.
// @Summary Adiciona pacote de patrocinador (admin)
// @Tags Sponsors Backoffice
// @Security BearerAuth
// @Param cnpj path string true "CNPJ do patrocinador"
// @Router /admin/sponsors/{cnpj}/packages [post]
func (h *SponsorHandler) AddSponsorPackage(c *gin.Context) {
	var req AddPackageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		apierrors.HandleAPIError(c, apierrors.ValidationError("Dados inválidos", err))
		return
	}
	pkg, err := h.service.AddPackage(c.Param("cnpj"), req)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}
	c.Set("responseMessage", "Pacote adicionado com sucesso!")
	c.JSON(http.StatusCreated, gin.H{"message": "Pacote adicionado com sucesso!", "package": pkg})
}

// RemoveSponsorPackage remove um pacote de um patrocinador.
// @Summary Remove pacote de patrocinador (admin)
// @Tags Sponsors Backoffice
// @Security BearerAuth
// @Param cnpj path string true "CNPJ do patrocinador"
// @Param year path int true "Ano do pacote"
// @Param package path string true "Nome do pacote"
// @Router /admin/sponsors/{cnpj}/packages/{year}/{package} [delete]
func (h *SponsorHandler) RemoveSponsorPackage(c *gin.Context) {
	cnpj := c.Param("cnpj")
	year, err := strconv.Atoi(c.Param("year"))
	if err != nil {
		apierrors.HandleAPIError(c, apierrors.ValidationError("Parâmetro 'year' inválido", err))
		return
	}
	packageName := c.Param("package")
	if err := h.service.RemovePackage(cnpj, year, packageName); err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}
	c.Set("responseMessage", "Pacote removido com sucesso!")
	c.JSON(http.StatusOK, gin.H{"message": "Pacote removido com sucesso!"})
}

// resolveLogoField decide o valor final do campo logo.
// Prioridade: arquivo enviado > URL informada.
func resolveLogoField(c *gin.Context, cnpj, logoURL string) (string, error) {
	file, header, err := c.Request.FormFile("logo")
	if err == nil {
		defer file.Close()

		if err := os.MkdirAll("uploads/sponsors", 0755); err != nil {
			return "", apierrors.InternalServerError("Erro ao criar diretório de uploads", err)
		}

		ext := strings.ToLower(filepath.Ext(header.Filename))
		if ext == "" {
			ext = ".png"
		}
		filename := fmt.Sprintf("%s%s", cnpj, ext)
		destPath := filepath.Join("uploads", "sponsors", filename)

		dest, err := os.Create(destPath)
		if err != nil {
			return "", apierrors.InternalServerError("Erro ao salvar arquivo de logo", err)
		}
		defer dest.Close()

		if _, err := io.Copy(dest, file); err != nil {
			return "", apierrors.InternalServerError("Erro ao escrever arquivo de logo", err)
		}

		return "uploads/sponsors/" + filename, nil
	}

	return logoURL, nil
}

func parsePaginationParams(c *gin.Context) (page, limit int, sortBy, sortOrder, searchBy, searchValue string, err error) {
	page = 1
	limit = 10
	sortBy = c.DefaultQuery("sort_by", "name")
	sortOrder = c.DefaultQuery("sort_order", "asc")
	searchBy = c.Query("search_by")
	searchValue = c.Query("search_value")

	if p := c.Query("page"); p != "" {
		page, err = strconv.Atoi(p)
		if err != nil {
			err = apierrors.ValidationError("Parâmetro 'page' inválido", err)
			return
		}
	}
	if l := c.Query("limit"); l != "" {
		limit, err = strconv.Atoi(l)
		if err != nil {
			err = apierrors.ValidationError("Parâmetro 'limit' inválido", err)
			return
		}
	}
	return
}

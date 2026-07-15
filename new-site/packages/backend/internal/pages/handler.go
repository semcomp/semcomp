package pages

import (
	"net/http"

	"backend/internal/apierrors"

	"github.com/gin-gonic/gin"
)

type PagesHandler struct {
	service Service
}

func NewPagesHandler(service Service) *PagesHandler {
	return &PagesHandler{service: service}
}

type SetPageAvailabilityRequest struct {
	Available bool `json:"available" binding:"required"`
}

// GetAllPagesAvailabilityHandler returns the availability of all pages.
// GET /pages/availability
func (h *PagesHandler) GetAllPagesAvailabilityHandler(c *gin.Context) {
	availabilities := h.service.GetAllPagesAvailability()

	c.JSON(http.StatusOK, gin.H{
		"pages": availabilities,
	})
}

// GetPageAvailabilityHandler returns the availability status of a page.
// GET /pages/:page/availability
func (h *PagesHandler) GetPageAvailabilityHandler(c *gin.Context) {
	page := c.Param("page")

	available, err := h.service.GetPageAvailability(page)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"page":      page,
		"available": available,
	})
}

// SetPageAvailabilityHandler updates the availability status of a page.
// PUT /pages/:page/availability — Backoffice only.
func (h *PagesHandler) SetPageAvailabilityHandler(c *gin.Context) {
	page := c.Param("page")

	var req SetPageAvailabilityRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		apierrors.HandleAPIError(c, apierrors.ValidationError("Requisição inválida", err))
		return
	}

	if err := h.service.SetPageAvailability(page, req.Available); err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":   "Disponibilidade da página atualizada com sucesso!",
		"page":      page,
		"available": req.Available,
	})
}

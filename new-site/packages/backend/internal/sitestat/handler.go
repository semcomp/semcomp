package sitestat

import (
	"net/http"

	"backend/internal/apierrors"

	"github.com/gin-gonic/gin"
)

type SiteStatHandler struct {
	service *SiteStatService
}

func NewSiteStatHandler(service *SiteStatService) *SiteStatHandler {
	return &SiteStatHandler{service: service}
}

// RecordVisit incrementa o contador de visitas à home page. Fire-and-forget pelo frontend.
// @Summary Registra visita à home page
// @Tags Stats
// @Success 204
// @Router /visit [post]
func (h *SiteStatHandler) RecordVisit(c *gin.Context) {
	_ = h.service.RecordVisit()
	c.Status(http.StatusNoContent)
}

// GetStats retorna estatísticas públicas do site.
// @Summary Retorna estatísticas do site
// @Tags Stats
// @Produce json
// @Success 200 {object} map[string]int64
// @Router /stats [get]
func (h *SiteStatHandler) GetStats(c *gin.Context) {
	count, err := h.service.GetVisitorCount()
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"visitor_count": count})
}

package dashboardbackoffice

import (
	"net/http"

	"backend/internal/apierrors"

	"github.com/gin-gonic/gin"
)

type DashboardHandler struct {
	service *DashboardService
}

func NewDashboardHandler(service *DashboardService) *DashboardHandler {
	return &DashboardHandler{service: service}
}

// GetDashboard retorna as estatísticas agregadas do dashboard do backoffice.
// @Summary Retorna dados agregados do dashboard
// @Tags Dashboard
// @Produce json
// @Param sections query []string false "Seções a retornar (users, events, kits, coffees, combos, sales). Se vazio, retorna todas."
// @Success 200 {object} DashboardResponse
// @Router /admin/dashboard [get]
func (h *DashboardHandler) GetDashboard(c *gin.Context) {
	var query DashboardQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}

	resp, err := h.service.GetDashboard(query)
	if err != nil {
		apierrors.HandleAPIError(c, err)
		return
	}

	c.JSON(http.StatusOK, resp)
}
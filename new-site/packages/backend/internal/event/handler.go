package event

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
)

type EventHandler struct {
	eventService EventService
}

func NewEventHandler(eventService EventService) *EventHandler {
	return &EventHandler{eventService: eventService}
}

func (h *EventHandler) CreateEvent(c *gin.Context) {
	var request CreateEventRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}

	event, err := h.eventService.CreateEvent(request)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Evento criado com sucesso!", "event": event})
}

func (h *EventHandler) GetEventByNameAndDate(c *gin.Context) {
	name := c.Param("eventName")
	date := c.Param("date")

	event, err := h.eventService.GetEventByNameAndDate(name, date)
	if err != nil {
		if errors.Is(err, ErrInvalidEventDate) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Data inválida. Use o formato RFC3339"})
			return
		}

		if errors.Is(err, ErrEventNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Evento não encontrado"})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	c.JSON(http.StatusOK, event)
}

func (h *EventHandler) DeleteEventByNameAndDate(c *gin.Context) {
	name := c.Param("eventName")
	date := c.Param("date")

	err := h.eventService.DeleteEventByNameAndDate(name, date)
	if err != nil {
		if errors.Is(err, ErrInvalidEventDate) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Data inválida. Use o formato RFC3339"})
			return
		}

		if errors.Is(err, ErrEventNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Evento não encontrado"})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Evento removido com sucesso!"})
}

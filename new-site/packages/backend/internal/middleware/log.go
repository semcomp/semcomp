package middleware

import (
	"net/http"
	"time"

	log "backend/internal/log"

	"github.com/gin-gonic/gin"
)

type responseRecorder struct {
	gin.ResponseWriter
	statusCode int
}

func (r *responseRecorder) WriteHeader(code int) {
	r.statusCode = code
	r.ResponseWriter.WriteHeader(code)
}

func AuditMiddleware(service log.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		recorder := &responseRecorder{ResponseWriter: c.Writer, statusCode: 0}
		c.Writer = recorder

		c.Next()

		statusCode := recorder.statusCode
		if statusCode == 0 {
			statusCode = c.Writer.Status()
		}

		latency := time.Since(start)
		entry := log.AuditLog{
			StatusCode: statusCode,
			Message:    responseMessage(c),
			Method:     c.Request.Method,
			Path:       c.FullPath(),
			IP:         c.ClientIP(),
			UserAgent:  c.Request.UserAgent(),
			LatencyMs:  latency.Milliseconds(),
		}

		if userNumber, ok := c.Get("userNumber"); ok {
			if userID, ok := userNumber.(uint); ok {
				entry.UserNumber = &userID
			}
		}
		if email, ok := c.Get("email"); ok {
			if userEmail, ok := email.(string); ok {
				entry.UserEmail = &userEmail
			}
		}

		_ = service.CreateAudit(entry)
	}
}

func ErrorLogMiddleware(service log.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()

		statusCode := c.Writer.Status()
		if statusCode != http.StatusInternalServerError {
			return
		}

		entry := log.ErrorLog{
			StatusCode: statusCode,
			Message:    responseMessage(c),
			Method:     c.Request.Method,
			Path:       c.FullPath(),
			IP:         c.ClientIP(),
			UserAgent:  c.Request.UserAgent(),
		}

		if userNumber, ok := c.Get("userNumber"); ok {
			if userID, ok := userNumber.(uint); ok {
				entry.UserNumber = &userID
			}
		}
		if email, ok := c.Get("email"); ok {
			if userEmail, ok := email.(string); ok {
				entry.UserEmail = &userEmail
			}
		}

		_ = service.CreateError(entry)
	}
}

func responseMessage(c *gin.Context) string {
	if value, ok := c.Get("responseMessage"); ok {
		if message, ok := value.(string); ok {
			return message
		}
	}
	return ""
}

package middleware

import (
	"bytes"
	"net/http"

	"backend/internal/cache"

	"github.com/gin-gonic/gin"
)

// responseCapture wraps gin.ResponseWriter to capture the response body without
// buffering — the real response is still written to the client normally.
type responseCapture struct {
	gin.ResponseWriter
	body *bytes.Buffer
}

func (r *responseCapture) Write(b []byte) (int, error) {
	r.body.Write(b)
	return r.ResponseWriter.Write(b)
}

// CacheResponse serves GET responses from the in-memory store on cache hit,
// and populates the store on cache miss (status 200 only).
func CacheResponse(store *cache.Store) gin.HandlerFunc {
	return func(c *gin.Context) {
		key := c.Request.Method + ":" + c.Request.URL.RequestURI()

		if status, ct, body, ok := store.Get(key); ok {
			c.Header("X-Cache", "HIT")
			c.Data(status, ct, body)
			c.Abort()
			return
		}

		capture := &responseCapture{ResponseWriter: c.Writer, body: &bytes.Buffer{}}
		c.Writer = capture
		c.Next()

		if c.Writer.Status() == http.StatusOK && capture.body.Len() > 0 {
			store.Set(key, http.StatusOK, c.Writer.Header().Get("Content-Type"), capture.body.Bytes())
		}
	}
}

// CacheInvalidate deletes all store entries whose key starts with any of the
// given prefixes after a successful (2xx) mutation.
// Must be placed before the handler in the Gin chain — it calls c.Next() internally.
func CacheInvalidate(store *cache.Store, prefixes ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()
		if c.Writer.Status() >= 200 && c.Writer.Status() < 300 {
			store.DeleteByPrefix(prefixes...)
		}
	}
}

package cache

import (
	"os"
	"strconv"
	"strings"
	"sync"
	"time"
)

type entry struct {
	status      int
	contentType string
	body        []byte
	expiresAt   time.Time
}

type Store struct {
	mu    sync.RWMutex
	items map[string]entry
	ttl   time.Duration
}

func NewStore() *Store {
	ttl := 5 * time.Minute
	if s := os.Getenv("CACHE_TTL_SECONDS"); s != "" {
		if n, err := strconv.Atoi(s); err == nil && n > 0 {
			ttl = time.Duration(n) * time.Second
		}
	}
	s := &Store{items: make(map[string]entry), ttl: ttl}
	go s.evict()
	return s
}

func (s *Store) Get(key string) (status int, ct string, body []byte, ok bool) {
	s.mu.RLock()
	e, found := s.items[key]
	s.mu.RUnlock()
	if !found || time.Now().After(e.expiresAt) {
		return 0, "", nil, false
	}
	return e.status, e.contentType, e.body, true
}

func (s *Store) Set(key string, status int, ct string, body []byte) {
	s.mu.Lock()
	s.items[key] = entry{
		status:      status,
		contentType: ct,
		body:        body,
		expiresAt:   time.Now().Add(s.ttl),
	}
	s.mu.Unlock()
}

// DeleteByPrefix removes all entries whose key starts with any of the given prefixes.
func (s *Store) DeleteByPrefix(prefixes ...string) {
	s.mu.Lock()
	for k := range s.items {
		for _, p := range prefixes {
			if strings.HasPrefix(k, p) {
				delete(s.items, k)
				break
			}
		}
	}
	s.mu.Unlock()
}

func (s *Store) evict() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()
	for range ticker.C {
		now := time.Now()
		s.mu.Lock()
		for k, e := range s.items {
			if now.After(e.expiresAt) {
				delete(s.items, k)
			}
		}
		s.mu.Unlock()
	}
}

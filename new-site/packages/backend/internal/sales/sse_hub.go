package sales

import "sync"

type sseHub struct {
	mu   sync.RWMutex
	subs map[uint][]chan string
}

// Hub é o hub SSE de status de vendas PIX — recebe publishes do webhook e
// entrega para os handlers de streaming conectados.
var Hub = &sseHub{
	subs: make(map[uint][]chan string),
}

func (h *sseHub) Subscribe(saleID uint) chan string {
	ch := make(chan string, 1)
	h.mu.Lock()
	h.subs[saleID] = append(h.subs[saleID], ch)
	h.mu.Unlock()
	return ch
}

func (h *sseHub) Unsubscribe(saleID uint, ch chan string) {
	h.mu.Lock()
	defer h.mu.Unlock()
	list := h.subs[saleID]
	for i, s := range list {
		if s == ch {
			h.subs[saleID] = append(list[:i], list[i+1:]...)
			break
		}
	}
	if len(h.subs[saleID]) == 0 {
		delete(h.subs, saleID)
	}
}

// Publish notifica todos os subscribers da venda com o novo status.
// Não bloqueia: se o canal estiver cheio, o evento é descartado.
func (h *sseHub) Publish(saleID uint, status string) {
	h.mu.RLock()
	src := h.subs[saleID]
	chs := make([]chan string, len(src))
	copy(chs, src)
	h.mu.RUnlock()
	for _, ch := range chs {
		select {
		case ch <- status:
		default:
		}
	}
}

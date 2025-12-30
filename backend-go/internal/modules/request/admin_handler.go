package request

import (
	"encoding/json"
	"log"
	"net/http"
)

type AdminHandler struct {
	repo *Repository
}

func NewAdminHandler() (*AdminHandler, error) {
	repo, err := NewRepository()
	if err != nil {
		return nil, err
	}

	return &AdminHandler{
		repo: repo,
	}, nil
}

func (h *AdminHandler) GetRequests(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	requests, err := h.repo.GetAll(r.Context())
	if err != nil {
		log.Printf("Error fetching requests: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(requests); err != nil {
		log.Printf("Error encoding response: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
}


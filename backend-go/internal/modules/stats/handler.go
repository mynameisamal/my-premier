package stats

import (
	"encoding/json"
	"log"
	"net/http"
)

type Handler struct {
	repo *Repository
}

func NewHandler() (*Handler, error) {
	repo, err := NewRepository()
	if err != nil {
		return nil, err
	}

	return &Handler{
		repo: repo,
	}, nil
}

type SummaryResponse struct {
	TotalProducts  int `json:"total_products"`
	TotalCategories int `json:"total_categories"`
	TotalRequests   int `json:"total_requests"`
	SupportOpen     int `json:"support_open"`
	SupportClosed   int `json:"support_closed"`
}

func (h *Handler) GetSummary(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	ctx := r.Context()

	totalProducts, err := h.repo.CountProducts(ctx)
	if err != nil {
		log.Printf("Error counting products: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	totalCategories, err := h.repo.CountCategories(ctx)
	if err != nil {
		log.Printf("Error counting categories: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	totalRequests, err := h.repo.CountRequests(ctx)
	if err != nil {
		log.Printf("Error counting requests: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	supportOpen, err := h.repo.CountSupportsByStatus(ctx, "open")
	if err != nil {
		log.Printf("Error counting open supports: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	supportClosed, err := h.repo.CountSupportsByStatus(ctx, "closed")
	if err != nil {
		log.Printf("Error counting closed supports: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	response := SummaryResponse{
		TotalProducts:  totalProducts,
		TotalCategories: totalCategories,
		TotalRequests:   totalRequests,
		SupportOpen:     supportOpen,
		SupportClosed:   supportClosed,
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("Error encoding response: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
}


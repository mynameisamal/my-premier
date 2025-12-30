package user

import (
	"encoding/json"
	"log"
	"net/http"

	"mypremier-backend/internal/middleware"
)

type MeHandler struct {
	repo *Repository
}

func NewMeHandler() (*MeHandler, error) {
	repo, err := NewRepository()
	if err != nil {
		return nil, err
	}

	return &MeHandler{
		repo: repo,
	}, nil
}

func (h *MeHandler) GetMe(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Get UID from context (set by AuthRequired middleware)
	uid := middleware.GetUserUID(r.Context())
	if uid == "" {
		http.Error(w, "User UID not found", http.StatusUnauthorized)
		return
	}

	// Fetch user from Firestore
	userData, err := h.repo.GetByUID(r.Context(), uid)
	if err != nil {
		log.Printf("Error fetching user: %v", err)
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	// Return uid, email, role
	response := map[string]interface{}{
		"uid":   userData.UID,
		"email": userData.Email,
		"role":  userData.Role,
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("Error encoding response: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
}


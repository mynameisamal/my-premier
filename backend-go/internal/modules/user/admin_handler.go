package user

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"
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

func (h *AdminHandler) GetUsers(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	users, err := h.repo.GetAll(r.Context())
	if err != nil {
		log.Printf("Error fetching users: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(users); err != nil {
		log.Printf("Error encoding response: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
}

func (h *AdminHandler) UpdateUserRole(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPatch {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Extract UID from path /admin/users/{uid}/role
	path := strings.TrimPrefix(r.URL.Path, "/admin/users/")
	if path == "" || path == r.URL.Path {
		http.Error(w, "User UID is required", http.StatusBadRequest)
		return
	}

	// Remove /role suffix if present
	uid := strings.TrimSuffix(path, "/role")
	if uid == "" {
		http.Error(w, "User UID is required", http.StatusBadRequest)
		return
	}

	var input struct {
		Role string `json:"role"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		log.Printf("Error decoding request body: %v", err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if input.Role == "" {
		http.Error(w, "Role is required", http.StatusBadRequest)
		return
	}

	if !IsValidRole(input.Role) {
		http.Error(w, "Invalid role. Must be one of: admin, sales, client", http.StatusBadRequest)
		return
	}

	err := h.repo.UpdateRole(r.Context(), uid, input.Role)
	if err != nil {
		log.Printf("Error updating user role: %v", err)
		if strings.Contains(err.Error(), "not found") {
			http.Error(w, "User not found", http.StatusNotFound)
			return
		}
		if strings.Contains(err.Error(), "invalid role") {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	response := map[string]interface{}{
		"uid":  uid,
		"role": input.Role,
	}
	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("Error encoding response: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
}

func (h *AdminHandler) UpdateUserStatus(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPatch {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Extract UID from path /admin/users/{uid}/status
	path := strings.TrimPrefix(r.URL.Path, "/admin/users/")
	if path == "" || path == r.URL.Path {
		http.Error(w, "User UID is required", http.StatusBadRequest)
		return
	}

	// Remove /status suffix if present
	uid := strings.TrimSuffix(path, "/status")
	if uid == "" {
		http.Error(w, "User UID is required", http.StatusBadRequest)
		return
	}

	var input struct {
		IsActive bool `json:"is_active"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		log.Printf("Error decoding request body: %v", err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	err := h.repo.UpdateStatus(r.Context(), uid, input.IsActive)
	if err != nil {
		log.Printf("Error updating user status: %v", err)
		if strings.Contains(err.Error(), "not found") {
			http.Error(w, "User not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	response := map[string]interface{}{
		"uid":       uid,
		"is_active": input.IsActive,
	}
	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("Error encoding response: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
}


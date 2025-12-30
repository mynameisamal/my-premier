package product

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"

	"mypremier-backend/internal/modules/audit"
)

type AdminHandler struct {
	repo       *Repository
	auditHandler *audit.Handler
}

func NewAdminHandler() (*AdminHandler, error) {
	repo, err := NewRepository()
	if err != nil {
		return nil, err
	}

	auditHandler, err := audit.NewHandler()
	if err != nil {
		return nil, err
	}

	return &AdminHandler{
		repo:        repo,
		auditHandler: auditHandler,
	}, nil
}

func (h *AdminHandler) GetProducts(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	products, err := h.repo.GetAll(r.Context())
	if err != nil {
		log.Printf("Error fetching products: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(products); err != nil {
		log.Printf("Error encoding response: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
}

func (h *AdminHandler) CreateProduct(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var input struct {
		Name               string   `json:"name"`
		Brand              string   `json:"brand"`
		Series             string   `json:"series"`
		CategoryID         string   `json:"category_id"`
		TechnicalOverview  string   `json:"technical_overview"`
		TypicalApplication string   `json:"typical_application"`
		Images             []string `json:"images"`
		DatasheetURL       string   `json:"datasheet_url"`
		IsActive           bool     `json:"is_active"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		log.Printf("Error decoding request body: %v", err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if input.Name == "" {
		http.Error(w, "Name is required", http.StatusBadRequest)
		return
	}

	product := Product{
		Name:               input.Name,
		Brand:              input.Brand,
		Series:             input.Series,
		CategoryID:         input.CategoryID,
		TechnicalOverview:  input.TechnicalOverview,
		TypicalApplication: input.TypicalApplication,
		Images:             input.Images,
		DatasheetURL:       input.DatasheetURL,
		IsActive:           input.IsActive,
	}

	id, err := h.repo.Create(r.Context(), product)
	if err != nil {
		log.Printf("Error creating product: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	// Log audit action
	_ = h.auditHandler.LogAction(r.Context(), "created", "product", id)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	response := map[string]interface{}{
		"id":                 id,
		"name":               product.Name,
		"brand":              product.Brand,
		"series":             product.Series,
		"category_id":        product.CategoryID,
		"technical_overview": product.TechnicalOverview,
		"typical_application": product.TypicalApplication,
		"images":             product.Images,
		"datasheet_url":      product.DatasheetURL,
		"is_active":          product.IsActive,
	}
	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("Error encoding response: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
}

func (h *AdminHandler) UpdateProduct(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Extract product ID from path /admin/products/{id}
	path := strings.TrimPrefix(r.URL.Path, "/admin/products/")
	if path == "" || path == r.URL.Path {
		http.Error(w, "Product ID is required", http.StatusBadRequest)
		return
	}

	var input struct {
		Name               string   `json:"name"`
		Brand              string   `json:"brand"`
		Series             string   `json:"series"`
		CategoryID         string   `json:"category_id"`
		TechnicalOverview  string   `json:"technical_overview"`
		TypicalApplication string   `json:"typical_application"`
		Images             []string `json:"images"`
		DatasheetURL       string   `json:"datasheet_url"`
		IsActive           bool     `json:"is_active"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		log.Printf("Error decoding request body: %v", err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if input.Name == "" {
		http.Error(w, "Name is required", http.StatusBadRequest)
		return
	}

	product := Product{
		Name:               input.Name,
		Brand:              input.Brand,
		Series:             input.Series,
		CategoryID:         input.CategoryID,
		TechnicalOverview:  input.TechnicalOverview,
		TypicalApplication: input.TypicalApplication,
		Images:             input.Images,
		DatasheetURL:       input.DatasheetURL,
		IsActive:           input.IsActive,
	}

	err := h.repo.Update(r.Context(), path, product)
	if err != nil {
		log.Printf("Error updating product: %v", err)
		if strings.Contains(err.Error(), "not found") {
			http.Error(w, "Product not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	// Log audit action
	_ = h.auditHandler.LogAction(r.Context(), "updated", "product", path)

	w.Header().Set("Content-Type", "application/json")
	response := map[string]interface{}{
		"id":                 path,
		"name":               product.Name,
		"brand":              product.Brand,
		"series":             product.Series,
		"category_id":        product.CategoryID,
		"technical_overview": product.TechnicalOverview,
		"typical_application": product.TypicalApplication,
		"images":             product.Images,
		"datasheet_url":      product.DatasheetURL,
		"is_active":          product.IsActive,
	}
	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("Error encoding response: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
}

func (h *AdminHandler) DeleteProduct(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Extract product ID from path /admin/products/{id}
	path := strings.TrimPrefix(r.URL.Path, "/admin/products/")
	if path == "" || path == r.URL.Path {
		http.Error(w, "Product ID is required", http.StatusBadRequest)
		return
	}

	err := h.repo.Delete(r.Context(), path)
	if err != nil {
		log.Printf("Error deleting product: %v", err)
		if strings.Contains(err.Error(), "not found") {
			http.Error(w, "Product not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	// Log audit action
	_ = h.auditHandler.LogAction(r.Context(), "deleted", "product", path)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	response := map[string]interface{}{
		"id":      path,
		"message": "Product deleted successfully",
	}
	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("Error encoding response: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
}


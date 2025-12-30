package main

import (
	"log"
	"net/http"

	"mypremier-backend/internal/config"
	"mypremier-backend/internal/middleware"
	"mypremier-backend/internal/modules/category"
	"mypremier-backend/internal/modules/product"
	"mypremier-backend/internal/modules/request"
)

func main() {
	config.InitFirebase()

	mux := http.NewServeMux()

	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("MY PREMIER API is running"))
	})

	// protected test endpoint
	protected := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		uid := middleware.GetUserUID(r.Context())
		w.Write([]byte("Hello UID: " + uid))
	})

	mux.Handle("/protected", middleware.AuthRequired(protected))

	// Category endpoints
	categoryHandler, err := category.NewHandler()
	if err != nil {
		log.Fatalf("Failed to initialize category handler: %v", err)
	}
	mux.HandleFunc("/categories", categoryHandler.GetCategories)

	// Product endpoints
	productHandler, err := product.NewHandler()
	if err != nil {
		log.Fatalf("Failed to initialize product handler: %v", err)
	}
	mux.HandleFunc("/products", productHandler.GetProducts)
	mux.HandleFunc("/products/", productHandler.GetProduct)

	// Request Info endpoints
	requestHandler, err := request.NewHandler()
	if err != nil {
		log.Fatalf("Failed to initialize request handler: %v", err)
	}
	mux.HandleFunc("/request-info", requestHandler.CreateRequest)

	server := &http.Server{
		Addr:    ":8080",
		Handler: mux,
	}

	log.Println("🚀 Server running on http://localhost:8080")
	log.Fatal(server.ListenAndServe())
}

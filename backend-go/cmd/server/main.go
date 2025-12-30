package main

import (
	"log"
	"net/http"

	"mypremier-backend/internal/config"
	"mypremier-backend/internal/middleware"
	"mypremier-backend/internal/modules/category"
	"mypremier-backend/internal/modules/product"
	"mypremier-backend/internal/modules/request"
	"mypremier-backend/internal/modules/support"
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

	// Admin Request endpoints
	adminRequestHandler, err := request.NewAdminHandler()
	if err != nil {
		log.Fatalf("Failed to initialize admin request handler: %v", err)
	}
	adminGetRequests := http.HandlerFunc(adminRequestHandler.GetRequests)
	mux.Handle("/admin/requests", middleware.AuthRequired(adminGetRequests))

	// Support endpoints
	supportHandler, err := support.NewHandler()
	if err != nil {
		log.Fatalf("Failed to initialize support handler: %v", err)
	}
	mux.HandleFunc("/support", supportHandler.CreateSupport)

	// Admin Support endpoints
	adminSupportHandler, err := support.NewAdminHandler()
	if err != nil {
		log.Fatalf("Failed to initialize admin support handler: %v", err)
	}
	adminGetSupports := http.HandlerFunc(adminSupportHandler.GetSupports)
	mux.Handle("/admin/supports", middleware.AuthRequired(adminGetSupports))
	adminUpdateSupport := http.HandlerFunc(adminSupportHandler.UpdateSupportStatus)
	mux.Handle("/admin/support/", middleware.AuthRequired(adminUpdateSupport))

	server := &http.Server{
		Addr:    ":8080",
		Handler: mux,
	}

	log.Println("🚀 Server running on http://localhost:8080")
	log.Fatal(server.ListenAndServe())
}

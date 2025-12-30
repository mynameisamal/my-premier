package main

import (
	"log"
	"net/http"
	"strings"

	"mypremier-backend/internal/config"
	"mypremier-backend/internal/middleware"
	"mypremier-backend/internal/modules/audit"
	"mypremier-backend/internal/modules/category"
	"mypremier-backend/internal/modules/product"
	"mypremier-backend/internal/modules/request"
	"mypremier-backend/internal/modules/stats"
	"mypremier-backend/internal/modules/support"
	"mypremier-backend/internal/modules/user"
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

	// Admin Category endpoints
	adminCategoryHandler, err := category.NewAdminHandler()
	if err != nil {
		log.Fatalf("Failed to initialize admin category handler: %v", err)
	}
	// Method router for /admin/categories (GET, POST)
	adminCategoriesRouter := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			adminCategoryHandler.GetCategories(w, r)
		case http.MethodPost:
			adminCategoryHandler.CreateCategory(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})
	mux.Handle("/admin/categories", middleware.AuthRequired(adminCategoriesRouter))
	// Method router for /admin/categories/{id} (PUT, DELETE)
	adminCategoryRouter := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPut:
			adminCategoryHandler.UpdateCategory(w, r)
		case http.MethodDelete:
			adminCategoryHandler.DeleteCategory(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})
	mux.Handle("/admin/categories/", middleware.AuthRequired(adminCategoryRouter))

	// Product endpoints
	productHandler, err := product.NewHandler()
	if err != nil {
		log.Fatalf("Failed to initialize product handler: %v", err)
	}
	mux.HandleFunc("/products", productHandler.GetProducts)
	mux.HandleFunc("/products/", productHandler.GetProduct)

	// Admin Product endpoints
	adminProductHandler, err := product.NewAdminHandler()
	if err != nil {
		log.Fatalf("Failed to initialize admin product handler: %v", err)
	}
	// Method router for /admin/products (GET, POST)
	adminProductsRouter := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			adminProductHandler.GetProducts(w, r)
		case http.MethodPost:
			adminProductHandler.CreateProduct(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})
	mux.Handle("/admin/products", middleware.AuthRequired(adminProductsRouter))
	// Method router for /admin/products/{id} (PUT, DELETE)
	adminProductRouter := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPut:
			adminProductHandler.UpdateProduct(w, r)
		case http.MethodDelete:
			adminProductHandler.DeleteProduct(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})
	mux.Handle("/admin/products/", middleware.AuthRequired(adminProductRouter))

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

	// Support Message endpoints
	messageHandler, err := support.NewMessageHandler()
	if err != nil {
		log.Fatalf("Failed to initialize message handler: %v", err)
	}
	// Method router for /supports/{id}/messages (GET, POST)
	supportMessagesRouter := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			messageHandler.GetMessages(w, r)
		case http.MethodPost:
			messageHandler.CreateMessage(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})
	mux.Handle("/supports/", middleware.AuthRequired(supportMessagesRouter))

	// Admin User endpoints
	adminUserHandler, err := user.NewAdminHandler()
	if err != nil {
		log.Fatalf("Failed to initialize admin user handler: %v", err)
	}
	adminGetUsers := http.HandlerFunc(adminUserHandler.GetUsers)
	mux.Handle("/admin/users", middleware.AuthRequired(adminGetUsers))
	// Method router for /admin/users/{uid}/role and /admin/users/{uid}/status (PATCH)
	adminUserRouter := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPatch {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		// Route based on path suffix
		if strings.HasSuffix(r.URL.Path, "/role") {
			adminUserHandler.UpdateUserRole(w, r)
		} else if strings.HasSuffix(r.URL.Path, "/status") {
			adminUserHandler.UpdateUserStatus(w, r)
		} else {
			http.Error(w, "Invalid endpoint", http.StatusBadRequest)
		}
	})
	mux.Handle("/admin/users/", middleware.AuthRequired(adminUserRouter))

	// Admin Me endpoint - returns current user info (uid, email, role)
	meHandler, err := user.NewMeHandler()
	if err != nil {
		log.Fatalf("Failed to initialize me handler: %v", err)
	}
	adminMeHandler := http.HandlerFunc(meHandler.GetMe)
	mux.Handle("/admin/me", middleware.AuthRequired(middleware.LoadUserRole(adminMeHandler)))

	// Admin Stats endpoints
	statsHandler, err := stats.NewHandler()
	if err != nil {
		log.Fatalf("Failed to initialize stats handler: %v", err)
	}
	adminStatsSummary := http.HandlerFunc(statsHandler.GetSummary)
	mux.Handle("/admin/stats/summary", middleware.AuthRequired(adminStatsSummary))

	// Admin Audit Logs endpoints
	auditHandler, err := audit.NewHandler()
	if err != nil {
		log.Fatalf("Failed to initialize audit handler: %v", err)
	}
	adminAuditLogs := http.HandlerFunc(auditHandler.GetAuditLogs)
	mux.Handle("/admin/audit-logs", middleware.AuthRequired(adminAuditLogs))

	// Apply CORS middleware globally
	handler := middleware.CORS(mux)

	server := &http.Server{
		Addr:    ":8080",
		Handler: handler,
	}

	log.Println("🚀 Server running on http://localhost:8080")
	log.Fatal(server.ListenAndServe())
}

package middleware

import (
	"context"
	"log"
	"net/http"

	"mypremier-backend/internal/modules/user"
)

type contextKey string

const userRoleKey contextKey = "userRole"

// LoadUserRole middleware loads the user role from Firestore and injects it into context
// This should be used after AuthRequired middleware
func LoadUserRole(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Get UID from context (set by AuthRequired middleware)
		uid := GetUserUID(r.Context())
		if uid == "" {
			http.Error(w, "User UID not found in context", http.StatusInternalServerError)
			return
		}

		// Get user repository
		repo, err := user.NewRepository()
		if err != nil {
			log.Printf("Error creating user repository: %v", err)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}

		// Fetch user from Firestore
		userData, err := repo.GetByUID(r.Context(), uid)
		if err != nil {
			log.Printf("Error fetching user: %v", err)
			http.Error(w, "User not found or error fetching user", http.StatusNotFound)
			return
		}

		// Inject role into context
		ctx := context.WithValue(r.Context(), userRoleKey, userData.Role)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// RequireRole checks if the user has the required role
// This should be used after LoadUserRole middleware
func RequireRole(requiredRole string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			role, ok := r.Context().Value(userRoleKey).(string)
			if !ok || role == "" {
				http.Error(w, "User role not found in context", http.StatusInternalServerError)
				return
			}

			if role != requiredRole {
				http.Error(w, "Insufficient permissions", http.StatusForbidden)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

// GetUserRole retrieves the user role from context
func GetUserRole(ctx context.Context) string {
	role, _ := ctx.Value(userRoleKey).(string)
	return role
}


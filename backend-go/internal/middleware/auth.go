package middleware

import (
	"context"
	"net/http"
	"strings"

	"mypremier-backend/internal/config"
)

type contextKey string

const userUIDKey contextKey = "userUID"

func AuthRequired(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Authorization header required", http.StatusUnauthorized)
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			http.Error(w, "Invalid authorization format", http.StatusUnauthorized)
			return
		}

		tokenString := parts[1]

		authClient, err := config.FirebaseApp.Auth(r.Context())
		if err != nil {
			http.Error(w, "Firebase auth init failed", http.StatusInternalServerError)
			return
		}

		token, err := authClient.VerifyIDToken(context.Background(), tokenString)
		if err != nil {
			http.Error(w, "Invalid or expired token", http.StatusUnauthorized)
			return
		}

		// simpan UID ke context
		ctx := context.WithValue(r.Context(), userUIDKey, token.UID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// helper ambil uid di handler
func GetUserUID(ctx context.Context) string {
	uid, _ := ctx.Value(userUIDKey).(string)
	return uid
}

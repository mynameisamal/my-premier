package main

import (
	"log"
	"net/http"

	"mypremier-backend/internal/config"
	"mypremier-backend/internal/middleware"
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

	server := &http.Server{
		Addr:    ":8080",
		Handler: mux,
	}

	log.Println("🚀 Server running on http://localhost:8080")
	log.Fatal(server.ListenAndServe())
}

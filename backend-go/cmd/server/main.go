package main

import (
	"log"
	"net/http"

	"mypremier-backend/internal/config"
)

func main() {
	// init firebase
	config.InitFirebase()

	mux := http.NewServeMux()

	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("MY PREMIER API is running"))
	})

	server := &http.Server{
		Addr:    ":8080",
		Handler: mux,
	}

	log.Println("🚀 Server running on http://localhost:8080")
	if err := server.ListenAndServe(); err != nil {
		log.Fatal(err)
	}
}

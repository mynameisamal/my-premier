package request

import (
	"context"
	"fmt"

	"cloud.google.com/go/firestore"
	"mypremier-backend/internal/config"
)

type Repository struct {
	client     *firestore.Client
	collection string
}

func NewRepository() (*Repository, error) {
	client, err := config.FirebaseApp.Firestore(context.Background())
	if err != nil {
		return nil, fmt.Errorf("failed to get firestore client: %w", err)
	}

	return &Repository{
		client:     client,
		collection: "requests",
	}, nil
}

func (r *Repository) Create(ctx context.Context, data map[string]interface{}) (string, error) {
	docRef := r.client.Collection(r.collection).NewDoc()

	requestData := map[string]interface{}{
		"status":     "open",
		"created_at": firestore.ServerTimestamp,
		"data":       data,
	}

	_, err := docRef.Set(ctx, requestData)
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}

	return docRef.ID, nil
}


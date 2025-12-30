package support

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
		collection: "supports",
	}, nil
}

func (r *Repository) Create(ctx context.Context, data map[string]interface{}) (string, error) {
	docRef := r.client.Collection(r.collection).NewDoc()

	supportData := map[string]interface{}{
		"status":     "open",
		"created_at": firestore.ServerTimestamp,
		"data":       data,
	}

	_, err := docRef.Set(ctx, supportData)
	if err != nil {
		return "", fmt.Errorf("failed to create support request: %w", err)
	}

	return docRef.ID, nil
}

func (r *Repository) GetAll(ctx context.Context) ([]Support, error) {
	iter := r.client.Collection(r.collection).
		OrderBy("created_at", firestore.Desc).
		Documents(ctx)
	defer iter.Stop()

	var supports []Support
	for {
		doc, err := iter.Next()
		if err != nil {
			break
		}

		var support Support
		if err := doc.DataTo(&support); err != nil {
			continue
		}

		// Set ID from document ID if not present in data
		if support.ID == "" {
			support.ID = doc.Ref.ID
		}

		supports = append(supports, support)
	}

	return supports, nil
}

func (r *Repository) UpdateStatus(ctx context.Context, id string, status string) error {
	validStatuses := map[string]bool{
		"open":      true,
		"responded": true,
		"closed":    true,
	}

	if !validStatuses[status] {
		return fmt.Errorf("invalid status: %s", status)
	}

	docRef := r.client.Collection(r.collection).Doc(id)
	_, err := docRef.Update(ctx, []firestore.Update{
		{Path: "status", Value: status},
	})

	if err != nil {
		return fmt.Errorf("failed to update support status: %w", err)
	}

	return nil
}


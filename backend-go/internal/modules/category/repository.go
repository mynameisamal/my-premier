package category

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
		collection: "categories",
	}, nil
}

func (r *Repository) GetAll(ctx context.Context) ([]Category, error) {
	iter := r.client.Collection(r.collection).Documents(ctx)
	defer iter.Stop()

	var categories []Category
	for {
		doc, err := iter.Next()
		if err != nil {
			break
		}

		var category Category
		if err := doc.DataTo(&category); err != nil {
			continue
		}

		// Set ID from document ID if not present in data
		if category.ID == "" {
			category.ID = doc.Ref.ID
		}

		categories = append(categories, category)
	}

	return categories, nil
}


package product

import (
	"context"
	"fmt"

	"mypremier-backend/internal/config"

	"cloud.google.com/go/firestore"
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
		collection: "products",
	}, nil
}

func (r *Repository) GetAll(ctx context.Context) ([]Product, error) {
	iter := r.client.Collection(r.collection).Documents(ctx)
	defer iter.Stop()

	var products []Product
	for {
		doc, err := iter.Next()
		if err != nil {
			break
		}

		var product Product
		if err := doc.DataTo(&product); err != nil {
			continue
		}

		// Set ID from document ID if not present in data
		if product.ID == "" {
			product.ID = doc.Ref.ID
		}

		products = append(products, product)
	}

	return products, nil
}

func (r *Repository) GetByID(ctx context.Context, id string) (*Product, error) {
	doc, err := r.client.Collection(r.collection).Doc(id).Get(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get product: %w", err)
	}

	var product Product
	if err := doc.DataTo(&product); err != nil {
		return nil, fmt.Errorf("failed to parse product data: %w", err)
	}

	// Set ID from document ID if not present in data
	if product.ID == "" {
		product.ID = doc.Ref.ID
	}

	return &product, nil
}

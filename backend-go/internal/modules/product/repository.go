package product

import (
	"context"
	"fmt"

	"mypremier-backend/internal/config"

	"cloud.google.com/go/firestore"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
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

func (r *Repository) Create(ctx context.Context, product Product) (string, error) {
	docRef := r.client.Collection(r.collection).NewDoc()

	productData := map[string]interface{}{
		"name":                product.Name,
		"brand":               product.Brand,
		"series":              product.Series,
		"category_id":         product.CategoryID,
		"technical_overview":  product.TechnicalOverview,
		"typical_application": product.TypicalApplication,
		"images":              product.Images,
		"datasheet_url":       product.DatasheetURL,
		"is_active":           product.IsActive,
		"created_at":          firestore.ServerTimestamp,
		"updated_at":          firestore.ServerTimestamp,
	}

	_, err := docRef.Set(ctx, productData)
	if err != nil {
		return "", fmt.Errorf("failed to create product: %w", err)
	}

	return docRef.ID, nil
}

func (r *Repository) Update(ctx context.Context, id string, product Product) error {
	docRef := r.client.Collection(r.collection).Doc(id)

	updates := []firestore.Update{
		{Path: "name", Value: product.Name},
		{Path: "brand", Value: product.Brand},
		{Path: "series", Value: product.Series},
		{Path: "category_id", Value: product.CategoryID},
		{Path: "technical_overview", Value: product.TechnicalOverview},
		{Path: "typical_application", Value: product.TypicalApplication},
		{Path: "images", Value: product.Images},
		{Path: "datasheet_url", Value: product.DatasheetURL},
		{Path: "is_active", Value: product.IsActive},
		{Path: "updated_at", Value: firestore.ServerTimestamp},
	}

	_, err := docRef.Update(ctx, updates)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return fmt.Errorf("product not found")
		}
		return fmt.Errorf("failed to update product: %w", err)
	}

	return nil
}

func (r *Repository) Delete(ctx context.Context, id string) error {
	docRef := r.client.Collection(r.collection).Doc(id)
	_, err := docRef.Delete(ctx)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return fmt.Errorf("product not found")
		}
		return fmt.Errorf("failed to delete product: %w", err)
	}

	return nil
}
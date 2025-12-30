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

func (r *Repository) GetByID(ctx context.Context, id string) (*Category, error) {
	doc, err := r.client.Collection(r.collection).Doc(id).Get(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get category: %w", err)
	}

	var category Category
	if err := doc.DataTo(&category); err != nil {
		return nil, fmt.Errorf("failed to parse category data: %w", err)
	}

	// Set ID from document ID if not present in data
	if category.ID == "" {
		category.ID = doc.Ref.ID
	}

	return &category, nil
}

func (r *Repository) Create(ctx context.Context, category Category) (string, error) {
	docRef := r.client.Collection(r.collection).NewDoc()

	categoryData := map[string]interface{}{
		"name":       category.Name,
		"parent_id":  category.ParentID,
		"created_at": firestore.ServerTimestamp,
	}

	_, err := docRef.Set(ctx, categoryData)
	if err != nil {
		return "", fmt.Errorf("failed to create category: %w", err)
	}

	return docRef.ID, nil
}

func (r *Repository) Update(ctx context.Context, id string, category Category) error {
	docRef := r.client.Collection(r.collection).Doc(id)

	updates := []firestore.Update{
		{Path: "name", Value: category.Name},
		{Path: "parent_id", Value: category.ParentID},
	}

	_, err := docRef.Update(ctx, updates)
	if err != nil {
		return fmt.Errorf("failed to update category: %w", err)
	}

	return nil
}

func (r *Repository) Delete(ctx context.Context, id string) error {
	docRef := r.client.Collection(r.collection).Doc(id)
	_, err := docRef.Delete(ctx)
	if err != nil {
		return fmt.Errorf("failed to delete category: %w", err)
	}

	return nil
}


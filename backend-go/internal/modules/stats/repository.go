package stats

import (
	"context"
	"fmt"

	"cloud.google.com/go/firestore"
	"mypremier-backend/internal/config"
)

type Repository struct {
	client *firestore.Client
}

func NewRepository() (*Repository, error) {
	client, err := config.FirebaseApp.Firestore(context.Background())
	if err != nil {
		return nil, fmt.Errorf("failed to get firestore client: %w", err)
	}

	return &Repository{
		client: client,
	}, nil
}

func (r *Repository) CountProducts(ctx context.Context) (int, error) {
	iter := r.client.Collection("products").Documents(ctx)
	defer iter.Stop()

	count := 0
	for {
		_, err := iter.Next()
		if err != nil {
			break
		}
		count++
	}

	return count, nil
}

func (r *Repository) CountCategories(ctx context.Context) (int, error) {
	iter := r.client.Collection("categories").Documents(ctx)
	defer iter.Stop()

	count := 0
	for {
		_, err := iter.Next()
		if err != nil {
			break
		}
		count++
	}

	return count, nil
}

func (r *Repository) CountRequests(ctx context.Context) (int, error) {
	iter := r.client.Collection("requests").Documents(ctx)
	defer iter.Stop()

	count := 0
	for {
		_, err := iter.Next()
		if err != nil {
			break
		}
		count++
	}

	return count, nil
}

func (r *Repository) CountSupportsByStatus(ctx context.Context, status string) (int, error) {
	iter := r.client.Collection("supports").
		Where("status", "==", status).
		Documents(ctx)
	defer iter.Stop()

	count := 0
	for {
		_, err := iter.Next()
		if err != nil {
			break
		}
		count++
	}

	return count, nil
}


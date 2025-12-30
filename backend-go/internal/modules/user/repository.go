package user

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
		collection: "users",
	}, nil
}

func (r *Repository) GetAll(ctx context.Context) ([]User, error) {
	iter := r.client.Collection(r.collection).Documents(ctx)
	defer iter.Stop()

	var users []User
	for {
		doc, err := iter.Next()
		if err != nil {
			break
		}

		var user User
		if err := doc.DataTo(&user); err != nil {
			continue
		}

		// Set UID from document ID if not present in data
		if user.UID == "" {
			user.UID = doc.Ref.ID
		}

		users = append(users, user)
	}

	return users, nil
}

func (r *Repository) GetByUID(ctx context.Context, uid string) (*User, error) {
	doc, err := r.client.Collection(r.collection).Doc(uid).Get(ctx)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	var user User
	if err := doc.DataTo(&user); err != nil {
		return nil, fmt.Errorf("failed to parse user data: %w", err)
	}

	// Set UID from document ID if not present in data
	if user.UID == "" {
		user.UID = doc.Ref.ID
	}

	return &user, nil
}

func (r *Repository) UpdateRole(ctx context.Context, uid string, role string) error {
	if !IsValidRole(role) {
		return fmt.Errorf("invalid role: %s. Must be one of: admin, sales, client", role)
	}

	docRef := r.client.Collection(r.collection).Doc(uid)
	
	// Check if document exists
	_, err := docRef.Get(ctx)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return fmt.Errorf("user not found")
		}
		return fmt.Errorf("failed to check user existence: %w", err)
	}

	updates := []firestore.Update{
		{Path: "role", Value: role},
	}

	_, err = docRef.Update(ctx, updates)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return fmt.Errorf("user not found")
		}
		return fmt.Errorf("failed to update user role: %w", err)
	}

	return nil
}

func (r *Repository) UpdateStatus(ctx context.Context, uid string, isActive bool) error {
	docRef := r.client.Collection(r.collection).Doc(uid)
	
	// Check if document exists
	_, err := docRef.Get(ctx)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return fmt.Errorf("user not found")
		}
		return fmt.Errorf("failed to check user existence: %w", err)
	}

	updates := []firestore.Update{
		{Path: "is_active", Value: isActive},
	}

	_, err = docRef.Update(ctx, updates)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return fmt.Errorf("user not found")
		}
		return fmt.Errorf("failed to update user status: %w", err)
	}

	return nil
}


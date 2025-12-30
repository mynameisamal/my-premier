package audit

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
		collection: "audit_logs",
	}, nil
}

func (r *Repository) Create(ctx context.Context, log AuditLog) error {
	docRef := r.client.Collection(r.collection).NewDoc()

	logData := map[string]interface{}{
		"actor_uid": log.ActorUID,
		"action":    log.Action,
		"entity":    log.Entity,
		"entity_id": log.EntityID,
		"created_at": firestore.ServerTimestamp,
	}

	_, err := docRef.Set(ctx, logData)
	if err != nil {
		return fmt.Errorf("failed to create audit log: %w", err)
	}

	return nil
}

func (r *Repository) GetAll(ctx context.Context) ([]AuditLog, error) {
	iter := r.client.Collection(r.collection).
		OrderBy("created_at", firestore.Desc).
		Documents(ctx)
	defer iter.Stop()

	var logs []AuditLog
	for {
		doc, err := iter.Next()
		if err != nil {
			break
		}

		var log AuditLog
		if err := doc.DataTo(&log); err != nil {
			continue
		}

		// Set ID from document ID if not present in data
		if log.ID == "" {
			log.ID = doc.Ref.ID
		}

		logs = append(logs, log)
	}

	return logs, nil
}


package support

import (
	"context"
	"fmt"

	"cloud.google.com/go/firestore"
	"mypremier-backend/internal/config"
)

type MessageRepository struct {
	client     *firestore.Client
	collection string
}

func NewMessageRepository() (*MessageRepository, error) {
	client, err := config.FirebaseApp.Firestore(context.Background())
	if err != nil {
		return nil, fmt.Errorf("failed to get firestore client: %w", err)
	}

	return &MessageRepository{
		client:     client,
		collection: "support_messages",
	}, nil
}

func (r *MessageRepository) GetBySupportID(ctx context.Context, supportID string) ([]SupportMessage, error) {
	iter := r.client.Collection(r.collection).
		Where("support_id", "==", supportID).
		OrderBy("created_at", firestore.Asc).
		Documents(ctx)
	defer iter.Stop()

	var messages []SupportMessage
	for {
		doc, err := iter.Next()
		if err != nil {
			break
		}

		var message SupportMessage
		if err := doc.DataTo(&message); err != nil {
			continue
		}

		// Set ID from document ID if not present in data
		if message.ID == "" {
			message.ID = doc.Ref.ID
		}

		messages = append(messages, message)
	}

	return messages, nil
}

func (r *MessageRepository) Create(ctx context.Context, supportID string, senderType string, message string) (string, error) {
	docRef := r.client.Collection(r.collection).NewDoc()

	messageData := map[string]interface{}{
		"support_id":  supportID,
		"sender_type": senderType,
		"message":     message,
		"created_at":  firestore.ServerTimestamp,
	}

	_, err := docRef.Set(ctx, messageData)
	if err != nil {
		return "", fmt.Errorf("failed to create support message: %w", err)
	}

	return docRef.ID, nil
}


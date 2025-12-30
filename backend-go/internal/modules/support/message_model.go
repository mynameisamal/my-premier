package support

import "time"

// SupportMessage represents a message in a support chat in Firestore
type SupportMessage struct {
	ID         string    `firestore:"id" json:"id"`
	SupportID  string    `firestore:"support_id" json:"support_id"`
	SenderType string    `firestore:"sender_type" json:"sender_type"` // "client" or "admin"
	Message    string    `firestore:"message" json:"message"`
	CreatedAt  time.Time `firestore:"created_at" json:"created_at"`
}

// CreateMessageInput represents the input for creating a support message
type CreateMessageInput struct {
	Message    string `json:"message"`
	SenderType string `json:"sender_type"` // "client" or "admin"
}

// CreateMessageResponse represents the response after creating a message
type CreateMessageResponse struct {
	ID         string    `json:"id"`
	SupportID  string    `json:"support_id"`
	SenderType string    `json:"sender_type"`
	Message    string    `json:"message"`
	CreatedAt  time.Time `json:"created_at"`
}


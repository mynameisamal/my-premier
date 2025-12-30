package support

import "time"

// Support represents a support request in Firestore
type Support struct {
	ID        string                 `firestore:"id" json:"id"`
	Status    string                 `firestore:"status" json:"status"`
	CreatedAt time.Time              `firestore:"created_at" json:"created_at"`
	Data      map[string]interface{} `firestore:"data" json:"data"`
}

// CreateSupportInput represents the input for creating a support request
type CreateSupportInput struct {
	Data map[string]interface{} `json:"data"`
}

// CreateSupportResponse represents the response after creating a support request
type CreateSupportResponse struct {
	ID     string `json:"id"`
	Status string `json:"status"`
}


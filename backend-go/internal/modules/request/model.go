package request

import "time"

// Request represents a request info/quotation in Firestore
type Request struct {
	ID        string                 `firestore:"id" json:"id"`
	Status    string                 `firestore:"status" json:"status"`
	CreatedAt time.Time              `firestore:"created_at" json:"created_at"`
	Data      map[string]interface{} `firestore:"data" json:"data"`
}

// CreateRequestInput represents the input for creating a request
type CreateRequestInput struct {
	Data map[string]interface{} `json:"data"`
}

// CreateRequestResponse represents the response after creating a request
type CreateRequestResponse struct {
	ID     string `json:"id"`
	Status string `json:"status"`
}


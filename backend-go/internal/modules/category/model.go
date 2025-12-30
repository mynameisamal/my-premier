package category

import "time"

// Category represents a category in Firestore
type Category struct {
	ID        string    `firestore:"id" json:"id"`
	Name      string    `firestore:"name" json:"name"`
	ParentID  string    `firestore:"parent_id" json:"parent_id"`
	CreatedAt time.Time `firestore:"created_at" json:"created_at"`
}


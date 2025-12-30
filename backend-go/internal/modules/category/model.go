package category

// Category represents a category in Firestore
type Category struct {
	ID       string `firestore:"id" json:"id"`
	Name     string `firestore:"name" json:"name"`
	ParentID string `firestore:"parent_id" json:"parent_id"`
}


package product

// Product represents a product in Firestore
type Product struct {
	ID                 string   `firestore:"id" json:"id"`
	Name               string   `firestore:"name" json:"name"`
	Brand              string   `firestore:"brand" json:"brand"`
	Series             string   `firestore:"series" json:"series"`
	CategoryID         string   `firestore:"category_id" json:"category_id"`
	TechnicalOverview  string   `firestore:"technical_overview" json:"technical_overview"`
	TypicalApplication string   `firestore:"typical_application" json:"typical_application"`
	Images             []string `firestore:"images" json:"images"`
	DatasheetURL       string   `firestore:"datasheet_url" json:"datasheet_url"`
	IsActive           bool     `firestore:"is_active" json:"is_active"`
}

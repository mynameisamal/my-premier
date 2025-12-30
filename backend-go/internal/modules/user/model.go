package user

import (
	"time"
)

// User represents a user in Firestore
type User struct {
	UID       string    `firestore:"uid" json:"uid"`
	Email     string    `firestore:"email" json:"email"`
	Role      string    `firestore:"role" json:"role"` // admin/sales/client
	IsActive  bool      `firestore:"is_active" json:"is_active"`
	CreatedAt time.Time `firestore:"created_at" json:"created_at"`
}

// Valid roles
const (
	RoleAdmin  = "admin"
	RoleSales  = "sales"
	RoleClient = "client"
)

// IsValidRole checks if the role is valid
func IsValidRole(role string) bool {
	return role == RoleAdmin || role == RoleSales || role == RoleClient
}


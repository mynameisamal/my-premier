package audit

import "time"

// AuditLog represents an audit log entry in Firestore
type AuditLog struct {
	ID        string    `firestore:"id" json:"id"`
	ActorUID  string    `firestore:"actor_uid" json:"actor_uid"`
	Action    string    `firestore:"action" json:"action"`
	Entity    string    `firestore:"entity" json:"entity"`
	EntityID  string    `firestore:"entity_id" json:"entity_id"`
	CreatedAt time.Time `firestore:"created_at" json:"created_at"`
}


package audit

import (
	"context"
	"encoding/json"
	"log"
	"net/http"

	"mypremier-backend/internal/middleware"
)

type Handler struct {
	repo *Repository
}

func NewHandler() (*Handler, error) {
	repo, err := NewRepository()
	if err != nil {
		return nil, err
	}

	return &Handler{
		repo: repo,
	}, nil
}

func (h *Handler) GetAuditLogs(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	logs, err := h.repo.GetAll(r.Context())
	if err != nil {
		log.Printf("Error fetching audit logs: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(logs); err != nil {
		log.Printf("Error encoding response: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
}

// LogAction creates an audit log entry
func (h *Handler) LogAction(ctx context.Context, action, entity, entityID string) error {
	actorUID := middleware.GetUserUID(ctx)
	if actorUID == "" {
		// If no UID in context, skip logging (for non-authenticated operations)
		return nil
	}

	logEntry := AuditLog{
		ActorUID: actorUID,
		Action:   action,
		Entity:   entity,
		EntityID: entityID,
	}

	return h.repo.Create(ctx, logEntry)
}


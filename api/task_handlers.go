package api

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/bongo/golang-learnings/config"
	"github.com/bongo/golang-learnings/models"
	"github.com/bongo/golang-learnings/services"
	"github.com/gorilla/mux"
)

// API contains handlers for API endpoints
type API struct {
	taskService    *services.TaskService
	authService    *services.AuthService
	contactService *services.ContactService
	config         *config.Config
}

// HealthCheck handles the health check endpoint
func (api *API) HealthCheck(w http.ResponseWriter, r *http.Request) {
	respondJSON(w, http.StatusOK, map[string]string{
		"status":      "healthy",
		"time":        getNowFormatted(),
		"environment": api.config.Environment,
	})
}

// GetTasks returns all tasks for the authenticated user
func (api *API) GetTasks(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context (set by auth middleware)
	userID := extractUserID(r)
	
	tasks, err := api.taskService.GetAllTasks(userID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to retrieve tasks")
		return
	}
	
	respondJSON(w, http.StatusOK, tasks)
}

// GetTask returns a specific task
func (api *API) GetTask(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(mux.Vars(r)["id"], 10, 64)
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid task ID")
		return
	}
	
	userID := extractUserID(r)
	task, err := api.taskService.GetTaskByID(id, userID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to retrieve task")
		return
	}
	
	if task == nil {
		respondError(w, http.StatusNotFound, "Task not found")
		return
	}
	
	respondJSON(w, http.StatusOK, task)
}

// CreateTask creates a new task
func (api *API) CreateTask(w http.ResponseWriter, r *http.Request) {
	userID := extractUserID(r)
	
	var input models.TaskInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}
	
	// Basic validation
	if input.Text == "" {
		respondError(w, http.StatusBadRequest, "Task text is required")
		return
	}
	
	task, err := api.taskService.CreateTask(&input, userID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to create task")
		return
	}
	
	respondJSON(w, http.StatusCreated, task)
}

// UpdateTask updates an existing task
func (api *API) UpdateTask(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(mux.Vars(r)["id"], 10, 64)
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid task ID")
		return
	}
	
	userID := extractUserID(r)
	
	var input models.TaskInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}
	
	// Basic validation
	if input.Text == "" {
		respondError(w, http.StatusBadRequest, "Task text is required")
		return
	}
	
	task, err := api.taskService.UpdateTask(id, &input, userID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to update task: "+err.Error())
		return
	}
	
	respondJSON(w, http.StatusOK, task)
}

// DeleteTask deletes a task
func (api *API) DeleteTask(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(mux.Vars(r)["id"], 10, 64)
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid task ID")
		return
	}
	
	userID := extractUserID(r)
	
	if err := api.taskService.DeleteTask(id, userID); err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to delete task: "+err.Error())
		return
	}
	
	respondJSON(w, http.StatusNoContent, nil)
}

// Helper functions

// extractUserID extracts user ID from request context
func extractUserID(r *http.Request) int64 {
	userID, ok := r.Context().Value("userID").(int64)
	if !ok {
		return 0 // No user ID or not authenticated
	}
	return userID
}

// respondJSON sends a JSON response
func respondJSON(w http.ResponseWriter, status int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	
	if payload != nil {
		// Marshal the JSON response carefully
		jsonBytes, err := json.Marshal(payload)
		if err != nil {
			// If we can't marshal the response payload, send a simple error
			log.Printf("Error marshaling JSON response: %v", err)
			http.Error(w, `{"error":"Internal server error - unable to generate response"}`, http.StatusInternalServerError)
			return
		}
		
		// Write the JSON bytes directly
		_, err = w.Write(jsonBytes)
		if err != nil {
			log.Printf("Error writing response: %v", err)
			// Can't do much here since we've already started writing the response
		}
	}
}

// respondError sends an error response
func respondError(w http.ResponseWriter, code int, message string) {
	respondJSON(w, code, map[string]string{"error": message})
}

// getNowFormatted returns the current time formatted
func getNowFormatted() string {
	return time.Now().Format(time.RFC3339)
}

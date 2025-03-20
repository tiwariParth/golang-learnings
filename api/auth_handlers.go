package api

import (
	"encoding/json"
	"net/http"

	"github.com/bongo/golang-learnings/models"
)

// Register handles user registration
func (api *API) Register(w http.ResponseWriter, r *http.Request) {
	var input models.UserInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}
	
	// Basic validation
	if input.Username == "" || input.Email == "" || input.Password == "" {
		respondError(w, http.StatusBadRequest, "Username, email, and password are required")
		return
	}
	
	// Register the user using auth service
	user, err := api.authService.RegisterUser(&input)
	if err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}
	
	// Generate JWT token
	token, err := api.authService.GenerateToken(user)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to generate token")
		return
	}
	
	// Return the token and user info
	respondJSON(w, http.StatusCreated, models.AuthResponse{
		Token: token,
		User:  *user,
	})
}

// Login handles user login
func (api *API) Login(w http.ResponseWriter, r *http.Request) {
	var input models.UserInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}
	
	// Authenticate the user
	user, err := api.authService.LoginUser(&input)
	if err != nil {
		respondError(w, http.StatusUnauthorized, err.Error())
		return
	}
	
	// Generate JWT token
	token, err := api.authService.GenerateToken(user)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to generate token")
		return
	}
	
	// Return the token and user info
	respondJSON(w, http.StatusOK, models.AuthResponse{
		Token: token,
		User:  *user,
	})
}

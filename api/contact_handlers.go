package api

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"

	"github.com/bongo/golang-learnings/models"
)

// SubmitContact handles contact form submissions
func (api *API) SubmitContact(w http.ResponseWriter, r *http.Request) {
	// Read and log the request body for debugging
	bodyBytes, err := ioutil.ReadAll(r.Body)
	if err != nil {
		log.Printf("Error reading request body: %v", err)
		respondError(w, http.StatusBadRequest, "Invalid request format")
		return
	}
	
	// Log the raw request for debugging
	log.Printf("Received contact form submission: %s", string(bodyBytes))
	
	// Parse the JSON
	var input models.ContactInput
	if err := json.Unmarshal(bodyBytes, &input); err != nil {
		log.Printf("Error parsing JSON: %v", err)
		respondError(w, http.StatusBadRequest, "Invalid JSON format: " + err.Error())
		return
	}
	
	// Validate the input
	if input.Name == "" || input.Email == "" || input.Message == "" {
		respondError(w, http.StatusBadRequest, "All fields are required")
		return
	}
	
	// Submit the contact form
	contact, err := api.contactService.SubmitContactForm(&input)
	if err != nil {
		log.Printf("Error submitting contact form: %v", err)
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}
	
	// Return success response
	respondJSON(w, http.StatusCreated, map[string]interface{}{
		"message": "Thank you for your message! We'll get back to you soon.",
		"contact": contact,
	})
}

package services

import (
	"errors"
	"net/mail"
	"strings"
	"time"

	"github.com/bongo/golang-learnings/models"
	"gorm.io/gorm"
)

type ContactService struct {
	db *gorm.DB
}

func NewContactService(db *gorm.DB) *ContactService {
	return &ContactService{
		db: db,
	}
}

// SubmitContactForm validates and stores a contact form submission
func (s *ContactService) SubmitContactForm(input *models.ContactInput) (*models.Contact, error) {
	// Validate input
	if err := validateContactInput(input); err != nil {
		return nil, err
	}

	// Create contact entry
	contact := &models.Contact{
		Name:      input.Name,
		Email:     input.Email,
		Message:   input.Message,
		ID:        time.Now().UnixNano(),
		CreatedAt: time.Now(),
	}

	// Save to database
	if err := s.db.Create(contact).Error; err != nil {
		return nil, err
	}

	return contact, nil
}

// validateContactInput validates contact form data
func validateContactInput(input *models.ContactInput) error {
	// Check if any required field is empty
	if strings.TrimSpace(input.Name) == "" {
		return errors.New("name is required")
	}
	if strings.TrimSpace(input.Email) == "" {
		return errors.New("email is required")
	}
	if strings.TrimSpace(input.Message) == "" {
		return errors.New("message is required")
	}

	// Validate email format
	_, err := mail.ParseAddress(input.Email)
	if err != nil {
		return errors.New("invalid email format")
	}

	// Validate message length
	if len(input.Message) < 10 {
		return errors.New("message must be at least 10 characters long")
	}

	return nil
}

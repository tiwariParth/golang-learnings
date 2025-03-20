package db

import (
	"github.com/bongo/golang-learnings/models"
	"gorm.io/gorm"
)

// ContactRepository handles database operations for contact messages
type ContactRepository struct {
	DB *gorm.DB
}

// NewContactRepository creates a new contact repository
func NewContactRepository(db *gorm.DB) *ContactRepository {
	return &ContactRepository{DB: db}
}

// Create stores a new contact form submission
func (r *ContactRepository) Create(contact *models.Contact) error {
	return r.DB.Create(contact).Error
}

// GetAll retrieves all contact form submissions
func (r *ContactRepository) GetAll() ([]models.Contact, error) {
	var contacts []models.Contact
	if err := r.DB.Order("created_at desc").Find(&contacts).Error; err != nil {
		return nil, err
	}
	return contacts, nil
}

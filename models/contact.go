package models

import (
	"time"
)

// Contact represents a contact form submission
type Contact struct {
	ID        int64     `json:"id" gorm:"primaryKey"`
	Name      string    `json:"name" gorm:"not null"`
	Email     string    `json:"email" gorm:"not null"`
	Message   string    `json:"message" gorm:"not null;type:text"`
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
}

// ContactInput represents the data submitted through the contact form
type ContactInput struct {
	Name    string `json:"name"`
	Email   string `json:"email"`
	Message string `json:"message"`
}

package models

import (
	"time"
)

// User represents a user in our system
type User struct {
	ID        int64     `json:"id" gorm:"primaryKey"`
	Username  string    `json:"username" gorm:"uniqueIndex;not null"`
	Email     string    `json:"email" gorm:"uniqueIndex;not null"`
	Password  string    `json:"-" gorm:"not null"` // Never expose password in JSON
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

// UserInput represents user registration/login data
type UserInput struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

// AuthResponse represents the authentication response with token
type AuthResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

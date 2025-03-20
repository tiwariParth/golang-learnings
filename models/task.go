package models

import (
	"time"
)

// Task represents a task in our application
type Task struct {
	ID          int64     `json:"id" gorm:"primaryKey"`
	Text        string    `json:"text" gorm:"not null"`
	Completed   bool      `json:"completed" gorm:"default:false"`
	CreatedAt   time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt   time.Time `json:"updated_at" gorm:"autoUpdateTime"`
	UserID      int64     `json:"user_id,omitempty" gorm:"index"`
}

// TaskInput represents the data needed to create or update a task
type TaskInput struct {
	Text      string `json:"text"`
	Completed bool   `json:"completed"`
}

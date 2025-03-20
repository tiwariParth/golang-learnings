package db

import (
	"errors"

	"github.com/bongo/golang-learnings/models"
	"gorm.io/gorm"
)

// TaskRepository handles database operations for tasks
type TaskRepository struct {
	DB *gorm.DB
}

// NewTaskRepository creates a new task repository
func NewTaskRepository(db *gorm.DB) *TaskRepository {
	return &TaskRepository{DB: db}
}

// GetAll retrieves all tasks, optionally filtered by user ID
func (r *TaskRepository) GetAll(userID int64) ([]models.Task, error) {
	var tasks []models.Task
	
	query := r.DB
	if userID > 0 {
		query = query.Where("user_id = ?", userID)
	}
	
	if err := query.Find(&tasks).Error; err != nil {
		return nil, err
	}
	
	return tasks, nil
}

// GetByID retrieves a task by ID
func (r *TaskRepository) GetByID(id int64) (*models.Task, error) {
	var task models.Task
	if err := r.DB.First(&task, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil // Return nil, nil when not found
		}
		return nil, err
	}
	return &task, nil
}

// Create creates a new task
func (r *TaskRepository) Create(task *models.Task) error {
	return r.DB.Create(task).Error
}

// Update updates an existing task
func (r *TaskRepository) Update(task *models.Task) error {
	return r.DB.Save(task).Error
}

// Delete deletes a task by ID
func (r *TaskRepository) Delete(id int64) error {
	return r.DB.Delete(&models.Task{}, id).Error
}

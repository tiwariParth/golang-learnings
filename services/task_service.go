package services

import (
	"errors"
	"time"

	"github.com/bongo/golang-learnings/models"
	"gorm.io/gorm"
)

type TaskService struct {
	db *gorm.DB
}

func NewTaskService(db *gorm.DB) *TaskService {
	return &TaskService{
		db: db,
	}
}

// GetAllTasks retrieves all tasks for a user
func (s *TaskService) GetAllTasks(userID int64) ([]models.Task, error) {
	var tasks []models.Task
	
	query := s.db
	if userID > 0 {
		query = query.Where("user_id = ?", userID)
	}
	
	if err := query.Find(&tasks).Error; err != nil {
		return nil, err
	}
	
	return tasks, nil
}

// GetTaskByID retrieves a specific task
func (s *TaskService) GetTaskByID(id int64, userID int64) (*models.Task, error) {
	var task models.Task
	
	query := s.db
	if userID > 0 {
		query = query.Where("user_id = ?", userID)
	}
	
	if err := query.First(&task, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	
	return &task, nil
}

// CreateTask creates a new task
func (s *TaskService) CreateTask(input *models.TaskInput, userID int64) (*models.Task, error) {
	task := &models.Task{
		Text:      input.Text,
		Completed: input.Completed,
		UserID:    userID,
		ID:        time.Now().UnixNano(),
	}
	
	if err := s.db.Create(task).Error; err != nil {
		return nil, err
	}
	
	return task, nil
}

// UpdateTask updates an existing task
func (s *TaskService) UpdateTask(id int64, input *models.TaskInput, userID int64) (*models.Task, error) {
	// Get the existing task
	var task models.Task
	
	query := s.db
	if userID > 0 {
		query = query.Where("user_id = ?", userID)
	}
	
	if err := query.First(&task, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// Create new task if it doesn't exist
			return s.CreateTask(input, userID)
		}
		return nil, err
	}
	
	// Update the task
	task.Text = input.Text
	task.Completed = input.Completed
	
	if err := s.db.Save(&task).Error; err != nil {
		return nil, err
	}
	
	return &task, nil
}

// DeleteTask deletes a task
func (s *TaskService) DeleteTask(id int64, userID int64) error {
	query := s.db
	if userID > 0 {
		query = query.Where("user_id = ?", userID)
	}
	
	result := query.Delete(&models.Task{}, id)
	if result.Error != nil {
		return result.Error
	}
	
	// If no rows were affected, the task might not exist or not belong to the user
	if result.RowsAffected == 0 {
		return errors.New("task not found or not owned by user")
	}
	
	return nil
}

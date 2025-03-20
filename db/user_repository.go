package db

import (
	"errors"

	"github.com/bongo/golang-learnings/models"
	"gorm.io/gorm"
)

// UserRepository handles database operations for users
type UserRepository struct {
	DB *gorm.DB
}

// NewUserRepository creates a new user repository
func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{DB: db}
}

// GetByID retrieves a user by ID
func (r *UserRepository) GetByID(id int64) (*models.User, error) {
	var user models.User
	if err := r.DB.First(&user, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

// GetByUsername retrieves a user by username
func (r *UserRepository) GetByUsername(username string) (*models.User, error) {
	var user models.User
	if err := r.DB.Where("username = ?", username).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

// GetByEmail retrieves a user by email
func (r *UserRepository) GetByEmail(email string) (*models.User, error) {
	var user models.User
	if err := r.DB.Where("email = ?", email).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

// Create creates a new user
func (r *UserRepository) Create(user *models.User) error {
	return r.DB.Create(user).Error
}

// Update updates an existing user
func (r *UserRepository) Update(user *models.User) error {
	return r.DB.Save(user).Error
}

// Delete deletes a user
func (r *UserRepository) Delete(id int64) error {
	return r.DB.Delete(&models.User{}, id).Error
}

// Exists checks if a user exists by username or email
func (r *UserRepository) Exists(username, email string) (bool, error) {
	var count int64
	err := r.DB.Model(&models.User{}).Where("username = ? OR email = ?", username, email).Count(&count).Error
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

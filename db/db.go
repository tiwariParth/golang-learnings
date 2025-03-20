package db

import (
	"log"

	"github.com/bongo/golang-learnings/models"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// InitDB initializes the database connection and performs migrations
func InitDB(dbURL string) (*gorm.DB, error) {
	// Configure GORM
	config := &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	}

	// Connect to database
	db, err := gorm.Open(sqlite.Open(dbURL), config)
	if err != nil {
		return nil, err
	}

	// Migrate the schema
	err = db.AutoMigrate(&models.Task{}, &models.User{}, &models.Contact{})
	if err != nil {
		return nil, err
	}

	log.Println("Database migration completed")
	return db, nil
}

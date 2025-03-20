package config

import (
	"errors"
	"os"
	"path/filepath"

	"github.com/joho/godotenv"
)

// Config holds all application configuration
type Config struct {
	Port        string
	StaticDir   string
	LogLevel    string
	DatabaseURL string
	JWTSecret   string
	Environment string
}

// Load reads configuration from .env file and environment variables
func Load() (*Config, error) {
	// Load .env file if it exists
	_ = godotenv.Load()

	// Get configuration from environment variables with defaults
	cfg := &Config{
		Port:        getEnv("PORT", "3000"),
		StaticDir:   getEnv("STATIC_DIR", "./static"),
		LogLevel:    getEnv("LOG_LEVEL", "info"),
		DatabaseURL: getEnv("DATABASE_URL", "file:./tasks.db"),
		JWTSecret:   getEnv("JWT_SECRET", "your-secret-key"),
		Environment: getEnv("ENVIRONMENT", "development"),
	}

	// Validate configuration
	if err := validateConfig(cfg); err != nil {
		return nil, err
	}

	return cfg, nil
}

// getEnv gets environment variable or returns default value
func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}

// validateConfig validates essential configuration parameters
func validateConfig(cfg *Config) error {
	// Verify the static directory exists
	if _, err := os.Stat(cfg.StaticDir); os.IsNotExist(err) {
		return errors.New("static directory does not exist: " + cfg.StaticDir)
	}

	// Absolute path for logging
	absPath, err := filepath.Abs(cfg.StaticDir)
	if err != nil {
		return errors.New("couldn't resolve absolute path: " + err.Error())
	}
	cfg.StaticDir = absPath

	return nil
}

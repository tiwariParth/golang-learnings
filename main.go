package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/bongo/golang-learnings/api"
	"github.com/bongo/golang-learnings/config"
	"github.com/bongo/golang-learnings/db"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Setup logging
	logFile := setupLogging(cfg.LogLevel)
	defer logFile.Close()

	// Initialize database
	database, err := db.InitDB(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Initialize repositories
	taskRepo := db.NewTaskRepository(database)
	userRepo := db.NewUserRepository(database)
	contactRepo := db.NewContactRepository(database)

	// Create and configure the server
	server := api.NewServer(cfg, taskRepo, userRepo, contactRepo)

	// Start server in a goroutine
	go func() {
		log.Printf("Server started on http://localhost:%s", cfg.Port)
		log.Printf("Serving files from: %s", cfg.StaticDir)
		log.Printf("Environment: %s", cfg.Environment)

		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Error starting server: %v", err)
		}
	}()

	// Setup graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Server shutting down...")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Server exited properly")
}

// setupLogging configures application logging to file and console
func setupLogging(logLevel string) *os.File {
	logFile, err := os.OpenFile("server.log", os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0666)
	if err != nil {
		log.Fatalf("Error opening log file: %v", err)
	}

	// Write logs to both file and console
	log.SetOutput(logFile)
	log.SetFlags(log.LstdFlags | log.Lshortfile)
	return logFile
}
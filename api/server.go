package api

import (
	"log"
	"net/http"
	"time"

	"github.com/bongo/golang-learnings/config"
	"github.com/bongo/golang-learnings/db"
	"github.com/bongo/golang-learnings/services"
	"github.com/gorilla/mux"
)

// Server represents the HTTP server
type Server struct {
	*http.Server
	router   *mux.Router
	taskRepo *db.TaskRepository
	config   *config.Config
}

// NewServer creates and configures a new HTTP server
func NewServer(cfg *config.Config, taskRepo *db.TaskRepository, userRepo *db.UserRepository, contactRepo *db.ContactRepository) *http.Server {
	router := mux.NewRouter()
	
	// Create services
	taskService := services.NewTaskService(taskRepo.DB)
	authService := services.NewAuthService(userRepo.DB, cfg.JWTSecret)
	contactService := services.NewContactService(contactRepo.DB)
	
	// Create API handler
	api := &API{
		taskService:    taskService,
		authService:    authService,
		contactService: contactService,
		config:         cfg,
	}
	
	// Set up routes
	
	// Public API routes
	apiRouter := router.PathPrefix("/api").Subrouter()
	apiRouter.HandleFunc("/health", api.HealthCheck).Methods("GET")
	
	// Auth routes - no auth required
	authRouter := apiRouter.PathPrefix("/auth").Subrouter()
	authRouter.HandleFunc("/register", api.Register).Methods("POST")
	authRouter.HandleFunc("/login", api.Login).Methods("POST")
	
	// Task routes - with optional authentication
	taskRouter := apiRouter.PathPrefix("/tasks").Subrouter()
	taskRouter.Use(api.optionalAuthMiddleware)
	
	taskRouter.HandleFunc("", api.GetTasks).Methods("GET")
	taskRouter.HandleFunc("", api.CreateTask).Methods("POST")
	taskRouter.HandleFunc("/{id:[0-9]+}", api.GetTask).Methods("GET")
	taskRouter.HandleFunc("/{id:[0-9]+}", api.UpdateTask).Methods("PUT")
	taskRouter.HandleFunc("/{id:[0-9]+}", api.DeleteTask).Methods("DELETE")
	
	// Contact form submission
	apiRouter.HandleFunc("/contact", api.SubmitContact).Methods("POST")
	
	// Serve static files
	router.PathPrefix("/").Handler(http.FileServer(http.Dir(cfg.StaticDir)))
	
	// Apply global middleware
	handler := logRequestMiddleware(router)
	
	// Create and configure the server
	server := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      handler,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}
	
	return server
}

// logRequestMiddleware logs all incoming requests
func logRequestMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		
		// Add request ID header
		requestID := time.Now().Format("20060102150405")
		w.Header().Set("X-Request-ID", requestID)
		
		// Process request
		next.ServeHTTP(w, r)
		
		// Log request details
		duration := time.Since(start)
		log.Printf("[%s] %s %s %s - Completed in %v", 
			requestID, 
			r.Method, 
			r.URL.Path, 
			r.RemoteAddr, 
			duration)
	})
}

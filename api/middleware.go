package api

import (
	"context"
	"log"
	"net/http"
	"strings"
	"time"
)

// requestLoggerMiddleware logs all incoming requests
func requestLoggerMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		
		// Add request ID
		requestID := time.Now().Format("20060102150405")
		ctx := context.WithValue(r.Context(), "requestID", requestID)
		r = r.WithContext(ctx)
		
		// Process request
		next.ServeHTTP(w, r)
		
		// Log request details
		duration := time.Since(start)
		log.Printf("[%s] %s %s %s - %v", requestID, r.Method, r.URL.Path, r.RemoteAddr, duration)
	})
}

// authMiddleware validates JWT tokens and injects user ID into request context
func (api *API) authMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Get token from Authorization header
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			// No token, continue as unauthenticated
			next.ServeHTTP(w, r)
			return
		}
		
		// Format: "Bearer <token>"
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			respondError(w, http.StatusUnauthorized, "Invalid authorization header format")
			return
		}
		
		tokenString := parts[1]
		
		// Validate token
		userID, err := api.authService.ValidateToken(tokenString)
		if err != nil {
			respondError(w, http.StatusUnauthorized, "Invalid or expired token")
			return
		}
		
		// Add user ID to request context
		ctx := context.WithValue(r.Context(), "userID", userID)
		
		// Continue with the authenticated request
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// optionalAuthMiddleware validates JWT tokens if present but doesn't require them
func (api *API) optionalAuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Get token from Authorization header
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			// No token, continue as unauthenticated
			next.ServeHTTP(w, r)
			return
		}
		
		// Format: "Bearer <token>"
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			// Invalid format, continue as unauthenticated
			next.ServeHTTP(w, r)
			return
		}
		
		tokenString := parts[1]
		
		// Validate token
		userID, err := api.authService.ValidateToken(tokenString)
		if err != nil {
			// Invalid token, continue as unauthenticated
			next.ServeHTTP(w, r)
			return
		}
		
		// Add user ID to request context
		ctx := context.WithValue(r.Context(), "userID", userID)
		
		// Continue with the authenticated request
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

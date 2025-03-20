package services

import (
	"errors"
	"fmt"
	"time"

	"github.com/bongo/golang-learnings/models"
	"github.com/dgrijalva/jwt-go"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type AuthService struct {
	db        *gorm.DB
	jwtSecret string
}

func NewAuthService(db *gorm.DB, jwtSecret string) *AuthService {
	return &AuthService{
		db:        db,
		jwtSecret: jwtSecret,
	}
}

// GenerateToken creates a new JWT token for a user
func (s *AuthService) GenerateToken(user *models.User) (string, error) {
	// Set token expiration to 24 hours
	expirationTime := time.Now().Add(24 * time.Hour)
	
	// Create the JWT claims
	claims := jwt.MapClaims{
		"user_id":  user.ID,
		"username": user.Username,
		"exp":      expirationTime.Unix(),
	}
	
	// Create token with claims
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	
	// Generate the signed token
	tokenString, err := token.SignedString([]byte(s.jwtSecret))
	if err != nil {
		return "", err
	}
	
	return tokenString, nil
}

// ValidateToken validates a JWT token and returns the user ID
func (s *AuthService) ValidateToken(tokenString string) (int64, error) {
	// Parse the token
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// Validate the signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(s.jwtSecret), nil
	})
	
	if err != nil {
		return 0, err
	}
	
	// Validate the token claims
	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		// Check token expiration
		if float64(time.Now().Unix()) > claims["exp"].(float64) {
			return 0, errors.New("token expired")
		}
		
		// Extract user ID
		userId := int64(claims["user_id"].(float64))
		return userId, nil
	}
	
	return 0, errors.New("invalid token")
}

// RegisterUser creates a new user account
func (s *AuthService) RegisterUser(input *models.UserInput) (*models.User, error) {
	// Check if username or email already exists
	var existingUser models.User
	result := s.db.Where("username = ? OR email = ?", input.Username, input.Email).First(&existingUser)
	if result.Error == nil {
		return nil, errors.New("username or email already exists")
	} else if !errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return nil, result.Error
	}
	
	// Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}
	
	// Create new user
	user := &models.User{
		Username: input.Username,
		Email:    input.Email,
		Password: string(hashedPassword),
		ID:       time.Now().UnixNano(),
	}
	
	// Save user to database
	if err := s.db.Create(user).Error; err != nil {
		return nil, err
	}
	
	return user, nil
}

// LoginUser authenticates a user and returns the user if successful
func (s *AuthService) LoginUser(input *models.UserInput) (*models.User, error) {
	var user models.User
	
	// Find user by username or email
	if err := s.db.Where("username = ? OR email = ?", input.Username, input.Email).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("invalid username or password")
		}
		return nil, err
	}
	
	// Compare the stored hashed password with the provided password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		return nil, errors.New("invalid username or password")
	}
	
	return &user, nil
}

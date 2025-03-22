#!/bin/bash

echo "Setting up project environment..."

# Check if Go is installed
if ! command -v go &> /dev/null; then
    echo "Go is not installed. Please install Go before continuing."
    exit 1
fi

# Check if .env file exists, create if not
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << EOL
# Server configuration
PORT=3000
STATIC_DIR=./static
LOG_LEVEL=info

# Database configuration
DATABASE_URL=file:./tasks.db

# Authentication
JWT_SECRET=your-secret-key-change-this-in-production

# Environment (development, test, production)
ENVIRONMENT=development
EOL
    echo ".env file created with default values. Please edit as needed."
fi

# Download dependencies
echo "Downloading dependencies..."
go mod download

# Create the static directory if it doesn't exist
if [ ! -d "static" ]; then
    echo "Creating static directory..."
    mkdir -p static
fi

echo "Environment setup completed successfully!"
echo "Run 'go run main.go' to start the application."

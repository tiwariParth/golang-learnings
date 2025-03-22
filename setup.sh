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
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=postgres
DB_HOST=localhost
DB_PORT=5432
API_PORT=8080
EOL
    echo ".env file created with default values. Please edit as needed."
fi

# Download dependencies
echo "Downloading dependencies..."
go mod download

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "PostgreSQL is not installed. Please install PostgreSQL before continuing."
    echo "Setup incomplete."
    exit 1
fi

echo "Environment setup completed successfully!"
echo "Make sure to configure your database and update the .env file accordingly."
echo "Run 'go run main.go' to start the application."

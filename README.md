# Neon Task Manager

A beautiful, multi-tier task management application built with Go and modern web technologies.

## Architecture

This application follows a multi-tier architecture:

1. **Presentation Layer**: Frontend UI built with HTML, CSS, and JavaScript
2. **API Layer**: RESTful API endpoints built with Go using the Gorilla Mux router
3. **Service Layer**: Business logic layer handling authentication and task management
4. **Data Access Layer**: Repository pattern for database operations
5. **Database Layer**: SQLite database using GORM ORM

## Features

- User authentication with JWT
- Create, read, update, and delete tasks
- Mark tasks as complete
- Dark/light theme toggle
- Responsive design
- Graceful error handling
- Local storage fallback when offline

## Getting Started

### Prerequisites

- Go 1.18+
- SQLite3

### Installation

1. Clone the repository
2. Install dependencies:

```bash
go mod download
```

3. Create a `.env` file (use the provided example as a template)
4. Run the application:

```bash
go run main.go
```

5. Open your browser and navigate to `http://localhost:3000`

## Running with Docker

### Prerequisites

- Docker
- Docker Compose

### Steps to Run with Docker

1. Create an `.env.docker` file from the example:

```bash
# Copy the example file
cp .env.example .env.docker

# Edit the file to set your JWT secret
# Make sure to change the JWT_SECRET value
nano .env.docker
```

2. Build and start the container:

```bash
docker-compose up -d
```

3. The application will be available at http://localhost:3000

4. View logs:

```bash
docker-compose logs -f
```

5. Stop the container:

```bash
docker-compose down
```

### Docker Volume

The application uses a Docker volume named `task-data` to persist the SQLite database. This ensures your data remains even if you rebuild or restart the container.

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user

### Tasks

- `GET /api/tasks` - Get all tasks for the authenticated user
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/{id}` - Get a specific task
- `PUT /api/tasks/{id}` - Update a task
- `DELETE /api/tasks/{id}` - Delete a task

### Miscellaneous

- `GET /api/health` - Health check endpoint

## Project Structure

```
golang-learnings/
├── api/               # API handlers and middleware
├── config/            # Configuration handling
├── db/                # Database connection and repositories
├── models/            # Data models
├── services/          # Business logic
├── static/            # Static frontend files
│   ├── auth.css
│   ├── auth.js
│   ├── index.html
│   ├── logo.svg
│   ├── script.js
│   └── styles.css
├── .env               # Environment variables
├── go.mod             # Go module definition
├── go.sum             # Go module checksums
├── main.go            # Application entry point
└── README.md          # Project documentation
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

# Project Setup Guide

This guide will help you set up the project environment from scratch.

## Prerequisites

1. **Go** (version 1.20 or higher)
2. **PostgreSQL** (version 13 or higher)
3. **Git**

## Setup Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd <project-directory>
```

### 2. Environment Variables

Create a `.env` file in the root directory with the following variables:

```
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=your_db_name
DB_HOST=localhost
DB_PORT=5432
API_PORT=8080
```

Make sure to update the values to match your database configuration.

### 3. Install Dependencies

```bash
go mod download
```

### 4. Database Setup

- Install PostgreSQL if not already installed
- Create a new database with the name defined in your `.env` file
- The application will automatically create necessary tables on startup

### 5. Run the Application

```bash
go run main.go
```

## Development Tools

- To generate swagger documentation: `swag init`
- To test API endpoints: Use tools like Postman or cURL

## Project Structure

- `/controller`: Contains API route handlers
- `/docs`: Swagger documentation
- `/database`: Database initialization and models
- `/middleware`: Authentication and request middleware
- `/repository`: Data access layer
- `/service`: Business logic
- `/util`: Helper functions and utilities

## Troubleshooting

If you encounter any issues during setup:

1. Ensure PostgreSQL service is running
2. Check that environment variables are correctly set
3. Verify that Go modules can be downloaded (might require setting GOPROXY)

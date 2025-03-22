# Stage 1: Build the application
FROM golang:1.20-bullseye AS builder

# Set working directory
WORKDIR /app

# Install build dependencies for SQLite
RUN apt-get update && apt-get install -y \
    gcc \
    libc6-dev \
    sqlite3 \
    libsqlite3-dev

# Copy go mod and sum files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the application with CGO enabled (required for SQLite)
RUN CGO_ENABLED=1 GOOS=linux go build \
    -ldflags="-w -s \
    -X 'main.BuildTime=2025-03-22 12:56:40' \
    -X 'main.BuildUser=tiwariParth'" \
    -o main .

# Stage 2: Create the final image
FROM debian:bullseye-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Create a non-root user
RUN useradd -m -s /bin/bash appuser

# Copy the binary from builder stage
COPY --from=builder /app/main .

# Copy static files
COPY --from=builder /app/static ./static

# Set default environment variables
ENV PORT=3000 \
    STATIC_DIR=./static \
    DATABASE_URL=file:./tasks.db \
    ENVIRONMENT=production

# Create and set proper permissions for the database directory
RUN mkdir -p /app/data && \
    chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose the application port
EXPOSE ${PORT}

# Command to run the application
CMD ["./main"]
# Use Go 1.24.2 as per our toolchain
FROM golang:1.24.2

WORKDIR /app

# Copy go.mod and go.sum first for better caching
COPY go.mod go.sum ./
RUN go mod download

# Copy the source code and required directories
COPY . .

# Build the application
RUN go build -o fi-mcp-server

# Expose port 8080
EXPOSE 8080

# Set environment variable
ENV FI_MCP_PORT=8080

# Run the server
CMD ["./fi-mcp-server"]

#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Environment variables
ENV=${1:-development}
TAG=${2:-latest}

# Configuration
case $ENV in
    "development")
        MONGODB_URI="mongodb://localhost:27017/wishdb"
        API_URL="http://localhost:3001"
        ;;
    "staging")
        MONGODB_URI="mongodb://mongodb-staging:27017/wishdb"
        API_URL="https://api-staging.example.com"
        ;;
    "production")
        MONGODB_URI="mongodb://mongodb-prod:27017/wishdb"
        API_URL="https://api.example.com"
        ;;
    *)
        echo -e "${RED}Invalid environment: $ENV${NC}"
        exit 1
        ;;
esac

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"
for cmd in docker docker-compose node npm; do
    if ! command_exists "$cmd"; then
        echo -e "${RED}$cmd is required but not installed.${NC}"
        exit 1
    fi
done

# Function to handle errors
handle_error() {
    echo -e "${RED}Error: $1${NC}"
    exit 1
}

# Build stage
echo -e "${YELLOW}Building for $ENV environment...${NC}"
docker-compose build \
    --build-arg NODE_ENV=$ENV \
    --build-arg API_URL=$API_URL \
    || handle_error "Build failed"

# Test stage
if [ "$ENV" != "production" ]; then
    echo -e "${YELLOW}Running tests...${NC}"
    
    echo "Starting containers for testing..."
    docker-compose up -d

    echo "Waiting for services to be ready..."
    timeout 30 bash -c 'while [[ "$(curl -s -o /dev/null -w ''%{http_code}'' localhost:3001/health)" != "200" ]]; do sleep 1; done' \
        || handle_error "Backend service failed to start"
    
    echo "Running backend tests..."
    docker-compose exec -T backend npm run test \
        || handle_error "Backend tests failed"
    
    echo "Running frontend tests..."
    docker-compose exec -T frontend npm run test \
        || handle_error "Frontend tests failed"
    
    echo "Running E2E tests..."
    docker-compose exec -T frontend npm run test:e2e \
        || handle_error "E2E tests failed"
    
    echo "Running security scan..."
    docker-compose exec -T backend npm run security-scan \
        || handle_error "Security scan failed"
    
    echo "Stopping test containers..."
    docker-compose down
fi

# Tag images
echo -e "${YELLOW}Tagging images...${NC}"
docker tag wish-frontend:latest ghcr.io/yourusername/wish-frontend:$TAG
docker tag wish-backend:latest ghcr.io/yourusername/wish-backend:$TAG

# Push to registry if not development
if [ "$ENV" != "development" ]; then
    echo -e "${YELLOW}Pushing images to registry...${NC}"
    docker push ghcr.io/yourusername/wish-frontend:$TAG
    docker push ghcr.io/yourusername/wish-backend:$TAG
fi

# Deploy
echo -e "${YELLOW}Deploying to $ENV...${NC}"
case $ENV in
    "development")
        docker-compose up -d
        ;;
    "staging"|"production")
        # Here you would typically use kubectl for Kubernetes deployment
        # or other deployment tools for your specific infrastructure
        echo "Deploying to $ENV environment..."
        # kubectl apply -f k8s/$ENV/
        ;;
esac

# Verify deployment
echo -e "${YELLOW}Verifying deployment...${NC}"
case $ENV in
    "development")
        timeout 30 bash -c 'while [[ "$(curl -s -o /dev/null -w ''%{http_code}'' localhost:3001/health)" != "200" ]]; do sleep 1; done' \
            && echo -e "${GREEN}Backend health check passed${NC}" \
            || handle_error "Backend health check failed"
        
        timeout 30 bash -c 'while [[ "$(curl -s -o /dev/null -w ''%{http_code}'' localhost:3000)" != "200" ]]; do sleep 1; done' \
            && echo -e "${GREEN}Frontend health check passed${NC}" \
            || handle_error "Frontend health check failed"
        ;;
    "staging"|"production")
        # Add verification for staging/production environments
        echo "Verifying $ENV deployment..."
        # kubectl get pods | grep wish
        ;;
esac

# Post-deployment tasks
echo -e "${YELLOW}Running post-deployment tasks...${NC}"
case $ENV in
    "development")
        echo "No post-deployment tasks for development"
        ;;
    "staging")
        echo "Running smoke tests..."
        npm run test:smoke
        ;;
    "production")
        echo "Running performance tests..."
        npm run test:performance
        echo "Monitoring deployment..."
        npm run monitor
        ;;
esac

echo -e "${GREEN}Deployment to $ENV completed successfully!${NC}"

# Usage information
if [ "$ENV" = "development" ]; then
    echo -e "\n${GREEN}Application is running at:${NC}"
    echo "Frontend: http://localhost:3000"
    echo "Backend:  http://localhost:3001"
    echo "API Docs: http://localhost:3001/api-docs"
    echo -e "\n${YELLOW}Available commands:${NC}"
    echo "docker-compose logs -f    # View logs"
    echo "docker-compose down       # Stop application"
    echo "docker-compose restart    # Restart services"
fi

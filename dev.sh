#!/bin/bash
# Portfolio Development Helper Script

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Portfolio Development Helper${NC}"
echo "=============================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}Docker not found. Please install Docker first.${NC}"
    exit 1
fi

# Menu
echo "Choose an option:"
echo "  1) Start dev server (hot reload)"
echo "  2) Start production preview"
echo "  3) Run tests"
echo "  4) Run linter"
echo "  5) Build production"
echo "  6) Interactive shell"
echo "  7) Clean up Docker resources"
echo "  8) Show running containers"
echo "  9) Stop all containers"
echo ""
read -p "Enter option (1-9): " option

case $option in
    1)
        echo -e "${GREEN}Starting development server...${NC}"
        echo -e "Access at: ${BLUE}http://localhost:3000${NC}"
        echo -e "Press Ctrl+C to stop"
        echo ""
        docker-compose up
        ;;
    2)
        echo -e "${GREEN}Starting production preview...${NC}"
        echo -e "Access at: ${BLUE}http://localhost:3001${NC}"
        docker-compose --profile prod up portfolio-prod
        ;;
    3)
        echo -e "${GREEN}Running tests...${NC}"
        docker run -it --rm \
            -v $(pwd):/app \
            -w /app \
            node:22-alpine \
            sh -c "npm ci && npm run test"
        ;;
    4)
        echo -e "${GREEN}Running linter...${NC}"
        docker run -it --rm \
            -v $(pwd):/app \
            -w /app \
            node:22-alpine \
            sh -c "npm ci && npm run lint"
        ;;
    5)
        echo -e "${GREEN}Building production site...${NC}"
        docker run -it --rm \
            -v $(pwd):/app \
            -w /app \
            node:22-alpine \
            sh -c "npm ci && npm run build"
        echo -e "${GREEN}Build complete! Output in ./out${NC}"
        ;;
    6)
        echo -e "${GREEN}Starting interactive shell...${NC}"
        echo -e "You're now inside the container. Type 'exit' to leave."
        docker run -it --rm \
            -v $(pwd):/app \
            -w /app \
            -p 3000:3000 \
            node:22-alpine \
            sh
        ;;
    7)
        echo -e "${YELLOW}Cleaning up Docker resources...${NC}"
        docker-compose down
        docker system prune -f
        echo -e "${GREEN}Cleanup complete!${NC}"
        ;;
    8)
        echo -e "${GREEN}Running containers:${NC}"
        docker ps
        ;;
    9)
        echo -e "${YELLOW}Stopping all containers...${NC}"
        docker-compose down
        echo -e "${GREEN}All containers stopped!${NC}"
        ;;
    *)
        echo -e "${YELLOW}Invalid option${NC}"
        exit 1
        ;;
esac

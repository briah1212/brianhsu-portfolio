#!/bin/bash
# Docker Setup Verification Script

echo "🐳 Docker Setup Verification"
echo "=============================="
echo ""

# Check Docker installation
echo "1. Checking Docker installation..."
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    echo "   ✅ Docker installed: $DOCKER_VERSION"
else
    echo "   ❌ Docker not found"
    echo "   Install from: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check Docker daemon
echo ""
echo "2. Checking Docker daemon..."
if docker info &> /dev/null; then
    echo "   ✅ Docker daemon is running"
else
    echo "   ❌ Docker daemon not running"
    echo "   Start Docker Desktop or run: sudo systemctl start docker"
    exit 1
fi

# Check Docker Compose
echo ""
echo "3. Checking Docker Compose..."
if docker compose version &> /dev/null; then
    COMPOSE_VERSION=$(docker compose version)
    echo "   ✅ Docker Compose installed: $COMPOSE_VERSION"
elif docker-compose --version &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version)
    echo "   ✅ Docker Compose installed: $COMPOSE_VERSION"
else
    echo "   ⚠️  Docker Compose not found (optional)"
fi

# Test Docker with hello-world
echo ""
echo "4. Testing Docker with hello-world..."
if docker run --rm hello-world &> /dev/null; then
    echo "   ✅ Docker is working correctly"
else
    echo "   ❌ Docker test failed"
    exit 1
fi

# Check port availability
echo ""
echo "5. Checking port availability..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "   ⚠️  Port 3000 is in use"
    echo "   Run: lsof -i :3000 to see what's using it"
else
    echo "   ✅ Port 3000 is available"
fi

# Check Node image
echo ""
echo "6. Checking Node.js Docker image..."
if docker images | grep -q "node.*22-alpine"; then
    echo "   ✅ Node.js 22 Alpine image found"
else
    echo "   ⚠️  Node.js 22 Alpine image not found"
    echo "   Pulling image..."
    docker pull node:22-alpine
    echo "   ✅ Image pulled successfully"
fi

# Summary
echo ""
echo "=============================="
echo "✅ Setup verification complete!"
echo ""
echo "Next steps:"
echo "1. Start dev server:    ./dev.sh"
echo "2. Or manually:         docker-compose up"
echo "3. Access site:         http://localhost:3000"
echo ""
echo "For port forwarding from SSH:"
echo "  ssh -L 3000:localhost:3000 user@your-ssh-machine"

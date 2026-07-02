# Docker Development Guide for Portfolio

## Quick Start (Once Docker is Installed)

### Method 1: Docker Compose (Easiest)

```bash
# Start development server
docker-compose up

# Access at http://localhost:3000
# Press Ctrl+C to stop
```

### Method 2: Docker CLI

```bash
# Build the image
docker build -t portfolio-dev .

# Run development server
docker run -it --rm \
  -p 3000:3000 \
  -v $(pwd)/src:/app/src \
  -v $(pwd)/public:/app/public \
  portfolio-dev

# Access at http://localhost:3000
```

---

## Port Forwarding from SSH to Your Local Machine

### Setup SSH Tunnel

On your **local machine** (Mac/Windows), run:

```bash
# Forward port 3000 from SSH machine to your local machine
ssh -L 3000:localhost:3000 brianhsu@your-ssh-machine.lanl.gov

# Keep this terminal open!
```

Then open browser: **http://localhost:3000**

### Advanced: Background SSH Tunnel

```bash
# Run in background
ssh -fN -L 3000:localhost:3000 brianhsu@your-ssh-machine.lanl.gov

# Check if running
ps aux | grep "ssh -fN"

# Kill tunnel when done
pkill -f "ssh -fN -L 3000"
```

---

## Development Workflows

### 1. Live Development with Hot Reload

```bash
# Start dev server with volume mounts
docker-compose up

# Edit files in src/
# Changes auto-reload in browser!
```

**What reloads automatically:**
- `src/**/*.tsx` - React components
- `src/**/*.ts` - TypeScript files
- `src/app/globals.css` - Styles
- `public/*` - Static assets

### 2. Test Production Build

```bash
# Build and preview production site
docker-compose --profile prod up portfolio-prod

# Access at http://localhost:3001
```

### 3. Run Tests in Docker

```bash
# Run unit tests
docker run -it --rm \
  -v $(pwd):/app \
  -w /app \
  node:22-alpine \
  sh -c "npm ci && npm run test"

# Run linter
docker run -it --rm \
  -v $(pwd):/app \
  -w /app \
  node:22-alpine \
  sh -c "npm ci && npm run lint"
```

### 4. Interactive Shell in Container

```bash
# Get a shell inside the container
docker run -it --rm \
  -v $(pwd):/app \
  -w /app \
  -p 3000:3000 \
  node:22-alpine \
  sh

# Now you're inside the container:
npm install
npm run dev
npm run test
npm run build
```

---

## Testing Your Terminal Changes

### Step-by-Step Test Plan

1. **Start dev server**
   ```bash
   docker-compose up
   ```

2. **Set up port forwarding** (on local machine)
   ```bash
   ssh -L 3000:localhost:3000 brianhsu@your-ssh-machine.lanl.gov
   ```

3. **Open browser**: http://localhost:3000

4. **Test terminal features:**

   **Tab Completion:**
   - Open Terminal app
   - Type `hel` + Tab → should complete to `help`
   - Type `open hp` + Tab → should complete to `open hpc-cluster`
   - Type `cd w` + Tab → should complete to `cd work`

   **Command History:**
   - Run commands: `ls folders`, `whoami`, `neofetch`
   - Press ↑ arrow → should show `neofetch`
   - Press ↑ again → should show `whoami`
   - Press ↓ → should go forward

   **New Commands:**
   ```
   ls folders          # List categories
   ls projects         # List all projects
   cd work             # Open Work folder
   cat hpc-cluster     # Preview project
   neofetch            # ASCII art + info
   changelog           # Version history
   pwd                 # Current directory
   sudo rm -rf /       # Easter egg
   ```

---

## Troubleshooting

### Container won't start
```bash
# Check if port 3000 is already in use
lsof -i :3000

# Kill process using port
kill -9 <PID>

# Or use different port
docker run -p 3001:3000 ...
```

### Changes not reflecting
```bash
# Rebuild image
docker-compose build --no-cache

# Restart container
docker-compose restart
```

### Permission issues
```bash
# Run as your user
docker run --user $(id -u):$(id -g) ...
```

### See container logs
```bash
# View logs
docker-compose logs -f

# Or for specific container
docker logs -f <container-id>
```

### Clean up
```bash
# Stop all containers
docker-compose down

# Remove images
docker rmi portfolio-dev

# Clean up Docker system
docker system prune -a
```

---

## Performance Tips

### Use Volume Mounts Wisely

```yaml
# Good: Mount only source directories
volumes:
  - ./src:/app/src
  - ./public:/app/public

# Bad: Mount entire directory (slow on Mac)
volumes:
  - .:/app
```

### Multi-stage Build for Production

```dockerfile
# Build stage
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:22-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/out ./out
EXPOSE 3000
CMD ["serve", "out", "-l", "3000"]
```

---

## GitHub Actions vs Docker (Comparison)

| Feature | GitHub Actions | Docker Local |
|---------|---------------|--------------|
| **Speed** | 2-5 min | Instant |
| **Feedback** | After push | Real-time |
| **Hot Reload** | ❌ | ✅ |
| **Testing** | Full CI/CD | Interactive |
| **Cost** | Free (GitHub) | Free (local) |

**Best Practice:** Use both!
- **Docker**: Rapid local development
- **GitHub Actions**: Final CI/CD validation

---

## Useful Docker Commands

```bash
# List running containers
docker ps

# Stop all containers
docker stop $(docker ps -q)

# Remove all containers
docker rm $(docker ps -aq)

# View images
docker images

# Remove unused images
docker image prune

# Check Docker resource usage
docker stats

# Execute command in running container
docker exec -it <container-id> sh
```

---

## Advanced: VS Code Remote - Containers

If you use VS Code, you can develop **inside** the container:

1. Install "Remote - Containers" extension
2. Create `.devcontainer/devcontainer.json`:

```json
{
  "name": "Portfolio Dev",
  "dockerComposeFile": "../docker-compose.yml",
  "service": "portfolio",
  "workspaceFolder": "/app",
  "forwardPorts": [3000],
  "customizations": {
    "vscode": {
      "extensions": [
        "dbaeumer.vscode-eslint",
        "bradlc.vscode-tailwindcss"
      ]
    }
  }
}
```

3. Open Command Palette → "Remote-Containers: Reopen in Container"

---

## Summary: Your Complete Workflow

```bash
# 1. On SSH machine: Start dev server
cd ~/brianhsu-portfolio
docker-compose up

# 2. On local machine: Create SSH tunnel
ssh -L 3000:localhost:3000 brianhsu@ssh-machine.lanl.gov

# 3. Open browser: http://localhost:3000

# 4. Edit code on SSH machine (vim/nano/VSCode Remote)
vim src/components/apps/TerminalApp.tsx

# 5. See changes instantly in browser!

# 6. When done: Stop container
docker-compose down
```

---

## Next Steps

Once Docker is installed, test it with:

```bash
# Verify Docker works
docker run hello-world

# Test with Node.js
docker run -it node:22-alpine node -v

# Start your portfolio
docker-compose up
```

Then you'll have instant feedback on all changes! 🚀

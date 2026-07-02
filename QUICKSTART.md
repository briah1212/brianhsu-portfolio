# Quick Start: Docker Development on SSH Machine

## 🎯 Goal
Run your portfolio on your LANL SSH machine (no local Node.js) and view it in your browser via port forwarding.

---

## 📋 Prerequisites

**On your SSH machine:**
- Docker installed (you're doing this now)
- Portfolio repo cloned

**On your local machine:**
- SSH access to your machine
- Web browser

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Verify Docker (on SSH machine)
```bash
cd ~/brianhsu-portfolio
./verify-docker.sh
```

This checks:
- ✅ Docker installed
- ✅ Docker daemon running
- ✅ Port 3000 available
- ✅ Node image ready

---

### Step 2: Start Dev Server (on SSH machine)

**Option A: Using helper script (easiest)**
```bash
./dev.sh
# Choose option 1: Start dev server
```

**Option B: Using docker-compose**
```bash
docker-compose up
```

**Option C: Using docker directly**
```bash
docker run -it --rm \
  -v $(pwd):/app \
  -w /app \
  -p 3000:3000 \
  node:22-alpine \
  sh -c "npm install && npm run dev"
```

You should see:
```
✓ Starting...
✓ Ready on http://localhost:3000
```

**Leave this terminal running!**

---

### Step 3: Port Forward (on LOCAL machine)

Open a **new terminal on your laptop** and run:

```bash
# Replace with your actual SSH details
ssh -L 3000:localhost:3000 brianhsu@pn2501748.lanl.gov

# Or if using SSH config:
ssh -L 3000:localhost:3000 lanl
```

**Keep this terminal open too!**

Now open your browser: **http://localhost:3000**

---

## 🎨 What You'll See

```
┌─────────────────┐         SSH Tunnel          ┌─────────────────┐
│  Your Laptop    │◄──────────────────────────►│  SSH Machine    │
│  Browser:3000   │   Port Forward 3000→3000   │  Docker:3000    │
│                 │                             │                 │
│  You see site   │                             │  Next.js runs   │
│  + hot reload   │                             │  + builds code  │
└─────────────────┘                             └─────────────────┘
```

---

## ✅ Test Your Terminal Enhancements

Once the site loads in your browser:

### 1. Open Terminal App
Click the Terminal icon in the dock

### 2. Test Tab Completion
```bash
# Type and press Tab
hel[TAB]           → help
open hp[TAB]       → open hpc-cluster
cd w[TAB]          → cd work
```

### 3. Test Command History
```bash
# Run some commands
ls folders
whoami
neofetch

# Press ↑ arrow multiple times
# Should cycle through: neofetch → whoami → ls folders
```

### 4. Test New Commands
```bash
ls folders          # List all categories (Academics, Work, etc.)
ls projects         # List all projects by category
cd work             # Opens Work folder window
cat hpc-cluster     # Preview project details
neofetch            # ASCII art with your info
changelog           # Version history
pwd                 # Shows /home/brian/portfolio
sudo rm -rf /       # Easter egg 😄
```

### 5. Test Hot Reload
- Edit a file: `vim src/components/apps/TerminalApp.tsx`
- Change welcome message on line 44
- Save file
- Browser auto-refreshes! ✨

---

## 🛠️ Common Commands

### Stop Dev Server
```bash
# In the docker-compose terminal
Ctrl+C

# Or from another terminal
docker-compose down
```

### Restart Dev Server
```bash
docker-compose restart
```

### See Logs
```bash
docker-compose logs -f
```

### Clean Up Everything
```bash
./dev.sh
# Choose option 7: Clean up
```

### Production Preview
```bash
docker-compose --profile prod up portfolio-prod
# Access at http://localhost:3001
```

---

## 🐛 Troubleshooting

### Port 3000 already in use
```bash
# Find what's using it
lsof -i :3000

# Kill it
kill -9 <PID>

# Or use different port
docker run -p 3001:3000 ...
# Then forward 3001 instead
```

### SSH tunnel not working
```bash
# Check SSH connection
ssh brianhsu@pn2501748.lanl.gov

# Try verbose SSH
ssh -v -L 3000:localhost:3000 brianhsu@pn2501748.lanl.gov
```

### Changes not showing
```bash
# Hard restart
docker-compose down
docker-compose up --build
```

### Docker daemon not running
```bash
# Start Docker daemon
sudo systemctl start docker

# Or on macOS
open -a Docker
```

---

## 📚 Files Created for You

```
brianhsu-portfolio/
├── Dockerfile              # Container definition
├── docker-compose.yml      # Easy orchestration
├── .dockerignore          # Optimize builds
├── DOCKER.md              # Full documentation
├── dev.sh                 # Interactive helper
└── verify-docker.sh       # Setup checker
```

---

## 🎯 Your Complete Workflow

```bash
┌───────────────────────────────────────────┐
│ 1. SSH Machine                            │
├───────────────────────────────────────────┤
│   cd ~/brianhsu-portfolio                 │
│   docker-compose up                       │
│   # Leave running                         │
└───────────────────────────────────────────┘

┌───────────────────────────────────────────┐
│ 2. Local Machine                          │
├───────────────────────────────────────────┤
│   ssh -L 3000:localhost:3000 lanl         │
│   # Keep open                             │
└───────────────────────────────────────────┘

┌───────────────────────────────────────────┐
│ 3. Local Browser                          │
├───────────────────────────────────────────┤
│   http://localhost:3000                   │
│   # Test everything!                      │
└───────────────────────────────────────────┘

┌───────────────────────────────────────────┐
│ 4. Edit Code (SSH Machine)                │
├───────────────────────────────────────────┤
│   vim src/components/apps/TerminalApp.tsx │
│   # Changes auto-reload in browser!       │
└───────────────────────────────────────────┘
```

---

## 🚀 Next Steps After Testing Terminal

Once you verify the terminal works, we can add more features:

1. **Rustic Design Tokens** - PostHog-inspired warm colors
2. **Illustrated Project Cards** - Upgrade from list to tiles
3. **Enhanced Case Studies** - Rich project pages
4. **Home Hero Window** - Better first impression
5. **About Manifesto** - Your story with personality

Let me know when Docker is ready and we'll test! 🎉

# Ultra-Discrete Portfolio Container

## Stealth Mode Setup

### Method 1: One-Command (Recommended)

```bash
cd ~/brianhsu-portfolio && ./brian.sh start
```

Output:
```
Ready on :1234
```

Then from your **local machine**:
```bash
ssh -L 1234:localhost:1234 user@pn2501748.lanl.gov
```

Open: http://localhost:1234

---

### Method 2: Silent Background Start

```bash
cd ~/brianhsu-portfolio && ./.start
```

No output. Just starts if not running.

**Add to .bashrc for auto-start on login:**
```bash
echo '~/brianhsu-portfolio/.start' >> ~/.bashrc
```

---

## Why This is Discrete

### Container Properties:
- **Name**: "brian" (generic, not "portfolio-dev")
- **Port**: 1234 (not obvious like 3000)
- **Binding**: localhost only (not exposed to network)
- **Logging**: Filtered (no webpack noise)
- **Restart**: Auto-restart (survives reboots)
- **Hidden file**: `.start` script (doesn't show in `ls`)

### Process List:
```bash
# Won't show "npm" or "node" in your processes
ps aux | grep node
# Only shows container runtime

# Container is just another container
podman ps
# CONTAINER ID  IMAGE  COMMAND  CREATED  STATUS  PORTS               NAMES
# a1b2c3d4e5f6  brian  ...      2m ago   Up      127.0.0.1:1234->... brian
```

### Network:
```bash
# Not exposed externally
netstat -tlnp | grep 1234
# tcp  0  0  127.0.0.1:1234  0.0.0.0:*  LISTEN  12345/podman

# Only accessible via localhost
curl localhost:1234        # ✅ Works
curl your-ip:1234          # ❌ Refused
```

---

## Quick Commands

```bash
# Check status (silent if running)
~/brianhsu-portfolio/brian.sh status

# View filtered logs
~/brianhsu-portfolio/brian.sh logs

# Restart
~/brianhsu-portfolio/brian.sh restart

# Stop everything
~/brianhsu-portfolio/brian.sh stop
```

---

## Port Forwarding Setup

### Basic (Manual)
```bash
# On local machine
ssh -L 1234:localhost:1234 user@pn2501748.lanl.gov
```

### Background (Recommended)
```bash
# On local machine - runs in background
ssh -fN -L 1234:localhost:1234 user@pn2501748.lanl.gov

# Check if running
ps aux | grep "ssh -fN"

# Kill when done
pkill -f "ssh -fN -L 1234"
```

### SSH Config (Best)
Add to `~/.ssh/config` on local machine:
```
Host lanl
    HostName pn2501748.lanl.gov
    User brianhsu
    LocalForward 1234 localhost:1234
    ServerAliveInterval 60
```

Then just:
```bash
ssh lanl
# Port forwarding is automatic!
```

---

## Security Features

1. **Localhost Only**: Not accessible from external IPs
2. **Read-Only Mounts**: Source code mounted as read-only
3. **Non-Root**: Container runs as non-root user
4. **Isolated**: Container doesn't have access to host files
5. **Filtered Logs**: No debug info in logs

---

## Cleanup

```bash
# Stop and remove container
~/brianhsu-portfolio/brian.sh stop

# Remove image too
~/brianhsu-portfolio/brian.sh clean

# Remove from bashrc if added
sed -i '/brianhsu-portfolio\/.start/d' ~/.bashrc
```

---

## Troubleshooting

### Check if running:
```bash
podman ps | grep brian
# or
docker ps | grep brian
```

### Check port:
```bash
ss -tlnp | grep 1234
# or
lsof -i :1234
```

### View logs:
```bash
podman logs brian
# or
docker logs brian
```

### Restart if stuck:
```bash
podman restart brian
# or
./brian.sh restart
```

### Port already in use:
```bash
# Find what's using it
lsof -i :1234

# Kill it
kill -9 <PID>

# Or use different port
# Edit brian.sh: PORT=1235
```

---

## Testing Terminal

Once running and port-forwarded:

1. Open http://localhost:1234
2. Click Terminal icon in dock
3. Try commands:
   ```
   neofetch
   ls projects
   cd work
   cat hpc-cluster
   help
   ```

---

## Hot Reload

Edit files on SSH machine:
```bash
vim ~/brianhsu-portfolio/src/components/apps/TerminalApp.tsx
```

Changes appear instantly in your browser! (via volume mounts)

---

## Auto-Start on Login (Optional)

```bash
# Add to .bashrc
echo 'cd ~/brianhsu-portfolio && ./.start' >> ~/.bashrc

# Or for fish shell
echo 'cd ~/brianhsu-portfolio && ./.start' >> ~/.config/fish/config.fish
```

Container starts silently every time you SSH in.

---

## One-Liner Setup

```bash
cd ~/brianhsu-portfolio && \
./brian.sh start && \
echo "Ready! Forward with: ssh -L 1234:localhost:1234 $(whoami)@$(hostname)"
```

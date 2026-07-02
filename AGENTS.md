# Portfolio Development Environment

## Current Setup
- **SSH Machine**: kn-head (LANL)
- **Container**: Named "brian", runs on port 1234
- **Runtime**: Podman (auto-detected by brian.sh)
- **Local Access**: Port forward 1234:localhost:1234

## Start Development

### On SSH Machine (kn-head)
```bash
cd ~/brianhsu-portfolio
./brian.sh start
# Wait for: "Ready on :1234"
```

### On Local Machine
```bash
ssh -L 1234:localhost:1234 brian@kn-head
# Open: http://localhost:1234
```

## Container Management

```bash
./brian.sh status    # Check if running
./brian.sh stop      # Stop container
./brian.sh restart   # Restart
./brian.sh logs      # View logs
./brian.sh clean     # Remove everything
```

## Debugging

```bash
# Interactive shell in container
podman exec -it brian sh

# Inside container:
npm run dev     # Dev server
npm run test    # Run tests
npm run build   # Production build
npm run lint    # Check linting
```

## File Structure

```
brianhsu-portfolio/
├── brian.sh              # Container control script
├── Dockerfile            # Container definition
├── src/                  # Source code (hot reload enabled)
│   └── components/apps/
│       └── TerminalApp.tsx  # Enhanced terminal with tab completion
├── STEALTH.md           # Full operational guide
└── CHEATSHEET.txt       # Quick reference
```

## Hot Reload

Edit files on SSH machine:
```bash
vim src/components/apps/TerminalApp.tsx
```
Changes appear instantly in browser at localhost:1234

## Terminal Features (Implemented)

Commands: `help`, `ls`, `cd`, `cat`, `open`, `neofetch`, `changelog`
- Tab completion: `hel[TAB]` → `help`
- Command history: ↑/↓ arrows
- Easter eggs: `sudo`, `pwd`, `exit`

## Troubleshooting

```bash
# Container not responding
./brian.sh restart

# Port in use
lsof -i :1234
kill -9 <PID>

# View full logs
podman logs brian

# Rebuild from scratch
./brian.sh clean
./brian.sh start
```

## Architecture

```
Local Browser (localhost:1234)
    ↕ SSH Tunnel
SSH Machine (kn-head:1234)
    ↕ Podman
Container "brian" (Next.js dev:3000)
    ↕ Volume Mounts
~/brianhsu-portfolio/src (hot reload)
```

## Notes for AI Agents

- Container runs discretely on port 1234 (not standard 3000)
- Podman auto-detected over Docker
- Hot reload via read-only volume mounts
- Terminal app fully enhanced with Phase 7 features from systemdesign.md
- No local Node.js needed - everything runs in container

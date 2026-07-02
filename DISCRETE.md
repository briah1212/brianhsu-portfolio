# Discrete Portfolio Setup

Quick commands:
```bash
./brian.sh start    # Start in background
./brian.sh status   # Check if running
./brian.sh stop     # Stop container
./brian.sh logs     # View logs (filtered)
```

## Setup Once

```bash
# On SSH machine
cd ~/brianhsu-portfolio
chmod +x brian.sh
./brian.sh start
```

## Port Forward

```bash
# On your local machine
ssh -L 1234:localhost:1234 brianhsu@pn2501748.lanl.gov

# Then open: http://localhost:1234
```

## Notes

- Container named "brian" (discrete)
- Runs on port 1234 (not obvious)
- Auto-restarts unless stopped
- Bound to localhost only (not exposed externally)
- Minimal logging output
- Works with both docker and podman

## Check Status

```bash
# Verify it's running
./brian.sh status

# Should output:
# Running on :1234
# Forward: ssh -L 1234:localhost:1234 <host>
```

## One-liner Startup

```bash
./brian.sh start && sleep 2 && ./brian.sh status
```

## Cleanup

```bash
# Stop and remove everything
./brian.sh clean
```

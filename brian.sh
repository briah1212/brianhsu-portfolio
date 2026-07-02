#!/bin/bash
# Discrete portfolio container manager
# Usage: ./brian.sh [start|stop|restart|status|logs]

CONTAINER_NAME="brian"
IMAGE_NAME="brian"
PORT=1234
INTERNAL_PORT=3000

# Detect if using docker or podman
if command -v podman &> /dev/null; then
    RUNTIME="podman"
elif command -v docker &> /dev/null; then
    RUNTIME="docker"
else
    echo "Error: Neither docker nor podman found"
    exit 1
fi

case "${1:-status}" in
    start)
        # Check if already running
        if $RUNTIME ps --format "{{.Names}}" | grep -q "^${CONTAINER_NAME}$"; then
            echo "Already running"
            exit 0
        fi

        # Build image if needed
        if ! $RUNTIME images --format "{{.Repository}}" | grep -q "^${IMAGE_NAME}$"; then
            echo "Building..."
            $RUNTIME build -t $IMAGE_NAME -q . > /dev/null 2>&1
        fi

        # Start container in background
        $RUNTIME run -d \
            --name $CONTAINER_NAME \
            --restart unless-stopped \
            -p 127.0.0.1:$PORT:$INTERNAL_PORT \
            -v "$(pwd)/src:/app/src:ro" \
            -v "$(pwd)/public:/app/public:ro" \
            $IMAGE_NAME > /dev/null 2>&1

        # Wait for ready
        sleep 3
        if $RUNTIME ps --format "{{.Names}}" | grep -q "^${CONTAINER_NAME}$"; then
            echo "Ready on :$PORT"
        else
            echo "Failed to start"
            exit 1
        fi
        ;;

    stop)
        if $RUNTIME ps --format "{{.Names}}" | grep -q "^${CONTAINER_NAME}$"; then
            $RUNTIME stop $CONTAINER_NAME > /dev/null 2>&1
            $RUNTIME rm $CONTAINER_NAME > /dev/null 2>&1
            echo "Stopped"
        else
            echo "Not running"
        fi
        ;;

    restart)
        $0 stop
        sleep 1
        $0 start
        ;;

    status)
        if $RUNTIME ps --format "{{.Names}}" | grep -q "^${CONTAINER_NAME}$"; then
            echo "Running on :$PORT"
            echo "Forward: ssh -L 1234:localhost:1234 <host>"
        else
            echo "Not running"
        fi
        ;;

    logs)
        if $RUNTIME ps --format "{{.Names}}" | grep -q "^${CONTAINER_NAME}$"; then
            $RUNTIME logs -f $CONTAINER_NAME 2>&1 | grep -v "webpack" | grep -v "Compiling"
        else
            echo "Not running"
        fi
        ;;

    clean)
        $0 stop
        $RUNTIME rmi $IMAGE_NAME > /dev/null 2>&1
        echo "Cleaned"
        ;;

    *)
        echo "Usage: $0 {start|stop|restart|status|logs|clean}"
        exit 1
        ;;
esac

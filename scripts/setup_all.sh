#!/usr/bin/env bash
set -euo pipefail

echo "[Phase 4] Bootstrapping: API + Frontend + Storybook + Docker (if available)"

# Basic checks
node -v
npm -v

echo "Installing dependencies..."
npm ci

echo "Starting API and Frontend in background (npm run dev)..."
npm run dev &
DEV_PID=$!

echo "Starting Storybook in background..."
npm run storybook &
SB_PID=$!

echo "Building Storybook (static) in background..."
npm run build-storybook &
BSB_PID=$!

echo "Waiting for servers to come up..."
sleep 15

if command -v node >/dev/null 2>&1; then
  echo "Running quick live verification..."
  node verify-live.js || echo "verify-live script had issues; proceed manually if needed."
fi

if [ -f docker-compose.yml ]; then
  if command -v docker >/dev/null 2>&1; then
    echo "Starting Docker Compose stack..."
    docker-compose up --build -d
  else
    echo "Docker not available; skipping Docker compose startup."
  fi
else
  echo "No docker-compose.yml found; skipping Docker steps."
fi

echo "Done. PIDs: API/Frontend=${DEV_PID}, Storybook=${SB_PID}, StorybookStatic=${BSB_PID}"
echo "To stop all: kill ${DEV_PID} ${SB_PID} ${BSB_PID} (and any docker processes if you started them)"

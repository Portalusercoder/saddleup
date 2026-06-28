#!/usr/bin/env bash
# Bootstrap SaddleUp on a fresh machine. Safe to re-run.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> SaddleUp local setup"

if ! command -v node >/dev/null 2>&1; then
  echo "Error: Node.js is required (20+). Install from https://nodejs.org/"
  exit 1
fi

NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]")"
if [ "$NODE_MAJOR" -lt 20 ]; then
  echo "Warning: Node $NODE_MAJOR detected. Node 20+ is recommended."
fi

if [ ! -f .env.local ]; then
  cp .env.example .env.local
  echo "Created .env.local from .env.example"
  echo "  → Add your Supabase URL + anon key before using login/signup."
else
  echo "Using existing .env.local"
fi

echo "==> Installing dependencies"
npm install

echo "==> Prisma (SQLite dev database)"
npx prisma generate
if [ ! -f prisma/dev.db ]; then
  npx prisma migrate deploy
else
  npx prisma migrate deploy
fi

echo ""
echo "Setup complete."
echo ""
echo "Before first login:"
echo "  1. Edit .env.local — set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "  2. Apply Supabase SQL migrations in your project (see docs/SUPABASE_SETUP.md)"
echo ""
echo "Start the app:"
echo "  npm run dev"
echo ""
echo "Open http://localhost:3000"

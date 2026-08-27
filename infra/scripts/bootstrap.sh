#!/usr/bin/env bash
# One command to get a working local environment from a fresh clone.
#   pnpm bootstrap
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

say() { printf '\n\033[1;35m▸ %s\033[0m\n' "$1"; }
warn() { printf '\033[1;33m  ! %s\033[0m\n' "$1"; }

say "Checking prerequisites"
command -v docker >/dev/null || { echo "docker is required"; exit 1; }
command -v pnpm   >/dev/null || { echo "pnpm is required (corepack enable)"; exit 1; }
node_major="$(node -p 'process.versions.node.split(".")[0]')"
[ "$node_major" -ge 22 ] || { echo "Node 22 required, found $(node -v)"; exit 1; }

say "Creating .env files from examples (existing files are left alone)"
for pair in \
  "infra/.env.example:infra/.env" \
  "apps/backend/.env.example:apps/backend/.env" \
  "apps/storefront/.env.example:apps/storefront/.env"
do
  src="${pair%%:*}"; dst="${pair##*:}"
  if [ -f "$dst" ]; then
    warn "$dst exists, skipping"
  else
    cp "$src" "$dst"
    echo "  created $dst"
  fi
done

say "Starting infrastructure (postgres, valkey, meilisearch, minio)"
docker compose -f infra/docker-compose.yml up -d

say "Waiting for postgres to accept connections"
for i in $(seq 1 60); do
  if docker compose -f infra/docker-compose.yml exec -T postgres \
       pg_isready -U "${POSTGRES_USER:-fabrizia}" >/dev/null 2>&1; then
    echo "  postgres ready"; break
  fi
  [ "$i" -eq 60 ] && { echo "postgres did not become ready in 60s"; exit 1; }
  sleep 1
done

say "Installing dependencies"
pnpm install

say "Building shared package"
pnpm --filter @fabrizia/shared build

say "Running database migrations"
pnpm --filter @fabrizia/backend migrate
pnpm --filter @fabrizia/storefront payload:migrate

cat <<'DONE'

  Bootstrap complete.

  Next steps:
    pnpm seed                      seed region BG/EUR + demo catalogue
    pnpm --filter @fabrizia/backend user -- -e you@example.com -p supersecret
    pnpm dev                       start backend + storefront

  URLs:
    http://localhost:8000          storefront
    http://localhost:9000/app      Medusa admin (commerce)
    http://localhost:8000/admin    Payload admin (content)
    http://localhost:7700          Meilisearch
    http://localhost:9001          MinIO console (API on 9002)

DONE

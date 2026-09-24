#!/usr/bin/env bash
# One deploy script, two hosting realities.
#
# The host either gives root and Docker, or it does not. We do not yet know
# which one SuperHosting's Managed VPS provides, so this detects it rather than
# assuming — and refuses to guess silently.
#
#   ./infra/deploy/deploy.sh            deploy using whichever path works
#   ./infra/deploy/deploy.sh --check    report what the host supports, change nothing
#   ./infra/deploy/deploy.sh --path=native   force the no-Docker path
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
DEPLOY_DIR="$ROOT/infra/deploy"
cd "$ROOT"

say()  { printf '\n\033[1;35m▸ %s\033[0m\n' "$1"; }
ok()   { printf '  \033[32m✓\033[0m %s\n' "$1"; }
bad()  { printf '  \033[31m✗\033[0m %s\n' "$1"; }
warn() { printf '  \033[33m!\033[0m %s\n' "$1"; }

FORCED_PATH=""
CHECK_ONLY=0
for arg in "$@"; do
  case "$arg" in
    --check) CHECK_ONLY=1 ;;
    --path=docker) FORCED_PATH="docker" ;;
    --path=native) FORCED_PATH="native" ;;
    *) echo "Unknown argument: $arg"; exit 2 ;;
  esac
done

# ---------------------------------------------------------------- capabilities
say "Host capabilities"

has_docker=0
if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
  has_docker=1; ok "Docker daemon reachable"
else
  bad "no usable Docker daemon"
fi

has_compose=0
if [ "$has_docker" -eq 1 ] && docker compose version >/dev/null 2>&1; then
  has_compose=1; ok "docker compose available"
else
  [ "$has_docker" -eq 1 ] && bad "docker compose plugin missing"
fi

if [ "$(id -u)" -eq 0 ] || sudo -n true 2>/dev/null; then
  ok "root or passwordless sudo"
  has_root=1
else
  bad "no root — the native path cannot install services"
  has_root=0
fi

if command -v systemctl >/dev/null 2>&1 && systemctl --version >/dev/null 2>&1; then
  ok "systemd present"; has_systemd=1
else
  bad "no systemd — falling back to PM2 for process supervision"; has_systemd=0
fi

node_ok=0
if command -v node >/dev/null 2>&1; then
  node_major="$(node -p 'process.versions.node.split(".")[0]')"
  if [ "$node_major" -ge 22 ]; then ok "Node $(node -v)"; node_ok=1
  else bad "Node $(node -v) is too old; 22.x required"; fi
else
  bad "Node not installed"
fi

# ------------------------------------------------------------------ path choice
if [ -n "$FORCED_PATH" ]; then
  DEPLOY_PATH="$FORCED_PATH"
  warn "path forced to '$DEPLOY_PATH'"
elif [ "$has_compose" -eq 1 ]; then
  DEPLOY_PATH="docker"
elif [ "$node_ok" -eq 1 ] && [ "$has_root" -eq 1 ]; then
  DEPLOY_PATH="native"
else
  bad "neither path is possible on this host"
  cat <<'BLOCKED'

  The stack needs six processes: Next.js, Medusa, PostgreSQL, Redis/Valkey,
  Meilisearch and a background worker. That requires either Docker, or root
  plus Node 22 to install them as services.

  Ask the hosting provider three questions:
    1. Does the Managed VPS plan give root access and Docker?
    2. What is the SLA, and who restarts a process that dies at 2am?
    3. Is point-in-time recovery available for PostgreSQL, or only a nightly dump?

  If the answer to the first is no, this host cannot run the stack as designed.
BLOCKED
  exit 1
fi

say "Chosen path: $DEPLOY_PATH"

if [ "$CHECK_ONLY" -eq 1 ]; then
  echo; echo "  --check requested; nothing was changed."
  exit 0
fi

# --------------------------------------------------------------------- env
for f in .env.backend .env.storefront; do
  [ -f "$DEPLOY_DIR/$f" ] || { bad "missing $DEPLOY_DIR/$f — copy it from the .example and fill it in"; exit 1; }
done

# ------------------------------------------------------------------- deploy
case "$DEPLOY_PATH" in
  docker)
    say "Building and starting containers"
    docker compose -f "$DEPLOY_DIR/docker-compose.prod.yml" up -d --build
    say "Running migrations"
    docker compose -f "$DEPLOY_DIR/docker-compose.prod.yml" exec -T backend node_modules/.bin/medusa db:migrate
    docker compose -f "$DEPLOY_DIR/docker-compose.prod.yml" exec -T storefront node_modules/.bin/payload migrate
    ;;
  native)
    say "Installing dependencies and building"
    corepack enable
    pnpm install --frozen-lockfile --prod=false
    pnpm --filter @fabrizia/shared build
    pnpm --filter @fabrizia/backend build
    pnpm --filter @fabrizia/storefront build

    say "Running migrations"
    pnpm --filter @fabrizia/backend migrate
    pnpm --filter @fabrizia/storefront payload:migrate

    if [ "$has_systemd" -eq 1 ]; then
      say "Installing systemd units"
      for unit in "$DEPLOY_DIR"/systemd/*.service; do
        install -m 644 "$unit" "/etc/systemd/system/$(basename "$unit")"
      done
      systemctl daemon-reload
      systemctl enable --now fabrizia-meilisearch fabrizia-backend fabrizia-storefront
      systemctl --no-pager --lines=0 status fabrizia-backend fabrizia-storefront || true
    else
      say "Starting under PM2"
      command -v pm2 >/dev/null 2>&1 || npm install -g pm2
      pm2 startOrReload "$DEPLOY_DIR/ecosystem.config.cjs" --update-env
      pm2 save
    fi
    ;;
esac

say "Deployed via the $DEPLOY_PATH path"
cat <<'NEXT'

  Verify before announcing anything:
    curl -fsS http://127.0.0.1:9000/health   backend
    curl -fsS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:8000/   storefront

  Then confirm the backup actually restores. An untested backup is not a backup.
NEXT

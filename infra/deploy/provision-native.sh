#!/usr/bin/env bash
# Installs the services Docker would otherwise have provided.
# Run once, as root, on a Debian/Ubuntu VPS that does not offer Docker.
set -euo pipefail

say() { printf '\n\033[1;35m▸ %s\033[0m\n' "$1"; }

[ "$(id -u)" -eq 0 ] || { echo "run as root"; exit 1; }

say "System packages"
apt-get update
apt-get install -y --no-install-recommends \
  ca-certificates curl gnupg lsb-release \
  postgresql-16 postgresql-contrib-16 redis-server nginx certbot python3-certbot-nginx

say "Application user"
id fabrizia >/dev/null 2>&1 || useradd --system --create-home --shell /bin/bash fabrizia
install -d -o fabrizia -g fabrizia /srv/fabrizia /var/lib/meilisearch /srv/fabrizia/uploads

say "Node 22"
if ! command -v node >/dev/null 2>&1 || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 22 ]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi
corepack enable

say "Meilisearch binary"
if ! command -v meilisearch >/dev/null 2>&1; then
  curl -fsSL https://install.meilisearch.com | sh
  install -m 755 ./meilisearch /usr/local/bin/meilisearch
  rm -f ./meilisearch
fi
chown -R fabrizia:fabrizia /var/lib/meilisearch

say "Databases"
sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='fabrizia'" | grep -q 1 \
  || sudo -u postgres createuser fabrizia
for db in fabrizia_commerce fabrizia_cms; do
  sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$db'" | grep -q 1 \
    || sudo -u postgres createdb -O fabrizia "$db"
done

say "Point-in-time recovery"
# A nightly dump loses a whole day. WAL archiving is what makes recovery to a
# chosen minute possible — ask the host whether they offer this before relying
# on their managed backups instead.
install -d -o postgres -g postgres /var/backups/fabrizia/wal
PGCONF="/etc/postgresql/16/main/postgresql.conf"
grep -q "archive_mode = on" "$PGCONF" || cat >> "$PGCONF" <<'CONF'

# Fabrizia: point-in-time recovery
wal_level = replica
archive_mode = on
archive_command = 'test ! -f /var/backups/fabrizia/wal/%f && cp %p /var/backups/fabrizia/wal/%f'
max_wal_senders = 3
CONF
systemctl restart postgresql

say "Nightly base backup"
cat > /etc/cron.daily/fabrizia-basebackup <<'CRON'
#!/bin/sh
set -e
STAMP=$(date +%Y%m%d)
sudo -u postgres pg_basebackup -D "/var/backups/fabrizia/base-$STAMP" -Ft -z -P
find /var/backups/fabrizia -maxdepth 1 -name 'base-*' -mtime +14 -exec rm -rf {} +
CRON
chmod +x /etc/cron.daily/fabrizia-basebackup

cat <<'DONE'

  Provisioned. Next:
    1. Clone the repo to /srv/fabrizia and fill in infra/deploy/.env.*
    2. ./infra/deploy/deploy.sh
    3. Configure nginx as a reverse proxy for :8000 and :9000, then certbot
    4. Restore a backup into a scratch database and time it.
       Until that is done, the backup does not count.

DONE

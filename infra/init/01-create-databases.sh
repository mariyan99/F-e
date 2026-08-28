#!/bin/bash
# Runs once, on first postgres start, before the server accepts external connections.
# Commerce and CMS get separate databases — see ADR-001 section 2.1.
set -euo pipefail

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  SELECT 'CREATE DATABASE fabrizia_cms'
  WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'fabrizia_cms')\gexec

  GRANT ALL PRIVILEGES ON DATABASE fabrizia_cms TO $POSTGRES_USER;
EOSQL

echo "databases ready: $POSTGRES_DB, fabrizia_cms"

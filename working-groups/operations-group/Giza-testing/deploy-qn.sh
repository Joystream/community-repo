#!/usr/bin/env bash
set -e

SCRIPT_PATH="$(dirname "${BASH_SOURCE[0]}")"
cd $SCRIPT_PATH

# Bring up db
docker-compose up -d db

# Make sure we use dev config for db migrations (prevents "Cannot create database..." and some other errors)
docker-compose run --rm --entrypoint sh graphql-server -c "yarn workspace query-node config:dev"
# Migrate the databases
docker-compose run --rm --entrypoint sh graphql-server -c "yarn workspace query-node-root db:prepare"
docker-compose run --rm --entrypoint sh graphql-server -c "yarn workspace query-node-root db:migrate"

# Start indexer and gateway
docker-compose up -d indexer
docker-compose up -d hydra-indexer-gateway

# Start processor and graphql server
docker-compose up -d processor
docker-compose up -d graphql-server

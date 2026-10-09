#!/usr/bin/env bash
# Runs the store contract tests against DynamoDB Local in Docker.
set -euo pipefail
name=recco-dynamodb-local
docker rm -f "$name" >/dev/null 2>&1 || true
docker run -d --rm --name "$name" -p 8000:8000 amazon/dynamodb-local:latest -jar DynamoDBLocal.jar -inMemory >/dev/null
trap 'docker rm -f "$name" >/dev/null 2>&1 || true' EXIT
for _ in $(seq 1 30); do curl -s localhost:8000 >/dev/null 2>&1 && break; sleep 0.5; done
DYNAMODB_ENDPOINT=http://localhost:8000 pnpm -s vitest run packages/store

#!/bin/sh
set -e

echo "Entrypoint: running prisma generate with retries..."
RETRIES=6
SLEEP=3
while [ $RETRIES -gt 0 ]; do
  if npx prisma generate --schema=./prisma/schema.prisma; then
    echo "Prisma generate succeeded"
    break
  else
    echo "Prisma generate failed, retries left: $RETRIES"
    RETRIES=$((RETRIES - 1))
    if [ $RETRIES -le 0 ]; then
      echo "Prisma generate failed after retries; exiting"
      exit 1
    fi
    sleep $SLEEP
  fi
done

echo "Starting command: $@"
exec "$@"

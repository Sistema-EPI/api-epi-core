#!/bin/sh

echo "Aguardando MySQL..."
./wait-for-it.sh mysql:3306 --timeout=30 --strict -- echo "MySQL está pronto"

echo "Gerando migration (caso necessário)..."
npx prisma migrate reset --force --skip-seed || true
npx prisma migrate dev --name init --skip-seed || true

echo "Executando seed..."
npx prisma db seed || true

node dist/server.js

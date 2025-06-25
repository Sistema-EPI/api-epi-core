#!/bin/bash

set -e

echo "=== Iniciando aplicação no Docker ==="

# Verifica se DATABASE_URL está definida
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERRO: DATABASE_URL não está definida!"
    exit 1
fi

if [ -z "$NODE_ENV" ]; then
    echo "❌ ERRO: NODE_ENV não está definida!"
    exit 1
fi

if [ -z "$ENV" ]; then
    echo "⚠️  AVISO: ENV não está definida, usando NODE_ENV como fallback"
    export ENV=$NODE_ENV
fi

echo "🔧 Ambiente: $ENV"
echo "🗄️  Database URL: ${DATABASE_URL%%@*}@***"

# Gera o cliente Prisma (garantindo que está atualizado)
echo "🔄 Gerando cliente Prisma..."
npx prisma generate

if [ "$ENV" = "prod" ]; then
    echo "🚀 Ambiente de PRODUÇÃO"

    echo "📦 Aplicando migrations..."
    npx prisma migrate deploy

    echo "🌱 Executando seed..."
    npx tsx prisma/seed.ts

    echo "✅ Iniciando aplicação..."
    exec node dist/server.js

elif [ "$ENV" = "homolog" ]; then
    echo "🧪 Ambiente de HOMOLOGAÇÃO"

    echo "🗄️  Resetando database..."
    npx prisma migrate reset --force --skip-seed

    echo "📦 Aplicando migrations..."
    npx prisma migrate dev --name "init-homolog" --skip-seed

    echo "🌱 Executando seed..."
    npx tsx prisma/seed.ts

    echo "✅ Iniciando aplicação..."
    exec node dist/server.js

else
    echo "🔧 Ambiente: $ENV"

    echo "📦 Aplicando migrations..."
    npx prisma migrate deploy || true

    echo "🌱 Executando seed..."
    npx tsx prisma/seed.ts || true

    echo "✅ Iniciando aplicação..."
    exec node dist/server.js
fi

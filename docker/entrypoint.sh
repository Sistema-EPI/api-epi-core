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

if [ "$ENV" == "prod" ]; then

    echo "Aplicando migrations..."
    npx prisma migrate deploy || echo "⚠️  Falha nas migrations, mas continuando..."

    echo "Executando seed..."
    npx tsx prisma/seed.ts || echo "⚠️  Seed falhou, mas continuando..."

    echo "Iniciando aplicação..."
    node dist/server.js
fi

if [ "$ENV" == "homolog" ]; then
    # Executa as migrações do Prisma
    echo "🗄️  Executando migrações do Prisma..."
    npx prisma migrate reset --force --skip-seed || true
    npx prisma migrate dev --name init --skip-seed || true

    # Executa o seed (opcional - remova se não quiser sempre executar)
    echo "🌱 Executando seed..."
    npx tsx prisma/seed.ts || true || echo "⚠️  Seed falhou, mas continuando..."

    # Inicia a aplicação
    echo "🚀 Iniciando servidor..."
    node dist/server.js
fi

# Se nenhum ENV específico, inicia direto
if [ "$ENV" != "prod" ] && [ "$ENV" != "homolog" ]; then
    echo "🚀 Iniciando servidor (ENV: $ENV)..."
    node dist/server.js
fi



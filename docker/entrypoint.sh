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

if [ "$ENV" = "prod" ]; then
    echo "🚀 Ambiente de PRODUÇÃO"

    echo "📦 Sincronizando schema com o banco de dados..."
    npx prisma db push --accept-data-loss

    echo "🌱 Executando seed..."
    tsx prisma/seed-prd.ts || echo "⚠️  Seed falhou, mas continuando (pode ser que já tenha dados)"

    echo "✅ Iniciando aplicação..."
    exec node dist/server.js

elif [ "$ENV" = "homolog" ]; then
    echo "🧪 Ambiente de HOMOLOGAÇÃO"

    echo "🗄️  Resetando e sincronizando banco de dados..."
    # Para homologação, sempre recria o schema do zero
    npx prisma db push --force-reset

    echo "🌱 Executando seed..."
    tsx prisma/seed-prd.ts

    echo "✅ Iniciando aplicação..."
    exec node dist/server.js

else
    echo "🔧 Ambiente: $ENV (development/default)"

    echo "📦 Sincronizando schema com o banco de dados..."
    # Usa db push para criar todas as tabelas do schema.prisma
    npx prisma db push --accept-data-loss

    echo "🌱 Executando seed..."
    tsx prisma/seed.ts || echo "⚠️  Seed falhou, mas continuando"

    echo "✅ Iniciando aplicação..."
    exec node dist/server.js
fi

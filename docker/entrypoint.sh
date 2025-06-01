#!/bin/bash

set -e

echo "=== Iniciando aplicação ==="

# Carrega variáveis do arquivo .env
if [ -f .env ]; then
    echo "📄 Carregando variáveis do arquivo .env..."
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "⚠️  Arquivo .env não encontrado"
fi


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
    echo "❌ ERRO: ENVIRONMENT não está definido!"
    exit 1
fi

if [ "$ENV" == "prod" ]; then
    echo "Aguardando MySQL..."
    ./wait-for-it.sh mysql:5432 --timeout=30 --strict -- echo "MySQL está pronto"

    echo "Aplicando migrations..."
    npx prisma migrate deploy

    echo "Executando seed..."
    npx prisma db seed-prd || true

    echo "Iniciando aplicação..."
    node dist/server.js
    exit 1
fi

if [ "$ENV" == "homolog" ]; then
    echo "⏳ Aguardando MySQL ficar disponível..."
    ./wait-for-it.sh mysql:3306 --timeout=60 --strict -- echo "✅ MySQL está disponível!"

    # Executa as migrações do Prisma
    echo "🗄️  Executando migrações do Prisma..."
    npx prisma migrate reset --force --skip-seed || true
    npx prisma migrate dev --name init --skip-seed || true

    # Executa o seed (opcional - remova se não quiser sempre executar)
    echo "🌱 Executando seed..."
    npx prisma db seed || true || echo "⚠️  Seed falhou, mas continuando..."

    # Inicia a aplicação
    echo "🚀 Iniciando servidor..."
    node dist/server.js
    exit 1
fi



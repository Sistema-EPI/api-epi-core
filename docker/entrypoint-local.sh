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

# Debug: Mostra as variáveis de ambiente
echo "DATABASE_URL: $DATABASE_URL"
echo "NODE_ENV: $NODE_ENV"
echo "CORS_ORIGIN: $CORS_ORIGIN"

# Verifica se DATABASE_URL está definida
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERRO: DATABASE_URL não está definida!"
    exit 1
fi

if [ -z "$NODE_ENV" ]; then
    echo "❌ ERRO: NODE_ENV não está definida!"
    exit 1
fi

# Aguarda o MySQL estar disponível
echo "⏳ Aguardando MySQL ficar disponível..."
./wait-for-it.sh mysql:3306 --timeout=60 --strict -- echo "✅ MySQL está disponível!"

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

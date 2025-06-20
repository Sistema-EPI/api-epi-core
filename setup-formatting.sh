#!/bin/bash

# Script de configuração do workflow de formatação e linting
# Execute este script após clonar o repositório

echo "🚀 Configurando workflow de formatação e linting..."

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale o Node.js primeiro."
    exit 1
fi

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado. Instale o npm primeiro."
    exit 1
fi

echo "📦 Instalando dependências..."
npm install

echo "🔧 Configurando Husky..."
npm run prepare

echo "🎨 Formatando código existente..."
npm run format

echo "🔍 Verificando linting..."
npm run lint

echo "✅ Configuração concluída!"
echo ""
echo "🛠 Comandos disponíveis:"
echo "  npm run format       - Formatar código"
echo "  npm run lint         - Verificar linting"
echo "  npm run code:check   - Verificar tudo"
echo "  npm run code:fix     - Corrigir tudo"
echo ""
echo "📝 Para mais informações, leia FORMATTING.md"

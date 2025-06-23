# api-epi-core

API Core para Sistema EPI

## 🚀 Configuração Inicial

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Docker (para desenvolvimento local)

### Instalação

```bash
# Clonar o repositório
git clone <url-do-repositorio>
cd api-epi-core

# Instalar dependências
npm install

# Configurar workflow de formatação/linting (novo projeto)
./setup-formatting.sh

# Ou configurar manualmente
npm run prepare
```

## 📝 Workflow de Formatação e Linting

Este projeto utiliza **Prettier** e **ESLint** para manter código consistente:

- **Formatação automática** ao salvar no VS Code
- **Pre-commit hooks** que verificam código antes dos commits
- **Scripts npm** para verificação e correção manual

### Comandos Principais

```bash
npm run format          # Formatar código
npm run lint            # Verificar linting
npm run code:check      # Verificar tipos + lint + formatação
npm run code:fix        # Corrigir problemas automaticamente
```

📖 **Documentação completa**: [FORMATTING.md](./FORMATTING.md)

## 🐳 Docker - Desenvolvimento Local

## 🐳 Docker - Desenvolvimento Local

### Rodar Docker Localmente

```bash
docker-compose -f docker/local-docker-compose.yml up --build -d
```

#### Rodar vendo os logs no terminal

```bash
docker-compose -f docker/local-docker-compose.yml up --build
```

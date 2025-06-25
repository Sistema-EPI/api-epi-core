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

# API EPI Core

API Core para Sistema de Gestão de EPIs com módulo completo de usuários.

## � Configuração Inicial

### Pré-requisitos

- Node.js 20+
- npm
- Docker e Docker Compose (recomendado)
- PostgreSQL ou MySQL

### Instalação

```bash
# Clonar o repositório
git clone <url-do-repositorio>
cd api-epi-core

# Instalar dependências
npm install

# Configurar workflow de formatação/linting (novo projeto)
./setup-formatting.sh

# Configurar environment
cp .env.example .env
# Edite o arquivo .env com suas configurações
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

## 🐳 Deploy com Docker

### Deploy Completo (Recomendado)

```bash
# Configurar environment
cp .env.example .env
# Edite o .env conforme necessário

# Deploy completo com PostgreSQL
docker-compose up --build -d

# Verificar logs
docker-compose logs -f api-epi-core
```

### Deploy Apenas da API (usando BD externo)

```bash
# Build da imagem
docker build -f docker/Dockerfile -t api-epi-core:latest .

# Executar container
docker run -d \
  --name api-epi-core \
  -p 3000:3000 \
  -e DATABASE_URL="sua-connection-string" \
  -e NODE_ENV=production \
  -e ENV=prod \
  -e JWT_SECRET="seu-jwt-secret" \
  api-epi-core:latest
```

## 🔧 Desenvolvimento Local

### Com Docker

```bash
# Subir apenas o banco de dados
docker-compose up postgres -d

# Configurar .env para desenvolvimento
cp .env.example .env
# Ajustar DATABASE_URL para: postgresql://postgres:postgres123@localhost:5432/api_epi_core?schema=public

# Executar migrations e seed
npx prisma migrate dev
npx tsx prisma/seed.ts

# Iniciar em modo desenvolvimento
npm run dev
```

### Sem Docker

```bash
# Instalar PostgreSQL localmente
# Criar database api_epi_core

# Configurar .env
DATABASE_URL="postgresql://user:password@localhost:5432/api_epi_core?schema=public"

# Executar migrations e seed
npx prisma migrate dev
npx tsx prisma/seed.ts

# Iniciar aplicação
npm run dev
```

## 🔑 Sistema de Usuários

A API inclui um módulo completo de gerenciamento de usuários com:

### Funcionalidades

- ✅ Autenticação JWT
- ✅ Criação e gerenciamento de usuários
- ✅ Sistema de roles e permissões
- ✅ Conexão de usuários com empresas
- ✅ Usuário master com acesso total
- ✅ Middleware de autorização
- ✅ Documentação Swagger completa

### Rotas Disponíveis

- `POST /auth/login` - Login de usuário
- `GET /users` - Listar todos os usuários (admin)
- `GET /users/:id` - Buscar usuário por ID
- `POST /users` - Criar novo usuário
- `PUT /users/:id/password` - Alterar senha
- `PUT /users/:id/status` - Alterar status (ativo/inativo)
- `DELETE /users/:id` - Remover usuário
- `POST /users/:id/company` - Conectar usuário à empresa
- `GET /users/company/:companyId` - Usuários de uma empresa
- `POST /users/admin` - Criar usuário admin

📖 **Documentação completa**:
[CONTRATO_API_USUARIOS.md](./CONTRATO_API_USUARIOS.md)

## 📊 Banco de Dados

### Migrations

```bash
# Aplicar migrations
npx prisma migrate deploy

# Reset (desenvolvimento)
npx prisma migrate reset

# Criar nova migration
npx prisma migrate dev --name nome-da-migration
```

### Seed

```bash
# Executar seed de produção
npx tsx prisma/seed.ts

# Executar seed de desenvolvimento
npx tsx prisma/seed-prd.ts
```

### Usuário Master

O seed cria automaticamente:

- **Role Master**: `master` com permissões totais
- **Usuário Master**: `master@system.admin` / senha: `Master@123`
- **Relacionamento**: Master conectado a todas as empresas

## 🔍 Monitoramento

### Health Check

```bash
# Verificar status da aplicação
curl http://localhost:3000/health
```

### Logs

```bash
# Logs do container
docker-compose logs -f api-epi-core

# Logs detalhados (desenvolvimento)
LOG_LEVEL=debug npm run dev
```

## 📚 Documentação da API

### Swagger

Acesse: `http://localhost:3000/api-docs`

### Postman/Insomnia

Importe a coleção a partir da documentação Swagger ou use os exemplos em
`CONTRATO_API_USUARIOS.md`.

## 🛠️ Estrutura do Projeto

```
src/
├── Controllers/     # Controladores da API
├── Services/        # Lógica de negócio
├── Routers/         # Definição de rotas
├── Schemas/         # Validação Zod
├── Middlewares/     # Middlewares (auth, cors, etc)
├── Helpers/         # Utilitários
└── Config/          # Configurações (Swagger, etc)

prisma/
├── schema.prisma    # Schema do banco
├── seed.ts          # Seed de desenvolvimento
└── seed-prd.ts      # Seed de produção

docker/
├── Dockerfile       # Imagem da aplicação
└── entrypoint.sh    # Script de inicialização
```

## 🚨 Resolução de Problemas

### Erro OpenSSL no Docker

**Erro**: `Prisma failed to detect the libssl/openssl version`

**Solução**: Já corrigido no Dockerfile atual com a instalação do OpenSSL.

### Erro de Dependências TypeScript

**Erro**: Módulos de tipos não encontrados

**Solução**: Já corrigido - o Dockerfile instala devDependencies para build e
remove após.

### Problemas de Permissão

**Erro**: Usuário sem permissão para acessar rotas

**Solução**: Verificar se o usuário está conectado à empresa e tem a role
adequada.

## 📝 Scripts Úteis

```bash
# Build para produção
npm run build

# Verificação de tipos
npm run typecheck

# Linting completo
npm run code:check

# Executar testes
npm run test
```

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença [MIT](LICENSE).

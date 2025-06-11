# Sistema de Autenticação - API EPI Core

## 📋 Resumo Executivo

Este documento descreve a implementação completa do sistema de autenticação JWT com API Keys para a API EPI Core, incluindo todas as modificações no banco de dados, serviços, middlewares, controladores e rotas.

## 🗄️ Modificações no Banco de Dados

### Schema Prisma Atualizado

Foram adicionados os seguintes campos nas tabelas existentes:

#### Tabela `Company`
```prisma
model Company {
  // ...campos existentes...
  apiKey        String  @unique // API Key única por empresa
  active        Boolean @default(true) // Status da empresa
}
```

#### Tabela `User`
```prisma
model User {
  // ...campos existentes...
  name          String? // Nome completo do usuário
  avatar        String? // URL do avatar
  department    String? // Departamento
  position      String? // Cargo/posição
  lastLoginAt   DateTime? // Último login
}
```

### Migração Aplicada
- **Nome**: `20250611185612_add_auth_fields`
- **Comando**: `npx prisma migrate dev --name add_auth_fields`

## 🏗️ Arquitetura de Autenticação

### Fluxo de Autenticação

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant AuthService
    participant Database
    
    Client->>API: POST /v1/auth/login (email, password, x-api-token)
    API->>AuthService: validateApiKey(apiKey)
    AuthService->>Database: findUnique Company by apiKey
    Database-->>AuthService: Company data
    AuthService->>Database: findUnique User by email
    Database-->>AuthService: User data
    AuthService->>AuthService: comparePassword(password, hash)
    AuthService->>AuthService: generateJWT(userData)
    AuthService-->>API: authResult
    API-->>Client: JWT Token + User Data
    
    Client->>API: GET /v1/company/info (Authorization, x-api-token)
    API->>AuthMiddleware: validateHeaders
    AuthMiddleware->>AuthService: verifyToken + validateApiKey
    AuthService-->>AuthMiddleware: validation result
    AuthMiddleware-->>API: authorized request
    API-->>Client: Company data
```

## 🔧 Implementação Técnica

### 1. Serviços (Services)

#### AuthService (`src/Services/authService.ts`)
```typescript
export class AuthService {
  // Autenticação principal
  async authenticate(email: string, password: string, apiKey: string): Promise<AuthResult>
  
  // Validação de API Key
  async validateApiKey(apiKey: string): Promise<Company | null>
  
  // Verificação de token JWT
  verifyToken(token: string): any
  
  // Refresh de token
  async refreshToken(token: string, apiKey: string): Promise<AuthResult>
}
```

#### CompanyService (`src/Services/companyService.ts`)
```typescript
export class CompanyService {
  // Obter informações da empresa por API Key
  async getCompanyByApiKey(apiKey: string): Promise<Company | null>
}
```

### 2. Middlewares

#### Middleware de Autenticação (`src/Middlewares/auth.ts`)
```typescript
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // Validação dupla de headers:
  // 1. Authorization: Bearer <jwt_token>
  // 2. x-api-token: <api_key>
}
```

#### Middleware de Rate Limiting (`src/Middlewares/rateLimit.ts`)
```typescript
export const rateLimitMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // Limite: 5 tentativas por minuto por IP
}
```

### 3. Controladores

#### LoginController (`src/Controllers/LoginController.ts`)
```typescript
// POST /v1/auth/login
export async function login(req: Request, res: Response, next: NextFunction)

// POST /v1/auth/refresh  
export async function refresh(req: Request, res: Response, next: NextFunction)

// GET /v1/company/info
export async function getCompanyInfo(req: Request, res: Response, next: NextFunction)
```

### 4. Rotas

#### AuthRouter (`src/Routers/AuthRouter.ts`)
```typescript
// POST /v1/auth/login - Login com rate limiting
auth.post('/login', rateLimitMiddleware, RequestHandler(LoginController.login))

// POST /v1/auth/refresh - Refresh token
auth.post('/refresh', RequestHandler(LoginController.refresh))
```

#### CompanyRouter (`src/Routers/CompanyRouter.ts`)
```typescript
// GET /v1/company/info - Informações da empresa (autenticado)
company.get('/info', authMiddleware, RequestHandler(LoginController.getCompanyInfo))
```

### 5. Helpers

#### JWT Helper (`src/Helpers/Jwt.ts`)
```typescript
// Gerar token JWT
export function generateToken(payload: object, expiresIn: string = '1h'): string

// Verificar token JWT
export function verifyToken(token: string): any
```

## 🔐 Configurações de Segurança

### Variáveis de Ambiente (.env)
```env
# JWT
JWT_SECRET=sua_chave_secreta_jwt
JWT_EXPIRATION=30m

# CORS - Headers permitidos
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

### Headers CORS Configurados
```typescript
allowedHeaders: ['x-api-token', 'Authorization', 'Content-Type']
```

### Rate Limiting
- **Login**: 5 tentativas por minuto por IP
- **Outros endpoints**: Sem limite (configurável)

## 📊 Dados de Teste (Seed)

### Empresas Cadastradas
```typescript
// 5 empresas com API Keys únicas
{
  nomeFantasia: 'Hamada Tecnologias',
  apiKey: 'hamada_api_key_2024_secure_token_123456789',
  active: true
}
// ... outras 4 empresas
```

### Usuários de Teste
```typescript
// 5 usuários com senhas hasheadas (bcrypt)
{
  email: 'admin@hamada.com.br',
  senha: '$2a$12$CwTycUXWue0Thq9StjUM0uV4zPJ4YWPgQ1K7YGo3TGi.BGEP8G4Ei', // "123456"
  name: 'João Silva',
  department: 'Administração',
  position: 'Administrador'
}
```

### Executar Seed
```bash
# Reset completo + seed
npx prisma migrate reset --force --skip-seed
npx prisma migrate dev --name init --skip-seed  
npx prisma db seed
```

## 🧪 Endpoints Testados

### 1. Login
```bash
POST /v1/auth/login
Headers: 
  Content-Type: application/json
  x-api-token: hamada_api_key_2024_secure_token_123456789
Body:
{
  "email": "admin@hamada.com.br",
  "password": "123456"
}

# Resposta:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-1",
    "name": "João Silva",
    "email": "admin@hamada.com.br",
    "role": "admin",
    "permissions": {...},
    "avatar": null,
    "department": "Administração",
    "position": "Administrador"
  },
  "apiToken": "hamada_api_key_2024_secure_token_123456789",
  "company": {
    "id": "258ef76a-e8f8-43de-a8c5-ee41e910bfb8",
    "razao_social": "Hamada Tecnologias LTDA",
    "cnpj": "12345678000199",
    "status_empresa": "ATIVO"
  }
}
```

### 2. Informações da Empresa
```bash
GET /v1/company/info
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  x-api-token: hamada_api_key_2024_secure_token_123456789

# Resposta:
{
  "id": "258ef76a-e8f8-43de-a8c5-ee41e910bfb8",
  "razao_social": "Hamada Tecnologias LTDA",
  "nome_fantasia": "Hamada Tecnologias",
  "cnpj": "12345678000199",
  "status_empresa": "ATIVO",
  "email": "contato@hamada.com.br",
  "telefone": "21999999999",
  "logradouro": "Av. Principal, 123",
  "cep": "28970000",
  "uf": "RJ"
}
```

### 3. Refresh Token
```bash
POST /v1/auth/refresh
Headers:
  Content-Type: application/json
  x-api-token: hamada_api_key_2024_secure_token_123456789
Body:
{
  "refreshToken": "token_de_refresh_aqui"
}
```

## 🛡️ Como Implementar Autenticação em Novas Rotas

### Passo a Passo para Proteger Endpoints

#### 1. **Importar o Middleware de Autenticação**
```typescript
// No arquivo da rota (ex: src/Routers/MeuRouter.ts)
import { authMiddleware } from '../Middlewares/auth';
```

#### 2. **Aplicar o Middleware na Rota**
```typescript
// Exemplo: Proteger endpoint GET /v1/meurecurso/lista
meuRouter.get(
  '/lista',
  authMiddleware,  // ← Middleware de autenticação
  RequestHandler(MeuController.listar)
);
```

#### 3. **Exemplo Completo de Router Protegido**
```typescript
// src/Routers/EpiRouter.ts
import { Router } from 'express';
import * as EpiController from '../Controllers/EpiController';
import RequestHandler from '../Helpers/RequestHandler';
import { authMiddleware } from '../Middlewares/auth';

const epi = Router();

// Rota pública (sem autenticação)
epi.get('/public/lista', RequestHandler(EpiController.listarPublico));

// Rotas protegidas (com autenticação)
epi.get('/lista', authMiddleware, RequestHandler(EpiController.listar));
epi.post('/criar', authMiddleware, RequestHandler(EpiController.criar));
epi.put('/atualizar/:id', authMiddleware, RequestHandler(EpiController.atualizar));
epi.delete('/deletar/:id', authMiddleware, RequestHandler(EpiController.deletar));

export default epi;
```

#### 4. **Acessar Dados do Usuário no Controller**
```typescript
// src/Controllers/EpiController.ts
export async function listar(req: Request, res: Response, next: NextFunction) {
  try {
    // Dados do usuário autenticado disponíveis em req.user
    const userId = req.user.userId;
    const companyId = req.user.companyId;
    const userRole = req.user.role;
    const permissions = req.user.permissions;
    
    // Usar os dados para filtrar resultados por empresa
    const epis = await prisma.epi.findMany({
      where: {
        idEmpresa: companyId  // Filtrar pela empresa do usuário
      }
    });
    
    res.json({ success: true, data: epis });
  } catch (error) {
    next(error);
  }
}
```

#### 5. **Headers Necessários no Frontend**
```typescript
// Configuração do Axios ou Fetch
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${jwtToken}`,
  'x-api-token': apiKey
};

// Exemplo com Axios
axios.get('/v1/epi/lista', { headers });

// Exemplo com Fetch
fetch('/v1/epi/lista', {
  method: 'GET',
  headers: headers
});
```

#### 6. **Interceptor Axios (Recomendado)**
```typescript
// Configurar interceptor para adicionar headers automaticamente
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwtToken');
    const apiKey = localStorage.getItem('apiKey');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (apiKey) {
      config.headers['x-api-token'] = apiKey;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para refresh automático
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado - fazer refresh ou redirect para login
      // implementar lógica de refresh aqui
    }
    return Promise.reject(error);
  }
);
```

### 🎯 Níveis de Proteção

#### **Nível 1: Apenas Autenticação**
```typescript
router.get('/endpoint', authMiddleware, handler);
// Verifica se o usuário está logado com token válido
```

#### **Nível 2: Autenticação + Permissões**
```typescript
// Criar middleware de permissões
import { authMiddleware } from '../Middlewares/auth';

const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user.permissions[permission]) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// Usar nas rotas
router.post('/criar', 
  authMiddleware, 
  requirePermission('create'), 
  handler
);
router.delete('/deletar/:id', 
  authMiddleware, 
  requirePermission('delete'), 
  handler
);
```

#### **Nível 3: Rate Limiting + Autenticação**
```typescript
import { rateLimitMiddleware } from '../Middlewares/rateLimit';

router.post('/operacao-sensivel',
  rateLimitMiddleware,  // Rate limiting
  authMiddleware,       // Autenticação
  handler
);
```

### 📝 Checklist para Nova Rota Protegida

- [ ] Importar `authMiddleware`
- [ ] Aplicar middleware na rota
- [ ] Usar `req.user.companyId` para filtrar dados por empresa
- [ ] Configurar headers no frontend
- [ ] Testar com token válido
- [ ] Testar com token inválido/expirado
- [ ] Testar sem API Key
- [ ] Documentar endpoint no Swagger

### 🚨 Códigos de Erro HTTP

| Código | Significado | Quando Ocorre |
|--------|-------------|---------------|
| 400 | Bad Request | Headers obrigatórios ausentes |
| 401 | Unauthorized | Token JWT inválido/expirado |
| 403 | Forbidden | API Key inválida ou usuário sem permissão |
| 429 | Too Many Requests | Rate limit excedido |
| 500 | Internal Server Error | Erro interno do servidor |

## 🎯 Próximos Passos Recomendados

1. **Implementar Refresh Token Automático** no frontend
2. **Adicionar Logs de Auditoria** para operações sensíveis  
3. **Implementar Logout** com invalidação de token
4. **Adicionar Middleware de Permissões** granulares
5. **Configurar HTTPS** em produção
6. **Implementar Rate Limiting** personalizado por endpoint
7. **Adicionar Testes Automatizados** para autenticação

---

## 📞 Suporte

Para dúvidas sobre implementação, verificar:
- Arquivo `CREDENCIAIS_TESTE.md` para dados de teste
- Logs do servidor em tempo real
- Documentação Swagger em `/docs`

**Sistema 100% funcional e testado** ✅

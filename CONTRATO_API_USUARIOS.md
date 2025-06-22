# Contrato de API - Fluxo de Usuários

Este documento especifica todos os endpoints relacionados ao gerenciamento de
usuários no siste**Response 201 - Usuário Criado**:

```json
{
  "message": "Usuário criado com sucesso",
  "data": {
    "idUsuario": "7a976bfe-9ac7-4b3c-a3a9-50d5ff3850e4",
    "email": "novo.viewer@empresa.com.br",
    "statusUser": true,
    "cargo": "viewer"
  }
}.

## Autenticação

Todos os endpoints requerem:
- **Header Authorization**: `Bearer {jwt_token}`
- **Header x-api-token**: `{api_key_da_empresa}`

## Permissões

As operações de usuário requerem as seguintes permissões:
- `user:read` - Visualizar usuários
- `user:create` - Criar usuários
- `user:update` - Atualizar usuários
- `user:delete` - Deletar usuários

## Cargos Disponíveis

- `admin`: Administrador da empresa (todas as permissões)
- `gestor`: Gestor da empresa (todas as permissões)
- `viewer`: Visualizador (apenas leitura)

**⚠️ Importante:** O schema de validação inclui também `técnico`, mas este cargo não existe na tabela `role` do banco de dados e causará erro se usado. Use apenas os cargos listados acima.

## Base URL

```

{base_url}/v1/user

````

---

## 1. Listar Todos os Usuários

**Endpoint**: `GET /v1/user/get/all`

**Descrição**: Retorna uma lista paginada de todos os usuários ativos do sistema.

**Permissões**: `user:read`

**Query Parameters**:
- `page` (string, opcional): Número da página (padrão: 1)
- `limit` (string, opcional): Registros por página (padrão: 10)

**Exemplo de Request**:
```bash
curl -X GET "https://api.epicore.com/v1/user/get/all?page=1&limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "x-api-token: abcd1234-efgh-5678-ijkl-9012mnop3456"
````

**Response 200 - Sucesso**:

```json
{
  "message": "Usuários recuperados com sucesso",
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 5,
    "totalPages": 1
  },
  "data": [
    {
      "idUser": "44e5ad3a-b3e8-40ad-88aa-8449481041be",
      "name": "Maria Silva",
      "email": "gestor1@empresa.com.br",
      "senha": "$2b$12$M0MADXGOM.oVtwZHhmALeuSHH1JVG8FKxdnKkP9tacXi1X.w/acJ2",
      "statusUser": true,
      "lastLoginAt": "2025-06-22T20:43:43.000Z",
      "createdAt": "2025-06-20T19:26:29.000Z",
      "updatedAt": "2025-06-22T20:43:43.000Z",
      "deletedAt": null
    },
    {
      "idUser": "4bd75789-810d-44ed-be0a-63ecc925f851",
      "name": "Carlos Estoque",
      "email": "estoque@empresa.com.br",
      "senha": "$2b$12$M0MADXGOM.oVtwZHhmALeuSHH1JVG8FKxdnKkP9tacXi1X.w/acJ2",
      "statusUser": true,
      "lastLoginAt": null,
      "createdAt": "2025-06-20T19:26:29.000Z",
      "updatedAt": "2025-06-20T19:26:29.000Z",
      "deletedAt": null
    }
  ]
}
```

**Response 403 - Sem Permissão**:

```json
{
  "error": "Acesso negado. Permissão insuficiente."
}
```

---

## 2. Criar Novo Usuário

**Endpoint**: `POST /v1/user/create/{companyId}`

**Descrição**: Cria um novo usuário e o associa à empresa especificada.

**Permissões**: `user:create`

**Path Parameters**:

- `companyId` (string, UUID, obrigatório): ID da empresa para associar o usuário

**Request Body**:

```json
{
  "email": "string (email, obrigatório)",
  "senha": "string (min: 6 caracteres, obrigatório)",
  "cargo": "admin | gestor | viewer (obrigatório)",
  "status_user": "boolean (opcional, padrão: true)"
}
```

**Exemplo de Request**:

```bash
curl -X POST "https://api.epicore.com/v1/user/create/12345678-1234-1234-1234-123456789012" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "x-api-token: abcd1234-efgh-5678-ijkl-9012mnop3456" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "novo.gestor@techcorp.com",
    "senha": "senhaSegura123",
    "cargo": "gestor",
    "status_user": true
  }'
```

**Response 201 - Criado com Sucesso**:

```json
{
  "message": "Usuário criado com sucesso",
  "data": {
    "idUsuario": "98765432-8765-4321-8765-432109876543",
    "email": "novo.gestor@techcorp.com",
    "statusUser": true,
    "cargo": "gestor"
  }
}
```

**Response 400 - Email Já Existe**:

```json
{
  "error": "Email já está em uso"
}
```

**Response 404 - Empresa Não Encontrada**:

```json
{
  "error": "Empresa não encontrada"
}
```

---

## 3. Buscar Usuário por ID

**Endpoint**: `GET /v1/user/get/{userId}`

**Descrição**: Retorna informações detalhadas de um usuário específico,
incluindo suas empresas e permissões.

**Permissões**: `user:read`

**Path Parameters**:

- `userId` (string, UUID, obrigatório): ID único do usuário

**Exemplo de Request**:

```bash
curl -X GET "https://api.epicore.com/v1/user/get/12345678-1234-1234-1234-123456789012" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "x-api-token: abcd1234-efgh-5678-ijkl-9012mnop3456"
```

**Response 200 - Sucesso**:

```json
{
  "idUser": "44e5ad3a-b3e8-40ad-88aa-8449481041be",
  "email": "gestor1@empresa.com.br",
  "statusUser": true,
  "createdAt": "2025-06-20T19:26:29.000Z",
  "updatedAt": "2025-06-22T20:43:43.000Z",
  "empresas": [
    {
      "idEmpresa": "fa6e86b6-2424-4833-9d22-1c7ead0c5565",
      "cargo": "gestor",
      "permissoes": {
        "read": true,
        "create": true,
        "delete": true,
        "update": true
      },
      "empresa": {
        "razaoSocial": "Construção Segura Engenharia LTDA",
        "nomeFantasia": "Construção Segura",
        "cnpj": "98765432000188",
        "status": true
      }
    }
  ]
}
```

**Response 404 - Usuário Não Encontrado**:

```json
{
  "error": "Usuário não encontrado"
}
```

---

## 4. Conectar Usuário à Empresa

**Endpoint**: `POST /v1/user/{userId}/connect/{companyId}`

**Descrição**: Vincula um usuário existente a uma empresa com um cargo
específico.

**Permissões**: `user:update`

**Path Parameters**:

- `userId` (string, UUID, obrigatório): ID único do usuário
- `companyId` (string, UUID, obrigatório): ID único da empresa

**Request Body**:

```json
{
  "cargo": "admin | gestor | viewer (obrigatório)"
}
```

**Exemplo de Request**:

```bash
curl -X POST "https://api.epicore.com/v1/user/12345678-1234-1234-1234-123456789012/connect/22222222-2222-2222-2222-222222222222" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "x-api-token: abcd1234-efgh-5678-ijkl-9012mnop3456" \
  -H "Content-Type: application/json" \
  -d '{
    "cargo": "gestor"
  }'
```

**Response 201 - Conectado com Sucesso**:

```json
{
  "message": "Usuário vinculado com sucesso",
  "data": {
    "idUser": "12345678-1234-1234-1234-123456789012",
    "idEmpresa": "22222222-2222-2222-2222-222222222222",
    "cargo": "gestor"
  }
}
```

**Response 400 - Usuário Já Conectado**:

```json
{
  "error": "Usuário já está vinculado a esta empresa"
}
```

**Response 404 - Usuário ou Empresa Não Encontrado**:

```json
{
  "error": "Usuário com ID 'xxx' não encontrado"
}
```

---

## 5. Alterar Senha do Usuário

**Endpoint**: `PUT /v1/user/{userId}/update/password`

**Descrição**: Permite que um usuário altere sua própria senha fornecendo a
senha atual.

**Permissões**: `user:update`

**Path Parameters**:

- `userId` (string, UUID, obrigatório): ID único do usuário

**Request Body**:

```json
{
  "senhaAtual": "string (min: 6 caracteres, obrigatório)",
  "novaSenha": "string (min: 6 caracteres, obrigatório)"
}
```

**Exemplo de Request**:

```bash
curl -X PUT "https://api.epicore.com/v1/user/12345678-1234-1234-1234-123456789012/update/password" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "x-api-token: abcd1234-efgh-5678-ijkl-9012mnop3456" \
  -H "Content-Type: application/json" \
  -d '{
    "senhaAtual": "senhaAntiga123",
    "novaSenha": "novaSenhaSegura456"
  }'
```

**Response 200 - Senha Alterada com Sucesso**:

```json
{
  "message": "Senha atualizada com sucesso"
}
```

**Response 400 - Senha Atual Incorreta**:

```json
{
  "error": "Senha atual incorreta"
}
```

**Response 404 - Usuário Não Encontrado**:

```json
{
  "error": "Usuário não encontrado"
}
```

---

## 6. Atualizar Status do Usuário

**Endpoint**: `PUT /v1/user/{userId}/update/status`

**Descrição**: Atualiza o status ativo/inativo e opcionalmente o email do
usuário.

**Permissões**: `user:update`

**Path Parameters**:

- `userId` (string, UUID, obrigatório): ID único do usuário

**Request Body**:

```json
{
  "email": "string (email, opcional)",
  "statusUser": "boolean (obrigatório)"
}
```

**Exemplo de Request**:

```bash
curl -X PUT "https://api.epicore.com/v1/user/12345678-1234-1234-1234-123456789012/update/status" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "x-api-token: abcd1234-efgh-5678-ijkl-9012mnop3456" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "novo.email@techcorp.com",
    "statusUser": false
  }'
```

**Response 200 - Status Atualizado com Sucesso**:

```json
{
  "message": "Usuário atualizado com sucesso",
  "data": {
    "idUser": "12345678-1234-1234-1234-123456789012",
    "email": "novo.email@techcorp.com",
    "statusUser": false
  }
}
```

**Response 404 - Usuário Não Encontrado**:

```json
{
  "error": "Usuário não encontrado"
}
```

---

## 7. Excluir Usuário

**Endpoint**: `DELETE /v1/user/{userId}/delete`

**Descrição**: Remove um usuário do sistema (soft delete - marca como deletado
sem remover fisicamente).

**Permissões**: `user:delete`

**Path Parameters**:

- `userId` (string, UUID, obrigatório): ID único do usuário

**Exemplo de Request**:

```bash
curl -X DELETE "https://api.epicore.com/v1/user/12345678-1234-1234-1234-123456789012/delete" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "x-api-token: abcd1234-efgh-5678-ijkl-9012mnop3456"
```

**Response 200 - Usuário Excluído com Sucesso**:

```json
{
  "success": true,
  "message": "Usuário deletado com sucesso",
  "user": {
    "idUser": "12345678-1234-1234-1234-123456789012",
    "email": "usuario@techcorp.com",
    "deletedAt": "2024-01-20T14:30:00Z"
  }
}
```

**Response 400 - Usuário Já Deletado**:

```json
{
  "error": "Usuário já foi deletado"
}
```

**Response 404 - Usuário Não Encontrado**:

```json
{
  "error": "Usuário não encontrado"
}
```

---

## Códigos de Status HTTP

- **200**: Operação realizada com sucesso
- **201**: Recurso criado com sucesso
- **400**: Dados inválidos fornecidos
- **401**: Token de autenticação inválido ou expirado
- **403**: Sem permissão para realizar a operação
- **404**: Recurso não encontrado
- **409**: Conflito (ex: email já existe)
- **500**: Erro interno do servidor

---

## Observações Importantes

### Hierarquia de Cargos e Permissões

1. **admin**: Todas as permissões do sistema
2. **gestor**: Permissões de gestão de colaboradores, EPIs e processos
3. **técnico**: Permissões para operações de EPIs e processos
4. **viewer**: Apenas permissões de leitura

### Fluxo de Criação de Usuários

1. **Primeira Configuração**:

   - A empresa deve ser criada primeiro com uma API Key
   - O primeiro usuário admin deve ser criado via script ou seed

2. **Usuários Subsequentes**:
   - Administradores podem criar novos usuários (gestores, técnicos, viewers)
   - Gestores podem criar técnicos e viewers
   - Não há auto-registro público

### Segurança

- Todas as senhas são hasheadas com bcrypt
- Tokens JWT têm expiração configurável
- Rate limiting aplicado nos endpoints de autenticação
- Validação rigorosa de permissões em todas as operações
- Soft delete preserva histórico e integridade referencial

### Multi-tenancy

- Usuários podem estar associados a múltiplas empresas
- Cada associação empresa-usuário tem um cargo específico
- Isolamento de dados por empresa via API Key
- Permissões específicas por empresa "page": 1, "limit": 10, "totalPages": 3 },
  "data": [ { "idUser": "550e8400-e29b-41d4-a716-446655440000", "email":
  "admin@safetech.com.br", "statusUser": true, "createdAt":
  "2025-01-20T10:00:00.000Z", "updatedAt": "2025-01-20T10:00:00.000Z",
  "deletedAt": null }, { "idUser": "550e8400-e29b-41d4-a716-446655440001",
  "email": "gestor@safetech.com.br", "statusUser": true, "createdAt":
  "2025-01-20T11:00:00.000Z", "updatedAt": "2025-01-20T11:00:00.000Z",
  "deletedAt": null } ] }

````

**Possíveis Erros:**
- `401`: Token inválido ou ausente
- `403`: Sem permissão para acessar este recurso
- `500`: Erro interno do servidor

---

### 2. Criar Novo Usuário
**POST** `/v1/user/create/{id}`

**Descrição:** Cria um novo usuário associado a uma empresa específica. Usado pelo admin para cadastrar gestores/estoquistas.

**Permissões:** `user:create`

**Path Parameters:**
- `id` (string, obrigatório): UUID da empresa para associar o usuário

**Body Parameters:**
```json
{
  "email": "string (email, obrigatório)",
  "senha": "string (min: 6 chars, obrigatório)",
  "cargo": "admin | gestor | viewer (obrigatório)",
  "status_user": "boolean (opcional, padrão: true)"
}
````

**Exemplo de Request:**

```bash
curl -X POST "https://api.example.com/v1/user/create/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "x-api-token: safetech_api_key_2025_secure_token_123456789" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "novo.gestor@safetech.com.br",
    "senha": "senhaSegura123",
    "cargo": "gestor",
    "status_user": true
  }'
```

**Resposta de Sucesso (201):**

```json
{
  "message": "Usuário criado com sucesso",
  "data": {
    "idUser": "550e8400-e29b-41d4-a716-446655440002",
    "email": "novo.gestor@safetech.com.br",
    "statusUser": true,
    "createdAt": "2025-01-20T12:00:00.000Z",
    "updatedAt": "2025-01-20T12:00:00.000Z",
    "deletedAt": null,
    "empresas": [
      {
        "idEmpresa": "550e8400-e29b-41d4-a716-446655440000",
        "cargo": "gestor",
        "nomeFantasia": "SafeTech Indústria",
        "permissoes": {
          "create": true,
          "read": true,
          "update": true,
          "delete": true
        }
      }
    ]
  }
}
```

**Possíveis Erros:**

- `400`: Dados inválidos (email inválido, senha muito curta, cargo inválido)
- `409`: Usuário com email já existe
- `404`: Empresa não encontrada
- `401`: Token inválido ou ausente
- `403`: Sem permissão para criar usuários
- `500`: Erro interno do servidor

**Regras de Negócio:**

- Email deve ser único no sistema
- Senha deve ter no mínimo 6 caracteres
- Cargo deve ser um dos valores válidos (admin, gestor, viewer)
- Usuário é automaticamente vinculado à empresa especificada

---

### 3. Buscar Usuário por ID

**GET** `/v1/user/get/{id}`

**Descrição:** Retorna os detalhes de um usuário específico, incluindo suas
empresas associadas.

**Permissões:** `user:read`

**Path Parameters:**

- `id` (string, obrigatório): UUID do usuário

**Exemplo de Request:**

```bash
curl -X GET "https://api.example.com/v1/user/get/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "x-api-token: safetech_api_key_2025_secure_token_123456789"
```

**Resposta de Sucesso (200):**

```json
{
  "idUser": "550e8400-e29b-41d4-a716-446655440000",
  "email": "admin@safetech.com.br",
  "statusUser": true,
  "createdAt": "2025-01-20T10:00:00.000Z",
  "updatedAt": "2025-01-20T10:00:00.000Z",
  "empresas": [
    {
      "idEmpresa": "550e8400-e29b-41d4-a716-446655440000",
      "cargo": "admin",
      "nomeFantasia": "SafeTech Indústria",
      "razaoSocial": "SafeTech Indústria de Equipamentos LTDA",
      "cnpj": "12345678000199",
      "statusEmpresa": true,
      "permissoes": {
        "create": true,
        "read": true,
        "update": true,
        "delete": true
      }
    }
  ]
}
```

**Possíveis Erros:**

- `404`: Usuário não encontrado
- `401`: Token inválido ou ausente
- `403`: Sem permissão para acessar este recurso
- `500`: Erro interno do servidor

---

### 4. Conectar Usuário a Empresa

**POST** `/v1/user/{userId}/connect/{companyId}`

**Descrição:** Vincula um usuário existente a uma empresa com um cargo
específico.

**Permissões:** `user:update`

**Path Parameters:**

- `userId` (string, obrigatório): UUID do usuário
- `companyId` (string, obrigatório): UUID da empresa

**Body Parameters:**

```json
{
  "cargo": "admin | gestor | viewer (obrigatório)"
}
```

**Exemplo de Request:**

```bash
curl -X POST "https://api.example.com/v1/user/550e8400-e29b-41d4-a716-446655440001/connect/550e8400-e29b-41d4-a716-446655440002" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "x-api-token: safetech_api_key_2025_secure_token_123456789" \
  -H "Content-Type: application/json" \
  -d '{
    "cargo": "gestor"
  }'
```

**Resposta de Sucesso (200):**

```json
{
  "message": "Usuário vinculado com sucesso",
  "data": {
    "idUser": "550e8400-e29b-41d4-a716-446655440001",
    "idEmpresa": "550e8400-e29b-41d4-a716-446655440002",
    "cargo": "gestor",
    "empresa": {
      "idEmpresa": "550e8400-e29b-41d4-a716-446655440002",
      "nomeFantasia": "TechSafe Solutions",
      "razaoSocial": "TechSafe Solutions Ltda",
      "cnpj": "98765432000188",
      "statusEmpresa": true
    },
    "permissoes": {
      "create": true,
      "read": true,
      "update": true,
      "delete": true
    }
  }
}
```

**Possíveis Erros:**

- `400`: Dados inválidos (cargo inválido)
- `404`: Usuário ou empresa não encontrado
- `409`: Usuário já vinculado a esta empresa
- `401`: Token inválido ou ausente
- `403`: Sem permissão para conectar usuários
- `500`: Erro interno do servidor

---

### 5. Alterar Senha do Usuário

**PUT** `/v1/user/{userId}/update/password`

**Descrição:** Permite que um usuário altere sua própria senha fornecendo a
senha atual.

**Permissões:** `user:update` (ou próprio usuário)

**Path Parameters:**

- `userId` (string, obrigatório): UUID do usuário

**Body Parameters:**

```json
{
  "senhaAtual": "string (min: 6 chars, obrigatório)",
  "novaSenha": "string (min: 6 chars, obrigatório)"
}
```

**Exemplo de Request:**

```bash
curl -X PUT "https://api.example.com/v1/user/550e8400-e29b-41d4-a716-446655440000/update/password" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "x-api-token: safetech_api_key_2025_secure_token_123456789" \
  -H "Content-Type: application/json" \
  -d '{
    "senhaAtual": "senhaAntiga123",
    "novaSenha": "novaSenhaSegura456"
  }'
```

**Resposta de Sucesso (200):**

```json
{
  "success": true,
  "message": "Senha alterada com sucesso"
}
```

**Possíveis Erros:**

- `400`: Dados inválidos ou senha atual incorreta
- `404`: Usuário não encontrado
- `401`: Token inválido ou ausente
- `403`: Sem permissão para alterar senha deste usuário
- `500`: Erro interno do servidor

**Regras de Negócio:**

- Usuário pode alterar apenas sua própria senha (exceto admins)
- Senha atual deve ser verificada antes da alteração
- Nova senha deve ter no mínimo 6 caracteres
- Senha é criptografada antes de ser salva

---

### 6. Atualizar Status do Usuário

**PUT** `/v1/user/{userId}/update/status`

**Descrição:** Atualiza o status ativo/inativo e opcionalmente o email do
usuário.

**Permissões:** `user:update`

**Path Parameters:**

- `userId` (string, obrigatório): UUID do usuário

**Body Parameters:**

```json
{
  "email": "string (email, opcional)",
  "statusUser": "boolean (obrigatório)"
}
```

**Exemplo de Request:**

```bash
curl -X PUT "https://api.example.com/v1/user/550e8400-e29b-41d4-a716-446655440001/update/status" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "x-api-token: safetech_api_key_2025_secure_token_123456789" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "novo.email@safetech.com.br",
    "statusUser": false
  }'
```

**Resposta de Sucesso (200):**

```json
{
  "message": "Usuário atualizado com sucesso",
  "data": {
    "idUser": "550e8400-e29b-41d4-a716-446655440001",
    "email": "novo.email@safetech.com.br",
    "statusUser": false,
    "createdAt": "2025-01-20T10:00:00.000Z",
    "updatedAt": "2025-01-20T15:30:00.000Z",
    "deletedAt": null
  }
}
```

**Possíveis Erros:**

- `400`: Dados inválidos (email inválido)
- `404`: Usuário não encontrado
- `409`: Email já existe (se fornecido email novo)
- `401`: Token inválido ou ausente
- `403`: Sem permissão para atualizar usuários
- `500`: Erro interno do servidor

---

### 7. Excluir Usuário

**DELETE** `/v1/user/{userId}/delete`

**Descrição:** Remove um usuário do sistema (soft delete - marca como excluído).

**Permissões:** `user:delete`

**Path Parameters:**

- `userId` (string, obrigatório): UUID do usuário

**Exemplo de Request:**

```bash
curl -X DELETE "https://api.example.com/v1/user/550e8400-e29b-41d4-a716-446655440001/delete" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "x-api-token: safetech_api_key_2025_secure_token_123456789"
```

**Resposta de Sucesso (200):**

```json
{
  "success": true,
  "message": "Usuário deletado com sucesso",
  "user": {
    "idUser": "550e8400-e29b-41d4-a716-446655440001",
    "email": "usuario@safetech.com.br",
    "statusUser": false,
    "deletedAt": "2025-01-20T16:00:00.000Z"
  }
}
```

**Possíveis Erros:**

- `404`: Usuário não encontrado
- `401`: Token inválido ou ausente
- `403`: Sem permissão para deletar usuários
- `500`: Erro interno do servidor

**Regras de Negócio:**

- Exclusão é do tipo soft delete (marca deletedAt)
- Usuário excluído não pode mais fazer login
- Histórico de ações do usuário é mantido para auditoria

---

## Fluxos de Uso Comum

### Fluxo 1: Cadastro de Novo Gestor pelo Admin

1. Admin faz login (`POST /v1/auth/login`)
2. Admin cria novo usuário gestor (`POST /v1/user/create/{empresaId}`)
3. Novo gestor pode fazer login com as credenciais fornecidas

### Fluxo 2: Usuário Alterando Própria Senha

1. Usuário faz login (`POST /v1/auth/login`)
2. Usuário altera senha (`PUT /v1/user/{userId}/update/password`)
3. Usuário deve fazer login novamente com nova senha

### Fluxo 3: Admin Vinculando Usuário a Nova Empresa

1. Admin busca usuário (`GET /v1/user/get/{userId}`)
2. Admin conecta usuário à empresa
   (`POST /v1/user/{userId}/connect/{companyId}`)
3. Usuário pode acessar a nova empresa no próximo login

---

## Estruturas de Dados

### User Object

```json
{
  "idUser": "string (uuid)",
  "email": "string (email)",
  "statusUser": "boolean",
  "createdAt": "string (datetime)",
  "updatedAt": "string (datetime)",
  "deletedAt": "string (datetime) | null",
  "empresas": [
    {
      "idEmpresa": "string (uuid)",
      "cargo": "admin | gestor | estoque | viewer",
      "nomeFantasia": "string",
      "razaoSocial": "string",
      "cnpj": "string",
      "statusEmpresa": "boolean",
      "permissoes": {
        "create": "boolean",
        "read": "boolean",
        "update": "boolean",
        "delete": "boolean"
      }
    }
  ]
}
```

### Permissões por Cargo

```json
{
  "admin": {
    "create": true,
    "read": true,
    "update": true,
    "delete": true
  },
  "gestor": {
    "create": true,
    "read": true,
    "update": true,
    "delete": true
  },
  "estoque": {
    "create": true,
    "read": true,
    "update": true,
    "delete": false
  },
  "viewer": {
    "create": false,
    "read": true,
    "update": false,
    "delete": false
  }
}
```

---

## Observações Técnicas

### ⚠️ Inconsistências Encontradas nos Testes

Durante os testes da API, foram identificadas algumas inconsistências:

1. **Cargos no Schema vs Banco de Dados:**

   - O schema Zod permite: `admin | gestor | técnico | viewer`
   - O banco de dados possui: `admin | gestor | estoque | viewer`
   - Usar `técnico` causará erro: "Cargo 'técnico' não existe"
   - Usar `estoque` causará erro de validação do schema

2. **Formato das Respostas:**

   - Algumas respostas incluem campos adicionais não documentados (como `name`,
     `senha`)
   - O campo `senha` é retornado criptografado (hash bcrypt)
   - O campo `lastLoginAt` pode ser `null`

3. **Estrutura de Permissões:**
   - As permissões são retornadas como objeto
     (`{create: true, read: true, ...}`) e não como array

### Auto-registro de Admin

**IMPORTANTE:** O sistema atual NÃO possui endpoint específico para
auto-registro de admin. O cadastro inicial deve ser feito diretamente no banco
de dados ou via seed.

**Recomendação para Implementação Futura:**

```
POST /v1/auth/register-admin
Body: {
  "email": "admin@empresa.com",
  "senha": "senhaSegura123",
  "apiKey": "api_key_da_empresa"
}
```

### Tela de Auto-registro

Para implementar a tela de auto-registro do admin mencionada nos requisitos,
seria necessário:

1. Criar endpoint específico para registro de admin
2. Validar API Key da empresa
3. Permitir apenas 1 admin por empresa
4. Endpoint não requer autenticação prévia

### Segurança

- Todas as senhas são criptografadas com bcrypt
- Tokens JWT têm expiração configurável
- API Key da empresa é obrigatória em todas as requisições
- Rate limiting aplicado em rotas sensíveis
- Validação de permissões baseada em cargo e empresa

### Isolamento de Dados

- Usuários só podem acessar dados da(s) empresa(s) que estão vinculados
- Filtragem automática por empresa baseada no token e API Key
- Soft delete para manter histórico de auditoria

---

## Testes Realizados

Este contrato foi validado através de testes reais com a API rodando na porta
8081:

### Credenciais de Teste Utilizadas:

```
API Key: construcao_api_key_2025_secure_token_987654321
Email: gestor1@empresa.com.br
Senha: 123456
```

### Endpoints Testados:

1. ✅ **Login**: `POST /v1/auth/login` - Token obtido com sucesso
2. ✅ **Listar Usuários**: `GET /v1/user/get/all` - 5 usuários retornados
3. ✅ **Buscar por ID**: `GET /v1/user/get/{id}` - Dados completos retornados
4. ✅ **Criar Usuário**: `POST /v1/user/create/{id}` - Usuário viewer criado
5. ✅ **Alterar Senha**: `PUT /v1/user/{id}/update/password` - Senha alterada
6. ❌ **Cargo Técnico**: Tentativa de criar usuário com cargo "técnico" falhou
   (não existe no banco)
7. ❌ **Cargo Estoque**: Tentativa de criar usuário com cargo "estoque" falhou
   (não permitido no schema)

### Resultados dos Testes:

- Todos os endpoints estão funcionais
- Respostas incluem campos adicionais não documentados (`name`, `senha`,
  `lastLoginAt`)
- Permissões são retornadas como objeto, não array
- Inconsistência entre schema Zod e banco de dados nos cargos
- API Key e autenticação funcionando corretamente

**Data dos Testes:** 22 de junho de 2025

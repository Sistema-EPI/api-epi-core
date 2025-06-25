# Contrato API - Módulo de Usuários

Este documento descreve todas as rotas disponíveis para o módulo de usuários da
API EPI Core.

## Base URL

```
https://hml-service.barcelosengenharia.com/v1/user
```

## Autenticação

Todas as rotas requerem autenticação via token JWT no header:

```
Authorization: Bearer <token>
```

## Permissões

As rotas também requerem permissões específicas:

- `user:read` - Leitura de usuários
- `user:create` - Criação de usuários
- `user:update` - Atualização de usuários
- `user:delete` - Exclusão de usuários
- `admin:create` - Criação de usuários administradores
- `company:create` - Criação de empresas (apenas master)
- `system:admin` - Administração do sistema (apenas master)

---

## 1. Listar Todos os Usuários

**Endpoint:** `GET /get/all`

**Permissão:** `user:read`

**Query Parameters:**

- `page` (opcional): Número da página
- `limit` (opcional): Limite de registros por página

**Response 200:**

```json
{
  "success": true,
  "message": "Usuários recuperados com sucesso",
  "data": [
    {
      "idUser": "uuid",
      "email": "usuario@email.com",
      "statusUser": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "deletedAt": null
    }
  ]
}
```

---

## 2. Criar Usuário para Empresa

**Endpoint:** `POST /create/{companyId}`

**Permissão:** `user:create`

**Path Parameters:**

- `companyId` (required): ID da empresa

**Request Body:**

```json
{
  "email": "usuario@empresa.com",
  "senha": "senha123",
  "cargo": "GESTOR",
  "status_user": true
}
```

**Response 201:**

```json
{
  "success": true,
  "message": "Usuário criado com sucesso",
  "data": {
    "idUser": "uuid",
    "email": "usuario@empresa.com",
    "statusUser": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "deletedAt": null
  }
}
```

---

## 3. Buscar Usuário por ID

**Endpoint:** `GET /get/{userId}`

**Permissão:** `user:read`

**Path Parameters:**

- `userId` (required): ID do usuário

**Response 200:**

```json
{
  "success": true,
  "message": "Usuário encontrado com sucesso",
  "data": {
    "idUser": "uuid",
    "email": "usuario@email.com",
    "statusUser": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "deletedAt": null
  }
}
```

---

## 4. Conectar Usuário à Empresa

**Endpoint:** `POST /{userId}/connect/{companyId}`

**Permissão:** `user:update`

**Path Parameters:**

- `userId` (required): ID do usuário
- `companyId` (required): ID da empresa

**Request Body:**

```json
{
  "cargo": "GESTOR"
}
```

**Response 200:**

```json
{
  "success": true,
  "message": "Usuário conectado à empresa com sucesso",
  "data": {
    "idUser": "uuid",
    "idEmpresa": "uuid",
    "cargo": "GESTOR",
    "user": {
      "idUser": "uuid",
      "email": "usuario@email.com",
      "statusUser": true
    },
    "empresa": {
      "idEmpresa": "uuid",
      "nomeFantasia": "Empresa Teste",
      "razaoSocial": "Empresa Teste LTDA"
    }
  }
}
```

---

## 5. Alterar Senha do Usuário

**Endpoint:** `PUT /{userId}/update/password`

**Permissão:** `user:update`

**Path Parameters:**

- `userId` (required): ID do usuário

**Request Body:**

```json
{
  "senhaAtual": "senhaAtual123",
  "novaSenha": "novaSenha123"
}
```

**Response 200:**

```json
{
  "success": true,
  "message": "Senha alterada com sucesso"
}
```

---

## 6. Atualizar Status do Usuário

**Endpoint:** `PUT /{userId}/update/status`

**Permissão:** `user:update`

**Path Parameters:**

- `userId` (required): ID do usuário

**Request Body:**

```json
{
  "email": "novo@email.com",
  "statusUser": false
}
```

**Response 200:**

```json
{
  "success": true,
  "message": "Status do usuário atualizado com sucesso",
  "data": {
    "idUser": "uuid",
    "email": "novo@email.com",
    "statusUser": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "deletedAt": null
  }
}
```

---

## 7. Excluir Usuário

**Endpoint:** `DELETE /{userId}/delete`

**Permissão:** `user:delete`

**Path Parameters:**

- `userId` (required): ID do usuário

**Response 200:**

```json
{
  "success": true,
  "message": "Usuário excluído com sucesso"
}
```

---

## 8. Buscar Usuários por Empresa

**Endpoint:** `GET /company/{companyId}`

**Permissão:** `user:read`

**Path Parameters:**

- `companyId` (required): ID da empresa

**Query Parameters:**

- `page` (opcional): Número da página
- `limit` (opcional): Limite de registros por página

**Response 200:**

```json
{
  "success": true,
  "message": "Usuários da empresa recuperados com sucesso",
  "data": [
    {
      "idUser": "uuid",
      "email": "usuario@empresa.com",
      "statusUser": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "deletedAt": null
    }
  ]
}
```

---

## 9. Criar Usuário Administrador

**Endpoint:** `POST /admin/create`

**Permissão:** `admin:create`

**Request Body:**

```json
{
  "email": "admin@sistema.com",
  "senha": "adminPassword123"
}
```

**Response 201:**

```json
{
  "success": true,
  "message": "Usuário administrador criado com sucesso",
  "data": {
    "idUser": "uuid",
    "email": "admin@sistema.com",
    "statusUser": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "deletedAt": null
  }
}
```

---

## Enums Disponíveis

### Cargos (Role)

- `MASTER` - Super administrador do sistema (acesso total)
- `ADMIN` - Administrador da empresa
- `GESTOR` - Gestor da empresa
- `OPERADOR` - Operador/funcionário

### Status de Usuário

- `true` - Usuário ativo
- `false` - Usuário inativo

---

## Códigos de Erro Comuns

- **400** - Dados inválidos fornecidos
- **401** - Token de autenticação inválido ou ausente
- **403** - Permissão insuficiente para a operação
- **404** - Recurso não encontrado (usuário, empresa, etc.)
- **409** - Conflito (email já existe, usuário já conectado à empresa)
- **500** - Erro interno do servidor

---

## Observações Importantes

1. **Paginação**: As rotas de listagem suportam paginação opcional via query
   parameters `page` e `limit`

2. **Soft Delete**: A exclusão de usuários é feita via soft delete (campo
   `deletedAt`)

3. **Validações de Email**: Todos os emails são validados quanto ao formato

4. **Senhas**: Todas as senhas devem ter no mínimo 6 caracteres

5. **UUIDs**: Todos os IDs são no formato UUID v4

6. **Timestamps**: Todas as datas são retornadas no formato ISO 8601 (UTC)

7. **Case Sensitivity**: Os cargos devem ser fornecidos em maiúsculas (ADMIN,
   GESTOR, OPERADOR, MASTER)

---

## Usuário Master (Seed)

Um usuário master é criado automaticamente no seed do banco para administração
do sistema:

- **Email:** `master@system.admin`
- **Senha:** `123456`
- **Role:** `master`
- **Permissões:** Acesso total a todas as empresas e funcionalidades
- **Uso:** Criação de admins, empresas e administração geral do sistema

---

## Resumo das Funções Implementadas

✅ **getAllUsers()** - `GET /get/all` - Listar todos os usuários ✅
**createUser()** - `POST /create/{companyId}` - Criar usuário para empresa ✅
**updateUserPassword()** - `PUT /{userId}/update/password` - Alterar senha ✅
**updateUserStatus()** - `PUT /{userId}/update/status` - Ativar/desativar
usuário ✅ **deleteUser()** - `DELETE /{userId}/delete` - Excluir usuário ✅
**getUserById()** - `GET /get/{userId}` - Buscar usuário por ID ✅
**connectUserToCompany()** - `POST /{userId}/connect/{companyId}` - Conectar
usuário à empresa ✅ **getUsersByCompany()** - `GET /company/{companyId}` -
Usuários por empresa ✅ **createAdminUser()** - `POST /admin/create` - Criar
admin específico

# Explicação do Campo `entityId` no Sistema de Logs

## 🤔 O que é o `entityId`?

O `entityId` é o **ID da entidade específica** que está sendo logada. É uma
forma genérica de referenciar qualquer registro do sistema.

## 📊 Schema Atual vs Schema Otimizado

### Schema Atual (com campos específicos)

```prisma
model Log {
  idLog         String    @id @default(uuid())
  tipo          String
  body          String?
  idEpi         String?   // ID específico do EPI
  idUser        String?   // ID específico do Usuário
  idColaborador String?   // ID específico do Colaborador
  idProcesso    String?   // ID específico do Processo
  // ... outros campos
}
```

### Schema Otimizado (com entityId genérico)

```prisma
model Log {
  idLog      String @id @default(uuid())
  tipo       String
  body       String?
  entityType String // Tipo da entidade: "EPI", "USER", "COLLABORATOR", "PROCESS"
  entityId   String // ID genérico da entidade
  // ... outros campos
}
```

## 🎯 Exemplos Práticos do `entityId`

### Exemplo 1: Log de EPI

```sql
-- No schema atual
INSERT INTO log (tipo, id_epi, id_user, id_colaborador, id_processo)
VALUES ('EPI_CREATED', 'epi-123', NULL, NULL, NULL);

-- No schema otimizado
INSERT INTO log (tipo, entity_type, entity_id)
VALUES ('EPI_CREATED', 'EPI', 'epi-123');
```

- **entityType**: `"EPI"`
- **entityId**: `"epi-123"` (o ID do EPI específico)

### Exemplo 2: Log de Processo

```sql
-- No schema atual
INSERT INTO log (tipo, id_epi, id_user, id_colaborador, id_processo)
VALUES ('PROCESS_DELIVERED', NULL, NULL, 'col-456', 'proc-789');

-- No schema otimizado
INSERT INTO log (tipo, entity_type, entity_id)
VALUES ('PROCESS_DELIVERED', 'PROCESS', 'proc-789');
```

- **entityType**: `"PROCESS"`
- **entityId**: `"proc-789"` (o ID do processo específico)

### Exemplo 3: Log de Usuário

```sql
-- No schema atual
INSERT INTO log (tipo, id_epi, id_user, id_colaborador, id_processo)
VALUES ('USER_CREATED', NULL, 'user-321', NULL, NULL);

-- No schema otimizado
INSERT INTO log (tipo, entity_type, entity_id)
VALUES ('USER_CREATED', 'USER', 'user-321');
```

- **entityType**: `"USER"`
- **entityId**: `"user-321"` (o ID do usuário específico)

## 🔍 Como Funciona na Prática

### Criando um Log de EPI

```typescript
// Quando um EPI é criado
const epi = {
  idEpi: '550e8400-e29b-41d4-a716-446655440000',
  nomeEpi: 'Capacete de Segurança',
  ca: '12345',
  // ... outros dados
};

// Log no schema otimizado
await LogService.createLog({
  tipo: 'EPI_CREATED',
  entityType: 'EPI', // Tipo da entidade
  entityId: epi.idEpi, // ID específico do EPI
  companyId: 'company-uuid',
  userId: 'user-uuid',
  body: {
    /* dados do log */
  },
});
```

### Criando um Log de Processo

```typescript
// Quando um processo é entregue
const processo = {
  idProcesso: '550e8400-e29b-41d4-a716-446655440001',
  idColaborador: 'colaborador-uuid',
  dataEntrega: new Date(),
  // ... outros dados
};

// Log no schema otimizado
await LogService.createLog({
  tipo: 'PROCESS_DELIVERED',
  entityType: 'PROCESS', // Tipo da entidade
  entityId: processo.idProcesso, // ID específico do processo
  companyId: 'company-uuid',
  userId: 'user-uuid',
  body: {
    /* dados do log */
  },
});
```

## 🎯 Vantagens do `entityId` Genérico

### ✅ Eliminação de Campos Vazios

```sql
-- Schema atual: Muitos NULLs
| tipo         | id_epi | id_user | id_colaborador | id_processo |
|--------------|--------|---------|----------------|-------------|
| EPI_CREATED  | epi-1  | NULL    | NULL           | NULL        |
| USER_CREATED | NULL   | user-1  | NULL           | NULL        |
| PROC_CREATED | NULL   | NULL    | NULL           | proc-1      |

-- Schema otimizado: Sem NULLs
| tipo         | entity_type | entity_id |
|--------------|-------------|-----------|
| EPI_CREATED  | EPI         | epi-1     |
| USER_CREATED | USER        | user-1    |
| PROC_CREATED | PROCESS     | proc-1    |
```

### ✅ Queries Mais Simples

```sql
-- Buscar logs de um EPI específico

-- Schema atual
SELECT * FROM log WHERE id_epi = 'epi-123';

-- Schema otimizado
SELECT * FROM log WHERE entity_type = 'EPI' AND entity_id = 'epi-123';
```

### ✅ Flexibilidade para Novas Entidades

```typescript
// Adicionar logs para uma nova entidade "COMPANY" sem migração
await LogService.createLog({
  tipo: 'COMPANY_UPDATED',
  entityType: 'COMPANY', // Nova entidade
  entityId: 'company-456', // ID da empresa
  companyId: 'company-456',
  userId: 'user-uuid',
});
```

## 🔄 Relacionamento com Dados Reais

### Como Buscar Dados da Entidade

```typescript
// Buscar logs e depois os dados reais da entidade
const logs = await LogService.getEntityLogs('EPI', 'epi-123');

// Para cada log, buscar dados reais se necessário
for (const log of logs) {
  let entityData = null;

  switch (log.entityType) {
    case 'EPI':
      entityData = await prisma.epi.findUnique({
        where: { idEpi: log.entityId }, // entityId = "epi-123"
      });
      break;

    case 'PROCESS':
      entityData = await prisma.process.findUnique({
        where: { idProcesso: log.entityId }, // entityId = "proc-456"
      });
      break;

    case 'USER':
      entityData = await prisma.user.findUnique({
        where: { idUser: log.entityId }, // entityId = "user-789"
      });
      break;
  }

  console.log(`Log: ${log.tipo}, Entidade: ${entityData.nome}`);
}
```

## 📋 Resumo Simples

**O `entityId` é simplesmente o ID da "coisa" que está sendo logada:**

- Se o log é sobre um **EPI** → `entityId` = ID do EPI
- Se o log é sobre um **Processo** → `entityId` = ID do Processo
- Se o log é sobre um **Usuário** → `entityId` = ID do Usuário
- Se o log é sobre um **Colaborador** → `entityId` = ID do Colaborador

**Ao invés de ter 4 colunas diferentes (idEpi, idUser, idColaborador,
idProcesso) onde 3 ficam sempre vazias, temos:**

- **1 coluna** `entityType` que diz "que tipo de coisa é"
- **1 coluna** `entityId` que diz "qual é o ID dessa coisa"

Isso elimina campos vazios e torna o sistema mais flexível e eficiente! 🚀

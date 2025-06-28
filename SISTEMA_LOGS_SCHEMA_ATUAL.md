# Sistema de Logs - Abordagem com Schema Atual

## 📋 Análise da Tabela Log Existente

### Estrutura Atual

```prisma
model Log {
  idLog         String    @id @default(uuid()) @map("id_log") @db.VarChar(36)
  idUser        String?   @map("id_user") @db.VarChar(36)
  idColaborador String?   @map("id_colaborador") @db.VarChar(36)
  idProcesso    String?   @map("id_processo") @db.VarChar(36)
  idEpi         String?   @map("id_epi") @db.VarChar(36)
  body          Json
  tipo          String    @db.VarChar(20)
  timestamp     DateTime? @db.Timestamp(0)

  // Relacionamentos
  usuario     User?         @relation(fields: [idUser], references: [idUser], onDelete: Cascade)
  colaborador Collaborator? @relation(fields: [idColaborador], references: [idColaborador], onDelete: Cascade)
  processo    Process?      @relation(fields: [idProcesso], references: [idProcesso], onDelete: Cascade)
  epi         Epi?          @relation(fields: [idEpi], references: [idEpi], onDelete: Cascade)
}
```

### ⚠️ Problemas Identificados

1. **Campos Vazios**: Em cada log, 3 das 4 colunas de FK ficam NULL
2. **Desperdício de Espaço**: ~75% dos campos de entidade são desperdiçados
3. **Complexidade de Queries**: Múltiplos ORs para buscar logs de empresa
4. **Rigidez**: Limitado às 4 entidades atuais (EPI, User, Collaborator,
   Process)
5. **Extensibilidade Limitada**: Nova entidade = migração obrigatória

### ✅ Vantagens da Abordagem Atual

1. **Não Requer Migração**: Usa estrutura existente
2. **Relacionamentos Diretos**: FKs explícitas com constraints
3. **Integridade Referencial**: Constraints automáticas do banco
4. **Queries Simples por Entidade**: JOIN direto para dados relacionados

## 🎯 Implementação com Schema Atual

### 1. Tipos de Logs (logTypes.ts)

```typescript
// filepath: src/types/logTypes.ts

export const EPI_LOG_TYPES = {
  EPI_CREATED: 'EPI_CREATED',
  EPI_UPDATED: 'EPI_UPDATED',
  EPI_DELETED: 'EPI_DELETED',
  EPI_STOCK_LOW: 'EPI_STOCK_LOW',
} as const;

export const PROCESS_LOG_TYPES = {
  PROCESS_CREATED: 'PROCESS_CREATED',
  PROCESS_DELIVERED: 'PROCESS_DELIVERED',
  PROCESS_RETURNED: 'PROCESS_RETURNED',
  PROCESS_CANCELLED: 'PROCESS_CANCELLED',
} as const;

export const USER_LOG_TYPES = {
  USER_CREATED: 'USER_CREATED',
  USER_UPDATED: 'USER_UPDATED',
  USER_DELETED: 'USER_DELETED',
  USER_PASSWORD_CHANGED: 'USER_PASSWORD_CHANGED',
} as const;

export const COLLABORATOR_LOG_TYPES = {
  COLLABORATOR_CREATED: 'COLLABORATOR_CREATED',
  COLLABORATOR_UPDATED: 'COLLABORATOR_UPDATED',
  COLLABORATOR_DELETED: 'COLLABORATOR_DELETED',
} as const;

export const LOG_TYPES = {
  ...EPI_LOG_TYPES,
  ...PROCESS_LOG_TYPES,
  ...USER_LOG_TYPES,
  ...COLLABORATOR_LOG_TYPES,
} as const;

export type LogType = (typeof LOG_TYPES)[keyof typeof LOG_TYPES];

// Interfaces para estrutura do body
export interface BaseLogData {
  action: string;
  timestamp: string;
  observations?: string;
}

export interface EpiLogData extends BaseLogData {
  epiId: string;
  nomeEpi: string;
  ca: string;
  oldData?: Record<string, any>;
  newData?: Record<string, any>;
  changes?: Record<string, { old: any; new: any }>;
}

export interface ProcessLogData extends BaseLogData {
  processId: string;
  colaboradorId?: string;
  colaboradorNome?: string;
  episCount?: number;
  dataAgendamento?: string;
  dataEntrega?: string;
}

export interface UserLogData extends BaseLogData {
  userId: string;
  nome: string;
  email: string;
  role?: string;
  oldData?: Record<string, any>;
  newData?: Record<string, any>;
}

export interface CollaboratorLogData extends BaseLogData {
  colaboradorId: string;
  nome: string;
  cpf: string;
  oldData?: Record<string, any>;
  newData?: Record<string, any>;
}
```

### 2. Serviço de Logs (logService.ts)

```typescript
// filepath: src/Services/logService.ts
import { PrismaClient } from '@prisma/client';
import { LogType } from '../types/logTypes';

const prisma = new PrismaClient();

export class LogService {
  /**
   * Função genérica para criar logs
   * Utiliza campos específicos conforme o tipo de entidade
   */
  static async createLog({
    tipo,
    body,
    idEpi,
    idUser,
    idColaborador,
    idProcesso,
  }: {
    tipo: LogType;
    body?: Record<string, any>;
    idEpi?: string;
    idUser?: string;
    idColaborador?: string;
    idProcesso?: string;
  }): Promise<void> {
    try {
      // Validação: pelo menos uma entidade deve ser especificada
      if (!idEpi && !idUser && !idColaborador && !idProcesso) {
        console.warn('Log criado sem entidade associada:', tipo);
      }

      await prisma.log.create({
        data: {
          tipo,
          body: body || {},
          idEpi: idEpi || null,
          idUser: idUser || null,
          idColaborador: idColaborador || null,
          idProcesso: idProcesso || null,
          timestamp: new Date(),
        },
      });

      console.log(`[LOG] ${tipo} registrado com sucesso`);
    } catch (error) {
      console.error('Erro ao criar log:', error);
      // Logs não devem quebrar operações principais
    }
  }

  /**
   * Busca logs por entidade específica
   */
  static async getLogsByEntity(
    entityType: 'epi' | 'user' | 'collaborator' | 'process',
    entityId: string,
    limit: number = 50,
  ) {
    const whereClause: any = {};

    switch (entityType) {
      case 'epi':
        whereClause.idEpi = entityId;
        break;
      case 'user':
        whereClause.idUser = entityId;
        break;
      case 'collaborator':
        whereClause.idColaborador = entityId;
        break;
      case 'process':
        whereClause.idProcesso = entityId;
        break;
    }

    return await prisma.log.findMany({
      where: whereClause,
      include: {
        epi: { select: { nomeEpi: true, ca: true } },
        usuario: { select: { name: true, email: true } },
        colaborador: { select: { nomeColaborador: true, cpf: true } },
        processo: { select: { idProcesso: true } },
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }

  /**
   * Busca logs por empresa através dos relacionamentos
   * PROBLEMA: Query complexa devido aos múltiplos JOINs
   */
  static async getCompanyLogs(companyId: string, limit: number = 100) {
    return await prisma.log.findMany({
      where: {
        OR: [
          { epi: { idEmpresa: companyId } },
          { processo: { idEmpresa: companyId } },
          { colaborador: { idEmpresa: companyId } },
          // User não tem idEmpresa direto, precisa de AuthCompany
          {
            usuario: {
              authCompanies: {
                some: { idEmpresa: companyId },
              },
            },
          },
        ],
      },
      include: {
        epi: { select: { nomeEpi: true, ca: true } },
        usuario: { select: { name: true, email: true } },
        colaborador: { select: { nomeColaborador: true, cpf: true } },
        processo: { select: { idProcesso: true } },
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }

  /**
   * Busca logs por tipo
   */
  static async getLogsByType(
    tipo: LogType,
    companyId?: string,
    limit: number = 50,
  ) {
    let whereClause: any = { tipo };

    if (companyId) {
      whereClause = {
        AND: [
          { tipo },
          {
            OR: [
              { epi: { idEmpresa: companyId } },
              { processo: { idEmpresa: companyId } },
              { colaborador: { idEmpresa: companyId } },
              {
                usuario: {
                  authCompanies: {
                    some: { idEmpresa: companyId },
                  },
                },
              },
            ],
          },
        ],
      };
    }

    return await prisma.log.findMany({
      where: whereClause,
      include: {
        epi: { select: { nomeEpi: true, ca: true } },
        usuario: { select: { name: true, email: true } },
        colaborador: { select: { nomeColaborador: true, cpf: true } },
        processo: { select: { idProcesso: true } },
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }

  /**
   * Estatísticas de logs
   */
  static async getLogStats(companyId?: string) {
    let whereClause: any = {};

    if (companyId) {
      whereClause = {
        OR: [
          { epi: { idEmpresa: companyId } },
          { processo: { idEmpresa: companyId } },
          { colaborador: { idEmpresa: companyId } },
          {
            usuario: {
              authCompanies: {
                some: { idEmpresa: companyId },
              },
            },
          },
        ],
      };
    }

    const stats = await prisma.log.groupBy({
      by: ['tipo'],
      where: whereClause,
      _count: {
        idLog: true,
      },
      orderBy: {
        _count: {
          idLog: 'desc',
        },
      },
    });

    return stats.map(stat => ({
      tipo: stat.tipo,
      count: stat._count.idLog,
    }));
  }
}
```

### 3. Helpers Especializados (logHelpers.ts)

```typescript
// filepath: src/utils/logHelpers.ts
import { LogService } from '../Services/logService';
import {
  LOG_TYPES,
  EpiLogData,
  ProcessLogData,
  UserLogData,
  CollaboratorLogData,
} from '../types/logTypes';

export class LogHelpers {
  // ================================
  // LOGS DE EPI
  // ================================

  static async logEpiCreated(epiData: any, userId?: string) {
    const logData: EpiLogData = {
      action: 'CREATE',
      timestamp: new Date().toISOString(),
      epiId: epiData.idEpi,
      nomeEpi: epiData.nomeEpi,
      ca: epiData.ca,
      newData: {
        quantidade: epiData.quantidade,
        preco: epiData.preco,
        validade: epiData.validade,
        quantidadeMinima: epiData.quantidadeMinima,
      },
      observations: 'EPI criado no sistema',
    };

    await LogService.createLog({
      tipo: LOG_TYPES.EPI_CREATED,
      body: logData,
      idEpi: epiData.idEpi,
      idUser: userId,
      // idColaborador e idProcesso ficam NULL
    });
  }

  static async logEpiUpdated(
    epiId: string,
    oldData: any,
    newData: any,
    userId?: string,
  ) {
    const changes = this.getChanges(oldData, newData);

    if (Object.keys(changes).length === 0) {
      return; // Não criar log se não houve mudanças
    }

    const logData: EpiLogData = {
      action: 'UPDATE',
      timestamp: new Date().toISOString(),
      epiId,
      nomeEpi: newData.nomeEpi || oldData.nomeEpi,
      ca: newData.ca || oldData.ca,
      oldData,
      newData,
      changes,
      observations: `Campos alterados: ${Object.keys(changes).join(', ')}`,
    };

    await LogService.createLog({
      tipo: LOG_TYPES.EPI_UPDATED,
      body: logData,
      idEpi: epiId,
      idUser: userId,
      // idColaborador e idProcesso ficam NULL
    });
  }

  static async logEpiDeleted(epiData: any, userId?: string) {
    const logData: EpiLogData = {
      action: 'DELETE',
      timestamp: new Date().toISOString(),
      epiId: epiData.idEpi,
      nomeEpi: epiData.nomeEpi,
      ca: epiData.ca,
      oldData: epiData,
      observations: 'EPI removido do sistema',
    };

    await LogService.createLog({
      tipo: LOG_TYPES.EPI_DELETED,
      body: logData,
      idEpi: epiData.idEpi,
      idUser: userId,
      // idColaborador e idProcesso ficam NULL
    });
  }

  // ================================
  // LOGS DE PROCESSO
  // ================================

  static async logProcessCreated(processData: any, userId?: string) {
    const logData: ProcessLogData = {
      action: 'CREATE',
      timestamp: new Date().toISOString(),
      processId: processData.idProcesso,
      colaboradorId: processData.idColaborador,
      colaboradorNome: processData.colaborador?.nomeColaborador,
      episCount: processData.processEpis?.length || 0,
      dataAgendamento: processData.dataAgendada,
      observations: 'Processo de entrega criado',
    };

    await LogService.createLog({
      tipo: LOG_TYPES.PROCESS_CREATED,
      body: logData,
      idProcesso: processData.idProcesso,
      idColaborador: processData.idColaborador,
      idUser: userId,
      // idEpi fica NULL
    });
  }

  static async logProcessDelivered(processData: any, userId?: string) {
    const logData: ProcessLogData = {
      action: 'DELIVER',
      timestamp: new Date().toISOString(),
      processId: processData.idProcesso,
      colaboradorId: processData.idColaborador,
      colaboradorNome: processData.colaborador?.nomeColaborador,
      dataEntrega: processData.dataEntrega,
      observations: 'EPIs entregues ao colaborador',
    };

    await LogService.createLog({
      tipo: LOG_TYPES.PROCESS_DELIVERED,
      body: logData,
      idProcesso: processData.idProcesso,
      idColaborador: processData.idColaborador,
      idUser: userId,
      // idEpi fica NULL
    });
  }

  // ================================
  // LOGS DE USUÁRIO
  // ================================

  static async logUserCreated(userData: any, createdById?: string) {
    const logData: UserLogData = {
      action: 'CREATE',
      timestamp: new Date().toISOString(),
      userId: userData.idUser,
      nome: userData.name,
      email: userData.email,
      newData: {
        name: userData.name,
        email: userData.email,
        statusUser: userData.statusUser,
      },
      observations: 'Usuário criado no sistema',
    };

    await LogService.createLog({
      tipo: LOG_TYPES.USER_CREATED,
      body: logData,
      idUser: createdById, // Quem criou
      // idEpi, idColaborador e idProcesso ficam NULL
    });
  }

  // ================================
  // LOGS DE COLABORADOR
  // ================================

  static async logCollaboratorCreated(colaboradorData: any, userId?: string) {
    const logData: CollaboratorLogData = {
      action: 'CREATE',
      timestamp: new Date().toISOString(),
      colaboradorId: colaboradorData.idColaborador,
      nome: colaboradorData.nomeColaborador,
      cpf: colaboradorData.cpf,
      newData: colaboradorData,
      observations: 'Colaborador criado no sistema',
    };

    await LogService.createLog({
      tipo: LOG_TYPES.COLLABORATOR_CREATED,
      body: logData,
      idColaborador: colaboradorData.idColaborador,
      idUser: userId,
      // idEpi e idProcesso ficam NULL
    });
  }

  // ================================
  // UTILITÁRIOS
  // ================================

  private static getChanges(
    oldData: any,
    newData: any,
  ): Record<string, { old: any; new: any }> {
    const changes: Record<string, { old: any; new: any }> = {};

    for (const key in newData) {
      if (oldData[key] !== newData[key]) {
        changes[key] = {
          old: oldData[key],
          new: newData[key],
        };
      }
    }

    return changes;
  }
}
```

### 4. Controller de Logs (LogController.ts)

```typescript
// filepath: src/Controllers/LogController.ts
import { Request, Response, NextFunction } from 'express';
import { LogService } from '../Services/logService';
import HttpResponse from '../Helpers/HttpResponse';
import HttpError from '../Helpers/HttpError';
import { LOG_TYPES } from '../types/logTypes';

/**
 * Busca logs de um EPI específico
 */
export async function getEpiLogs(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { epiId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;

    if (!epiId) {
      throw new HttpError('ID do EPI é obrigatório', 400);
    }

    const logs = await LogService.getLogsByEntity('epi', epiId, limit);

    const response = HttpResponse.Ok({
      message: 'Logs do EPI recuperados com sucesso',
      data: logs,
    });

    return res.status(response.statusCode).json(response.payload);
  } catch (err) {
    console.error('Error in getEpiLogs:', err);
    next(err);
  }
}

/**
 * Busca logs de um processo específico
 */
export async function getProcessLogs(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { processId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;

    const logs = await LogService.getLogsByEntity('process', processId, limit);

    const response = HttpResponse.Ok({
      message: 'Logs do processo recuperados com sucesso',
      data: logs,
    });

    return res.status(response.statusCode).json(response.payload);
  } catch (err) {
    console.error('Error in getProcessLogs:', err);
    next(err);
  }
}

/**
 * Busca logs de uma empresa
 */
export async function getCompanyLogs(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { companyId } = req.params;
    const limit = parseInt(req.query.limit as string) || 100;

    const logs = await LogService.getCompanyLogs(companyId, limit);

    const response = HttpResponse.Ok({
      message: 'Logs da empresa recuperados com sucesso',
      data: logs,
    });

    return res.status(response.statusCode).json(response.payload);
  } catch (err) {
    console.error('Error in getCompanyLogs:', err);
    next(err);
  }
}

/**
 * Busca logs por tipo
 */
export async function getLogsByType(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { tipo } = req.params;
    const { companyId } = req.query;
    const limit = parseInt(req.query.limit as string) || 50;

    const logs = await LogService.getLogsByType(
      tipo as any,
      companyId as string,
      limit,
    );

    const response = HttpResponse.Ok({
      message: `Logs do tipo ${tipo} recuperados com sucesso`,
      data: logs,
    });

    return res.status(response.statusCode).json(response.payload);
  } catch (err) {
    console.error('Error in getLogsByType:', err);
    next(err);
  }
}

/**
 * Retorna todos os tipos de logs disponíveis
 */
export async function getLogTypes(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const response = HttpResponse.Ok({
      message: 'Tipos de logs recuperados com sucesso',
      data: LOG_TYPES,
    });

    return res.status(response.statusCode).json(response.payload);
  } catch (err) {
    console.error('Error in getLogTypes:', err);
    next(err);
  }
}
```

### 5. Integração nos Controllers Existentes

```typescript
// filepath: src/Controllers/EpiController.ts
import { LogHelpers } from '../utils/logHelpers';

export async function createEpi(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = CreateEpiSchema.parse(req.body);
    const epi = await EpiService.createEpi(data);

    // Log assíncrono - idEpi e idUser preenchidos, outros ficam NULL
    LogHelpers.logEpiCreated(epi).catch(console.error);

    const response = HttpResponse.Created({
      message: 'EPI criado com sucesso',
      data: epi,
    });

    return res.status(response.statusCode).json(response.payload);
  } catch (err) {
    next(err);
  }
}

export async function updateEpi(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = UpdateEpiSchema.parse(req.body);
    const { epiId } = req.params;

    const oldEpi = await EpiService.getEpiById(epiId);
    const updatedEpi = await EpiService.updateEpi(epiId, data);

    // Log da atualização - idEpi e idUser preenchidos, outros ficam NULL
    LogHelpers.logEpiUpdated(epiId, oldEpi, updatedEpi).catch(console.error);

    const response = HttpResponse.Ok({
      message: 'EPI atualizado com sucesso',
      data: updatedEpi,
    });

    return res.status(response.statusCode).json(response.payload);
  } catch (err) {
    next(err);
  }
}
```

## 📊 Estrutura dos Dados no Banco

### Exemplo de Logs com Schema Atual

```sql
-- Log de criação de EPI
INSERT INTO log (id_log, tipo, body, id_epi, id_user, id_colaborador, id_processo, timestamp)
VALUES (
  'uuid1',
  'EPI_CREATED',
  '{"action":"CREATE","epiId":"123","nomeEpi":"Capacete",...}',
  '123',      -- idEpi preenchido
  'user1',    -- idUser preenchido
  NULL,       -- idColaborador vazio
  NULL,       -- idProcesso vazio
  NOW()
);

-- Log de entrega de processo
INSERT INTO log (id_log, tipo, body, id_epi, id_user, id_colaborador, id_processo, timestamp)
VALUES (
  'uuid2',
  'PROCESS_DELIVERED',
  '{"action":"DELIVER","processId":"456","colaboradorId":"789",...}',
  NULL,       -- idEpi vazio
  'user1',    -- idUser preenchido
  '789',      -- idColaborador preenchido
  '456',      -- idProcesso preenchido
  NOW()
);

-- Log de criação de usuário
INSERT INTO log (id_log, tipo, body, id_epi, id_user, id_colaborador, id_processo, timestamp)
VALUES (
  'uuid3',
  'USER_CREATED',
  '{"action":"CREATE","userId":"321","nome":"João",...}',
  NULL,       -- idEpi vazio
  'user1',    -- idUser preenchido (quem criou)
  NULL,       -- idColaborador vazio
  NULL,       -- idProcesso vazio
  NOW()
);
```

### 🔍 Análise dos Dados

- **Logs de EPI**: Apenas `idEpi` e `idUser` preenchidos (~50% dos campos)
- **Logs de Processo**: `idProcesso`, `idColaborador` e `idUser` preenchidos
  (~75% dos campos)
- **Logs de Usuário**: Apenas `idUser` preenchido (~25% dos campos)
- **Logs de Colaborador**: `idColaborador` e `idUser` preenchidos (~50% dos
  campos)

## 📈 Vantagens e Desvantagens

### ✅ Vantagens

1. **Não Requer Migração**: Usa estrutura existente
2. **Relacionamentos Diretos**: JOINs automáticos e eficientes
3. **Integridade Referencial**: Constraints automáticas do banco
4. **Queries Específicas Simples**: Busca direta por entidade
5. **Compatibilidade Total**: Funciona com código existente
6. **Facilidade de Implementação**: Rápido de implementar

### ❌ Desvantagens

1. **Desperdício de Espaço**: ~75% dos campos ficam NULL
2. **Queries Complexas por Empresa**: Múltiplos ORs e JOINs
3. **Rigidez para Expansão**: Limitado às 4 entidades atuais
4. **Performance Degradada**: Índices em colunas com muitos NULLs
5. **Complexidade de Manutenção**: Código condicional para diferentes entidades
6. **Escalabilidade Limitada**: Nova entidade = migração obrigatória

## 🎯 Casos de Uso Ideais

Esta abordagem é ideal quando:

- **Não é possível alterar o banco de dados**
- **Poucas entidades** (máximo 4-5)
- **Relacionamentos diretos** são prioritários
- **Implementação rápida** é necessária
- **Integridade referencial** é crítica
- **Volume baixo de logs** (< 1M registros)

## 📋 APIs Resultantes

```
GET /api/logs/epi/:epiId                    # Logs de um EPI
GET /api/logs/process/:processId            # Logs de um processo
GET /api/logs/user/:userId                  # Logs de um usuário
GET /api/logs/collaborator/:collaboratorId  # Logs de um colaborador
GET /api/logs/company/:companyId            # Logs de uma empresa
GET /api/logs/type/:tipo?companyId=uuid     # Logs por tipo
GET /api/logs/types                         # Tipos disponíveis
```

## 🔧 Implementação Recomendada

### Fase 1: Tipos e Estrutura (1 dia)

1. Implementar `logTypes.ts` com todos os tipos
2. Criar interfaces para estrutura do body
3. Validar tipos contra necessidades atuais

### Fase 2: Serviço Principal (1 dia)

1. Implementar `LogService` com função genérica `createLog`
2. Implementar funções de busca por entidade
3. Implementar busca por empresa (query complexa)

### Fase 3: Helpers (1 dia)

1. Implementar `LogHelpers` com funções específicas
2. Começar com helpers de EPI
3. Expandir para outras entidades

### Fase 4: Integração (1-2 dias)

1. Integrar logs no `EpiController`
2. Integrar em outros controllers
3. Testar todas as funcionalidades

### Fase 5: API de Consulta (1 dia)

1. Implementar `LogController`
2. Criar rotas de API
3. Testar endpoints de consulta

## ⚠️ Considerações Importantes

### Performance

- **Índices estratégicos**: Criar índices em cada coluna de FK
- **Logs assíncronos**: Para não impactar operações principais
- **Monitoramento**: Acompanhar crescimento da tabela

### Manutenção

- **Cleanup periódico**: Remover logs antigos para performance
- **Backup regular**: Logs são dados críticos para auditoria
- **Monitoramento de espaço**: Verificar crescimento do banco

### Limitações

- **Nova entidade**: Requer migração do banco
- **Queries por empresa**: Performance pode degradar com volume alto
- **Desperdício de espaço**: Considerar compactação para tabelas grandes

## 🎖️ Conclusão

A abordagem com schema atual é **adequada para implementação imediata** mas tem
**limitações de escalabilidade**. É ideal para:

- ✅ **Prototipagem rápida**
- ✅ **Ambientes com poucas entidades**
- ✅ **Sistemas com volume baixo de logs**
- ✅ **Quando migração não é viável**

Para sistemas **grandes e escaláveis**, recomenda-se considerar a abordagem com
schema otimizado após validação inicial com este método.

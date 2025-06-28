import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateLogData {
  body: any;
  tipo: string;
  companyId: string;
  entityType: string;
  entityId: string;
  userId?: string;
}

export class LogHelper {
  /**
   * Estrutura Genérica do Log no Sistema
   */
  static async createLog(data: CreateLogData): Promise<void> {
    try {
      await prisma.log.create({
        data: {
          tipo: data.tipo,
          entityType: data.entityType,
          entityId: data.entityId,
          companyId: data.companyId,
          userId: data.userId || null,
          body: data.body,
        },
      });
    } catch (error) {
      console.error('Erro ao criar log:', error);
      // Não bloqueia a operação principal se o log falhar
    }
  }

  /**
   * Cria log para criação de EPI
   */
  static async logEpiCreate(
    epiId: string,
    companyId: string,
    epiData: any,
    userId?: string,
  ): Promise<void> {
    await this.createLog({
      tipo: 'EPI_CREATE',
      entityType: 'EPI',
      entityId: epiId,
      companyId,
      userId,
      body: {
        ca: epiData.ca,
        nomeEpi: epiData.nomeEpi,
        quantidade: epiData.quantidade,
        quantidadeMinima: epiData.quantidadeMinima,
        preco: epiData.preco,
        validade: epiData.validade,
        descricao: epiData.descricao,
        createdAt: new Date().toISOString(),
      },
    });
  }

  /**
   * Cria log para atualização de EPI
   */
  static async logEpiUpdate(
    epiId: string,
    companyId: string,
    oldData: any,
    newData: any,
    userId?: string,
  ): Promise<void> {
    // Identifica campos alterados
    const changedFields: string[] = [];
    const changes: any = {};

    Object.keys(newData).forEach(key => {
      if (oldData[key] !== newData[key]) {
        changedFields.push(key);
        changes[key] = {
          old: oldData[key],
          new: newData[key],
        };
      }
    });

    await this.createLog({
      tipo: 'EPI_UPDATE',
      entityType: 'EPI',
      entityId: epiId,
      companyId,
      userId,
      body: {
        ca: oldData.ca,
        nomeEpi: oldData.nomeEpi,
        changedFields,
        changes,
        updatedAt: new Date().toISOString(),
      },
    });
  }

  /**
   * Cria log para exclusão de EPI
   */
  static async logEpiDelete(
    epiId: string,
    companyId: string,
    epiData: any,
    userId?: string,
  ): Promise<void> {
    await this.createLog({
      tipo: 'EPI_DELETE',
      entityType: 'EPI',
      entityId: epiId,
      companyId,
      userId,
      body: {
        ca: epiData.ca,
        nomeEpi: epiData.nomeEpi,
        quantidade: epiData.quantidade,
        quantidadeMinima: epiData.quantidadeMinima,
        preco: epiData.preco,
        deletedAt: new Date().toISOString(),
      },
    });
  }
}

import { PrismaClient } from '@prisma/client';
import { InputJsonValue } from '@prisma/client/runtime/library';
import { TimezoneHelper } from './TimezoneHelper';
import {
  CreateLog,
  EpiLogData,
  EpiCreateLogBody,
  EpiUpdateLogBody,
  EpiDeleteLogBody,
} from '../interfaces';

const prisma = new PrismaClient();

export class LogHelper {
  /**
   * Estrutura Genérica do Log no Sistema
   */
  static async createLog(data: CreateLog): Promise<void> {
    try {
      await prisma.log.create({
        data: {
          tipo: data.tipo,
          entityType: data.entityType,
          entityId: data.entityId,
          companyId: data.companyId,
          userId: data.userId || null,
          body: data.body,
          timestamp: TimezoneHelper.getBrazilTimestamp(),
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
    epiData: EpiLogData,
    userId?: string,
  ): Promise<void> {
    const logBody: EpiCreateLogBody = {
      ca: epiData.ca,
      nomeEpi: epiData.nomeEpi,
      quantidade: epiData.quantidade,
      quantidadeMinima: epiData.quantidadeMinima,
      preco: epiData.preco,
      validade: epiData.validade,
      descricao: epiData.descricao,
      createdAt: TimezoneHelper.getBrazilTimestampString(),
    };

    await this.createLog({
      tipo: 'EPI_CREATE',
      entityType: 'EPI',
      entityId: epiId,
      companyId,
      userId,
      body: logBody as InputJsonValue,
    });
  }

  /**
   * Cria log para atualização de EPI
   */
  static async logEpiUpdate(
    epiId: string,
    companyId: string,
    oldData: EpiLogData,
    newData: EpiLogData,
    userId?: string,
  ): Promise<void> {
    // Identifica campos alterados
    const changedFields: string[] = [];
    const changes: Record<string, { old: unknown; new: unknown }> = {};

    Object.keys(newData).forEach(key => {
      if (
        (oldData as unknown as Record<string, unknown>)[key] !==
        (newData as unknown as Record<string, unknown>)[key]
      ) {
        changedFields.push(key);
        changes[key] = {
          old: (oldData as unknown as Record<string, unknown>)[key],
          new: (newData as unknown as Record<string, unknown>)[key],
        };
      }
    });

    const logBody: EpiUpdateLogBody = {
      ca: oldData.ca,
      nomeEpi: oldData.nomeEpi,
      changedFields,
      changes,
      updatedAt: TimezoneHelper.getBrazilTimestampString(),
    };

    await this.createLog({
      tipo: 'EPI_UPDATE',
      entityType: 'EPI',
      entityId: epiId,
      companyId,
      userId,
      body: logBody as InputJsonValue,
    });
  }

  /**
   * Cria log para exclusão de EPI
   */
  static async logEpiDelete(
    epiId: string,
    companyId: string,
    epiData: EpiLogData,
    userId?: string,
  ): Promise<void> {
    const logBody: EpiDeleteLogBody = {
      ca: epiData.ca,
      nomeEpi: epiData.nomeEpi,
      quantidade: epiData.quantidade,
      quantidadeMinima: epiData.quantidadeMinima,
      preco: epiData.preco,
      deletedAt: TimezoneHelper.getBrazilTimestampString(),
    };

    await this.createLog({
      tipo: 'EPI_DELETE',
      entityType: 'EPI',
      entityId: epiId,
      companyId,
      userId,
      body: logBody as InputJsonValue,
    });
  }
}

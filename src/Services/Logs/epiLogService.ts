import { PrismaClient } from '@prisma/client';
import { LogService } from './logService';

const prisma = new PrismaClient();
const logService = new LogService();

export class EpiLogService {
  /**
   * Cria log específico para EPI_CREATED
   */
  static async logEpiCreated(epiId: string, epiData: any, userId?: string): Promise<void> {
    await logService.createLog({
      idUser: userId,
      idEpi: epiId,
      tipo: 'EPI_CREATED',
      body: {
        action: 'EPI_CREATED',
        epi: {
          id: epiId,
          name: epiData.nomeEpi,
          ca: epiData.ca,
        },
        data: epiData,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Cria log específico para EPI_UPDATED
   */
  static async logEpiUpdated(
    epiId: string,
    oldData: any,
    newData: any,
    userId?: string,
  ): Promise<void> {
    await logService.createLog({
      idUser: userId,
      idEpi: epiId,
      tipo: 'EPI_UPDATED',
      body: {
        action: 'EPI_UPDATED',
        epi: {
          id: epiId,
          name: newData.nomeEpi || oldData.nomeEpi,
          ca: newData.ca || oldData.ca,
        },
        changes: {
          before: oldData,
          after: newData,
        },
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Cria log específico para EPI_DELETED
   */
  static async logEpiDeleted(epiId: string, epiData: any, userId?: string): Promise<void> {
    await logService.createLog({
      idUser: userId,
      idEpi: epiId,
      tipo: 'EPI_DELETED',
      body: {
        action: 'EPI_DELETED',
        epi: {
          id: epiId,
          name: epiData.nomeEpi,
          ca: epiData.ca,
        },
        deletedData: epiData,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Busca logs de um EPI específico
   */
  static async getEpiLogs(epiId: string, limit: number = 50) {
    try {
      const logs = await prisma.log.findMany({
        where: {
          idEpi: epiId,
        },
        orderBy: {
          timestamp: 'desc',
        },
        take: limit,
        include: {
          usuario: {
            select: {
              idUser: true,
              name: true,
            },
          },
          epi: {
            select: {
              idEpi: true,
              nomeEpi: true,
              ca: true,
            },
          },
        },
      });

      return logs;
    } catch (error) {
      console.error('Erro ao buscar logs do EPI:', error);
      throw error;
    }
  }

  /**
   * Busca logs de EPIs de uma empresa
   */
  static async getCompanyEpiLogs(companyId: string, limit: number = 100) {
    try {
      const logs = await prisma.log.findMany({
        where: {
          epi: {
            idEmpresa: companyId,
          },
          tipo: {
            in: ['EPI_CREATED', 'EPI_UPDATED', 'EPI_DELETED'],
          },
        },
        orderBy: {
          timestamp: 'desc',
        },
        take: limit,
        include: {
          usuario: {
            select: {
              idUser: true,
              name: true,
            },
          },
          epi: {
            select: {
              idEpi: true,
              nomeEpi: true,
              ca: true,
            },
          },
        },
      });

      return logs;
    } catch (error) {
      console.error('Erro ao buscar logs de EPIs da empresa:', error);
      throw error;
    }
  }
}

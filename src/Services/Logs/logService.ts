import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class LogService {
  /**
   * Função genérica para criar qualquer tipo de log
   * Segue exatamente a estrutura da tabela Log do Prisma
   */
  public async createLog({
    idUser = null,
    idColaborador = null,
    idProcesso = null,
    idEpi = null,
    tipo,
    body,
  }: {
    idUser?: string | null;
    idColaborador?: string | null;
    idProcesso?: string | null;
    idEpi?: string | null;
    tipo: string;
    body: any;
  }): Promise<void> {
    try {
      await prisma.log.create({
        data: {
          idUser,
          idColaborador,
          idProcesso,
          idEpi,
          tipo,
          body,
          timestamp: new Date(),
        },
      });

      console.log(`[LOG] ${tipo} registrado com sucesso`);
    } catch (error) {
      console.error('Erro ao criar log:', error);
      // Não lança erro para não quebrar o fluxo principal
    }
  }
}

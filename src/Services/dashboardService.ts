import { PrismaClient } from '@prisma/client';
import HttpError from '../Helpers/HttpError';

const prisma = new PrismaClient();

interface DashboardStats {
  totalEpis: number;
  entregasRecentes: number;
  valorTotalEpis: number;
  valorMedioPorEpi: number;
}

export class DashboardService {
  async getGeneralStats(companyId: string): Promise<DashboardStats> {
    try {
      // Verificar se a empresa existe
      const empresa = await prisma.company.findUnique({
        where: { idEmpresa: companyId },
      });

      if (!empresa) throw HttpError.NotFound('Empresa não encontrada');

      // 1. Total de EPIs da empresa
      const totalEpis = await prisma.epi.count({
        where: {
          idEmpresa: companyId,
          status: true, // Considerando apenas EPIs ativos
        },
      });

      // 2. Entregas recentes (últimos 30 dias)
      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() - 30);

      const entregasRecentes = await prisma.process.count({
        where: {
          idEmpresa: companyId,
          statusEntrega: true,
          dataEntrega: {
            gte: dataLimite,
          },
        },
      });

      // 3. Valor total e médio dos EPIs
      const episComPreco = await prisma.epi.aggregate({
        where: {
          idEmpresa: companyId,
          status: true,
          preco: {
            not: null,
          },
        },
        _sum: {
          preco: true,
        },
        _avg: {
          preco: true,
        },
        _count: {
          preco: true,
        },
      });

      const valorTotalEpis = Number(episComPreco._sum.preco) || 0;
      const valorMedioPorEpi = Number(episComPreco._avg.preco) || 0;

      return {
        totalEpis,
        entregasRecentes,
        valorTotalEpis: Number(valorTotalEpis.toFixed(2)),
        valorMedioPorEpi: Number(valorMedioPorEpi.toFixed(2)),
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas do dashboard:', error);
      throw error;
    }
  }
}

import { PrismaClient } from '@prisma/client';
import HttpError from '../Helpers/HttpError';

const prisma = new PrismaClient();

interface DashboardStats {
  totalEpis: number;
  entregasRecentes: number;
  valorTotalEpis: number;
  valorMedioPorEpi: number;
}

interface EpisByCategory {
  [key: string]: number;
}

interface EpiDeliveryByMonth {
  [key: string]: number;
}

export class DashboardService {
  async getGeneralStats(companyId: string): Promise<DashboardStats> {
    try {
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

  async getEpisByCategory(companyId: string): Promise<EpisByCategory> {
    try {
      const empresa = await prisma.company.findUnique({
        where: { idEmpresa: companyId },
      });

      if (!empresa) throw HttpError.NotFound('Empresa não encontrada');

      // Buscar EPIs agrupados por nome (categoria) e somar as quantidades
      const episAgrupados = await prisma.epi.groupBy({
        by: ['nomeEpi'],
        where: {
          idEmpresa: companyId,
          status: true,
        },
        _sum: {
          quantidade: true,
        },
      });

      const resultado: EpisByCategory = {};

      episAgrupados.forEach(epi => {
        resultado[epi.nomeEpi] = epi._sum.quantidade || 0;
      });

      return resultado;
    } catch (error) {
      console.error('Erro ao buscar EPIs por categoria:', error);
      throw error;
    }
  }

  async getEpiDeliveryByMonth(companyId: string): Promise<EpiDeliveryByMonth> {
    try {
      const empresa = await prisma.company.findUnique({
        where: { idEmpresa: companyId },
      });

      if (!empresa) throw HttpError.NotFound('Empresa não encontrada');

      // Array com nomes dos meses em português
      const months = [
        'janeiro',
        'fevereiro',
        'março',
        'abril',
        'maio',
        'junho',
        'julho',
        'agosto',
        'setembro',
        'outubro',
        'novembro',
        'dezembro',
      ];

      // Buscar entregas dos últimos 12 meses
      const dataInicio = new Date();
      dataInicio.setMonth(dataInicio.getMonth() - 11);
      dataInicio.setDate(1);
      dataInicio.setHours(0, 0, 0, 0);

      // Buscar todos os processos entregues no período
      const processosEntregues = await prisma.process.findMany({
        where: {
          idEmpresa: companyId,
          statusEntrega: true,
          dataEntrega: {
            gte: dataInicio,
          },
        },
        include: {
          processEpis: true,
        },
      });

      // Inicializar objeto com todos os meses zerados
      const resultado: EpiDeliveryByMonth = {};
      months.forEach(mes => {
        resultado[mes] = 0;
      });

      // Agrupar entregas por mês
      processosEntregues.forEach(processo => {
        if (processo.dataEntrega) {
          const mes = processo.dataEntrega.getMonth();
          const nomeMes = months[mes];

          // Somar quantidade de EPIs entregues neste processo
          const quantidadeEpis = processo.processEpis.reduce((total, processEpi) => {
            return total + processEpi.quantidade;
          }, 0);

          resultado[nomeMes] += quantidadeEpis;
        }
      });

      return resultado;
    } catch (error) {
      console.error('Erro ao buscar entregas de EPIs por mês:', error);
      throw error;
    }
  }
}

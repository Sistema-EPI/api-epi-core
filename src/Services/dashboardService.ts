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

interface LowStockEpi {
  nome: string;
  quantidadeAtual: number;
  quantidadeMinima: number;
  percentualEstoque: number;
}

interface EpisDistributionByMonthAndType {
  [mes: string]: {
    [tipoEpi: string]: number;
  };
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

  async getLowStockEpis(companyId: string): Promise<LowStockEpi[]> {
    try {
      const empresa = await prisma.company.findUnique({
        where: { idEmpresa: companyId },
      });

      if (!empresa) throw HttpError.NotFound('Empresa não encontrada');

      // Buscar EPIs com estoque baixo ou próximo ao mínimo
      // Consideramos "baixo" quando está até 20% acima do mínimo
      const episBaixoEstoque = await prisma.epi.findMany({
        where: {
          idEmpresa: companyId,
          status: true,
          OR: [
            // Estoque igual ou abaixo do mínimo
            {
              quantidade: {
                lte: prisma.epi.fields.quantidadeMinima,
              },
            },
            // Estoque até 20% acima do mínimo (usando raw query para cálculo)
          ],
        },
        select: {
          nomeEpi: true,
          quantidade: true,
          quantidadeMinima: true,
        },
      });

      // Buscar todos os EPIs e filtrar manualmente para ter mais controle
      const todosEpis = await prisma.epi.findMany({
        where: {
          idEmpresa: companyId,
          status: true,
        },
        select: {
          nomeEpi: true,
          quantidade: true,
          quantidadeMinima: true,
        },
      });

      // Filtrar EPIs com estoque baixo (até 20% acima do mínimo)
      const episFiltrados = todosEpis.filter(epi => {
        const limiteAlerta = epi.quantidadeMinima * 1.2; // 20% acima do mínimo
        return epi.quantidade <= limiteAlerta;
      });

      // Agrupar por nome do EPI e somar quantidades
      const episAgrupados = new Map<string, { quantidade: number; minimo: number }>();

      episFiltrados.forEach(epi => {
        if (episAgrupados.has(epi.nomeEpi)) {
          const existing = episAgrupados.get(epi.nomeEpi)!;
          episAgrupados.set(epi.nomeEpi, {
            quantidade: existing.quantidade + epi.quantidade,
            minimo: Math.max(existing.minimo, epi.quantidadeMinima), // Pega o maior mínimo
          });
        } else {
          episAgrupados.set(epi.nomeEpi, {
            quantidade: epi.quantidade,
            minimo: epi.quantidadeMinima,
          });
        }
      });

      // Converter para array e calcular percentual
      const resultado: LowStockEpi[] = Array.from(episAgrupados.entries()).map(([nome, dados]) => {
        const percentualEstoque = dados.minimo > 0 ? (dados.quantidade / dados.minimo) * 100 : 0;

        return {
          nome,
          quantidadeAtual: dados.quantidade,
          quantidadeMinima: dados.minimo,
          percentualEstoque: Math.round(percentualEstoque * 100) / 100, // 2 casas decimais
        };
      });

      // Ordenar por criticidade (menor percentual primeiro)
      return resultado.sort((a, b) => a.percentualEstoque - b.percentualEstoque);
    } catch (error) {
      console.error('Erro ao buscar EPIs com estoque baixo:', error);
      throw error;
    }
  }

  async getEpisDistributionByMonthAndType(
    companyId: string,
  ): Promise<EpisDistributionByMonthAndType> {
    try {
      const empresa = await prisma.company.findUnique({
        where: { idEmpresa: companyId },
      });

      if (!empresa) throw HttpError.NotFound('Empresa não encontrada');

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

      // Buscar todos os processos entregues no período com seus EPIs
      const processosEntregues = await prisma.process.findMany({
        where: {
          idEmpresa: companyId,
          statusEntrega: true,
          dataEntrega: {
            gte: dataInicio,
          },
        },
        include: {
          processEpis: {
            include: {
              epi: {
                select: {
                  nomeEpi: true,
                },
              },
            },
          },
        },
      });

      // Inicializar objeto com todos os meses
      const resultado: EpisDistributionByMonthAndType = {};
      months.forEach(mes => {
        resultado[mes] = {};
      });

      // Processar cada entrega
      processosEntregues.forEach(processo => {
        if (processo.dataEntrega) {
          const mes = processo.dataEntrega.getMonth();
          const nomeMes = months[mes];

          // Para cada EPI no processo
          processo.processEpis.forEach(processEpi => {
            const tipoEpi = processEpi.epi.nomeEpi;
            const quantidade = processEpi.quantidade;

            // Inicializar o tipo de EPI no mês se não existir
            if (!resultado[nomeMes][tipoEpi]) {
              resultado[nomeMes][tipoEpi] = 0;
            }

            // Somar a quantidade entregue
            resultado[nomeMes][tipoEpi] += quantidade;
          });
        }
      });

      return resultado;
    } catch (error) {
      console.error('Erro ao buscar distribuição de EPIs por mês e tipo:', error);
      throw error;
    }
  }
}

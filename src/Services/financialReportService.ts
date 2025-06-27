import { PrismaClient } from '@prisma/client';
import HttpError from '../Helpers/HttpError';
import { AnnualEpiCost } from '../types/common';

const prisma = new PrismaClient();

interface AnnualCostsByCompany {
  [ano: string]: {
    [epiId: string]: {
      nomeEpi: string;
      ca: string;
      totalGasto: number;
      quantidadeEntregue: number;
    };
  };
}

interface MonthlyFinancialData {
  [mes: string]: {
    totalGasto: number;
    quantidadeEntregue: number;
    episEntregues: number;
  };
}

export class FinancialReportService {
  /**
   * Retorna o total gasto por EPI por ano para uma empresa
   */
  async getAnnualCostsByEpi(companyId: string, year?: number): Promise<AnnualEpiCost[]> {
    try {
      const empresa = await prisma.company.findUnique({
        where: { idEmpresa: companyId },
      });

      if (!empresa) throw HttpError.NotFound('Empresa não encontrada');

      // Filtrar por ano se especificado, senão retorna todos os anos
      const whereClause: Record<string, unknown> = {
        processo: {
          idEmpresa: companyId,
        },
        tipoMovimento: 'saida',
      };

      if (year) {
        const startOfYear = new Date(year, 0, 1, 0, 0, 0, 0);
        const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);
        whereClause.dataMovimento = {
          gte: startOfYear,
          lte: endOfYear,
        };
      }

      const movimentacoes = await prisma.epiMovement.findMany({
        where: whereClause,
        include: {
          epi: {
            select: {
              idEpi: true,
              nomeEpi: true,
              ca: true,
            },
          },
        },
      });

      // Agrupar por EPI e ano
      const gastosAgrupados = new Map<string, AnnualEpiCost>();

      movimentacoes.forEach(movimentacao => {
        const ano = movimentacao.dataMovimento.getFullYear();
        const epiId = movimentacao.epi.idEpi;
        const chave = `${epiId}-${ano}`;

        const gastoTotal = Number(movimentacao.valorUnitario) * movimentacao.quantidade;

        if (gastosAgrupados.has(chave)) {
          const dadosExistentes = gastosAgrupados.get(chave)!;
          gastosAgrupados.set(chave, {
            ...dadosExistentes,
            totalGasto: dadosExistentes.totalGasto + gastoTotal,
            quantidadeEntregue: dadosExistentes.quantidadeEntregue + movimentacao.quantidade,
          });
        } else {
          gastosAgrupados.set(chave, {
            epiId: epiId,
            nomeEpi: movimentacao.epi.nomeEpi,
            ca: movimentacao.epi.ca,
            ano: ano,
            totalGasto: gastoTotal,
            quantidadeEntregue: movimentacao.quantidade,
          });
        }
      });

      // Converter Map para array e ordenar por ano e total gasto
      return Array.from(gastosAgrupados.values()).sort((a, b) => {
        if (a.ano !== b.ano) return b.ano - a.ano; // Ano mais recente primeiro
        return b.totalGasto - a.totalGasto; // Maior gasto primeiro
      });
    } catch (error) {
      console.error('Erro ao buscar custos anuais por EPI:', error);
      throw error;
    }
  }

  /**
   * Retorna dados financeiros agrupados por ano para uma empresa
   */
  async getAnnualFinancialSummary(companyId: string): Promise<AnnualCostsByCompany> {
    try {
      const empresa = await prisma.company.findUnique({
        where: { idEmpresa: companyId },
      });

      if (!empresa) throw HttpError.NotFound('Empresa não encontrada');

      const movimentacoes = await prisma.epiMovement.findMany({
        where: {
          processo: {
            idEmpresa: companyId,
          },
          tipoMovimento: 'saida',
        },
        include: {
          epi: {
            select: {
              idEpi: true,
              nomeEpi: true,
              ca: true,
            },
          },
        },
      });

      const resultado: AnnualCostsByCompany = {};

      movimentacoes.forEach(movimentacao => {
        const ano = movimentacao.dataMovimento.getFullYear().toString();
        const epiId = movimentacao.epi.idEpi;
        const gastoTotal = Number(movimentacao.valorUnitario) * movimentacao.quantidade;

        if (!resultado[ano]) {
          resultado[ano] = {};
        }

        if (!resultado[ano][epiId]) {
          resultado[ano][epiId] = {
            nomeEpi: movimentacao.epi.nomeEpi,
            ca: movimentacao.epi.ca,
            totalGasto: 0,
            quantidadeEntregue: 0,
          };
        }

        resultado[ano][epiId].totalGasto += gastoTotal;
        resultado[ano][epiId].quantidadeEntregue += movimentacao.quantidade;
      });

      return resultado;
    } catch (error) {
      console.error('Erro ao buscar resumo financeiro anual:', error);
      throw error;
    }
  }

  /**
   * Retorna dados financeiros mensais para um ano específico
   */
  async getMonthlyFinancialData(companyId: string, year: number): Promise<MonthlyFinancialData> {
    try {
      const empresa = await prisma.company.findUnique({
        where: { idEmpresa: companyId },
      });

      if (!empresa) throw HttpError.NotFound('Empresa não encontrada');

      const startOfYear = new Date(year, 0, 1, 0, 0, 0, 0);
      const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

      const movimentacoes = await prisma.epiMovement.findMany({
        where: {
          processo: {
            idEmpresa: companyId,
          },
          tipoMovimento: 'saida',
          dataMovimento: {
            gte: startOfYear,
            lte: endOfYear,
          },
        },
      });

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

      const resultado: MonthlyFinancialData = {};
      months.forEach(mes => {
        resultado[mes] = {
          totalGasto: 0,
          quantidadeEntregue: 0,
          episEntregues: 0,
        };
      });

      // Agrupar episIds por mês para contar EPIs únicos
      const episPorMes = new Map<number, Set<string>>();

      movimentacoes.forEach(movimentacao => {
        const mes = movimentacao.dataMovimento.getMonth();
        const nomeMes = months[mes];
        const gastoTotal = Number(movimentacao.valorUnitario) * movimentacao.quantidade;

        resultado[nomeMes].totalGasto += gastoTotal;
        resultado[nomeMes].quantidadeEntregue += movimentacao.quantidade;

        // Contar EPIs únicos por mês
        if (!episPorMes.has(mes)) {
          episPorMes.set(mes, new Set());
        }
        episPorMes.get(mes)!.add(movimentacao.idEpi);
      });

      // Adicionar contagem de EPIs únicos
      episPorMes.forEach((episSet, mes) => {
        const nomeMes = months[mes];
        resultado[nomeMes].episEntregues = episSet.size;
      });

      return resultado;
    } catch (error) {
      console.error('Erro ao buscar dados financeiros mensais:', error);
      throw error;
    }
  }

  /**
   * Retorna o top N EPIs com maior gasto no ano
   */
  async getTopExpensiveEpis(
    companyId: string,
    year: number,
    limit: number = 5,
  ): Promise<AnnualEpiCost[]> {
    try {
      const custosAnuais = await this.getAnnualCostsByEpi(companyId, year);
      return custosAnuais.filter(item => item.ano === year).slice(0, limit);
    } catch (error) {
      console.error('Erro ao buscar EPIs mais caros:', error);
      throw error;
    }
  }
}

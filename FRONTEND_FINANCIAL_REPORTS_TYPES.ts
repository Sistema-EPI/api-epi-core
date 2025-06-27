// =============================================================================
// FINANCIAL REPORTS API - TYPESCRIPT INTERFACES E EXEMPLOS
// =============================================================================

/**
 * Interfaces TypeScript para as respostas da API de Relatórios Financeiros
 */

// ============= INTERFACES BASE =============
export interface ApiResponse<T> {
  message: string;
  data: T;
}

export interface EpiData {
  epiId: string;
  nomeEpi: string;
  ca: string;
}

export interface FinancialMetrics {
  totalGasto: number;
  quantidadeEntregue: number;
}

// ============= INTERFACES ESPECÍFICAS DAS ROTAS =============

// 1. Annual Costs by EPI
export interface AnnualEpiCost extends EpiData, FinancialMetrics {
  ano: number;
}

export type AnnualCostsResponse = ApiResponse<AnnualEpiCost[]>;

// 2. Annual Summary
export interface EpiSummary extends FinancialMetrics {
  nomeEpi: string;
  ca: string;
}

export interface AnnualSummaryData {
  [year: string]: {
    [epiId: string]: EpiSummary;
  };
}

export type AnnualSummaryResponse = ApiResponse<AnnualSummaryData>;

// 3. Monthly Data
export interface MonthlyMetrics extends FinancialMetrics {
  episEntregues: number;
}

export interface MonthlyFinancialData {
  [month: string]: MonthlyMetrics;
}

export type MonthlyDataResponse = ApiResponse<MonthlyFinancialData>;

// 4. Top Expensive EPIs
export type TopExpensiveResponse = ApiResponse<AnnualEpiCost[]>;

// ============= UTILITÁRIOS PARA TRANSFORMAÇÃO DE DADOS =============

/**
 * Converte dados mensais para formato de array para gráficos
 */
export function transformMonthlyDataForCharts(monthlyData: MonthlyFinancialData) {
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

  return months.map((month, index) => ({
    month,
    monthNumber: index + 1,
    ...monthlyData[month],
    // Adiciona valores calculados úteis para gráficos
    costPerItem:
      monthlyData[month].quantidadeEntregue > 0
        ? monthlyData[month].totalGasto / monthlyData[month].quantidadeEntregue
        : 0,
    hasActivity: monthlyData[month].totalGasto > 0,
  }));
}

/**
 * Converte resumo anual para formato flat array
 */
export function transformAnnualSummaryForCharts(summary: AnnualSummaryData) {
  return Object.entries(summary).flatMap(([year, epis]) =>
    Object.entries(epis).map(([epiId, data]) => ({
      year: parseInt(year),
      epiId,
      ...data,
      costPerItem: data.quantidadeEntregue > 0 ? data.totalGasto / data.quantidadeEntregue : 0,
    })),
  );
}

/**
 * Calcula métricas de dashboard a partir dos dados anuais
 */
export function calculateDashboardMetrics(annualCosts: AnnualEpiCost[], year?: number) {
  const filteredData = year ? annualCosts.filter(item => item.ano === year) : annualCosts;

  const totalCost = filteredData.reduce((sum, item) => sum + item.totalGasto, 0);
  const totalItems = filteredData.reduce((sum, item) => sum + item.quantidadeEntregue, 0);
  const uniqueEpis = new Set(filteredData.map(item => item.epiId)).size;
  const averageCostPerItem = totalItems > 0 ? totalCost / totalItems : 0;

  const mostExpensiveEpi = filteredData.reduce(
    (max, item) => (item.totalGasto > max.totalGasto ? item : max),
    { totalGasto: 0, nomeEpi: '', quantidadeEntregue: 0, epiId: '', ca: '', ano: 0 },
  );

  return {
    totalCost: Number(totalCost.toFixed(2)),
    totalItems,
    uniqueEpis,
    averageCostPerItem: Number(averageCostPerItem.toFixed(2)),
    mostExpensiveEpi: mostExpensiveEpi.totalGasto > 0 ? mostExpensiveEpi : null,
  };
}

// ============= EXEMPLOS DE USO PARA GRÁFICOS =============

/**
 * Exemplo de configuração para Chart.js - Gráfico de linha mensal
 */
export function createMonthlyLineChartConfig(monthlyData: MonthlyFinancialData) {
  const chartData = transformMonthlyDataForCharts(monthlyData);

  return {
    type: 'line',
    data: {
      labels: chartData.map(item => item.month),
      datasets: [
        {
          label: 'Total Gasto (R$)',
          data: chartData.map(item => item.totalGasto),
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
        },
        {
          label: 'Quantidade Entregue',
          data: chartData.map(item => item.quantidadeEntregue),
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          yAxisID: 'y1',
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: { display: true, text: 'Valor (R$)' },
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: { display: true, text: 'Quantidade' },
          grid: { drawOnChartArea: false },
        },
      },
    },
  };
}

/**
 * Exemplo de configuração para Chart.js - Gráfico de barras dos EPIs mais caros
 */
export function createTopEpisBarChartConfig(topEpis: AnnualEpiCost[]) {
  return {
    type: 'bar',
    data: {
      labels: topEpis.map(epi => `${epi.nomeEpi} (${epi.ca})`),
      datasets: [
        {
          label: 'Total Gasto (R$)',
          data: topEpis.map(epi => epi.totalGasto),
          backgroundColor: [
            '#EF4444', // Vermelho para 1º lugar
            '#F97316', // Laranja para 2º lugar
            '#EAB308', // Amarelo para 3º lugar
            '#3B82F6', // Azul para 4º lugar
            '#8B5CF6', // Roxo para 5º lugar
          ].slice(0, topEpis.length),
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            afterLabel: (context: { dataIndex: number }) => {
              const epi = topEpis[context.dataIndex];
              return [
                `Quantidade: ${epi.quantidadeEntregue}`,
                `Custo/Item: R$ ${(epi.totalGasto / epi.quantidadeEntregue).toFixed(2)}`,
              ];
            },
          },
        },
      },
      scales: {
        y: {
          title: { display: true, text: 'Total Gasto (R$)' },
        },
      },
    },
  };
}

/**
 * Exemplo de configuração para gráfico de pizza - Distribuição de gastos por EPI
 */
export function createEpiDistributionPieConfig(annualCosts: AnnualEpiCost[], year: number) {
  const yearData = annualCosts.filter(item => item.ano === year);
  const totalYearCost = yearData.reduce((sum, item) => sum + item.totalGasto, 0);

  return {
    type: 'pie',
    data: {
      labels: yearData.map(epi => epi.nomeEpi),
      datasets: [
        {
          data: yearData.map(epi => epi.totalGasto),
          backgroundColor: [
            '#EF4444',
            '#3B82F6',
            '#10B981',
            '#F59E0B',
            '#8B5CF6',
            '#EC4899',
            '#6B7280',
            '#14B8A6',
          ],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        tooltip: {
          callbacks: {
            label: (context: { label: string; parsed: number }) => {
              const percentage = ((context.parsed / totalYearCost) * 100).toFixed(1);
              return `${context.label}: R$ ${context.parsed.toFixed(2)} (${percentage}%)`;
            },
          },
        },
      },
    },
  };
}

// ============= HOOKS PARA REACT (EXEMPLO) =============

/**
 * Hook customizado para buscar dados de relatórios financeiros
 */
export function useFinancialReports(companyId: string, authToken: string, apiKey: string) {
  const baseUrl = 'http://localhost:8081/v1/financial-reports';

  const headers = {
    Authorization: `Bearer ${authToken}`,
    'x-api-token': apiKey,
    'Content-Type': 'application/json',
  };

  const fetchAnnualCosts = async (year?: number): Promise<AnnualEpiCost[]> => {
    const url = `${baseUrl}/${companyId}/annual-costs${year ? `?year=${year}` : ''}`;
    const response = await fetch(url, { headers });
    const data: AnnualCostsResponse = await response.json();
    return data.data;
  };

  const fetchMonthlyData = async (year: number): Promise<MonthlyFinancialData> => {
    const url = `${baseUrl}/${companyId}/monthly-data?year=${year}`;
    const response = await fetch(url, { headers });
    const data: MonthlyDataResponse = await response.json();
    return data.data;
  };

  const fetchTopExpensive = async (year: number, limit: number = 5): Promise<AnnualEpiCost[]> => {
    const url = `${baseUrl}/${companyId}/top-expensive?year=${year}&limit=${limit}`;
    const response = await fetch(url, { headers });
    const data: TopExpensiveResponse = await response.json();
    return data.data;
  };

  const fetchAnnualSummary = async (): Promise<AnnualSummaryData> => {
    const url = `${baseUrl}/${companyId}/annual-summary`;
    const response = await fetch(url, { headers });
    const data: AnnualSummaryResponse = await response.json();
    return data.data;
  };

  return {
    fetchAnnualCosts,
    fetchMonthlyData,
    fetchTopExpensive,
    fetchAnnualSummary,
  };
}

// ============= TIPOS PARA COMPONENTES DE GRÁFICOS =============

export interface ChartProps {
  data: unknown;
  title?: string;
  height?: number;
  width?: number;
  loading?: boolean;
  error?: string;
}

export interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string; // Pode ser uma string com nome do ícone ou classe CSS
  trend?: 'up' | 'down' | 'neutral';
  trendPercentage?: number;
}

export interface FilterProps {
  selectedYear: number;
  onYearChange: (_year: number) => void;
  availableYears: number[];
  selectedEpis?: string[];
  onEpisChange?: (_epis: string[]) => void;
  availableEpis?: EpiData[];
}

// ============= CONSTANTES ÚTEIS =============

export const MONTHS_PT_BR = [
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

export const CHART_COLORS = {
  primary: '#3B82F6',
  secondary: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#14B8A6',
  purple: '#8B5CF6',
};

export const DEFAULT_CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: false,
    },
  },
};

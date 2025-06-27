# 📊 API de Relatórios Financeiros de EPI - Guia de Implementação Frontend

## 🎯 Visão Geral

Esta documentação fornece exemplos práticos para implementar gráficos e
dashboards utilizando as APIs de relatórios financeiros de EPI.

## 🚀 Quick Start

### 1. Autenticação

```javascript
// Login para obter token
const loginResponse = await fetch('http://localhost:8081/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-token': 'your-company-api-key',
  },
  body: JSON.stringify({
    email: 'user@company.com',
    password: 'password',
  }),
});

const { token, company } = await loginResponse.json();
const companyId = company.id;
```

### 2. Headers para Requisições

```javascript
const headers = {
  Authorization: `Bearer ${token}`,
  'x-api-token': 'your-company-api-key',
  'Content-Type': 'application/json',
};
```

## 📈 Exemplos de Implementação de Gráficos

### 🔥 Gráfico de Gastos Mensais (Chart.js)

```javascript
// Buscar dados mensais
async function fetchMonthlyData(year) {
  const response = await fetch(
    `http://localhost:8081/v1/financial-reports/${companyId}/monthly-data?year=${year}`,
    { headers },
  );
  return response.json();
}

// Configurar gráfico
function createMonthlyChart(monthlyData) {
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

  const chartData = months.map(month => ({
    month,
    totalGasto: monthlyData[month].totalGasto,
    quantidadeEntregue: monthlyData[month].quantidadeEntregue,
  }));

  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: chartData.map(d => d.month),
      datasets: [
        {
          label: 'Gastos Mensais (R$)',
          data: chartData.map(d => d.totalGasto),
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: `Gastos Mensais - ${year}`,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Valor (R$)',
          },
        },
      },
    },
  });
}
```

### 📊 Ranking de EPIs Mais Caros

```javascript
// Buscar top EPIs
async function fetchTopExpensiveEpis(year, limit = 5) {
  const response = await fetch(
    `http://localhost:8081/v1/financial-reports/${companyId}/top-expensive?year=${year}&limit=${limit}`,
    { headers },
  );
  return response.json();
}

// Gráfico de barras horizontais
function createTopEpisChart(topEpis) {
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: topEpis.map(epi => `${epi.nomeEpi} (${epi.ca})`),
      datasets: [
        {
          label: 'Total Gasto (R$)',
          data: topEpis.map(epi => epi.totalGasto),
          backgroundColor: [
            '#EF4444', // 1º lugar - Vermelho
            '#F97316', // 2º lugar - Laranja
            '#EAB308', // 3º lugar - Amarelo
            '#3B82F6', // 4º lugar - Azul
            '#8B5CF6', // 5º lugar - Roxo
          ],
        },
      ],
    },
    options: {
      indexAxis: 'y', // Barras horizontais
      responsive: true,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: `Top ${topEpis.length} EPIs Mais Caros - ${topEpis[0]?.ano}`,
        },
        tooltip: {
          callbacks: {
            afterLabel: context => {
              const epi = topEpis[context.dataIndex];
              const costPerUnit = (
                epi.totalGasto / epi.quantidadeEntregue
              ).toFixed(2);
              return [
                `Quantidade: ${epi.quantidadeEntregue} unidades`,
                `Custo/Unidade: R$ ${costPerUnit}`,
              ];
            },
          },
        },
      },
    },
  });
}
```

### 🥧 Gráfico de Pizza - Distribuição de Gastos

```javascript
// Buscar dados anuais
async function fetchAnnualCosts(year) {
  const response = await fetch(
    `http://localhost:8081/v1/financial-reports/${companyId}/annual-costs?year=${year}`,
    { headers },
  );
  return response.json();
}

// Gráfico de pizza
function createEpiDistributionPie(annualCosts) {
  const totalCost = annualCosts.reduce((sum, epi) => sum + epi.totalGasto, 0);

  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: annualCosts.map(epi => epi.nomeEpi),
      datasets: [
        {
          data: annualCosts.map(epi => epi.totalGasto),
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
        title: {
          display: true,
          text: `Distribuição de Gastos por EPI - ${annualCosts[0]?.ano}`,
        },
        tooltip: {
          callbacks: {
            label: context => {
              const percentage = ((context.parsed / totalCost) * 100).toFixed(
                1,
              );
              return `${context.label}: R$ ${context.parsed.toFixed(2)} (${percentage}%)`;
            },
          },
        },
      },
    },
  });
}
```

## 🏆 Dashboard Cards - Métricas Principais

```javascript
// Calcular métricas do dashboard
function calculateDashboardMetrics(annualCosts, year) {
  const yearData = annualCosts.filter(item => item.ano === year);

  const totalCost = yearData.reduce((sum, item) => sum + item.totalGasto, 0);
  const totalItems = yearData.reduce(
    (sum, item) => sum + item.quantidadeEntregue,
    0,
  );
  const uniqueEpis = new Set(yearData.map(item => item.epiId)).size;
  const avgCostPerItem = totalItems > 0 ? totalCost / totalItems : 0;

  const mostExpensive = yearData.reduce(
    (max, item) => (item.totalGasto > max.totalGasto ? item : max),
    { totalGasto: 0, nomeEpi: '', quantidadeEntregue: 0 },
  );

  return {
    totalCost: totalCost.toFixed(2),
    totalItems,
    uniqueEpis,
    avgCostPerItem: avgCostPerItem.toFixed(2),
    mostExpensive: mostExpensive.totalGasto > 0 ? mostExpensive : null,
  };
}

// Componente de card (React exemplo)
function DashboardCard({ title, value, subtitle, trend, trendPercentage }) {
  const trendColor =
    trend === 'up'
      ? 'text-green-600'
      : trend === 'down'
        ? 'text-red-600'
        : 'text-gray-600';

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
      <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      {trend && (
        <p className={`text-sm mt-2 ${trendColor}`}>
          {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}{' '}
          {trendPercentage}%
        </p>
      )}
    </div>
  );
}
```

## 🎛️ Filtros e Controles

```javascript
// Seletor de ano
function YearSelector({ selectedYear, onYearChange, availableYears }) {
  return (
    <select
      value={selectedYear}
      onChange={e => onYearChange(parseInt(e.target.value))}
      className="border rounded-md px-3 py-2"
    >
      {availableYears.map(year => (
        <option key={year} value={year}>
          {year}
        </option>
      ))}
    </select>
  );
}

// Filtro de EPIs
function EpiFilter({ selectedEpis, onEpisChange, availableEpis }) {
  const handleToggle = epiId => {
    const newSelection = selectedEpis.includes(epiId)
      ? selectedEpis.filter(id => id !== epiId)
      : [...selectedEpis, epiId];
    onEpisChange(newSelection);
  };

  return (
    <div className="space-y-2">
      <h4 className="font-medium">Filtrar EPIs:</h4>
      {availableEpis.map(epi => (
        <label key={epi.epiId} className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={selectedEpis.includes(epi.epiId)}
            onChange={() => handleToggle(epi.epiId)}
          />
          <span>
            {epi.nomeEpi} ({epi.ca})
          </span>
        </label>
      ))}
    </div>
  );
}
```

## 📱 Exemplo de Dashboard Completo (React)

```jsx
import React, { useState, useEffect } from 'react';
import { Chart } from 'chart.js/auto';

function FinancialDashboard() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [annualCosts, setAnnualCosts] = useState([]);
  const [monthlyData, setMonthlyData] = useState({});
  const [topEpis, setTopEpis] = useState([]);
  const [loading, setLoading] = useState(true);

  // Buscar dados quando o ano mudar
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [annualRes, monthlyRes, topRes] = await Promise.all([
          fetch(
            `/api/financial-reports/${companyId}/annual-costs?year=${selectedYear}`,
            { headers },
          ),
          fetch(
            `/api/financial-reports/${companyId}/monthly-data?year=${selectedYear}`,
            { headers },
          ),
          fetch(
            `/api/financial-reports/${companyId}/top-expensive?year=${selectedYear}&limit=5`,
            { headers },
          ),
        ]);

        setAnnualCosts((await annualRes.json()).data);
        setMonthlyData((await monthlyRes.json()).data);
        setTopEpis((await topRes.json()).data);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [selectedYear]);

  const metrics = calculateDashboardMetrics(annualCosts, selectedYear);

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Header com filtros */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard Financeiro EPI</h1>
        <YearSelector
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          availableYears={[2024, 2025]}
        />
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Gasto Total"
          value={`R$ ${metrics.totalCost}`}
          subtitle={`${selectedYear}`}
        />
        <DashboardCard
          title="Itens Entregues"
          value={metrics.totalItems}
          subtitle="unidades"
        />
        <DashboardCard
          title="EPIs Diferentes"
          value={metrics.uniqueEpis}
          subtitle="tipos únicos"
        />
        <DashboardCard
          title="Custo Médio/Item"
          value={`R$ ${metrics.avgCostPerItem}`}
          subtitle="por unidade"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <canvas id="monthlyChart"></canvas>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <canvas id="topEpisChart"></canvas>
        </div>
      </div>
    </div>
  );
}
```

## 🎨 Configurações de Estilo

```css
/* CSS para os gráficos */
.chart-container {
  position: relative;
  height: 400px;
  margin: 20px 0;
}

.dashboard-card {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.dashboard-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.trend-up {
  color: #10b981;
}
.trend-down {
  color: #ef4444;
}
.trend-neutral {
  color: #6b7280;
}
```

## 🔄 Tratamento de Erros

```javascript
// Wrapper para requisições com tratamento de erro
async function apiRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: { ...headers, ...options.headers },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro na API:', error);
    throw error;
  }
}

// Uso com loading e error states
function useApiData(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiRequest(url)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [url]);

  return { data, loading, error };
}
```

## 📊 Tipos de Gráficos Recomendados

| Dado              | Tipo de Gráfico        | Biblioteca | Uso                  |
| ----------------- | ---------------------- | ---------- | -------------------- |
| Gastos Mensais    | Line Chart             | Chart.js   | Tendências temporais |
| Top EPIs          | Bar Chart (Horizontal) | Chart.js   | Rankings             |
| Distribuição      | Pie/Doughnut           | Chart.js   | Proporções           |
| Comparação Anual  | Multi-Line             | Chart.js   | Comparações          |
| Evolução Temporal | Area Chart             | Recharts   | Crescimento          |
| Métricas          | Cards + Badges         | Custom     | KPIs                 |

## 🚀 Próximos Passos

1. **Implementar cache** para melhorar performance
2. **Adicionar filtros avançados** (por CA, faixa de data, etc.)
3. **Criar relatórios PDF** com os gráficos
4. **Implementar alertas** para gastos acima do normal
5. **Adicionar previsões** baseadas em dados históricos

---

✅ **APIs testadas e funcionando!** ✅ **Dados históricos disponíveis!** ✅
**Pronto para implementação no frontend!**

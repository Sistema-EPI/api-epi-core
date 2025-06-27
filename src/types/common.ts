// Tipos para resolver problemas de tipagem implícita no projeto

export interface CompanyWithCounts {
  _count: {
    colaboradores: number;
    epis: number;
    authCompanies: number;
  };
}

export interface AuthCompanyWithUser {
  user: {
    idUser: string;
    email: string;
    statusUser: boolean;
  };
  cargo: string;
}

export interface EpiGrouped {
  nomeEpi: string;
  _sum: {
    quantidade: number | null;
  };
}

export interface EpiWithStock {
  nomeEpi: string;
  quantidade: number;
  quantidadeMinima: number;
  idEpi?: string;
  preco?: number | null;
}

export interface ProcessWithEpis {
  dataEntrega: Date | null;
  processEpis: Array<{
    quantidade: number;
  }>;
}

export interface ProcessEpiItem {
  quantidade: number;
}

export interface UserWithAuth {
  idUser: string;
  email: string;
  statusUser: boolean;
}

export interface EpiData {
  idEpi: string;
  nomeEpi: string;
  quantidade: number;
}

// Tipos para reduzers
export type ReducerCallback<T, U> = (_accumulator: T, _currentValue: U) => T;

// Tipos para transações Prisma
export interface PrismaTransaction {
  // Deixamos flexível para métodos do Prisma
  [key: string]: unknown;
}

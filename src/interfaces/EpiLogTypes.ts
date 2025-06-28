// Interfaces para tipagem dos dados de EPI no sistema de logs
import { Decimal } from '@prisma/client/runtime/library';

export interface EpiLogData {
  ca: string;
  nomeEpi: string;
  quantidade: number;
  quantidadeMinima: number;
  preco?: Decimal | number | null;
  validade?: Date | null;
  descricao?: string | null;
}

export interface EpiUpdateLogData extends EpiLogData {
  changedFields: string[];
  changes: Record<
    string,
    {
      old: unknown;
      new: unknown;
    }
  >;
}

export interface LogBodyBase {
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface EpiCreateLogBody extends LogBodyBase, EpiLogData {}

export interface EpiUpdateLogBody extends LogBodyBase {
  ca: string;
  nomeEpi: string;
  changedFields: string[];
  changes: Record<
    string,
    {
      old: unknown;
      new: unknown;
    }
  >;
}

export interface EpiDeleteLogBody extends LogBodyBase, EpiLogData {}

/**
 * Helper para formatação de dados de entidades para o frontend
 * Centraliza as funções de formatação de dados antes de enviar para o frontend
 */

import { formatDateToBrazilian, formatDateTimeToBrazilian } from './DateHelper';

/**
 * Formata dados de EPI para o frontend
 * Converte datas para formato brasileiro e garante consistência dos dados
 * @param epi - Objeto EPI do banco de dados
 * @returns Objeto EPI formatado para o frontend
 */
export function formatEpiForFrontend(epi: any) {
  return {
    ...epi,
    validade: formatDateToBrazilian(epi.validade),
    dataCompra: formatDateToBrazilian(epi.dataCompra),
    createdAt: formatDateTimeToBrazilian(epi.createdAt),
    updatedAt: formatDateTimeToBrazilian(epi.updatedAt),
  };
}

/**
 * Formata dados de Colaborador para o frontend
 * @param colaborador - Objeto Colaborador do banco de dados
 * @returns Objeto Colaborador formatado para o frontend
 */
export function formatCollaboratorForFrontend(colaborador: any) {
  return {
    ...colaborador,
    createdAt: formatDateTimeToBrazilian(colaborador.createdAt),
    updatedAt: formatDateTimeToBrazilian(colaborador.updatedAt),
  };
}

/**
 * Formata dados de Empresa para o frontend
 * @param empresa - Objeto Empresa do banco de dados
 * @returns Objeto Empresa formatado para o frontend
 */
export function formatCompanyForFrontend(empresa: any) {
  return {
    ...empresa,
    createdAt: formatDateTimeToBrazilian(empresa.createdAt),
    updatedAt: formatDateTimeToBrazilian(empresa.updatedAt),
  };
}

/**
 * Formata dados de Processo para o frontend
 * @param processo - Objeto Processo do banco de dados
 * @returns Objeto Processo formatado para o frontend
 */
export function formatProcessForFrontend(processo: any) {
  return {
    ...processo,
    dataAgendada: formatDateToBrazilian(processo.dataAgendada),
    dataEntrega: formatDateTimeToBrazilian(processo.dataEntrega),
    dataDevolucao: formatDateTimeToBrazilian(processo.dataDevolucao),
    createdAt: formatDateTimeToBrazilian(processo.createdAt),
    updatedAt: formatDateTimeToBrazilian(processo.updatedAt),
  };
}

/**
 * Formata dados de Usuário para o frontend
 * @param user - Objeto User do banco de dados
 * @returns Objeto User formatado para o frontend (sem senha)
 */
export function formatUserForFrontend(user: any) {
  const { senha, ...userWithoutPassword } = user;
  return {
    ...userWithoutPassword,
    lastLoginAt: formatDateTimeToBrazilian(user.lastLoginAt),
    createdAt: formatDateTimeToBrazilian(user.createdAt),
    updatedAt: formatDateTimeToBrazilian(user.updatedAt),
    deletedAt: formatDateTimeToBrazilian(user.deletedAt),
  };
}

/**
 * Formata lista de itens para o frontend
 * @param items - Array de itens
 * @param formatter - Função de formatação específica
 * @returns Array de itens formatados
 */
export function formatListForFrontend<T>(items: T[], formatter: (item: T) => any): any[] {
  return items.map(formatter);
}

/**
 * Formata resposta paginada para o frontend
 * @param data - Array de dados
 * @param meta - Metadados de paginação
 * @param formatter - Função de formatação específica
 * @returns Objeto de resposta formatado
 */
export function formatPaginatedResponse<T>(data: T[], meta: any, formatter: (item: T) => any) {
  return {
    data: formatListForFrontend(data, formatter),
    pagination: meta,
  };
}

// Tipos de logs para EPIs
export const EPI_LOG_TYPES = {
  EPI_CREATED: 'EPI_CREATED',
  EPI_UPDATED: 'EPI_UPDATED',
  EPI_DELETED: 'EPI_DELETED',
} as const;

export type EpiLogType = (typeof EPI_LOG_TYPES)[keyof typeof EPI_LOG_TYPES];

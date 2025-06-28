export interface CreateLog {
  body: any;
  tipo: string;
  companyId: string;
  entityType: string;
  entityId: string;
  userId?: string;
}

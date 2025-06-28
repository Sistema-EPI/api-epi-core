import { InputJsonValue } from '@prisma/client/runtime/library';

export interface CreateLog {
  body: InputJsonValue;
  tipo: string;
  companyId: string;
  entityType: string;
  entityId: string;
  userId?: string;
}

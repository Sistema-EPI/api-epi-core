import { z } from 'zod';

export const GetDashboardSchema = z.object({
  params: z.object({
    companyId: z.string(),
  }),
});

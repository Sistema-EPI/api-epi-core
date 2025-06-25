import { z } from 'zod';

export const GetGeneralStatsSchema = z.object({
  params: z.object({
    companyId: z.string(),
  }),
});

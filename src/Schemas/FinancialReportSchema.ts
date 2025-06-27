import { z } from 'zod';

export const GetFinancialReportSchema = z.object({
  params: z.object({
    companyId: z.string().uuid('Company ID deve ser um UUID válido'),
  }),
  query: z.object({
    year: z.string().optional(),
  }),
});

export const GetTopExpensiveEpisSchema = z.object({
  params: z.object({
    companyId: z.string().uuid('Company ID deve ser um UUID válido'),
  }),
  query: z.object({
    year: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export type GetFinancialReportType = z.infer<typeof GetFinancialReportSchema>;
export type GetTopExpensiveEpisType = z.infer<typeof GetTopExpensiveEpisSchema>;

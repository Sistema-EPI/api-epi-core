import { z } from 'zod';

export const createCompanySchema = z.object({
    body: z.object({
        name: z.string().min(1).max(20),
        cnpj: z.string().length(14),
    })
});
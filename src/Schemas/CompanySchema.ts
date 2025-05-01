import { z } from 'zod';

export const createCompanySchema = z.object({
    body: z.object({
        id: z.string().uuid(),
        name: z.string().min(1).max(20),
        cnpj: z.string().length(14),
    })
});
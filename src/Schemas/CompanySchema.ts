import { z } from 'zod';

export const createCompanySchema = z.object({
    id: z.string(),
    name: z.string().min(1),
    cnpj: z.string().length(14),
});
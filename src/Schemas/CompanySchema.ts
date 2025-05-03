import { z } from 'zod';

export const createCompanySchema = z.object({
    name: z.string().min(1),
    cnpj: z.string().length(14),
});
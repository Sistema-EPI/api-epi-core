import { z } from "zod";

export const LoginSchema = z.object({
    email: z.string(),
    senha: z.string().min(6),
    status_user: z.enum(['ATIVO', 'INATIVO']).default('ATIVO'),
});

export const SelectCompanySchema = z.object({
    params: z.object({
        id_usuario: z.string().uuid(),
        id_empresa: z.string().uuid(),
    }),
});




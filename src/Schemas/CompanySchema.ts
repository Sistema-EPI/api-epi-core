import { z } from 'zod';

export const CreateCompanySchema = z.object({
    nomeFantasia: z.string(),
    razaoSocial: z.string().optional(),
    cnpj: z.string().length(14),
    uf: z.string().length(2).optional(),
    cep: z.string().length(8),
    logradouro: z.string().optional(),
    email: z.string().email(),
    telefone: z.string().min(10).max(20).optional(),
});

export const UpdateCompanySchema = z.object({
    params: z.object({
        id: z.string(),
    }),
    body: z.object({
        nomeFantasia: z.string().min(1).optional(),
        razaoSocial: z.string().min(1).optional(),
        cnpj: z.string().length(14).optional(),
        uf: z.string().length(2).optional(),
        cep: z.string().length(8).optional(),
        logradouro: z.string().min(5).optional(),
        email: z.string().email().optional(),
        telefone: z.string().min(10).max(20).optional(),
    }),
});

export const DeleteCompanySchema = z.object({
    params: z.object({
        id: z.string(),
    }),
});

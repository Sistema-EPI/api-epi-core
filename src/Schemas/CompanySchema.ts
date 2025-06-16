import { z } from 'zod';

export const GetCompaniesSchema = z.object({
    query: z.object({
        page: z.string().optional(),
        limit: z.string().optional(),
    }),
});

export const GetCompanyByIdSchema = z.object({
    params: z.object({
        id: z.string(),
    }),
});

export const CreateCompanySchema = z.object({
    nome_fantasia: z.string(),
    razao_social: z.string(),
    cnpj: z.string().length(14),
    uf: z.string().length(2).optional(),
    cep: z.string().length(8),
    logradouro: z.string().optional(),
    email: z.string().email(),
    telefone: z.string().min(10).max(20).optional(),
    status_empresa: z.boolean().default(true),
});

export const UpdateCompanySchema = z.object({
    params: z.object({
        id: z.string(),
    }),
    body: z.object({
        nome_fantasia: z.string().min(1).optional(),
        razao_social: z.string().min(1).optional(),
        cnpj: z.string().length(14).optional(),
        uf: z.string().length(2).optional(),
        cep: z.string().length(8).optional(),
        logradouro: z.string().optional(),
        email: z.string().email().optional(),
        telefone: z.string().optional(),
        status_empresa: z.boolean().optional(), 
    }),
});

export const DeleteCompanySchema = z.object({
    params: z.object({
        id: z.string(),
    }),
});

export const UpdateCompanyStatusSchema = z.object({
    params: z.object({
        id: z.string(),
    }),
    body: z.object({
        status_empresa: z.boolean(),
    }),
});

import { z } from 'zod';

export const GetEpisSchema = z.object({
    query: z.object({
        page: z.string().optional(),
        limit: z.string().optional(),
        id_empresa: z.string().uuid('ID da empresa deve ser um UUID válido').optional(),
    }),
});

export const GetEpiByCaSchema = z.object({
    params: z.object({
        ca: z.string().length(5, 'CA deve ter exatamente 5 caracteres'),
    }),
});

export const CreateEpiSchema = z.object({
    ca: z.string().length(5),
    id_empresa: z.string().uuid('ID da empresa deve ser um UUID válido'),
    nome_epi: z.string().min(1),
    validade: z.string().optional(),
    vida_util: z.string().optional(),
    quantidade: z.number().int().nonnegative(),
    quantidade_minima: z.number().int().nonnegative(),
    data_compra: z.string().optional(),
});

export const UpdateEpiSchema = z.object({
    params: z.object({
        ca: z.string().length(5),
    }),
    body: z.object({
        id_empresa: z.string().uuid('ID da empresa deve ser um UUID válido').optional(),
        nome_epi: z.string().min(1).optional(),
        validade: z.string().optional(),
        vida_util: z.string().optional(),
        quantidade: z.number().int().nonnegative().optional(),
        quantidade_minima: z.number().int().nonnegative().optional(),
        data_compra: z.string().optional(),
    }),
});

export const DeleteEpiSchema = z.object({
    params: z.object({
        ca: z.string().length(5),
    }),
});

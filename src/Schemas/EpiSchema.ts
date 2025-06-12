import { z } from 'zod';

export const GetEpisSchema = z.object({
    query: z.object({
        page: z.string().optional(),
        limit: z.string().optional(),
        id_empresa: z.string().uuid('ID da empresa deve ser um UUID válido').optional(),
    }),
});

export const GetEpiByIdSchema = z.object({
    params: z.object({
        id: z.string().uuid('ID do EPI deve ser um UUID válido'),
    }),
});

export const CreateEpiSchema = z.object({
    ca: z.string().min(1, 'CA é obrigatório').max(20, 'CA deve ter no máximo 20 caracteres'),
    id_empresa: z.string().uuid('ID da empresa deve ser um UUID válido'),
    nome_epi: z.string().min(1, 'Nome do EPI é obrigatório'),
    validade: z.string().optional(),
    descricao: z.string().optional(),
    quantidade: z.number().int().nonnegative('Quantidade deve ser um número não negativo'),
    quantidade_minima: z.number().int().nonnegative('Quantidade mínima deve ser um número não negativo'),
    data_compra: z.string().optional(),
    vida_util: z.string().optional(),
});

export const UpdateEpiSchema = z.object({
    params: z.object({
        id: z.string().uuid('ID do EPI deve ser um UUID válido'),
    }),
    body: z.object({
        ca: z.string().min(1).max(20).optional(),
        id_empresa: z.string().uuid('ID da empresa deve ser um UUID válido').optional(),
        nome_epi: z.string().min(1).optional(),
        validade: z.string().optional(),
        descricao: z.string().optional(),
        quantidade: z.number().int().nonnegative().optional(),
        quantidade_minima: z.number().int().nonnegative().optional(),
        data_compra: z.string().optional(),
        vida_util: z.string().optional(),
    }),
});

export const DeleteEpiSchema = z.object({
    params: z.object({
        id: z.string().uuid('ID do EPI deve ser um UUID válido'),
    }),
});

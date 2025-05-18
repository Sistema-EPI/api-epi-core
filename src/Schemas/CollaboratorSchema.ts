import { z } from "zod";

export const GetCollaboratorSchema = z.object({
    query: z.object({
        page: z.string().optional(),
        limit: z.string().optional(),
    }),
});

export const CreateCollaboratorSchema = z.object({
    params: z.object({
        companyId: z.string(),
    }),
    body: z.object({
        nomeColaborador: z.string(),
        cpf: z.string().max(11).min(11),
        statusColaborador: z.enum(['ATIVO', 'INATIVO']),
    })
});
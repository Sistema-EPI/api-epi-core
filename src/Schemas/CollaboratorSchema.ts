import { z } from "zod";

export const GetCollaboratorSchema = z.object({
    query: z.object({
        page: z.string().optional(),
        limit: z.string().optional(),
    }),
});

export const GetCollaboratorByIdSchema = z.object({
    params: z.object({
        id: z.string(),
    }),
});

export const CreateCollaboratorSchema = z.object({
    params: z.object({
        companyId: z.string(),
    }),
    body: z.object({
        nome_colaborador: z.string(),
        cpf: z.string().max(11).min(11),
        status_colaborador: z.enum(['ATIVO', 'INATIVO']),
    })
});

export const UpdateCollaboratorSchema = z.object({
    params: z.object({
        id: z.string(),
    }),
    body: z.object({
        nome_colaborador: z.string(),
        cpf: z.string().max(11).min(11),
        status_colaborador: z.enum(['ATIVO', 'INATIVO']),
    }),
});

export const DeleteCollaboratorSchema = z.object({
    params: z.object({
        id: z.string(),
    }),
});
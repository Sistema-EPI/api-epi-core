import { z } from "zod";

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
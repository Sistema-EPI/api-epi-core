import { z } from 'zod';

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
    status: z.boolean().default(true),
  }),
});

export const UpdateCollaboratorSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    nome_colaborador: z.string().optional(),
    cpf: z.string().max(11).min(11).optional(),
    status: z.boolean().optional(),
  }),
});

export const DeleteCollaboratorSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export const GetCollaboratorsByCompanySchema = z.object({
  params: z.object({
    companyId: z.string().uuid('ID da empresa deve ser um UUID válido'),
  }),
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    status: z
      .string()
      .optional()
      .transform(val => (val === 'true' ? true : val === 'false' ? false : undefined)),
  }),
});

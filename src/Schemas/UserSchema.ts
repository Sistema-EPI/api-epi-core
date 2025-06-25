import { z } from 'zod';

export const GetUsersSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    companyId: z.string().uuid().optional(),
  }),
});

export const CreateUserSchema = z.object({
  body: z.object({
    email: z.string().email(),
    senha: z.string().min(6),
    name: z.string().optional(),
    status_user: z.boolean().optional().default(true),
  }),
});

export const GetUserByIdSchema = z.object({
  params: z.object({
    userId: z.string().uuid(),
  }),
});

export const ConnectUserToCompanySchema = z.object({
  params: z.object({
    userId: z.string().uuid({ message: 'ID do usuário inválido (UUID)' }),
    companyId: z.string().uuid({ message: 'ID da empresa inválido (UUID)' }),
  }),
  body: z.object({
    cargo: z.enum(['admin', 'gestor', 'tecnico', 'viewer'], {
      required_error: 'Cargo é obrigatório',
      invalid_type_error: 'Cargo deve ser admin, gestor, tecnico ou viewer',
    }),
  }),
});

export const ChangePasswordSchema = z.object({
  params: z.object({
    userId: z.string().uuid(),
  }),
  body: z.object({
    senhaAtual: z.string().min(6, 'Senha atual é obrigatória'),
    novaSenha: z.string().min(6, 'Nova senha deve ter no mínimo 6 caracteres'),
  }),
});

export const UpdateUserStatusSchema = z.object({
  params: z.object({
    userId: z.string().uuid(),
  }),
  body: z.object({
    statusUser: z.boolean(),
  }),
});

export const DeleteUserSchema = z.object({
  params: z.object({
    userId: z.string().uuid(),
  }),
});

export const GetUsersByCompanySchema = z.object({
  params: z.object({
    companyId: z.string().uuid(),
  }),
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export const CreateAdminUserSchema = z.object({
  body: z.object({
    email: z.string().email(),
    senha: z.string().min(6),
    name: z.string().optional(),
    companyId: z.string().uuid(),
  }),
});

export const ConnectUserToCompanyHandlerSchema = ConnectUserToCompanySchema;

export const UpdateUserSchema = z.object({
  params: z.object({
    userId: z.string().uuid(),
  }),
  body: z
    .object({
      name: z.string().min(1, 'Nome não pode estar vazio').optional(),
      email: z.string().email('Email deve ter formato válido').optional(),
      senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').optional(),
    })
    .refine(
      data => data.name !== undefined || data.email !== undefined || data.senha !== undefined,
      {
        message: 'Pelo menos um campo deve ser fornecido (name, email ou senha)',
      },
    ),
});

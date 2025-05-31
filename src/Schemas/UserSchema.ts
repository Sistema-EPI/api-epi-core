import { z } from "zod";


export const GetUsersSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export const CreateUserSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    email: z.string().email(),
    senha: z.string(),
    cargo: z.enum(['ADMIN', 'GESTOR', 'OPERADOR']),
    status_user: z.boolean().optional().default(true),
  }),
});

export const GetUserByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const ConnectUserToCompanyHandlerSchema = z.object({
  params: z.object({
    userId: z.string().uuid({ message: 'ID do usuário inválido (UUID)' }),
    companyId: z.string().uuid({ message: 'ID da empresa inválido (UUID)' }),
  }),
  body: z.object({
    cargo: z.enum(['ADMIN', 'GESTOR', 'OPERADOR'], {
      required_error: 'Cargo é obrigatório',
      invalid_type_error: 'Cargo deve ser ADMIN, GESTOR ou OPERADOR',
    }),
  }),
});

export const ChangePasswordSchema = z.object({
  params: z.object({
    userId: z.string().uuid(),
  }),
  body: z.object({
    senhaAtual: z.string().min(6, 'Senha atual é obrigatória'),
    novaSenha: z.string().min(6, 'Nova senha deve ter no mínimo 6 caracteres')
  })
})
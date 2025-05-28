import { z } from "zod";


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

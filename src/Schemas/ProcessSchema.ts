import { z } from 'zod';

// Schema para EPI dentro do processo
export const ProcessEpiSchema = z.object({
  idEpi: z.string().uuid('ID do EPI deve ser um UUID válido'),
  quantidade: z.number().min(1, 'Quantidade deve ser maior que 0').default(1),
});

// Schema para criar processo
export const CreateProcessSchema = z.object({
  idColaborador: z.string().uuid('ID do colaborador deve ser um UUID válido'),
  dataAgendada: z.string().transform(val => new Date(val)),
  epis: z.array(ProcessEpiSchema).min(1, 'Deve haver pelo menos um EPI no processo'),
  observacoes: z.string().optional(),
});

// Schema para atualizar processo
export const UpdateProcessSchema = z.object({
  idColaborador: z.string().uuid('ID do colaborador deve ser um UUID válido').optional(),
  dataAgendada: z
    .string()
    .transform(val => new Date(val))
    .optional(),
  epis: z.array(ProcessEpiSchema).min(1, 'Deve haver pelo menos um EPI no processo').optional(),
  observacoes: z.string().optional(),
  statusEntrega: z.boolean().optional(),
  dataEntrega: z
    .string()
    .transform(val => new Date(val))
    .optional(),
  dataDevolucao: z
    .string()
    .transform(val => new Date(val))
    .optional(),
  pdfUrl: z.string().url('URL do PDF deve ser válida').optional(),
});

// Schema para buscar processo por ID
export const GetProcessByIdSchema = z.object({
  id: z.string().uuid('ID deve ser um UUID válido'),
});

// Schema para buscar processos por empresa
export const GetProcessesByEmpresaSchema = z.object({
  id_empresa: z.string().uuid('ID da empresa deve ser um UUID válido'),
  page: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val) : 1)),
  limit: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val) : 10)),
  status: z.enum(['todos', 'pendentes', 'entregues']).optional().default('todos'),
  dataInicio: z
    .string()
    .optional()
    .transform(val => (val ? new Date(val) : undefined)),
  dataFim: z
    .string()
    .optional()
    .transform(val => (val ? new Date(val) : undefined)),
});

// Schema para buscar processos por colaborador
export const GetProcessesByColaboradorSchema = z.object({
  id_colaborador: z.string().uuid('ID do colaborador deve ser um UUID válido'),
  page: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val) : 1)),
  limit: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val) : 10)),
  status: z.enum(['todos', 'pendentes', 'entregues']).optional().default('todos'),
});

// Schema para confirmar entrega (biometria)
export const ConfirmDeliverySchema = z.object({
  id: z.string().uuid('ID deve ser um UUID válido'),
  dataEntrega: z
    .string()
    .transform(val => new Date(val))
    .optional(),
  pdfUrl: z.string().url('URL do PDF deve ser válida').optional(),
});

// Schema para registrar devolução
export const RegisterReturnSchema = z.object({
  id: z.string().uuid('ID deve ser um UUID válido'),
  dataDevolucao: z.string().transform(val => new Date(val)),
  observacoes: z.string().optional(),
});

// Schema para listar processos (admin)
export const ListProcessesSchema = z.object({
  page: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val) : 1)),
  limit: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val) : 10)),
  search: z.string().optional(),
  status: z.enum(['todos', 'pendentes', 'entregues']).optional().default('todos'),
  dataInicio: z
    .string()
    .optional()
    .transform(val => (val ? new Date(val) : undefined)),
  dataFim: z
    .string()
    .optional()
    .transform(val => (val ? new Date(val) : undefined)),
});

// Tipos TypeScript derivados dos schemas
export type CreateProcessType = z.infer<typeof CreateProcessSchema>;
export type UpdateProcessType = z.infer<typeof UpdateProcessSchema>;
export type GetProcessByIdType = z.infer<typeof GetProcessByIdSchema>;
export type GetProcessesByEmpresaType = z.infer<typeof GetProcessesByEmpresaSchema>;
export type GetProcessesByColaboradorType = z.infer<typeof GetProcessesByColaboradorSchema>;
export type ConfirmDeliveryType = z.infer<typeof ConfirmDeliverySchema>;
export type RegisterReturnType = z.infer<typeof RegisterReturnSchema>;
export type ListProcessesType = z.infer<typeof ListProcessesSchema>;
export type ProcessEpiType = z.infer<typeof ProcessEpiSchema>;

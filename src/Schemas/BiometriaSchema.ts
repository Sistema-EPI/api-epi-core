import { z } from 'zod';

// Schema para criar biometria
export const CreateBiometriaSchema = z.object({
  idColaborador: z.string().uuid('ID do colaborador deve ser um UUID válido'),
  biometriaPath: z.string().optional(),
  certificadoPath: z.string().optional(),
});

// Schema para atualizar biometria
export const UpdateBiometriaSchema = z.object({
  biometriaPath: z.string().optional(),
  certificadoPath: z.string().optional(),
});

// Schema para verificar biometria
export const VerifyBiometriaSchema = z.object({
  idColaborador: z.string().uuid('ID do colaborador deve ser um UUID válido'),
  biometriaData: z.string().min(1, 'Dados biométricos são obrigatórios'),
});

// Schema para match de biometria no processo
export const MatchBiometriaSchema = z.object({
  idProcesso: z.string().uuid('ID do processo deve ser um UUID válido'),
  idColaborador: z.string().uuid('ID do colaborador deve ser um UUID válido'),
  biometriaData: z.string().min(1, 'Dados biométricos são obrigatórios'),
});

// Tipos TypeScript baseados nos schemas
export type CreateBiometriaType = z.infer<typeof CreateBiometriaSchema>;
export type UpdateBiometriaType = z.infer<typeof UpdateBiometriaSchema>;
export type VerifyBiometriaType = z.infer<typeof VerifyBiometriaSchema>;
export type MatchBiometriaType = z.infer<typeof MatchBiometriaSchema>;

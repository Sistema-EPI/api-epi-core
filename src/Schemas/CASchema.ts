import { z } from 'zod';

export const CAParamSchema = z.object({
  ca: z.string().min(1, 'CA é obrigatório'),
});

// todo: ajustar depois
export const CAResponseSchema = z.object({
  ca: z.string().optional(),
  status: z.string().optional(),
  data: z.any().optional(),
});

export type CAParam = z.infer<typeof CAParamSchema>;
export type CAResponse = z.infer<typeof CAResponseSchema>;

import { z } from 'zod';

export const GetEpiByCaSchema = z.object({
  params: z.object({
    ca: z.string().length(5, 'CA deve ter exatamente 5 caracteres'),
  }),
});

export const CreateEpiSchema = z.object({
  body: z.object({
    ca: z.string().length(5),
    id_empresa: z.string().uuid(),
    nome_epi: z.string().min(1),
    validade: z.string().optional(),
    quantidade: z.number().int().nonnegative(),
    quantidade_minima: z.number().int().nonnegative(),
    data_compra: z.string().optional(),
  }),
});

export const UpdateEpiSchema = z.object({
  params: z.object({
    ca: z.string().length(5),
  }),
  body: z.object({
    id_empresa: z.string().uuid().optional(),
    nome_epi: z.string().min(1).optional(),
    validade: z.string().optional(),
    quantidade: z.number().int().nonnegative().optional(),
    quantidade_minima: z.number().int().nonnegative().optional(),
    data_compra: z.string().optional(),
  }),
});

export const DeleteEpiSchema = z.object({
  params: z.object({
    ca: z.string().length(5),
  }),
});

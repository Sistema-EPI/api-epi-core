import { z } from 'zod';

export const createCompanySchema = z.object({
    nomeFantasia: z.string(),
    razaoSocial: z.string().optional(),
    cnpj: z.string().length(14),
    uf: z.string().length(2).optional(),
    cep: z.string().length(8),
    logradouro: z.string().optional(),
    email: z.string().email(),
    telefone: z.string().optional(),
});


//todo: adicionar validacao 
//todo: adicionar tratamento de erro 
//todo: ver model para pegar erro certinho
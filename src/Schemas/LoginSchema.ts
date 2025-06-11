import { z } from "zod";

export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export const SelectCompanySchema = z.object({
    params: z.object({
        id_usuario: z.string().uuid(),
        id_empresa: z.string().uuid(),
    }),
});




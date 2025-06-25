import { z } from 'zod';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  dotenv.config();
}

const EnvSchema = z
  .object({
    // Configurações básicas
    NODE_ENV: z.enum(['development', 'test', 'production']).optional().default('development'),
    ENV: z.string().optional().default('development'),
    PORT: z
      .string()
      .optional()
      .default('8081')
      .transform(val => Number(val)),

    // Banco de dados
    DATABASE_URL: z.string(),

    // CORS
    CORS_ORIGIN: z.string(),

    // JWT
    JWT_SECRET: z.string(),
    JWT_EXPIRATION: z.string().optional().default('30m'),

    // API Externa de Consulta
    API_CONSULTA_URL: z.string().optional(),
    API_KEY: z.string().optional(),
    API_TOKEN: z.string().optional(),

    // Logs
    LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).optional().default('info'),
  })
  .refine(input => {
    const hasOneApiVar = !!(input.API_CONSULTA_URL || input.API_KEY || input.API_TOKEN);
    const hasAllApiVars = !!(input.API_CONSULTA_URL && input.API_KEY && input.API_TOKEN);

    if (hasOneApiVar && !hasAllApiVars) {
      throw new Error(
        'Para usar a API externa, você deve definir todas as variáveis: API_CONSULTA_URL, API_KEY e API_TOKEN',
      );
    }

    return true;
  });

export type Env = z.infer<typeof EnvSchema>;

export const env = EnvSchema.parse(process.env);

export default EnvSchema;

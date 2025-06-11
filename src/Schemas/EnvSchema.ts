import { z } from 'zod';

const EnvSchema = z
    .object({
        //PROD
        CORS_ORIGIN: z.string(),
        DATABASE_URL: z.string(),
        JWT_SECRET: z.string(),
        JWT_EXPIRATION: z.string().optional().default('30m'),
        //DEV
        NODE_ENV: z.enum(['development', 'test', 'production']).optional(),
        PORT: z
            .string()
            .optional()
            .transform((val) => Number(val)),
    })
    .refine((input) => {
        const requiredInDevelopment: string[] = ['PORT'];

        if (input.NODE_ENV === 'development') {
            for (const key of requiredInDevelopment) {
                const TypedInput: {
                    [key: string]: any;
                } = input;

                if (!TypedInput[key]) {
                    throw new Error(`In development mode you need to provide the ${key} var.`);
                }
            }
        }

        return true;
    });

export default EnvSchema;

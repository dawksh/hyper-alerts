import { config } from 'dotenv'
import { z } from 'zod'

config()

const envSchema = z.object({
    PORT: z.string().transform(Number),
    DATABASE_URL: z.string(),
    ENV: z.enum(['development', 'production']).default('development'),
    TELEGRAM_BOT_TOKEN: z.string(),
})

export const env = envSchema.parse(process.env)



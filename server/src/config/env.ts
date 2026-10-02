import 'dotenv/config';
import { z } from 'zod';

/**
 * Validated server configuration. Fails fast on boot if required secrets are
 * missing, rather than surfacing confusing errors on the first request.
 */
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(8080),
  ALLOWED_ORIGINS: z
    .string()
    .default('http://localhost:5173')
    .transform((value) =>
      value
        .split(',')
        .map((origin) => origin.trim().replace(/\/+$/, ''))
        .filter(Boolean),
    ),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required — see docs/BACKEND.md for the free Atlas setup steps.'),
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required — get a free key at https://aistudio.google.com/apikey'),
  GEMINI_TEXT_MODEL: z.string().default('gemini-2.5-flash'),
  GEMINI_EMBEDDING_MODEL: z.string().default('gemini-embedding-001'),
  GEMINI_LIVE_MODEL: z.string().default('gemini-live-2.5-flash-preview'),
  GEMINI_VOICE_NAME: z.string().default('Kore'),
  MAX_VOICE_SESSIONS: z.coerce.number().int().positive().default(4),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
   
  console.error('Invalid server configuration:\n' + parsed.error.issues.map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`).join('\n'));
  process.exit(1);
}

export const env = parsed.data;
export const isProduction = env.NODE_ENV === 'production';

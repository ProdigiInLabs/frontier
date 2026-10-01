import cors from 'cors';
import { env } from '../config/env.js';

const allowed = new Set(env.ALLOWED_ORIGINS);

export const corsMiddleware = cors({
  origin(origin, callback) {
    // No Origin header (curl, health checks, same-origin) — allow.
    if (!origin || allowed.has(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: false,
  methods: ['GET', 'POST', 'OPTIONS'],
});

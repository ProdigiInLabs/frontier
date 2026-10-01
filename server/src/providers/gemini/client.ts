import { GoogleGenAI } from '@google/genai';
import { env } from '../../config/env.js';

/**
 * Single Gemini client for the process. The API key lives only here, on the
 * server — it is never sent to or readable by the browser.
 */
export const gemini = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

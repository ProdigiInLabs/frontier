/** Sample spoken questions for demo mode (no microphone is used). */
export const sampleQuestions = [
  'What does Prodigi do?',
  'Can you help us add AI to our customer support?',
  'How does AI integration work?',
  'Where should a business start with AI?',
] as const;

export const MAX_TYPED_LENGTH = 200;
/** Recording auto-stops after this long (API mode). */
export const MAX_RECORDING_MS = 30_000;
/** Simulated listening time in demo mode. */
export const LISTEN_MS = 1500;

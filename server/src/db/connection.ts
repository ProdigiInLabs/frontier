import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { logger } from '../lib/logger.js';

mongoose.set('strictQuery', true);

export async function connectDatabase(): Promise<void> {
  mongoose.connection.on('error', (error) => logger.error({ err: error }, 'MongoDB connection error'));
  mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));

  await mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 8000,
    // A free Atlas M0 cluster has a hard 500-connection ceiling shared across
    // everything using it; keep this process's share modest.
    maxPoolSize: 10,
  });
  logger.info('MongoDB connected');
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}

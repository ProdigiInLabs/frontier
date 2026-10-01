import type { ErrorRequestHandler, RequestHandler } from 'express';
import { AppError } from '../lib/app-error.js';
import { logger } from '../lib/logger.js';

/**
 * Central error boundary: every route's errors end up here. The client only
 * ever receives {code, message} — never a stack trace or a provider's raw
 * error body (matches the "never show raw errors" rule the frontend follows).
 */
export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  const appError = AppError.fromUnknown(error);
  if (appError.status >= 500) logger.error({ err: appError.detail ?? appError, path: req.path }, appError.message);
  else logger.warn({ path: req.path, code: appError.code }, appError.message);
  res.status(appError.status).json({ code: appError.code, message: appError.message });
};

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({ code: 'bad_request', message: 'Not found.' });
};

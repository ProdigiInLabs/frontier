import { describe, expect, it } from 'vitest';
import { AppError } from '../lib/app-error.js';

describe('AppError.fromUnknown', () => {
  it('passes through an existing AppError unchanged', () => {
    const original = AppError.badRequest('nope');
    expect(AppError.fromUnknown(original)).toBe(original);
  });

  it.each([
    ['429 Too Many Requests', 'rate_limited', 429],
    ['RESOURCE_EXHAUSTED: quota', 'rate_limited', 429],
    ['deadline exceeded', 'timeout', 504],
    ['fetch failed', 'network', 502],
    ['ENOTFOUND api.example.com', 'network', 502],
    ['400 invalid argument', 'bad_request', 400],
    ['something exploded', 'unavailable', 503],
  ])('maps "%s" to %s / %d', (message, code, status) => {
    const mapped = AppError.fromUnknown(new Error(message));
    expect(mapped.code).toBe(code);
    expect(mapped.status).toBe(status);
  });

  it('never leaks the original message to .message (only to .detail)', () => {
    const secret = new Error('internal provider secret token xyz');
    const mapped = AppError.fromUnknown(secret);
    expect(mapped.message).not.toContain('secret token');
    expect(mapped.detail).toBe(secret);
  });
});

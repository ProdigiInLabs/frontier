import { describe, expect, it, vi } from 'vitest';

describe('logger', () => {
  it('loads without throwing when pino-pretty cannot be resolved', async () => {
    // Regression test: a production deploy crashed because pino's worker-thread
    // transport throws synchronously, at import time, if its target module
    // isn't installed — which happens whenever NODE_ENV isn't exactly
    // "production" in a devDependency-stripped image. See git history.
    vi.resetModules();
    vi.doMock('node:module', async (importOriginal) => {
      const nodeModule = await importOriginal();
      const actual = nodeModule as { createRequire: (url: string) => NodeJS.Require };
      return {
        ...actual,
        createRequire: (url: string) => {
          const req = actual.createRequire(url);
          const resolve = () => {
            throw new Error("Cannot find module 'pino-pretty'");
          };
          return Object.assign((id: string) => req(id), { resolve });
        },
      };
    });

    await expect(import('../lib/logger.js')).resolves.toBeDefined();
    vi.doUnmock('node:module');
    vi.resetModules();
  });

  it('is silent in test and exports a usable logger', async () => {
    const { logger } = await import('../lib/logger.js');
    expect(logger.level).toBe('silent');
    expect(() => logger.info('does not throw')).not.toThrow();
  });
});

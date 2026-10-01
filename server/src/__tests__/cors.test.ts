import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../db/connection.js', () => ({ connectDatabase: vi.fn(), disconnectDatabase: vi.fn() }));

const { createApp } = await import('../app.js');

describe('CORS', () => {
  const app = createApp();

  it('allows the configured origin', async () => {
    const res = await request(app).get('/healthz').set('Origin', 'http://localhost:5173');
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
  });

  it('does not reflect an unknown origin', async () => {
    const res = await request(app).get('/healthz').set('Origin', 'https://evil.example.com');
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('reports health without requiring Mongo to be mocked beyond connection state', async () => {
    const res = await request(app).get('/healthz');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

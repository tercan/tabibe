import { describe, expect, it } from 'vitest';
import { getHttpConnectionKind } from './urlSafety.js';

describe('getHttpConnectionKind', () => {
  it('distinguishes secure and public insecure URLs', () => {
    expect(getHttpConnectionKind('https://example.com')).toBe('secure-or-internal');
    expect(getHttpConnectionKind('http://example.com')).toBe('public-insecure');
  });

  it('recognizes local development URLs', () => {
    expect(getHttpConnectionKind('http://localhost:5173')).toBe('local');
    expect(getHttpConnectionKind('http://127.0.0.1')).toBe('local');
    expect(getHttpConnectionKind('http://[::1]')).toBe('local');
  });

  it('recognizes private network URLs', () => {
    expect(getHttpConnectionKind('http://192.168.1.20')).toBe('private');
    expect(getHttpConnectionKind('http://10.0.0.2')).toBe('private');
    expect(getHttpConnectionKind('http://router.local')).toBe('private');
  });
});

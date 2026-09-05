import { describe, expect, it } from 'vitest';
import { transformPreviewUrl } from '../../domain/noteEditor.js';

describe('note preview URL policy', () => {
  it('allows explicit web and email links', () => {
    expect(transformPreviewUrl('https://example.com')).toBe('https://example.com');
    expect(transformPreviewUrl('mailto:hello@example.com')).toBe('mailto:hello@example.com');
  });

  it('blocks scripts, data URLs, and extension-relative links', () => {
    expect(transformPreviewUrl('javascript:alert(1)')).toBe('');
    expect(transformPreviewUrl('data:text/html,test')).toBe('');
    expect(transformPreviewUrl('/settings')).toBe('');
  });
});

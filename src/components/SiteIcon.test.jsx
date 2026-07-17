import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createIconCatalog } from '../lib/iconCatalog.js';
import SiteIcon from './SiteIcon.jsx';

const catalog = createIconCatalog({
  version: '16.26.0',
  icons: [{ slug: 'google', title: 'Google', hex: '4285F4', aliases: [] }],
});

beforeEach(() => {
  vi.stubGlobal('chrome', {
    runtime: { id: 'test', getURL: (path) => `chrome-extension://test/${path}` },
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('SiteIcon', () => {
  it('shows a local brand mask without waiting for a network image', () => {
    const { container } = render(
      <SiteIcon
        site={{
          name: 'Google',
          url: 'https://google.com',
          icon: { preference: 'auto', slug: null },
        }}
        catalog={catalog}
        globalStyle="simple"
      />,
    );

    expect(container.querySelector('.site-icon')).toHaveAttribute('data-icon-source', 'brand');
    expect(container.querySelector('.site-icon-brand-mask')).toBeInTheDocument();
    expect(screen.queryByText('G')).not.toBeInTheDocument();
  });

  it('keeps the monogram visible until a favicon loads', () => {
    const { container } = render(
      <SiteIcon
        site={{
          name: 'Example',
          url: 'https://example.com',
          icon: { preference: 'favicon', slug: null },
        }}
        catalog={catalog}
        hasFaviconPermission
      />,
    );

    const icon = container.querySelector('.site-icon');
    expect(icon).toHaveAttribute('data-icon-source', 'monogram');
    expect(screen.getByText('E')).toBeInTheDocument();
    fireEvent.load(container.querySelector('img'));
    expect(icon).toHaveAttribute('data-icon-source', 'favicon');
    expect(screen.queryByText('E')).not.toBeInTheDocument();
  });

  it('keeps a loaded favicon visible after the fallback timeout', async () => {
    vi.useFakeTimers();
    const { container } = render(
      <SiteIcon
        site={{
          name: 'Example',
          url: 'https://example.com',
          icon: { preference: 'favicon', slug: null },
        }}
        catalog={catalog}
        hasFaviconPermission
      />,
    );

    const icon = container.querySelector('.site-icon');
    fireEvent.load(container.querySelector('img'));
    expect(icon).toHaveAttribute('data-icon-candidate', 'favicon');

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });

    expect(icon).toHaveAttribute('data-icon-source', 'favicon');
    expect(icon).toHaveAttribute('data-icon-candidate', 'favicon');
  });

  it('falls back to a monogram when the favicon fails', () => {
    const { container } = render(
      <SiteIcon
        site={{
          name: 'Example',
          url: 'https://example.com',
          icon: { preference: 'favicon', slug: null },
        }}
        catalog={catalog}
        hasFaviconPermission
      />,
    );

    fireEvent.error(container.querySelector('img'));
    expect(container.querySelector('.site-icon')).toHaveAttribute(
      'data-icon-candidate',
      'monogram',
    );
    expect(screen.getByText('E')).toBeInTheDocument();
  });

  it('advances after the favicon timeout', async () => {
    vi.useFakeTimers();
    const { container } = render(
      <SiteIcon
        site={{
          name: 'Example',
          url: 'https://example.com',
          icon: { preference: 'favicon', slug: null },
        }}
        catalog={catalog}
        hasFaviconPermission
      />,
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });
    expect(container.querySelector('.site-icon')).toHaveAttribute(
      'data-icon-candidate',
      'monogram',
    );
  });
});

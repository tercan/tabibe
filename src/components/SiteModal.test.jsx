import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import I18nProvider from './I18nProvider.jsx';
import { createIconCatalog } from '../lib/iconCatalog.js';
import SiteModal from './SiteModal.jsx';

const catalog = createIconCatalog({
  version: '16.26.0',
  icons: [
    { slug: 'google', title: 'Google', hex: '4285F4', aliases: [] },
    { slug: 'googledrive', title: 'Google Drive', hex: '4285F4', aliases: [] },
  ],
});

beforeEach(() => {
  vi.stubGlobal('chrome', {
    runtime: { id: 'test', getURL: (path) => `chrome-extension://test/${path}` },
  });
});

afterEach(() => vi.unstubAllGlobals());

describe('SiteModal icon selector', () => {
  it('saves a validated catalog selection in the new icon model', async () => {
    const onSave = vi.fn().mockResolvedValue(true);
    render(
      <I18nProvider>
        <SiteModal mode="site" icon_catalog={catalog} on_save={onSave} on_close={vi.fn()} />
      </I18nProvider>,
    );

    fireEvent.change(screen.getByLabelText('URL'), {
      target: { value: 'https://drive.google.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Brand' }));
    const search = screen.getByRole('combobox', { name: 'Search brands' });
    fireEvent.change(search, { target: { value: 'Drive' } });
    fireEvent.click(screen.getByRole('option', { name: 'Google Drive' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(onSave.mock.calls[0][0]).toMatchObject({
      url: 'https://drive.google.com/',
      icon: { preference: 'brand', slug: 'googledrive' },
    });
    expect(onSave.mock.calls[0][0]).not.toHaveProperty('icon_slug');
  });
});

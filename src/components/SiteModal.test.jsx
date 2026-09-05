import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
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

  it('requires an explicit duplicate decision and can update the existing record', async () => {
    const onSave = vi.fn().mockResolvedValue(true);
    render(
      <I18nProvider>
        <SiteModal
          mode="site"
          icon_catalog={catalog}
          existing_sites={[{ id: 'saved-site', name: 'Saved', url: 'https://example.com/' }]}
          on_save={onSave}
          on_close={vi.fn()}
        />
      </I18nProvider>,
    );

    fireEvent.change(screen.getByLabelText('URL'), {
      target: { value: 'https://example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSave).not.toHaveBeenCalled();
    expect(
      screen.getByText('Choose whether to update the existing site or add another copy.'),
    ).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Update existing site' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(onSave.mock.calls[0][0]).toMatchObject({
      id: 'saved-site',
      url: 'https://example.com/',
    });
  });

  it('distinguishes public, local, and private HTTP addresses', () => {
    render(
      <I18nProvider>
        <SiteModal mode="site" icon_catalog={catalog} on_save={vi.fn()} on_close={vi.fn()} />
      </I18nProvider>,
    );

    const urlInput = screen.getByLabelText('URL');
    fireEvent.change(urlInput, { target: { value: 'http://example.com' } });
    expect(screen.getByText(/public HTTP address does not encrypt traffic/i)).toBeVisible();

    fireEvent.change(urlInput, { target: { value: 'http://localhost:5173' } });
    expect(screen.getByText(/local development address/i)).toBeVisible();

    fireEvent.change(urlInput, { target: { value: 'http://192.168.1.20' } });
    expect(screen.getByText(/private network/i)).toBeVisible();
  });

  it('disables form actions while an asynchronous save is pending', async () => {
    let resolveSave;
    const onSave = vi.fn(
      () =>
        new Promise((resolvePromise) => {
          resolveSave = resolvePromise;
        }),
    );
    render(
      <I18nProvider>
        <SiteModal mode="site" icon_catalog={catalog} on_save={onSave} on_close={vi.fn()} />
      </I18nProvider>,
    );

    fireEvent.change(screen.getByLabelText('URL'), {
      target: { value: 'https://example.net' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByRole('button', { name: 'Saving...' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();

    await act(async () => resolveSave(true));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled());
  });
});

import { createPortal } from 'react-dom';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { useTranslation } from '../hooks/useTranslation.js';
import I18nProvider from './I18nProvider.jsx';

function LocaleProbe() {
  const { locale, setLocale } = useTranslation();

  return (
    <>
      <button type="button" onClick={() => setLocale('ar')}>
        Arabic
      </button>
      <output>{locale}</output>
      {createPortal(<div data-testid="portal-direction">Portal</div>, document.body)}
    </>
  );
}

afterEach(() => {
  cleanup();
  document.documentElement.lang = 'en';
  document.documentElement.dir = 'ltr';
});

describe('I18nProvider', () => {
  it('updates root language and direction for RTL locales and portal content', async () => {
    render(
      <I18nProvider>
        <LocaleProbe />
      </I18nProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Arabic' }));

    await waitFor(() => expect(document.documentElement.lang).toBe('ar'));
    expect(document.documentElement.dir).toBe('rtl');
    expect(screen.getByTestId('portal-direction')).toHaveStyle({ direction: 'rtl' });
  });
});

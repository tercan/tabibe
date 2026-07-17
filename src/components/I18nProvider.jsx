import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_LOCALE,
  I18nContext,
  LOCALE_MAP,
  detectLocale,
  resolveLocale,
} from '../i18n/translationContext.js';

function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(detectLocale);

  const setLocale = useCallback((nextLocale) => {
    setLocaleState(resolveLocale(nextLocale));
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
  }, [locale]);

  const value = useMemo(() => {
    const translations = LOCALE_MAP[locale] || LOCALE_MAP[DEFAULT_LOCALE];

    function t(key, params) {
      let result = translations[key] || LOCALE_MAP[DEFAULT_LOCALE][key] || key;

      if (params) {
        Object.entries(params).forEach(([parameterKey, parameterValue]) => {
          result = result.replace(`{${parameterKey}}`, parameterValue);
        });
      }

      return result;
    }

    return { locale, setLocale, t, translations };
  }, [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export default I18nProvider;

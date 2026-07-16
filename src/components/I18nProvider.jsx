import { useMemo } from 'react';
import {
  DEFAULT_LOCALE,
  I18nContext,
  LOCALE_MAP,
  detectLocale,
} from '../i18n/translationContext.js';

function I18nProvider({ children }) {
  const value = useMemo(() => {
    const locale = detectLocale();
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

    return { locale, t, translations };
  }, []);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export default I18nProvider;

import { createContext, useContext, useMemo } from 'react';
import en from '../locales/en.js';
import tr from '../locales/tr.js';
import zh from '../locales/zh.js';
import es from '../locales/es.js';
import hi from '../locales/hi.js';
import ar from '../locales/ar.js';
import pt from '../locales/pt.js';
import bn from '../locales/bn.js';
import ru from '../locales/ru.js';
import ja from '../locales/ja.js';

/**
 * Supported locales and their translation maps
 */

const LOCALE_MAP = {
  en,
  tr,
  zh,
  es,
  hi,
  ar,
  pt,
  bn,
  ru,
  ja,
};

const DEFAULT_LOCALE = 'en';

/**
 * Detect browser locale and resolve to a supported language
 */

function detect_locale() {
  const browser_lang = navigator.language || navigator.userLanguage || DEFAULT_LOCALE;
  const short_lang = browser_lang.split('-')[0].toLowerCase();

  if (LOCALE_MAP[short_lang]) {
    return short_lang;
  }

  return DEFAULT_LOCALE;
}

/**
 * Translation context
 */

const I18nContext = createContext(null);

/**
 * I18n provider component — wraps the app and provides translations
 */

function I18nProvider({ children }) {
  const value = useMemo(() => {
    const locale = detect_locale();
    const translations = LOCALE_MAP[locale] || LOCALE_MAP[DEFAULT_LOCALE];

    function t(key, params) {
      let result = translations[key] || LOCALE_MAP[DEFAULT_LOCALE][key] || key;

      if (params) {
        Object.entries(params).forEach(([param_key, param_value]) => {
          result = result.replace(`{${param_key}}`, param_value);
        });
      }

      return result;
    }

    return { locale, t, translations };
  }, []);

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

/**
 * Custom hook to access translations
 */

function useTranslation() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }

  return context;
}

export { I18nProvider, useTranslation };

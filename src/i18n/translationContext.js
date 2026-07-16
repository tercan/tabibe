import { createContext } from 'react';
import ar from '../locales/ar.js';
import bn from '../locales/bn.js';
import en from '../locales/en.js';
import es from '../locales/es.js';
import hi from '../locales/hi.js';
import ja from '../locales/ja.js';
import pt from '../locales/pt.js';
import ru from '../locales/ru.js';
import tr from '../locales/tr.js';
import zh from '../locales/zh.js';

const DEFAULT_LOCALE = 'en';
const LOCALE_MAP = { en, tr, zh, es, hi, ar, pt, bn, ru, ja };
const I18nContext = createContext(null);

function detectLocale() {
  const browserLanguage = navigator.language || navigator.userLanguage || DEFAULT_LOCALE;
  const shortLanguage = browserLanguage.split('-')[0].toLowerCase();
  return LOCALE_MAP[shortLanguage] ? shortLanguage : DEFAULT_LOCALE;
}

export { DEFAULT_LOCALE, I18nContext, LOCALE_MAP, detectLocale };

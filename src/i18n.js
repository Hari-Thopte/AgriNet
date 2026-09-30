import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import translations from './i18n/translations';
import extraTranslations from './i18n/extraTranslations';
import uiTranslations from './i18n/uiTranslations';

const resources = Object.fromEntries(
  Object.keys(translations).map((language) => [
    language,
    { translation: { ...translations[language], ...extraTranslations[language], ...(language === 'en' ? uiTranslations : {}) } },
  ]),
);

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    supportedLngs: Object.keys(resources),
    fallbackLng: 'en',
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'agrin_lang',
      caches: ['localStorage'],
    },
    interpolation: { escapeValue: false },
  });

export default i18n;

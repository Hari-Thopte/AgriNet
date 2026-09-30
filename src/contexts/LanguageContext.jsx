import { createContext, useContext, useState } from 'react';
import translations from '../i18n/translations';
import { LANGUAGES } from '../i18n/languages';

const LanguageContext = createContext(null);

export { LANGUAGES } from '../i18n/languages';

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('agrin_lang') || 'en');

  const switchLang = (code) => {
    setLang(code);
    localStorage.setItem('agrin_lang', code);
  };

  const t = (key) => {
    const str = translations[lang]?.[key] ?? translations['en']?.[key] ?? key;
    return str;
  };

  return (
    <LanguageContext.Provider value={{ lang, switchLang, t, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

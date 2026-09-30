import { useLanguage } from '../contexts/LanguageContext';

export function useTranslation() {
  const { t, lang, switchLang, languages } = useLanguage();
  return { t, lang, switchLang, languages };
}

import { usePreferences } from '../contexts/PreferencesContext';
import { useTranslation } from 'react-i18next';

export function useLocalize() {
  const { preferences } = usePreferences();
  const { t } = useTranslation();

  const localizeString = (str) => {
    if (str === undefined || str === null) return str;
    const formatter = new Intl.NumberFormat(preferences.language, { useGrouping: false });
    return String(str).replace(/\d/g, match => formatter.format(match));
  };

  return { t, localizeString };
}

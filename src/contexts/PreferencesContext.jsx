import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api';
import { LANGUAGE_CODES } from '../i18n/languages';

const PreferencesContext = createContext(null);
const STORAGE_KEY = 'agrin_preferences';
const TRANSLATION_CACHE_VERSION = 1;
const DEFAULT_LOCATION_LABELS = { en: 'India', hi: 'भारत', ta: 'இந்தியா', ml: 'ഇന്ത്യ', mr: 'भारत', te: 'భారతదేశం' };
const savedLanguage = localStorage.getItem('agrin_lang');
const initialLanguage = LANGUAGE_CODES.includes(savedLanguage) ? savedLanguage : 'en';

const defaults = {
  language: initialLanguage,
  theme: 'light',
  highContrast: false,
  largeText: false,
  voiceMode: false,
  batterySaver: false,
  temperatureUnit: 'celsius',
  refreshMinutes: 15,
  weatherAlerts: true,
  marketAlerts: true,
  location: {
    latitude: 20.5937,
    longitude: 78.9629,
    label: DEFAULT_LOCATION_LABELS[initialLanguage] || 'India',
    source: 'default',
  },
};

function readPreferences() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const merged = {
      ...defaults,
      ...saved,
      location: { ...defaults.location, ...saved?.location },
    };
    if (!LANGUAGE_CODES.includes(merged.language)) merged.language = 'en';
    if (merged.location.source === 'default') {
      merged.location.label = DEFAULT_LOCATION_LABELS[merged.language] || 'India';
    }
    return merged;
  } catch {
    return defaults;
  }
}

export function PreferencesProvider({ children }) {
  const { i18n } = useTranslation();
  const [preferences, setPreferences] = useState(readPreferences);
  const [locationStatus, setLocationStatus] = useState('idle');
  const [locationError, setLocationError] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    localStorage.setItem('agrin_lang', preferences.language);
    document.documentElement.dataset.theme = preferences.theme;
    document.documentElement.dataset.highContrast = preferences.highContrast;
    document.documentElement.dataset.largeText = preferences.largeText;
    document.documentElement.dataset.batterySaver = preferences.batterySaver;
    document.documentElement.lang = preferences.language;
    document.body.lang = preferences.language;
    document.documentElement.style.colorScheme = preferences.theme;
    if (i18n.resolvedLanguage !== preferences.language) i18n.changeLanguage(preferences.language);
  }, [preferences, i18n]);

  useEffect(() => {
    const language = preferences.language;
    if (language === 'en') return undefined;
    let cancelled = false;

    const hydrateMissingTranslations = async () => {
      const cacheKey = `agrin_gemini_translations_v${TRANSLATION_CACHE_VERSION}_${language}`;
      let cached = {};
      try { cached = JSON.parse(localStorage.getItem(cacheKey)) || {}; } catch { cached = {}; }
      if (Object.keys(cached).length) i18n.addResources(language, 'translation', cached);

      const english = i18n.getResourceBundle('en', 'translation') || {};
      const localized = i18n.getResourceBundle(language, 'translation') || {};
      const missingEntries = Object.entries(english).filter(([key, value]) => (
        typeof value === 'string' && localized[key] === undefined && cached[key] === undefined
      ));

      const generated = { ...cached };
      for (let index = 0; index < missingEntries.length && !cancelled; index += 60) {
        const chunk = Object.fromEntries(missingEntries.slice(index, index + 60));
        try {
          const result = await api.translate(language, chunk);
          Object.assign(generated, result.translations || {});
          i18n.addResources(language, 'translation', result.translations || {});
          localStorage.setItem(cacheKey, JSON.stringify(generated));
          if (i18n.resolvedLanguage === language) i18n.emit('languageChanged', language);
        } catch {
          // Existing hand-written translations and English fallback remain available offline.
          break;
        }
      }
    };

    hydrateMissingTranslations();
    return () => { cancelled = true; };
  }, [preferences.language, i18n]);

  const updatePreferences = useCallback((changes) => {
    setPreferences((current) => ({ ...current, ...changes }));
  }, []);

  const setLanguage = useCallback((language) => {
    const currentLocation = preferences.location;
    setPreferences((current) => ({
      ...current,
      language,
      location: current.location.source === 'default'
        ? { ...current.location, label: DEFAULT_LOCATION_LABELS[language] || 'India' }
        : current.location,
    }));
    i18n.changeLanguage(language);

    if (currentLocation.source === 'gps') {
      api.reverseLocation(currentLocation.latitude, currentLocation.longitude, language)
        .then((place) => setPreferences((latest) => ({
          ...latest,
          location: latest.language === language
            ? { ...latest.location, label: place.label || latest.location.label }
            : latest.location,
        })))
        .catch(() => {});
    }
  }, [i18n, preferences.location]);

  const setLocation = useCallback((location) => {
    setPreferences((current) => ({
      ...current,
      location: { ...current.location, ...location },
    }));
    setLocationError('');
    setLocationStatus('ready');
  }, []);

  const requestLocation = useCallback(() => new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      const error = new Error('locationUnsupported');
      setLocationStatus('error');
      setLocationError(error.message);
      reject(error);
      return;
    }

    setLocationStatus('locating');
    setLocationError('');
    navigator.geolocation.getCurrentPosition(async (position) => {
      const latitude = Number(position.coords.latitude.toFixed(5));
      const longitude = Number(position.coords.longitude.toFixed(5));
      let label = `${latitude.toFixed(3)}°, ${longitude.toFixed(3)}°`;

      try {
        const place = await api.reverseLocation(latitude, longitude, preferences.language);
        label = place.label || label;
      } catch {
        // Coordinates remain usable when reverse geocoding is unavailable.
      }

      const location = { latitude, longitude, label, source: 'gps' };
      setLocation(location);
      resolve(location);
    }, (geoError) => {
      const key = geoError.code === 1 ? 'locationDenied' : geoError.code === 3 ? 'locationTimedOut' : 'locationUnavailable';
      setLocationStatus('error');
      setLocationError(key);
      reject(new Error(key));
    }, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 300000,
    });
  }), [preferences.language, setLocation]);

  const value = useMemo(() => ({
    preferences,
    updatePreferences,
    setLanguage,
    setLocation,
    requestLocation,
    locationStatus,
    locationError,
  }), [preferences, updatePreferences, setLanguage, setLocation, requestLocation, locationStatus, locationError]);

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) throw new Error('usePreferences must be used inside PreferencesProvider');
  return context;
}

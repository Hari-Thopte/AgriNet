export const LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English', locale: 'en-IN' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी', locale: 'hi-IN' },
  { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी', locale: 'mr-IN' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்', locale: 'ta-IN' },
  { code: 'kn', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ', locale: 'kn-IN' },
  { code: 'ml', label: 'Malayalam', nativeLabel: 'മലയാളം', locale: 'ml-IN' },
  { code: 'bh', label: 'Bhojpuri', nativeLabel: 'भोजपुरी', locale: 'hi-IN' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు', locale: 'te-IN' },
  { code: 'bn', label: 'Bengali', nativeLabel: 'বাংলা', locale: 'bn-IN' },
  { code: 'pa', label: 'Punjabi', nativeLabel: 'ਪੰਜਾਬੀ', locale: 'pa-IN' },
  { code: 'or', label: 'Odia', nativeLabel: 'ଓଡ଼ିଆ', locale: 'or-IN' },
  { code: 'as', label: 'Assamese', nativeLabel: 'অসমীয়া', locale: 'as-IN' },
  { code: 'gu', label: 'Gujarati', nativeLabel: 'ગુજરાતી', locale: 'gu-IN' },
];

export const LANGUAGE_CODES = LANGUAGES.map(({ code }) => code);

export function getSpeechLocale(code) {
  return LANGUAGES.find((language) => language.code === code)?.locale || 'en-IN';
}

const LANGUAGE_SCRIPT = {
  hi: /[\u0900-\u097f]/u, mr: /[\u0900-\u097f]/u, bh: /[\u0900-\u097f]/u,
  bn: /[\u0980-\u09ff]/u, as: /[\u0980-\u09ff]/u, pa: /[\u0a00-\u0a7f]/u,
  gu: /[\u0a80-\u0aff]/u, or: /[\u0b00-\u0b7f]/u, ta: /[\u0b80-\u0bff]/u,
  te: /[\u0c00-\u0c7f]/u, kn: /[\u0c80-\u0cff]/u, ml: /[\u0d00-\u0d7f]/u,
};

export function textMatchesLanguage(text, code) {
  return code === 'en' ? /[A-Za-z]/.test(text) : Boolean(LANGUAGE_SCRIPT[code]?.test(text));
}

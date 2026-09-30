import { useEffect } from 'react';
import { usePreferences } from '../contexts/PreferencesContext';
import { api } from '../api';
import translations from '../i18n/translations';

const CACHE_VERSION = 1;
const textOriginals = new WeakMap();
const textApplied = new WeakMap();
const attributeOriginals = new WeakMap();
const attributeApplied = new WeakMap();

// Build fast in-memory dictionary lookup for instant 0ms translation from translations.js
const LOCAL_MAPS = {};
for (const lang of Object.keys(translations)) {
  if (lang === 'en') continue;
  LOCAL_MAPS[lang] = new Map();
  const enDict = translations.en || {};
  const targetDict = translations[lang] || {};
  for (const [key, enVal] of Object.entries(enDict)) {
    if (typeof enVal === 'string' && targetDict[key]) {
      const cleanEn = enVal.trim();
      LOCAL_MAPS[lang].set(cleanEn, targetDict[key]);
      LOCAL_MAPS[lang].set(cleanEn.toLowerCase(), targetDict[key]);
    }
  }
}

const DIGITS = {
  en: '0123456789',
  hi: '०१२३४५६७८९', mr: '०१२३४५६७८९', bh: '०१२३४५६७८९',
  bn: '০১২৩৪৫৬৭৮৯', as: '০১২৩৪৫৬৭৮৯',
  pa: '੦੧੨੩੪੫੬੭੮੯', or: '୦୧୨୩୪୫୬୭୮୯', gu: '૦૧૨૩૪୫<ctrl42>૭૮૯',
  ta: '௦௧௨௩௪௫௬௭௮௯', te: '౦౧౨౩౪౫౬౭౮౯',
  kn: '೦೧೨೩೪೫೬೭೮೯', ml: '൦൧൨൩൪<ctrl42>൬൭൮൯',
};

const TARGET_SCRIPT = {
  hi: /[\u0900-\u097f]/u, mr: /[\u0900-\u097f]/u, bh: /[\u0900-\u097f]/u,
  bn: /[\u0980-\u09ff]/u, as: /[\u0980-\u09ff]/u,
  pa: /[\u0a00-\u0a7f]/u, gu: /[\u0a80-\u0aff]/u,
  or: /[\u0b00-\u0b7f]/u, ta: /[\u0b80-\u0bff]/u,
  te: /[\u0c00-\u0c7f]/u, kn: /[\u0c80-\u0cff]/u,
  ml: /[\u0d00-\u0d7f]/u,
};

const ATTRIBUTES = ['placeholder', 'title', 'aria-label', 'alt'];
const SKIP_SELECTOR = 'script,style,code,pre,textarea,option,[data-no-auto-translate],.chat-bubble-user';

function localizeDigits(value, language) {
  const digits = DIGITS[language] || DIGITS.en;
  return String(value).replace(/[0-9]/g, (digit) => digits[Number(digit)]);
}

function restoreAsciiDigits(value) {
  let result = String(value);
  Object.values(DIGITS).forEach((digits) => {
    [...digits].forEach((digit, index) => { result = result.replaceAll(digit, String(index)); });
  });
  return result;
}

function splitWhitespace(value) {
  const match = String(value).match(/^(\s*)(.*?)(\s*)$/s);
  return { before: match?.[1] || '', core: match?.[2] || '', after: match?.[3] || '' };
}

function shouldTranslate(value, language) {
  const core = String(value).trim();
  if (!core || !/[A-Za-z]/.test(core)) return false;
  if (/^(https?:\/\/|www\.|[^\s@]+@[^\s@]+\.[^\s@]+$)/i.test(core)) return false;
  return !(TARGET_SCRIPT[language]?.test(core));
}

function canTouch(element) {
  return element && !element.closest(SKIP_SELECTOR);
}

export default function GlobalPageTranslator() {
  const { preferences } = usePreferences();
  const language = preferences.language;

  useEffect(() => {
    let cancelled = false;
    let processing = false;
    let timer;
    const queued = new Map();
    const cacheKey = `agrin_page_translations_v${CACHE_VERSION}_${language}`;
    let cache = {};
    try { cache = JSON.parse(localStorage.getItem(cacheKey)) || {}; } catch { cache = {}; }

    const applyText = (node, translated) => {
      const original = textOriginals.get(node);
      if (original === undefined || !node.isConnected) return;
      const { before, after } = splitWhitespace(original);
      const next = `${before}${localizeDigits(translated, language)}${after}`;
      textApplied.set(node, { value: next, language });
      node.nodeValue = next;
    };

    const applyAttribute = (element, attribute, translated) => {
      if (!element.isConnected) return;
      const next = localizeDigits(translated, language);
      const applied = attributeApplied.get(element) || {};
      applied[attribute] = { value: next, language };
      attributeApplied.set(element, applied);
      element.setAttribute(attribute, next);
    };

    const queueTarget = (source, target) => {
      const normalized = restoreAsciiDigits(source.trim());
      if (!normalized) return;

      // 1. Instant local translations.js dictionary lookup
      const langMap = LOCAL_MAPS[language];
      if (langMap) {
        const localMatch = langMap.get(normalized) || langMap.get(normalized.toLowerCase());
        if (localMatch) {
          target.apply(localMatch);
          return;
        }
      }

      // 2. LocalStorage cache lookup
      if (cache[normalized]) {
        target.apply(cache[normalized]);
        return;
      }

      // 3. Queue for dynamic API translation
      const targets = queued.get(normalized) || [];
      targets.push(target);
      queued.set(normalized, targets);
    };

    const flush = async () => {
      if (processing || cancelled || !queued.size || language === 'en') return;
      processing = true;
      const entries = [...queued.entries()].slice(0, 60);
      entries.forEach(([source]) => queued.delete(source));
      const strings = Object.fromEntries(entries.map(([source], index) => [`s${index}`, source]));
      try {
        const result = await api.translate(language, strings);
        entries.forEach(([source, targets], index) => {
          const translated = result.translations?.[`s${index}`] || source;
          cache[source] = translated;
          targets.forEach((target) => target.apply(translated));
        });
        localStorage.setItem(cacheKey, JSON.stringify(cache));
      } catch {
        // Fallback gracefully when API is unreachable
      } finally {
        processing = false;
        if (queued.size && !cancelled) timer = setTimeout(flush, 120);
      }
    };

    const schedule = () => {
      clearTimeout(timer);
      timer = setTimeout(flush, 80);
    };

    const processTextNode = (node) => {
      if (!canTouch(node.parentElement)) return;
      const current = node.nodeValue || '';
      const applied = textApplied.get(node);
      if (current === applied?.value && language === applied.language) return;
      if (!applied || current !== applied.value) textOriginals.set(node, current);
      const original = textOriginals.get(node) ?? current;
      const { core } = splitWhitespace(original);
      if (language === 'en') {
        const restored = localizeDigits(core, 'en');
        applyText(node, restored);
      } else if (shouldTranslate(core, language)) {
        queueTarget(core, { apply: (translated) => applyText(node, translated) });
      } else if (/\d/.test(core)) {
        applyText(node, core);
      }
    };

    const processElement = (element) => {
      if (!canTouch(element)) return;
      ATTRIBUTES.forEach((attribute) => {
        if (!element.hasAttribute(attribute)) return;
        const current = element.getAttribute(attribute) || '';
        const previous = attributeApplied.get(element)?.[attribute];
        if (current === previous?.value && language === previous.language) return;
        const originals = attributeOriginals.get(element) || {};
        if (!previous || current !== previous.value) originals[attribute] = current;
        attributeOriginals.set(element, originals);
        const original = originals[attribute] ?? current;
        if (language === 'en') applyAttribute(element, attribute, restoreAsciiDigits(original));
        else if (shouldTranslate(original, language)) {
          queueTarget(original, { apply: (translated) => applyAttribute(element, attribute, translated) });
        } else if (/\d/.test(original)) applyAttribute(element, attribute, original);
      });
    };

    const scan = (root) => {
      if (root.nodeType === Node.TEXT_NODE) processTextNode(root);
      if (root.nodeType === Node.ELEMENT_NODE) {
        processElement(root);
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
        let node = walker.nextNode();
        while (node) {
          if (node.nodeType === Node.TEXT_NODE) processTextNode(node);
          else processElement(node);
          node = walker.nextNode();
        }
      }
      schedule();
    };

    scan(document.body);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'characterData') processTextNode(mutation.target);
        else if (mutation.type === 'attributes') processElement(mutation.target);
        else if (mutation.type === 'childList') mutation.addedNodes.forEach(scan);
      });
    });

    observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRIBUTES });

    return () => {
      cancelled = true;
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [language]);

  return null;
}

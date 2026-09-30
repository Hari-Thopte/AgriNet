import { useCallback, useEffect, useRef, useState } from 'react';
import { usePreferences } from '../contexts/PreferencesContext';
import { getSpeechLocale, textMatchesLanguage } from '../i18n/languages';
import { api } from '../api';

export function stripSpeechMarkup(text = '') {
  return String(text).replace(/\*\*/g, '').replace(/\p{Extended_Pictographic}|\uFE0F/gu, '').trim();
}

export function useVoice() {
  const { preferences } = usePreferences();
  const [listening, setListening]   = useState(false);
  const [speaking, setSpeaking]     = useState(false);
  const [error, setError]           = useState('');
  const recognitionRef              = useRef(null);
  const audioRef                    = useRef(null);
  const language = getSpeechLocale(preferences.language);

  const Recognition = typeof window !== 'undefined'
    && (window.SpeechRecognition || window.webkitSpeechRecognition);

  const canListen = Boolean(Recognition);
  const canSpeak  = typeof window !== 'undefined' && 'speechSynthesis' in window;

  /* ── stop everything ─────────────────────────────────────────── */
  const stop = useCallback(() => {
    try { recognitionRef.current?.abort(); } catch (_) {}
    audioRef.current?.pause();
    audioRef.current = null;
    window.speechSynthesis?.cancel();
    setListening(false);
    setSpeaking(false);
  }, []);

  /* ── TTS ─────────────────────────────────────────────────────── */
  const speak = useCallback(async (text) => {
    if (!text) return;
    stop();
    const cleanText = stripSpeechMarkup(text);

    try {
      setSpeaking(true);
      const { audio, mime_type: mimeType } = await api.speech(preferences.language, cleanText);
      const player = new Audio(`data:${mimeType || 'audio/wav'};base64,${audio}`);
      audioRef.current = player;
      player.onended = () => { audioRef.current = null; setSpeaking(false); };
      player.onerror = () => { audioRef.current = null; setSpeaking(false); };
      await player.play();
      return;
    } catch {
      setSpeaking(false);
    }

    // Never let the browser read untranslated English with a regional accent.
    if (!textMatchesLanguage(cleanText, preferences.language)) {
      setError('voiceTryAgain');
      return;
    }
    if (!canSpeak) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang    = language;
    const voices = window.speechSynthesis.getVoices();
    utterance.voice = voices.find((voice) => voice.lang.toLowerCase() === language.toLowerCase())
      || voices.find((voice) => voice.lang.toLowerCase().startsWith(language.slice(0, 2).toLowerCase()))
      || null;
    utterance.rate    = 0.92;
    utterance.pitch   = 1;
    utterance.onstart  = () => setSpeaking(true);
    utterance.onend    = () => setSpeaking(false);
    utterance.onerror  = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [canSpeak, language, preferences.language, stop]);

  /* ── STT ─────────────────────────────────────────────────────── */
  const listen = useCallback((onResult) => {
    if (!Recognition) {
      setError('voiceUnsupported');
      return;
    }

    // First request mic permission explicitly so the browser doesn't silently fail
    navigator.mediaDevices?.getUserMedia({ audio: true })
      .then((stream) => {
        // stop the stream immediately — we only needed permission
        stream.getTracks().forEach((t) => t.stop());
        startRecognition(onResult);
      })
      .catch((permErr) => {
        console.warn('[useVoice] mic permission denied:', permErr);
        setError('voicePermissionDenied');
      });
  }, [Recognition, language, stop]); // eslint-disable-line react-hooks/exhaustive-deps

  const startRecognition = useCallback((onResult) => {
    stop();
    setError('');

    const recognition = new Recognition();
    recognition.lang              = language;
    recognition.interimResults    = false;
    recognition.continuous        = false;
    recognition.maxAlternatives   = 1;

    recognition.onstart  = () => setListening(true);
    recognition.onend    = () => setListening(false);

    recognition.onerror = (event) => {
      setListening(false);
      const reason = event.error || '';
      console.warn('[useVoice] recognition error:', reason);

      if (reason === 'not-allowed' || reason === 'service-not-allowed') {
        setError('voicePermissionDenied');
      } else if (reason === 'no-speech') {
        setError('voiceNoSpeech');
      } else if (reason === 'network') {
        setError('voiceNetworkError');
      } else if (reason === 'aborted') {
        // user or code aborted — no error to show
        setError('');
      } else {
        setError('voiceTryAgain');
      }
    };

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim();
      if (transcript) onResult(transcript);
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (e) {
      console.warn('[useVoice] start error:', e);
      setListening(false);
      setError('voiceTryAgain');
    }
  }, [Recognition, language, stop]);

  useEffect(() => stop, [stop]);

  return { listen, speak, stop, listening, speaking, error, canListen, canSpeak };
}

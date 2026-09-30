import { useState, useRef } from 'react';
import { Bot, Send, Sparkles, RotateCcw, ChevronRight, Mic, Speaker, Volume2, VolumeX, WifiOff } from 'lucide-react';
import { api } from '../api';
import { useTranslation } from 'react-i18next';
import { useVoice } from '../hooks/useVoice';
import { useConnectivity } from '../hooks/useConnectivity';
import TapToListen from '../components/TapToListen';

const QUICK_PROMPTS = [
  'promptHarvest', 'promptYellow', 'promptWater', 'promptFertilizer', 'promptPrices', 'promptRust',
];

const INITIAL_MESSAGE = {
  id: 0, role: 'bot',
  textKey: 'botWelcome',
};

const PROMPT_INTENTS = { promptHarvest: 'harvest', promptYellow: 'yellow', promptWater: 'water', promptFertilizer: 'fertilizer', promptPrices: 'price', promptRust: 'rust', promptWeather: 'weather' };

function formatMessage(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');
}

function TypingBubble() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#10b981,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Bot size={16} color="#fff" />
      </div>
      <div className="chat-bubble-bot" style={{ display: 'flex', gap: 5, alignItems: 'center', padding: '0.75rem 1rem' }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
        ))}
      </div>
    </div>
  );
}

export default function AgroBot() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [suggestions, setSuggestions] = useState(QUICK_PROMPTS);
  const [input, setInput]       = useState(() => {
    const pending = sessionStorage.getItem('agrin_voice_prompt') || '';
    sessionStorage.removeItem('agrin_voice_prompt');
    return pending;
  });
  const [typing, setTyping]     = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const bottomRef               = useRef(null);
  const nextMessageId           = useRef(1);
  const { listen, speak, listening, speaking, error: voiceError, canListen } = useVoice();
  const { online, constrained } = useConnectivity();

  const scrollBottom = () => setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

  const sendMessage = async (text, intent = null, fromVoice = false) => {
    const msg = (text || input).trim();
    if (!msg || typing) return;
    setInput('');

    const userMsg = { id: nextMessageId.current++, role: 'user', text: msg };
    setMessages(m => [...m, userMsg]);
    setTyping(true);
    scrollBottom();

    try {
      const history = messages.slice(-6).map(m => ({ role: m.role, text: m.text }));
      const { reply_key, values, suggestion_keys } = await api.chat(msg, history, intent);
      const responseText = t(reply_key, values);
      setMessages(m => [...m, { id: nextMessageId.current++, role: 'bot', textKey: reply_key, values }]);
      if (suggestion_keys?.length) setSuggestions(suggestion_keys);
      if (autoSpeak || fromVoice) speak(responseText);
    } catch {
      const intentKey = intent && PROMPT_INTENTS[intent] ? PROMPT_INTENTS[intent] : intent;
      const offlineKey = Object.entries(PROMPT_INTENTS).find(([, value]) => value === intentKey)?.[0];
      const replyKey = offlineKey ? `bot${offlineKey.replace('prompt', '')}Reply` : 'botUnavailable';
      setMessages(m => [...m, { id: nextMessageId.current++, role: 'bot', textKey: replyKey, offline: true }]);
      if (fromVoice && replyKey !== 'botUnavailable') speak(t(replyKey));
    } finally {
      setTyping(false);
      scrollBottom();
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '100%', height: 'calc(100vh - 6rem)' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={28} color="var(--primary)" /> {t('agrobotTitle')}
          </h1>
          <p className="text-muted">{t('agrobotSubtitle')}</p>
        </div>
        <button className="btn-ghost" onClick={() => { setMessages([INITIAL_MESSAGE]); setSuggestions(QUICK_PROMPTS); }} style={{ gap: '0.4rem' }}>
          <RotateCcw size={16} /> {t('newChat')}
        </button>
      </header>

      <div className="voice-bot-bar" style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: '1rem', padding: '1rem 1.2rem', borderRadius: 16, background: constrained ? '#fff7ed' : '#ecfdf5', border: `1px solid ${constrained ? '#fed7aa' : '#a7f3d0'}` }}>
        <div>
          <strong style={{ display: 'flex', alignItems: 'center', gap: '.45rem', color: constrained ? '#9a3412' : '#065f46' }}>{constrained ? <WifiOff size={18} /> : <Mic size={18} />} {t(constrained ? 'offlineAnswer' : 'voiceFirstHelp')}</strong>
          <small style={{ display: 'block', marginTop: '.25rem', color: 'var(--text-muted)' }}>{!online ? t('offlineReady') : t('basedOnLocation', { location: 'your farm' })}</small>
        </div>
        <div style={{ display: 'flex', gap: '.55rem' }}>
          <button className={`voice-round ${listening ? 'listening' : ''}`} disabled={!canListen || typing} onClick={() => listen((transcript) => sendMessage(transcript, null, true))} style={{ width: 54, height: 54, border: 0, borderRadius: '50%', background: '#10b981', color: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center', animation: listening ? 'pulse 1s infinite' : 'none' }} aria-label={t('askByVoice')}><Mic size={24} /></button>
          <button onClick={() => setAutoSpeak((value) => !value)} style={{ width: 44, height: 44, alignSelf: 'center', border: '1px solid var(--glass-border)', borderRadius: '50%', background: 'var(--control-bg)', color: 'var(--text-muted)', cursor: 'pointer', display: 'grid', placeItems: 'center' }} aria-label={t('readAloud')}>{autoSpeak ? <Volume2 size={20} /> : <VolumeX size={20} />}</button>
        </div>
        {(voiceError || speaking) && <small style={{ gridColumn: '1 / -1', color: voiceError ? 'var(--danger)' : 'var(--primary)' }}>{voiceError ? t(voiceError) : t('readAloud')}</small>}
      </div>

      {/* Quick prompts */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {suggestions.map(promptKey => (
          <button key={promptKey} onClick={() => sendMessage(t(promptKey), PROMPT_INTENTS[promptKey])} style={{ padding: '0.4rem 0.9rem', borderRadius: '20px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.82rem', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <ChevronRight size={13} color="var(--primary)" /> {t(promptKey)}
          </button>
        ))}
      </div>

      {/* Chat window */}
      <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {messages.map(msg => (
            <div key={msg.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
              {msg.role === 'bot' && (
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#10b981,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bot size={16} color="#fff" />
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '.35rem', maxWidth: '80%', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-bot'} style={{ minWidth: 0 }} dangerouslySetInnerHTML={{ __html: formatMessage(msg.textKey ? t(msg.textKey, msg.values) : msg.text) }} />
                {msg.role === 'bot' && <TapToListen text={msg.textKey ? t(msg.textKey, msg.values) : msg.text} />}
              </div>
            </div>
          ))}
          {typing && <TypingBubble />}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
          <textarea
            className="input-glass"
            rows={2}
            placeholder={t('askAgrobot')}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            style={{ resize: 'none', lineHeight: 1.5 }}
          />
          <button onClick={() => listen((transcript) => setInput(transcript))} disabled={!canListen || typing} aria-label={t('askByVoice')} style={{ padding: '.75rem', border: '1px solid var(--glass-border)', borderRadius: 10, background: listening ? 'var(--hover-bg)' : 'var(--control-bg)', color: 'var(--primary)', cursor: 'pointer' }}><Mic size={18} /></button>
          <button className="btn-primary" onClick={() => sendMessage()} disabled={!input.trim() || typing} style={{ padding: '0.75rem', borderRadius: 10, opacity: (!input.trim() || typing) ? 0.5 : 1 }}>
            <Send size={18} />
          </button>
        </div>
      </div>

      <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        {t('agrobotDisclaimer')}
      </p>
    </div>
  );
}

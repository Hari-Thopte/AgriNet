import { Volume2, Square } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useVoice } from '../hooks/useVoice';

export default function TapToListen({ text }) {
  const { t } = useTranslation();
  const { speak, stop, speaking: isPlaying } = useVoice();

  const toggleListen = () => {
    if (isPlaying) {
      stop();
    } else {
      speak(text);
    }
  };

  return (
    <button
      onClick={toggleListen}
      className="btn-ghost"
      style={{
        padding: '0.4rem 0.8rem',
        background: isPlaying ? 'var(--primary)' : 'rgba(32, 201, 107, 0.1)',
        color: isPlaying ? '#fff' : 'var(--primary)',
        borderRadius: '20px',
        fontSize: '0.8rem',
        fontWeight: 'bold',
      }}
      aria-label={t('tapToListen', 'Tap to listen')}
    >
      {isPlaying ? <Square size={16} fill="currentColor" /> : <Volume2 size={16} />}
      {isPlaying ? t('stop', 'Stop') : t('listen', 'Listen')}
    </button>
  );
}

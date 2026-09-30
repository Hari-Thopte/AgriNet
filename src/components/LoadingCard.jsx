import { RefreshCw, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const SKELETON_WIDTHS = ['60%', '91%', '78%', '86%', '73%', '94%'];

/** Full-panel loading skeleton */
export function LoadingCard({ rows = 4, height = '180px' }) {
  return (
    <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', minHeight: height }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="animate-pulse" style={{
          height: i === 0 ? 24 : 16,
          width: SKELETON_WIDTHS[i % SKELETON_WIDTHS.length],
          background: 'rgba(255,255,255,0.07)',
          borderRadius: 6,
        }} />
      ))}
    </div>
  );
}

/** Inline loading spinner */
export function Spinner({ size = 20, color = 'var(--primary)' }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
      <RefreshCw size={size} color={color} style={{ animation: 'spin 1s linear infinite' }} />
    </div>
  );
}

/** Error state with retry */
export function ErrorState({ message, onRetry }) {
  const { t } = useTranslation();

  return (
    <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <AlertCircle size={36} color="var(--danger)" style={{ opacity: 0.7 }} />
      <div>
        <div style={{ fontWeight: 600, marginBottom: '0.3rem' }}>{t('backendConnectionError')}</div>
        <div className="text-muted" style={{ fontSize: '0.85rem' }}>{message || t('backendConnectionHelp')}</div>
      </div>
      {onRetry && (
        <button className="btn-ghost" onClick={onRetry} style={{ gap: '0.4rem' }}>
          <RefreshCw size={15} /> {t('retry')}
        </button>
      )}
    </div>
  );
}

/** Grid of skeleton loading cards */
export function LoadingGrid({ count = 3, cols = 3 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '1rem' }}>
      {Array.from({ length: count }).map((_, i) => (
        <LoadingCard key={i} rows={3} height="120px" />
      ))}
    </div>
  );
}

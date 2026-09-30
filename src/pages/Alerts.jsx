import { useState } from 'react';
import { Bell, BellOff, Filter, CheckCheck, AlertTriangle, CloudRain, TrendingUp, Droplets, Bug, X, ChevronRight, RefreshCw } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { api } from '../api';
import { LoadingCard, ErrorState } from '../components/LoadingCard';
import { useTranslation } from 'react-i18next';
import { usePreferences } from '../contexts/PreferencesContext';

const TYPE_CFG = {
  disease:    { color: 'var(--danger)',    bg: 'rgba(239,68,68,0.1)',   icon: <Bug       size={16} />, labelKey: 'disease'    },
  weather:    { color: 'var(--secondary)', bg: 'rgba(59,130,246,0.1)', icon: <CloudRain size={16} />, labelKey: 'weatherAlert'    },
  market:     { color: 'var(--primary)',   bg: 'rgba(16,185,129,0.1)', icon: <TrendingUp size={16} />, labelKey: 'market'    },
  irrigation: { color: 'var(--secondary)', bg: 'rgba(59,130,246,0.1)', icon: <Droplets  size={16} />, labelKey: 'irrigation' },
};

const SEVERITY_COLOR = { high: 'var(--danger)', medium: 'var(--accent)', low: 'var(--secondary)' };
const FILTERS        = ['all', 'disease', 'weather', 'market', 'irrigation'];

const DEFAULT_ALERTS = [
  {
    id: 1,
    type: 'weather',
    severity: 'high',
    read: false,
    icon: '🌧️',
    title_key: 'alertRainTitle',
    message_key: 'alertRainMessage',
    action_key: 'alertRainAction',
    values: { rain: 80, day: 2 },
    timestamp: new Date().toISOString()
  },
  {
    id: 2,
    type: 'irrigation',
    severity: 'low',
    read: false,
    icon: '💧',
    title_key: 'alertMoistureTitle',
    message_key: 'alertMoistureMessage',
    action_key: 'alertMoistureAction',
    values: { moisture: 35, rain: 20 },
    timestamp: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 3,
    type: 'weather',
    severity: 'medium',
    read: false,
    icon: '☀️',
    title_key: 'alertHeatTitle',
    message_key: 'alertHeatMessage',
    action_key: 'alertHeatAction',
    values: { temperature: 38, unit: '°C', uv: 8 },
    timestamp: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 4,
    type: 'market',
    severity: 'medium',
    read: false,
    icon: '🌾',
    title_key: 'marketPricesTitle',
    message_key: 'priceDisclaimer',
    action_key: 'recommendedAction',
    values: { change: 3.2 },
    timestamp: new Date(Date.now() - 10800000).toISOString()
  }
];

function timeAgo(iso, locale) {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const h    = Math.floor(diff / 3600000);
    const formatter = new Intl.RelativeTimeFormat(locale || 'en', { numeric: 'auto' });
    if (h < 1) return formatter.format(0, 'minute');
    if (h < 24) return formatter.format(-h, 'hour');
    return formatter.format(-Math.floor(h / 24), 'day');
  } catch {
    return 'Recently';
  }
}

export default function Alerts() {
  const { t, i18n } = useTranslation();
  const { preferences } = usePreferences();
  const { data: apiAlerts, loading, error, refetch } = useApi(() => api.alerts(), [preferences?.location?.latitude, preferences?.location?.longitude, preferences?.temperatureUnit]);

  const [readIds,   setReadIds]   = useState(new Set());
  const [dismissed, setDismissed] = useState(new Set());
  const [filter,    setFilter]    = useState('all');
  const [selected,  setSelected]  = useState(null);

  const formatNum = (num) => {
    if (num === undefined || num === null || isNaN(num)) return num;
    try {
      const str = new Intl.NumberFormat(preferences?.language || 'en').format(num);
      const formatter = new Intl.NumberFormat(preferences?.language || 'en', { useGrouping: false });
      return str.replace(/\d/g, match => formatter.format(match));
    } catch {
      return String(num);
    }
  };

  const listSource = Array.isArray(apiAlerts) && apiAlerts.length > 0 ? apiAlerts : DEFAULT_ALERTS;

  const rawAlerts = listSource.filter((alert) =>
    (preferences?.weatherAlerts !== false || !['weather', 'irrigation', 'disease'].includes(alert.type)) &&
    (preferences?.marketAlerts !== false || alert.type !== 'market')
  );

  const alerts = rawAlerts
    .filter(a => !dismissed.has(a.id))
    .map(a => ({ ...a, read: a.read || readIds.has(a.id) }));

  const unread = alerts.filter(a => !a.read).length;

  const markRead = (id) => setReadIds(s => new Set([...s, id]));
  const dismiss  = (id) => { setDismissed(s => new Set([...s, id])); if (selected === id) setSelected(null); };
  const markAll  = () => setReadIds(new Set(alerts.map(a => a.id)));

  const filtered = alerts.filter(a =>
    filter === 'all' || a.type === filter
  );

  const selectedAlert = alerts.find(a => a.id === selected);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Bell size={30} color="var(--accent)" />
            {t('smartAlertsTitle')}
            {unread > 0 && <span style={{ background: 'var(--danger)', color: '#fff', borderRadius: '20px', padding: '0.2rem 0.65rem', fontSize: '1rem', fontWeight: 700 }}>{formatNum(unread)}</span>}
          </h1>
          <p className="text-muted">{t('basedOnLocation', { location: preferences?.location?.label || 'Farm' })}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {unread > 0 && (
            <button className="btn-ghost" onClick={markAll}>
              <CheckCheck size={16} /> {t('markAllRead')}
            </button>
          )}
          <button className="btn-ghost" onClick={() => { setReadIds(new Set()); setDismissed(new Set()); refetch(); }} disabled={loading}>
            <RefreshCw size={15} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> {t('refresh')}
          </button>
        </div>
      </header>

      {loading && !apiAlerts ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[1,2,3,4].map(i => <LoadingCard key={i} rows={3} height="100px" />)}
        </div>
      ) : (
        <>
          {/* Type stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
            {Object.entries(TYPE_CFG).map(([type, cfg]) => (
              <div key={type} className="glass-card" onClick={() => setFilter(filter === type ? 'all' : type)}
                style={{ padding: '1rem', textAlign: 'center', cursor: 'pointer', border: `1px solid ${filter === type ? cfg.color : 'var(--glass-border)'}`, transition: 'all 0.2s' }}>
                <div style={{ fontSize: '1.8rem', marginBottom: '0.3rem' }}>
                  {type === 'disease' ? '🦠' : type === 'weather' ? '🌤️' : type === 'market' ? '📊' : '💧'}
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{formatNum(alerts.filter(a => a.type === type).length)}</div>
                <div className="text-muted" style={{ fontSize: '0.8rem' }}>{t(cfg.labelKey)}</div>
              </div>
            ))}
          </div>

          {/* Filter pills */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <Filter size={16} color="var(--text-muted)" />
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ padding: '0.35rem 0.85rem', borderRadius: 20, border: `1px solid ${filter === f ? 'var(--accent)' : 'var(--glass-border)'}`, background: filter === f ? 'rgba(245,158,11,0.15)' : 'transparent', color: filter === f ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.82rem', transition: 'all 0.2s' }}>
                {t(f)} {f === 'all' && `(${formatNum(alerts.length)})`}
              </button>
            ))}
          </div>

          {/* List + detail pane */}
          <div style={{ display: 'grid', gridTemplateColumns: selectedAlert ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  <BellOff size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                  <p>{t('noAlerts')}</p>
                </div>
              ) : filtered.map(a => {
                const sColor = SEVERITY_COLOR[a.severity] ?? 'var(--secondary)';
                const tCfg   = TYPE_CFG[a.type]           ?? TYPE_CFG.weather;
                return (
                  <div key={a.id} className="glass-card animate-slide-in"
                    onClick={() => { setSelected(selected === a.id ? null : a.id); markRead(a.id); }}
                    style={{ padding: '1.1rem 1.25rem', cursor: 'pointer', opacity: a.read ? 0.7 : 1, border: `1px solid ${selected === a.id ? sColor : 'var(--glass-border)'}`, borderLeft: `4px solid ${sColor}`, transition: 'all 0.2s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', flex: 1 }}>
                        <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{a.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                            {!a.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: sColor, flexShrink: 0, boxShadow: `0 0 6px ${sColor}` }} />}
                            <h4 style={{ fontSize: '0.95rem', fontWeight: a.read ? 400 : 600 }}>{t(a.title_key, a.values)}</h4>
                          </div>
                          <p className="text-muted" style={{ fontSize: '0.82rem', lineHeight: 1.4 }}>{t(a.message_key, a.values)}</p>
                          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.4rem', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{timeAgo(a.timestamp, i18n?.resolvedLanguage)}</span>
                            <span className={`badge badge-${a.severity === 'high' ? 'red' : a.severity === 'medium' ? 'amber' : 'blue'}`}>{t(a.severity)}</span>
                            <span style={{ fontSize: '0.72rem', color: tCfg.color, display: 'flex', gap: '0.2rem', alignItems: 'center' }}>{tCfg.icon} {t(tCfg.labelKey)}</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0 }}>
                        <ChevronRight size={16} color="var(--text-muted)" />
                        <button onClick={e => { e.stopPropagation(); dismiss(a.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.1rem' }}>
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Detail pane */}
            {selectedAlert && (
              <div className="glass-panel animate-fade-in"
                style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', alignSelf: 'flex-start', position: 'sticky', top: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '2.5rem' }}>{selectedAlert.icon}</span>
                  <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
                </div>
                <div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                    <span className={`badge badge-${selectedAlert.severity === 'high' ? 'red' : selectedAlert.severity === 'medium' ? 'amber' : 'blue'}`}>{t(selectedAlert.severity)} {t('priority')}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{timeAgo(selectedAlert.timestamp, i18n?.resolvedLanguage)}</span>
                  </div>
                  <h2 style={{ fontSize: '1.3rem', lineHeight: 1.3, marginBottom: '0.75rem' }}>{t(selectedAlert.title_key, selectedAlert.values)}</h2>
                  <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--text-muted)' }}>{t(selectedAlert.message_key, selectedAlert.values)}</p>
                </div>
                <div style={{ background: `${SEVERITY_COLOR[selectedAlert.severity]}18`, border: `1px solid ${SEVERITY_COLOR[selectedAlert.severity]}44`, borderRadius: 10, padding: '1rem' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    <AlertTriangle size={14} color={SEVERITY_COLOR[selectedAlert.severity]} /> {t('recommendedAction')}
                  </div>
                  <p style={{ fontSize: '0.88rem', lineHeight: 1.5, color: 'var(--text-muted)' }}>{t(selectedAlert.action_key, selectedAlert.values)}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => dismiss(selectedAlert.id)}>
                    <CheckCheck size={16} /> {t('resolveAlert')}
                  </button>
                  <button className="btn-ghost" onClick={() => dismiss(selectedAlert.id)}>
                    <X size={16} /> {t('dismiss')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

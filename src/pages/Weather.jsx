import { useState } from 'react';
import { Cloud, Wind, Droplets, Sun, Calendar, CheckCircle2, AlertCircle, Info, RefreshCw } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { api } from '../api';
import { LoadingCard, ErrorState } from '../components/LoadingCard';
import { useTranslation } from 'react-i18next';
import { usePreferences } from '../contexts/PreferencesContext';

const PRIORITY_STYLE = {
  high:   { bg: 'rgba(239,68,68,0.1)',   border: 'var(--danger)',    icon: <AlertCircle   size={16} color="var(--danger)"    /> },
  medium: { bg: 'rgba(245,158,11,0.1)',  border: 'var(--accent)',    icon: <Info          size={16} color="var(--accent)"    /> },
  low:    { bg: 'rgba(59,130,246,0.1)',  border: 'var(--secondary)', icon: <CheckCircle2  size={16} color="var(--secondary)" /> },
};

const ACTION_ICONS = {
  scheduleIrrigate: '💧',
  scheduleSpray: '🌿',
  scheduleHold: '⛔',
  scheduleProtect: '🛡️',
  scheduleHarvest: '🌾',
};

function RainBar({ pct }) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div style={{ height: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', gap: 4 }}>
      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{new Intl.NumberFormat().format(clamped)}%</span>
      <div style={{ width: '100%', height: `${Math.max(clamped * 0.55, 4)}px`, background: clamped > 60 ? 'var(--danger)' : clamped > 30 ? 'var(--accent)' : 'var(--secondary)', borderRadius: '3px 3px 0 0', transition: 'height 0.4s ease' }} />
    </div>
  );
}

export default function Weather() {
  const { t, i18n } = useTranslation();
  const { preferences } = usePreferences();
  const { data, loading, error, refetch } = useApi(() => api.forecast(), [preferences.location.latitude, preferences.location.longitude, preferences.temperatureUnit]);
  const [selected, setSelected] = useState(0);

  const forecast = data?.forecast ?? [];
  const schedule = data?.schedule ?? [];
  const day      = forecast[selected] ?? {};
  const unit = data?.temperature_unit || (preferences.temperatureUnit === 'fahrenheit' ? '°F' : '°C');
  const formatDate = (value, options) => value ? new Intl.DateTimeFormat(i18n.resolvedLanguage, options).format(new Date(`${value}T12:00:00`)) : '';

  const formatNum = (num, frac = 0) => {
    if (num === undefined || num === null || isNaN(num)) return num;
    const str = new Intl.NumberFormat(preferences.language, { minimumFractionDigits: frac, maximumFractionDigits: frac }).format(num);
    const formatter = new Intl.NumberFormat(preferences.language, { useGrouping: false });
    return str.replace(/\d/g, match => formatter.format(match));
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.4rem' }}>
            <Cloud size={30} style={{ verticalAlign: 'middle', marginRight: '0.5rem', color: 'var(--secondary)' }} />
            {t('weather')} <span className="text-gradient">{t('forecast')}</span>
          </h1>
          <p className="text-muted">
            {t('weatherSubtitle')}
            {data?.updated && <> · {t('updated')} {new Date(data.updated).toLocaleTimeString(i18n.resolvedLanguage)}</>}
          </p>
        </div>
        <button className="btn-ghost" onClick={refetch} disabled={loading}>
          <RefreshCw size={15} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          {loading ? t('loading') : t('refresh')}
        </button>
      </header>

      {loading && !data ? (
        <>
          <LoadingCard rows={4} height="160px" />
          <LoadingCard rows={3} height="120px" />
        </>
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : (
        <>
          {/* Today's big card */}
          <div className="glass-panel" style={{ padding: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ fontSize: '5rem', lineHeight: 1 }}>{day.icon}</div>
              <div>
                <div style={{ fontSize: '3.5rem', fontWeight: 700, lineHeight: 1 }}>
                  {formatNum(day.high, 1)}°<span style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>/ {formatNum(day.low, 1)}{unit}</span>
                </div>
                <div style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>{t(day.condition_key)}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>📍 {preferences.location.label} · {formatDate(day.date, { weekday: 'short', month: 'short', day: 'numeric' })}</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {[
                { icon: <Droplets size={18} color="var(--secondary)" />, label: t('humidity'),    value: `${formatNum(day.humidity)}%` },
                { icon: <Wind     size={18} color="var(--text-muted)" />, label: t('wind'),       value: `${formatNum(day.wind, 1)} km/h` },
                { icon: <Sun      size={18} color="var(--accent)"    />, label: t('uvIndex'),   value: `${formatNum(day.uv_index, 1)} / ${formatNum(11)}` },
                { icon: <Cloud    size={18} color="var(--secondary)" />, label: t('rainChance'), value: `${formatNum(day.rain_chance)}%` },
              ].map(m => (
                <div key={m.label} style={{ background: 'rgba(0,0,0,0.2)', padding: '0.9rem', borderRadius: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{m.icon} {m.label}</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 600 }}>{m.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 7-day strip */}
          <div>
            <h2 style={{ marginBottom: '1rem', fontSize: '1.3rem' }}>{t('sevenDayForecast')}</h2>
            <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {forecast.map((d, i) => (
                <button key={i} className="weather-day-card" onClick={() => setSelected(i)}
                  style={{ border: `2px solid ${i === selected ? 'var(--primary)' : 'var(--glass-border)'}`, background: i === selected ? 'rgba(16,185,129,0.1)' : 'var(--bg-card)', cursor: 'pointer', minWidth: 100 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>{formatDate(d.date, { weekday: 'short' })}</div>
                  <div style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>{d.icon}</div>
                  <div style={{ fontWeight: 700 }}>{formatNum(d.high, 1)}°</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{formatNum(d.low, 1)}°</div>
                  <RainBar pct={d.rain_chance} />
                </button>
              ))}
            </div>
          </div>

          {/* Rain probability chart */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Droplets size={18} color="var(--secondary)" /> {t('precipitationProb')}
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', height: '80px' }}>
              {forecast.map((d, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{formatNum(d.rain_chance)}%</div>
                  <div style={{ width: '100%', height: `${Math.max(d.rain_chance * 0.65, 6)}px`, background: d.rain_chance > 60 ? 'var(--danger)' : d.rain_chance > 30 ? 'var(--accent)' : 'var(--secondary)', borderRadius: '4px 4px 0 0', opacity: i === selected ? 1 : 0.6, transition: 'all 0.3s' }} />
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center' }}>{formatDate(d.date, { weekday: 'short' })}</div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Smart Schedule */}
          {schedule.length > 0 && (
            <div>
              <h2 style={{ marginBottom: '1rem', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={20} color="var(--primary)" /> {t('aiFarmSchedule')}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {schedule.map((s, idx) => {
                  const sty = PRIORITY_STYLE[s.priority] ?? PRIORITY_STYLE.low;
                  return (
                    <div key={idx} className="animate-slide-in" style={{ background: sty.bg, border: `1px solid ${sty.border}33`, borderLeft: `4px solid ${sty.border}`, borderRadius: 12, padding: '1rem 1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <div style={{ fontSize: '1.5rem', flexShrink: 0 }}>{ACTION_ICONS[s.action_key] || '🌱'}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                          <h4 style={{ fontSize: '1rem' }}>{t(s.action_key)}</h4>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', flexShrink: 0, marginLeft: '1rem' }}>{s.day_key ? t(s.day_key) : t('dayNumber', { number: formatNum(s.day_number) })}</span>
                        </div>
                        <p className="text-muted" style={{ fontSize: '0.88rem', lineHeight: 1.5 }}>{t(s.reason_key, { ...s.values, condition: t(s.values?.condition_key) })}</p>
                      </div>
                      <div style={{ flexShrink: 0 }}>{sty.icon}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

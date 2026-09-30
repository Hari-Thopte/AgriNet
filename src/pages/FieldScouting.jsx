import { useState, useRef } from 'react';
import { MapPin, Camera, ClipboardList, Plus, X, AlertCircle, Info, CheckCircle, ChevronDown, RefreshCw } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { api } from '../api';
import { LoadingCard, ErrorState } from '../components/LoadingCard';
import { useTranslation } from 'react-i18next';
import { usePreferences } from '../contexts/PreferencesContext';
import { useLocalize } from '../hooks/useLocalize';

const FIELDS = ['North Block A', 'South Block B', 'East Plot C', 'West Field D'];
const CROPS  = ['Wheat', 'Rice', 'Maize', 'Soybean', 'Cotton', 'Sunflower'];
const FIELD_KEYS = { 'North Block A': 'northBlock', 'South Block B': 'southBlock', 'East Plot C': 'eastPlot', 'West Field D': 'westField' };
const CROP_KEYS = { Wheat: 'wheat', Rice: 'rice', Maize: 'maize', Soybean: 'soybean', Cotton: 'cotton', Sunflower: 'sunflower' };

const SEVERITY_CFG = {
  low:    { color: 'var(--secondary)', bg: 'rgba(59,130,246,0.12)', emoji: '🟢', icon: <CheckCircle size={14} color="var(--secondary)" /> },
  medium: { color: 'var(--accent)',    bg: 'rgba(245,158,11,0.12)', emoji: '🟡', icon: <Info        size={14} color="var(--accent)"    /> },
  high:   { color: 'var(--danger)',    bg: 'rgba(239,68,68,0.12)', emoji: '🔴', icon: <AlertCircle size={14} color="var(--danger)"   /> },
};

function timeAgo(iso, locale) {
  const diff = Date.now() - new Date(iso).getTime();
  const h    = Math.floor(diff / 3600000);
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  if (h < 1) return formatter.format(0, 'minute');
  if (h < 24) return formatter.format(-h, 'hour');
  return formatter.format(-Math.floor(h / 24), 'day');
}

export default function FieldScouting() {
  const { t, i18n } = useTranslation();
  const { preferences, requestLocation } = usePreferences();
  const { localizeString } = useLocalize();
  const { data: apiReports, loading, error, refetch } = useApi(() => api.scoutList(), [preferences.location.latitude, preferences.location.longitude]);
  const [localReports, setLocalReports] = useState(null);
  const [showForm, setShowForm]         = useState(false);
  const [submitting, setSubmitting]     = useState(false);
  const [form, setForm]    = useState({ field: FIELDS[0], crop: CROPS[0], lat: preferences.location.latitude.toFixed(5), lon: preferences.location.longitude.toFixed(5), notes: '', severity: 'low', image: null });
  const [preview, setPreview] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const fileRef = useRef();

  // Merge API data + locally submitted reports
  const reports = localReports ?? apiReports ?? [];

  const handleImg = (e) => {
    const f = e.target.files?.[0];
    if (f) { setForm(p => ({ ...p, image: URL.createObjectURL(f) })); setPreview(URL.createObjectURL(f)); }
  };

  const useGPS = async () => {
    try {
      const location = await requestLocation();
      setForm(p => ({ ...p, lat: location.latitude.toFixed(5), lon: location.longitude.toFixed(5) }));
    } catch {
      setForm(p => ({ ...p, lat: preferences.location.latitude.toFixed(5), lon: preferences.location.longitude.toFixed(5) }));
    }
  };

  const submit = async () => {
    if (!form.notes.trim()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const saved = await api.scoutSubmit({
        field: form.field, crop: form.crop,
        lat: parseFloat(form.lat) || preferences.location.latitude,
        lon: parseFloat(form.lon) || preferences.location.longitude,
        notes: form.notes, severity: form.severity,
      });
      // Prepend new report (with client-side image preview)
      const newReport = { ...saved.report, image: form.image };
      setLocalReports(prev => [newReport, ...(prev ?? apiReports ?? [])]);
      setForm({ field: FIELDS[0], crop: CROPS[0], lat: preferences.location.latitude.toFixed(5), lon: preferences.location.longitude.toFixed(5), notes: '', severity: 'low', image: null });
      setPreview(null);
      setShowForm(false);
    } catch {
      setSubmitError(t('saveReportError'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.4rem' }}>
            <ClipboardList size={30} style={{ verticalAlign: 'middle', marginRight: '0.5rem', color: 'var(--purple)' }} />
            {t('fieldScouting')}
          </h1>
          <p className="text-muted">{t('scoutingSubtitle')}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-ghost" onClick={() => { setLocalReports(null); refetch(); }} disabled={loading}>
            <RefreshCw size={15} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> {t('refresh')}
          </button>
          <button className="btn-primary" onClick={() => { setForm((current) => ({ ...current, lat: preferences.location.latitude.toFixed(5), lon: preferences.location.longitude.toFixed(5) })); setShowForm(true); }} style={{ background: 'var(--purple)' }}>
            <Plus size={18} /> {t('newScoutReport')}
          </button>
        </div>
      </header>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        {[
          { label: t('totalReports'),  value: localizeString(reports.length),                                          color: 'var(--primary)',   emoji: '📋' },
          { label: t('highSeverity'),  value: localizeString(reports.filter(r => r.severity === 'high').length),       color: 'var(--danger)',    emoji: '🔴' },
          { label: t('fieldsScouted'), value: localizeString([...new Set(reports.map(r => r.field))].length),          color: 'var(--secondary)', emoji: '🗺️' },
        ].map(s => (
          <div key={s.label} className="glass-card" style={{ padding: '1.2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ fontSize: '2rem' }}>{s.emoji}</span>
            <div>
              <div className="text-muted" style={{ fontSize: '0.8rem' }}>{s.label}</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* New Report Form */}
      {showForm && (
        <div className="glass-panel animate-fade-in" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Camera size={20} color="var(--purple)" /> {t('newScoutReport')}</h3>
            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>{t('field')}</label>
              <select className="input-glass" value={form.field} onChange={e => setForm(p => ({ ...p, field: e.target.value }))}>
                {FIELDS.map(f => <option key={f} value={f}>{t(FIELD_KEYS[f])}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>{t('crop')}</label>
              <select className="input-glass" value={form.crop} onChange={e => setForm(p => ({ ...p, crop: e.target.value }))}>
                {CROPS.map(c => <option key={c} value={c}>{t(CROP_KEYS[c])}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'flex-end' }}>
            <div>
              <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>{t('latitude')}</label>
              <input className="input-glass" placeholder={localizeString('28.61234')} value={form.lat} onChange={e => setForm(p => ({ ...p, lat: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>{t('longitude')}</label>
              <input className="input-glass" placeholder={localizeString('77.20901')} value={form.lon} onChange={e => setForm(p => ({ ...p, lon: e.target.value }))} />
            </div>
            <button className="btn-ghost" onClick={useGPS} style={{ whiteSpace: 'nowrap' }}>
              <MapPin size={15} /> {t('useGPS')}
            </button>
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>{t('severity')}</label>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {['low', 'medium', 'high'].map(s => (
                <button key={s} onClick={() => setForm(p => ({ ...p, severity: s }))} style={{ flex: 1, padding: '0.5rem', borderRadius: 8, border: `2px solid ${form.severity === s ? SEVERITY_CFG[s].color : 'var(--glass-border)'}`, background: form.severity === s ? SEVERITY_CFG[s].bg : 'transparent', color: form.severity === s ? SEVERITY_CFG[s].color : 'var(--text-muted)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s' }}>
                  {SEVERITY_CFG[s].emoji} {t(s)}
                </button>
              ))}
            </div>
          </div>

          {/* Photo upload */}
          <div>
            <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>{t('fieldPhoto')}</label>
            <input type="file" accept="image/*" ref={fileRef} onChange={handleImg} style={{ display: 'none' }} />
            <div onClick={() => fileRef.current.click()} style={{ border: '2px dashed var(--glass-border)', borderRadius: 10, padding: '1.5rem', textAlign: 'center', cursor: 'pointer', minHeight: 100, overflow: 'hidden', position: 'relative' }}>
              {preview
                ? <img src={preview} alt={t('fieldPhoto')} style={{ width: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 8 }} />
                : <div style={{ color: 'var(--text-muted)' }}><Camera size={28} style={{ marginBottom: '0.5rem', color: 'var(--purple)' }} /><div style={{ fontSize: '0.85rem' }}>{t('uploadPhoto')}</div></div>
              }
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>{t('observations')}</label>
            <textarea className="input-glass" rows={4} placeholder={t('observations')} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} style={{ resize: 'vertical' }} />
          </div>

          {submitError && (
            <div style={{ padding: '0.75rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: 'var(--danger)', fontSize: '0.85rem' }}>
              ⚠️ {submitError}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button className="btn-ghost" onClick={() => setShowForm(false)}>{t('cancel')}</button>
            <button className="btn-primary" onClick={submit} style={{ background: 'var(--purple)' }} disabled={!form.notes.trim() || submitting}>
              {submitting ? <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <ClipboardList size={16} />}
              {submitting ? t('pleaseWait') : t('saveReport')}
            </button>
          </div>
        </div>
      )}

      {/* Reports list */}
      {loading && !apiReports ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[1,2,3].map(i => <LoadingCard key={i} rows={3} height="100px" />)}
        </div>
      ) : error && !apiReports ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : (
        <div>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.3rem' }}>{t('scoutHistory')} ({localizeString(reports.length)})</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reports.map(r => {
              const cfg    = SEVERITY_CFG[r.severity] ?? SEVERITY_CFG.low;
              const isOpen = expanded === r.id;
              return (
                <div key={r.id} className="glass-card animate-fade-in"
                  style={{ padding: '1.25rem', borderLeft: `4px solid ${cfg.color}`, background: isOpen ? cfg.bg : 'var(--bg-card)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: 'pointer' }} onClick={() => setExpanded(isOpen ? null : r.id)}>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                      <div>{cfg.icon}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '1rem' }}>{t(r.field_key || FIELD_KEYS[r.field])} — {t(r.crop_key || CROP_KEYS[r.crop])}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '0.75rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                          <span><MapPin size={12} /> {localizeString(r.lat)}, {localizeString(r.lon)}</span>
                          <span>🕐 {timeAgo(r.timestamp, i18n.resolvedLanguage)}</span>
                          <span className={`badge badge-${r.severity === 'high' ? 'red' : r.severity === 'medium' ? 'amber' : 'blue'}`}>{cfg.emoji} {t(r.severity)}</span>
                        </div>
                      </div>
                    </div>
                    <ChevronDown size={18} color="var(--text-muted)" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
                  </div>

                  {isOpen && (
                    <div className="animate-fade-in" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                      {r.image && <img src={r.image} alt={t('fieldPhoto')} style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--glass-border)', marginBottom: '0.75rem' }} />}
                      <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-muted)' }}>{r.notes_key ? t(r.notes_key) : r.notes}</p>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                        📅 {new Date(r.timestamp).toLocaleString(i18n.resolvedLanguage)}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

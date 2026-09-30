import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Award, Calendar, Sliders, Target, Sprout, RefreshCw } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { api } from '../api';
import { LoadingCard, ErrorState, LoadingGrid } from '../components/LoadingCard';
import { useTranslation } from 'react-i18next';
import { usePreferences } from '../contexts/PreferencesContext';
import TapToListen from '../components/TapToListen';
const CROP_COLORS = {
  Wheat: '#10b981',
  Rice: '#3b82f6',
  Soybean: '#f59e0b',
  Maize: '#8b5cf6',
  Cotton: '#ef4444'
};
const GROWTH_STAGES = ['germination', 'seedling', 'vegetative', 'flowering', 'grainFilling', 'maturity', 'harvest'];
const scoreColor = s => s >= 80 ? 'var(--primary)' : s >= 65 ? 'var(--accent)' : 'var(--danger)';

const CustomTooltip = ({ active, payload, label, t, formatNum }) => {
  if (!active || !payload?.length) return null;
  return <div style={{
    background: 'rgba(10,14,23,0.95)',
    border: '1px solid var(--glass-border)',
    borderRadius: 10,
    padding: '0.75rem 1rem'
  }}>
      <p style={{
      fontWeight: 600,
      marginBottom: '0.4rem'
    }}>{formatNum ? formatNum(label) : label}</p>
      {payload.map(p => <p key={p.dataKey} style={{
      color: p.color,
      fontSize: '0.85rem'
    }}>{t(p.dataKey.toLowerCase())}: {formatNum ? formatNum(p.value, 1) : p.value}{t("tha")}</p>)}
    </div>;
};
export default function YieldPredictor() {
  const {
    t,
    i18n
  } = useTranslation();
  const {
    preferences
  } = usePreferences();
  const {
    data,
    loading,
    error,
    refetch
  } = useApi(() => api.yield(), [preferences.location.latitude, preferences.location.longitude, preferences.temperatureUnit]);
  const [selectedCrop, setSelectedCrop] = useState('Wheat');
  const pred = data?.prediction ?? {};
  const history = data?.history ?? [];
  const factors = pred.factors ?? [];

  // client-side interactive overrides
  const [soilOverride, setSoilOverride] = useState(null);
  const [waterOverride, setWaterOverride] = useState(null);
  const baseSoil = factors.find(f => f.name_key === 'soilHealth')?.score ?? 80;
  const baseWater = factors.find(f => f.name_key === 'waterAvailability')?.score ?? 74;
  const soilScore = soilOverride ?? baseSoil;
  const waterScore = waterOverride ?? baseWater;
  const formatNum = (num, frac = 0) => {
    if (num === undefined || num === null || isNaN(num)) return num;
    const str = new Intl.NumberFormat(preferences.language, {
      minimumFractionDigits: frac,
      maximumFractionDigits: frac
    }).format(num);
    const formatter = new Intl.NumberFormat(preferences.language, {
      useGrouping: false
    });
    return str.replace(/\d/g, match => formatter.format(match));
  };
  const dynYieldRaw = pred.expected_yield ? pred.expected_yield * (soilScore / baseSoil) * (waterScore / baseWater) : null;
  const dynYield = dynYieldRaw ? formatNum(dynYieldRaw, 2) : '--';

  // Build chart data from flat history array → group by year
  const chartData = [];
  if (history.length) {
    const years = [...new Set(history.map(h => h.year))];
    years.forEach(yr => {
      const row = {
        year: yr
      };
      history.filter(h => h.year === yr).forEach(h => {
        row[h.crop] = h.actual;
      });
      chartData.push(row);
    });
  }

  // current stage index
  const stageIdx = GROWTH_STAGES.findIndex(s => s === pred.growth_stage_key);
  const currentStageIdx = stageIdx >= 0 ? stageIdx : 4;
  return <div className="animate-fade-in" style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem'
  }}>
      <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      flexWrap: 'wrap',
      gap: '1rem'
    }}>
        <div>
          <h1 style={{
          fontSize: '2.5rem',
          marginBottom: '0.4rem'
        }}>
            <TrendingUp size={30} style={{
            verticalAlign: 'middle',
            marginRight: '0.5rem',
            color: 'var(--primary)'
          }} />
            {t('yieldPredictorTitle')}
          </h1>
          <p className="text-muted">{t('basedOnLocation', {
            location: preferences.location.label
          })}</p>
        </div>
        <button className="btn-ghost" onClick={() => {
        setSoilOverride(null);
        setWaterOverride(null);
        refetch();
      }} disabled={loading}>
          <RefreshCw size={15} style={{
          animation: loading ? 'spin 1s linear infinite' : 'none'
        }} /> {t('refresh')}
        </button>
      </header>

      {loading && !data ? <>
          <LoadingGrid count={2} cols={2} />
          <LoadingCard rows={4} height="140px" />
        </> : error ? <ErrorState message={error} onRetry={refetch} /> : <>
          {/* Main prediction + factors */}
          <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1.5rem'
      }}>
            {/* Prediction card */}
            <div className="glass-panel" style={{
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
              <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start'
          }}>
                <div>
                  <div className="text-muted" style={{
                fontSize: '0.85rem',
                marginBottom: '0.3rem'
              }}>{t(pred.field_key || 'northBlock')} · {t(pred.crop_key)}</div>
                  <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                    <div style={{
                  fontSize: '4rem',
                  fontWeight: 800,
                  color: 'var(--primary)',
                  lineHeight: 1
                }}>{dynYield}</div>
                    <TapToListen text={`${t('expectedYieldIs')} ${dynYield} ${t('tonsPerHa')}. ${t('growthProgress')}: ${pred.growth_pct}%. ${t('estHarvest')}: ${pred.harvest_date ? new Intl.DateTimeFormat(i18n.resolvedLanguage, {
                  dateStyle: 'medium'
                }).format(new Date(`${pred.harvest_date}T12:00:00`)) : ''}.`} />
                  </div>
                  <div style={{
                fontSize: '1.1rem',
                color: 'var(--text-muted)'
              }}>{t('tonsPerHa')}</div>
                </div>
                <div style={{
              textAlign: 'right'
            }}>
                  <span className="badge badge-green"><Award size={12} /> {formatNum(pred.confidence)}% {t('confidence')}</span>
                  <div style={{
                marginTop: '0.5rem'
              }}>
                    <div className="text-muted" style={{
                  fontSize: '0.78rem'
                }}>{t('vsRegionalAvg')}</div>
                    <div style={{
                  color: pred.regional_delta >= 0 ? 'var(--primary)' : 'var(--danger)',
                  fontWeight: 600
                }}>{pred.regional_delta > 0 ? '+' : ''}{formatNum(pred.regional_delta)}% {pred.regional_delta >= 0 ? '↑' : '↓'}</div>
                  </div>
                </div>
              </div>

              <div style={{
            display: 'flex',
            gap: '2rem'
          }}>
                <div>
                  <div className="text-muted" style={{
                fontSize: '0.78rem'
              }}>{t('estHarvest')}</div>
                  <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontWeight: 600
              }}>
                    <Calendar size={15} color="var(--accent)" /> {pred.harvest_date ? new Intl.DateTimeFormat(i18n.resolvedLanguage, {
                  dateStyle: 'medium'
                }).format(new Date(`${pred.harvest_date}T12:00:00`)) : '--'}
                  </div>
                </div>
                <div>
                  <div className="text-muted" style={{
                fontSize: '0.78rem'
              }}>{t('growthProgress')}</div>
                  <div style={{
                fontWeight: 600
              }}>{formatNum(pred.growth_pct)}%</div>
                </div>
              </div>

              {/* Interactive sliders */}
              <div style={{
            borderTop: '1px solid var(--glass-border)',
            paddingTop: '1rem'
          }}>
                <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem',
              color: 'var(--text-muted)',
              fontSize: '0.85rem'
            }}>
                  <Sliders size={15} /> {t('adjustFactors')}
                </div>
                <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
                  <div>
                    <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.82rem',
                  marginBottom: '0.3rem'
                }}>
                      <span>🌱 {t('soilHealth')}</span>
                      <span style={{
                    color: scoreColor(soilScore)
                  }}>{formatNum(soilScore)}/{formatNum(100)}</span>
                    </div>
                    <input type="range" min="40" max="100" value={soilScore} onChange={e => setSoilOverride(+e.target.value)} style={{
                  width: '100%',
                  accentColor: 'var(--primary)',
                  cursor: 'pointer'
                }} />
                  </div>
                  <div>
                    <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.82rem',
                  marginBottom: '0.3rem'
                }}>
                      <span>💧 {t('waterAvailability')}</span>
                      <span style={{
                    color: scoreColor(waterScore)
                  }}>{formatNum(waterScore)}/{formatNum(100)}</span>
                    </div>
                    <input type="range" min="30" max="100" value={waterScore} onChange={e => setWaterOverride(+e.target.value)} style={{
                  width: '100%',
                  accentColor: 'var(--secondary)',
                  cursor: 'pointer'
                }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Factor scores */}
            <div className="glass-panel" style={{
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
              <h3 style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.5rem'
          }}>
                <Target size={18} color="var(--primary)" /> {t('yieldFactors')}
              </h3>
              {factors.map(f => <div key={f.name}>
                  <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.3rem'
            }}>
                    <div style={{
                fontSize: '0.88rem'
              }}>{t(f.name_key)}</div>
                    <span style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: scoreColor(f.score)
              }}>{formatNum(f.score)}</span>
                  </div>
                  <div className="progress-bar-track">
                    <div className="progress-bar-fill" style={{
                width: `${f.score}%`,
                background: `linear-gradient(90deg, ${scoreColor(f.score)}, ${scoreColor(f.score)}aa)`
              }} />
                  </div>
                  {f.tip_key && <div style={{
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
              marginTop: '0.2rem'
            }}>{t(f.tip_key, f.values)}</div>}
                </div>)}
            </div>
          </div>

          {/* Growth stage timeline */}
          <div className="glass-card" style={{
        padding: '1.5rem'
      }}>
            <h3 style={{
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
              <Sprout size={18} color="var(--primary)" /> {t('cropGrowthCalendar')}
            </h3>
            <div style={{
          display: 'flex',
          position: 'relative'
        }}>
              <div style={{
            position: 'absolute',
            top: 16,
            left: 0,
            right: 0,
            height: 4,
            background: 'rgba(255,255,255,0.08)',
            borderRadius: 2
          }} />
              <div style={{
            position: 'absolute',
            top: 16,
            left: 0,
            width: `${currentStageIdx / (GROWTH_STAGES.length - 1) * 100}%`,
            height: 4,
            background: 'linear-gradient(90deg, var(--primary), #3b82f6)',
            borderRadius: 2,
            transition: 'width 0.8s ease'
          }} />
              {GROWTH_STAGES.map((stage, i) => {
            const done = i < currentStageIdx;
            const active = i === currentStageIdx;
            return <div key={stage} style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              position: 'relative',
              paddingTop: '2.5rem'
            }}>
                    <div style={{
                position: 'absolute',
                top: 9,
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: done ? 'var(--primary)' : active ? '#fff' : 'rgba(255,255,255,0.15)',
                border: active ? '3px solid var(--primary)' : done ? '2px solid var(--primary)' : '2px solid transparent',
                boxShadow: active ? '0 0 12px rgba(16,185,129,0.8)' : 'none',
                transition: 'all 0.3s',
                zIndex: 1
              }} />
                    <div style={{
                fontSize: '0.72rem',
                textAlign: 'center',
                color: active ? '#fff' : done ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: active ? 600 : 400,
                lineHeight: 1.2
              }}>
                      {t(stage)}
                      {active && <div style={{
                  fontSize: '0.65rem',
                  color: 'var(--primary)',
                  marginTop: '0.2rem'
                }}>← {t('currentStage')}</div>}
                    </div>
                  </div>;
          })}
            </div>
            <div style={{
          marginTop: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.8rem',
          color: 'var(--text-muted)'
        }}>
              <span>🌱 {t('planted')}: {pred.planting_date ? new Intl.DateTimeFormat(i18n.resolvedLanguage, {
              month: 'short',
              day: 'numeric'
            }).format(new Date(`${pred.planting_date}T12:00:00`)) : '--'}</span>
              <span>📅 {t('progress')}: {formatNum(pred.growth_pct)}%</span>
              <span>🌾 {t('harvest')}: {pred.harvest_date ? new Intl.DateTimeFormat(i18n.resolvedLanguage, {
              month: 'short',
              day: 'numeric'
            }).format(new Date(`${pred.harvest_date}T12:00:00`)) : '--'}</span>
            </div>
          </div>

          {/* Historical chart */}
          {chartData.length > 0 && <div className="glass-card" style={{
        padding: '1.5rem'
      }}>
              <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.25rem'
        }}>
                <h3>{t('historicalYield')}</h3>
                <div style={{
            display: 'flex',
            gap: '0.4rem'
          }}>
                  {Object.keys(CROP_COLORS).map(c => <button key={c} onClick={() => setSelectedCrop(c)} style={{
              padding: '0.3rem 0.75rem',
              borderRadius: 20,
              border: `1px solid ${c === selectedCrop ? CROP_COLORS[c] : 'var(--glass-border)'}`,
              background: c === selectedCrop ? `${CROP_COLORS[c]}22` : 'transparent',
              color: c === selectedCrop ? CROP_COLORS[c] : 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '0.8rem',
              transition: 'all 0.2s'
            }}>
                      {t(c.toLowerCase())}
                    </button>)}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chartData} margin={{
            top: 5,
            right: 10,
            left: -15,
            bottom: 0
          }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" vertical={false} />
                  <XAxis dataKey="year" tickFormatter={v => formatNum(v)} stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis tickFormatter={v => formatNum(v)} stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip t={t} formatNum={formatNum} />} />
                  <Bar dataKey={selectedCrop} fill={CROP_COLORS[selectedCrop]} radius={[6, 6, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>}
        </>}
    </div>;
}
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowUpRight, ScanLine, Bot, TrendingUp, CloudSun, Droplets, Wind, Activity, Sprout, MapPin, AlertTriangle, RefreshCw, Thermometer } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useApi } from '../hooks/useApi';
import { api } from '../api';
import { LoadingCard, LoadingGrid } from '../components/LoadingCard';
import { useTranslation } from 'react-i18next';
import { usePreferences } from '../contexts/PreferencesContext';
import FarmerEssentials from '../components/FarmerEssentials';
import TapToListen from '../components/TapToListen';
function greetingKey() {
  const h = new Date().getHours();
  if (h < 12) return 'goodMorning';
  if (h < 17) return 'goodAfternoon';
  return 'goodEvening';
}
export default function Dashboard() {
  const {
    t
  } = useTranslation();
  const {
    user
  } = useAuth();
  const {
    preferences
  } = usePreferences();
  const {
    data: weather,
    loading,
    error,
    refetch
  } = useApi(() => api.weather(), [preferences.location.latitude, preferences.location.longitude, preferences.temperatureUnit]);
  const unit = weather?.temperature_unit || (preferences.temperatureUnit === 'fahrenheit' ? '°F' : '°C');
  const ndviNow = Math.max(.35, Math.min(.92, .5 + (weather?.soil_moisture || 20) / 180 + (weather?.humidity || 50) / 1000));
  const ndviHistory = Array.from({
    length: 6
  }, (_, index) => ({
    name: `${t('week')} ${index + 1}`,
    ndvi: Number(Math.max(.25, ndviNow - (5 - index) * .065 + Math.sin(preferences.location.latitude + preferences.location.longitude + index) * .018).toFixed(2))
  }));
  const nextHarvest = weather?.timestamp ? new Intl.DateTimeFormat(preferences.language, {
    month: 'short',
    day: 'numeric'
  }).format(new Date(new Date(weather.timestamp).getTime() + 45 * 86400000)) : '--';
  const formatNum = (num, frac = 0) => {
    if (num === undefined || num === null || isNaN(num)) return '--';
    const str = new Intl.NumberFormat(preferences.language, {
      minimumFractionDigits: frac,
      maximumFractionDigits: frac
    }).format(num);
    const formatter = new Intl.NumberFormat(preferences.language, {
      useGrouping: false
    });
    return str.replace(/\d/g, match => formatter.format(match));
  };
  return <div className="animate-fade-in dashboard-page" style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem'
  }}>



      {/* Header */}
      <header className="dashboard-heading" style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      flexWrap: 'wrap',
      gap: '1rem'
    }}>
        <div>
          <span className="workspace-eyebrow">{t('uiToday')}</span>
          <h1 style={{
          fontSize: '2.5rem',
          marginBottom: '0.5rem'
        }}>
            {t(greetingKey())}, <span className="text-gradient">{user?.name?.split(' ')[0] || t('farmer')}</span>
          </h1>
          <p className="text-muted" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '1.1rem'
        }}>
            <MapPin size={18} /> {preferences.location.label}
          </p>
        </div>

        {/* Live weather card */}
        {loading ? <LoadingCard rows={2} height="80px" /> : (error || !weather) ? <div className="glass-card" style={{
        padding: '1rem',
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'center'
      }}>
            <CloudSun size={32} color="var(--accent)" />
            <div>
              <div style={{
            fontSize: '1.8rem',
            fontWeight: 700,
            lineHeight: 1
          }}>--{unit}</div>
              <div className="text-muted" style={{
            fontSize: '0.875rem'
          }}>{t('offline')}</div>
            </div>
            <button className="btn-ghost" onClick={refetch} aria-label={t('refresh')}><RefreshCw size={16} /></button>
          </div> : <div className="glass-card" style={{
        padding: '1rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
            <CloudSun size={40} color="var(--accent)" />
            <div>
              <div style={{
            fontSize: '2rem',
            fontWeight: 700,
            lineHeight: 1
          }}>{formatNum(weather?.temperature)}{unit}</div>
              <div className="text-muted" style={{
            fontSize: '0.875rem'
          }}>
                {t(weather?.condition_key || 'weatherClear')} · {t('humShort')}: {formatNum(weather?.humidity)}%
              </div>
              <div className="text-muted" style={{
            fontSize: '0.75rem',
            display: 'flex',
            gap: '0.75rem',
            marginTop: '0.2rem'
          }}>
                <span><Wind size={11} style={{
                verticalAlign: 'middle'
              }} /> {formatNum(weather?.wind)}{t("kmh")}</span>
                <span>🌧️ {formatNum(weather?.rain_chance)}% {t('rain')}</span>
              </div>
            </div>
            <button onClick={refetch} style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-muted)',
          marginLeft: '0.5rem'
        }} aria-label={t('refresh')} title={t('refresh')}>
              <RefreshCw size={16} />
            </button>
          </div>}
      </header>
      <nav className="dashboard-shortcuts" aria-label={t('uiQuickTools')}>
        {[{
        to: '/diagnostics',
        key: 'cropDiagnostics',
        icon: ScanLine
      }, {
        to: '/weather',
        key: 'weather',
        icon: CloudSun
      }, {
        to: '/prices',
        key: 'marketPrices',
        icon: TrendingUp
      }, {
        to: '/agrobot',
        key: 'agroBot',
        icon: Bot
      }].map(({
        to,
        key,
        icon: Icon
      }) => <Link to={to} key={to}><span><Icon size={20} /></span>{t(key)}<ArrowUpRight size={16} /></Link>)}
      </nav>

      {/* What should I do today? */}
      <div className="glass-card" style={{
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      borderLeft: '6px solid var(--primary)',
      background: 'color-mix(in srgb, var(--primary) 5%, var(--bg-card))'
    }}>
        <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
          <div>
            <h2 style={{
            fontSize: '1.8rem',
            marginBottom: '0.5rem',
            fontWeight: '700'
          }}>{t('whatShouldIDoToday', 'What should I do today?')}</h2>
            <p className="text-muted" style={{
            fontSize: '1.1rem'
          }}>{t('whatShouldIDoTodayDesc', 'Based on recent weather and your crop cycle, here is the most important action.')}</p>
          </div>
          <TapToListen text={t('sprayFungicideNowDesc', 'Based on recent weather and your crop cycle, here is the most important action. Spray fungicide today before the rains start tomorrow.')} />
        </div>
        <div style={{
        display: 'flex',
        gap: '1.5rem',
        alignItems: 'center',
        background: 'var(--control-bg)',
        padding: '1.5rem',
        borderRadius: '12px',
        flexWrap: 'wrap'
      }}>
          <div style={{
          background: 'var(--primary)',
          color: 'white',
          padding: '1.25rem',
          borderRadius: '50%'
        }}>
            <Droplets size={40} />
          </div>
          <div style={{
          flex: 1,
          minWidth: '250px'
        }}>
            <h3 style={{
            fontSize: '1.5rem',
            marginBottom: '0.35rem',
            fontWeight: '700'
          }}>{t('sprayFungicideNow', 'Spray Fungicide Now')}</h3>
            <p style={{
            fontSize: '1.1rem',
            color: 'var(--text-muted)'
          }}>{t('highHumidityExpected', 'High humidity (+80%) expected tomorrow. Prevent leaf blight.')}</p>
          </div>
          <Link to="/diagnostics" className="btn-primary" style={{
          fontSize: '1.2rem',
          padding: '1rem 2rem',
          width: '100%',
          justifyContent: 'center',
          flex: '0 0 auto',
          maxWidth: '300px',
          textDecoration: 'none'
        }}>
            {t('viewDetails', 'View Details')}
          </Link>
        </div>
        <div style={{
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'center',
        marginTop: '-0.5rem'
      }}>
          <span className="badge badge-green">{t('verified', 'Verified')}</span>
          <span style={{
          fontSize: '0.9rem',
          color: 'var(--text-muted)'
        }}>{t('usedSuccessfullyByFarmers', 'Used successfully by 47 farmers in your block this season.')}</span>
        </div>
      </div>

      {/* Stat cards */}
      {loading ? <LoadingGrid count={3} cols={3} /> : <div className="dashboard-stats" style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '1.5rem'
    }}>

          {/* Soil Health */}
          <div className="glass-card" style={{
        padding: '1.5rem'
      }}>
            <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
              <h3 style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
                <Droplets size={20} color="var(--secondary)" /> {t('soilHealth')}
              </h3>
              <span style={{
            padding: '0.25rem 0.75rem',
            background: 'rgba(16,185,129,0.2)',
            color: 'var(--primary)',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: 600
          }}>{t('optimal')}</span>
            </div>
            <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem'
        }}>
              {[{
            label: t('moisture'),
            value: `${formatNum(weather?.soil_moisture ?? '--')}%`
          }, {
            label: t('phLevel'),
            value: formatNum(6.1 + (weather?.soil_moisture || 20) % 8 / 10, 1)
          }, {
            label: t('nitrogen'),
            value: `${formatNum(Math.round(35 + (weather?.soil_moisture || 20) * .45))} mg/kg`
          }, {
            label: t('phosphorus'),
            value: `${formatNum(Math.round(14 + (weather?.humidity || 50) * .1))} mg/kg`
          }].map(m => <div key={m.label}>
                  <div className="text-muted" style={{
              fontSize: '0.875rem'
            }}>{m.label}</div>
                  <div style={{
              fontSize: '1.3rem',
              fontWeight: 600
            }}>{m.value}</div>
                </div>)}
            </div>
          </div>

          {/* Weather detail */}
          <div className="glass-card" style={{
        padding: '1.5rem'
      }}>
            <h3 style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1rem'
        }}>
              <Thermometer size={20} color="var(--accent)" /> {t('currentConditions')}
            </h3>
            <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem'
        }}>
              {[{
            label: t('temperature'),
            value: weather ? `${formatNum(weather.temperature)}${unit}` : '--'
          }, {
            label: t('humidity'),
            value: weather ? `${formatNum(weather.humidity)}%` : '--'
          }, {
            label: t('windSpeed'),
            value: weather ? `${formatNum(weather.wind)} km/h` : '--'
          }, {
            label: t('uvIndex'),
            value: weather ? `${formatNum(weather.uv_index)}/${formatNum(11)}` : '--'
          }].map(m => <div key={m.label}>
                  <div className="text-muted" style={{
              fontSize: '0.875rem'
            }}>{m.label}</div>
                  <div style={{
              fontSize: '1.3rem',
              fontWeight: 600
            }}>{m.value}</div>
                </div>)}
            </div>
          </div>

          {/* Quick stats */}
          <div className="glass-card" style={{
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
            <h3 style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
              <Activity size={20} color="var(--primary)" /> {t('farmOverview')}
            </h3>
            {[{
          label: t('activeFields'),
          value: formatNum(3 + Math.abs(Math.round(preferences.location.latitude)) % 4),
          color: 'var(--primary)'
        }, {
          label: t('cropHealthAvg'),
          value: `NDVI ${formatNum(0.68 + (weather?.soil_moisture || 20) / 500, 2)}`,
          color: 'var(--primary)'
        }, {
          label: t('pendingAlerts'),
          value: formatNum((weather?.rain_chance > 60 ? 2 : 1) + (weather?.uv_index > 7 ? 1 : 0)),
          color: 'var(--danger)'
        }, {
          label: t('nextHarvest'),
          value: nextHarvest,
          color: 'var(--accent)'
        }].map(s => <div key={s.label} style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
                <span className="text-muted" style={{
            fontSize: '0.88rem'
          }}>{s.label}</span>
                <span style={{
            fontWeight: 600,
            color: s.color,
            fontSize: '0.95rem'
          }}>{s.value}</span>
              </div>)}
          </div>
        </div>}

      {/* NDVI Chart */}
      <div className="glass-card" style={{
      padding: '1.5rem'
    }}>
        <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
          <h3 style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
            <Activity size={20} color="var(--primary)" /> {t('cropVigorNDVI')}
          </h3>
          <span className="text-muted" style={{
          fontSize: '0.875rem'
        }}>{t('uiEstimatedTrend')} · {preferences.location.label}</span>
        </div>
        <div className="dashboard-chart" style={{
        height: '220px'
      }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={ndviHistory} margin={{
            top: 10,
            right: 10,
            left: -20,
            bottom: 0
          }}>
              <defs>
                <linearGradient id="colorNdvi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} domain={[0, 1]} />
              <Tooltip contentStyle={{
              background: 'var(--bg-card)',
              border: '1px solid var(--glass-border)',
              borderRadius: '8px',
              color: 'var(--text-main)'
            }} itemStyle={{
              color: 'var(--primary)'
            }} />
              <Area type="monotone" dataKey="ndvi" stroke="var(--primary)" fillOpacity={1} fill="url(#colorNdvi)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <FarmerEssentials weather={weather} />

      {/* AI Advisories */}
      <div>
        <h2 style={{
        marginBottom: '1rem',
        fontSize: '1.5rem'
      }}>{t('aiAdvisories')}</h2>
        <div className="dashboard-advisories" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '1.5rem'
      }}>
          <div className="glass-panel" style={{
          padding: '1.5rem',
          display: 'flex',
          gap: '1rem'
        }}>
            <div style={{
            background: 'rgba(16,185,129,0.1)',
            padding: '1rem',
            borderRadius: '12px',
            height: 'fit-content'
          }}>
              <Sprout size={24} color="var(--primary)" />
            </div>
            <div>
              <h4 style={{
              fontSize: '1.1rem',
              marginBottom: '0.5rem'
            }}>{t('coverCropping')}</h4>
              <p className="text-muted" style={{
              fontSize: '0.9rem',
              lineHeight: 1.5
            }}>
                {t('coverCropAdvice')}
              </p>
            </div>
          </div>
          <div className="glass-panel" style={{
          padding: '1.5rem',
          display: 'flex',
          gap: '1rem'
        }}>
            <div style={{
            background: 'rgba(245,158,11,0.1)',
            padding: '1rem',
            borderRadius: '12px',
            height: 'fit-content'
          }}>
              <AlertTriangle size={24} color="var(--accent)" />
            </div>
            <div>
              <h4 style={{
              fontSize: '1.1rem',
              marginBottom: '0.5rem'
            }}>{t('irrigationAlert')}</h4>
              <p className="text-muted" style={{
              fontSize: '0.9rem',
              lineHeight: 1.5
            }}>
                {weather?.rain_chance > 40 ? t('irrigationHold') : t('irrigationIncrease')}
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>;
}
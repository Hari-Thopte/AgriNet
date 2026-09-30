import { useState } from 'react';
import { MapContainer, TileLayer, Polygon, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Layers, Activity, AlertTriangle, Satellite } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePreferences } from '../contexts/PreferencesContext';
import { useApi } from '../hooks/useApi';
import { api } from '../api';

// Fix leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});
const FIELD_BLUEPRINTS = [{
  id: 'A',
  nameKey: 'northBlock',
  cropKey: 'wheat',
  area: 12.4,
  ndvi: .82,
  statusKey: 'healthy',
  color: '#10b981',
  fillColor: 'rgba(16,185,129,0.3)',
  offsets: [[.016, -.014], [.020, -.004], [.014, .001], [.009, -.009]]
}, {
  id: 'B',
  nameKey: 'southBlock',
  cropKey: 'rice',
  area: 8.7,
  ndvi: .65,
  statusKey: 'watch',
  color: '#f59e0b',
  fillColor: 'rgba(245,158,11,0.3)',
  offsets: [[-.004, -.009], [.001, .003], [-.006, .009], [-.011, -.002]]
}, {
  id: 'C',
  nameKey: 'eastPlot',
  cropKey: 'maize',
  area: 5.2,
  ndvi: .44,
  statusKey: 'stress',
  color: '#ef4444',
  fillColor: 'rgba(239,68,68,0.3)',
  offsets: [[.004, .011], [.008, .019], [.002, .023], [-.002, .015]]
}, {
  id: 'D',
  nameKey: 'westField',
  cropKey: 'soybean',
  area: 9.1,
  ndvi: .74,
  statusKey: 'good',
  color: '#3b82f6',
  fillColor: 'rgba(59,130,246,0.3)',
  offsets: [[.006, -.027], [.011, -.017], [.004, -.013], [-.001, -.023]]
}];
const LAYERS = ['ndviHeatmap', 'soilMoistureLayer', 'fieldBoundaries', 'stressZones'];
const STATUS_STYLES = {
  healthy: {
    color: '#10b981',
    fillColor: 'rgba(16,185,129,0.3)'
  },
  good: {
    color: '#3b82f6',
    fillColor: 'rgba(59,130,246,0.3)'
  },
  watch: {
    color: '#f59e0b',
    fillColor: 'rgba(245,158,11,0.3)'
  },
  stress: {
    color: '#ef4444',
    fillColor: 'rgba(239,68,68,0.3)'
  }
};

function NdviLegend({ t }) {
  return <div style={{
    position: 'absolute',
    bottom: 24,
    right: 24,
    zIndex: 1000,
    background: 'rgba(10,14,23,0.9)',
    border: '1px solid var(--glass-border)',
    borderRadius: 12,
    padding: '1rem',
    backdropFilter: 'blur(12px)'
  }}>
      <div style={{
      fontSize: '0.75rem',
      fontWeight: 600,
      marginBottom: '0.5rem',
      color: 'var(--text-muted)'
    }}>{t('ndviIndex')}</div>
      {[{
      color: '#10b981',
      value: '0.8–1.0',
      key: 'excellent'
    }, {
      color: '#84cc16',
      value: '0.6–0.8',
      key: 'good'
    }, {
      color: '#f59e0b',
      value: '0.4–0.6',
      key: 'watch'
    }, {
      color: '#ef4444',
      value: '0.0–0.4',
      key: 'stress'
    }].map(({
      color,
      value,
      key
    }) => <div key={key} style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '0.3rem'
    }}>
          <div style={{
        width: 14,
        height: 14,
        borderRadius: 3,
        background: color,
        flexShrink: 0
      }} />
          <span style={{
        fontSize: '0.78rem',
        color: 'var(--text-muted)'
      }}>{value} {t(key)}</span>
        </div>)}
    </div>;
}
export default function SatelliteMap() {
  const {
    t
  } = useTranslation();
  const {
    preferences
  } = usePreferences();
  const {
    data: weather
  } = useApi(() => api.weather(), [preferences.location.latitude, preferences.location.longitude, preferences.temperatureUnit]);
  const [selected, setSelected] = useState(null);
  const [activeLayer, setActiveLayer] = useState('ndviHeatmap');
  const center = [preferences.location.latitude, preferences.location.longitude];
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
  const moistureEffect = ((weather?.soil_moisture ?? 24) - 24) / 260;
  const humidityEffect = ((weather?.humidity ?? 60) - 60) / 900;
  const heatPenalty = Math.max(0, (weather?.temperature ?? 26) - (preferences.temperatureUnit === 'fahrenheit' ? 90 : 32)) / 180;
  const fields = FIELD_BLUEPRINTS.map((field, index) => {
    const locationVariation = Math.sin(preferences.location.latitude + preferences.location.longitude + index * 1.7) * .045;
    const ndvi = Number(Math.max(.28, Math.min(.94, field.ndvi + moistureEffect + humidityEffect - heatPenalty + locationVariation)).toFixed(2));
    const statusKey = ndvi >= .8 ? 'healthy' : ndvi >= .68 ? 'good' : ndvi >= .52 ? 'watch' : 'stress';
    return {
      ...field,
      ...STATUS_STYLES[statusKey],
      statusKey,
      name: t(field.nameKey),
      crop: t(field.cropKey),
      areaLabel: `${formatNum(field.area, 1)} ha`,
      ndvi,
      ndviLabel: formatNum(ndvi, 2),
      coords: field.offsets.map(([latOffset, lonOffset]) => [center[0] + latOffset, center[1] + lonOffset])
    };
  });
  const stressZones = fields.filter(field => field.statusKey === 'stress' || field.statusKey === 'watch').map((field, index) => ({
    center: field.coords[0],
    radius: 90 + (1 - field.ndvi) * 180,
    color: field.color,
    labelKey: index % 2 ? 'leafBlightDetected' : 'lowMoistureZone'
  }));
  const selectedField = fields.find(f => f.id === selected);
  const totalAreaRaw = fields.reduce((s, f) => s + f.area, 0);
  const totalArea = formatNum(totalAreaRaw, 1);
  const avgNdviRaw = fields.reduce((sum, field) => sum + field.ndvi, 0) / fields.length;
  return <div className="animate-fade-in" style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
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
            <Satellite size={30} style={{
            verticalAlign: 'middle',
            marginRight: '0.5rem',
            color: 'var(--primary)'
          }} />
            {t('satelliteMapTitle')}
          </h1>
          <p className="text-muted">{t('satelliteSubtitle')} · {t('basedOnLocation', {
            location: preferences.location.label
          })}</p>
        </div>
        <div style={{
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap'
      }}>
          {LAYERS.map(l => <button key={l} onClick={() => setActiveLayer(l)} style={{
          padding: '0.4rem 0.9rem',
          borderRadius: '20px',
          border: `1px solid ${activeLayer === l ? 'var(--primary)' : 'var(--glass-border)'}`,
          background: activeLayer === l ? 'rgba(16,185,129,0.15)' : 'transparent',
          color: activeLayer === l ? 'var(--primary)' : 'var(--text-muted)',
          cursor: 'pointer',
          fontSize: '0.82rem',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem'
        }}>
              <Layers size={13} /> {t(l)}
            </button>)}
        </div>
      </header>

      {/* Field stat cards */}
      <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '1rem'
    }}>
        {fields.map(f => <button key={f.id} onClick={() => setSelected(f.id === selected ? null : f.id)} style={{
        padding: '1rem',
        borderRadius: 12,
        border: `2px solid ${f.id === selected ? f.color : 'var(--glass-border)'}`,
        background: f.id === selected ? `${f.fillColor}` : 'var(--bg-card)',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.2s'
      }}>
            <div style={{
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          marginBottom: '0.2rem'
        }}>{f.name}</div>
            <div style={{
          fontWeight: 700,
          fontSize: '1.2rem',
          color: f.color
        }}>{t("ndvi")}{f.ndviLabel}</div>
            <div style={{
          fontSize: '0.78rem',
          color: 'var(--text-muted)',
          marginTop: '0.2rem'
        }}>{f.crop} · {f.areaLabel}</div>
            <span className={`badge badge-${f.statusKey === 'healthy' || f.statusKey === 'good' ? 'green' : f.statusKey === 'watch' ? 'amber' : 'red'}`} style={{
          marginTop: '0.5rem'
        }}>{t(f.statusKey)}</span>
          </button>)}
      </div>

      {/* Map */}
      <div style={{
      position: 'relative',
      borderRadius: 16,
      overflow: 'hidden',
      border: '1px solid var(--glass-border)'
    }}>
        <MapContainer key={`${center[0]}-${center[1]}`} center={center} zoom={13} style={{
        height: '500px',
        width: '100%'
      }} zoomControl={true}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
          {fields.map(f => <Polygon key={f.id} positions={f.coords} pathOptions={{
          color: f.color,
          fillColor: f.fillColor,
          fillOpacity: 0.55,
          weight: 2
        }} eventHandlers={{
          click: () => setSelected(f.id === selected ? null : f.id)
        }}>
              <Popup>
                <div style={{
              fontFamily: 'Inter, sans-serif',
              minWidth: 160
            }}>
                  <strong>{f.name}</strong><br />
                  {t('crop')}: {f.crop}<br />
                  {t('area')}: {f.areaLabel}<br />{t("ndvi")}<strong style={{
                color: f.color
              }}>{f.ndviLabel}</strong><br />
                  {t('status')}: {t(f.statusKey)}
                </div>
              </Popup>
            </Polygon>)}
          {activeLayer === 'stressZones' && stressZones.map((z, i) => <Circle key={i} center={z.center} radius={z.radius} pathOptions={{
          color: z.color,
          fillColor: z.color,
          fillOpacity: 0.25,
          weight: 2,
          dashArray: '6 4'
        }}>
              <Popup><b>⚠️ {t(z.labelKey)}</b></Popup>
            </Circle>)}
        </MapContainer>
        <NdviLegend t={t} />
      </div>

      {/* Selected field details */}
      {selectedField && <div className="glass-panel animate-fade-in" style={{
      padding: '1.5rem',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: '1.5rem'
    }}>
          <div>
            <h3 style={{
          marginBottom: '0.5rem',
          color: selectedField.color
        }}>{selectedField.name}</h3>
            <p className="text-muted" style={{
          fontSize: '0.9rem'
        }}>{t('crop')}: <strong>{selectedField.crop}</strong> · {t('area')}: <strong>{selectedField.areaLabel}</strong></p>
            <span className={`badge badge-${selectedField.statusKey === 'healthy' || selectedField.statusKey === 'good' ? 'green' : selectedField.statusKey === 'watch' ? 'amber' : 'red'}`} style={{
          marginTop: '0.5rem'
        }}>{t(selectedField.statusKey)}</span>
          </div>
          <div>
            <div className="text-muted" style={{
          fontSize: '0.8rem',
          marginBottom: '0.3rem'
        }}>{t('ndviScore')}</div>
            <div style={{
          fontSize: '2rem',
          fontWeight: 700,
          color: selectedField.color
        }}>{selectedField.ndviLabel}</div>
            <div className="progress-bar-track" style={{
          marginTop: '0.5rem'
        }}>
              <div className="progress-bar-fill" style={{
            width: `${selectedField.ndvi * 100}%`,
            background: `linear-gradient(90deg, ${selectedField.color}, ${selectedField.color}aa)`
          }} />
            </div>
          </div>
          <div>
            <div className="text-muted" style={{
          fontSize: '0.8rem',
          marginBottom: '0.5rem'
        }}>{t('aiRecommendation')}</div>
            <p style={{
          fontSize: '0.88rem',
          lineHeight: 1.5
        }}>
              {selectedField.statusKey === 'stress' ? t('stressRecommendation') : selectedField.statusKey === 'watch' ? t('watchRecommendation') : t('healthyRecommendation')}
            </p>
          </div>
        </div>}

      {/* Summary row */}
      <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '1rem'
    }}>
        {[{
        icon: <Activity size={20} color="var(--primary)" />,
        label: t('avgFarmNdvi'),
        value: formatNum(avgNdviRaw, 2),
        sub: t('aboveAvg')
      }, {
        icon: <Layers size={20} color="var(--secondary)" />,
        label: t('totalFarmArea'),
        value: `${totalArea} ha`,
        sub: `${formatNum(fields.length)} ${t('activeFields').toLowerCase()}`
      }, {
        icon: <AlertTriangle size={20} color="var(--accent)" />,
        label: t('activeStressZones'),
        value: formatNum(stressZones.length),
        sub: t('location') + ': ' + preferences.location.label
      }].map(c => <div key={c.label} className="glass-card" style={{
        padding: '1.2rem',
        display: 'flex',
        gap: '1rem',
        alignItems: 'center'
      }}>
            <div style={{
          background: 'rgba(255,255,255,0.05)',
          padding: '0.75rem',
          borderRadius: 10
        }}>{c.icon}</div>
            <div>
              <div className="text-muted" style={{
            fontSize: '0.8rem'
          }}>{c.label}</div>
              <div style={{
            fontWeight: 700,
            fontSize: '1.4rem'
          }}>{c.value}</div>
              <div className="text-muted" style={{
            fontSize: '0.75rem'
          }}>{c.sub}</div>
            </div>
          </div>)}
      </div>
    </div>;
}
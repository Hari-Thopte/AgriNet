import { useTranslation } from "react-i18next";
import { useState } from 'react';
import { DownloadCloud, HardDrive, CheckCircle2, Trash2, ArrowDownCircle, Layers, Cpu, Smartphone, ShieldCheck } from 'lucide-react';
export default function ProgressiveDownload() {
  const {
    t
  } = useTranslation();
  const [packages, setPackages] = useState([{
    id: 'core',
    name: 'AgriNet Core Platform',
    sizeMb: 2.8,
    status: 'installed',
    required: true,
    desc: 'Base application bundle containing Mandi Rates, Diagnostics, Schemes & Weather Forecasts.',
    icon: '🌾'
  }, {
    id: 'sat_maps',
    name: 'Offline Satellite Map & NDVI Cache',
    sizeMb: 4.2,
    status: 'installed',
    required: false,
    desc: 'Local satellite tiles for offline field scouting without active cellular internet.',
    icon: '🛰️'
  }, {
    id: 'disease_ml',
    name: 'Offline Disease AI Model (TF Lite)',
    sizeMb: 5.5,
    status: 'available',
    required: false,
    desc: 'On-device neural network for zero-bandwidth crop leaf disease identification.',
    icon: '🔬'
  }, {
    id: 'voice_tts',
    name: 'Multilingual Offline Speech Model',
    sizeMb: 3.1,
    status: 'installed',
    required: false,
    desc: 'Offline text-to-speech voice packs for Hindi, Tamil, Telugu, Marathi & Kannada.',
    icon: '🗣️'
  }, {
    id: 'weather_radar',
    name: 'Historical Weather Radar Archives',
    sizeMb: 2.4,
    status: 'available',
    required: false,
    desc: '3-year historical rainfall and drought trend records for yield estimation.',
    icon: '🌧️'
  }]);
  const [downloadingId, setDownloadingId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const installedSize = packages.filter(p => p.status === 'installed').reduce((sum, p) => sum + p.sizeMb, 0);
  const togglePackage = id => {
    const target = packages.find(p => p.id === id);
    if (!target || target.required) return;
    if (target.status === 'installed') {
      setPackages(prev => prev.map(p => p.id === id ? {
        ...p,
        status: 'available'
      } : p));
      setToastMessage(`Uninstalled "${target.name}" (-${target.sizeMb} MB)`);
      setTimeout(() => setToastMessage(''), 3000);
    } else {
      setDownloadingId(id);
      setTimeout(() => {
        setPackages(prev => prev.map(p => p.id === id ? {
          ...p,
          status: 'installed'
        } : p));
        setDownloadingId(null);
        setToastMessage(`🎉 Installed "${target.name}" (+${target.sizeMb} MB)`);
        setTimeout(() => setToastMessage(''), 3000);
      }, 1500);
    }
  };
  return <div className="animate-fade-in" style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem'
  }}>
      {toastMessage && <div className="animate-fade-in" style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 10000,
      padding: '0.75rem 1.25rem',
      background: 'var(--primary)',
      color: '#fff',
      borderRadius: '12px',
      fontWeight: 700,
      fontSize: '0.9rem',
      boxShadow: '0 8px 24px rgba(16,185,129,0.3)'
    }}>
          {toastMessage}
        </div>}

      <header>
        <h1 style={{
        fontSize: '2.5rem',
        marginBottom: '0.4rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem'
      }}>
          <DownloadCloud size={32} style={{
          color: 'var(--primary)'
        }} />{t("progressive_download_apk_size_")}</h1>
        <p className="text-muted">{t("keep_your_initial_app_size_15m")}</p>
      </header>

      {/* App Size & Storage Meter */}
      <div className="glass-panel" style={{
      padding: '1.5rem',
      borderLeft: '4px solid var(--primary)',
      background: 'rgba(16,185,129,0.06)'
    }}>
        <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
          <div>
            <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.3rem'
          }}>
              <HardDrive size={22} color="var(--primary)" />
              <h3 style={{
              fontSize: '1.2rem',
              margin: 0,
              fontWeight: 700
            }}>{t("device_storage_usage")}</h3>
            </div>
            <p className="text-muted" style={{
            fontSize: '0.85rem',
            margin: 0
          }}>{t("total_storage_used")}<strong style={{
              color: 'var(--primary)',
              fontSize: '1.1rem'
            }}>{installedSize.toFixed(1)}{t("mb")}</strong>{t("limit_150_mb_target")}</p>
          </div>

          <div style={{
          padding: '0.5rem 1rem',
          borderRadius: 20,
          background: 'rgba(16,185,129,0.15)',
          color: 'var(--primary)',
          fontWeight: 800,
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem'
        }}>
            <ShieldCheck size={16} />{t("ultralean_15mb_verified")}</div>
        </div>

        {/* Progress Bar */}
        <div style={{
        marginTop: '1rem',
        width: '100%',
        height: '10px',
        background: 'var(--soft-bg)',
        borderRadius: 5,
        overflow: 'hidden'
      }}>
          <div style={{
          width: `${installedSize / 15 * 100}%`,
          height: '100%',
          background: installedSize > 12 ? 'var(--accent)' : 'var(--primary)',
          borderRadius: 5,
          transition: 'width 0.4s ease'
        }} />
        </div>
      </div>

      {/* Feature Bundles Grid */}
      <section style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    }}>
        <h2 style={{
        fontSize: '1.3rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
          <Layers size={20} color="var(--secondary)" />{t("ondemand_feature_bundles")}</h2>

        {packages.map(pkg => {
        const isInstalled = pkg.status === 'installed';
        const isDownloading = downloadingId === pkg.id;
        return <div key={pkg.id} className="glass-card" style={{
          padding: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem'
        }}>
              <div style={{
            display: 'flex',
            gap: '0.9rem',
            alignItems: 'flex-start'
          }}>
                <span style={{
              fontSize: '1.8rem'
            }}>{pkg.icon}</span>
                <div>
                  <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                flexWrap: 'wrap'
              }}>
                    <h3 style={{
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  margin: 0
                }}>{pkg.name}</h3>
                    <span style={{
                  padding: '0.15rem 0.5rem',
                  borderRadius: 12,
                  background: 'var(--soft-bg)',
                  border: '1px solid var(--glass-border)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: 'var(--primary)'
                }}>{pkg.sizeMb}{t("mb")}</span>
                    {pkg.required && <span style={{
                  padding: '0.15rem 0.5rem',
                  borderRadius: 12,
                  background: 'rgba(59,130,246,0.15)',
                  color: 'var(--secondary)',
                  fontSize: '0.68rem',
                  fontWeight: 700
                }}>{t("core_system")}</span>}
                  </div>
                  <p className="text-muted" style={{
                fontSize: '0.83rem',
                margin: '0.2rem 0 0 0',
                lineHeight: 1.5
              }}>{pkg.desc}</p>
                </div>
              </div>

              <div>
                {pkg.required ? <span style={{
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}>
                    <CheckCircle2 size={14} color="var(--primary)" />{t("included")}</span> : <button onClick={() => togglePackage(pkg.id)} disabled={isDownloading} style={{
              padding: '0.55rem 1.1rem',
              borderRadius: 10,
              fontWeight: 700,
              fontSize: '0.82rem',
              border: isInstalled ? '1px solid var(--danger)' : '1.5px solid var(--primary)',
              background: isInstalled ? 'rgba(223,48,48,0.1)' : 'var(--primary)',
              color: isInstalled ? 'var(--danger)' : '#fff',
              cursor: isDownloading ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              transition: 'all 0.2s ease',
              flexShrink: 0
            }}>
                    {isDownloading ? 'Downloading...' : isInstalled ? <><Trash2 size={14} />{t("remove")}{pkg.sizeMb}{t("mb")}</> : <><ArrowDownCircle size={14} />{t("download")}{pkg.sizeMb}{t("mb")}</>}
                  </button>}
              </div>
            </div>;
      })}
      </section>

      {/* APK Optimization Details */}
      <div className="glass-panel" style={{
      padding: '1.25rem',
      fontSize: '0.85rem'
    }}>
        <strong>{t("apk_optimization_specs")}</strong>
        <ul className="text-muted" style={{
        paddingLeft: '1.2rem',
        lineHeight: 1.8,
        marginTop: '0.4rem',
        margin: 0
      }}>
          <li>{t("base_apk_size_84_mb_vite_trees")}</li>
          <li>{t("feature_modules_are_codesplit_")}</li>
          <li>{t("optimized_for_lowbandwidth_2g3")}</li>
        </ul>
      </div>
    </div>;
}
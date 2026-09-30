import { useTranslation } from "react-i18next";
import { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Globe, FileText, CheckCircle, XCircle, AlertTriangle, Download, Trash2, Key, Info, Award, Share2, Copy } from 'lucide-react';
import { api } from '../api';
function FarmerPassportCard() {
  const {
    t
  } = useTranslation();
  const [passport, setPassport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    api.farmerPassport().then(res => setPassport(res)).catch(() => {}).finally(() => setLoading(false));
  }, []);
  const handleExportPassport = () => {
    if (!passport) return;
    const blob = new Blob([JSON.stringify(passport, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Farmer_Digital_Passport_${passport.passport_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const handleCopySignature = () => {
    if (!passport) return;
    navigator.clipboard.writeText(passport.digital_signature);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };
  if (loading) {
    return <div className="glass-card" style={{
      padding: '1.5rem',
      color: 'var(--text-muted)'
    }}>{t("loading_agristack_digital_pass")}</div>;
  }
  if (!passport) return null;
  return <div className="glass-card animate-fade-in" style={{
    padding: '1.75rem',
    borderLeft: '5px solid var(--primary)',
    background: 'linear-gradient(135deg, rgba(16,185,129,0.05) 0%, rgba(59,130,246,0.05) 100%)'
  }}>
      <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      flexWrap: 'wrap',
      gap: '1rem',
      marginBottom: '1rem',
      borderBottom: '1px solid var(--glass-border)',
      paddingBottom: '1rem'
    }}>
        <div>
          <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem'
        }}>
            <Award size={24} color="var(--primary)" />
            <h3 style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            margin: 0
          }}>{t("agristack_brics_digital_farmer")}</h3>
          </div>
          <small className="text-muted" style={{
          fontSize: '0.78rem'
        }}>{t("standard_protocol")}{passport.standard_version}</small>
        </div>
        <span style={{
        padding: '0.35rem 0.85rem',
        borderRadius: 20,
        background: 'rgba(16,185,129,0.15)',
        color: 'var(--primary)',
        fontWeight: 800,
        fontSize: '0.75rem'
      }}>{t("verified_aadhaar_land_record")}</span>
      </div>

      <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '1.25rem',
      marginBottom: '1.25rem'
    }}>
        <div>
          <span className="text-muted" style={{
          fontSize: '0.72rem'
        }}>{t("passport_id")}</span>
          <div style={{
          fontWeight: 800,
          fontSize: '0.98rem',
          color: 'var(--primary)'
        }}>{passport.passport_id}</div>
        </div>

        <div>
          <span className="text-muted" style={{
          fontSize: '0.72rem'
        }}>{t("farmer_name")}</span>
          <div style={{
          fontWeight: 700,
          fontSize: '0.95rem'
        }}>{passport.farmer_name}</div>
        </div>

        <div>
          <span className="text-muted" style={{
          fontSize: '0.72rem'
        }}>{t("credit_score_kcc_eligible")}</span>
          <div style={{
          fontWeight: 800,
          color: 'var(--accent)',
          fontSize: '0.95rem'
        }}>{passport.active_credit_score}</div>
        </div>

        <div>
          <span className="text-muted" style={{
          fontSize: '0.72rem'
        }}>{t("land_holding")}</span>
          <div style={{
          fontWeight: 700,
          fontSize: '0.95rem'
        }}>{t("khata")}{passport.land_details?.khata_no || '8849/B'} ({passport.land_details?.total_area_acres || 4.5}{t("acres")}</div>
        </div>
      </div>

      <div style={{
      padding: '1rem',
      background: 'var(--soft-bg)',
      borderRadius: 12,
      marginBottom: '1.25rem',
      fontSize: '0.82rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    }}>
        <div>🧪 <strong>{t("soil_health_card")}</strong>{t("organic_carbon")}{passport.soil_health_card?.organic_carbon || '0.78%'}{t("ph")}{passport.soil_health_card?.ph || 6.8}</div>
        <div>🌾 <strong>{t("verified_yield_certifications")}</strong> {(passport.yield_certifications || []).map(y => `${y.crop} (${y.season}): ${y.verified_yield_tons_ha} tons/ha`).join(' • ')}</div>
        <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginTop: '0.2rem'
      }}>
          <span>🔐 <strong>{t("sha256_signature")}</strong> <code>{passport.digital_signature}</code></span>
          <button onClick={handleCopySignature} style={{
          background: 'none',
          border: 'none',
          color: 'var(--primary)',
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.2rem'
        }}>
            <Copy size={12} /> {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      <div style={{
      display: 'flex',
      gap: '0.75rem',
      flexWrap: 'wrap'
    }}>
        <button onClick={handleExportPassport} className="btn-primary" style={{
        padding: '0.6rem 1.25rem',
        borderRadius: 8,
        fontSize: '0.85rem',
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem'
      }}>
          <Download size={16} />{t("export_verified_passport_json")}</button>

        <button onClick={() => alert(`Shareable link generated: ${passport.shareable_qr_data}`)} className="btn-ghost" style={{
        padding: '0.6rem 1.25rem',
        borderRadius: 8,
        fontSize: '0.85rem',
        fontWeight: 700,
        border: '1.5px solid var(--primary)',
        color: 'var(--primary)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        cursor: 'pointer'
      }}>
          <Share2 size={16} />{t("fasttrack_share_to_bank_pmkisa")}</button>
      </div>
    </div>;
}
export default function DataConsent() {
  const {
    t
  } = useTranslation();
  const [consents, setConsents] = useState(() => {
    try {
      const saved = localStorage.getItem('agrin_data_consent');
      return saved ? JSON.parse(saved) : {
        bricsResearch: true,
        pestOutbreakAlerts: true,
        gpsPreciseLocation: false,
        financialVerification: true,
        anonymousAnalytics: true
      };
    } catch {
      return {
        bricsResearch: true,
        pestOutbreakAlerts: true,
        gpsPreciseLocation: false,
        financialVerification: true,
        anonymousAnalytics: true
      };
    }
  });
  const [toastMessage, setToastMessage] = useState('');
  const toggleConsent = key => {
    const updated = {
      ...consents,
      [key]: !consents[key]
    };
    setConsents(updated);
    localStorage.setItem('agrin_data_consent', JSON.stringify(updated));
    setToastMessage(`Updated privacy setting for "${key}"`);
    setTimeout(() => setToastMessage(''), 3000);
  };
  const handleDownloadData = () => {
    const prefs = localStorage.getItem('agrin_preferences') || '{}';
    const payload = {
      userConsents: consents,
      userPreferences: JSON.parse(prefs),
      exportedAt: new Date().toISOString(),
      bricsDataPolicyVersion: "2026.1-BRICS-AGRI"
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AgriNet_Privacy_Export_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setToastMessage('📥 Personal Data Package downloaded!');
    setTimeout(() => setToastMessage(''), 3000);
  };
  const handlePurgeData = () => {
    if (window.confirm('Are you sure you want to delete all cached local farm data? This cannot be undone.')) {
      localStorage.clear();
      setToastMessage('🗑️ All local cache purged!');
      setTimeout(() => window.location.reload(), 1500);
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
          <ShieldCheck size={32} style={{
          color: 'var(--primary)'
        }} />{t("farmer_data_sovereignty_brics_")}</h1>
        <p className="text-muted">{t("digital_farmer_passport_agrist")}</p>
      </header>

      {/* Standardized Digital Passport Feature */}
      <FarmerPassportCard />

      {/* Main Privacy Guarantee Banner */}
      <div className="glass-panel" style={{
      padding: '1.5rem',
      borderLeft: '4px solid var(--primary)',
      background: 'rgba(16,185,129,0.06)'
    }}>
        <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.8rem',
        marginBottom: '0.5rem'
      }}>
          <Lock size={22} color="var(--primary)" />
          <h3 style={{
          fontSize: '1.2rem',
          margin: 0,
          fontWeight: 700
        }}>{t("farmer_data_sovereignty_princi")}</h3>
        </div>
        <p className="text-muted" style={{
        fontSize: '0.88rem',
        lineHeight: 1.6,
        margin: 0
      }}>{t("your_agricultural_data_belongs")}<strong>{t("localfirst_storage")}</strong>{t("model_where_your_farm_coordina")}</p>
      </div>

      {/* Consent Toggles */}
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
          <Key size={20} color="var(--secondary)" />{t("granular_sharing_permissions")}</h2>

        {[{
        key: 'bricsResearch',
        title: 'BRICS Agritech Research & Yield Aggregates',
        badge: 'Cross-Border',
        desc: 'Shares anonymized regional crop yield statistics with BRICS agricultural research centers (ICAR, EMBRAPA, CAAS) to improve climate-resilient seed models.',
        icon: <Globe size={20} color="var(--secondary)" />
      }, {
        key: 'pestOutbreakAlerts',
        title: 'Pest & Disease Early Warning Network',
        badge: 'Community Safety',
        desc: 'Allows diagnostic photos to trigger early pest warnings for neighboring farms within a 25 km radius without revealing your exact farm boundary.',
        icon: <AlertTriangle size={20} color="var(--accent)" />
      }, {
        key: 'gpsPreciseLocation',
        title: 'Precise GPS Farm Boundary Tracking',
        badge: 'Private',
        desc: 'Allows high-resolution satellite NDVI mapping and field Scouting boundary overlays. When disabled, coarse district-level location is used instead.',
        icon: <Lock size={20} color="var(--primary)" />
      }, {
        key: 'financialVerification',
        title: 'KCC & Insurance Credit Verification',
        badge: 'Institutional',
        desc: 'Shares verified harvest records with empaneled banks and PMFBY insurance providers to expedite loan approvals and automated weather payouts.',
        icon: <FileText size={20} color="var(--primary)" />
      }, {
        key: 'anonymousAnalytics',
        title: 'Anonymous App Telemetry & Diagnostics',
        badge: 'System',
        desc: 'Sends crash logs and low-bandwidth performance data to help optimize AgriNet for budget low-RAM Android smartphones.',
        icon: <Info size={20} color="var(--text-muted)" />
      }].map(item => {
        const isEnabled = consents[item.key];
        return <div key={item.key} className="glass-card" style={{
          padding: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '1rem'
        }}>
              <div style={{
            display: 'flex',
            gap: '0.8rem',
            alignItems: 'flex-start'
          }}>
                <span style={{
              marginTop: '0.2rem'
            }}>{item.icon}</span>
                <div>
                  <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.2rem'
              }}>
                    <h3 style={{
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  margin: 0
                }}>{item.title}</h3>
                    <span style={{
                  padding: '0.15rem 0.5rem',
                  borderRadius: 12,
                  background: 'var(--soft-bg)',
                  border: '1px solid var(--glass-border)',
                  fontSize: '0.7rem',
                  fontWeight: 600
                }}>{item.badge}</span>
                  </div>
                  <p className="text-muted" style={{
                fontSize: '0.83rem',
                margin: 0,
                lineHeight: 1.5
              }}>{item.desc}</p>
                </div>
              </div>

              <button type="button" onClick={() => toggleConsent(item.key)} style={{
            padding: '0.5rem 1rem',
            borderRadius: 20,
            fontWeight: 700,
            fontSize: '0.8rem',
            border: `1.5px solid ${isEnabled ? 'var(--primary)' : 'var(--glass-border)'}`,
            background: isEnabled ? 'rgba(16,185,129,0.15)' : 'var(--control-bg)',
            color: isEnabled ? 'var(--primary)' : 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            flexShrink: 0,
            transition: 'all 0.2s ease'
          }}>
                {isEnabled ? <><CheckCircle size={14} />{t("granted")}</> : <><XCircle size={14} />{t("revoked")}</>}
              </button>
            </div>;
      })}
      </section>

      {/* Data Sovereignty Actions */}
      <section className="glass-card" style={{
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    }}>
        <h3 style={{
        fontSize: '1.1rem',
        margin: 0,
        fontWeight: 700
      }}>{t("data_rights_portability")}</h3>
        <p className="text-muted" style={{
        fontSize: '0.85rem',
        margin: 0
      }}>{t("under_brics_digital_agricultur")}</p>

        <div style={{
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        marginTop: '0.5rem'
      }}>
          <button onClick={handleDownloadData} className="btn-primary" style={{
          padding: '0.65rem 1.25rem',
          borderRadius: 10,
          fontSize: '0.88rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
            <Download size={16} />{t("export_my_data_json")}</button>

          <button onClick={handlePurgeData} style={{
          padding: '0.65rem 1.25rem',
          borderRadius: 10,
          fontSize: '0.88rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          border: '1px solid var(--danger)',
          background: 'rgba(223,48,48,0.1)',
          color: 'var(--danger)',
          cursor: 'pointer'
        }}>
            <Trash2 size={16} />{t("purge_all_local_cache")}</button>
        </div>
      </section>
    </div>;
}
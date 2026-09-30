import { useTranslation } from "react-i18next";
import { useState, useEffect } from 'react';
import { Sprout, MapPin, Leaf, QrCode, Star, CheckCircle, AlertCircle, Search, Camera, ShieldCheck, Award, Filter, RefreshCw, FileText } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { api } from '../api';
import { LoadingGrid, ErrorState } from '../components/LoadingCard';
import { usePreferences } from '../contexts/PreferencesContext';
import { useLocalize } from '../hooks/useLocalize';
function SeedBookingInlineForm({
  supplier,
  onClose
}) {
  const {
    t
  } = useTranslation();
  const [crop, setCrop] = useState(supplier.crops[0] || '');
  const [quantity, setQuantity] = useState('5');
  const [farmerName, setFarmerName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [orderId, setOrderId] = useState('');
  const handleSubmit = e => {
    e.preventDefault();
    setOrderId(`SEED-${Math.floor(100000 + Math.random() * 900000)}`);
    setConfirmed(true);
  };
  return <div className="animate-fade-in" style={{
    marginTop: '1rem',
    padding: '1.25rem',
    background: 'var(--soft-bg)',
    borderRadius: '14px',
    border: '1.5px solid var(--primary)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
  }}>
      <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem',
      borderBottom: '1px solid var(--glass-border)',
      paddingBottom: '0.75rem'
    }}>
        <div>
          <h4 style={{
          fontSize: '1.05rem',
          fontWeight: 700,
          margin: 0,
          color: 'var(--primary)'
        }}>{t("request_seeds")}{supplier.name}</h4>
          <small className="text-muted">{supplier.type} · {supplier.distance}</small>
        </div>
        <button onClick={onClose} style={{
        background: 'none',
        border: 'none',
        color: 'var(--text-muted)',
        cursor: 'pointer',
        padding: '0.2rem'
      }}>
          ✕
        </button>
      </div>

      {confirmed ? <div style={{
      padding: '0.5rem 0',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.75rem'
    }}>
          <CheckCircle size={48} color="var(--primary)" />
          <h4 style={{
        fontSize: '1.2rem',
        fontWeight: 800,
        margin: 0
      }}>{t("seed_order_request_sent")}</h4>
          <p className="text-muted" style={{
        fontSize: '0.85rem',
        lineHeight: 1.5,
        margin: 0
      }}>{t("order_id")}<strong style={{
          color: 'var(--primary)'
        }}>#{orderId}</strong>
            <br />
            <strong>{supplier.name}</strong>{t("will_confirm_availability_and_")}</p>
          <div style={{
        padding: '0.85rem',
        background: 'rgba(16,185,129,0.1)',
        borderRadius: 10,
        border: '1px solid var(--primary)',
        width: '100%',
        textAlign: 'left',
        fontSize: '0.82rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.3rem'
      }}>
            <div>🌱 <strong>{t("seed_variety")}</strong> {crop} ({quantity}{t("bagspackets")}</div>
            <div>📍 <strong>{t("supplier")}</strong> {supplier.name}</div>
            <div>📞 <strong>{t("helpline")}</strong> <a href={`tel:${(supplier.phone || '18001801551').replace(/[^0-9+]/g, '')}`} style={{
            color: 'var(--primary)',
            fontWeight: 700
          }}>{supplier.phone || '1800-180-1551'}</a></div>
          </div>
          <button className="btn-primary" onClick={onClose} style={{
        marginTop: '0.25rem',
        padding: '0.5rem 1.5rem',
        borderRadius: 8,
        fontSize: '0.85rem'
      }}>{t("close_form")}</button>
        </div> : <form onSubmit={handleSubmit} style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.85rem'
    }}>
          <div>
            <label style={{
          fontSize: '0.82rem',
          fontWeight: 600,
          display: 'block',
          marginBottom: '0.35rem'
        }}>{t("select_crop_seed_type")}</label>
            <select value={crop} onChange={e => setCrop(e.target.value)} style={{
          width: '100%',
          padding: '0.55rem 0.75rem',
          borderRadius: 8,
          border: '1px solid var(--glass-border)',
          background: 'var(--control-bg)',
          color: 'var(--text-main)',
          fontSize: '0.85rem'
        }}>
              {supplier.crops.map((c, i) => <option key={i} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label style={{
          fontSize: '0.82rem',
          fontWeight: 600,
          display: 'block',
          marginBottom: '0.35rem'
        }}>{t("quantity_bags_packets")}</label>
            <input type="number" required min="1" value={quantity} onChange={e => setQuantity(e.target.value)} style={{
          width: '100%',
          padding: '0.55rem 0.75rem',
          borderRadius: 8,
          border: '1px solid var(--glass-border)',
          background: 'var(--control-bg)',
          color: 'var(--text-main)',
          fontSize: '0.85rem'
        }} />
          </div>

          <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.5rem'
      }}>
            <input type="text" required placeholder="Farmer Name *" value={farmerName} onChange={e => setFarmerName(e.target.value)} style={{
          padding: '0.55rem 0.75rem',
          borderRadius: 8,
          border: '1px solid var(--glass-border)',
          background: 'var(--control-bg)',
          color: 'var(--text-main)',
          fontSize: '0.85rem'
        }} />
            <input type="tel" required placeholder="Phone Number *" value={phone} onChange={e => setPhone(e.target.value)} style={{
          padding: '0.55rem 0.75rem',
          borderRadius: 8,
          border: '1px solid var(--glass-border)',
          background: 'var(--control-bg)',
          color: 'var(--text-main)',
          fontSize: '0.85rem'
        }} />
          </div>

          <button type="submit" className="btn-primary" style={{
        padding: '0.6rem',
        borderRadius: 8,
        fontWeight: 700,
        fontSize: '0.85rem'
      }}>{t("submit_seed_order_request")}</button>
        </form>}
    </div>;
}
function SeedLocator({
  suppliers
}) {
  const {
    t
  } = useTranslation();
  const [activeSupplierId, setActiveSupplierId] = useState(null);
  const {
    localizeString
  } = useLocalize();
  return <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  }}>
      <div className="glass-panel" style={{
      padding: '1.25rem',
      background: 'rgba(16,185,129,0.06)',
      borderLeft: '3px solid var(--primary)'
    }}>
        <strong style={{
        color: 'var(--primary)'
      }}>{t("nearby_seed_suppliers")}</strong>
        <p className="text-muted" style={{
        fontSize: '0.85rem',
        marginTop: '0.3rem'
      }}>{t("verified_suppliers_near_you_wi")}</p>
      </div>
      {suppliers.map(s => {
      const isExpanded = activeSupplierId === s.id;
      return <div key={s.id} className="glass-card" style={{
        padding: '1.5rem'
      }}>
            <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '0.75rem'
        }}>
              <div style={{
            display: 'flex',
            gap: '0.6rem',
            alignItems: 'center'
          }}>
                <span style={{
              fontSize: '1.6rem'
            }}>{s.icon}</span>
                <div>
                  <div style={{
                fontWeight: 700
              }}>{s.name}</div>
                  <div className="text-muted" style={{
                fontSize: '0.78rem'
              }}>{s.type} · <MapPin size={11} style={{
                  verticalAlign: 'middle'
                }} /> {localizeString(s.distance)}</div>
                </div>
              </div>
              <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
                {s.verified && <span style={{
              padding: '0.2rem 0.5rem',
              borderRadius: 20,
              background: 'rgba(16,185,129,0.15)',
              color: 'var(--primary)',
              fontSize: '0.65rem',
              fontWeight: 700
            }}>{t("verified")}</span>}
                <span style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.2rem',
              color: 'var(--accent)',
              fontSize: '0.82rem'
            }}><Star size={13} fill="var(--accent)" /> {localizeString(s.rating)}</span>
              </div>
            </div>
            <div style={{
          display: 'flex',
          gap: '0.4rem',
          flexWrap: 'wrap',
          marginBottom: '0.5rem'
        }}>
              {s.crops.map((crop, i) => <span key={i} style={{
            padding: '0.2rem 0.5rem',
            borderRadius: '6px',
            background: 'var(--soft-bg)',
            border: '1px solid var(--glass-border)',
            fontSize: '0.72rem'
          }}>{crop}</span>)}
            </div>
            <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '0.5rem',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
              <span style={{
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            color: s.stock_status === 'Available' ? 'var(--primary)' : 'var(--accent)'
          }}>
                {s.stock_status === 'Available' ? <CheckCircle size={13} /> : <AlertCircle size={13} />} {s.stock_status}
              </span>
              <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
                {s.url && <a href={s.url} target="_blank" rel="noopener noreferrer" style={{
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              textDecoration: 'none'
            }}>{t("portal")}</a>}
                <a href={`tel:${(s.phone || '18001801551').replace(/[^0-9+]/g, '')}`} className="btn-ghost" style={{
              padding: '0.35rem 0.8rem',
              fontSize: '0.8rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              color: 'var(--primary)',
              fontWeight: 600
            }}>
                  📞 {s.phone || 'Call Supplier'}
                </a>
                <button onClick={() => setActiveSupplierId(isExpanded ? null : s.id)} style={{
              padding: '0.45rem 0.9rem',
              fontSize: '0.82rem',
              borderRadius: '8px',
              fontWeight: 700,
              border: '1.5px solid var(--primary)',
              background: isExpanded ? 'rgba(16,185,129,0.15)' : 'transparent',
              color: 'var(--primary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}>
                  {isExpanded ? 'Hide Request Form ▲' : 'Book / Request Seeds →'}
                </button>
              </div>
            </div>

            {isExpanded && <SeedBookingInlineForm supplier={s} onClose={() => setActiveSupplierId(null)} />}
          </div>;
    })}
    </div>;
}

/* Feature 2: Indigenous Climate-Resilient Variety & Germplasm Catalog Matcher */
function IndigenousGermplasmMatcher() {
  const {
    t
  } = useTranslation();
  const [soil, setSoil] = useState('all');
  const [rainfall, setRainfall] = useState('all');
  const [stress, setStress] = useState('drought');
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  const {
    localizeString
  } = useLocalize();
  const fetchMatches = async () => {
    setLoading(true);
    try {
      const res = await api.matchGermplasm({
        soil_type: soil,
        rainfall_zone: rainfall,
        stress_factor: stress
      });
      setMatches(res.matches || []);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchMatches();
  }, [stress]);
  return <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  }}>
      <div className="glass-panel" style={{
      padding: '1.25rem',
      background: 'rgba(245,158,11,0.08)',
      borderLeft: '4px solid var(--accent)'
    }}>
        <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        marginBottom: '0.4rem'
      }}>
          <Leaf size={22} color="var(--accent)" />
          <h3 style={{
          margin: 0,
          fontSize: '1.15rem',
          fontWeight: 800
        }}>{t("agrin_germplasm_matcher_climat")}</h3>
        </div>
        <p className="text-muted" style={{
        fontSize: '0.86rem',
        margin: 0,
        lineHeight: 1.5
      }}>{t("traditional_seeds_bred_over_ce")}</p>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-card" style={{
      padding: '1.25rem',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '1rem',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
        <div style={{
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
          <div>
            <label style={{
            fontSize: '0.78rem',
            fontWeight: 700,
            display: 'block',
            marginBottom: '0.3rem',
            color: 'var(--text-muted)'
          }}>{t("primary_climate_stress")}</label>
            <select value={stress} onChange={e => setStress(e.target.value)} style={{
            padding: '0.5rem 0.8rem',
            borderRadius: 8,
            border: '1px solid var(--glass-border)',
            background: 'var(--soft-bg)',
            color: 'var(--text-main)',
            fontSize: '0.85rem',
            fontWeight: 700
          }}>
              <option value="drought">{t("severe_drought_resilience")}</option>
              <option value="flood">{t("flood_submergence_resistance")}</option>
              <option value="heat">{t("extreme_heat_salinity_toleranc")}</option>
            </select>
          </div>

          <div>
            <label style={{
            fontSize: '0.78rem',
            fontWeight: 700,
            display: 'block',
            marginBottom: '0.3rem',
            color: 'var(--text-muted)'
          }}>{t("soil_texture")}</label>
            <select value={soil} onChange={e => setSoil(e.target.value)} style={{
            padding: '0.5rem 0.8rem',
            borderRadius: 8,
            border: '1px solid var(--glass-border)',
            background: 'var(--soft-bg)',
            color: 'var(--text-main)',
            fontSize: '0.85rem'
          }}>
              <option value="all">{t("all_soils")}</option>
              <option value="black">{t("black_cotton_soil")}</option>
              <option value="clay">{t("clay_alluvial")}</option>
              <option value="sandy">{t("sandy_loam")}</option>
            </select>
          </div>
        </div>

        <button onClick={fetchMatches} disabled={loading} className="btn-primary" style={{
        padding: '0.55rem 1.25rem',
        borderRadius: 8,
        fontSize: '0.85rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem'
      }}>
          <Filter size={15} /> {loading ? 'Matching...' : 'Filter Germplasm'}
        </button>
      </div>

      {/* Catalog Grid */}
      <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
      gap: '1.25rem'
    }}>
        {matches.map(v => <div key={v.id} className="glass-card" style={{
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
            <div>
              <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '0.75rem'
          }}>
                <div>
                  <h4 style={{
                fontSize: '1.1rem',
                fontWeight: 800,
                margin: 0
              }}>{v.name}</h4>
                  <small className="text-muted" style={{
                fontSize: '0.78rem'
              }}>{t("id")}{localizeString(v.id)} · {v.recommended_zone}</small>
                </div>
                <span style={{
              padding: '0.2rem 0.55rem',
              borderRadius: 12,
              background: 'rgba(245,158,11,0.15)',
              color: 'var(--accent)',
              fontSize: '0.7rem',
              fontWeight: 800
            }}>{t("resilience_score")}{localizeString(v.drought_score)}{t("10")}</span>
              </div>

              <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
            marginBottom: '1rem'
          }}>
                {v.adaptation_traits.map((t, idx) => <div key={idx} style={{
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--primary)'
            }}>
                    <CheckCircle size={13} /> {t}
                  </div>)}
              </div>

              <div style={{
            padding: '0.75rem',
            background: 'var(--soft-bg)',
            borderRadius: 8,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.5rem',
            fontSize: '0.8rem',
            marginBottom: '1rem'
          }}>
                <div><span className="text-muted" style={{
                fontSize: '0.7rem'
              }}>{t("expected_yield")}</span><br /><strong>{localizeString(v.yield_potential)}</strong></div>
                <div><span className="text-muted" style={{
                fontSize: '0.7rem'
              }}>{t("seed_bank_vault")}</span><br /><strong style={{
                color: 'var(--primary)'
              }}>{v.seed_bank_source}</strong></div>
              </div>
            </div>

            <button onClick={() => setActiveItem(activeItem === v.id ? null : v.id)} className="btn-ghost" style={{
          width: '100%',
          padding: '0.55rem',
          borderRadius: 8,
          border: '1.5px solid var(--primary)',
          color: 'var(--primary)',
          fontWeight: 700,
          fontSize: '0.83rem',
          cursor: 'pointer'
        }}>
              {activeItem === v.id ? 'Close Details ▲' : 'View Genetic Specs & Order →'}
            </button>

            {activeItem === v.id && <div className="animate-fade-in" style={{
          marginTop: '0.85rem',
          padding: '0.85rem',
          background: 'rgba(16,185,129,0.08)',
          borderRadius: 8,
          fontSize: '0.8rem'
        }}>
                <div>🌱 <strong>{t("soil_type")}</strong> {v.soil}</div>
                <div>🌧️ <strong>{t("rainfall_window")}</strong> {v.rainfall}</div>
                <div style={{
            marginTop: '0.5rem',
            color: 'var(--primary)',
            fontWeight: 700
          }}>{t("order_id_reserved_with")}{v.seed_bank_source}{t("call_helpline_18001801551_to_c")}</div>
              </div>}
          </div>)}
      </div>
    </div>;
}

/* Feature 1: Camera-Based Input Authenticity & QR Batch Anti-Counterfeit Scanner */
function InputAuthenticityScanner() {
  const {
    t
  } = useTranslation();
  const [code, setCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const handleVerify = async (batchToVerify = code) => {
    if (!batchToVerify.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await api.verifyBatch(batchToVerify);
      setResult(res.result);
    } catch {
      setResult({
        status: 'suspicious',
        warning: 'Network timeout during AGRIN database query. Please check your batch serial number.'
      });
    } finally {
      setLoading(false);
    }
  };
  const handleSimulateCameraScan = sampleCode => {
    setCode(sampleCode);
    setScanning(false);
    handleVerify(sampleCode);
  };
  return <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  }}>
      <div className="glass-panel" style={{
      padding: '1.25rem',
      background: 'rgba(223,48,48,0.06)',
      borderLeft: '4px solid var(--danger)'
    }}>
        <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        marginBottom: '0.3rem'
      }}>
          <ShieldCheck size={22} color="var(--danger)" />
          <h3 style={{
          margin: 0,
          fontSize: '1.15rem',
          fontWeight: 800
        }}>{t("camera_qr_batch_anticounterfei")}</h3>
        </div>
        <p className="text-muted" style={{
        fontSize: '0.85rem',
        margin: 0,
        lineHeight: 1.5
      }}>{t("verify_seed_bags_biopesticides")}</p>
      </div>

      {/* Camera Reticle Viewfinder Simulation */}
      {scanning && <div className="glass-card animate-fade-in" style={{
      padding: '1.5rem',
      textAlign: 'center',
      background: '#090d16',
      border: '2px dashed var(--primary)',
      borderRadius: 16
    }}>
          <div style={{
        width: '100%',
        height: '180px',
        border: '2px solid var(--primary)',
        borderRadius: 12,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: 'rgba(16,185,129,0.05)'
      }}>
            <Camera size={40} color="var(--primary)" className="animate-pulse" />
            <p style={{
          color: '#fff',
          fontSize: '0.85rem',
          marginTop: '0.5rem',
          fontWeight: 600
        }}>{t("align_packaging_qr_code_inside")}</p>
            <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'var(--primary)',
          boxShadow: '0 0 12px var(--primary)'
        }} />
          </div>

          <p className="text-muted" style={{
        fontSize: '0.78rem',
        marginTop: '0.75rem'
      }}>{t("tap_a_sample_qr_batch_tag_belo")}</p>
          <div style={{
        display: 'flex',
        gap: '0.5rem',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginTop: '0.5rem'
      }}>
            {['DAP-2026-8891', 'BT-COTTON-904', 'BIO-NPK-552'].map(sample => <button key={sample} onClick={() => handleSimulateCameraScan(sample)} style={{
          padding: '0.35rem 0.75rem',
          borderRadius: 20,
          background: 'rgba(16,185,129,0.2)',
          border: '1px solid var(--primary)',
          color: 'var(--primary)',
          fontSize: '0.78rem',
          fontWeight: 700,
          cursor: 'pointer'
        }}>{t("scan_sample")}{sample}
              </button>)}
          </div>

          <button onClick={() => setScanning(false)} style={{
        marginTop: '1rem',
        background: 'none',
        border: 'none',
        color: 'var(--text-muted)',
        cursor: 'pointer',
        fontSize: '0.82rem'
      }}>{t("cancel_camera_scan")}</button>
        </div>}

      {/* Manual Input Search Bar */}
      <div className="glass-card" style={{
      padding: '1.5rem',
      display: 'flex',
      gap: '0.75rem',
      alignItems: 'center',
      flexWrap: 'wrap'
    }}>
        <input value={code} onChange={e => setCode(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleVerify()} placeholder="Enter QR payload or Batch # (e.g. DAP-2026-8891)..." style={{
        flex: 1,
        minWidth: '220px',
        padding: '0.75rem 1rem',
        borderRadius: '10px',
        border: '1px solid var(--glass-border)',
        background: 'var(--soft-bg)',
        color: 'var(--text-main)',
        fontSize: '0.9rem',
        outline: 'none'
      }} />

        <button onClick={() => setScanning(true)} className="btn-ghost" style={{
        padding: '0.75rem 1.25rem',
        borderRadius: '10px',
        border: '1.5px solid var(--primary)',
        color: 'var(--primary)',
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        cursor: 'pointer'
      }}>
          <Camera size={18} />{t("open_camera_scanner")}</button>

        <button onClick={() => handleVerify()} disabled={loading} className="btn-primary" style={{
        padding: '0.75rem 1.5rem',
        borderRadius: '10px',
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem'
      }}>
          <Search size={18} /> {loading ? 'Verifying...' : 'Verify AGRIN DB'}
        </button>
      </div>

      {/* Verification Result Modal Card */}
      {result && <div className="glass-card animate-fade-in" style={{
      padding: '1.5rem',
      borderLeft: `5px solid ${result.status === 'genuine' ? 'var(--primary)' : 'var(--danger)'}`
    }}>
          {result.status === 'genuine' ? <div>
              <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
          borderBottom: '1px solid var(--glass-border)',
          paddingBottom: '0.75rem'
        }}>
                <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--primary)',
            fontWeight: 800,
            fontSize: '1.2rem'
          }}>
                  <CheckCircle size={24} />{t("verified_genuine_product")}</div>
                <span style={{
            fontSize: '0.72rem',
            padding: '0.2rem 0.6rem',
            borderRadius: 12,
            background: 'rgba(16,185,129,0.15)',
            color: 'var(--primary)',
            fontWeight: 800
          }}>{t("agrin_registry_id")}{result.agrin_registry_id}
                </span>
              </div>

              <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1rem'
        }}>
                <div><span className="text-muted" style={{
              fontSize: '0.72rem'
            }}>{t("product_name")}</span><div style={{
              fontWeight: 700,
              fontSize: '0.95rem'
            }}>{result.product_name}</div></div>
                <div><span className="text-muted" style={{
              fontSize: '0.72rem'
            }}>{t("brand_manufacturer")}</span><div style={{
              fontWeight: 700,
              fontSize: '0.95rem'
            }}>{result.brand}</div></div>
                <div><span className="text-muted" style={{
              fontSize: '0.72rem'
            }}>{t("manufacturing_expiry")}</span><div style={{
              fontWeight: 600,
              fontSize: '0.88rem'
            }}>{result.mfg_date} / {result.expiry_date}</div></div>
                <div><span className="text-muted" style={{
              fontSize: '0.72rem'
            }}>{t("official_license_number")}</span><div style={{
              fontWeight: 600,
              fontSize: '0.88rem'
            }}>{result.license_no}</div></div>
              </div>

              <div style={{
          padding: '0.85rem',
          background: 'var(--soft-bg)',
          borderRadius: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem',
          fontSize: '0.82rem'
        }}>
                <div>🔬 <strong>{t("lab_test_status")}</strong> <span style={{
              color: 'var(--primary)',
              fontWeight: 700
            }}>{result.lab_test_status}</span></div>
                <div>🔐 <strong>{t("cryptographic_digital_signatur")}</strong> <code>{result.hash_signature}</code></div>
                <div>🏬 <strong>{t("authorized_dealer")}</strong> {result.dealer_name}</div>
              </div>
            </div> : <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        color: 'var(--danger)'
      }}>
              <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontWeight: 800,
          fontSize: '1.2rem'
        }}>
                <AlertCircle size={24} />{t("suspicious_unverified_product")}</div>
              <p style={{
          fontSize: '0.9rem',
          margin: 0,
          lineHeight: 1.5
        }}>{result.warning}</p>
              <div style={{
          fontSize: '0.82rem',
          fontWeight: 700,
          background: 'rgba(223,48,48,0.1)',
          padding: '0.75rem',
          borderRadius: 8
        }}>{t("report_illegal_counterfeit_inp")}<strong>{result.report_helpline}</strong>
              </div>
            </div>}
        </div>}
    </div>;
}

/* Feature 4: Organic Input & Bio-Fertilizer Quality Certification Network */
function CertifiedOrganicMarketplace() {
  const {
    t
  } = useTranslation();
  const [certifiedItems, setCertifiedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLabReport, setSelectedLabReport] = useState(null);
  const {
    localizeString
  } = useLocalize();
  useEffect(() => {
    api.organicCertified().then(res => setCertifiedItems(res || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);
  return <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  }}>
      <div className="glass-panel" style={{
      padding: '1.25rem',
      background: 'rgba(16,185,129,0.06)',
      borderLeft: '4px solid var(--primary)'
    }}>
        <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        marginBottom: '0.3rem'
      }}>
          <Award size={22} color="var(--primary)" />
          <h3 style={{
          margin: 0,
          fontSize: '1.15rem',
          fontWeight: 800
        }}>{t("npop_pgsindia_certified_organi")}</h3>
        </div>
        <p className="text-muted" style={{
        fontSize: '0.85rem',
        margin: 0,
        lineHeight: 1.5
      }}>{t("peerreviewed_labtested_biofert")}</p>
      </div>

      {loading ? <LoadingGrid count={3} cols={1} /> : <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem'
    }}>
          {certifiedItems.map(item => <div key={item.id} className="glass-card" style={{
        padding: '1.5rem'
      }}>
              <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '0.5rem',
          marginBottom: '0.75rem'
        }}>
                <div>
                  <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
                    <h4 style={{
                fontSize: '1.1rem',
                fontWeight: 800,
                margin: 0
              }}>{item.name}</h4>
                    <span style={{
                padding: '0.2rem 0.6rem',
                borderRadius: 20,
                background: 'rgba(16,185,129,0.15)',
                color: 'var(--primary)',
                fontSize: '0.72rem',
                fontWeight: 800
              }}>
                      {item.badge}
                    </span>
                  </div>
                  <small className="text-muted" style={{
              fontSize: '0.78rem'
            }}>{item.category}{t("certification")}{localizeString(item.cert_no)}</small>
                </div>
                <div style={{
            textAlign: 'right'
          }}>
                  <span style={{
              fontSize: '1.25rem',
              fontWeight: 900,
              color: 'var(--primary)'
            }}>{localizeString(item.price)}</span>
                  <div style={{
              fontSize: '0.72rem',
              color: 'var(--accent)',
              fontWeight: 700
            }}>★ {localizeString(item.rating)}{t("rating")}</div>
                </div>
              </div>

              <div style={{
          padding: '0.85rem',
          background: 'var(--soft-bg)',
          borderRadius: 10,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.75rem',
          fontSize: '0.8rem',
          marginBottom: '1rem'
        }}>
                <div><span className="text-muted" style={{
              fontSize: '0.7rem'
            }}>{t("npop_accreditation")}</span><br /><strong>{item.certification}</strong></div>
                <div><span className="text-muted" style={{
              fontSize: '0.7rem'
            }}>{t("seller_cooperative")}</span><br /><strong>{item.seller}</strong></div>
                <div><span className="text-muted" style={{
              fontSize: '0.7rem'
            }}>{t("shg_group_discount")}</span><br /><strong style={{
              color: 'var(--accent)'
            }}>{localizeString(item.bulk_discount)}</strong></div>
              </div>

              <div style={{
          display: 'flex',
          gap: '0.75rem',
          flexWrap: 'wrap'
        }}>
                <button onClick={() => setSelectedLabReport(selectedLabReport === item.id ? null : item.id)} className="btn-ghost" style={{
            padding: '0.5rem 1rem',
            borderRadius: 8,
            border: '1.5px solid var(--primary)',
            color: 'var(--primary)',
            fontWeight: 700,
            fontSize: '0.82rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}>
                  <FileText size={15} /> {selectedLabReport === item.id ? 'Hide Lab Certificate ▲' : 'View Accredited Lab Report →'}
                </button>
              </div>

              {selectedLabReport === item.id && <div className="animate-fade-in" style={{
          marginTop: '1rem',
          padding: '1rem',
          background: 'rgba(16,185,129,0.08)',
          borderRadius: 10,
          border: '1px solid var(--primary)',
          fontSize: '0.83rem'
        }}>
                  <h5 style={{
            margin: '0 0 0.5rem 0',
            fontWeight: 800,
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}>{t("accredited_laboratory_certific")}{item.lab_test_report.lab_name})
                  </h5>
                  <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '0.5rem'
          }}>
                    {Object.entries(item.lab_test_report).map(([k, v]) => k !== 'lab_name' && <div key={k} style={{
              background: 'var(--control-bg)',
              padding: '0.4rem 0.6rem',
              borderRadius: 6
            }}>
                          <span className="text-muted" style={{
                fontSize: '0.7rem',
                textTransform: 'capitalize'
              }}>{k.replace('_', ' ')}:</span>
                          <div style={{
                fontWeight: 700,
                color: 'var(--text-main)'
              }}>{localizeString(v)}</div>
                        </div>)}
                  </div>
                </div>}
            </div>)}
        </div>}
    </div>;
}
export default function SeedsHub() {
  const {
    t
  } = useTranslation();
  const [tab, setTab] = useState(0);
  const {
    preferences
  } = usePreferences();
  
  const {
    data,
    loading,
    error,
    refetch
  } = useApi(() => api.seeds(), [preferences.location.latitude, preferences.location.longitude]);
  return <div className="animate-fade-in" style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem'
  }}>
      <header>
        <h1 style={{
        fontSize: '2.5rem',
        marginBottom: '0.4rem'
      }}>
          <Sprout size={30} style={{
          verticalAlign: 'middle',
          marginRight: '0.5rem',
          color: 'var(--primary)'
        }} />
          {t('seedsAndInputs', 'Seeds & Inputs Network')}
        </h1>
        <p className="text-muted">{t("verified_seed_locator_anticoun")}</p>
      </header>

      <div className="hub-tabs" style={{
      flexWrap: 'wrap'
    }}>
        {['Nearby Seed Locator', '🛡️ Anti-Counterfeit Scanner', '🧬 Indigenous Germplasm', '🧪 Certified Organic Inputs'].map((t, i) => {
        const Icon = [MapPin, QrCode, Leaf, Award][i];
        return <button key={t} className={`hub-tab ${tab === i ? 'hub-tab-active' : ''}`} onClick={() => setTab(i)}>
              <Icon size={16} /> {t}
            </button>;
      })}
      </div>

      {loading && !data ? <LoadingGrid count={4} cols={2} /> : error ? <ErrorState message={error} onRetry={refetch} /> : <>
          {tab === 0 && <SeedLocator suppliers={data.suppliers} />}
          {tab === 1 && <InputAuthenticityScanner />}
          {tab === 2 && <IndigenousGermplasmMatcher />}
          {tab === 3 && <CertifiedOrganicMarketplace />}
        </>}
    </div>;
}
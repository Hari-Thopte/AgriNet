import { useState } from 'react';
import { CreditCard, ShoppingBag, Shield, Star, ChevronDown, ChevronUp, CheckCircle, Clock, IndianRupee, ShoppingCart, Plus, Minus, Trash2, X, CheckCircle2, Truck } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { api } from '../api';
import { LoadingGrid, ErrorState } from '../components/LoadingCard';
import { usePreferences } from '../contexts/PreferencesContext';
import { useTranslation } from 'react-i18next';
const TAB_ICONS = [CreditCard, ShoppingBag, Shield];
function parsePrice(priceStr) {
  if (!priceStr) return 0;
  const match = String(priceStr).replace(/,/g, '').match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}
function CreditApplicationInlineForm({
  scheme,
  onClose
}) {
  const {
    t
  } = useTranslation();
  const [requestedAmount, setRequestedAmount] = useState('100000');
  const [farmerName, setFarmerName] = useState('');
  const [phone, setPhone] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [appId, setAppId] = useState('');
  const handleSubmit = e => {
    e.preventDefault();
    setAppId(`LOAN-${Math.floor(100000 + Math.random() * 900000)}`);
    setSubmitted(true);
  };
  return <div className="animate-fade-in" style={{
    marginTop: '1rem',
    padding: '1.25rem',
    background: 'var(--soft-bg)',
    borderRadius: '14px',
    border: '1.5px solid var(--primary)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
  }} onClick={e => e.stopPropagation()}>
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
        }}>{t("apply_for")}{scheme.name}</h4>
          <small className="text-muted">{scheme.provider}{t("max")}{scheme.max_amount}</small>
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

      {submitted ? <div style={{
      padding: '0.5rem 0',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.75rem'
    }}>
          <CheckCircle2 size={48} color="var(--primary)" />
          <h4 style={{
        fontSize: '1.2rem',
        fontWeight: 800,
        margin: 0
      }}>{t("loan_preapplication_submitted")}</h4>
          <p className="text-muted" style={{
        fontSize: '0.85rem',
        lineHeight: 1.5,
        margin: 0
      }}>{t("application_id")}<strong style={{
          color: 'var(--primary)'
        }}>#{appId}</strong>
            <br />
            <strong>{scheme.provider}</strong>{t("agri_desk_will_initiate_docume")}{scheme.processing_days}{t("business_days")}</p>
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
            <div>💰 <strong>{t("requested_credit")}</strong> ₹{parseInt(requestedAmount || '0').toLocaleString()}</div>
            <div>📉 <strong>{t("interest_rate")}</strong> {scheme.interest}</div>
            <div>📄 <strong>{t("required_docs")}</strong> {scheme.documents.join(', ')}</div>
            {scheme.url && <div>🌐 <strong>{t("official_portal")}</strong> <a href={scheme.url} target="_blank" rel="noopener noreferrer" style={{
            color: 'var(--primary)',
            textDecoration: 'underline'
          }}>{scheme.url}</a></div>}
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
        }}>{t("loan_amount_needed")}</label>
            <input type="number" required min="5000" step="5000" value={requestedAmount} onChange={e => setRequestedAmount(e.target.value)} style={{
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
            <input type="text" required placeholder="Full Farmer Name *" value={farmerName} onChange={e => setFarmerName(e.target.value)} style={{
          padding: '0.55rem 0.75rem',
          borderRadius: 8,
          border: '1px solid var(--glass-border)',
          background: 'var(--control-bg)',
          color: 'var(--text-main)',
          fontSize: '0.85rem'
        }} />
            <input type="tel" required placeholder="Mobile Phone Number *" value={phone} onChange={e => setPhone(e.target.value)} style={{
          padding: '0.55rem 0.75rem',
          borderRadius: 8,
          border: '1px solid var(--glass-border)',
          background: 'var(--control-bg)',
          color: 'var(--text-main)',
          fontSize: '0.85rem'
        }} />
          </div>

          <input type="text" required placeholder="Aadhaar / Land Registration Number *" value={aadhaar} onChange={e => setAadhaar(e.target.value)} style={{
        padding: '0.55rem 0.75rem',
        borderRadius: 8,
        border: '1px solid var(--glass-border)',
        background: 'var(--control-bg)',
        color: 'var(--text-main)',
        fontSize: '0.85rem'
      }} />

          <button type="submit" className="btn-primary" style={{
        padding: '0.65rem',
        borderRadius: 8,
        fontWeight: 700,
        fontSize: '0.88rem',
        marginTop: '0.2rem'
      }}>{t("submit_loan_application")}</button>
        </form>}
    </div>;
}
function CreditLink({
  credit,
  t,
  localizeString
}) {
  const [expanded, setExpanded] = useState(null);
  const [activeAppId, setActiveAppId] = useState(null);
  const STATUS = {
    eligible: {
      color: 'var(--primary)',
      label: 'Eligible',
      icon: <CheckCircle size={13} />
    },
    check_group: {
      color: 'var(--accent)',
      label: 'Check Group Status',
      icon: <Clock size={13} />
    }
  };
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
      }}>🏦 {t('creditLoanMatching', 'Credit & Loan Matching')}</strong>
        <p className="text-muted" style={{
        fontSize: '0.85rem',
        marginTop: '0.3rem'
      }}>{t('personalizedFinancing', 'Personalized financing options matched to your farm profile and location.')}</p>
      </div>
      {credit.map(scheme => {
      const isOpen = expanded === scheme.id;
      const isAppFormOpen = activeAppId === scheme.id;
      const cfg = STATUS[scheme.status] || STATUS.eligible;
      return <div key={scheme.id} className="glass-card" style={{
        padding: '1.5rem',
        cursor: 'pointer'
      }} onClick={() => setExpanded(isOpen ? null : scheme.id)}>
            <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
              <div style={{
            display: 'flex',
            gap: '0.8rem',
            alignItems: 'center'
          }}>
                <span style={{
              fontSize: '1.8rem'
            }}>{scheme.icon}</span>
                <div>
                  <div style={{
                fontWeight: 700,
                fontSize: '1.05rem'
              }}>{scheme.name}</div>
                  <div className="text-muted" style={{
                fontSize: '0.8rem'
              }}>{scheme.provider}</div>
                </div>
              </div>
              <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
                <span style={{
              padding: '0.25rem 0.6rem',
              borderRadius: 20,
              background: `${cfg.color}22`,
              color: cfg.color,
              fontSize: '0.7rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}>{cfg.icon} {cfg.label}</span>
                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </div>
            <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
          marginTop: '1rem'
        }}>
              <div><div className="text-muted" style={{
              fontSize: '0.75rem'
            }}>{t('maxAmount', 'Max Amount')}</div><div style={{
              fontWeight: 700,
              color: 'var(--primary)'
            }}>{localizeString ? localizeString(scheme.max_amount) : scheme.max_amount}</div></div>
              <div><div className="text-muted" style={{
              fontSize: '0.75rem'
            }}>{t('interestRate', 'Interest Rate')}</div><div style={{
              fontWeight: 600
            }}>{localizeString ? localizeString(scheme.interest) : scheme.interest}</div></div>
              <div><div className="text-muted" style={{
              fontSize: '0.75rem'
            }}>{t('processing', 'Processing')}</div><div style={{
              fontWeight: 600
            }}>{localizeString ? localizeString(scheme.processing_days) : scheme.processing_days} {t('days', 'days')}</div></div>
            </div>
            {isOpen && <div className="animate-fade-in" style={{
          marginTop: '1rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--glass-border)'
        }}>
                <div style={{
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '0.5rem'
          }}>{t("documents_required")}</div>
                <ul style={{
            paddingLeft: '1.2rem',
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            lineHeight: 1.8
          }}>
                  {scheme.documents.map((doc, i) => <li key={i}>{doc}</li>)}
                </ul>
                <div className="text-muted" style={{
            fontSize: '0.8rem',
            marginTop: '0.75rem'
          }}>
                  <strong>{t("eligibility")}</strong> {scheme.eligibility}
                </div>
                
                <div style={{
            display: 'flex',
            gap: '0.75rem',
            marginTop: '1rem',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
                  <button onClick={e => {
              e.stopPropagation();
              setActiveAppId(isAppFormOpen ? null : scheme.id);
            }} style={{
              padding: '0.55rem 1.3rem',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.85rem',
              border: '1.5px solid var(--primary)',
              background: isAppFormOpen ? 'rgba(16,185,129,0.15)' : 'var(--primary)',
              color: isAppFormOpen ? 'var(--primary)' : '#fff',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}>
                    {isAppFormOpen ? 'Hide Application Form ▲' : 'Apply Now →'}
                  </button>

                  {scheme.url && <a href={scheme.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{
              fontSize: '0.82rem',
              color: 'var(--primary)',
              fontWeight: 600,
              textDecoration: 'underline'
            }}>{t("official_bank_portal")}</a>}
                </div>

                {isAppFormOpen && <CreditApplicationInlineForm scheme={scheme} onClose={() => setActiveAppId(null)} />}
              </div>}
          </div>;
    })}
    </div>;
}
function InsuranceEnrollInlineForm({
  plan,
  onClose
}) {
  const {
    t
  } = useTranslation();
  const [cropArea, setCropArea] = useState('2');
  const [cropName, setCropName] = useState('Wheat');
  const [farmerName, setFarmerName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [policyNo, setPolicyNo] = useState('');
  const handleSubmit = e => {
    e.preventDefault();
    setPolicyNo(`PMFBY-${Math.floor(100000 + Math.random() * 900000)}`);
    setConfirmed(true);
  };
  return <div className="animate-fade-in" style={{
    marginTop: '1rem',
    padding: '1.25rem',
    background: 'var(--soft-bg)',
    borderRadius: '14px',
    border: '1.5px solid var(--primary)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
  }} onClick={e => e.stopPropagation()}>
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
        }}>{t("enroll_in")}{plan.name}</h4>
          <small className="text-muted">{plan.provider} · {plan.season}</small>
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
          <CheckCircle2 size={48} color="var(--primary)" />
          <h4 style={{
        fontSize: '1.2rem',
        fontWeight: 800,
        margin: 0
      }}>{t("insurance_policy_enrolled")}</h4>
          <p className="text-muted" style={{
        fontSize: '0.85rem',
        lineHeight: 1.5,
        margin: 0
      }}>{t("policy_number")}<strong style={{
          color: 'var(--primary)'
        }}>#{policyNo}</strong>
            <br />{t("your")}<strong>{cropName}</strong>{t("crop")}{cropArea}{t("acres_is_now_insured_against_w")}</p>
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
            <div>🛡️ <strong>{t("plan")}</strong> {plan.name}</div>
            <div>💰 <strong>{t("premium_rate")}</strong> {plan.premium}</div>
            <div>⚡ <strong>{t("claim_trigger")}</strong> {plan.claim_trigger}</div>
            {plan.url && <div>🌐 <strong>{t("government_portal")}</strong> <a href={plan.url} target="_blank" rel="noopener noreferrer" style={{
            color: 'var(--primary)',
            textDecoration: 'underline'
          }}>{plan.url}</a></div>}
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
          <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.5rem'
      }}>
            <div>
              <label style={{
            fontSize: '0.82rem',
            fontWeight: 600,
            display: 'block',
            marginBottom: '0.35rem'
          }}>{t("insured_crop_name")}</label>
              <input type="text" required value={cropName} onChange={e => setCropName(e.target.value)} style={{
            width: '100%',
            padding: '0.55rem 0.75rem',
            borderRadius: 8,
            border: '1px solid var(--glass-border)',
            background: 'var(--control-bg)',
            color: 'var(--text-main)',
            fontSize: '0.85rem'
          }} />
            </div>
            <div>
              <label style={{
            fontSize: '0.82rem',
            fontWeight: 600,
            display: 'block',
            marginBottom: '0.35rem'
          }}>{t("land_area_acres")}</label>
              <input type="number" required min="0.5" step="0.5" value={cropArea} onChange={e => setCropArea(e.target.value)} style={{
            width: '100%',
            padding: '0.55rem 0.75rem',
            borderRadius: 8,
            border: '1px solid var(--glass-border)',
            background: 'var(--control-bg)',
            color: 'var(--text-main)',
            fontSize: '0.85rem'
          }} />
            </div>
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
        padding: '0.65rem',
        borderRadius: 8,
        fontWeight: 700,
        fontSize: '0.88rem',
        marginTop: '0.2rem'
      }}>{t("submit_policy_enrollment")}</button>
        </form>}
    </div>;
}
function InsuranceIntegration({
  insurance,
  localizeString
}) {
  const {
    t
  } = useTranslation();
  const [activeEnrollId, setActiveEnrollId] = useState(null);
  const STATUS = {
    enrolling: {
      color: 'var(--accent)',
      label: 'Enrolling Now'
    },
    active: {
      color: 'var(--primary)',
      label: 'Active'
    },
    available: {
      color: 'var(--secondary)',
      label: 'Available'
    }
  };
  return <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  }}>
      <div className="glass-panel" style={{
      padding: '1.25rem',
      background: 'rgba(59,130,246,0.06)',
      borderLeft: '3px solid var(--secondary)'
    }}>
        <strong style={{
        color: 'var(--secondary)'
      }}>{t("weatherindexed_crop_insurance")}</strong>
        <p className="text-muted" style={{
        fontSize: '0.85rem',
        marginTop: '0.3rem'
      }}>{t("automated_claims_triggered_by_")}</p>
      </div>
      {insurance.map(plan => {
      const cfg = STATUS[plan.status] || STATUS.available;
      const isExpanded = activeEnrollId === plan.id;
      return <div key={plan.id} className="glass-card" style={{
        padding: '1.5rem'
      }}>
            <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '1rem'
        }}>
              <div style={{
            display: 'flex',
            gap: '0.8rem',
            alignItems: 'center'
          }}>
                <span style={{
              fontSize: '1.8rem'
            }}>{plan.icon}</span>
                <div>
                  <div style={{
                fontWeight: 700,
                fontSize: '1.05rem'
              }}>{plan.name}</div>
                  <div className="text-muted" style={{
                fontSize: '0.8rem'
              }}>{plan.provider} · {plan.season}</div>
                </div>
              </div>
              <span style={{
            padding: '0.25rem 0.6rem',
            borderRadius: 20,
            background: `${cfg.color}22`,
            color: cfg.color,
            fontSize: '0.7rem',
            fontWeight: 700
          }}>{cfg.label}</span>
            </div>
            <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem'
        }}>
              <div><div className="text-muted" style={{
              fontSize: '0.75rem'
            }}>{t("premium")}</div><div style={{
              fontWeight: 600,
              fontSize: '0.95rem'
            }}>{localizeString ? localizeString(plan.premium) : plan.premium}</div></div>
              <div><div className="text-muted" style={{
              fontSize: '0.75rem'
            }}>{t("coverage")}</div><div style={{
              fontWeight: 600,
              fontSize: '0.95rem'
            }}>{localizeString ? localizeString(plan.coverage) : plan.coverage}</div></div>
            </div>
            <div style={{
          marginTop: '0.75rem',
          padding: '0.6rem 0.8rem',
          background: 'rgba(16,185,129,0.08)',
          borderRadius: '8px',
          fontSize: '0.82rem'
        }}>
              <strong>{t("claim_trigger")}</strong> {plan.claim_trigger}
            </div>

            <div style={{
          display: 'flex',
          gap: '0.75rem',
          marginTop: '1rem',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
              <button onClick={() => setActiveEnrollId(isExpanded ? null : plan.id)} style={{
            padding: '0.55rem 1.3rem',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.85rem',
            border: '1.5px solid var(--primary)',
            background: isExpanded ? 'rgba(16,185,129,0.15)' : 'var(--primary)',
            color: isExpanded ? 'var(--primary)' : '#fff',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}>
                {isExpanded ? 'Hide Enrollment Form ▲' : 'Enroll Now →'}
              </button>

              {plan.url && <a href={plan.url} target="_blank" rel="noopener noreferrer" style={{
            fontSize: '0.82rem',
            color: 'var(--primary)',
            fontWeight: 600,
            textDecoration: 'underline'
          }}>{t("pmfby_official_site")}</a>}
            </div>

            {isExpanded && <InsuranceEnrollInlineForm plan={plan} onClose={() => setActiveEnrollId(null)} />}
          </div>;
    })}
    </div>;
}
function ItemOrderInlineForm({
  item,
  onClose,
  onAddToCart
}) {
  const {
    t
  } = useTranslation();
  const [qty, setQty] = useState(1);
  const [farmerName, setFarmerName] = useState('');
  const [phone, setPhone] = useState('');
  const [village, setVillage] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [orderId, setOrderId] = useState('');
  const unitPrice = parsePrice(item.price);
  const totalPrice = unitPrice * qty;
  const handleConfirm = e => {
    e.preventDefault();
    setOrderId(`ORD-${Math.floor(100000 + Math.random() * 900000)}`);
    setConfirmed(true);
    onAddToCart({
      ...item,
      qty
    });
  };
  return <div className="animate-fade-in" style={{
    marginTop: '1rem',
    padding: '1.25rem',
    background: 'var(--soft-bg)',
    borderRadius: '14px',
    border: '1.5px solid var(--primary)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
  }} onClick={e => e.stopPropagation()}>
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
        }}>{t("order")}{item.name}</h4>
          <small className="text-muted">{item.seller} · {item.location}</small>
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
          <CheckCircle2 size={48} color="var(--primary)" />
          <h4 style={{
        fontSize: '1.2rem',
        fontWeight: 800,
        margin: 0
      }}>{t("input_order_placed")}</h4>
          <p className="text-muted" style={{
        fontSize: '0.85rem',
        lineHeight: 1.5,
        margin: 0
      }}>{t("order_id")}<strong style={{
          color: 'var(--primary)'
        }}>#{orderId}</strong>
            <br />{t("supplier")}<strong>{item.seller}</strong>{t("will_deliver_to")}<strong>{village}</strong>{t("within_2_business_days")}</p>
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
            <div>📦 <strong>{t("product")}</strong> {item.name} ({qty}{t("units")}</div>
            <div>💰 <strong>{t("total_amount")}</strong> ₹{totalPrice.toLocaleString()}</div>
            <div>🏷️ <strong>{t("discount_applied")}</strong> {item.group_discount}</div>
          </div>
          <button className="btn-primary" onClick={onClose} style={{
        marginTop: '0.25rem',
        padding: '0.5rem 1.5rem',
        borderRadius: 8,
        fontSize: '0.85rem'
      }}>{t("close_form")}</button>
        </div> : <form onSubmit={handleConfirm} style={{
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
        }}>{t("quantity")}</label>
            <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.8rem'
        }}>
              <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))} style={{
            padding: '0.35rem 0.7rem',
            borderRadius: 6,
            border: '1px solid var(--glass-border)',
            background: 'var(--control-bg)',
            color: 'var(--text-main)',
            fontSize: '1rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}>
                -
              </button>
              <span style={{
            fontSize: '1.05rem',
            fontWeight: 800
          }}>{qty}{t("units")}</span>
              <button type="button" onClick={() => setQty(q => q + 1)} style={{
            padding: '0.35rem 0.7rem',
            borderRadius: 6,
            border: '1px solid var(--glass-border)',
            background: 'var(--control-bg)',
            color: 'var(--text-main)',
            fontSize: '1rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}>
                +
              </button>
            </div>
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

          <input type="text" required placeholder="Delivery Village / Farm Address *" value={village} onChange={e => setVillage(e.target.value)} style={{
        padding: '0.55rem 0.75rem',
        borderRadius: 8,
        border: '1px solid var(--glass-border)',
        background: 'var(--control-bg)',
        color: 'var(--text-main)',
        fontSize: '0.85rem'
      }} />

          <div style={{
        padding: '0.65rem 0.85rem',
        borderRadius: 10,
        background: 'rgba(16,185,129,0.08)',
        border: '1px dashed var(--primary)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
            <div>
              <small className="text-muted">{t("total_payable")}</small>
              <div style={{
            fontWeight: 800,
            fontSize: '1.15rem',
            color: 'var(--primary)'
          }}>₹{totalPrice.toLocaleString()}</div>
            </div>
            <button type="submit" className="btn-primary" style={{
          padding: '0.55rem 1.2rem',
          borderRadius: 8,
          fontWeight: 700,
          fontSize: '0.85rem'
        }}>{t("confirm_order_add_to_cart")}</button>
          </div>
        </form>}
    </div>;
}
function InputMarketplace({
  marketplace = [],
  cart = [],
  onAddToCart,
  onOpenCart,
  localizeString
}) {
  const {
    t
  } = useTranslation();
  const [activeItemId, setActiveItemId] = useState(null);
  const totalCartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  return <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    position: 'relative'
  }}>
      <div className="glass-panel" style={{
      padding: '1.25rem',
      background: 'rgba(245,158,11,0.06)',
      borderLeft: '3px solid var(--accent)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '1rem'
    }}>
        <div>
          <strong style={{
          color: 'var(--accent)',
          fontSize: '1.05rem'
        }}>{t("verified_regenerative_inputs")}</strong>
          <p className="text-muted" style={{
          fontSize: '0.85rem',
          marginTop: '0.3rem'
        }}>{t("buy_from_verified_suppliers_gr")}</p>
        </div>
        <button onClick={onOpenCart} className="btn-primary" style={{
        padding: '0.6rem 1.1rem',
        borderRadius: '10px',
        fontSize: '0.9rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: totalCartCount > 0 ? 'var(--primary)' : 'var(--control-bg)',
        color: totalCartCount > 0 ? '#fff' : 'var(--text-main)',
        border: '1px solid var(--glass-border)'
      }}>
          <ShoppingCart size={18} />
          <span>{t("shopping_cart")}</span>
          {totalCartCount > 0 && <span style={{
          padding: '0.15rem 0.5rem',
          borderRadius: 20,
          background: '#fff',
          color: 'var(--primary)',
          fontWeight: 800,
          fontSize: '0.78rem'
        }}>
              {totalCartCount}
            </span>}
        </button>
      </div>

      <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '1rem'
    }}>
        {marketplace.map(item => {
        const cartEntry = cart.find(c => c.id === item.id);
        const inCartQty = cartEntry ? cartEntry.qty : 0;
        const isExpanded = activeItemId === item.id;
        return <div key={item.id} className="glass-card" style={{
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
                  <div style={{
                fontWeight: 700,
                fontSize: '1rem'
              }}>{item.name}</div>
                  {item.verified && <span style={{
                padding: '0.2rem 0.5rem',
                borderRadius: 20,
                background: 'rgba(16,185,129,0.15)',
                color: 'var(--primary)',
                fontSize: '0.65rem',
                fontWeight: 700
              }}>{t("verified")}</span>}
                </div>
                <div className="text-muted" style={{
              fontSize: '0.82rem',
              marginBottom: '0.5rem'
            }}>{item.seller} · {item.location}</div>
                <div style={{
              fontSize: '1.3rem',
              fontWeight: 800,
              color: 'var(--primary)',
              marginBottom: '0.3rem'
            }}>{localizeString ? localizeString(item.price) : item.price}</div>
                <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.8rem',
              color: 'var(--accent)',
              marginBottom: '0.5rem'
            }}>
                  <Star size={13} fill="var(--accent)" /> {item.rating}{t("stock")}<span style={{
                color: item.stock === 'Limited' ? 'var(--danger)' : 'var(--primary)'
              }}>{item.stock}</span>
                </div>
                <div style={{
              padding: '0.4rem 0.7rem',
              background: 'rgba(59,130,246,0.1)',
              borderRadius: '6px',
              fontSize: '0.78rem',
              color: 'var(--secondary)',
              marginBottom: '1rem'
            }}>🏷️ {item.group_discount}</div>
              </div>

              <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
                <button className="btn-primary" onClick={() => onAddToCart(item)} style={{
              width: '100%',
              padding: '0.65rem',
              borderRadius: '10px',
              justifyContent: 'center',
              fontSize: '0.9rem',
              fontWeight: 600,
              background: inCartQty > 0 ? 'var(--hover-bg)' : 'var(--primary)',
              color: inCartQty > 0 ? 'var(--primary)' : '#fff',
              border: inCartQty > 0 ? '1px solid var(--primary)' : 'none',
              transition: 'all 0.2s'
            }}>
                  <ShoppingCart size={16} />
                  {inCartQty > 0 ? `Added (${inCartQty}) — Add More` : 'Add to Cart'}
                </button>

                <button onClick={() => setActiveItemId(isExpanded ? null : item.id)} style={{
              width: '100%',
              padding: '0.55rem',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.82rem',
              border: '1.5px solid var(--primary)',
              background: isExpanded ? 'rgba(16,185,129,0.15)' : 'transparent',
              color: 'var(--primary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}>
                  {isExpanded ? 'Hide Order Form ▲' : 'Buy / Order Item →'}
                </button>
              </div>

              {isExpanded && <ItemOrderInlineForm item={item} onClose={() => setActiveItemId(null)} onAddToCart={onAddToCart} />}
            </div>;
      })}
      </div>
    </div>;
}
function CartModal({
  cart,
  onClose,
  onUpdateQty,
  onRemoveItem,
  onClearCart
}) {
  const {
    t
  } = useTranslation();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const subtotal = cart.reduce((sum, entry) => sum + parsePrice(entry.price) * entry.qty, 0);
  const discount = Math.round(subtotal * 0.12);
  const finalTotal = subtotal - discount;
  const handleCheckout = e => {
    e.preventDefault();
    setOrderPlaced(true);
  };
  return <div style={{
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    background: 'rgba(0, 0, 0, 0.65)',
    backdropFilter: 'blur(5px)',
    display: 'flex',
    justifyContent: 'flex-end'
  }} onClick={onClose}>
      <div className="animate-fade-in" style={{
      width: '100%',
      maxWidth: '460px',
      height: '100%',
      background: 'var(--bg-dark)',
      borderLeft: '1px solid var(--glass-border)',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '-10px 0 30px rgba(0,0,0,0.4)'
    }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{
        padding: '1.25rem 1.5rem',
        borderBottom: '1px solid var(--glass-border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
          <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem'
        }}>
            <ShoppingCart size={22} color="var(--primary)" />
            <h2 style={{
            fontSize: '1.2rem',
            fontWeight: 700,
            margin: 0
          }}>{t("your_shopping_cart")}</h2>
          </div>
          <button onClick={onClose} style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          padding: '0.3rem'
        }}>
            <X size={20} />
          </button>
        </div>

        {orderPlaced ? <div style={{
        padding: '2.5rem 1.5rem',
        textAlign: 'center',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '1rem'
      }}>
            <CheckCircle2 size={54} color="var(--primary)" />
            <h3 style={{
          fontSize: '1.5rem',
          fontWeight: 800
        }}>{t("order_placed_successfully")}</h3>
            <p className="text-muted" style={{
          fontSize: '0.9rem',
          lineHeight: 1.6
        }}>{t("order_id")}<strong style={{
            color: 'var(--primary)'
          }}>{t("agri")}{Math.floor(100000 + Math.random() * 900000)}</strong>
              <br />{t("estimated_delivery")}<strong>{t("2_business_days")}</strong>{t("to")}{deliveryAddress || 'your farm'}.
            </p>
            <div style={{
          padding: '1rem',
          background: 'rgba(16,185,129,0.1)',
          borderRadius: 12,
          border: '1px solid var(--primary)',
          width: '100%',
          textAlign: 'left',
          fontSize: '0.85rem'
        }}>
              <div>📦 <strong>{t("total_paid")}</strong> ₹{finalTotal.toLocaleString()}</div>
              <div>🚚 <strong>{t("status")}</strong>{t("order_dispatched_to_supplier")}</div>
              <div>📞 <strong>{t("updates")}</strong>{t("sent_via_sms_to")}{phone || 'your phone'}</div>
            </div>
            <button className="btn-primary" style={{
          marginTop: '1rem',
          padding: '0.75rem 2rem',
          borderRadius: 10
        }} onClick={() => {
          onClearCart();
          onClose();
        }}>{t("continue_shopping")}</button>
          </div> : cart.length === 0 ? <div style={{
        flex: 1,
        padding: '3rem 1.5rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '1rem'
      }}>
            <ShoppingCart size={48} style={{
          color: 'var(--text-muted)',
          opacity: 0.5
        }} />
            <h3 style={{
          fontSize: '1.2rem',
          color: 'var(--text-muted)'
        }}>{t("your_cart_is_empty")}</h3>
            <p className="text-muted" style={{
          fontSize: '0.85rem'
        }}>{t("add_organic_seeds_biofertilize")}</p>
          </div> : <>
            {/* Item List */}
            <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
              {cart.map(entry => <div key={entry.id} className="glass-card" style={{
            padding: '1rem',
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
                  <div style={{
              flex: 1
            }}>
                    <div style={{
                fontWeight: 700,
                fontSize: '0.95rem'
              }}>{entry.name}</div>
                    <div className="text-muted" style={{
                fontSize: '0.78rem'
              }}>{entry.seller}</div>
                    <div style={{
                fontWeight: 700,
                color: 'var(--primary)',
                marginTop: '0.2rem'
              }}>{entry.price}</div>
                  </div>

                  <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
                    <div style={{
                display: 'flex',
                alignItems: 'center',
                border: '1px solid var(--glass-border)',
                borderRadius: 8,
                background: 'var(--control-bg)'
              }}>
                      <button onClick={() => onUpdateQty(entry.id, -1)} style={{
                  padding: '0.3rem 0.5rem',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-main)',
                  cursor: 'pointer'
                }}>
                        <Minus size={13} />
                      </button>
                      <span style={{
                  padding: '0 0.4rem',
                  fontWeight: 700,
                  fontSize: '0.85rem'
                }}>{entry.qty}</span>
                      <button onClick={() => onUpdateQty(entry.id, 1)} style={{
                  padding: '0.3rem 0.5rem',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-main)',
                  cursor: 'pointer'
                }}>
                        <Plus size={13} />
                      </button>
                    </div>

                    <button onClick={() => onRemoveItem(entry.id)} style={{
                background: 'none',
                border: 'none',
                color: 'var(--danger)',
                cursor: 'pointer',
                padding: '0.3rem'
              }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>)}

              {/* Checkout Form */}
              <form id="cart-form" onSubmit={handleCheckout} style={{
            marginTop: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
                <strong style={{
              fontSize: '0.9rem',
              color: 'var(--text-main)'
            }}>{t("delivery_details")}</strong>
                <input type="text" required placeholder="Village / Farm Address *" value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} style={{
              padding: '0.65rem 0.9rem',
              borderRadius: 8,
              border: '1px solid var(--glass-border)',
              background: 'var(--control-bg)',
              color: 'var(--text-main)',
              fontSize: '0.85rem'
            }} />
                <input type="tel" required placeholder="Mobile Phone Number *" value={phone} onChange={e => setPhone(e.target.value)} style={{
              padding: '0.65rem 0.9rem',
              borderRadius: 8,
              border: '1px solid var(--glass-border)',
              background: 'var(--control-bg)',
              color: 'var(--text-main)',
              fontSize: '0.85rem'
            }} />
                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} style={{
              padding: '0.65rem 0.9rem',
              borderRadius: 8,
              border: '1px solid var(--glass-border)',
              background: 'var(--control-bg)',
              color: 'var(--text-main)',
              fontSize: '0.85rem'
            }}>
                  <option value="cod">{t("cash_on_delivery_cod")}</option>
                  <option value="upi">{t("upi_phonepe_gpay")}</option>
                  <option value="kcc">{t("kisan_credit_card_kcc_loan_lin")}</option>
                </select>
              </form>
            </div>

            {/* Footer Summary */}
            <div style={{
          padding: '1.25rem 1.5rem',
          borderTop: '1px solid var(--glass-border)',
          background: 'var(--bg-card)'
        }}>
              <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.85rem',
            marginBottom: '0.4rem',
            color: 'var(--text-muted)'
          }}>
                <span>{t("subtotal")}</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.85rem',
            marginBottom: '0.4rem',
            color: 'var(--primary)'
          }}>
                <span>{t("group_discount_12")}</span>
                <span>-₹{discount.toLocaleString()}</span>
              </div>
              <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.85rem',
            marginBottom: '0.8rem',
            color: 'var(--text-muted)'
          }}>
                <span>{t("delivery")}</span>
                <span style={{
              color: 'var(--primary)',
              fontWeight: 600
            }}>{t("free")}</span>
              </div>
              <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '1.2rem',
            fontWeight: 800,
            marginBottom: '1rem',
            paddingTop: '0.5rem',
            borderTop: '1px dashed var(--glass-border)'
          }}>
                <span>{t("total_amount")}</span>
                <span style={{
              color: 'var(--primary)'
            }}>₹{finalTotal.toLocaleString()}</span>
              </div>

              <button type="submit" form="cart-form" className="btn-primary" style={{
            width: '100%',
            padding: '0.85rem',
            borderRadius: 10,
            justifyContent: 'center',
            fontSize: '1rem',
            fontWeight: 700
          }}>
                <Truck size={18} />{t("place_order")}{finalTotal.toLocaleString()})
              </button>
            </div>
          </>}
      </div>
    </div>;
}
export default function FinanceHub() {
  const [tab, setTab] = useState(0);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const {
    t
  } = useTranslation();
  const {
    preferences
  } = usePreferences();
  const {
    data,
    loading,
    error,
    refetch
  } = useApi(() => api.finance(), [preferences.location.latitude, preferences.location.longitude]);
  const localizeString = str => {
    if (!str) return str;
    const formatter = new Intl.NumberFormat(preferences.language, {
      useGrouping: false
    });
    return String(str).replace(/\d/g, match => formatter.format(match));
  };
  const handleAddToCart = item => {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) {
        return prev.map(c => c.id === item.id ? {
          ...c,
          qty: c.qty + 1
        } : c);
      }
      return [...prev, {
        ...item,
        qty: 1
      }];
    });
    setToastMessage(`🛒 Added "${item.name}" to cart!`);
    setTimeout(() => setToastMessage(''), 3000);
  };
  const handleUpdateQty = (itemId, delta) => {
    setCart(prev => prev.map(c => c.id === itemId ? {
      ...c,
      qty: c.qty + delta
    } : c).filter(c => c.qty > 0));
  };
  const handleRemoveItem = itemId => {
    setCart(prev => prev.filter(c => c.id !== itemId));
  };
  const handleClearCart = () => {
    setCart([]);
  };
  const totalCartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  return <div className="animate-fade-in" style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
    position: 'relative'
  }}>
      {/* Notification Toast */}
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
      boxShadow: '0 8px 24px rgba(16,185,129,0.3)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    }}>
          {toastMessage}
        </div>}

      <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '1rem'
    }}>
        <div>
          <h1 style={{
          fontSize: '2.5rem',
          marginBottom: '0.4rem'
        }}>
            <IndianRupee size={30} style={{
            verticalAlign: 'middle',
            marginRight: '0.5rem',
            color: 'var(--accent)'
          }} />
            {t('financialServices')}
          </h1>
          <p className="text-muted">{t("credit_access_input_marketplac")}</p>
        </div>

        {/* Persistent Header Cart Icon */}
        <button onClick={() => setIsCartOpen(true)} className="btn-ghost" style={{
        padding: '0.6rem 1.1rem',
        borderRadius: 12,
        border: '1px solid var(--glass-border)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontWeight: 600,
        background: totalCartCount > 0 ? 'var(--hover-bg)' : 'var(--control-bg)',
        color: totalCartCount > 0 ? 'var(--primary)' : 'var(--text-main)'
      }}>
          <ShoppingCart size={18} />
          <span>{t("cart")}</span>
          {totalCartCount > 0 && <span style={{
          padding: '0.15rem 0.55rem',
          borderRadius: 20,
          background: 'var(--primary)',
          color: '#fff',
          fontWeight: 800,
          fontSize: '0.78rem'
        }}>
              {totalCartCount}
            </span>}
        </button>
      </header>

      <div className="hub-tabs">
        {['Credit & Loans', 'Input Marketplace', 'Crop Insurance'].map((t, i) => {
        const Icon = TAB_ICONS[i];
        return <button key={t} className={`hub-tab ${tab === i ? 'hub-tab-active' : ''}`} onClick={() => setTab(i)}>
              <Icon size={16} /> {t}
            </button>;
      })}
      </div>

      {loading && !data ? <LoadingGrid count={4} cols={2} /> : error ? <ErrorState message={error} onRetry={refetch} /> : <>
          {tab === 0 && <CreditLink credit={data.credit} t={t} localizeString={localizeString} />}
          {tab === 1 && <InputMarketplace marketplace={data.marketplace} cart={cart} onAddToCart={handleAddToCart} onOpenCart={() => setIsCartOpen(true)} localizeString={localizeString} />}
          {tab === 2 && <InsuranceIntegration insurance={data.insurance} localizeString={localizeString} />}
        </>}

      {/* Cart Modal / Drawer */}
      {isCartOpen && <CartModal cart={cart} onClose={() => setIsCartOpen(false)} onUpdateQty={handleUpdateQty} onRemoveItem={handleRemoveItem} onClearCart={handleClearCart} />}
    </div>;
}
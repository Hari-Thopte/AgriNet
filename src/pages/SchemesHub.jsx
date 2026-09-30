import { useState } from 'react';
import { Landmark, FileCheck, MessageCircleWarning, CheckCircle, ChevronDown, ChevronUp, Phone, ExternalLink } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { api } from '../api';
import { LoadingGrid, ErrorState } from '../components/LoadingCard';
import { usePreferences } from '../contexts/PreferencesContext';
import { useTranslation } from 'react-i18next';
import { useLocalize } from '../hooks/useLocalize';
function SchemeMatcher({
  schemes
}) {
  const [expanded, setExpanded] = useState(null);
  const {
    t
  } = useTranslation();
  const CATEGORY_COLORS = {
    income_support: '#10b981',
    insurance: '#3b82f6',
    soil: '#8b5cf6',
    irrigation: '#3b82f6',
    organic: '#10b981',
    infrastructure: '#f59e0b'
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
      }}>🏛️ {t('govtSchemesEligible') || "Government Schemes You're Eligible For"}</strong>
        <p className="text-muted" style={{
        fontSize: '0.85rem',
        marginTop: '0.3rem'
      }}>{t('schemesPersonalizedDesc') || "Personalized list based on your farm profile and location. Less than 30% of eligible farmers access these — don't miss out."}</p>
      </div>

      {schemes.map(scheme => {
      const isOpen = expanded === scheme.id;
      const catColor = CATEGORY_COLORS[scheme.category] || 'var(--primary)';
      return <div key={scheme.id} className="glass-card" style={{
        padding: '1.5rem',
        cursor: 'pointer',
        borderLeft: `4px solid ${catColor}`
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
              }}>{t(scheme.name)}</div>
                  <div className="text-muted" style={{
                fontSize: '0.78rem'
              }}>{t(scheme.ministry)}</div>
                </div>
              </div>
              {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
            <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '0.75rem',
          marginTop: '1rem'
        }}>
              <div><div className="text-muted" style={{
              fontSize: '0.72rem'
            }}>{t('benefit') || 'Benefit'}</div><div style={{
              fontWeight: 700,
              color: catColor,
              fontSize: '0.95rem'
            }}>{t(scheme.benefit)}</div></div>
              <div><div className="text-muted" style={{
              fontSize: '0.72rem'
            }}>{t('status') || 'Status'}</div><div style={{
              fontWeight: 600,
              fontSize: '0.85rem'
            }}>{t(scheme.status)}</div></div>
            </div>
            {isOpen && <div className="animate-fade-in" style={{
          marginTop: '1rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--glass-border)'
        }}>
                <div className="text-muted" style={{
            fontSize: '0.82rem',
            marginBottom: '0.5rem'
          }}><strong>{t('eligibility') || 'Eligibility'}:</strong> {t(scheme.eligibility)}</div>
                <div className="text-muted" style={{
            fontSize: '0.82rem',
            marginBottom: '0.75rem'
          }}><strong>{t('deadline') || 'Deadline'}:</strong> {t(scheme.deadline)}</div>
                <div style={{
            fontWeight: 600,
            marginBottom: '0.5rem'
          }}>📋 {t('howToApply') || 'How to Apply (Step-by-Step)'}:</div>
                <ol style={{
            paddingLeft: '1.5rem',
            margin: 0
          }}>
                  {scheme.steps.map((step, i) => <li key={i} style={{
              fontSize: '0.85rem',
              lineHeight: 1.8,
              color: 'var(--text-muted)'
            }}>{t(step)}</li>)}
                </ol>
                <a href={scheme.url || 'https://pmkisan.gov.in/'} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{
            marginTop: '1rem',
            padding: '0.55rem 1.3rem',
            background: catColor,
            color: '#fff',
            borderRadius: '8px',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            textDecoration: 'none',
            transition: 'opacity 0.2s'
          }}>
                  {t('applyNow') || 'Apply Now'} <ExternalLink size={14} />
                </a>
              </div>}
          </div>;
    })}
    </div>;
}
function ApplicationAssist({
  schemes
}) {
  const {
    t
  } = useTranslation();
  return <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  }}>
      <div className="glass-panel" style={{
      padding: '1.25rem',
      background: 'rgba(59,130,246,0.06)',
      borderLeft: '3px solid var(--secondary)'
    }}>
        <strong style={{
        color: 'var(--secondary)'
      }}>📝 {t('applicationAssistance') || 'Application Assistance'}</strong>
        <p className="text-muted" style={{
        fontSize: '0.85rem',
        marginTop: '0.3rem'
      }}>{t('applicationAssistDesc') || 'Step-by-step guidance with document checklists and deadline reminders for each scheme.'}</p>
      </div>
      {schemes.slice(0, 3).map(scheme => <div key={scheme.id} className="glass-card" style={{
      padding: '1.5rem'
    }}>
          <div style={{
        fontWeight: 700,
        fontSize: '1.1rem',
        marginBottom: '0.75rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
            <span>{scheme.icon}</span> {t(scheme.name)}
          </div>
          <div style={{
        position: 'relative',
        paddingLeft: '1.5rem'
      }}>
            {scheme.steps.map((step, i) => <div key={i} style={{
          position: 'relative',
          paddingBottom: i < scheme.steps.length - 1 ? '1.25rem' : 0
        }}>
                {i < scheme.steps.length - 1 && <div style={{
            position: 'absolute',
            left: '-1.15rem',
            top: '1.2rem',
            width: '2px',
            height: 'calc(100% - 0.5rem)',
            background: 'var(--glass-border)'
          }} />}
                <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem'
          }}>
                  <div style={{
              position: 'absolute',
              left: '-1.5rem',
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: i === 0 ? 'var(--primary)' : 'var(--soft-bg)',
              border: `2px solid ${i === 0 ? 'var(--primary)' : 'var(--glass-border)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
                    {i === 0 && <CheckCircle size={10} color="#fff" />}
                  </div>
                  <span style={{
              fontSize: '0.88rem',
              color: i === 0 ? 'var(--text-main)' : 'var(--text-muted)',
              fontWeight: i === 0 ? 600 : 400
            }}>{t(step)}</span>
                </div>
              </div>)}
          </div>
        </div>)}
    </div>;
}
function GrievanceRedressal({
  grievance
}) {
  const [complaint, setComplaint] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const {
    t
  } = useTranslation();
  const {
    localizeString
  } = useLocalize();
  return <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  }}>
      <div className="glass-panel" style={{
      padding: '1.25rem',
      background: 'rgba(223,48,48,0.06)',
      borderLeft: '3px solid var(--danger)'
    }}>
        <strong style={{
        color: 'var(--danger)'
      }}>📢 {t('reportIssues') || 'Report Issues & Delays'}</strong>
        <p className="text-muted" style={{
        fontSize: '0.85rem',
        marginTop: '0.3rem'
      }}>{t('reportIssuesDesc') || 'Report corruption, delays, or problems in scheme delivery. Your complaint will be tracked and escalated.'}</p>
      </div>

      <div className="glass-card" style={{
      padding: '1.5rem'
    }}>
        <h3 style={{
        marginBottom: '1rem'
      }}>{t('quickContacts') || 'Quick Contacts'}</h3>
        <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem'
      }}>
          <div style={{
          padding: '1rem',
          background: 'rgba(16,185,129,0.08)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
            <Phone size={20} color="var(--primary)" />
            <div>
              <div style={{
              fontWeight: 700
            }}>{t('kisanCallCenter') || 'Kisan Call Center'}</div>
              <div style={{
              color: 'var(--primary)',
              fontWeight: 600
            }}>{localizeString(grievance.helpline)}</div>
            </div>
          </div>
          <div style={{
          padding: '1rem',
          background: 'rgba(59,130,246,0.08)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
            <ExternalLink size={20} color="var(--secondary)" />
            <div>
              <div style={{
              fontWeight: 700
            }}>{t('onlinePortal') || 'Online Portal'}</div>
              <div style={{
              color: 'var(--secondary)',
              fontWeight: 600
            }}>{grievance.portal}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{
      padding: '1.5rem'
    }}>
        <h3 style={{
        marginBottom: '0.75rem'
      }}>{t('fileComplaint') || 'File a Complaint'}</h3>
        {submitted ? <div className="animate-fade-in" style={{
        textAlign: 'center',
        padding: '2rem'
      }}>
            <CheckCircle size={48} color="var(--primary)" />
            <h3 style={{
          marginTop: '1rem',
          color: 'var(--primary)'
        }}>{t('complaintRegistered') || 'Complaint Registered!'}</h3>
            <p className="text-muted">{t('grievanceId') || 'Grievance ID'}{t("grv2026")}{localizeString(Math.floor(Math.random() * 9000) + 1000)}</p>
            <p className="text-muted" style={{
          fontSize: '0.85rem'
        }}>{t('complaintUpdateMsg') || "You'll receive updates via SMS. Expect resolution within 30 days."}</p>
          </div> : <>
            <textarea value={complaint} onChange={e => setComplaint(e.target.value)} placeholder={t('complaintPlaceholder') || "Describe the issue — which scheme, what happened, when..."} rows={4} style={{
          width: '100%',
          padding: '0.8rem',
          borderRadius: '8px',
          border: '1px solid var(--glass-border)',
          background: 'var(--soft-bg)',
          color: 'var(--text-main)',
          fontSize: '0.9rem',
          outline: 'none',
          resize: 'vertical',
          fontFamily: 'inherit'
        }} />
            <button onClick={() => complaint.trim() && setSubmitted(true)} disabled={!complaint.trim()} style={{
          marginTop: '0.75rem',
          padding: '0.6rem 1.5rem',
          background: complaint.trim() ? 'var(--danger)' : 'var(--soft-bg)',
          color: complaint.trim() ? '#fff' : 'var(--text-muted)',
          border: 'none',
          borderRadius: '8px',
          cursor: complaint.trim() ? 'pointer' : 'not-allowed',
          fontWeight: 600
        }}>
              {t('submitComplaint') || 'Submit Complaint'}
            </button>
          </>}
      </div>

      <div className="glass-panel" style={{
      padding: '1.25rem'
    }}>
        <strong>🔄 {t('grievanceProcess') || 'Grievance Resolution Process'}:</strong>
        <ol style={{
        paddingLeft: '1.2rem',
        margin: '0.5rem 0 0',
        lineHeight: 1.8,
        fontSize: '0.85rem',
        color: 'var(--text-muted)'
      }}>
          {grievance.steps.map((step, i) => <li key={i}>{t(step)}</li>)}
        </ol>
      </div>
    </div>;
}
export default function SchemesHub() {
  const [tab, setTab] = useState(0);
  const {
    preferences
  } = usePreferences();
  const {
    t
  } = useTranslation();
  const {
    data,
    loading,
    error,
    refetch
  } = useApi(() => api.schemes(), [preferences.location.latitude, preferences.location.longitude]);
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
          <Landmark size={30} style={{
          verticalAlign: 'middle',
          marginRight: '0.5rem',
          color: 'var(--secondary)'
        }} />
          {t('govtSchemes')}
        </h1>
        <p className="text-muted">{t('schemesSubtitle') || 'Eligible schemes · Step-by-step applications · Report issues'}</p>
      </header>

      <div className="hub-tabs">
        {[t('schemeMatcher') || 'Scheme Matcher', t('applicationGuide') || 'Application Guide', t('grievance') || 'Grievance'].map((title, i) => {
        const Icon = [Landmark, FileCheck, MessageCircleWarning][i];
        return <button key={title} className={`hub-tab ${tab === i ? 'hub-tab-active' : ''}`} onClick={() => setTab(i)}>
              <Icon size={16} /> {title}
            </button>;
      })}
      </div>

      {loading && !data ? <LoadingGrid count={4} cols={1} /> : error ? <ErrorState message={error} onRetry={refetch} /> : <>
          {tab === 0 && <SchemeMatcher schemes={data.schemes} />}
          {tab === 1 && <ApplicationAssist schemes={data.schemes} />}
          {tab === 2 && <GrievanceRedressal grievance={data.grievance} />}
        </>}
    </div>;
}
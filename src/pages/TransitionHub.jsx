import { useTranslation } from "react-i18next";
import { useState } from 'react';
import { TrendingUp, AlertTriangle, Users, Star, ChevronRight, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { api } from '../api';
import { LoadingGrid, ErrorState } from '../components/LoadingCard';
import { usePreferences } from '../contexts/PreferencesContext';
import { useLocalize } from '../hooks/useLocalize';
function TransitionPlanner({
  plan
}) {
  const {
    t
  } = useTranslation();
  const [selectedYear, setSelectedYear] = useState(0);
  const yr = plan[selectedYear];
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
      background: 'rgba(16,185,129,0.06)',
      borderLeft: '3px solid var(--primary)'
    }}>
        <strong style={{
        color: 'var(--primary)'
      }}>{t("5year_regenerative_transition_")}</strong>
        <p className="text-muted" style={{
        fontSize: '0.85rem',
        marginTop: '0.3rem'
      }}>{t("phased_plan_showing_expected_y")}</p>
      </div>

      <div style={{
      display: 'flex',
      gap: '0.5rem'
    }}>
        {plan.map((y, i) => <button key={i} className={`hub-tab ${selectedYear === i ? 'hub-tab-active' : ''}`} onClick={() => setSelectedYear(i)} style={{
        flex: 1
      }}>{t("year")}{localizeString(y.year)}
          </button>)}
      </div>

      <div className="glass-card" style={{
      padding: '1.75rem'
    }}>
        <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1.5rem',
        marginBottom: '1.5rem'
      }}>
          <div style={{
          textAlign: 'center'
        }}>
            <div className="text-muted" style={{
            fontSize: '0.78rem',
            marginBottom: '0.3rem'
          }}>{t("yield_change")}</div>
            <div style={{
            fontSize: '1.8rem',
            fontWeight: 800,
            color: yr.yield_change_pct >= 0 ? 'var(--primary)' : 'var(--danger)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.3rem'
          }}>
              {yr.yield_change_pct >= 0 ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
              {yr.yield_change_pct > 0 ? '+' : ''}{localizeString(yr.yield_change_pct)}%
            </div>
          </div>
          <div style={{
          textAlign: 'center'
        }}>
            <div className="text-muted" style={{
            fontSize: '0.78rem',
            marginBottom: '0.3rem'
          }}>{t("input_cost_change")}</div>
            <div style={{
            fontSize: '1.8rem',
            fontWeight: 800,
            color: yr.cost_change_pct <= 0 ? 'var(--primary)' : 'var(--danger)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.3rem'
          }}>
              {yr.cost_change_pct <= 0 ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
              {yr.cost_change_pct > 0 ? '+' : ''}{localizeString(yr.cost_change_pct)}%
            </div>
          </div>
          <div style={{
          textAlign: 'center'
        }}>
            <div className="text-muted" style={{
            fontSize: '0.78rem',
            marginBottom: '0.3rem'
          }}>{t("soil_health_score")}</div>
            <div style={{
            fontSize: '1.8rem',
            fontWeight: 800,
            color: 'var(--primary)'
          }}>{localizeString(yr.soil_health_score)}</div>
            <div style={{
            height: '6px',
            borderRadius: '3px',
            background: 'var(--soft-bg)',
            marginTop: '0.5rem'
          }}>
              <div style={{
              height: '100%',
              borderRadius: '3px',
              background: 'var(--primary)',
              width: `${yr.soil_health_score}%`,
              transition: 'width 0.5s ease'
            }} />
            </div>
          </div>
        </div>

        <div style={{
        marginBottom: '1rem'
      }}>
          <div style={{
          fontWeight: 600,
          marginBottom: '0.5rem'
        }}>{t("milestone")}</div>
          {yr.milestones.map((m, i) => <p key={i} className="text-muted" style={{
          fontSize: '0.9rem',
          lineHeight: 1.6
        }}>{m}</p>)}
        </div>

        <div>
          <div style={{
          fontWeight: 600,
          marginBottom: '0.5rem'
        }}>{t("practices_to_adopt")}</div>
          <div style={{
          display: 'flex',
          gap: '0.4rem',
          flexWrap: 'wrap'
        }}>
            {yr.practices.map((p, i) => <span key={i} style={{
            padding: '0.3rem 0.7rem',
            borderRadius: '8px',
            background: 'rgba(16,185,129,0.1)',
            border: '1px solid rgba(16,185,129,0.2)',
            fontSize: '0.8rem',
            color: 'var(--primary)'
          }}>{p}</span>)}
          </div>
        </div>
      </div>
    </div>;
}
function RiskCalculator({
  risks
}) {
  const {
    t
  } = useTranslation();
  const categories = ['financial', 'climate', 'market', 'technical'];
  const colorMap = {
    financial: '#f59e0b',
    climate: '#3b82f6',
    market: '#10b981',
    technical: '#8b5cf6'
  };
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
      background: 'rgba(245,158,11,0.06)',
      borderLeft: '3px solid var(--accent)'
    }}>
        <strong style={{
        color: 'var(--accent)'
      }}>{t("personalized_risk_assessment")}</strong>
        <p className="text-muted" style={{
        fontSize: '0.85rem',
        marginTop: '0.3rem'
      }}>{t("your_risk_profile_across_finan")}</p>
      </div>

      <div className="glass-card" style={{
      padding: '1.5rem',
      textAlign: 'center',
      borderLeft: `4px solid ${risks.overall.score < 50 ? 'var(--primary)' : 'var(--accent)'}`
    }}>
        <div className="text-muted" style={{
        fontSize: '0.85rem'
      }}>{t("overall_risk")}</div>
        <div style={{
        fontSize: '2.5rem',
        fontWeight: 800,
        color: risks.overall.score < 50 ? 'var(--primary)' : 'var(--accent)'
      }}>{localizeString(risks.overall.score)}/{localizeString(100)}</div>
        <div style={{
        fontSize: '1rem',
        fontWeight: 600,
        marginTop: '0.3rem'
      }}>{risks.overall.label}</div>
      </div>

      <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '1rem'
    }}>
        {categories.map(cat => {
        const risk = risks[cat];
        const color = colorMap[cat];
        return <div key={cat} className="glass-card" style={{
          padding: '1.25rem'
        }}>
              <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.75rem'
          }}>
                <div style={{
              fontWeight: 700,
              textTransform: 'capitalize'
            }}>{cat}</div>
                <span style={{
              padding: '0.2rem 0.5rem',
              borderRadius: 20,
              background: `${color}22`,
              color,
              fontSize: '0.72rem',
              fontWeight: 700
            }}>{risk.label}</span>
              </div>
              <div style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            color,
            marginBottom: '0.5rem'
          }}>{localizeString(risk.score)}/{localizeString(100)}</div>
              <div style={{
            height: '6px',
            borderRadius: '3px',
            background: 'var(--soft-bg)',
            marginBottom: '0.75rem'
          }}>
                <div style={{
              height: '100%',
              borderRadius: '3px',
              background: color,
              width: `${risk.score}%`,
              transition: 'width 0.5s ease'
            }} />
              </div>
              <ul style={{
            paddingLeft: '1rem',
            margin: 0
          }}>
                {risk.factors.map((f, i) => <li key={i} className="text-muted" style={{
              fontSize: '0.78rem',
              lineHeight: 1.7
            }}>{f}</li>)}
              </ul>
            </div>;
      })}
      </div>
    </div>;
}
function PeerMentorship({
  mentors
}) {
  const {
    t
  } = useTranslation();
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
      background: 'rgba(139,92,246,0.06)',
      borderLeft: '3px solid var(--purple)'
    }}>
        <strong style={{
        color: 'var(--purple)'
      }}>{t("peer_mentorship_network")}</strong>
        <p className="text-muted" style={{
        fontSize: '0.85rem',
        marginTop: '0.3rem'
      }}>{t("connect_with_experienced_regen")}</p>
      </div>
      {mentors.map(mentor => <div key={mentor.id} className="glass-card" style={{
      padding: '1.5rem'
    }}>
          <div style={{
        display: 'flex',
        gap: '1rem',
        alignItems: 'flex-start'
      }}>
            <div style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--primary), var(--accent))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 700,
          fontSize: '1rem',
          flexShrink: 0
        }}>{mentor.avatar}</div>
            <div style={{
          flex: 1
        }}>
              <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start'
          }}>
                <div>
                  <div style={{
                fontWeight: 700,
                fontSize: '1.05rem'
              }}>{mentor.name}</div>
                  <div className="text-muted" style={{
                fontSize: '0.8rem'
              }}>{mentor.region} · {localizeString(mentor.experience)}</div>
                </div>
                <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              color: 'var(--accent)'
            }}>
                  <Star size={14} fill="var(--accent)" /> {localizeString(mentor.rating)}
                </div>
              </div>
              <div style={{
            fontWeight: 600,
            fontSize: '0.9rem',
            marginTop: '0.5rem',
            color: 'var(--primary)'
          }}>{mentor.specialty}</div>
              <div style={{
            fontSize: '0.85rem',
            marginTop: '0.3rem'
          }}>🏆 {mentor.success}</div>
              <div style={{
            display: 'flex',
            gap: '0.3rem',
            flexWrap: 'wrap',
            marginTop: '0.5rem'
          }}>
                {mentor.crops.map((crop, i) => <span key={i} style={{
              padding: '0.15rem 0.45rem',
              borderRadius: '6px',
              background: 'var(--soft-bg)',
              border: '1px solid var(--glass-border)',
              fontSize: '0.7rem'
            }}>{crop}</span>)}
              </div>
              <button className="btn-ghost" style={{
            marginTop: '0.75rem',
            padding: '0.4rem 1rem',
            fontSize: '0.82rem'
          }}>{t("connect")}<ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>)}
    </div>;
}
export default function TransitionHub() {
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
  } = useApi(() => api.transition(), [preferences.location.latitude, preferences.location.longitude]);
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
          <TrendingUp size={30} style={{
          verticalAlign: 'middle',
          marginRight: '0.5rem',
          color: 'var(--primary)'
        }} />
          {t('transitionSupport', 'Transition Support')}
        </h1>
        <p className="text-muted">{t("5year_roadmap_risk_assessment_")}</p>
      </header>

      <div className="hub-tabs">
        {['Transition Planner', 'Risk Calculator', 'Peer Mentorship'].map((t, i) => {
        const Icon = [TrendingUp, AlertTriangle, Users][i];
        return <button key={t} className={`hub-tab ${tab === i ? 'hub-tab-active' : ''}`} onClick={() => setTab(i)}>
              <Icon size={16} /> {t}
            </button>;
      })}
      </div>

      {loading && !data ? <LoadingGrid count={4} cols={2} /> : error ? <ErrorState message={error} onRetry={refetch} /> : <>
          {tab === 0 && <TransitionPlanner plan={data.plan} />}
          {tab === 1 && <RiskCalculator risks={data.risks} />}
          {tab === 2 && <PeerMentorship mentors={data.mentors} />}
        </>}
    </div>;
}
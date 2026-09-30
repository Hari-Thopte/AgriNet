import { useTranslation } from "react-i18next";
import { useState } from 'react';
import { Award, BarChart3, ShieldCheck, ThumbsUp, CheckCircle, Star, Users } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { api } from '../api';
import { LoadingGrid, ErrorState } from '../components/LoadingCard';
import { usePreferences } from '../contexts/PreferencesContext';
function SuccessStories({
  stories
}) {
  const {
    t
  } = useTranslation();
  const [likesMap, setLikesMap] = useState({});
  const handleToggleLike = id => {
    setLikesMap(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
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
      }}>{t("real_farmer_success_stories")}</strong>
        <p className="text-muted" style={{
        fontSize: '0.85rem',
        marginTop: '0.3rem'
      }}>{t("verified_results_from_farmers_")}</p>
      </div>
      {stories.map(story => {
      const isLiked = !!likesMap[story.id];
      const currentLikes = story.likes + (isLiked ? 1 : 0);
      return <div key={story.id} className="glass-card" style={{
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
            flexShrink: 0
          }}>{story.avatar}</div>
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
                }}>{story.farmer}</div>
                    <div className="text-muted" style={{
                  fontSize: '0.8rem'
                }}>{story.region} · {story.practice}</div>
                  </div>
                  {story.verified && <span style={{
                padding: '0.2rem 0.5rem',
                borderRadius: 20,
                background: 'rgba(16,185,129,0.15)',
                color: 'var(--primary)',
                fontSize: '0.65rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem'
              }}><CheckCircle size={11} />{t("verified")}</span>}
                </div>
                <div style={{
              margin: '0.75rem 0',
              padding: '0.75rem',
              background: 'rgba(16,185,129,0.06)',
              borderRadius: '8px',
              borderLeft: '3px solid var(--primary)'
            }}>
                  <div style={{
                fontWeight: 700,
                color: 'var(--primary)',
                marginBottom: '0.3rem'
              }}>{story.crop}</div>
                  <div style={{
                fontWeight: 800,
                fontSize: '1.1rem'
              }}>🏆 {story.result}</div>
                </div>
                <p className="text-muted" style={{
              fontSize: '0.88rem',
              lineHeight: 1.6,
              marginBottom: '0.75rem'
            }}>{story.detail}</p>
                <div style={{
              display: 'flex',
              gap: '1rem',
              alignItems: 'center'
            }}>
                  <button onClick={() => handleToggleLike(story.id)} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.9rem',
                fontSize: '0.85rem',
                borderRadius: '20px',
                border: isLiked ? '1px solid var(--primary)' : '1px solid var(--glass-border)',
                background: isLiked ? 'rgba(16,185,129,0.15)' : 'var(--control-bg)',
                color: isLiked ? 'var(--primary)' : 'var(--text-main)',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s transform active:scale-95'
              }}>
                    <ThumbsUp size={15} fill={isLiked ? 'var(--primary)' : 'none'} color={isLiked ? 'var(--primary)' : 'currentColor'} /> {currentLikes}
                  </button>
                  <span className="text-muted" style={{
                fontSize: '0.8rem'
              }}>{t("helped")}{Math.floor(currentLikes / 3)}{t("farmers_try_this")}</span>
                </div>
              </div>
            </div>
          </div>;
    })}
    </div>;
}
function NeighborComparison({
  benchmarks
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
      }}>{t("how_you_compare_anonymous")}</strong>
        <p className="text-muted" style={{
        fontSize: '0.85rem',
        marginTop: '0.3rem'
      }}>{t("see_how_your_farm_metrics_comp")}</p>
      </div>
      {benchmarks.map((b, i) => <div key={i} className="glass-card" style={{
      padding: '1.5rem'
    }}>
          <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.75rem'
      }}>
            <div style={{
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center'
        }}>
              <span style={{
            fontSize: '1.4rem'
          }}>{b.icon}</span>
              <div style={{
            fontWeight: 700,
            fontSize: '1rem'
          }}>{b.metric}</div>
            </div>
            <span style={{
          padding: '0.25rem 0.6rem',
          borderRadius: 20,
          background: b.percentile >= 70 ? 'rgba(16,185,129,0.15)' : b.percentile >= 50 ? 'rgba(245,158,11,0.15)' : 'rgba(223,48,48,0.15)',
          color: b.percentile >= 70 ? 'var(--primary)' : b.percentile >= 50 ? 'var(--accent)' : 'var(--danger)',
          fontSize: '0.72rem',
          fontWeight: 700
        }}>{t("top")}{100 - b.percentile}%
            </span>
          </div>
          <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1rem',
        marginBottom: '0.75rem'
      }}>
            <div style={{
          textAlign: 'center',
          padding: '0.5rem',
          background: 'rgba(59,130,246,0.08)',
          borderRadius: '6px'
        }}>
              <div className="text-muted" style={{
            fontSize: '0.68rem'
          }}>{t("you")}</div>
              <div style={{
            fontWeight: 700,
            fontSize: '0.95rem'
          }}>{b.your_estimate}</div>
            </div>
            <div style={{
          textAlign: 'center',
          padding: '0.5rem',
          background: 'var(--soft-bg)',
          borderRadius: '6px'
        }}>
              <div className="text-muted" style={{
            fontSize: '0.68rem'
          }}>{t("regional_avg")}</div>
              <div style={{
            fontWeight: 600,
            fontSize: '0.95rem'
          }}>{b.regional_avg}</div>
            </div>
            <div style={{
          textAlign: 'center',
          padding: '0.5rem',
          background: 'rgba(16,185,129,0.08)',
          borderRadius: '6px'
        }}>
              <div className="text-muted" style={{
            fontSize: '0.68rem'
          }}>{t("top_10")}</div>
              <div style={{
            fontWeight: 700,
            fontSize: '0.95rem',
            color: 'var(--primary)'
          }}>{b.top_10_pct}</div>
            </div>
          </div>
          <div style={{
        height: '8px',
        borderRadius: '4px',
        background: 'var(--soft-bg)',
        position: 'relative'
      }}>
            <div style={{
          position: 'absolute',
          height: '100%',
          borderRadius: '4px',
          background: `linear-gradient(90deg, var(--danger), var(--accent), var(--primary))`,
          width: '100%',
          opacity: 0.3
        }} />
            <div style={{
          position: 'absolute',
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          background: 'var(--primary)',
          border: '2px solid #fff',
          top: '-2px',
          left: `${b.percentile}%`,
          transform: 'translateX(-50%)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }} />
          </div>
        </div>)}
    </div>;
}
function VerificationBadges({
  badges
}) {
  const {
    t
  } = useTranslation();
  const LEVEL_COLORS = {
    institutional: '#3b82f6',
    research: '#8b5cf6',
    community: '#10b981',
    extension: '#f59e0b'
  };
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
      }}>{t("trust_verification")}</strong>
        <p className="text-muted" style={{
        fontSize: '0.85rem',
        marginTop: '0.3rem'
      }}>{t("all_advice_on_agrin_is_validat")}</p>
      </div>
      <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '1rem'
    }}>
        {badges.map(badge => {
        const color = LEVEL_COLORS[badge.level] || 'var(--primary)';
        return <div key={badge.id} className="glass-card" style={{
          padding: '1.5rem',
          borderTop: `3px solid ${color}`
        }}>
              <div style={{
            display: 'flex',
            gap: '0.6rem',
            alignItems: 'center',
            marginBottom: '0.75rem'
          }}>
                <span style={{
              fontSize: '1.6rem'
            }}>{badge.icon}</span>
                <div>
                  <div style={{
                fontWeight: 700
              }}>{badge.name}</div>
                  <div className="text-muted" style={{
                fontSize: '0.78rem'
              }}>{badge.issuer}</div>
                </div>
              </div>
              <p className="text-muted" style={{
            fontSize: '0.85rem',
            lineHeight: 1.6
          }}>{badge.description}</p>
              <div style={{
            marginTop: '0.75rem',
            padding: '0.3rem 0.6rem',
            borderRadius: '6px',
            background: `${color}15`,
            color,
            fontSize: '0.72rem',
            fontWeight: 700,
            display: 'inline-block',
            textTransform: 'capitalize'
          }}>
                {badge.level}{t("validation")}</div>
            </div>;
      })}
      </div>
    </div>;
}
export default function CommunityHub() {
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
  } = useApi(() => api.community(), [preferences.location.latitude, preferences.location.longitude]);
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
          <Award size={30} style={{
          verticalAlign: 'middle',
          marginRight: '0.5rem',
          color: 'var(--accent)'
        }} />{t("community_trust")}</h1>
        <p className="text-muted">{t("success_stories_benchmarking_v")}</p>
      </header>

      <div className="hub-tabs">
        {['Success Stories', 'How You Compare', 'Verification'].map((t, i) => {
        const Icon = [Star, BarChart3, ShieldCheck][i];
        return <button key={t} className={`hub-tab ${tab === i ? 'hub-tab-active' : ''}`} onClick={() => setTab(i)}>
              <Icon size={16} /> {t}
            </button>;
      })}
      </div>

      {loading && !data ? <LoadingGrid count={4} cols={2} /> : error ? <ErrorState message={error} onRetry={refetch} /> : <>
          {tab === 0 && <SuccessStories stories={data.stories} />}
          {tab === 1 && <NeighborComparison benchmarks={data.benchmarks} />}
          {tab === 2 && <VerificationBadges badges={data.badges} />}
        </>}
    </div>;
}
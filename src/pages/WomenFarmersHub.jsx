import { useTranslation } from "react-i18next";
import { useState } from 'react';
import { Heart, Users, Clock, Shield, Eye, EyeOff } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { api } from '../api';
import { LoadingGrid, ErrorState } from '../components/LoadingCard';
import { usePreferences } from '../contexts/PreferencesContext';
import { useLocalize } from '../hooks/useLocalize';
function WomenFarmerProfile({
  profileFields
}) {
  const {
    t
  } = useTranslation();
  const [formData, setFormData] = useState({});
  const [privacyVisible, setPrivacyVisible] = useState({});
  return <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  }}>
      <div className="glass-panel" style={{
      padding: '1.25rem',
      background: 'rgba(236,72,153,0.06)',
      borderLeft: '3px solid #ec4899'
    }}>
        <strong style={{
        color: '#ec4899'
      }}>{t("your_farm_profile")}</strong>
        <p className="text-muted" style={{
        fontSize: '0.85rem',
        marginTop: '0.3rem'
      }}>{t("track_plots_you_actually_manag")}</p>
      </div>

      <div className="glass-card" style={{
      padding: '1.5rem'
    }}>
        {profileFields.map((field, i) => <div key={field.field} style={{
        padding: '1rem 0',
        borderBottom: i < profileFields.length - 1 ? '1px solid var(--glass-border)' : 'none'
      }}>
            <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.5rem'
        }}>
              <label style={{
            fontWeight: 600,
            fontSize: '0.95rem'
          }}>{field.label}</label>
              <button onClick={() => setPrivacyVisible(prev => ({
            ...prev,
            [field.field]: !prev[field.field]
          }))} style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            color: 'var(--text-muted)',
            fontSize: '0.72rem'
          }}>
                {field.privacy === 'private' ? <EyeOff size={13} /> : <Eye size={13} />}
                {field.privacy}
              </button>
            </div>
            {field.type === 'number' && <input type="number" placeholder="Enter value" value={formData[field.field] || ''} onChange={e => setFormData(prev => ({
          ...prev,
          [field.field]: e.target.value
        }))} style={{
          width: '100%',
          padding: '0.6rem 0.8rem',
          borderRadius: '8px',
          border: '1px solid var(--glass-border)',
          background: 'var(--soft-bg)',
          color: 'var(--text-main)',
          fontSize: '0.9rem',
          outline: 'none'
        }} />}
            {field.type === 'select' && <select value={formData[field.field] || ''} onChange={e => setFormData(prev => ({
          ...prev,
          [field.field]: e.target.value
        }))} style={{
          width: '100%',
          padding: '0.6rem 0.8rem',
          borderRadius: '8px',
          border: '1px solid var(--glass-border)',
          background: 'var(--soft-bg)',
          color: 'var(--text-main)',
          fontSize: '0.9rem'
        }}>
                <option value="">{t("select")}</option>
                {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>}
            {field.type === 'multi-select' && <div style={{
          display: 'flex',
          gap: '0.4rem',
          flexWrap: 'wrap'
        }}>
                {field.options?.map(opt => {
            const selected = (formData[field.field] || []).includes(opt);
            return <button key={opt} onClick={() => setFormData(prev => ({
              ...prev,
              [field.field]: selected ? (prev[field.field] || []).filter(o => o !== opt) : [...(prev[field.field] || []), opt]
            }))} style={{
              padding: '0.35rem 0.7rem',
              borderRadius: '8px',
              border: `1px solid ${selected ? 'var(--primary)' : 'var(--glass-border)'}`,
              background: selected ? 'rgba(16,185,129,0.15)' : 'var(--soft-bg)',
              color: selected ? 'var(--primary)' : 'var(--text-muted)',
              fontSize: '0.82rem',
              cursor: 'pointer'
            }}>
                      {opt}
                    </button>;
          })}
              </div>}
            {field.type === 'boolean' && <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          cursor: 'pointer'
        }}>
                <input type="checkbox" checked={formData[field.field] || false} onChange={e => setFormData(prev => ({
            ...prev,
            [field.field]: e.target.checked
          }))} style={{
            accentColor: 'var(--primary)'
          }} />
                <span style={{
            fontSize: '0.88rem'
          }}>{t("yes")}</span>
              </label>}
          </div>)}
        <button style={{
        marginTop: '1rem',
        padding: '0.6rem 1.5rem',
        background: 'var(--primary)',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 600
      }}>{t("save_profile")}</button>
      </div>
    </div>;
}
function GroupAccess({
  shgGroups
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
      }}>{t("womens_selfhelp_groups")}</strong>
        <p className="text-muted" style={{
        fontSize: '0.85rem',
        marginTop: '0.3rem'
      }}>{t("access_shared_advisories_bulk_")}</p>
      </div>
      {shgGroups.map(group => <div key={group.id} className="glass-card" style={{
      padding: '1.5rem'
    }}>
          <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '1rem'
      }}>
            <div>
              <div style={{
            fontWeight: 700,
            fontSize: '1.1rem'
          }}>{group.name}</div>
              <div className="text-muted" style={{
            fontSize: '0.82rem'
          }}>{group.village} · {localizeString(group.members)}{t("members")}{group.meeting_day}</div>
            </div>
            <div style={{
          textAlign: 'right'
        }}>
              <div style={{
            fontWeight: 800,
            color: 'var(--primary)',
            fontSize: '1.1rem'
          }}>{localizeString(group.savings)}</div>
              <div className="text-muted" style={{
            fontSize: '0.72rem'
          }}>{t("total_savings")}</div>
            </div>
          </div>
          <div style={{
        display: 'flex',
        gap: '0.4rem',
        flexWrap: 'wrap',
        marginBottom: '0.75rem'
      }}>
            {group.activities.map((act, i) => <span key={i} style={{
          padding: '0.25rem 0.6rem',
          borderRadius: '6px',
          background: 'rgba(16,185,129,0.1)',
          fontSize: '0.75rem',
          color: 'var(--primary)'
        }}>{act}</span>)}
          </div>
          <div className="text-muted" style={{
        fontSize: '0.82rem'
      }}>{t("active_loans")}{localizeString(group.loans_active)}</div>
          <button className="btn-ghost" style={{
        marginTop: '0.75rem',
        padding: '0.4rem 1rem',
        fontSize: '0.82rem'
      }}>{t("join_group")}</button>
        </div>)}
    </div>;
}
function TimeSavingTips({
  tips
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
      background: 'rgba(245,158,11,0.06)',
      borderLeft: '3px solid var(--accent)'
    }}>
        <strong style={{
        color: 'var(--accent)'
      }}>{t("timesaving_tips_for_women_farm")}</strong>
        <p className="text-muted" style={{
        fontSize: '0.85rem',
        marginTop: '0.3rem'
      }}>{t("laborreducing_practices_specif")}</p>
      </div>
      <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '1rem'
    }}>
        {tips.map(tip => <div key={tip.id} className="glass-card" style={{
        padding: '1.5rem'
      }}>
            <div style={{
          display: 'flex',
          gap: '0.6rem',
          alignItems: 'center',
          marginBottom: '0.75rem'
        }}>
              <span style={{
            fontSize: '1.6rem'
          }}>{tip.icon}</span>
              <div>
                <div style={{
              fontWeight: 700
            }}>{tip.category}</div>
                <span style={{
              padding: '0.15rem 0.4rem',
              borderRadius: '4px',
              background: tip.difficulty === 'Easy' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
              color: tip.difficulty === 'Easy' ? 'var(--primary)' : 'var(--accent)',
              fontSize: '0.65rem',
              fontWeight: 700
            }}>{tip.difficulty}</span>
              </div>
            </div>
            <p className="text-muted" style={{
          fontSize: '0.88rem',
          lineHeight: 1.6,
          marginBottom: '0.75rem'
        }}>{tip.tip}</p>
            <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.5rem'
        }}>
              <div style={{
            padding: '0.5rem',
            background: 'rgba(16,185,129,0.08)',
            borderRadius: '6px',
            textAlign: 'center'
          }}>
                <div style={{
              fontWeight: 800,
              color: 'var(--primary)',
              fontSize: '1rem'
            }}>{localizeString(tip.time_saved)}</div>
                <div className="text-muted" style={{
              fontSize: '0.68rem'
            }}>{t("time_saved")}</div>
              </div>
              <div style={{
            padding: '0.5rem',
            background: 'rgba(59,130,246,0.08)',
            borderRadius: '6px',
            textAlign: 'center'
          }}>
                <div style={{
              fontWeight: 600,
              fontSize: '0.82rem'
            }}>{localizeString(tip.cost)}</div>
                <div className="text-muted" style={{
              fontSize: '0.68rem'
            }}>{t("cost")}</div>
              </div>
            </div>
          </div>)}
      </div>
    </div>;
}
export default function WomenFarmersHub() {
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
  } = useApi(() => api.womenFarmers(), [preferences.location.latitude, preferences.location.longitude]);
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
          <Heart size={30} style={{
          verticalAlign: 'middle',
          marginRight: '0.5rem',
          color: '#ec4899'
        }} />
          {t('womenFarmers', 'Women Farmers')}
        </h1>
        <p className="text-muted">{t("profile_privacy_shg_network_ti")}</p>
      </header>

      <div className="hub-tabs">
        {['My Profile', 'SHG Groups', 'Time-Saving Tips'].map((t, i) => {
        const Icon = [Shield, Users, Clock][i];
        return <button key={t} className={`hub-tab ${tab === i ? 'hub-tab-active' : ''}`} onClick={() => setTab(i)}>
              <Icon size={16} /> {t}
            </button>;
      })}
      </div>

      {loading && !data ? <LoadingGrid count={4} cols={2} /> : error ? <ErrorState message={error} onRetry={refetch} /> : <>
          {tab === 0 && <WomenFarmerProfile profileFields={data.profile_fields} />}
          {tab === 1 && <GroupAccess shgGroups={data.shg_groups} />}
          {tab === 2 && <TimeSavingTips tips={data.tips} />}
        </>}
    </div>;
}
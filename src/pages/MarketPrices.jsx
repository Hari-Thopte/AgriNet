import { useState } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, DollarSign, AlertCircle, CheckCircle, Clock, Newspaper, MapPin, ExternalLink, Filter } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { api } from '../api';
import { LoadingGrid, ErrorState } from '../components/LoadingCard';
import { useTranslation } from 'react-i18next';
import { usePreferences } from '../contexts/PreferencesContext';
const SIGNAL_CONFIG = {
  sell: {
    color: 'var(--primary)',
    bg: 'rgba(16,185,129,0.15)',
    icon: <CheckCircle size={14} />,
    labelKey: 'sellNow'
  },
  hold: {
    color: 'var(--accent)',
    bg: 'rgba(245,158,11,0.15)',
    icon: <Clock size={14} />,
    labelKey: 'hold'
  },
  buy: {
    color: 'var(--secondary)',
    bg: 'rgba(59,130,246,0.15)',
    icon: <AlertCircle size={14} />,
    labelKey: 'buyDip'
  }
};
const CROP_FILTERS = ['All', 'Wheat', 'Rice', 'Soybean', 'Cotton', 'Maize'];
function Sparkline({
  data,
  color
}) {
  const {
    t
  } = useTranslation();
  if (!data?.length) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const h = 40,
    w = 80;
  const pts = data.map((v, i) => `${i / (data.length - 1) * w},${h - (v - min) / range * h}`).join(' ');
  return <svg width={w} height={h} style={{
    overflow: 'visible'
  }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={(data.length - 1) / (data.length - 1) * w} cy={h - (data[data.length - 1] - min) / range * h} r="3" fill={color} />
    </svg>;
}
function CommodityCard({
  c,
  selected,
  onClick,
  t,
  locale,
  formatNum
}) {
  const cfg = SIGNAL_CONFIG[c.signal] ?? SIGNAL_CONFIG.hold;
  const isUp = c.change > 0;
  return <div className="glass-card" style={{
    padding: '1.25rem',
    border: `1.5px solid ${selected ? 'var(--primary)' : 'var(--glass-border)'}`,
    transition: 'all 0.2s',
    background: selected ? 'rgba(16,185,129,0.06)' : 'var(--bg-card)'
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
          fontSize: '1.8rem'
        }}>{c.emoji}</span>
          <div>
            <div style={{
            fontWeight: 700,
            fontSize: '1.05rem'
          }}>{t(c.name_key)}</div>
            <div style={{
            fontSize: '0.78rem',
            color: 'var(--primary)',
            fontWeight: 600
          }}>{c.market}</div>
          </div>
        </div>
        <span style={{
        padding: '0.25rem 0.6rem',
        borderRadius: 20,
        background: cfg.bg,
        color: cfg.color,
        fontSize: '0.7rem',
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        gap: '0.3rem'
      }}>
          {cfg.icon} {t(cfg.labelKey)}
        </span>
      </div>
      <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end'
    }}>
        <div>
          <div style={{
          fontSize: '1.4rem',
          fontWeight: 800
        }}>{formatNum ? formatNum(c.price, 2) : Number(c.price).toLocaleString(locale, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}</div>
          <div style={{
          fontSize: '0.75rem',
          color: 'var(--text-muted)'
        }}>{c.unit}</div>
          <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem',
          marginTop: '0.3rem',
          color: isUp ? 'var(--primary)' : 'var(--danger)',
          fontSize: '0.85rem',
          fontWeight: 600
        }}>
            {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {t('todayChange', {
            change: `${isUp ? '+' : ''}${formatNum ? formatNum(c.change, 2) : c.change}`
          })}
          </div>
        </div>
        <Sparkline data={c.sparkline} color={isUp ? 'var(--primary)' : 'var(--danger)'} />
      </div>

      <button onClick={() => onClick(selected ? null : c.id)} style={{
      marginTop: '0.85rem',
      width: '100%',
      padding: '0.55rem',
      borderRadius: '8px',
      fontWeight: 700,
      fontSize: '0.82rem',
      border: '1.5px solid var(--primary)',
      background: selected ? 'rgba(16,185,129,0.15)' : 'transparent',
      color: 'var(--primary)',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    }}>
        {selected ? 'Hide Chart & Signal ▲' : 'View Chart & Signal →'}
      </button>

      {selected && <div className="animate-fade-in" style={{
      marginTop: '0.85rem',
      padding: '1rem',
      background: 'var(--soft-bg)',
      borderRadius: '12px',
      border: '1px solid var(--primary)'
    }}>
          <div style={{
        fontWeight: 700,
        fontSize: '0.9rem',
        color: 'var(--primary)',
        marginBottom: '0.3rem'
      }}>{t("mandi_trend_ai_advisory")}</div>
          <p className="text-muted" style={{
        fontSize: '0.82rem',
        margin: 0,
        lineHeight: 1.5
      }}>
            <strong style={{
          color: cfg.color
        }}>{t('aiSignal')}: {t(cfg.labelKey)}</strong> — {t(c.desc_key, c.values)}
          </p>
        </div>}
    </div>;
}
export default function MarketPrices() {
  const {
    t,
    i18n
  } = useTranslation();
  const {
    preferences
  } = usePreferences();
  const [selectedCropFilter, setSelectedCropFilter] = useState('All');
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
  const {
    data: priceData,
    loading: priceLoading,
    error: priceError,
    refetch: refetchPrices
  } = useApi(() => api.prices(), [preferences.location.latitude, preferences.location.longitude]);
  const {
    data: newsData,
    loading: newsLoading,
    error: newsError,
    refetch: refetchNews
  } = useApi(() => api.news(selectedCropFilter === 'All' ? '' : selectedCropFilter), [preferences.location.latitude, preferences.location.longitude, selectedCropFilter]);
  const [selected, setSelected] = useState(3);
  const commodities = priceData?.commodities ?? [];
  const selectedItem = commodities.find(c => c.id === selected);
  const cfg = selectedItem ? SIGNAL_CONFIG[selectedItem.signal] ?? SIGNAL_CONFIG.hold : null;
  const lastUpdated = priceData?.updated ? new Date(priceData.updated).toLocaleTimeString(i18n.resolvedLanguage) : '--';
  const newsList = newsData?.news ?? [];
  const regionName = priceData?.region || newsData?.region || preferences.location.label;
  const mandiName = priceData?.mandi || 'Regional APMC Mandi';
  const handleRefreshAll = () => {
    refetchPrices();
    refetchNews();
  };
  return <div className="animate-fade-in" style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem'
  }}>
      {/* Header */}
      <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      flexWrap: 'wrap',
      gap: '1rem'
    }}>
        <div>
          <h1 style={{
          fontSize: '2.4rem',
          marginBottom: '0.4rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
            <DollarSign size={32} style={{
            color: 'var(--primary)'
          }} />
            {t('marketRatesCropNews', 'Market Rates & Crop News')}
          </h1>
          <p className="text-muted" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap'
        }}>
            <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            color: 'var(--primary)',
            fontWeight: 600
          }}>
              <MapPin size={16} /> {mandiName} ({regionName})
            </span>
            <span>· {t('basedOnLocation', {
              location: preferences.location.label
            })}</span>
            <span>· {t('lastUpdated')}: {lastUpdated}</span>
          </p>
        </div>
        <button className="btn-ghost" onClick={handleRefreshAll} disabled={priceLoading || newsLoading}>
          <RefreshCw size={15} style={{
          animation: priceLoading || newsLoading ? 'spin 1s linear infinite' : 'none'
        }} />
          {priceLoading || newsLoading ? t('refreshing') : t('refreshPrices')}
        </button>
      </header>

      {/* Ticker strip */}
      {commodities.length > 0 && <div style={{
      display: 'flex',
      gap: '1rem',
      overflowX: 'auto',
      paddingBottom: '0.25rem'
    }}>
          {commodities.map(c => {
        const isUp = c.change > 0;
        return <div key={c.id} onClick={() => setSelected(c.id)} style={{
          flexShrink: 0,
          padding: '0.6rem 1rem',
          background: selected === c.id ? 'var(--hover-bg)' : 'var(--bg-card)',
          border: `1px solid ${selected === c.id ? 'var(--primary)' : 'var(--glass-border)'}`,
          borderRadius: 10,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          cursor: 'pointer'
        }}>
                <span>{c.emoji}</span>
                <span style={{
            fontWeight: 600,
            fontSize: '0.9rem'
          }}>{t(c.name_key)}</span>
                <span style={{
            color: isUp ? 'var(--primary)' : 'var(--danger)',
            fontSize: '0.85rem',
            fontWeight: 600
          }}>
                  {isUp ? '▲' : '▼'}{formatNum(Math.abs(c.change), 2)}%
                </span>
              </div>;
      })}
        </div>}

      {/* SECTION 1: MARKET PRICES */}
      <section>
        <h2 style={{
        fontSize: '1.4rem',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
          <TrendingUp size={22} color="var(--primary)" /> {t('realTimeMandiRates', 'Real-Time Mandi Rates')} ({mandiName})
        </h2>

        {priceLoading && !priceData ? <LoadingGrid count={6} cols={3} /> : priceError ? <ErrorState message={priceError} onRetry={refetchPrices} /> : <>
            {/* Grid */}
            <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1rem'
        }}>
              {commodities.map(c => <CommodityCard key={c.id} c={c} selected={selected === c.id} onClick={setSelected} t={t} locale={i18n.resolvedLanguage} formatNum={formatNum} />)}
            </div>

            {/* AI Signal Detail */}
            {selectedItem && cfg && <div className="glass-panel animate-fade-in" style={{
          padding: '1.75rem',
          marginTop: '1.25rem',
          borderLeft: `4px solid ${cfg.color}`
        }}>
                <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
                  <div style={{
              flex: 1
            }}>
                    <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '0.75rem'
              }}>
                      <span style={{
                  fontSize: '2rem'
                }}>{selectedItem.emoji}</span>
                      <div>
                        <h2 style={{
                    fontSize: '1.5rem'
                  }}>{t(selectedItem.name_key)}</h2>
                        <div className="text-muted" style={{
                    fontSize: '0.85rem'
                  }}>{t("location_mandi")}<strong style={{
                      color: 'var(--primary)'
                    }}>{selectedItem.market}</strong></div>
                      </div>
                    </div>
                    <p style={{
                fontSize: '1rem',
                lineHeight: 1.6,
                color: 'var(--text-muted)'
              }}>
                      <strong style={{
                  color: cfg.color
                }}>{t('aiSignal')}: {t(cfg.labelKey)}</strong> — {t(selectedItem.desc_key, selectedItem.values)}
                    </p>
                  </div>
                  <div style={{
              textAlign: 'right',
              flexShrink: 0
            }}>
                    <div style={{
                fontSize: '2.2rem',
                fontWeight: 800
              }}>
                      {formatNum(selectedItem.price, 2)}
                    </div>
                    <div className="text-muted" style={{
                fontSize: '0.85rem'
              }}>{selectedItem.unit}</div>
                    <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '0.3rem',
                color: selectedItem.change > 0 ? 'var(--primary)' : 'var(--danger)',
                fontSize: '1rem',
                fontWeight: 700,
                marginTop: '0.5rem'
              }}>
                      {selectedItem.change > 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                      {t('todayChange', {
                  change: `${selectedItem.change > 0 ? '+' : ''}${formatNum(selectedItem.change, 2)}`
                })}
                    </div>
                  </div>
                </div>
              </div>}
          </>}
      </section>

      {/* SECTION 2: REAL-TIME CROP NEWS */}
      <section className="glass-panel" style={{
      padding: '1.75rem',
      borderRadius: 16
    }}>
        <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.25rem'
      }}>
          <div>
            <h2 style={{
            fontSize: '1.4rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
              <Newspaper size={22} color="var(--primary)" /> {t('realTimeCropNews', 'Real-Time Crop & Mandi News')}
            </h2>
            <p className="text-muted" style={{
            fontSize: '0.85rem',
            marginTop: '0.2rem'
          }}>
              {t('liveLocationNewsAdvisories', 'Live location-based agricultural news and official advisories for')} <strong>{regionName}</strong>
            </p>
          </div>

          {/* Crop Filter Tabs */}
          <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          flexWrap: 'wrap'
        }}>
            <Filter size={15} style={{
            color: 'var(--text-muted)'
          }} />
            {CROP_FILTERS.map(crop => <button key={crop} onClick={() => setSelectedCropFilter(crop)} style={{
            padding: '0.35rem 0.8rem',
            borderRadius: 20,
            fontSize: '0.8rem',
            fontWeight: 600,
            border: '1px solid var(--glass-border)',
            background: selectedCropFilter === crop ? 'var(--primary)' : 'var(--control-bg)',
            color: selectedCropFilter === crop ? '#fff' : 'var(--text-muted)',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}>
                {crop === 'All' ? t('all', 'All') : t(crop.toLowerCase(), crop)}
              </button>)}
          </div>
        </div>

        {newsLoading && !newsData ? <LoadingGrid count={4} cols={2} /> : newsError ? <ErrorState message={newsError} onRetry={refetchNews} /> : newsList.filter(item => {
          if (!selectedCropFilter || selectedCropFilter === 'All') return true;
          const search = selectedCropFilter.toLowerCase();
          const str = `${item.title || ''} ${item.tag || ''} ${item.source || ''}`.toLowerCase();
          return str.includes(search);
        }).length === 0 ? <p className="text-muted" style={{
        padding: '1rem 0'
      }}>{t('noNewsAvailable', 'No news updates available for this filter.')}</p> : <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1rem'
      }}>
            {newsList.filter(item => {
              if (!selectedCropFilter || selectedCropFilter === 'All') return true;
              const search = selectedCropFilter.toLowerCase();
              const str = `${item.title || ''} ${item.tag || ''} ${item.source || ''}`.toLowerCase();
              return str.includes(search);
            }).map((item, idx) => <div key={idx} className="glass-card" style={{
          padding: '1.15rem',
          borderRadius: 14,
          display: 'flex',
          flexDirection: 'column',
          justify: 'space-between',
          gap: '0.75rem',
          background: 'var(--bg-card)',
          border: '1px solid var(--glass-border)'
        }}>
                <div>
                  <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.5rem'
            }}>
                    <span style={{
                padding: '0.2rem 0.6rem',
                borderRadius: 12,
                background: 'rgba(16,185,129,0.15)',
                color: 'var(--primary)',
                fontSize: '0.72rem',
                fontWeight: 700
              }}>
                      {t(item.tag === 'Live Crop News' ? 'liveCropNews' : 'liveAdvisory', item.tag || 'Live Advisory')}
                    </span>
                    <small style={{
                color: 'var(--text-muted)',
                fontSize: '0.72rem'
              }}>
                      {item.published ? new Date(item.published).toLocaleDateString(i18n.resolvedLanguage, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'Just now'}
                    </small>
                  </div>
                  <h3 style={{
              fontSize: '0.98rem',
              fontWeight: 600,
              lineHeight: 1.45,
              marginBottom: '0.4rem',
              color: 'var(--text-main)'
            }}>
                    {(() => {
                      const title = item.title || '';
                      if (title.includes('36,585-crore') || title.includes('55.72 lakh') || title.includes('clears Rs')) return t('news_loan_waiver_cabinet', title);
                      if (title.includes('El Niño') || title.includes('food production target')) return t('news_el_nino', title);
                      if (title.includes('panchanama') || title.includes('Crop-loss')) return t('news_panchanama', title);
                      if (title.includes('damage assessment') || title.includes('Minister orders')) return t('news_damage_assess', title);
                      if (title.includes('drought deepens')) return t('news_drought_deepens', title);
                      if (title.includes('pilot project to boost') || title.includes('AI-based agriculture')) return t('news_ai_pilot', title);
                      if (title.includes('10,000 farmers')) return t('news_ai_10k', title);
                      if (title.includes('Waiver for All Eligible')) return t('news_loan_waiver_all', title);
                      if (title.includes('eligibility criteria and problems')) return t('news_loan_waiver_eligibility', title);
                      if (title.includes('Rs 2 lakh') || title.includes('reiterates full waiver')) return t('news_loan_waiver_2lakh', title);
                      return t(title, title);
                    })()}
                  </h3>
                </div>

                <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '0.5rem',
            borderTop: '1px dashed var(--glass-border)'
          }}>
                  <span style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              fontWeight: 500
            }}>
                    📍 {item.source}
                  </span>
                  <a href={item.link} target="_blank" rel="noopener noreferrer" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.78rem',
              color: 'var(--primary)',
              fontWeight: 600,
              textDecoration: 'none'
            }}>{t('readArticle', 'Read Article')}<ExternalLink size={13} />
                  </a>
                </div>
              </div>)}
          </div>}
      </section>

      <p style={{
      textAlign: 'center',
      fontSize: '0.75rem',
      color: 'var(--text-muted)'
    }}>
        {t(priceData?.note_key || 'priceDisclaimer')}
      </p>
    </div>;
}
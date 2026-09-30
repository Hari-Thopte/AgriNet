import { useTranslation } from "react-i18next";
import { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw, Upload, Check, Clock, Smartphone, MessageSquare, Database, ArrowUpCircle, AlertCircle, CheckCircle, Download, Trash2, ShieldCheck, Zap, Package } from 'lucide-react';
import { useConnectivity } from '../hooks/useConnectivity';
import { offlineSync } from '../utils/offlineSync';
const TABS = ['offlineMode', 'syncManager', 'liteVersion'];
const TAB_ICONS = [Database, ArrowUpCircle, Smartphone];
function OfflineMode({
  online
}) {
  const {
    t
  } = useTranslation();
  const [cachingProgress, setCachingProgress] = useState(false);
  const [cacheStatus, setCacheStatus] = useState({});
  const refreshCacheStats = () => {
    const keys = ['agrin_cache_market_prices', 'agrin_cache_weather', 'agrin_cache_schemes', 'agrin_cache_equipment', 'agrin_cache_seeds', 'agrin_cache_post_harvest', 'agrin_cache_crop_diagnostics'];
    const stats = {};
    keys.forEach(k => {
      const val = localStorage.getItem(k);
      if (val) {
        try {
          const parsed = JSON.parse(val);
          stats[k] = {
            cached: true,
            size: (new Blob([val]).size / 1024).toFixed(1) + ' KB',
            timestamp: parsed.cachedAt ? new Date(parsed.cachedAt).toLocaleTimeString() : 'Recent'
          };
        } catch {
          stats[k] = {
            cached: true,
            size: '0.5 KB',
            timestamp: 'Recent'
          };
        }
      } else {
        stats[k] = {
          cached: false
        };
      }
    });
    setCacheStatus(stats);
  };
  useEffect(() => {
    refreshCacheStats();
  }, []);
  const handlePreCacheAll = async () => {
    setCachingProgress(true);

    // Mock/pre-fill comprehensive offline datasets into local cache
    const datasets = [{
      key: 'market_prices',
      data: {
        items: [{
          id: 1,
          crop: 'Wheat (Sharbati)',
          price: 2450,
          trend: '+1.5%',
          min: 2300,
          max: 2600,
          market: 'Indore Mandi'
        }, {
          id: 2,
          crop: 'Paddy (Basmati)',
          price: 3820,
          trend: '+0.8%',
          min: 3600,
          max: 4000,
          market: 'Karnal Mandi'
        }, {
          id: 3,
          crop: 'Soybean (Yellow)',
          price: 4600,
          trend: '-0.4%',
          min: 4400,
          max: 4800,
          market: 'Latur Mandi'
        }, {
          id: 4,
          crop: 'Cotton (Medium Staple)',
          price: 6200,
          trend: '+2.1%',
          min: 5900,
          max: 6500,
          market: 'Rajkot Mandi'
        }, {
          id: 5,
          crop: 'Maize (Kharif)',
          price: 2150,
          trend: '+0.3%',
          min: 2000,
          max: 2300,
          market: 'Davangere Mandi'
        }]
      }
    }, {
      key: 'weather',
      data: {
        location: 'Central Agricultural Zone',
        temperature: '31°C',
        condition: 'Partly Cloudy',
        humidity: '68%',
        rainfallChance: '20%',
        forecast: [{
          day: 'Today',
          temp: '31°C',
          condition: 'Partly Cloudy',
          rain: '20%'
        }, {
          day: 'Tomorrow',
          temp: '29°C',
          condition: 'Light Rain',
          rain: '65%'
        }, {
          day: 'Day 3',
          temp: '28°C',
          condition: 'Moderate Rain',
          rain: '80%'
        }, {
          day: 'Day 4',
          temp: '30°C',
          condition: 'Sunny',
          rain: '10%'
        }]
      }
    }, {
      key: 'schemes',
      data: {
        schemes: [{
          name: 'PM-KISAN Direct Benefit',
          subsidy: '₹6,000/yr',
          status: 'Eligible'
        }, {
          name: 'PM Crop Insurance (PMFBY)',
          subsidy: 'Up to 90%',
          status: 'Active'
        }, {
          name: 'Sub-Mission on Agricultural Mechanization',
          subsidy: '50% Subsidy',
          status: 'Applications Open'
        }]
      }
    }, {
      key: 'equipment',
      data: {
        items: [{
          name: 'Mahindra 575 DI Tractor (45 HP)',
          rate: '₹800/hr',
          provider: 'Ramesh Singh'
        }, {
          name: 'Class Crop Combine Harvester',
          rate: '₹1,500/hr',
          provider: 'Punjab Machinery Hub'
        }, {
          name: 'Laser Land Leveler',
          rate: '₹600/hr',
          provider: 'Kisan Cooperative'
        }]
      }
    }, {
      key: 'seeds',
      data: {
        items: [{
          name: 'HD-3086 Wheat Seed (Certified)',
          price: '₹1,450 / 40kg bag',
          germination: '94%'
        }, {
          name: 'JS 335 Soybean Seed',
          price: '₹2,200 / 30kg bag',
          germination: '91%'
        }]
      }
    }, {
      key: 'post_harvest',
      data: {
        guides: [{
          title: 'Hermetic Bag Grain Storage Guide',
          moistureTarget: '12% or lower'
        }, {
          title: 'Cold Storage Directory & Subsidy Form',
          maxStorageMonths: '6 Months'
        }]
      }
    }, {
      key: 'crop_diagnostics',
      data: {
        offlineRules: [{
          symptoms: ['yellow leaves', 'rust spots'],
          diagnosis: 'Wheat Leaf Rust (Puccinia triticina)',
          treatment: 'Apply Propiconazole 25% EC @ 1ml/L'
        }, {
          symptoms: ['stem tunneling', 'withered central shoot'],
          diagnosis: 'Stem Borer Attack',
          treatment: 'Apply Chlorantraniliprole 0.4% GR @ 4kg/acre'
        }]
      }
    }];
    for (const item of datasets) {
      offlineSync.cacheData(item.key, item.data);
      await new Promise(r => setTimeout(r, 150)); // smooth progress animation
    }
    setCachingProgress(false);
    refreshCacheStats();
  };
  const handleClearCache = () => {
    offlineSync.clearCache();
    refreshCacheStats();
  };
  const CACHE_ITEMS = [{
    key: 'agrin_cache_market_prices',
    label: 'Market Prices (Mandis)',
    icon: '💰'
  }, {
    key: 'agrin_cache_weather',
    label: '7-Day Weather & Rain Radar',
    icon: '🌤️'
  }, {
    key: 'agrin_cache_schemes',
    label: 'Government Subsidies & Schemes',
    icon: '🏛️'
  }, {
    key: 'agrin_cache_equipment',
    label: 'Tractor & Harvester Directory',
    icon: '🚜'
  }, {
    key: 'agrin_cache_seeds',
    label: 'Certified Seeds & Inputs',
    icon: '🌱'
  }, {
    key: 'agrin_cache_post_harvest',
    label: 'Storage & Cold Chain Guides',
    icon: '📦'
  }, {
    key: 'agrin_cache_crop_diagnostics',
    label: 'Offline Pest & Disease Tree',
    icon: '🔬'
  }];
  return <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  }}>
      <div className="glass-card" style={{
      padding: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderLeft: `4px solid ${online ? 'var(--primary)' : 'var(--danger)'}`,
      flexWrap: 'wrap',
      gap: '1rem'
    }}>
        <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
          {online ? <Wifi size={28} color="var(--primary)" /> : <WifiOff size={28} color="var(--danger)" />}
          <div>
            <div style={{
            fontWeight: 700,
            fontSize: '1.1rem'
          }}>{online ? '🟢 Online — Connected to AgriNet' : '🔴 Offline Mode — Working Standalone'}</div>
            <div className="text-muted" style={{
            fontSize: '0.85rem'
          }}>{online ? 'Connected to internet. Local cache will be updated.' : 'No internet detected. Serving all features from local browser storage.'}</div>
          </div>
        </div>

        <div style={{
        display: 'flex',
        gap: '0.75rem'
      }}>
          <button onClick={handlePreCacheAll} disabled={cachingProgress} className="btn-primary" style={{
          fontSize: '0.85rem',
          padding: '0.6rem 1.2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem'
        }}>
            <Download size={16} className={cachingProgress ? 'animate-bounce' : ''} />
            {cachingProgress ? 'Pre-Caching All Hubs...' : 'Pre-Cache All Data Now'}
          </button>

          <button onClick={handleClearCache} className="btn-ghost text-danger" style={{
          fontSize: '0.85rem',
          padding: '0.6rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem'
        }} title="Clear stored offline cache">
            <Trash2 size={16} />{t("clear_cache")}</button>
        </div>
      </div>

      <h3 style={{
      fontSize: '1.1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    }}>
        <Database size={18} color="var(--secondary)" />{t("offline_data_modules_status")}</h3>

      <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '1rem'
    }}>
        {CACHE_ITEMS.map(item => {
        const status = cacheStatus[item.key] || {
          cached: false
        };
        return <div key={item.key} className="glass-card" style={{
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
              <span style={{
            fontSize: '1.8rem'
          }}>{item.icon}</span>
              <div style={{
            flex: 1
          }}>
                <div style={{
              fontWeight: 600,
              fontSize: '0.95rem'
            }}>{item.label}</div>
                <div style={{
              fontSize: '0.78rem',
              color: status.cached ? 'var(--primary)' : 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              marginTop: '0.2rem'
            }}>
                  {status.cached ? <><CheckCircle size={13} />{t("saved")}{status.size} · {status.timestamp})</> : <><Clock size={13} />{t("not_cached_yet")}</>}
                </div>
              </div>
            </div>;
      })}
      </div>

      <div className="glass-panel" style={{
      padding: '1.25rem',
      background: 'rgba(16,185,129,0.08)',
      borderLeft: '3px solid var(--primary)'
    }}>
        <strong style={{
        color: 'var(--primary)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem'
      }}>
          <ShieldCheck size={18} />{t("zerocloud_guarantee_for_remote")}</strong>
        <p className="text-muted" style={{
        fontSize: '0.88rem',
        marginTop: '0.5rem',
        lineHeight: 1.6
      }}>{t("smallholders_can_tap")}<strong>{t("precache_all_data_now")}</strong>{t("while_connected_to_wifi4g_at_t")}</p>
      </div>
    </div>;
}
function SyncManager({
  online
}) {
  const {
    t
  } = useTranslation();
  const [queue, setQueue] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const refreshQueue = () => {
    setQueue(offlineSync.getQueue());
  };
  useEffect(() => {
    refreshQueue();
    const interval = setInterval(refreshQueue, 2000);
    return () => clearInterval(interval);
  }, []);
  const handleManualSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const count = await offlineSync.flushQueue();
      setSyncResult(`Successfully synced ${count} pending offline items!`);
      refreshQueue();
    } catch (err) {
      setSyncResult('Sync failed. Please check network connectivity.');
    } finally {
      setSyncing(false);
    }
  };
  const handleClearQueue = () => {
    offlineSync.clearQueue();
    refreshQueue();
  };
  return <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  }}>
      <div style={{
      display: 'flex',
      gap: '1rem',
      flexWrap: 'wrap'
    }}>
        <div className="glass-card" style={{
        flex: 1,
        padding: '1.25rem',
        textAlign: 'center',
        minWidth: '150px'
      }}>
          <div style={{
          fontSize: '1.8rem',
          fontWeight: 800,
          color: 'var(--accent)'
        }}>{queue.length}</div>
          <div className="text-muted" style={{
          fontSize: '0.8rem'
        }}>{t("pending_offline_actions")}</div>
        </div>

        <div className="glass-card" style={{
        flex: 1,
        padding: '1.25rem',
        textAlign: 'center',
        minWidth: '150px'
      }}>
          <div style={{
          fontSize: '1.8rem',
          fontWeight: 800,
          color: online ? 'var(--primary)' : 'var(--danger)'
        }}>
            {online ? 'Online' : 'Offline'}
          </div>
          <div className="text-muted" style={{
          fontSize: '0.8rem'
        }}>{t("sync_channel_status")}</div>
        </div>

        <div className="glass-card" style={{
        flex: 1,
        padding: '1.25rem',
        textAlign: 'center',
        minWidth: '150px'
      }}>
          <div style={{
          fontSize: '1.8rem',
          fontWeight: 800,
          color: 'var(--secondary)'
        }}>
            {(new Blob([JSON.stringify(queue)]).size / 1024).toFixed(1)}{t("kb")}</div>
          <div className="text-muted" style={{
          fontSize: '0.8rem'
        }}>{t("queued_payload_size")}</div>
        </div>
      </div>

      <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
        <h3 style={{
        fontSize: '1.1rem'
      }}>{t("pending_sync_queue")}</h3>
        <div style={{
        display: 'flex',
        gap: '0.5rem'
      }}>
          <button onClick={handleManualSync} disabled={syncing || queue.length === 0} className="btn-primary" style={{
          fontSize: '0.82rem',
          padding: '0.5rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem'
        }}>
            <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Syncing...' : 'Sync All Now'}
          </button>
          {queue.length > 0 && <button onClick={handleClearQueue} className="btn-ghost text-danger" style={{
          fontSize: '0.82rem',
          padding: '0.5rem 0.8rem'
        }}>{t("clear_queue")}</button>}
        </div>
      </div>

      {syncResult && <div className="glass-card" style={{
      padding: '0.85rem 1.25rem',
      background: 'rgba(16,185,129,0.1)',
      color: 'var(--primary)',
      fontWeight: 600,
      fontSize: '0.9rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    }}>
          <CheckCircle size={16} /> {syncResult}
        </div>}

      {queue.length === 0 ? <div className="glass-card" style={{
      padding: '2.5rem',
      textAlign: 'center'
    }}>
          <CheckCircle size={36} color="var(--primary)" style={{
        margin: '0 auto 0.75rem auto'
      }} />
          <h4 style={{
        fontSize: '1.05rem',
        fontWeight: 700
      }}>{t("queue_is_empty")}</h4>
          <p className="text-muted" style={{
        fontSize: '0.85rem',
        marginTop: '0.2rem'
      }}>{t("all_actions_taken_offline_have")}</p>
        </div> : queue.map((item, idx) => <div key={item.id || idx} className="glass-card" style={{
      padding: '1.25rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    }}>
            <Upload size={20} color="var(--secondary)" />
            <div style={{
        flex: 1
      }}>
              <div style={{
          fontWeight: 600,
          fontSize: '0.95rem'
        }}>{item.endpoint?.replace(/^\//, '').toUpperCase() || 'OFFLINE FORM ACTION'}</div>
              <div className="text-muted" style={{
          fontSize: '0.8rem'
        }}>{t("queued_at")}{new Date(item.timestamp).toLocaleTimeString()}{t("data")}{JSON.stringify(item.payload).slice(0, 60)}...
              </div>
            </div>
            <span style={{
        padding: '0.25rem 0.6rem',
        borderRadius: 20,
        background: 'rgba(245,158,11,0.15)',
        color: 'var(--accent)',
        fontSize: '0.75rem',
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        gap: '0.3rem'
      }}>
              <Clock size={13} />{t("queued")}</span>
          </div>)}
    </div>;
}
function LiteVersion() {
  const {
    t
  } = useTranslation();
  const [messages, setMessages] = useState([{
    from: 'system',
    text: 'Welcome to AgriN SMS Service\n\nReply with:\n1️⃣ Weather forecast\n2️⃣ Market prices\n3️⃣ Crop advisory\n4️⃣ Government schemes\n0️⃣ Main menu'
  }]);
  const [input, setInput] = useState('');
  const RESPONSES = {
    '1': '🌤️ WEATHER (Your Area)\n━━━━━━━━━━━━━━\nToday: 32°C, Partly Cloudy\nRain: 25% chance\nWind: 12 km/h\n\nNext 3 days:\nTomorrow: 30°C, Rain 60%\nDay 3: 28°C, Cloudy\nDay 4: 31°C, Clear\n\n⚠️ Rain expected tomorrow.\nDelay spraying.\n\nReply 0 for menu',
    '2': '💰 MARKET PRICES (₹/quintal)\n━━━━━━━━━━━━━━━━━━━\nWheat:  ₹2,045 ▲ +1.2%\nRice:   ₹3,440 ▼ -0.5%\nSoybean: ₹3,158 ▲ +2.1%\nMaize:  ₹1,553 ▲ +0.8%\nCotton: ₹15,448/bale ▼ -1.3%\n\n📊 AI Signal: SELL wheat\n(4-month high)\n\nReply 0 for menu',
    '3': '🌾 CROP ADVISORY\n━━━━━━━━━━━━━━\n⚠️ HIGH ALERT: Wheat rust\nrisk elevated (humidity 82%)\n\n✅ Action needed:\n• Inspect fields within 24hrs\n• Apply tebuconazole if spots\n  found\n• Avoid overhead irrigation\n\n💡 TIP: Mulching reduces\nweeding time by 70%\n\nReply 0 for menu',
    '4': '🏛️ GOVT SCHEMES FOR YOU\n━━━━━━━━━━━━━━━━━━\n1. PM-KISAN: ₹6,000/yr\n   Status: Installment 18 due\n\n2. PMFBY: Crop insurance\n   Deadline: Jul 31\n   Premium: 2% only\n\n3. Soil Health Card\n   FREE soil testing\n   Apply at local KVK\n\n📞 Helpline: 1800-180-1551\n\nReply 0 for menu',
    '0': 'AgriN SMS Service\n\nReply with:\n1️⃣ Weather forecast\n2️⃣ Market prices\n3️⃣ Crop advisory\n4️⃣ Government schemes\n0️⃣ Main menu'
  };
  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = {
      from: 'user',
      text: input.trim()
    };
    const reply = RESPONSES[input.trim()] || '❌ Invalid option. Reply 0 for main menu.';
    setMessages(prev => [...prev, userMsg, {
      from: 'system',
      text: reply
    }]);
    setInput('');
  };
  return <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  }}>
      <div className="glass-panel" style={{
      padding: '1rem',
      background: 'rgba(139,92,246,0.08)',
      borderLeft: '3px solid var(--purple)'
    }}>
        <strong>{t("smsussd_simulator")}</strong>
        <p className="text-muted" style={{
        fontSize: '0.85rem',
        marginTop: '0.3rem'
      }}>{t("this_simulates_how_agrin_works")}</p>
      </div>

      <div className="glass-card" style={{
      padding: '0',
      overflow: 'hidden',
      maxWidth: '420px'
    }}>
        <div style={{
        background: 'var(--bg-card)',
        padding: '0.75rem 1rem',
        borderBottom: '1px solid var(--glass-border)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
          <MessageSquare size={16} color="var(--primary)" />
          <span style={{
          fontWeight: 600,
          fontSize: '0.9rem'
        }}>{t("agrin_sms_56070")}</span>
        </div>
        <div style={{
        padding: '1rem',
        height: '400px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        background: 'var(--soft-bg)'
      }}>
          {messages.map((msg, i) => <div key={i} style={{
          alignSelf: msg.from === 'user' ? 'flex-end' : 'flex-start',
          maxWidth: '85%',
          padding: '0.75rem 1rem',
          borderRadius: msg.from === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
          background: msg.from === 'user' ? 'var(--primary)' : 'var(--bg-card)',
          color: msg.from === 'user' ? '#fff' : 'var(--text-main)',
          fontSize: '0.82rem',
          whiteSpace: 'pre-line',
          lineHeight: 1.5,
          fontFamily: 'monospace',
          border: msg.from === 'system' ? '1px solid var(--glass-border)' : 'none'
        }}>
              {msg.text}
            </div>)}
        </div>
        <div style={{
        display: 'flex',
        borderTop: '1px solid var(--glass-border)',
        padding: '0.5rem'
      }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Type 1, 2, 3, 4 or 0..." style={{
          flex: 1,
          border: 'none',
          background: 'transparent',
          padding: '0.5rem',
          color: 'var(--text-main)',
          outline: 'none',
          fontSize: '0.9rem'
        }} />
          <button onClick={handleSend} className="btn-ghost" style={{
          padding: '0.4rem 0.8rem'
        }}>{t("send")}</button>
        </div>
      </div>
    </div>;
}
export default function OfflineHub() {
  const {
    t
  } = useTranslation();
  const [tab, setTab] = useState(0);
  const {
    online
  } = useConnectivity();
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
          <WifiOff size={30} style={{
          verticalAlign: 'middle',
          marginRight: '0.5rem',
          color: 'var(--purple)'
        }} />{t("offline_connectivity_hub")}</h1>
        <p className="text-muted">{t("access_agrin_features_without_")}</p>
      </header>

      <div className="hub-tabs">
        {TABS.map((t, i) => {
        const Icon = TAB_ICONS[i];
        return <button key={t} className={`hub-tab ${tab === i ? 'hub-tab-active' : ''}`} onClick={() => setTab(i)}>
              <Icon size={16} /> {['Offline Data Cache', 'Sync Queue Manager', 'SMS / USSD Lite Version'][i]}
            </button>;
      })}
      </div>

      {tab === 0 && <OfflineMode online={online} />}
      {tab === 1 && <SyncManager online={online} />}
      {tab === 2 && <LiteVersion />}

      <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
      gap: '1rem',
      marginTop: '1rem'
    }}>
        <a href="/privacy" className="glass-card" style={{
        padding: '1.25rem',
        textDecoration: 'none',
        color: 'inherit',
        borderLeft: '4px solid var(--primary)'
      }}>
          <strong style={{
          color: 'var(--primary)',
          fontSize: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          marginBottom: '0.3rem'
        }}>
            <ShieldCheck size={16} />{t("data_privacy_brics_consent")}</strong>
          <span className="text-muted" style={{
          fontSize: '0.8rem'
        }}>{t("manage_crossborder_data_permis")}</span>
        </a>

        <a href="/battery" className="glass-card" style={{
        padding: '1.25rem',
        textDecoration: 'none',
        color: 'inherit',
        borderLeft: '4px solid var(--accent)'
      }}>
          <strong style={{
          color: 'var(--accent)',
          fontSize: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          marginBottom: '0.3rem'
        }}>
            <Zap size={16} />{t("battery_saver_mode")}</strong>
          <span className="text-muted" style={{
          fontSize: '0.8rem'
        }}>{t("optimize_screen_background_cpu")}</span>
        </a>

        <a href="/app-size" className="glass-card" style={{
        padding: '1.25rem',
        textDecoration: 'none',
        color: 'inherit',
        borderLeft: '4px solid var(--secondary)'
      }}>
          <strong style={{
          color: 'var(--secondary)',
          fontSize: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          marginBottom: '0.3rem'
        }}>
            <Package size={16} />{t("progressive_apk_bundles")}</strong>
          <span className="text-muted" style={{
          fontSize: '0.8rem'
        }}>{t("manage_feature_packages_ondema")}</span>
        </a>
      </div>
    </div>;
}
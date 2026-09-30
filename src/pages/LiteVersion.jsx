import { useState } from 'react';
import { MessageSquare, Phone, Volume2, Smartphone, Send, Globe, CheckCircle2, ChevronRight, Hash } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePreferences } from '../contexts/PreferencesContext';
import { LANGUAGES } from '../i18n/languages';
import { useVoice } from '../hooks/useVoice';
export default function LiteVersion() {
  const {
    t
  } = useTranslation();
  const {
    preferences,
    setLanguage
  } = usePreferences();
  const {
    speak,
    speaking: ivrPlaying
  } = useVoice();
  const [activeTab, setActiveTab] = useState('sms'); // 'sms' | 'ussd' | 'ivr'

  // SMS Simulator State
  const [messages, setMessages] = useState([{
    from: 'system',
    text: '🌾 Welcome to AgriNet SMS Service!\n\nReply with:\n1️⃣ Weather Forecast\n2️⃣ Mandi Market Prices\n3️⃣ Crop Pest Advisory\n4️⃣ Government Schemes\n0️⃣ Main Menu'
  }]);
  const [smsInput, setSmsInput] = useState('');

  // USSD Simulator State
  const [ussdScreen, setUssdScreen] = useState('AgriNet USSD Service\n1. Market Prices\n2. Weather Forecast\n3. Pest Warning\n4. PM-KISAN Status\n0. Exit');
  const [ussdInput, setUssdInput] = useState('');

  // Voice IVR State

  const SMS_RESPONSES = {
    '1': '🌤️ WEATHER (Your District)\n━━━━━━━━━━━━━━\nToday: 32°C, Sunny\nRain Chance: 15%\nHumidity: 65%\n\nNext 3 Days:\nTomorrow: 30°C, Rain 70%\nDay 3: 28°C, Thunderstorm\n\n⚠️ Advisory: Delay pesticide spraying until Day 4.\n\nReply 0 for menu',
    '2': '💰 MANDI PRICES (₹/quintal)\n━━━━━━━━━━━━━━━━━━━\nWheat (Sharbati): ₹2,450 ▲\nPaddy (Basmati): ₹3,820 ▲\nSoybean (Yellow): ₹4,600 ▼\nCotton (Medium):  ₹6,200 ▲\n\n📊 AI Signal: High demand for Wheat in Indore Mandi.\n\nReply 0 for menu',
    '3': '🌾 CROP PEST ALERT\n━━━━━━━━━━━━━━\n⚠️ WHEAT RUST RISK: HIGH (84% Humidity)\n\nActions Needed:\n1. Inspect undersides of leaves\n2. Spray Propiconazole @ 1ml/L if rust spots appear\n3. Avoid overhead sprinkler irrigation\n\nReply 0 for menu',
    '4': '🏛️ GOVT SCHEMES\n━━━━━━━━━━━━━━\n1. PM-KISAN: ₹6,000/yr (Installment 18 Active)\n2. PM Crop Insurance: 2% Premium\n3. Soil Health Card: FREE Soil Test at KVK\n\n📞 Toll Free Helpline: 1800-180-1551\n\nReply 0 for menu',
    '0': '🌾 Welcome to AgriNet SMS Service!\n\nReply with:\n1️⃣ Weather Forecast\n2️⃣ Mandi Market Prices\n3️⃣ Crop Pest Advisory\n4️⃣ Government Schemes\n0️⃣ Main Menu'
  };
  const handleSmsSend = e => {
    e?.preventDefault();
    if (!smsInput.trim()) return;
    const userChoice = smsInput.trim();
    const userMsg = {
      from: 'user',
      text: userChoice
    };
    const reply = SMS_RESPONSES[userChoice] || '❌ Invalid Option. Reply 0 to return to Main Menu.';
    setMessages(prev => [...prev, userMsg, {
      from: 'system',
      text: reply
    }]);
    setSmsInput('');
  };
  const handleUssdSubmit = e => {
    e?.preventDefault();
    const choice = ussdInput.trim();
    if (choice === '1') {
      setUssdScreen('💰 MANDI PRICES\n1. Wheat: ₹2,450 (+1.5%)\n2. Rice: ₹3,820 (+0.8%)\n3. Cotton: ₹6,200 (+2.1%)\n0. Back');
    } else if (choice === '2') {
      setUssdScreen('🌤️ WEATHER\nToday: 32°C Sunny\nTomorrow: Rain 70%\nWind: 14 km/h SW\n0. Back');
    } else if (choice === '3') {
      setUssdScreen('⚠️ PEST WARNING\nWheat Rust Risk High!\nInspect undersides of leaves.\n0. Back');
    } else if (choice === '4') {
      setUssdScreen('🏛️ PM-KISAN\nInstallment 18 Processed\nAccount: *******4921\n0. Back');
    } else {
      setUssdScreen('AgriNet USSD Service\n1. Market Prices\n2. Weather Forecast\n3. Pest Warning\n4. PM-KISAN Status\n0. Exit');
    }
    setUssdInput('');
  };
  const handleVoicePlay = () => {
    speak(t('botDefaultReply'));
  };
  return <div className="animate-fade-in" style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem'
  }}>
      <header>
        <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        marginBottom: '0.4rem'
      }}>
          <Smartphone size={32} color="var(--purple)" />
          <h1 style={{
          fontSize: '2.4rem',
          margin: 0
        }}>{t("agrinet_lite_sms_ussd")}</h1>
        </div>
        <p className="text-muted">{t("ultralightweight_fallback_serv")}</p>
      </header>

      {/* Tabs for SMS, USSD, IVR */}
      <div className="hub-tabs">
        <button className={`hub-tab ${activeTab === 'sms' ? 'hub-tab-active' : ''}`} onClick={() => setActiveTab('sms')}>
          <MessageSquare size={16} />{t("2way_sms_service_56070")}</button>
        <button className={`hub-tab ${activeTab === 'ussd' ? 'hub-tab-active' : ''}`} onClick={() => setActiveTab('ussd')}>
          <Hash size={16} />{t("interactive_ussd_560")}</button>
        <button className={`hub-tab ${activeTab === 'ivr' ? 'hub-tab-active' : ''}`} onClick={() => setActiveTab('ivr')}>
          <Volume2 size={16} />{t("voice_call_ivr_outbound_adviso")}</button>
      </div>

      {/* TAB 1: SMS SERVICE SIMULATOR */}
      {activeTab === 'sms' && <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: '1.5rem'
    }}>
          {/* Phone Screen Mockup */}
          <div className="glass-card" style={{
        padding: 0,
        overflow: 'hidden',
        maxWidth: '420px',
        margin: '0 auto',
        width: '100%',
        border: '2px solid var(--glass-border)'
      }}>
            <div style={{
          background: 'var(--bg-card)',
          padding: '0.85rem 1.25rem',
          borderBottom: '1px solid var(--glass-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
              <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
                <MessageSquare size={18} color="var(--primary)" />
                <span style={{
              fontWeight: 700,
              fontSize: '0.95rem'
            }}>{t("agrinet_sms_56070")}</span>
              </div>
              <span className="badge-pill" style={{
            background: 'rgba(16,185,129,0.15)',
            color: 'var(--primary)',
            fontSize: '0.72rem'
          }}>{t("2g_sms_active")}</span>
            </div>

            <div style={{
          padding: '1rem',
          height: '420px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem',
          background: 'var(--soft-bg)'
        }}>
              {messages.map((msg, i) => <div key={i} style={{
            alignSelf: msg.from === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '85%',
            padding: '0.75rem 1rem',
            borderRadius: msg.from === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
            background: msg.from === 'user' ? 'var(--primary)' : 'var(--bg-card)',
            color: msg.from === 'user' ? '#ffffff' : 'var(--text-main)',
            fontSize: '0.84rem',
            whiteSpace: 'pre-line',
            lineHeight: 1.5,
            fontFamily: 'monospace',
            boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
            border: msg.from === 'system' ? '1px solid var(--glass-border)' : 'none'
          }}>
                  {msg.text}
                </div>)}
            </div>

            <form onSubmit={handleSmsSend} style={{
          display: 'flex',
          borderTop: '1px solid var(--glass-border)',
          padding: '0.6rem',
          background: 'var(--bg-card)'
        }}>
              <input value={smsInput} onChange={e => setSmsInput(e.target.value)} placeholder="Type 1, 2, 3, 4 or 0..." style={{
            flex: 1,
            border: 'none',
            background: 'transparent',
            padding: '0.5rem 0.75rem',
            color: 'var(--text-main)',
            outline: 'none',
            fontSize: '0.9rem'
          }} />
              <button type="submit" className="btn-primary" style={{
            padding: '0.5rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem'
          }}>
                <Send size={14} />{t("send")}</button>
            </form>
          </div>

          {/* SMS Shortcodes Cheatsheet */}
          <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
            <h3 style={{
          fontSize: '1.15rem'
        }}>{t("popular_farmer_shortcodes")}</h3>
            <p className="text-muted" style={{
          fontSize: '0.85rem'
        }}>{t("farmers_can_send_standard_text")}</p>

            <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
              {[{
            code: 'AGRI WHEAT MUMBAI',
            desc: 'Get instant Mandi price for Wheat in Mumbai Mandi'
          }, {
            code: 'AGRI RAIN 452001',
            desc: 'Get 3-day rainfall forecast for Pincode 452001'
          }, {
            code: 'AGRI SCHEME PMKISAN',
            desc: 'Check latest installment status for PM-KISAN'
          }, {
            code: 'AGRI PEST COTTON',
            desc: 'Receive cotton bollworm treatment advisory'
          }].map((item, idx) => <div key={idx} className="glass-card" style={{
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
                  <div>
                    <code style={{
                background: 'var(--soft-bg)',
                padding: '0.2rem 0.6rem',
                borderRadius: '4px',
                fontWeight: 700,
                color: 'var(--primary)',
                fontSize: '0.9rem'
              }}>
                      {item.code}
                    </code>
                    <span className="text-muted" style={{
                fontSize: '0.82rem',
                display: 'block',
                marginTop: '0.3rem'
              }}>
                      {item.desc}
                    </span>
                  </div>
                  <span style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)'
            }}>{t("free_sms")}</span>
                </div>)}
            </div>
          </div>
        </div>}

      {/* TAB 2: USSD SIMULATOR (*560#) */}
      {activeTab === 'ussd' && <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '1.5rem',
      alignItems: 'start'
    }}>
          {/* Nokia style feature phone screen */}
          <div className="glass-card" style={{
        padding: '1.5rem',
        maxWidth: '380px',
        margin: '0 auto',
        width: '100%',
        background: '#1e293b',
        color: '#38bdf8',
        borderRadius: '16px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
      }}>
            <div style={{
          textAlign: 'center',
          fontSize: '0.8rem',
          opacity: 0.8,
          marginBottom: '0.8rem',
          borderBottom: '1px solid #334155',
          paddingBottom: '0.4rem',
          color: '#94a3b8'
        }}>{t("gsm_cellular_network_dialed_56")}</div>

            <div style={{
          background: '#0f172a',
          padding: '1.25rem',
          borderRadius: '8px',
          minHeight: '180px',
          fontFamily: 'monospace',
          fontSize: '0.88rem',
          whiteSpace: 'pre-line',
          border: '1px solid #334155',
          color: '#4ade80',
          lineHeight: 1.6
        }}>
              {ussdScreen}
            </div>

            <form onSubmit={handleUssdSubmit} style={{
          marginTop: '1rem',
          display: 'flex',
          gap: '0.5rem'
        }}>
              <input value={ussdInput} onChange={e => setUssdInput(e.target.value)} placeholder="Enter option..." style={{
            flex: 1,
            padding: '0.6rem',
            borderRadius: '6px',
            border: '1px solid #334155',
            background: '#0f172a',
            color: '#fff',
            outline: 'none',
            fontFamily: 'monospace'
          }} />
              <button type="submit" style={{
            padding: '0.6rem 1rem',
            background: '#22c55e',
            color: '#000',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 700,
            cursor: 'pointer'
          }}>{t("reply")}</button>
            </form>
          </div>

          <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
            <h3 style={{
          fontSize: '1.15rem'
        }}>{t("why_ussd_for_rural_agriculture")}</h3>
            <div className="glass-card" style={{
          padding: '1.25rem',
          borderLeft: '4px solid var(--primary)'
        }}>
              <strong>{t("instant_response_zero_data_req")}</strong>
              <p className="text-muted" style={{
            fontSize: '0.88rem',
            marginTop: '0.4rem',
            lineHeight: 1.6
          }}>{t("ussd_runs_directly_over_signal")}<code>{t("560")}</code>{t("to_query_crop_market_prices_in")}</p>
            </div>
          </div>
        </div>}

      {/* TAB 3: VOICE CALL IVR SIMULATOR */}
      {activeTab === 'ivr' && <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      maxWidth: '600px'
    }}>
          <div className="glass-card" style={{
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.2rem'
      }}>
            <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
              <Volume2 size={24} color="var(--primary)" />
              <div>
                <strong style={{
              fontSize: '1.05rem',
              display: 'block'
            }}>{t("outbound_voice_call_advisory_i")}</strong>
                <span className="text-muted" style={{
              fontSize: '0.85rem'
            }}>{t("for_illiterate_smallholders_wh")}</span>
              </div>
            </div>

            <div>
              <label style={{
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'block',
            marginBottom: '0.4rem'
          }}>{t("select_preferred_regional_lang")}</label>
              <select value={preferences.language} onChange={e => setLanguage(e.target.value)} style={{
            width: '100%',
            padding: '0.6rem 0.8rem',
            borderRadius: '8px',
            border: '1px solid var(--glass-border)',
            background: 'var(--bg-card)',
            color: 'var(--text-main)',
            outline: 'none'
          }}>
                {LANGUAGES.map(language => <option key={language.code} value={language.code}>{language.nativeLabel}</option>)}
              </select>
            </div>

            <button onClick={handleVoicePlay} disabled={ivrPlaying} className="btn-primary" style={{
          padding: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          fontWeight: 700
        }}>
              <Phone size={18} className={ivrPlaying ? 'animate-pulse' : ''} />
              {ivrPlaying ? 'Simulating Incoming Advisory Voice Call...' : 'Test Incoming Voice Call Advisory'}
            </button>
          </div>
        </div>}
    </div>;
}
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { usePreferences } from '../contexts/PreferencesContext';
import { LANGUAGES } from '../i18n/languages';
import { Languages, MapPin, LocateFixed, Menu, X, Globe, Phone, Mail, Send, CheckCircle, Sparkles, ShieldCheck, Layers, ChevronRight, User } from 'lucide-react';
import FadingVideo from '../components/FadingVideo';
import '../styles/fonts.css';
import '../styles/theme.css';
export default function LandingPage() {
  const {
    t
  } = useTranslation();
  const {
    preferences,
    setLanguage,
    requestLocation,
    locationStatus
  } = usePreferences();
  const navigate = useNavigate();

  // State for transparent dropdown menu and info modals
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'features' | 'about' | 'brics' | 'contact' | null
  const dropdownRef = useRef(null);

  // Form state for Contact modal
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const openModal = modalName => {
    setActiveModal(modalName);
    setIsDropdownOpen(false);
  };
  const handleContactSubmit = e => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => {
      setContactSubmitted(false);
      setContactName('');
      setContactPhone('');
      setContactMessage('');
      setActiveModal(null);
    }, 2500);
  };
  return <div style={{
    background: "url('/farm_bg.jpg') center/cover no-repeat fixed #051a0e",
    minHeight: '100vh',
    overflowY: 'auto',
    position: 'relative'
  }}>

      {/* ── Animated Slow-Motion Zoom Background Image ─────────── */}
      <motion.div animate={{
      scale: [1, 1.12, 1]
    }} transition={{
      duration: 28,
      repeat: Infinity,
      ease: 'easeInOut'
    }} style={{
      position: 'absolute',
      inset: 0,
      backgroundImage: "url('/farm_bg.jpg')",
      backgroundSize: 'cover',
      backgroundPosition: 'center center',
      zIndex: 0
    }} />

      {/* ── Gradient scrim — strong at top & bottom, light in middle ── */}
      <div style={{
      position: 'absolute',
      inset: 0,
      zIndex: 1,
      background: `
          linear-gradient(180deg,
            rgba(0,0,0,0.78) 0%,
            rgba(0,0,0,0.35) 30%,
            rgba(0,0,0,0.25) 55%,
            rgba(0,0,0,0.65) 80%,
            rgba(0,0,0,0.88) 100%
          )
        `,
      pointerEvents: 'none'
    }} />

      {/* ── ALL CONTENT ───────────────────────────────────────────── */}
      <div style={{
      position: 'relative',
      zIndex: 10,
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>

        {/* ── Navbar ──────────────────────────────────────────────── */}
        <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 1.75rem',
        position: 'relative'
      }}>
          {/* Logo */}
          <span onClick={() => navigate('/')} style={{
          fontFamily: "'Barlow', sans-serif",
          fontWeight: 800,
          fontStyle: 'normal',
          fontSize: '2rem',
          color: '#ffffff',
          letterSpacing: '-0.02em',
          lineHeight: 1,
          textShadow: '0 2px 12px rgba(0,0,0,0.5)',
          cursor: 'pointer'
        }}>{t("agrin")}</span>

          {/* Right Action Bar */}
          <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          position: 'relative',
          flexWrap: 'wrap'
        }} ref={dropdownRef}>
            
            {/* Action Bar Links */}
            <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            marginRight: '0.4rem',
            flexWrap: 'wrap'
          }}>
              {[{
              label: t('aboutUs', 'About Us'),
              modal: 'about'
            }, {
              label: t('contact', 'Contact'),
              modal: 'contact'
            }, {
              label: t('bricsNetwork', 'BRICS Network'),
              modal: 'brics'
            }].map(item => <button key={item.modal} onClick={() => openModal(item.modal)} style={{
              fontFamily: "'Barlow', sans-serif",
              fontSize: '0.82rem',
              fontWeight: 600,
              color: '#ffffff',
              background: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              borderRadius: '9999px',
              padding: '0.4rem 1rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }} onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
            }} onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
            }}>
                  {item.label}
                </button>)}
            </div>

            {/* Sign In nav button */}
            <button onClick={() => navigate('/login')} id="nav-signin-btn" style={{
            fontFamily: "'Barlow', sans-serif",
            fontSize: '0.82rem',
            fontWeight: 600,
            color: '#000000',
            background: '#ffffff',
            border: 'none',
            borderRadius: '9999px',
            padding: '0.45rem 1.2rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
            transition: 'transform 0.2s, opacity 0.2s',
            letterSpacing: '0.01em'
          }} onMouseEnter={e => e.currentTarget.style.opacity = '0.88'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>{t("signIn", "Sign In")}</button>

          </div>
        </nav>

        {/* ── Hero Text Block ──────────────────────────────────────── */}
        <div style={{
        flex: '1 0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem 1.25rem',
        textAlign: 'center',
        margin: 'auto 0'
      }}>

          {/* Eyebrow badge */}
          <motion.div initial={{
          opacity: 0,
          y: 16
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.7,
          delay: 0.2
        }} style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          background: 'rgba(255,255,255,0.12)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.22)',
          borderRadius: '9999px',
          padding: '0.3rem 0.85rem',
          marginBottom: '1rem'
        }}>
            <span style={{
            background: '#22c55e',
            color: '#fff',
            fontSize: '9px',
            fontWeight: 700,
            borderRadius: '9999px',
            padding: '2px 7px',
            fontFamily: "'Barlow', sans-serif",
            letterSpacing: '0.05em',
            textTransform: 'uppercase'
          }}>{t("new")}</span>
            <span style={{
            fontFamily: "'Barlow', sans-serif",
            fontSize: '0.78rem',
            color: 'rgba(255,255,255,0.92)',
            fontWeight: 400,
            letterSpacing: '0.01em'
          }}>{t("aipowered_crop_intelligence_no")}</span>
          </motion.div>

          {/* Main headline */}
          <motion.h1 initial={{
          opacity: 0,
          y: 24
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.9,
          delay: 0.35
        }} style={{
          fontFamily: "'Barlow', 'Inter', sans-serif",
          fontStyle: 'normal',
          fontWeight: 800,
          fontSize: 'clamp(1.8rem, 4vw, 3.6rem)',
          color: '#ffffff',
          letterSpacing: '-0.03em',
          lineHeight: 1.15,
          maxWidth: '820px',
          margin: '0 auto',
          textShadow: '0 4px 32px rgba(0,0,0,0.4)'
        }}>{t("where_every_seed")}{" "}
            <em style={{
            color: 'rgba(255,255,255,0.85)',
            display: 'inline-block',
            fontStyle: 'normal'
          }}>{t("finds_its_season")}</em>
          </motion.h1>

          {/* Subtitle */}
          <motion.p initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8,
          delay: 0.6
        }} style={{
          fontFamily: "'Barlow', sans-serif",
          fontWeight: 300,
          fontSize: 'clamp(0.85rem, 1.2vw, 0.98rem)',
          color: 'rgba(255,255,255,0.78)',
          maxWidth: '560px',
          lineHeight: 1.5,
          margin: '0.85rem auto 0',
          letterSpacing: '0.01em'
        }}>{t("agrin_brings_precision_crop_di")}</motion.p>

          {/* CTA Buttons */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8,
          delay: 0.85
        }} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginTop: '1.25rem',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
            {/* Primary CTA */}
            <button onClick={() => navigate('/login')} id="hero-get-started-btn" style={{
            fontFamily: "'Barlow', sans-serif",
            fontWeight: 600,
            fontSize: '0.88rem',
            color: '#000000',
            background: '#ffffff',
            border: 'none',
            borderRadius: '9999px',
            padding: '0.7rem 1.8rem',
            cursor: 'pointer',
            letterSpacing: '0.01em',
            boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }} onMouseEnter={e => {
            e.currentTarget.style.transform = 'scale(1.04)';
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.4)';
          }} onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.35)';
          }}>{t("start_farming_smart")}</button>

            {/* Secondary CTA */}
            <button onClick={() => navigate('/login')} id="hero-login-btn" style={{
            fontFamily: "'Barlow', sans-serif",
            fontWeight: 500,
            fontSize: '0.85rem',
            color: '#ffffff',
            background: 'rgba(255,255,255,0.12)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.28)',
            borderRadius: '9999px',
            padding: '0.7rem 1.6rem',
            cursor: 'pointer',
            letterSpacing: '0.01em',
            transition: 'background 0.2s, border-color 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }} onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.45)';
          }} onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.28)';
          }}>{t("sign_in_to_dashboard")}</button>
          </motion.div>

          {/* Feature pills */}
          <motion.div initial={{
          opacity: 0,
          y: 16
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8,
          delay: 1.05
        }} style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          marginTop: '1.25rem',
          justifyContent: 'center'
        }}>
            {[{
            text: `🌱 ${t('cropDiagnostics', 'Crop Diagnostics')}`,
            modal: 'features'
          }, {
            text: `🌤️ ${t('weatherForecast', 'Weather Forecast')}`,
            modal: 'features'
          }, {
            text: `📈 ${t('marketPrices', 'Live Mandi Prices')}`,
            modal: 'features'
          }, {
            text: `🏛️ ${t('govtSchemes', 'Govt Schemes')}`,
            modal: 'features'
          }, {
            text: `🤖 ${t('agroBot', 'AI Agro-Bot')}`,
            modal: 'features'
          }].map(feat => <span key={feat.text} onClick={() => openModal(feat.modal)} style={{
            fontFamily: "'Barlow', sans-serif",
            fontSize: '0.72rem',
            fontWeight: 400,
            color: 'rgba(255,255,255,0.88)',
            background: 'rgba(255,255,255,0.12)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '9999px',
            padding: '0.3rem 0.8rem',
            letterSpacing: '0.01em',
            whiteSpace: 'nowrap',
            cursor: 'pointer'
          }}>
                {feat.text}
              </span>)}
          </motion.div>

        </div>

        {/* ── Bottom bar ───────────────────────────────────────────── */}
        <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} transition={{
        duration: 1,
        delay: 1.2
      }} style={{
        width: '100%',
        marginTop: 'auto',
        paddingBottom: '0.5rem'
      }}>


          {/* Footer meta */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '0.75rem 1.5rem',
            borderTop: '1px solid rgba(255,255,255,0.18)',
            marginTop: '0.5rem',
            background: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(10px)',
            borderRadius: '0 0 16px 16px',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            <span style={{
              fontSize: '0.82rem',
              color: 'rgba(255,255,255,0.9)',
              fontFamily: "'Barlow', sans-serif",
              fontWeight: 500,
              letterSpacing: '0.3px'
            }}>
              © {new Date().getFullYear()} {t("agrin_global_agriculture_intel")}
            </span>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem'
            }}>
              {/* Language Selector Pill */}
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.82rem',
                color: '#ffffff',
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 600,
                cursor: 'pointer',
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.35)',
                padding: '0.35rem 0.8rem',
                borderRadius: '20px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                transition: 'all 0.2s ease'
              }}>
                <Languages size={15} style={{ color: '#4ade80' }} />
                <select 
                  value={preferences.language} 
                  onChange={e => setLanguage(e.target.value)} 
                  aria-label={t('chooseLanguage')} 
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ffffff',
                    outline: 'none',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: "'Barlow', sans-serif"
                  }}
                >
                  {LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code} style={{ background: '#18181b', color: '#ffffff' }}>
                      {lang.nativeLabel}
                    </option>
                  ))}
                </select>
              </label>

              {/* Location Detector Pill */}
              <button 
                onClick={() => requestLocation().catch(() => {})} 
                disabled={locationStatus === 'locating'} 
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.35)',
                  padding: '0.35rem 0.8rem',
                  borderRadius: '20px',
                  fontSize: '0.82rem',
                  color: '#ffffff',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: "'Barlow', sans-serif",
                  boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                  transition: 'all 0.2s ease'
                }}
              >
                <MapPin size={14} style={{ color: '#60a5fa' }} />
                <span>{locationStatus === 'locating' ? 'Detecting…' : (preferences.location?.label || 'Detect location')}</span>
                <LocateFixed size={13} style={{ color: '#60a5fa', marginLeft: '2px' }} />
              </button>
            </div>
          </div>
        </motion.div>

      </div>

      {/* ── INTERACTIVE INFO MODALS (BRICS, Contact, Features, About Us) ── */}
      <AnimatePresence>
        {activeModal && <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: 'rgba(0, 0, 0, 0.78)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem'
      }} onClick={() => setActiveModal(null)}>
            <motion.div initial={{
          scale: 0.9,
          y: 20
        }} animate={{
          scale: 1,
          y: 0
        }} exit={{
          scale: 0.9,
          y: 20
        }} transition={{
          type: 'spring',
          damping: 25,
          stiffness: 300
        }} onClick={e => e.stopPropagation()} style={{
          width: '100%',
          maxWidth: '650px',
          maxHeight: '88vh',
          overflowY: 'auto',
          background: '#ffffff',
          border: '1.5px solid rgba(0, 0, 0, 0.08)',
          borderRadius: '24px',
          padding: '2rem',
          color: '#0f172a',
          boxShadow: '0 25px 60px rgba(0,0,0,0.15)',
          position: 'relative'
        }}>
              {/* Close Button */}
              <button onClick={() => setActiveModal(null)} style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'rgba(0, 0, 0, 0.05)',
            border: 'none',
            color: '#0f172a',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 0.2s'
          }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)'}>
                <X size={20} />
              </button>

              {/* 1. BRICS Network Modal */}
              {activeModal === 'brics' && <div>
                  <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.25rem'
            }}>
                    <div style={{
                padding: '0.6rem',
                borderRadius: '12px',
                background: 'rgba(59, 130, 246, 0.15)',
                color: '#3b82f6'
              }}>
                      <Globe size={28} />
                    </div>
                    <div>
                      <h2 style={{
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  margin: 0,
                  fontFamily: "'Barlow', 'Inter', sans-serif",
                  fontStyle: 'normal'
                }}>{t("brics_agricultural_network_agr")}</h2>
                      <span style={{
                  fontSize: '0.78rem',
                  color: '#3b82f6',
                  fontWeight: 700
                }}>{t("cooperation_framework_india_pr")}</span>
                    </div>
                  </div>

                  <p style={{
              color: 'rgba(0,0,0,0.75)',
              fontSize: '0.92rem',
              lineHeight: 1.6,
              marginBottom: '1.5rem'
            }}>{t("the")}<strong>{t("brics_agrin")}</strong>{t("agroinputs_genetic_resources_i")}</p>

                  <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '0.75rem',
              marginBottom: '1.5rem'
            }}>
                    {[{
                name: 'India',
                flag: '🇮🇳',
                role: 'AgriStack & AI Hub'
              }, {
                name: 'Brazil',
                flag: '🇧🇷',
                role: 'EMBRAPA Bio-Tech'
              }, {
                name: 'Russia',
                flag: '🇷🇺',
                role: 'Cold Seed Vaults'
              }, {
                name: 'China',
                flag: '🇨🇳',
                role: 'CAAS Drip Innovation'
              }, {
                name: 'South Africa',
                flag: '🇿🇦',
                role: 'Acacia Agroforestry'
              }].map(c => <div key={c.name} style={{
                background: '#f8fafc',
                padding: '0.85rem',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                textAlign: 'center'
              }}>
                        <div style={{
                  fontSize: '1.8rem',
                  marginBottom: '0.2rem'
                }}>{c.flag}</div>
                        <div style={{
                  fontWeight: 700,
                  fontSize: '0.88rem'
                }}>{c.name}</div>
                        <small style={{
                  fontSize: '0.68rem',
                  color: 'rgba(0,0,0,0.55)',
                  display: 'block',
                  marginTop: '0.2rem'
                }}>{c.role}</small>
                      </div>)}
                  </div>

                  <div style={{
              background: 'rgba(16, 185, 129, 0.08)',
              padding: '1.2rem',
              borderRadius: '16px',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              marginBottom: '1.5rem'
            }}>
                    <h4 style={{
                margin: '0 0 0.5rem 0',
                color: '#10b981',
                fontSize: '0.95rem',
                fontWeight: 800
              }}>{t("key_objectives_technical_initi")}</h4>
                    <ul style={{
                paddingLeft: '1.2rem',
                margin: 0,
                fontSize: '0.85rem',
                color: 'rgba(0,0,0,0.75)',
                lineHeight: 1.7
              }}>
                      <li><strong>{t("germplasm_exchange")}</strong>{t("sharing_climateresilient_indig")}</li>
                      <li><strong>{t("anticounterfeit_protection")}</strong>{t("qr_serialization_database_for_")}</li>
                      <li><strong>{t("knowledge_sharing")}</strong>{t("multilingual_peertopeer_knowle")}</li>
                    </ul>
                  </div>

                  <button onClick={() => {
              setActiveModal(null);
              navigate('/login');
            }} style={{
              width: '100%',
              background: '#10b981',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '0.85rem',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}>{t("access_brics_knowledge_exchang")}</button>
                </div>}

              {/* 2. Contact Us Modal */}
              {activeModal === 'contact' && <div>
                  <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.25rem'
            }}>
                    <div style={{
                padding: '0.6rem',
                borderRadius: '12px',
                background: 'rgba(245, 158, 11, 0.15)',
                color: '#f59e0b'
              }}>
                      <Phone size={28} />
                    </div>
                    <div>
                      <h2 style={{
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  margin: 0,
                  fontFamily: "'Barlow', 'Inter', sans-serif",
                  fontStyle: 'normal'
                }}>{t("contact_agrin_support_helpdesk")}</h2>
                      <span style={{
                  fontSize: '0.78rem',
                  color: '#f59e0b',
                  fontWeight: 700
                }}>{t("247_farmer_helpline_direct_inq")}</span>
                    </div>
                  </div>

                  {contactSubmitted ? <div style={{
              padding: '2rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem'
            }}>
                      <CheckCircle size={56} color="#10b981" />
                      <h3 style={{
                fontSize: '1.3rem',
                margin: 0
              }}>{t("message_sent_successfully")}</h3>
                      <p style={{
                color: 'rgba(0,0,0,0.65)',
                fontSize: '0.88rem'
              }}>{t("our_agricultural_specialist_te")}</p>
                    </div> : <div>
                      <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.75rem',
                marginBottom: '1.25rem'
              }}>
                        <div style={{
                  background: '#f8fafc',
                  padding: '1rem',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0'
                }}>
                          <small style={{
                    color: 'rgba(0,0,0,0.55)',
                    fontSize: '0.7rem'
                  }}>{t("tollfree_kisan_call_center")}</small>
                          <div style={{
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    color: '#10b981',
                    marginTop: '0.2rem'
                  }}>{t("18001801551")}</div>
                        </div>
                        <div style={{
                  background: '#f8fafc',
                  padding: '1rem',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0'
                }}>
                          <small style={{
                    color: 'rgba(0,0,0,0.55)',
                    fontSize: '0.7rem'
                  }}>{t("official_support_email")}</small>
                          <div style={{
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: '#0f172a',
                    marginTop: '0.2rem'
                  }}>{t("supportagrinetorg")}</div>
                        </div>
                      </div>

                      <form onSubmit={handleContactSubmit} style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem'
              }}>
                        <div>
                          <label style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: 'rgba(0,0,0,0.7)',
                    display: 'block',
                    marginBottom: '0.35rem'
                  }}>{t("your_name")}</label>
                          <input type="text" required placeholder="Enter full name" value={contactName} onChange={e => setContactName(e.target.value)} style={{
                    width: '100%',
                    padding: '0.7rem 0.9rem',
                    borderRadius: '10px',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#0f172a',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }} />
                        </div>

                        <div>
                          <label style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: 'rgba(0,0,0,0.7)',
                    display: 'block',
                    marginBottom: '0.35rem'
                  }}>{t("phone_number")}</label>
                          <input type="tel" required placeholder="+91 Mobile number" value={contactPhone} onChange={e => setContactPhone(e.target.value)} style={{
                    width: '100%',
                    padding: '0.7rem 0.9rem',
                    borderRadius: '10px',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#0f172a',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }} />
                        </div>

                        <div>
                          <label style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: 'rgba(0,0,0,0.7)',
                    display: 'block',
                    marginBottom: '0.35rem'
                  }}>{t("how_can_we_help_you")}</label>
                          <textarea required rows={3} placeholder="Ask about crop diseases, Mandi rates, seed orders, or government schemes..." value={contactMessage} onChange={e => setContactMessage(e.target.value)} style={{
                    width: '100%',
                    padding: '0.7rem 0.9rem',
                    borderRadius: '10px',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#0f172a',
                    fontSize: '0.88rem',
                    outline: 'none',
                    resize: 'none'
                  }} />
                        </div>

                        <button type="submit" style={{
                  marginTop: '0.4rem',
                  padding: '0.85rem',
                  background: '#f59e0b',
                  color: '#000',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem'
                }}>
                          <Send size={16} />{t("submit_farmer_support_request")}</button>
                      </form>
                    </div>}
                </div>}

              {/* 3. Features Modal */}
              {activeModal === 'features' && <div>
                  <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.25rem'
            }}>
                    <div style={{
                padding: '0.6rem',
                borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981'
              }}>
                      <Sparkles size={28} />
                    </div>
                    <div>
                      <h2 style={{
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  margin: 0,
                  fontFamily: "'Barlow', 'Inter', sans-serif",
                  fontStyle: 'normal'
                }}>{t("agrin_core_platform_modules")}</h2>
                      <span style={{
                  fontSize: '0.78rem',
                  color: '#10b981',
                  fontWeight: 700
                }}>{t("endtoend_digital_agriculture_e")}</span>
                    </div>
                  </div>

                  <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
                    {[{
                icon: '🌿',
                title: 'AI Disease Diagnosis',
                desc: 'Instant leaf photo symptom detection with voice assistant in 6 regional languages.'
              }, {
                icon: '📈',
                title: 'Real-Time Mandi Prices',
                desc: 'Live APMC Mandi commodity rates with AI Sell/Hold signal advisories.'
              }, {
                icon: '🛰️',
                title: 'Satellite NDVI Maps',
                desc: 'Remote sensing vegetation health index and soil moisture heatmaps.'
              }, {
                icon: '🚜',
                title: 'Peer Equipment Exchange',
                desc: 'Tractor, drone, and labor team rental booking marketplace.'
              }, {
                icon: '🛡️',
                title: 'Input Anti-Counterfeit',
                desc: 'QR packaging scanner linked with official AGRIN registry verification.'
              }, {
                icon: '🏛️',
                title: 'Govt Scheme Matcher',
                desc: 'Instant eligibility checks for PM-KISAN, PMFBY insurance, and subsidies.'
              }].map(f => <div key={f.title} style={{
                background: '#ffffff',
                padding: '1rem',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
              }}>
                        <div style={{
                  fontSize: '1.5rem',
                  marginBottom: '0.3rem'
                }}>{f.icon}</div>
                        <div style={{
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  marginBottom: '0.2rem'
                }}>{f.title}</div>
                        <p style={{
                  fontSize: '0.78rem',
                  color: 'rgba(0,0,0,0.65)',
                  margin: 0,
                  lineHeight: 1.4
                }}>{f.desc}</p>
                      </div>)}
                  </div>

                  <button onClick={() => {
              setActiveModal(null);
              navigate('/login');
            }} style={{
              width: '100%',
              background: '#0f172a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '0.85rem',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}>{t("explore_all_features_in_app")}</button>
                </div>}

              {/* 4. About Us Modal */}
              {activeModal === 'about' && <div>
                  <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.25rem'
            }}>
                    <div style={{
                padding: '0.6rem',
                borderRadius: '12px',
                background: 'rgba(139, 92, 246, 0.15)',
                color: '#8b5cf6'
              }}>
                      <ShieldCheck size={28} />
                    </div>
                    <div>
                      <h2 style={{
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  margin: 0,
                  fontFamily: "'Barlow', 'Inter', sans-serif",
                  fontStyle: 'normal'
                }}>{t("about_agrin_ecosystem")}</h2>
                      <span style={{
                  fontSize: '0.78rem',
                  color: '#8b5cf6',
                  fontWeight: 700
                }}>{t("empowering_smallholder_farmers")}</span>
                    </div>
                  </div>

                  <p style={{
              color: 'rgba(0,0,0,0.75)',
              fontSize: '0.92rem',
              lineHeight: 1.65,
              marginBottom: '1.25rem'
            }}>
                    <strong>{t("agrin")}</strong>{t("was_founded_to_bridge_the_gap_")}</p>

                  <div style={{
              background: 'rgba(139, 92, 246, 0.08)',
              padding: '1.2rem',
              borderRadius: '16px',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              marginBottom: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              fontSize: '0.85rem'
            }}>
                    <div>🔒 <strong>{t("farmer_data_sovereignty")}</strong>{t("localfirst_encrypted_storage_w")}</div>
                    <div>📶 <strong>{t("lowbandwidth_design")}</strong>{t("works_reliably_on_2g3g_network")}</div>
                    <div>🤝 <strong>{t("fair_market_linkages")}</strong>{t("direct_buyer_connections_elimi")}</div>
                  </div>

                  <button onClick={() => {
              setActiveModal(null);
              navigate('/login');
            }} style={{
              width: '100%',
              background: '#8b5cf6',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '0.85rem',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}>{t("join_the_agrin_platform")}</button>
                </div>}

            </motion.div>
          </motion.div>}
      </AnimatePresence>

    </div>;
}
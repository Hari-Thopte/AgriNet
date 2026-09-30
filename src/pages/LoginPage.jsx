import { useTranslation } from "react-i18next";
import { useState, Suspense, lazy } from 'react';
import { Eye, EyeOff, Leaf, Lock, Mail, User, Globe, Shield, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { LANGUAGES } from '../contexts/LanguageContext';
const GlobeScene = lazy(() => import('../components/3d/GlobeScene'));
const BASE = 'http://localhost:8000';
const COUNTRIES = ['India', 'Brazil', 'Russia', 'China', 'South Africa', 'Other'];
function passwordStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}
const STRENGTH_LABELS = ['', 'weak', 'fair', 'fair', 'strong', 'veryStrong'];
const STRENGTH_COLORS = ['', 'var(--danger)', 'var(--accent)', 'var(--accent)', 'var(--primary)', 'var(--primary)'];
export default function LoginPage() {
  const {
    login,
    register
  } = useAuth();
  const {
    t,
    lang,
    switchLang
  } = useTranslation();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    country: 'India'
  });
  const pw = form.password;
  const strength = passwordStrength(pw);
  const update = k => e => setForm(p => ({
    ...p,
    [k]: e.target.value
  }));
  const submit = async e => {
    e.preventDefault();
    setError('');
    if (mode === 'register') {
      if (form.password !== form.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (strength < 2) {
        setError('Password too weak — add uppercase, numbers or symbols');
        return;
      }
    }
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register(form.fullName, form.email, form.password);
      }
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const currentLang = LANGUAGES.find(l => l.code === lang);
  return <div style={{
    position: 'fixed',
    inset: 0,
    display: 'flex',
    overflow: 'hidden',
    background: '#050a14'
  }}>

      {/* 3D Globe — left half */}
      <div style={{
      flex: 1,
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
        {/* Background 3D */}
        <Suspense fallback={<div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle, #0c2a4a 0%, #050a14 70%)'
      }} />}>
          <div style={{
          position: 'absolute',
          inset: 0
        }}>
            <GlobeScene />
          </div>
        </Suspense>

        {/* Overlay text */}
        <div style={{
        position: 'relative',
        zIndex: 2,
        textAlign: 'center',
        padding: '2rem',
        pointerEvents: 'none'
      }}>
          <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          marginBottom: '1.5rem'
        }}>
            <Leaf size={36} color="var(--primary)" />
            <span style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #10b981, #3b82f6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>{t("brics_agrin")}</span>
          </div>
          <p style={{
          color: 'rgba(255,255,255,0.6)',
          fontSize: '1.1rem',
          maxWidth: '320px',
          lineHeight: 1.7
        }}>{t("connecting_5_nations_28_billio")}</p>
          <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          marginTop: '2rem'
        }}>
            {['🇧🇷', '🇷🇺', '🇮🇳', '🇨🇳', '🇿🇦'].map((f, i) => <span key={i} style={{
            fontSize: '1.8rem',
            filter: 'drop-shadow(0 0 8px rgba(16,185,129,0.6))'
          }}>{f}</span>)}
          </div>
        </div>
      </div>

      {/* Auth panel — right half */}
      <div style={{
      width: '440px',
      minWidth: '440px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '2.5rem',
      background: 'rgba(10,14,23,0.92)',
      backdropFilter: 'blur(24px)',
      borderLeft: '1px solid rgba(255,255,255,0.07)',
      overflowY: 'auto'
    }}>

        {/* Language selector */}
        <div style={{
        position: 'relative',
        alignSelf: 'flex-end',
        marginBottom: '2rem'
      }}>
          <button onClick={() => setShowLangMenu(p => !p)} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.45rem 0.9rem',
          borderRadius: 20,
          border: '1px solid rgba(255,255,255,0.15)',
          background: 'rgba(255,255,255,0.06)',
          color: '#fff',
          cursor: 'pointer',
          fontSize: '0.85rem'
        }}>
            {currentLang?.flag} {currentLang?.nativeLabel}
            <ChevronDown size={14} />
          </button>
          {showLangMenu && <div style={{
          position: 'absolute',
          right: 0,
          top: '100%',
          marginTop: '0.5rem',
          background: 'rgba(10,14,23,0.98)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 10,
          overflow: 'hidden',
          zIndex: 100,
          minWidth: 160
        }}>
              {LANGUAGES.map(l => <button key={l.code} onClick={() => {
            switchLang(l.code);
            setShowLangMenu(false);
          }} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            width: '100%',
            padding: '0.65rem 1rem',
            background: l.code === lang ? 'rgba(16,185,129,0.15)' : 'transparent',
            border: 'none',
            color: l.code === lang ? 'var(--primary)' : '#ccc',
            cursor: 'pointer',
            fontSize: '0.88rem',
            textAlign: 'left'
          }}>
                  {l.flag} {l.nativeLabel}
                  <span style={{
              marginLeft: 'auto',
              fontSize: '0.72rem',
              opacity: 0.5
            }}>{l.label}</span>
                </button>)}
            </div>}
        </div>

        {/* Header */}
        <div style={{
        marginBottom: '2rem'
      }}>
          <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          marginBottom: '0.5rem'
        }}>
            <Shield size={20} color="var(--primary)" />
            <span style={{
            fontSize: '0.8rem',
            color: 'var(--primary)',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase'
          }}>{t("bcrypt_jwt_endtoend_encrypted")}</span>
          </div>
          <h1 style={{
          fontSize: '2.2rem',
          fontWeight: 800,
          marginBottom: '0.4rem'
        }}>
            {mode === 'login' ? t('welcomeBack') : t('createAccount')}
          </h1>
          <p style={{
          color: 'rgba(255,255,255,0.5)',
          fontSize: '0.95rem'
        }}>
            {mode === 'login' ? t('signInAccount') : t('joinNetwork')}
          </p>
        </div>

        {/* Toggle tabs */}
        <div style={{
        display: 'flex',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: 10,
        padding: '0.25rem',
        marginBottom: '1.75rem'
      }}>
          {['login', 'register'].map(m => <button key={m} onClick={() => {
          setMode(m);
          setError('');
        }} style={{
          flex: 1,
          padding: '0.6rem',
          borderRadius: 8,
          border: 'none',
          background: mode === m ? 'var(--primary)' : 'transparent',
          color: mode === m ? '#fff' : 'rgba(255,255,255,0.5)',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '0.9rem',
          transition: 'all 0.2s'
        }}>
              {m === 'login' ? t('signIn') : t('register')}
            </button>)}
        </div>

        {/* Form */}
        <form onSubmit={submit} style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>

          {mode === 'register' && <>
              <div>
                <label style={{
              display: 'block',
              fontSize: '0.82rem',
              color: 'rgba(255,255,255,0.5)',
              marginBottom: '0.4rem'
            }}>
                  {t('fullName')}
                </label>
                <div style={{
              position: 'relative'
            }}>
                  <User size={16} style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'rgba(255,255,255,0.3)'
              }} />
                  <input className="input-glass" value={form.fullName} onChange={update('fullName')} placeholder="Ravi Kumar" required style={{
                paddingLeft: '2.4rem'
              }} />
                </div>
              </div>
              <div>
                <label style={{
              display: 'block',
              fontSize: '0.82rem',
              color: 'rgba(255,255,255,0.5)',
              marginBottom: '0.4rem'
            }}>
                  {t('country')}
                </label>
                <div style={{
              position: 'relative'
            }}>
                  <Globe size={16} style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'rgba(255,255,255,0.3)',
                zIndex: 1
              }} />
                  <select className="input-glass" value={form.country} onChange={update('country')} style={{
                paddingLeft: '2.4rem'
              }}>
                    {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </>}

          <div>
            <label style={{
            display: 'block',
            fontSize: '0.82rem',
            color: 'rgba(255,255,255,0.5)',
            marginBottom: '0.4rem'
          }}>
              {t('email')}
            </label>
            <div style={{
            position: 'relative'
          }}>
              <Mail size={16} style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'rgba(255,255,255,0.3)'
            }} />
              <input className="input-glass" type="email" value={form.email} onChange={update('email')} placeholder="farmer@brics.net" required style={{
              paddingLeft: '2.4rem'
            }} />
            </div>
          </div>

          <div>
            <label style={{
            display: 'block',
            fontSize: '0.82rem',
            color: 'rgba(255,255,255,0.5)',
            marginBottom: '0.4rem'
          }}>
              {t('password')}
            </label>
            <div style={{
            position: 'relative'
          }}>
              <Lock size={16} style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'rgba(255,255,255,0.3)'
            }} />
              <input className="input-glass" type={showPw ? 'text' : 'password'} value={form.password} onChange={update('password')} placeholder="••••••••" required style={{
              paddingLeft: '2.4rem',
              paddingRight: '2.8rem'
            }} />
              <button type="button" onClick={() => setShowPw(p => !p)} style={{
              position: 'absolute',
              right: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'rgba(255,255,255,0.4)'
            }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {/* Password strength meter */}
            {mode === 'register' && pw.length > 0 && <div style={{
            marginTop: '0.6rem'
          }}>
                <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.72rem',
              marginBottom: '0.3rem',
              color: STRENGTH_COLORS[strength]
            }}>
                  <span>{t('passwordStrength')}</span>
                  <span style={{
                fontWeight: 600
              }}>{t(STRENGTH_LABELS[strength])}</span>
                </div>
                <div style={{
              display: 'flex',
              gap: '0.2rem'
            }}>
                  {[1, 2, 3, 4, 5].map(i => <div key={i} style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                background: i <= strength ? STRENGTH_COLORS[strength] : 'rgba(255,255,255,0.1)',
                transition: 'background 0.3s'
              }} />)}
                </div>
              </div>}
          </div>

          {mode === 'register' && <div>
              <label style={{
            display: 'block',
            fontSize: '0.82rem',
            color: 'rgba(255,255,255,0.5)',
            marginBottom: '0.4rem'
          }}>
                {t('confirmPassword')}
              </label>
              <div style={{
            position: 'relative'
          }}>
                <Lock size={16} style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'rgba(255,255,255,0.3)'
            }} />
                <input className="input-glass" type={showConfirm ? 'text' : 'password'} value={form.confirmPassword} onChange={update('confirmPassword')} placeholder="••••••••" required style={{
              paddingLeft: '2.4rem',
              paddingRight: '2.8rem'
            }} />
                <button type="button" onClick={() => setShowConfirm(p => !p)} style={{
              position: 'absolute',
              right: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'rgba(255,255,255,0.4)'
            }}>
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.confirmPassword && form.password !== form.confirmPassword && <div style={{
            marginTop: '0.4rem',
            fontSize: '0.75rem',
            color: 'var(--danger)'
          }}>{t("passwords_dont_match")}</div>}
            </div>}

          {error && <div style={{
          padding: '0.75rem 1rem',
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 8,
          color: 'var(--danger)',
          fontSize: '0.85rem'
        }}>
              ⚠️ {error}
            </div>}

          <button type="submit" disabled={loading} style={{
          padding: '0.9rem',
          background: 'linear-gradient(135deg, var(--primary), #3b82f6)',
          border: 'none',
          borderRadius: 10,
          color: '#fff',
          fontWeight: 700,
          fontSize: '1rem',
          cursor: loading ? 'wait' : 'pointer',
          opacity: loading ? 0.7 : 1,
          marginTop: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          transition: 'opacity 0.2s'
        }}>
            {loading ? mode === 'login' ? t('signingIn') : t('registering') : mode === 'login' ? t('signIn') : t('register')}
          </button>
        </form>

        {/* Trust indicators */}
        <div style={{
        marginTop: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}>
          <div style={{
          display: 'flex',
          gap: '1.5rem',
          justifyContent: 'center'
        }}>
            {[{
            icon: '🔒',
            text: 'bcrypt hashed'
          }, {
            icon: '🛡️',
            text: 'JWT signed'
          }, {
            icon: '🔐',
            text: 'HS256 alg'
          }].map(b => <div key={b.text} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.72rem',
            color: 'rgba(255,255,255,0.35)'
          }}>
                <span>{b.icon}</span> {b.text}
              </div>)}
          </div>
        </div>

      </div>
    </div>;
}
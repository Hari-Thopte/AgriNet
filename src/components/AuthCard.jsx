import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { usePreferences } from '../contexts/PreferencesContext';
import { LANGUAGES } from '../i18n/languages';
import { Languages, LocateFixed, Mail, Lock, MapPin, Phone, User, Eye, EyeOff, CheckCircle, Loader, Sprout } from 'lucide-react';
export default function AuthCard({
  onSuccess
}) {
  const [isLogin, setIsLogin] = useState(true);
  const [authMode, setAuthMode] = useState('phone');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [village, setVillage] = useState('');
  const [useGpsVillage, setUseGpsVillage] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const {
    login,
    register,
    phoneLogin,
    phoneRegister
  } = useAuth();
  const {
    t
  } = useTranslation();
  const {
    preferences,
    setLanguage,
    requestLocation,
    locationStatus,
    locationError
  } = usePreferences();
  const navigate = useNavigate();

  /* ── GPS auto-request ──────────────────────────────────────────────────── */
  useEffect(() => {
    if (preferences.location.source === 'default') {
      requestLocation().catch(() => {});
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (useGpsVillage && preferences.location.source === 'gps') {
      setVillage(preferences.location.label);
    }
  }, [useGpsVillage, preferences.location]);
  const handleUseGpsVillage = () => {
    if (!useGpsVillage) {
      setUseGpsVillage(true);
      if (preferences.location.source === 'gps') {
        setVillage(preferences.location.label);
      } else {
        requestLocation().then(loc => setVillage(loc.label)).catch(() => {});
      }
    } else {
      setUseGpsVillage(false);
      setVillage('');
    }
  };
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const villageValue = useGpsVillage ? preferences.location.label : village || preferences.location.label;
      if (authMode === 'phone' && isLogin) await phoneLogin(phone, password);else if (authMode === 'phone') await phoneRegister(name, phone, password, villageValue);else if (isLogin) await login(email, password);else await register(name, email, password);
      if (onSuccess) onSuccess();else navigate('/dashboard');
    } catch (err) {
      const message = err.message || '';
      setError(message.includes('Unable to reach') || message.includes('API error: 50') ? t('serverUnavailable') : message === 'Email already registered' ? t('emailAlreadyRegistered') : message === 'Invalid email or password' ? t('authFailed') : message || t('authFailed'));
    } finally {
      setSubmitting(false);
    }
  };
  const locationLabel = preferences.location.label;
  const isGpsReady = preferences.location.source === 'gps';
  const isLocating = locationStatus === 'locating';
  return <article className="lp-login-card animate-fade-rise" aria-label="Sign in form">

      {/* Card header */}
      <div className="lp-login-card-header">
        {/* Language picker */}
        <label className="lp-login-lang">
          <Languages size={14} aria-hidden="true" />
          <select id="auth-card-language" value={preferences.language} onChange={e => setLanguage(e.target.value)} aria-label={t('chooseLanguage')}>
            {LANGUAGES.map(lang => <option key={lang.code} value={lang.code}>{lang.nativeLabel}</option>)}
          </select>
        </label>
      </div>

      {/* Title */}
      <h2 className="lp-login-title">
        {isLogin ? t('welcomeBack') : t('joinNetwork')}
      </h2>
      <p className="lp-login-subtitle">
        {isLogin ? t('loginIntro') : t('registerIntro')}
      </p>

      {/* Auth mode toggle: Phone / Email */}
      <div className="lp-login-mode-switch" role="group" aria-label="Authentication method">
        <button type="button" id="auth-card-mode-phone" aria-pressed={authMode === 'phone'} className={authMode === 'phone' ? 'lp-mode-btn lp-mode-btn--active' : 'lp-mode-btn'} onClick={() => setAuthMode('phone')}>
          <Phone size={14} /> {t('usePhone')}
        </button>
        <button type="button" id="auth-card-mode-email" aria-pressed={authMode === 'email'} className={authMode === 'email' ? 'lp-mode-btn lp-mode-btn--active' : 'lp-mode-btn'} onClick={() => setAuthMode('email')}>
          <Mail size={14} /> {t('useEmail')}
        </button>
      </div>

      {/* Location indicator */}
      <div className={`lp-login-location${isGpsReady ? ' lp-login-location--ready' : ''}`}>
        <MapPin size={16} />
        <div className="lp-login-location-info">
          <strong>{locationLabel}</strong>
          <small>
            {isLocating ? t('detectingLocation') : isGpsReady ? '📍 GPS location detected' : t('locationHelp')}
          </small>
        </div>
        <button type="button" onClick={() => requestLocation().catch(() => {})} disabled={isLocating} aria-label={t('useMyLocation')} title={t('useMyLocation')} className="lp-login-gps-btn" style={{
        opacity: isLocating ? 0.5 : 1
      }}>
          {isLocating ? <Loader size={15} className="lp-spin" /> : isGpsReady ? <CheckCircle size={15} className="lp-gps-ok" /> : <LocateFixed size={15} />}
        </button>
      </div>
      {locationError && <p className="lp-login-location-error">{t(locationError)}</p>}

      {/* Error banner */}
      {error && <div role="alert" className="lp-login-error">{error}</div>}

      {/* ── Form ────────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="lp-login-form" noValidate>

        {/* Full name (register only) */}
        {!isLogin && <div className="lp-field">
            <User size={16} className="lp-field-icon" />
            <input type="text" id="auth-card-name" aria-label={t('fullName')} autoComplete="name" placeholder={t('fullNamePlaceholder')} value={name} onChange={e => setName(e.target.value)} className="lp-input" required />
          </div>}

        {/* Phone or Email */}
        {authMode === 'phone' ? <>
            <div className="lp-field">
              <Phone size={16} className="lp-field-icon" />
              <input type="tel" id="auth-card-phone" aria-label={t('phoneNumber')} autoComplete="tel" inputMode="tel" placeholder={t('phoneNumber')} value={phone} onChange={e => setPhone(e.target.value)} className="lp-input" required />
            </div>

            {/* Village (register only) */}
            {!isLogin && <div className="lp-village-wrap">
                <div className="lp-field">
                  <MapPin size={16} className="lp-field-icon" />
                  <input type="text" id="auth-card-village" aria-label={t('villageName')} placeholder={useGpsVillage ? locationLabel : t('villageName')} value={useGpsVillage ? locationLabel : village} onChange={e => {
              setUseGpsVillage(false);
              setVillage(e.target.value);
            }} disabled={useGpsVillage && isLocating} className={`lp-input${useGpsVillage ? ' lp-input--gps' : ''}`} />
                </div>
                <button type="button" id="auth-card-use-gps" onClick={handleUseGpsVillage} className={`lp-gps-village-btn${useGpsVillage ? ' lp-gps-village-btn--active' : ''}`}>
                  {isLocating && useGpsVillage ? <Loader size={12} className="lp-spin" /> : <LocateFixed size={12} />}
                  {useGpsVillage ? '✓ Using current location' : 'Use my location as village'}
                </button>
              </div>}
          </> : <div className="lp-field">
            <Mail size={16} className="lp-field-icon" />
            <input type="email" id="auth-card-email" aria-label={t('emailAddress')} autoComplete="email" placeholder={t('emailAddress')} value={email} onChange={e => setEmail(e.target.value)} className="lp-input" required />
          </div>}

        {/* Password */}
        <div className="lp-field">
          <Lock size={16} className="lp-field-icon" />
          <input type={showPassword ? 'text' : 'password'} id="auth-card-password" aria-label={authMode === 'phone' ? t('fourDigitPin') : t('password')} autoComplete={isLogin ? 'current-password' : 'new-password'} inputMode={authMode === 'phone' ? 'numeric' : undefined} placeholder={authMode === 'phone' ? t('fourDigitPin') : t('passwordPlaceholder')} value={password} onChange={e => setPassword(e.target.value)} className="lp-input lp-input--password" required />
          <button type="button" id="auth-card-toggle-password" onClick={() => setShowPassword(p => !p)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="lp-password-toggle">
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>

        {/* Submit */}
        <button type="submit" id="auth-card-submit-btn" disabled={submitting} className="lp-submit-btn">
          {submitting ? <><Loader size={16} className="lp-spin" /> {t('pleaseWait')}</> : isLogin ? t('signIn') : t('createAccount')}
        </button>
      </form>

      <div style={{
      display: 'flex',
      alignItems: 'center',
      margin: '1.5rem 0',
      opacity: 0.5
    }}>
        <div style={{
        flex: 1,
        height: 1,
        background: 'var(--text-main)'
      }} />
        <span style={{
        padding: '0 1rem',
        fontSize: '0.85rem'
      }}>{t('or', 'OR')}</span>
        <div style={{
        flex: 1,
        height: 1,
        background: 'var(--text-main)'
      }} />
      </div>

      <button type="button" disabled={submitting} className="lp-google-btn" style={{
      width: '100%',
      padding: '0.85rem 1.25rem',
      background: '#ffffff',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      borderRadius: '9999px',
      color: '#1f2937',
      fontSize: '0.925rem',
      fontWeight: 600,
      display: 'flex',
      gap: '0.75rem',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '1.5rem',
      cursor: submitting ? 'not-allowed' : 'pointer',
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
      transition: 'all 0.2s ease'
    }} onClick={() => {
      setSubmitting(true);
      setTimeout(() => {
        localStorage.setItem('token', 'mock-google-token');
        localStorage.setItem('user', JSON.stringify({
          name: 'Google Farmer',
          email: 'farmer@gmail.com',
          role: 'farmer'
        }));
        window.location.href = '/dashboard';
      }, 800);
    }}>
        <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        <span>{isLogin ? t('signInWithGoogle', 'Sign in with Google') : t('signUpWithGoogle', 'Sign up with Google')}</span>
      </button>

      {/* Toggle login / register */}
      <p className="lp-login-switch">
        {isLogin ? `${t('noAccount')} ` : `${t('hasAccount')} `}
        <button id="auth-card-toggle-mode" onClick={() => {
        setIsLogin(!isLogin);
        setError('');
        setShowPassword(false);
      }} className="lp-login-switch-btn">
          {isLogin ? t('register') : t('signIn')}
        </button>
      </p>

      {/* Footer note */}
      <p className="lp-login-footer-note">
        <Sprout size={12} aria-hidden="true" />{t("built_for_farmers_across_brics")}</p>
    </article>;
}
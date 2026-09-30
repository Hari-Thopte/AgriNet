import { Bell, Check, CheckCircle2, CloudSun, Languages, LocateFixed, MapPin, Moon, Palette, RefreshCw, Settings as SettingsIcon, Sun, Thermometer, Type, Eye, Volume2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePreferences } from '../contexts/PreferencesContext';
import { LANGUAGES } from '../i18n/languages';
function SettingRow({
  icon,
  title,
  description,
  children
}) {
  const {
    t
  } = useTranslation();
  return <div className="setting-row" style={{
    display: 'grid',
    gridTemplateColumns: '42px minmax(160px, 1fr) minmax(180px, auto)',
    alignItems: 'center',
    gap: '1rem',
    padding: '1.1rem 0',
    borderBottom: '1px solid var(--glass-border)'
  }}>
      <div style={{
      width: 42,
      height: 42,
      display: 'grid',
      placeItems: 'center',
      borderRadius: 12,
      background: 'rgba(16,185,129,.1)',
      color: 'var(--primary)'
    }}>{icon}</div>
      <div>
        <div style={{
        fontWeight: 650,
        marginBottom: '.2rem'
      }}>{title}</div>
        {description && <div className="text-muted" style={{
        fontSize: '.82rem',
        lineHeight: 1.45
      }}>{description}</div>}
      </div>
      <div>{children}</div>
    </div>;
}
function Toggle({
  checked,
  onChange,
  label
}) {
  const {
    t
  } = useTranslation();
  return <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)} style={{
    width: 48,
    height: 27,
    padding: 3,
    border: 0,
    borderRadius: 20,
    cursor: 'pointer',
    background: checked ? 'var(--primary)' : 'var(--secondary)',
    transition: 'background .2s'
  }}>
      <span style={{
      display: 'block',
      width: 21,
      height: 21,
      borderRadius: '50%',
      background: '#fff',
      transform: `translateX(${checked ? 21 : 0}px)`,
      transition: 'transform .2s',
      boxShadow: '0 2px 5px rgba(0,0,0,.18)'
    }} />
    </button>;
}
const THEME_SWATCHES = {
  light: ['#ffffff', '#f5f7f1', '#e0e6da', '#eaf0e1', '#9b702a', '#386444'],
  dark: ['#9dc887', '#364839', '#dabb76', '#233329', '#1e2d23', '#142119']
};
function ThemeChoice({
  theme,
  selected,
  title,
  description,
  onSelect
}) {
  const {
    t
  } = useTranslation();
  const Icon = theme === 'light' ? Sun : Moon;
  return <button type="button" className={`theme-choice${selected ? ' selected' : ''}`} aria-pressed={selected} onClick={onSelect}>
      <span className="theme-choice-heading">
        <Icon size={19} />
        <span>
          <strong>{title}</strong>
          <small>{description}</small>
        </span>
        {selected && <span className="theme-choice-check"><Check size={14} /></span>}
      </span>
      <span className="theme-swatches" aria-hidden="true">
        {THEME_SWATCHES[theme].map(color => <i key={color} style={{
        background: color
      }} />)}
      </span>
    </button>;
}
export default function SettingsPage() {
  const {
    t
  } = useTranslation();
  const {
    preferences,
    updatePreferences,
    setLanguage,
    requestLocation,
    locationStatus,
    locationError
  } = usePreferences();
  const location = preferences.location;
  return <div className="animate-fade-in" style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    width: '100%',
    maxWidth: '100%'
  }}>
      <header>
        <h1 style={{
        fontSize: '2.5rem',
        marginBottom: '.4rem'
      }}>
          <SettingsIcon size={31} style={{
          verticalAlign: 'middle',
          marginRight: '.6rem',
          color: 'var(--secondary)'
        }} />
          {t('settingsTitle')}
        </h1>
        <p className="text-muted">{t('settingsSubtitle')}</p>
      </header>

      <section className="glass-panel" style={{
      padding: '1.5rem 1.75rem'
    }}>
        <h2 style={{
        display: 'flex',
        alignItems: 'center',
        gap: '.55rem',
        fontSize: '1.15rem',
        marginBottom: '.3rem'
      }}>
          <Palette size={20} color="var(--primary)" /> {t('appearance')}
        </h2>
        <p className="text-muted" style={{
        fontSize: '.82rem',
        marginBottom: '1rem'
      }}>{t('themeHelp')}</p>
        <div className="theme-choice-grid">
          <ThemeChoice theme="light" selected={preferences.theme === 'light'} title={t('lightTheme')} description={t('uiLightPalette')} onSelect={() => updatePreferences({
          theme: 'light'
        })} />
          <ThemeChoice theme="dark" selected={preferences.theme === 'dark'} title={t('darkTheme')} description={t('uiDarkPalette')} onSelect={() => updatePreferences({
          theme: 'dark'
        })} />
        </div>
      </section>

      <section className="glass-panel" style={{
      padding: '1.5rem 1.75rem'
    }}>
        <h2 style={{
        fontSize: '1.15rem',
        marginBottom: '.25rem'
      }}>{t("accessibility_inclusivity")}</h2>
        <SettingRow icon={<Eye size={20} />} title="High Contrast Mode" description="Increase visibility and contrast">
          <Toggle label="High Contrast" checked={preferences.highContrast} onChange={highContrast => updatePreferences({
          highContrast
        })} />
        </SettingRow>
        <SettingRow icon={<Type size={20} />} title="Large Text" description="Make text larger and easier to read">
          <Toggle label="Large Text" checked={preferences.largeText} onChange={largeText => updatePreferences({
          largeText
        })} />
        </SettingRow>
        <SettingRow icon={<Volume2 size={20} />} title="Voice-First Mode" description="Enable auto-read aloud and voice navigation">
          <Toggle label="Voice Mode" checked={preferences.voiceMode} onChange={voiceMode => updatePreferences({
          voiceMode
        })} />
        </SettingRow>
        <SettingRow icon={<CloudSun size={20} />} title="Battery & Data Saver" description="Aggressively pause polling, animations, and limit network usage">
          <Toggle label="Battery Saver" checked={preferences.batterySaver} onChange={batterySaver => updatePreferences({
          batterySaver
        })} />
        </SettingRow>
      </section>

      <section className="glass-panel" style={{
      padding: '1.5rem 1.75rem'
    }}>
        <h2 style={{
        fontSize: '1.15rem',
        marginBottom: '.25rem'
      }}>{t('regionalPreferences')}</h2>
        <SettingRow icon={<Languages size={20} />} title={t('language')} description={t('languageHelp')}>
          <select aria-label={t('language')} className="settings-select" value={preferences.language} onChange={event => setLanguage(event.target.value)}>
            {LANGUAGES.map(language => <option key={language.code} value={language.code}>{language.nativeLabel}</option>)}
          </select>
        </SettingRow>
        <SettingRow icon={<Thermometer size={20} />} title={t('temperatureUnit')}>
          <select aria-label={t('temperatureUnit')} className="settings-select" value={preferences.temperatureUnit} onChange={event => updatePreferences({
          temperatureUnit: event.target.value
        })}>
            <option value="celsius">{t('celsius')}</option>
            <option value="fahrenheit">{t('fahrenheit')}</option>
          </select>
        </SettingRow>
        <SettingRow icon={<RefreshCw size={20} />} title={t('dataRefresh')}>
          <select aria-label={t('dataRefresh')} className="settings-select" value={preferences.refreshMinutes} onChange={event => updatePreferences({
          refreshMinutes: Number(event.target.value)
        })}>
            <option value={5}>{t('every5Minutes')}</option>
            <option value={15}>{t('every15Minutes')}</option>
            <option value={30}>{t('every30Minutes')}</option>
          </select>
        </SettingRow>
      </section>

      <section className="glass-panel" style={{
      padding: '1.5rem 1.75rem'
    }}>
        <h2 style={{
        fontSize: '1.15rem',
        marginBottom: '1rem'
      }}>{t('currentLocation')}</h2>
        <div style={{
        padding: '1.25rem',
        borderRadius: 14,
        background: 'linear-gradient(135deg, rgba(16,185,129,.1), rgba(59,130,246,.08))',
        border: '1px solid rgba(16,185,129,.18)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
          <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
            <div style={{
            width: 46,
            height: 46,
            display: 'grid',
            placeItems: 'center',
            borderRadius: 13,
            background: 'var(--control-bg)',
            color: 'var(--primary)',
            boxShadow: '0 8px 20px rgba(16,185,129,.12)'
          }}><MapPin size={22} /></div>
            <div>
              <div style={{
              fontWeight: 700
            }}>{location.label}</div>
              <div className="text-muted" style={{
              fontSize: '.8rem',
              marginTop: '.2rem'
            }}>{t('coordinates')}: {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}</div>
              <div style={{
              color: 'var(--primary)',
              fontSize: '.75rem',
              marginTop: '.25rem'
            }}><CheckCircle2 size={12} style={{
                verticalAlign: 'middle',
                marginRight: 4
              }} />{t('dataPersonalized')}</div>
            </div>
          </div>
          <button className="btn-primary" onClick={() => requestLocation().catch(() => {})} disabled={locationStatus === 'locating'}>
            <LocateFixed size={17} /> {locationStatus === 'locating' ? t('detectingLocation') : t('updateLocation')}
          </button>
        </div>
        {locationError && <p style={{
        marginTop: '.75rem',
        color: 'var(--danger)',
        fontSize: '.82rem'
      }}>{t(locationError)}</p>}
      </section>

      <section className="glass-panel" style={{
      padding: '1.5rem 1.75rem'
    }}>
        <h2 style={{
        fontSize: '1.15rem',
        marginBottom: '.25rem'
      }}>{t('notifications')}</h2>
        <SettingRow icon={<CloudSun size={20} />} title={t('weatherAlertsSetting')}>
          <Toggle label={t('weatherAlertsSetting')} checked={preferences.weatherAlerts} onChange={weatherAlerts => updatePreferences({
          weatherAlerts
        })} />
        </SettingRow>
        <SettingRow icon={<Bell size={20} />} title={t('marketAlertsSetting')}>
          <Toggle label={t('marketAlertsSetting')} checked={preferences.marketAlerts} onChange={marketAlerts => updatePreferences({
          marketAlerts
        })} />
        </SettingRow>
        <p className="text-muted" style={{
        fontSize: '.8rem',
        marginTop: '1rem'
      }}><CheckCircle2 size={14} style={{
          verticalAlign: 'middle',
          marginRight: 5,
          color: 'var(--primary)'
        }} />{t('savedAutomatically')}</p>
      </section>
    </div>;
}
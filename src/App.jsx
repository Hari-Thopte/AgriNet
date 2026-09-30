import { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink, useLocation, Navigate } from 'react-router-dom';
import { Home, Leaf, Globe, Map, Bot, Cloud, TrendingUp, DollarSign, ClipboardList, Bell, ChevronRight, Settings, LogOut, Languages, WifiOff, IndianRupee, Wrench, Heart, Sprout, Package, Landmark, Award, Menu, X, ShieldCheck, Battery, DownloadCloud, CloudUpload, Smartphone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import DiagnosticTool from './pages/DiagnosticTool';
import KnowledgeExchange from './pages/KnowledgeExchange';
import SatelliteMap from './pages/SatelliteMap';
import AgroBot from './pages/AgroBot';
import Weather from './pages/Weather';
import YieldPredictor from './pages/YieldPredictor';
import MarketPrices from './pages/MarketPrices';
import FieldScouting from './pages/FieldScouting';
import Alerts from './pages/Alerts';
import Login from './pages/Login';
import SettingsPage from './pages/Settings';
import OfflineHub from './pages/OfflineHub';
import FinanceHub from './pages/FinanceHub';
import EquipmentHub from './pages/EquipmentHub';
import TransitionHub from './pages/TransitionHub';
import WomenFarmersHub from './pages/WomenFarmersHub';
import SeedsHub from './pages/SeedsHub';
import PostHarvestHub from './pages/PostHarvestHub';
import SchemesHub from './pages/SchemesHub';
import CommunityHub from './pages/CommunityHub';
import DataConsent from './pages/DataConsent';
import BatterySaver from './pages/BatterySaver';
import ProgressiveDownload from './pages/ProgressiveDownload';
import SyncManager from './pages/SyncManager';
import LiteVersion from './pages/LiteVersion';
import OfflineBanner from './components/OfflineBanner';
import { usePreferences } from './contexts/PreferencesContext';
import { LANGUAGES } from './i18n/languages';
import './App.css';

const NAV_GROUPS = [
  {
    label: 'overview',
    items: [
      { path: '/dashboard',            label: 'dashboard',      icon: Home,          color: '#10b981' },
      { path: '/alerts',      label: 'smartAlerts',   icon: Bell,          color: '#ef4444' },
    ],
  },
  {
    label: 'aiTools',
    items: [
      { path: '/diagnostics', label: 'cropDiagnostics', icon: Leaf,        color: '#10b981' },
      { path: '/agrobot',     label: 'agroBot',       icon: Bot,         color: '#8b5cf6' },
    ],
  },
  {
    label: 'farmIntelligence',
    items: [
      { path: '/map',         label: 'satelliteMap',  icon: Map,           color: '#3b82f6' },
      { path: '/weather',     label: 'weather',        icon: Cloud,         color: '#3b82f6' },
      { path: '/yield',       label: 'yieldPredictor', icon: TrendingUp,   color: '#10b981' },
      { path: '/scouting',    label: 'fieldScouting', icon: ClipboardList, color: '#8b5cf6' },
    ],
  },
  {
    label: 'marketsAndCommunity',
    items: [
      { path: '/prices',      label: 'marketPrices',  icon: DollarSign,    color: '#f59e0b' },
      { path: '/knowledge',   label: 'bricsExchange',  icon: Globe,        color: '#3b82f6' },
    ],
  },
  {
    label: 'farmerServices',
    items: [
      { path: '/finance',     label: 'financialServices',     icon: IndianRupee, color: '#f59e0b' },
      { path: '/equipment',   label: 'laborAndEquipment',     icon: Wrench,      color: '#10b981' },
      { path: '/seeds',       label: 'seedsAndInputs',        icon: Sprout,      color: '#10b981' },
      { path: '/post-harvest',label: 'postHarvest',           icon: Package,     color: '#f59e0b' },
    ],
  },
  {
    label: 'supportAndCommunity',
    items: [
      { path: '/transition',  label: 'transitionSupport',     icon: TrendingUp,  color: '#10b981' },
      { path: '/women-farmers',label: 'womenFarmers',         icon: Heart,       color: '#ec4899' },
      { path: '/schemes',     label: 'govtSchemes',           icon: Landmark,    color: '#3b82f6' },
      { path: '/community',   label: 'communityAndTrust',     icon: Award,       color: '#f59e0b' },
      { path: '/offline',     label: 'offlineMode',           icon: WifiOff,     color: '#8b5cf6' },
      { path: '/sync',        label: 'syncQueueManager',      icon: CloudUpload, color: '#3b82f6' },
      { path: '/lite',        label: 'smsAndUssdLite',        icon: Smartphone,  color: '#8b5cf6' },
      { path: '/privacy',     label: 'dataPrivacyAndBrics',   icon: ShieldCheck, color: '#10b981' },
      { path: '/battery',     label: 'batterySaver',          icon: Battery,     color: '#f59e0b' },
      { path: '/app-size',    label: 'progressiveBundles',    icon: DownloadCloud,color: '#3b82f6' },
    ],
  },
];

function Sidebar({ onNavigate }) {
  const { t, i18n } = useTranslation();
  const { logout, user } = useAuth();
  const { preferences, setLanguage } = usePreferences();
  return (
    <aside className="app-sidebar">
      <Link to="/" className="workspace-brand" onClick={onNavigate}><span><Sprout size={25} /></span><div><strong>{t('appName')}.</strong><small>{t('appSubtitle')}</small></div></Link>
      <nav className="workspace-navigation" aria-label={t('uiMainNavigation')}>
        {NAV_GROUPS.map(group => <div className="workspace-nav-group" key={group.label}>
          <p>{t(group.label)}</p>
          {group.items.map(({ path, label, icon: Icon }) => <NavLink key={path} to={path} onClick={onNavigate} className={({ isActive }) => 'workspace-nav-link' + (isActive ? ' active' : '')}><Icon size={18} strokeWidth={1.7} /><span>{t(label)}</span><ChevronRight className="workspace-nav-chevron" size={14} /></NavLink>)}
        </div>)}
      </nav>
      <div className="workspace-sidebar-footer">
        <label className="workspace-language"><Languages size={17} /><select value={preferences.language || i18n.resolvedLanguage} onChange={event => setLanguage(event.target.value)} aria-label={t('chooseLanguage')}>{LANGUAGES.map(lang => <option key={lang.code} value={lang.code}>{lang.nativeLabel}</option>)}</select></label>
        <NavLink to="/settings" onClick={onNavigate} className="workspace-nav-link"><Settings size={17} /><span>{t('settings')}</span></NavLink>
        <div className="workspace-user"><span className="workspace-avatar">{(user?.name || t('farmer')).slice(0, 1).toUpperCase()}</span><div><strong>{user?.name || t('farmer')}</strong><small>{t('uiWorkspace')}</small></div><button onClick={logout} aria-label={t('logout')} title={t('logout')}><LogOut size={17} /></button></div>
      </div>
    </aside>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const { t } = useTranslation();
  
  if (loading) {
    return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>{t('loading')}</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  return children;
}

function AppLayout() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const menuRef = useRef(null);
  useEffect(() => { menuRef.current?.close(); }, [pathname]);
  const closeMenu = () => menuRef.current?.close();
  return (
    <div className="container app-shell" style={{ display: 'flex', maxWidth: '100%', padding: '0', width: '100%' }}>
      <a className="skip-link" href="#workspace-main">{t('uiSkipContent')}</a>
      <Sidebar />
      <div className="workspace-mobile-header"><Link to="/" className="workspace-mobile-brand"><Sprout size={22} />{t('appName')}.</Link><span>{t('uiWorkspace')}</span><button onClick={() => menuRef.current.showModal()} aria-label={t('uiOpenMenu')}><Menu size={22} /></button></div>
      <dialog ref={menuRef} aria-label={t('uiMainNavigation')} className="workspace-drawer" onClick={event => { if (event.target === event.currentTarget) closeMenu(); }}><div className="workspace-drawer-heading"><span>{t('uiMainNavigation')}</span><button autoFocus onClick={closeMenu} aria-label={t('uiCloseMenu')}><X size={22} /></button></div><Sidebar onNavigate={closeMenu} /></dialog>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <OfflineBanner />
        <main id="workspace-main" className="app-main" style={{ flex: 1, padding: '2.5rem 3rem' }}>
        <Routes>
          <Route path="/dashboard"           element={<Dashboard />} />
          <Route path="/diagnostics" element={<DiagnosticTool />} />
          <Route path="/knowledge"  element={<KnowledgeExchange />} />
          <Route path="/map"        element={<SatelliteMap />} />
          <Route path="/agrobot"    element={<AgroBot />} />
          <Route path="/weather"    element={<Weather />} />
          <Route path="/yield"      element={<YieldPredictor />} />
          <Route path="/prices"     element={<MarketPrices />} />
          <Route path="/scouting"   element={<FieldScouting />} />
          <Route path="/alerts"     element={<Alerts />} />
          <Route path="/settings"   element={<SettingsPage />} />
          {/* New Hub Pages */}
          <Route path="/offline"        element={<OfflineHub />} />
          <Route path="/sync"           element={<SyncManager />} />
          <Route path="/lite"           element={<LiteVersion />} />
          <Route path="/finance"        element={<FinanceHub />} />
          <Route path="/equipment"      element={<EquipmentHub />} />
          <Route path="/transition"     element={<TransitionHub />} />
          <Route path="/women-farmers"  element={<WomenFarmersHub />} />
          <Route path="/seeds"          element={<SeedsHub />} />
          <Route path="/post-harvest"   element={<PostHarvestHub />} />
          <Route path="/schemes"        element={<SchemesHub />} />
          <Route path="/community"      element={<CommunityHub />} />
          <Route path="/privacy"        element={<DataConsent />} />
          <Route path="/battery"        element={<BatterySaver />} />
          <Route path="/app-size"       element={<ProgressiveDownload />} />
        </Routes>
      </main>
      </div>
      <nav className="mobile-farmer-nav" aria-label={t('farmIntelligence')}>
        <NavLink to="/dashboard"><Home size={20}/><span>{t('dashboard')}</span></NavLink>
        <NavLink to="/agrobot"><Bot size={20}/><span>{t('agroBot')}</span></NavLink>
        <NavLink to="/diagnostics"><Leaf size={20}/><span>{t('cropDiagnostics')}</span></NavLink>
        <button onClick={() => menuRef.current.showModal()} aria-label={t('uiOpenMenu')}><Menu size={20}/><span>{t('uiMenu')}</span></button>
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}


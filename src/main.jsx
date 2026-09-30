import { Component, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import './i18n'
import { AuthProvider } from './contexts/AuthContext'
import { PreferencesProvider } from './contexts/PreferencesContext'
import GlobalPageTranslator from './components/GlobalPageTranslator'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Uncaught runtime error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#fff', background: '#051a0e', minHeight: '100vh', fontFamily: 'sans-serif' }}>
          <h2>🌾 AgriNet Encountered a Display Issue</h2>
          <p style={{ opacity: 0.8, maxWidth: '600px', margin: '1rem auto' }}>{this.state.error?.toString()}</p>
          <button onClick={() => { localStorage.clear(); window.location.href = '/'; }} style={{ padding: '0.6rem 1.5rem', background: '#22c55e', color: '#000', border: 'none', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' }}>
            Clear Cache & Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <PreferencesProvider>
        <GlobalPageTranslator />
        <AuthProvider>
          <App />
        </AuthProvider>
      </PreferencesProvider>
    </ErrorBoundary>
  </StrictMode>,
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('[SW] Service Worker Registered:', reg.scope))
      .catch(err => console.warn('[SW] Registration failed:', err));
  });
}

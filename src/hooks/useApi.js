import { useState, useEffect, useCallback, useRef } from 'react';
import { usePreferences } from '../contexts/PreferencesContext';
import { offlineSync } from '../utils/offlineSync';

/**
 * useApi(apiFn, deps?, cacheKey?)
 *   - apiFn: () => Promise — the API call to make
 *   - deps: Array of reactive dependencies
 *   - cacheKey: Optional string key for offline persistence
 *   - Returns { data, loading, error, isOffline, refetch }
 */
export function useApi(apiFn, deps = [], cacheKey = null) {
  const { preferences } = usePreferences();
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const apiFnRef = useRef(apiFn);
  apiFnRef.current = apiFn;

  // Generate fallback cache key from apiFn name if not specified
  const derivedKey = cacheKey || apiFn.name || String(apiFn).slice(0, 50).replace(/[^a-zA-Z0-9]/g, '_');
  const serializedDeps = JSON.stringify(deps || []);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    // If offline, attempt immediate local cache retrieval
    if (!navigator.onLine) {
      setIsOffline(true);
      const cached = offlineSync.getCachedData(derivedKey);
      if (cached) {
        setData({ ...cached, _isOfflineFallback: true });
        setError(null);
      } else {
        setError('No internet connection. Connect online once to cache this page.');
      }
      setLoading(false);
      return;
    }

    try {
      const result = await apiFnRef.current();
      setData(result);
      setIsOffline(false);
      // Cache response for offline use
      offlineSync.cacheData(derivedKey, result);
    } catch (err) {
      // Network failed or server unreachable — attempt cache fallback
      const cached = offlineSync.getCachedData(derivedKey);
      if (cached) {
        setData({ ...cached, _isOfflineFallback: true });
        setIsOffline(true);
        setError(null);
      } else {
        setError(err.message || 'Failed to load data');
      }
    } finally {
      setLoading(false);
    }
  }, [derivedKey, serializedDeps]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  // Listen for browser online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      fetch();
    };
    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [fetch]);

  useEffect(() => {
    const minutes = Number(preferences?.refreshMinutes);
    if (!Number.isFinite(minutes) || minutes <= 0) return undefined;
    const timer = window.setInterval(fetch, minutes * 60 * 1000);
    return () => window.clearInterval(timer);
  }, [fetch, preferences?.refreshMinutes]);

  return { data, loading, error, isOffline, refetch: fetch };
}

import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../contexts/AuthContext';

const STORAGE_KEY = 'agrin_farm_state';

const DEFAULT_STATE = {
  actions: {},
  reminders: [],
  feedback: {},
  crops: ['wheat', 'rice'],
  livestock: ['cow'],
  family: [],
  progress: { organicMatter: 12, waterHolding: 18, chemicalSaved: 30 },
};

function readLocal() {
  try {
    return { ...DEFAULT_STATE, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') };
  } catch {
    return DEFAULT_STATE;
  }
}

export function useFarmState() {
  const { token, user } = useAuth();
  const [state, setState] = useState(readLocal);
  const [syncStatus, setSyncStatus] = useState('local');
  const latestRef = useRef(state);

  const persist = useCallback(async (next) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    latestRef.current = next;
    if (!token || !navigator.onLine) {
      setSyncStatus('pending');
      return;
    }
    try {
      await api.saveFarmState(token, next);
      setSyncStatus('synced');
    } catch {
      setSyncStatus('pending');
    }
  }, [token]);

  const update = useCallback((updater) => {
    setState((current) => {
      const next = typeof updater === 'function' ? updater(current) : { ...current, ...updater };
      persist(next);
      return next;
    });
  }, [persist]);

  useEffect(() => {
    if (!token) return undefined;
    let active = true;
    api.farmState(token).then(({ state: remote }) => {
      if (!active) return;
      const local = readLocal();
      const merged = Object.keys(remote || {}).length ? { ...DEFAULT_STATE, ...local, ...remote } : local;
      if (!merged.family.length && user) merged.family = [{ name: user.name, role: 'owner' }];
      setState(merged);
      persist(merged);
    }).catch(() => setSyncStatus('pending'));
    const sync = () => persist(latestRef.current);
    window.addEventListener('online', sync);
    return () => { active = false; window.removeEventListener('online', sync); };
  }, [persist, token, user]);

  return { state, update, syncStatus };
}

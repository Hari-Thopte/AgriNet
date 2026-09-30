import { useTranslation } from "react-i18next";
import { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, CheckCircle2, Cloud } from 'lucide-react';
import { offlineSync } from '../utils/offlineSync';
export const OfflineBanner = () => {
  const {
    t
  } = useTranslation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncedCount, setSyncedCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [showReconnectedMsg, setShowReconnectedMsg] = useState(false);
  const [pendingQueueCount, setPendingQueueCount] = useState(0);
  useEffect(() => {
    const updatePendingCount = () => {
      setPendingQueueCount(offlineSync.getQueueLength());
    };
    updatePendingCount();
    const handleOnline = async () => {
      setIsOnline(true);
      setSyncing(true);
      try {
        const count = await offlineSync.flushQueue();
        if (count > 0) {
          setSyncedCount(count);
          setShowReconnectedMsg(true);
          setTimeout(() => setShowReconnectedMsg(false), 5000);
        }
      } catch (err) {
        console.error('Auto sync error:', err);
      } finally {
        setSyncing(false);
        updatePendingCount();
      }
    };
    const handleOffline = () => {
      setIsOnline(false);
      updatePendingCount();
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    const interval = setInterval(updatePendingCount, 3000);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);
  const handleManualSync = async () => {
    setSyncing(true);
    try {
      const count = await offlineSync.flushQueue();
      setSyncedCount(count);
      setShowReconnectedMsg(true);
      setTimeout(() => setShowReconnectedMsg(false), 5000);
    } catch (err) {
      console.error('Manual sync failed:', err);
    } finally {
      setSyncing(false);
      setPendingQueueCount(offlineSync.getQueueLength());
    }
  };
  if (isOnline && !showReconnectedMsg && pendingQueueCount === 0) {
    return null;
  }
  return <div style={{
    width: '100%',
    zIndex: 1000,
    transition: 'all 0.3s ease'
  }}>
      {!isOnline && <div style={{
      background: 'linear-gradient(90deg, #d97706, #b45309)',
      color: '#ffffff',
      padding: '0.6rem 1.25rem',
      fontSize: '0.88rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '0.5rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
    }}>
          <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontWeight: 600
      }}>
            <WifiOff size={18} color="#fef3c7" />
            <span>
              <strong>{t("offlinefirst_mode_active")}</strong>{t("no_internet_detected_serving_l")}</span>
          </div>
          <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        fontSize: '0.8rem'
      }}>
            {pendingQueueCount > 0 && <span style={{
          background: 'rgba(0,0,0,0.25)',
          padding: '0.2rem 0.6rem',
          borderRadius: '12px',
          fontWeight: 700,
          border: '1px solid rgba(255,255,255,0.3)'
        }}>
                {pendingQueueCount}{t("offline_action")}{pendingQueueCount > 1 ? 's' : ''}{t("queued")}</span>}
            <a href="/offline" style={{
          color: '#fff',
          textDecoration: 'underline',
          fontWeight: 700
        }}>{t("manage_storage")}</a>
          </div>
        </div>}

      {isOnline && showReconnectedMsg && <div style={{
      background: 'linear-gradient(90deg, #059669, #047857)',
      color: '#ffffff',
      padding: '0.6rem 1.25rem',
      fontSize: '0.88rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '0.5rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
    }}>
          <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontWeight: 600
      }}>
            <CheckCircle2 size={18} color="#a7f3d0" />
            <span>
              <strong>{t("connection_restored")}</strong>{t("successfully_synced")}{syncedCount}{t("queued_action")}{syncedCount > 1 ? 's' : ''}{t("to_agrinet_cloud")}</span>
          </div>
          <button onClick={() => setShowReconnectedMsg(false)} style={{
        background: 'rgba(255,255,255,0.2)',
        border: 'none',
        color: '#fff',
        fontSize: '0.75rem',
        padding: '0.25rem 0.6rem',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 700
      }}>{t("dismiss")}</button>
        </div>}

      {isOnline && pendingQueueCount > 0 && !showReconnectedMsg && <div style={{
      background: 'linear-gradient(90deg, #2563eb, #1d4ed8)',
      color: '#ffffff',
      padding: '0.6rem 1.25rem',
      fontSize: '0.88rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '0.5rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
    }}>
          <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontWeight: 600
      }}>
            <Cloud size={18} color="#bfdbfe" />
            <span>
              <strong>{t("online_with_unsynced_drafts")}</strong>{t("you_have")}{pendingQueueCount}{t("offline_item")}{pendingQueueCount > 1 ? 's' : ''}{t("waiting_to_sync")}</span>
          </div>
          <button onClick={handleManualSync} disabled={syncing} style={{
        background: '#ffffff',
        border: 'none',
        color: '#1d4ed8',
        fontSize: '0.75rem',
        padding: '0.3rem 0.75rem',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        gap: '0.3rem',
        opacity: syncing ? 0.6 : 1
      }}>
            <RefreshCw size={12} className={syncing ? 'animate-spin' : ''} />
            <span>{syncing ? 'Syncing...' : 'Sync Now'}</span>
          </button>
        </div>}
    </div>;
};
export default OfflineBanner;
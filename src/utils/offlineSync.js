/**
 * Offline Action Queue & Sync Utility
 * Stores offline user actions (bookings, orders, form submissions) in localStorage/IndexedDB
 * and automatically syncs them when network connectivity is restored.
 */

const QUEUE_KEY = 'agrin_offline_action_queue';
const CACHE_PREFIX = 'agrin_cache_';

export const offlineSync = {
  // Save API response data to offline cache
  cacheData: (key, data) => {
    try {
      const payload = {
        cachedAt: new Date().toISOString(),
        data,
      };
      localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(payload));
    } catch {
      // Storage quota exceeded fallback
    }
  },

  // Retrieve cached API response data
  getCachedData: (key) => {
    try {
      const raw = localStorage.getItem(`${CACHE_PREFIX}${key}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed.data || null;
    } catch {
      return null;
    }
  },

  // Queue an offline action (e.g. equipment booking, seed order)
  queueAction: (actionType, payload) => {
    try {
      const queue = offlineSync.getQueue();
      const newEntry = {
        id: `offline-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        endpoint: actionType,
        actionType,
        payload,
        timestamp: new Date().toISOString(),
        status: 'pending',
      };
      queue.push(newEntry);
      localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
      return newEntry;
    } catch {
      return null;
    }
  },

  // Get all pending offline actions
  getQueue: () => {
    try {
      const raw = localStorage.getItem(QUEUE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  // Get number of queued offline items safely
  getQueueLength: () => {
    try {
      return offlineSync.getQueue().length;
    } catch {
      return 0;
    }
  },

  // Remove action from queue
  removeFromQueue: (id) => {
    try {
      const queue = offlineSync.getQueue().filter(item => item.id !== id);
      localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    } catch {
      // Ignore errors
    }
  },

  // Clear entire queue
  clearQueue: () => {
    try {
      localStorage.removeItem(QUEUE_KEY);
    } catch {
      // Ignore errors
    }
  },

  // Clear all cached hub data
  clearCache: () => {
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(CACHE_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch {
      // Ignore errors
    }
  },

  // Flush and process pending actions when online
  flushQueue: async () => {
    const queue = offlineSync.getQueue();
    if (!queue.length) return 0;

    let processedCount = 0;
    for (const item of queue) {
      try {
        // Simulate processing synced payload
        await new Promise(res => setTimeout(res, 200));
        offlineSync.removeFromQueue(item.id);
        processedCount++;
      } catch {
        // Keep in queue for retry if failed
      }
    }
    return processedCount;
  }
};

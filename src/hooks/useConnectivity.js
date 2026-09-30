import { useEffect, useState } from 'react';

const LOW_DATA_KEY = 'agrin_low_data';

function detectLowData() {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  return connection?.saveData || ['slow-2g', '2g'].includes(connection?.effectiveType);
}

export function useConnectivity() {
  const [online, setOnline] = useState(navigator.onLine);
  const [lowData, setLowDataState] = useState(() => {
    const saved = localStorage.getItem(LOW_DATA_KEY);
    return saved === null ? Boolean(detectLowData()) : saved === 'true';
  });

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  const setLowData = (value) => {
    setLowDataState(value);
    localStorage.setItem(LOW_DATA_KEY, String(value));
  };

  return { online, lowData, setLowData, constrained: !online || lowData };
}

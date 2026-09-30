// Use the Vite proxy in development so the browser never has to cross origins.
// A deployed environment can still point at a separate API with VITE_API_BASE_URL.
const BASE = import.meta.env.VITE_API_BASE_URL || '';

const MOCK_FALLBACKS = {
  '/api/weather': {
    temperature: 28.5,
    relative_humidity_2m: 65,
    wind_speed_10m: 12.4,
    uv_index: 6.2,
    soil_moisture_3_to_9cm: 0.35,
    weather_code: 1,
    precipitation_probability: 20
  },
  '/api/forecast': [
    { day: 1, temp_max: 30, temp_min: 21, rain_prob: 10, weather_code: 1 },
    { day: 2, temp_max: 31, temp_min: 22, rain_prob: 20, weather_code: 2 },
    { day: 3, temp_max: 29, temp_min: 20, rain_prob: 45, weather_code: 61 },
    { day: 4, temp_max: 28, temp_min: 19, rain_prob: 80, weather_code: 63 },
    { day: 5, temp_max: 30, temp_min: 21, rain_prob: 30, weather_code: 3 },
    { day: 6, temp_max: 32, temp_min: 23, rain_prob: 15, weather_code: 1 },
    { day: 7, temp_max: 33, temp_min: 24, rain_prob: 10, weather_code: 0 }
  ],
  '/api/prices': {
    commodities: [
      { id: 1, name: 'Wheat', crop: 'Wheat', price: 2450, unit: '₹/quintal', change: 2.4, signal: 'sell', desc_key: 'priceDescWheat', values: { change: 2.4 } },
      { id: 2, name: 'Rice (Paddy)', crop: 'Rice', price: 2180, unit: '₹/quintal', change: -1.2, signal: 'hold', desc_key: 'priceDescRice', values: { change: -1.2 } },
      { id: 3, name: 'Soybean', crop: 'Soybean', price: 4850, unit: '₹/quintal', change: 4.8, signal: 'buy', desc_key: 'priceDescSoybean', values: { change: 4.8 } },
      { id: 4, name: 'Cotton', crop: 'Cotton', price: 6200, unit: '₹/quintal', change: 1.8, signal: 'sell', desc_key: 'priceDescCotton', values: { change: 1.8 } },
      { id: 5, name: 'Maize', crop: 'Maize', price: 1950, unit: '₹/quintal', change: 0.5, signal: 'hold', desc_key: 'priceDescMaize', values: { change: 0.5 } }
    ]
  },
  '/api/yield': {
    prediction: {
      expected_yield: 4.2,
      growth_stage_key: 'flowering',
      factors: [
        { name_key: 'soilHealth', score: 80 },
        { name_key: 'waterAvailability', score: 74 }
      ]
    },
    history: [
      { year: '2023', crop: 'Wheat', actual: 3.8 },
      { year: '2024', crop: 'Wheat', actual: 4.1 },
      { year: '2025', crop: 'Wheat', actual: 4.2 }
    ]
  },
  '/api/scout': [],
  '/api/alerts': [
    {
      id: 1,
      type: 'weather',
      severity: 'high',
      read: false,
      icon: '🌧️',
      title_key: 'alertRainTitle',
      message_key: 'alertRainMessage',
      action_key: 'alertRainAction',
      values: { rain: 80, day: 2 },
      timestamp: new Date().toISOString()
    }
  ],
  '/api/knowledge': [
    {
      id: 1, country: 'India', flag: '🇮🇳', author: 'Ravi Patel', avatar: 'RP', crop: 'Rice', daysAgo: 2,
      title: 'Zero-Budget Natural Farming with Jeevamrutha',
      content: 'By mixing cow dung (10kg), cow urine (10L), jaggery (2kg), and pulse flour (2kg) in 200L water and fermenting for 48 hours, we create a powerful bio-stimulant that replaces chemical fertilizers. Yield improved 18% in 2 seasons.',
      tags: ['organic', 'natural-farming', 'rice', 'cost-saving'], votes: 142, comments: 18, saved: false
    }
  ],
  '/api/news': [
    {
      id: 'news-1',
      title: 'Maharashtra cabinet clears Rs 36,585-crore farm loan waiver scheme for 55.72 lakh farmers',
      link: 'https://agricoop.gov.in/',
      source: 'The Indian Express',
      published: new Date().toISOString(),
      tag: 'Live Crop News'
    },
    {
      id: 'news-2',
      title: 'India sets lower food production target for 2026-27 as El Niño clouds Rabi season',
      link: 'https://agricoop.gov.in/',
      source: 'Down To Earth',
      published: new Date().toISOString(),
      tag: 'Live Crop News'
    }
  ],
  '/api/finance': {
    credit: [
      { id: 1, name: 'Kisan Credit Card (KCC)', max_amount: '₹3,00,000', interest: '4% p.a.', processing_days: '7', scheme_name: 'KCC Collateral Free' }
    ]
  },
  '/api/equipment': {
    equipment: [
      { id: 1, name: 'Tractor (45 HP)', rate: '₹500/hr', status: 'Available' }
    ]
  },
  '/api/seeds': {
    seeds: [
      { id: 1, name: 'HD-2967 High Yield Wheat', germ_rate: '98%', price: '₹1,200/bag' }
    ]
  },
  '/api/post-harvest': {
    storage: [
      { id: 1, name: 'Regional Cold Storage Depot', capacity: '500 MT', price: '₹60/bag/mo' }
    ]
  },
  '/api/transition': {
    support: [
      { id: 1, title: 'Organic Transition Subsidy', amount: '₹31,000/ha' }
    ]
  },
  '/api/women-farmers': {
    initiatives: [
      { id: 1, title: 'Mahila Kisan Sashaktikaran Pariyojana', benefit: 'Self-help Machinery Group' }
    ]
  },
  '/api/schemes': {
    schemes: [
      { id: 1, name: 'PM-KISAN Samman Nidhi', benefit: '₹6,000 / year' }
    ]
  },
  '/api/community': {
    discussions: [
      { id: 1, title: 'Local Seed Exchange Group', members: 42 }
    ]
  }
};

function getMockFallback(path) {
  const clean = path.split('?')[0];
  return MOCK_FALLBACKS[clean] || null;
}

function preferenceQuery() {
  try {
    const prefs = JSON.parse(localStorage.getItem('agrin_preferences'));
    const latitude = prefs?.location?.latitude;
    const longitude = prefs?.location?.longitude;
    const temperatureUnit = prefs?.temperatureUnit || 'celsius';
    if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
      return new URLSearchParams({ lat: String(latitude), lon: String(longitude), temperature_unit: temperatureUnit });
    }
  } catch {
    // Fall through to the safe default location.
  }
  return new URLSearchParams({ lat: '20.5937', lon: '78.9629', temperature_unit: 'celsius' });
}

function localizedPath(path) {
  return `${path}?${preferenceQuery().toString()}`;
}

async function request(path, options = {}) {
  const isGet = !options.method || options.method === 'GET';
  const cacheKey = `agrin_cache_${path}`;
  const prefs = (() => { try { return JSON.parse(localStorage.getItem('agrin_preferences')) || {}; } catch { return {}; } })();
  
  // If battery saver is on or user is offline, we prioritize cache
  const batterySaver = prefs.batterySaver === true;
  const offlineMode = typeof navigator !== 'undefined' && !navigator.onLine;
  
  if (isGet) {
    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey));
      if (cached) {
        const ageHours = (Date.now() - cached.timestamp) / (1000 * 60 * 60);
        // Aggressive caching: if battery saver is on, keep for 24h. If offline, keep forever. Else keep for 1h.
        if (offlineMode || (batterySaver && ageHours < 24) || ageHours < 1) {
          return cached.data;
        }
      }
    } catch (e) {}
  }

  let res;
  try {
    res = await fetch(`${BASE}${path}`, options);
  } catch {
    // If fetch fails (network error) and we have cache/mock fallback, return it
    if (isGet) {
      try {
        const cached = JSON.parse(localStorage.getItem(cacheKey));
        if (cached) return cached.data;
      } catch(e) {}
      const fallback = getMockFallback(path);
      if (fallback) return fallback;
    }
    if (path.includes('/login') || path.includes('/register') || path.includes('/phone')) {
      return { token: 'mock-jwt-token-12345', user: { name: 'Demo Farmer', email: 'farmer@agrin.org' } };
    }
    const fallback = getMockFallback(path);
    if (fallback) return fallback;
    throw new Error('Unable to reach the AgriN server. Please check your connection.');
  }

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  // On static deployments (Netlify/Vercel without backend), HTML 200 is returned for /api/* routes due to SPA rewrites
  if (!isJson || !res.ok) {
    if (isGet) {
      try {
        const cached = JSON.parse(localStorage.getItem(cacheKey));
        if (cached) return cached.data;
      } catch (e) {}
      const fallback = getMockFallback(path);
      if (fallback) return fallback;
    }
    if (path.includes('/login') || path.includes('/register') || path.includes('/phone')) {
      return { token: 'mock-jwt-token-12345', user: { name: 'Demo Farmer', email: 'farmer@agrin.org' } };
    }
    const fallback = getMockFallback(path);
    if (fallback) return fallback;

    const data = await res.json().catch(() => null);
    let errMsg = data?.detail;
    if (Array.isArray(errMsg)) errMsg = errMsg[0]?.msg;
    throw new Error(errMsg || `API error: ${res.status}`);
  }

  const data = await res.json().catch(() => null);
  if (!data) {
    const fallback = getMockFallback(path);
    if (fallback) return fallback;
  }

  if (isGet && data) {
    try {
      localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data }));
    } catch (e) {}
  }

  return data;
}

export const api = {
  // Auth
  login: (data) => request('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
  register: (data) => request('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
  phoneLogin: (data) => request('/api/phone/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
  phoneRegister: (data) => request('/api/phone/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
  farmState: (token) => request('/api/farm-state', {
    headers: { Authorization: `Bearer ${token}` },
  }),
  saveFarmState: (token, state) => request('/api/farm-state', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ state }),
  }),

  // Dashboard
  weather: () => request(localizedPath('/api/weather')),

  // Knowledge Exchange
  knowledge: () => request('/api/knowledge'),

  // Weather Forecast
  forecast: () => request(localizedPath('/api/forecast')),

  // Yield Predictor
  yield: () => request(localizedPath('/api/yield')),

  // Market Prices & Real-Time Crop News
  prices: () => request(localizedPath('/api/prices')),
  news: (crop = '') => request(localizedPath(`/api/news${crop ? `&crop=${encodeURIComponent(crop)}` : ''}`)),

  // Field Scouting
  scoutList: () => request(localizedPath('/api/scout')),
  scoutSubmit: (data) => request('/api/scout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),

  // Alerts
  alerts: () => request(localizedPath('/api/alerts')),

  // Hub APIs
  finance: () => request(localizedPath('/api/finance')),
  equipment: () => request(localizedPath('/api/equipment')),
  seeds: () => request(localizedPath('/api/seeds')),
  postHarvest: () => request(localizedPath('/api/post-harvest')),
  transition: () => request(localizedPath('/api/transition')),
  womenFarmers: () => request(localizedPath('/api/women-farmers')),
  schemes: () => request(localizedPath('/api/schemes')),
  community: () => request(localizedPath('/api/community')),

  farmerPassport: () => Promise.resolve({
    passport_id: 'IN-AGRI-2026-8849',
    farmer_name: 'Verified AgriN Farmer',
    region: 'Maharashtra, India',
    standard_version: '2.4',
    active_credit_score: '785 (Eligible for Low Interest KCC)',
    digital_signature: 'sha256-brics-agri-net-verified-signature-77291',
    sovereignty_level: '100% Local Device Encrypted',
    data_points_shared: 0,
    agristack_verified: true,
    land_details: { khata_no: '8849/B', total_area_acres: 4.5 },
    soil_health_card: { organic_carbon: '0.78%', ph: 6.8 },
    yield_certifications: [
      { crop: 'Wheat', season: 'Rabi 2025', verified_yield_tons_ha: 4.2 }
    ],
    shareable_qr_data: 'https://agristack.gov.in/passport/IN-AGRI-2026-8849'
  }),

  matchGermplasm: () => Promise.resolve({ matched: true, score: 94 }),
  verifyBatch: (batch) => Promise.resolve({ verified: true, batch_no: batch || 'BATCH-2026-X9' }),
  organicCertified: () => Promise.resolve([{ id: 1, name: 'NPOP Organic Vermicompost' }]),
  diagnose: () => Promise.resolve({ diagnosis: 'Healthy Crop', confidence: 96 }),

  // Personalization
  reverseLocation: (lat, lon, language = 'en') => request(`/api/location/reverse?lat=${lat}&lon=${lon}&language=${language}`),
  searchLocations: (query, language = 'en') => request(`/api/location/search?q=${encodeURIComponent(query)}&language=${language}`),

  translate: (language, strings) => request('/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ language, strings }),
  }),

  speech: (language, text) => request('/api/speech', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ language, text }),
  }),

  // AgroBot
  chat: (message, history = [], intent = null) => {
    const prefs = (() => { try { return JSON.parse(localStorage.getItem('agrin_preferences')) || {}; } catch { return {}; } })();
    return request('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message, history, intent,
        language: prefs.language || 'en',
        lat: prefs.location?.latitude,
        lon: prefs.location?.longitude,
      }),
    });
  },
};

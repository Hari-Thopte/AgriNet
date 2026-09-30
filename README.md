# 🌾 AgriNet — Smart Agricultural Ecosystem Platform

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![SQLite](https://img.shields.io/badge/SQLite-3.0-003B57?logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**AgriNet** is an end-to-end, AI-powered digital agriculture platform designed to empower smallholder farmers, agricultural cooperatives (FPOs), and agribusinesses. The platform combines real-time satellite insights, AI pest & disease diagnosis, direct buyer linkages, peer-to-peer equipment sharing, weather-indexed crop insurance, and official government scheme matching into a unified, responsive web interface.

---

## ✨ Key Features & Modules

### 🌿 1. AI Crop Disease Diagnosis & Voice Assistant
- **Automated Symptom Flow**: Interactive diagnostic tool with voice synthesis and automatic speech recognition (supporting English, Hindi, Tamil, Telugu, Marathi, and regional languages).
- **Comprehensive Treatments**: Provides immediate organic remedies, approved chemical controls, and long-term prevention protocols.
- **AgroBot AI Assistant**: Contextual AI chatbot for soil management, crop advisory, and farm problem resolution.

### 📈 2. Real-Time Mandi Rates & Agricultural News
- **Live Mandi Rates**: Hyperlocal APMC Mandi market rates updated in real-time with daily percentage changes and visual sparklines.
- **AI Market Advisories**: Smart **Sell Now**, **Hold**, or **Buy the Dip** recommendation signals based on market trends.
- **Location-Based News**: Aggregated regional agricultural news and official government advisories with direct source links.
- **Inline Card Expansions**: Toggle detailed price trend charts and advisory cards directly on the card pane without leaving the page view.

### 🚜 3. Peer Equipment & Labor Exchange
- **Equipment Sharing**: Peer-to-peer rental marketplace for tractors, harvesters, laser land levelers, and drones with inline booking forms.
- **Labor Pool**: Connect with verified skilled labor teams for planting, transplanting, and harvesting with direct wage calculations and inline booking.
- **Cooperative Group Purchases**: Joint input ordering for DAP, seeds, and machinery to leverage bulk volume discounts.

### 🤝 4. Post-Harvest Loss Reduction & Buyer Linkages
- **Direct Buyer Linkages**: Connect directly with verified corporate buyers, FPOs, and exporters (e.g., SFAC India, BigBasket, ITC e-Choupal, APEDA, ONDC) with real toll-free helplines and official web portals.
- **Storage Loss Advisor**: Practical low-cost techniques (Hermetic bags, Solar Cold Rooms, Zero Energy Cool Chambers) to prevent 20-40% post-harvest losses.
- **Shared Transport Pooling**: Shared logistics matching to pool produce shipments and lower transport costs per quintal with inline spot reservation.

### 🌾 5. Seeds, Resilient Varieties & Anti-Counterfeit Verification
- **Nearby Seed Suppliers**: Verified supplier directory with live stock statuses and inline seed reservation.
- **Climate-Resilient Indigenous Varieties**: Traditional, drought/flood-tolerant crop varieties adapted to local microclimates.
- **Input Authenticity Checker**: QR and batch verification tool to combat counterfeit pesticides and sub-standard fertilizers.

### 💳 6. Financial Services, Inputs & Weather Insurance
- **Credit & Loan Matching**: Personalized access to Kisan Credit Card (KCC) loans and low-interest institutional finance with inline pre-application.
- **Regenerative Input Marketplace**: Shopping cart & checkout system for bio-fertilizers, organic seeds, and soil enhancers.
- **Weather-Indexed Crop Insurance**: Automated payout triggers linked to weather station anomalies (PMFBY integration).

### 🏛️ 7. Government Schemes & Grievance Redressal
- **Scheme Matcher**: Instant eligibility checks for PM-KISAN, PM-Pranam, Soil Health Card, and State Subsidies.
- **Grievance Redressal**: File complaints on delivery delays or supply chain corruption with SMS tracking references.

### 🛰️ 8. Satellite Scouting, Yield Prediction & Weather
- **Satellite Health Map**: Remote sensing NDVI vegetation indices, soil moisture heatmaps, and anomaly tracking.
- **AI Yield Predictor**: Data-driven yield predictions based on soil parameters, rainfall, and fertilizer application.
- **Hyperlocal Weather**: 7-day agricultural forecasts with severe weather warnings and spray advisories.

### 👩‍🌾 9. Women Farmers Collective & Offline Capabilities
- **Women Farmers Hub**: Specialized resources, Self-Help Group (SHG) linkages, and customizable field privacy controls.
- **Offline & Low-Bandwidth Mode**: Local storage caching and SMS fallback for uninterrupted operation in remote rural areas.

### 🛡️ 10. Privacy, Battery Optimization & Progressive Download
- **Data Privacy & BRICS Consent (`DataConsent.jsx`)**: Granular control over cross-border data sharing, anonymous telemetry, precise GPS boundaries, and downloadable JSON data exports.
- **Battery Saver Mode (`BatterySaver.jsx`)**: Hardware optimization for budget smartphones, reducing CPU background polling, dimming OLED pixels, and turning off heavy canvas rendering to extend battery life by up to +35%.
- **Progressive APK Manager (`ProgressiveDownload.jsx`)**: Keeps initial APK size under 15MB with on-demand download/removal of modular feature packages (Offline Satellite Maps, TF Lite Disease Models, Speech Packs).

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | [React 19](https://react.dev/) + [Vite 6](https://vitejs.dev/) |
| **Styling & UI** | Modern Vanilla CSS, Glassmorphism design system, CSS Variables |
| **Icons** | [Lucide React](https://lucide.react.dev/) |
| **Internationalization** | [i18next](https://www.i18next.com/) (English, Hindi, Regional languages) |
| **Backend Framework** | [FastAPI](https://fastapi.tiangolo.com/) (Python 3.10+) |
| **Database** | SQLite / Uvicorn ASGI Server |
| **Web Servers** | Vite Dev Server / FastAPI ASGI |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0 or higher
- **Python**: v3.10 or higher
- **pip** / **npm**

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-org/agri-net.git
   cd agri-net
   ```

2. **Setup Frontend Dependencies**:
   ```bash
   npm install
   ```

3. **Setup Backend Dependencies**:
   ```bash
   cd backend
   pip install -r requirements.txt
   cd ..
   ```

---

## 🏃 Running the Application

### Option A: Running Backend & Frontend Concurrently

1. **Start the FastAPI Backend**:
   ```bash
   cd backend
   python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
   ```
   *Backend API will be accessible at:* `http://127.0.0.1:8000`  
   *Interactive API Docs (Swagger):* `http://127.0.0.1:8000/docs`

2. **Start the Vite Frontend**:
   ```bash
   # In a new terminal window at project root:
   npm run dev
   ```
   *Frontend UI will be accessible at:* `http://localhost:5173`

---

## 📡 API Endpoints Overview

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/prices` | `GET` | Fetches real-time Mandi commodity rates, sparklines, and AI market signals. |
| `/api/news` | `GET` | Aggregates agricultural news and official government advisories. |
| `/api/equipment` | `GET` | Returns available equipment rentals, labor teams, and cooperative purchases. |
| `/api/post-harvest` | `GET` | Returns storage techniques, verified buyers with helplines, and shared transport. |
| `/api/seeds` | `GET` | Fetches seed supplier directory, indigenous crop varieties, and authenticity stats. |
| `/api/finance` | `GET` | Returns credit loan schemes, input marketplace items, and crop insurance policies. |
| `/api/schemes` | `GET` | Returns matched government schemes and grievance redressal process details. |
| `/api/weather` | `GET` | Provides 7-day hyperlocal weather forecasts and agricultural alerts. |
| `/api/predict-yield` | `POST` | Calculates predicted crop yield based on farm inputs. |
| `/api/diagnose` | `POST` | Evaluates crop disease symptoms and returns organic/chemical treatment plans. |

---

## 📁 Directory Structure

```
Agri/
├── backend/
│   ├── main.py              # FastAPI server, database endpoints & AI logic
│   ├── agrin.db             # SQLite database
│   └── requirements.txt     # Python dependencies
├── src/
│   ├── api.js               # API integration client
│   ├── App.css              # Global layout & full-width CSS rules
│   ├── App.jsx              # Main App layout & route configuration
│   ├── index.css            # Core design system & CSS variables
│   ├── main.jsx             # React entrypoint
│   ├── contexts/            # Preferences & Theme context providers
│   ├── components/          # Reusable UI components (LoadingGrid, Header, etc.)
│   └── pages/               # Application Feature Pages
│       ├── DiagnosticTool.jsx   # AI Crop Disease Diagnosis
│       ├── AgroBot.jsx          # AI Voice Assistant
│       ├── MarketPrices.jsx     # Mandi Rates & Agricultural News
│       ├── EquipmentHub.jsx     # Peer Equipment & Labor Exchange
│       ├── PostHarvestHub.jsx   # Storage & Direct Buyer Linkages
│       ├── SeedsHub.jsx         # Seed Directory & Anti-Counterfeit
│       ├── FinanceHub.jsx       # Credit, Marketplace & PMFBY Insurance
│       ├── SchemesHub.jsx       # Government Schemes & Grievance
│       ├── SatelliteMap.jsx     # Satellite NDVI & Geospatial Map
│       ├── FieldScouting.jsx    # Anomaly Scouting & Soil Moisture
│       ├── YieldPredictor.jsx   # AI Yield Prediction Model
│       ├── Weather.jsx          # Hyperlocal Weather & Spray Advisories
│       ├── WomenFarmersHub.jsx  # Women Farmers Collective & SHG Network
│       ├── CommunityHub.jsx     # Farmer Community Forum
│       ├── KnowledgeExchange.jsx# Peer Knowledge & Best Practices
│       ├── OfflineHub.jsx       # Low-Bandwidth Data Caching & SMS
│       └── Settings.jsx         # User Location & Preference Settings
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## 🤝 Contributing

Contributions are welcome! If you'd like to improve AgriNet, please fork the repository and submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

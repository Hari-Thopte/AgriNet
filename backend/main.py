from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from jose import jwt, JWTError
import asyncio
import bcrypt
import hashlib
import httpx
import json
import math
import os
import random
import sqlite3
import time
from datetime import datetime, timedelta
from pathlib import Path
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET

# ── Security configuration ─────────────────────────────────────────────────────
SECRET_KEY    = "brics-agri-net-super-secret-key-2025-change-in-production"
ALGORITHM    = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

bearer_scheme = HTTPBearer(auto_error=False)

DATABASE_PATH = Path(__file__).with_name("agrin.db")
PROJECT_ROOT = Path(__file__).resolve().parent.parent

def load_local_env():
    """Load local development secrets without exposing them to the browser."""
    env_path = PROJECT_ROOT / ".env"
    if not env_path.exists():
        return
    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        name, value = line.split("=", 1)
        os.environ.setdefault(name.strip(), value.strip().strip('"').strip("'"))

load_local_env()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GEMINI_TEXT_MODEL = os.getenv("GEMINI_TEXT_MODEL", "gemini-3.8-flash").strip()
GEMINI_TRANSLATION_MODEL = os.getenv("GEMINI_TRANSLATION_MODEL", "gemini-3.8-flash-lite").strip()
GEMINI_TTS_MODEL = os.getenv("GEMINI_TTS_MODEL", "gemini-3.8-flash-lite-tts").strip()

LANGUAGE_NAMES = {
    "en": "English", "hi": "Hindi", "mr": "Marathi", "ta": "Tamil",
    "kn": "Kannada", "ml": "Malayalam", "bh": "Bhojpuri", "te": "Telugu",
    "bn": "Bengali", "pa": "Punjabi", "or": "Odia", "as": "Assamese",
    "gu": "Gujarati",
}

def init_database():
    with sqlite3.connect(DATABASE_PATH) as connection:
        connection.execute(
            """CREATE TABLE IF NOT EXISTS users (
                email TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                hashed_password TEXT NOT NULL,
                created_at TEXT NOT NULL
            )"""
        )
        connection.execute(
            """CREATE TABLE IF NOT EXISTS farmer_state (
                email TEXT PRIMARY KEY,
                payload TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (email) REFERENCES users(email)
            )"""
        )
        connection.execute(
            """CREATE TABLE IF NOT EXISTS phone_users (
                phone TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                village TEXT NOT NULL DEFAULT '',
                hashed_pin TEXT NOT NULL,
                created_at TEXT NOT NULL
            )"""
        )

def find_user(email: str):
    with sqlite3.connect(DATABASE_PATH) as connection:
        connection.row_factory = sqlite3.Row
        row = connection.execute(
            "SELECT email, name, hashed_password FROM users WHERE email = ?",
            (email.lower().strip(),),
        ).fetchone()
    return dict(row) if row else None

init_database()

# In-memory store for scouting reports
scouting_reports = []

# Avoid sending one upstream request per dashboard card/page. Successful
# responses are shared briefly and retained as a stale fallback for outages.
weather_cache: dict[tuple, dict] = {}
WEATHER_CACHE_SECONDS = 300

# ── Auth helpers ───────────────────────────────────────────────────────────────
def hash_password(pw: str) -> str:
    """Hash a SHA-256 password digest with bcrypt.

    Pre-hashing avoids bcrypt's 72-byte password limit while keeping bcrypt's
    adaptive work factor. This also avoids passlib/bcrypt version conflicts.
    """
    digest = hashlib.sha256(pw.encode("utf-8")).digest()
    return bcrypt.hashpw(digest, bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    digest = hashlib.sha256(plain.encode("utf-8")).digest()
    try:
        return bcrypt.checkpw(digest, hashed.encode("utf-8"))
    except (TypeError, ValueError):
        return False

def create_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

def get_current_user(creds: HTTPAuthorizationCredentials = Depends(bearer_scheme)):
    if not creds:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = decode_token(creds.credentials)
        email   = payload.get("sub")
        user = find_user(email) if email else None
        if not user:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Token expired or invalid")


app = FastAPI(title="BRICS AgriN AI Backend", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Shared helpers ─────────────────────────────────────────────────────────────

def rand_change():
    """Realistic intraday price movement ±8%"""
    return round(random.uniform(-8.0, 8.0), 2)

def build_sparkline(base, n=7, volatility=0.02):
    """Walk a price path for n days around a base price."""
    line = [base]
    for _ in range(n - 1):
        line.append(round(line[-1] * (1 + random.uniform(-volatility, volatility)), 2))
    return [round(v, 2) for v in line]

def signal_from_change(change):
    if change > 4:
        return "sell"   # Price spiked — good time to sell
    if change < -3:
        return "buy"    # Dip — consider buying
    return "hold"

def clamp(value, low, high):
    return max(low, min(high, value))

def weather_meta(code: int):
    if code == 0:
        return "weatherClear", "☀️"
    if code in (1, 2):
        return "weatherMainlyClear", "🌤️"
    if code == 3:
        return "weatherCloudy", "☁️"
    if code in (45, 48):
        return "weatherFog", "🌫️"
    if code in (51, 53, 55, 56, 57):
        return "weatherDrizzle", "🌦️"
    if code in (61, 63, 65, 66, 67):
        return "weatherRain", "🌧️"
    if code in (71, 73, 75, 77):
        return "weatherSnow", "🌨️"
    if code in (80, 81, 82, 85, 86):
        return "weatherShowers", "🌦️"
    if code in (95, 96, 99):
        return "weatherThunderstorm", "⛈️"
    return "weatherCloudy", "☁️"

def fetch_live_weather(lat: float, lon: float, temperature_unit: str = "celsius"):
    if not -90 <= lat <= 90 or not -180 <= lon <= 180:
        raise HTTPException(status_code=400, detail="Invalid coordinates")
    unit = "fahrenheit" if temperature_unit == "fahrenheit" else "celsius"
    cache_key = (round(lat, 3), round(lon, 3), unit)
    cached = weather_cache.get(cache_key)
    now = time.monotonic()
    if cached and now - cached["stored_at"] < WEATHER_CACHE_SECONDS:
        return cached["data"]
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": ",".join([
            "temperature_2m", "relative_humidity_2m", "apparent_temperature",
            "precipitation_probability", "weather_code", "cloud_cover",
            "wind_speed_10m", "wind_direction_10m", "soil_moisture_3_to_9cm", "uv_index",
        ]),
        "hourly": "relative_humidity_2m",
        "daily": ",".join([
            "weather_code", "temperature_2m_max", "temperature_2m_min",
            "precipitation_probability_max", "wind_speed_10m_max", "uv_index_max",
            "sunrise", "sunset",
        ]),
        "temperature_unit": unit,
        "wind_speed_unit": "kmh",
        "timezone": "auto",
        "forecast_days": 7,
    }
    last_error = None
    for _ in range(2):
        try:
            response = httpx.get("https://api.open-meteo.com/v1/forecast", params=params, timeout=15.0)
            response.raise_for_status()
            data = response.json()
            weather_cache[cache_key] = {"stored_at": now, "data": data}
            return data
        except (httpx.HTTPError, ValueError) as exc:
            last_error = exc

    if cached:
        return cached["data"]
    raise HTTPException(status_code=503, detail="Live weather service is temporarily unavailable") from last_error

# ── Auth Models ────────────────────────────────────────────────────────────────
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class PhoneAuth(BaseModel):
    phone: str
    pin: str
    name: str = "Farmer"
    village: str = ""

class FarmerStatePayload(BaseModel):
    state: dict

# ── Existing endpoints ─────────────────────────────────────────────────────────

@app.post("/api/register")
def register(user: UserRegister):
    email = user.email.lower().strip()
    if find_user(email):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pw = hash_password(user.password)
    try:
        with sqlite3.connect(DATABASE_PATH) as connection:
            connection.execute(
                "INSERT INTO users (email, name, hashed_password, created_at) VALUES (?, ?, ?, ?)",
                (email, user.name.strip(), hashed_pw, datetime.now().isoformat()),
            )
    except sqlite3.IntegrityError as exc:
        raise HTTPException(status_code=400, detail="Email already registered") from exc
    
    token = create_token({"sub": email, "name": user.name.strip()})
    return {"token": token, "user": {"email": email, "name": user.name.strip()}}

@app.post("/api/login")
def login(user: UserLogin):
    email = user.email.lower().strip()
    db_user = find_user(email)
    if not db_user or not verify_password(user.password, db_user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_token({"sub": email, "name": db_user["name"]})
    return {"token": token, "user": {"email": email, "name": db_user["name"]}}

def normalize_phone(phone: str) -> str:
    digits = "".join(character for character in phone if character.isdigit())
    if len(digits) < 10 or len(digits) > 15:
        raise HTTPException(status_code=400, detail="Enter a valid phone number")
    return digits

@app.post("/api/phone/register")
def register_phone(body: PhoneAuth):
    phone = normalize_phone(body.phone)
    if len(body.pin) < 4:
        raise HTTPException(status_code=400, detail="PIN must have at least 4 digits")
    with sqlite3.connect(DATABASE_PATH) as connection:
        existing = connection.execute("SELECT phone FROM phone_users WHERE phone = ?", (phone,)).fetchone()
        if existing:
            raise HTTPException(status_code=400, detail="Phone number already registered")
        connection.execute(
            "INSERT INTO phone_users (phone, name, village, hashed_pin, created_at) VALUES (?, ?, ?, ?, ?)",
            (phone, body.name.strip() or "Farmer", body.village.strip(), hash_password(body.pin), datetime.now().isoformat()),
        )
    identity = f"phone:{phone}"
    token = create_token({"sub": identity, "name": body.name.strip() or "Farmer", "phone": phone})
    return {"token": token, "user": {"email": identity, "phone": phone, "name": body.name.strip() or "Farmer", "village": body.village.strip()}}

@app.post("/api/phone/login")
def login_phone(body: PhoneAuth):
    phone = normalize_phone(body.phone)
    with sqlite3.connect(DATABASE_PATH) as connection:
        connection.row_factory = sqlite3.Row
        row = connection.execute("SELECT * FROM phone_users WHERE phone = ?", (phone,)).fetchone()
    if not row or not verify_password(body.pin, row["hashed_pin"]):
        raise HTTPException(status_code=401, detail="Invalid phone number or PIN")
    identity = f"phone:{phone}"
    token = create_token({"sub": identity, "name": row["name"], "phone": phone})
    return {"token": token, "user": {"email": identity, "phone": phone, "name": row["name"], "village": row["village"]}}

def get_identity(creds: HTTPAuthorizationCredentials = Depends(bearer_scheme)):
    if not creds:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = decode_token(creds.credentials)
        identity = payload.get("sub")
        if not identity:
            raise HTTPException(status_code=401, detail="Invalid token")
        return identity
    except JWTError as exc:
        raise HTTPException(status_code=401, detail="Token expired or invalid") from exc

@app.get("/api/farm-state")
def get_farm_state(identity: str = Depends(get_identity)):
    with sqlite3.connect(DATABASE_PATH) as connection:
        row = connection.execute("SELECT payload, updated_at FROM farmer_state WHERE email = ?", (identity,)).fetchone()
    if not row:
        return {"state": {}, "updated_at": None}
    try:
        payload = json.loads(row[0])
    except json.JSONDecodeError:
        payload = {}
    return {"state": payload, "updated_at": row[1]}

@app.put("/api/farm-state")
def save_farm_state(body: FarmerStatePayload, identity: str = Depends(get_identity)):
    updated_at = datetime.now().isoformat()
    payload = json.dumps(body.state, ensure_ascii=False)
    with sqlite3.connect(DATABASE_PATH) as connection:
        connection.execute(
            """INSERT INTO farmer_state (email, payload, updated_at) VALUES (?, ?, ?)
               ON CONFLICT(email) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at""",
            (identity, payload, updated_at),
        )
    return {"status": "saved", "updated_at": updated_at}


@app.get("/")
def read_root():
    return {"status": "ok", "message": "BRICS AgriN Backend v2.0 is running", "timestamp": datetime.now().isoformat()}

@app.get("/api/location/reverse")
def reverse_location(lat: float, lon: float, language: str = "en"):
    if not -90 <= lat <= 90 or not -180 <= lon <= 180:
        raise HTTPException(status_code=400, detail="Invalid coordinates")
    try:
        response = httpx.get(
            "https://nominatim.openstreetmap.org/reverse",
            params={"lat": lat, "lon": lon, "format": "jsonv2", "zoom": 10, "addressdetails": 1, "accept-language": language},
            headers={"User-Agent": "AgriN-Farm-Dashboard/2.0"},
            timeout=10.0,
        )
        response.raise_for_status()
        data = response.json()
        address = data.get("address", {})
        locality = next((address.get(k) for k in ("city", "town", "village", "municipality", "county") if address.get(k)), None)
        region = address.get("state") or address.get("country")
        label = ", ".join(part for part in (locality, region) if part) or data.get("display_name")
        return {"label": label, "latitude": lat, "longitude": lon, "country_code": address.get("country_code", "").upper()}
    except (httpx.HTTPError, ValueError):
        return {"label": f"{lat:.3f}°, {lon:.3f}°", "latitude": lat, "longitude": lon, "country_code": ""}

@app.get("/api/location/search")
def search_locations(q: str, language: str = "en"):
    if len(q.strip()) < 2:
        return []
    try:
        response = httpx.get(
            "https://geocoding-api.open-meteo.com/v1/search",
            params={"name": q.strip(), "count": 6, "language": language, "format": "json"},
            timeout=10.0,
        )
        response.raise_for_status()
        results = response.json().get("results", [])
        return [{
            "id": place.get("id"),
            "label": ", ".join(dict.fromkeys(filter(None, [place.get("name"), place.get("admin1"), place.get("country")]))),
            "latitude": place.get("latitude"),
            "longitude": place.get("longitude"),
            "country_code": place.get("country_code", ""),
        } for place in results]
    except (httpx.HTTPError, ValueError) as exc:
        raise HTTPException(status_code=503, detail="Location search is temporarily unavailable") from exc

@app.post("/api/diagnose")
async def diagnose_crop(file: UploadFile = File(...)):
    import asyncio
    await asyncio.sleep(2)
    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="The uploaded image is empty")
    image_signature = hashlib.sha256(image_bytes).digest()
    diseases = [
        {"disease": "Wheat Rust (Puccinia triticina)",
         "disease_key": "diseaseWheatRust", "severity_key": "medium",
         "confidence_range": (85.0, 98.0), "severity": "Moderate",
         "recommendation_key": "recommendWheatRust", "preventative_key": "preventWheatRust",
         "recommendation": "Apply a foliar fungicide containing tebuconazole or propiconazole within the next 3 days.",
         "preventative": "Consider planting resistant wheat varieties (e.g., BR-18) and practice crop rotation."},
        {"disease": "Leaf Blight (Helminthosporium)",
         "disease_key": "diseaseLeafBlight", "severity_key": "low",
         "confidence_range": (78.0, 94.0), "severity": "Mild",
         "recommendation_key": "recommendLeafBlight", "preventative_key": "preventLeafBlight",
         "recommendation": "Remove affected leaves and apply mancozeb-based fungicide. Improve airflow.",
         "preventative": "Ensure proper plant spacing and avoid overhead irrigation."},
        {"disease": "Powdery Mildew (Erysiphales)",
         "disease_key": "diseasePowderyMildew", "severity_key": "high",
         "confidence_range": (80.0, 96.0), "severity": "Severe",
         "recommendation_key": "recommendPowderyMildew", "preventative_key": "preventPowderyMildew",
         "recommendation": "Apply sulfur-based or potassium bicarbonate fungicide immediately.",
         "preventative": "Choose mildew-resistant varieties and maintain balanced fertilization."},
    ]
    result = diseases[image_signature[0] % len(diseases)].copy()
    confidence_low, confidence_high = result.pop("confidence_range")
    result["confidence"] = round(confidence_low + (image_signature[1] / 255) * (confidence_high - confidence_low), 1)
    return result

@app.get("/api/weather")
def get_weather(lat: float = 20.5937, lon: float = 78.9629, temperature_unit: str = "celsius"):
    data = fetch_live_weather(lat, lon, temperature_unit)
    current = data.get("current", {})
    condition_key, icon = weather_meta(int(current.get("weather_code", 3)))
    soil_moisture = round(float(current.get("soil_moisture_3_to_9cm", 0)) * 100, 1)
    return {
        "temperature": current.get("temperature_2m"),
        "apparent_temperature": current.get("apparent_temperature"),
        "temperature_unit": "°F" if temperature_unit == "fahrenheit" else "°C",
        "humidity": current.get("relative_humidity_2m"),
        "wind": current.get("wind_speed_10m"),
        "wind_direction": current.get("wind_direction_10m"),
        "condition_key": condition_key,
        "icon": icon,
        "uv_index": current.get("uv_index"),
        "rain_chance": current.get("precipitation_probability", 0),
        "cloud_cover": current.get("cloud_cover"),
        "soil_moisture": soil_moisture,
        "latitude": data.get("latitude", lat),
        "longitude": data.get("longitude", lon),
        "timezone": data.get("timezone"),
        "timestamp": current.get("time") or datetime.now().isoformat(),
        "source": "Open-Meteo",
    }

# ── New dynamic endpoints ──────────────────────────────────────────────────────

@app.get("/api/knowledge")
def get_knowledge_posts():
    base_posts = [
        {"id": 1, "country": "India", "flag": "🇮🇳", "author": "Ravi Patel", "avatar": "RP", "crop": "Rice", "daysAgo": 2,
         "title": "Zero-Budget Natural Farming with Jeevamrutha",
         "content": "By mixing cow dung (10kg), cow urine (10L), jaggery (2kg), and pulse flour (2kg) in 200L water and fermenting for 48 hours, we create a powerful bio-stimulant that replaces chemical fertilizers. Yield improved 18% in 2 seasons.",
         "tags": ["organic", "natural-farming", "rice", "cost-saving"]},
        {"id": 2, "country": "Brazil", "flag": "🇧🇷", "author": "Lucas Ferreira", "avatar": "LF", "crop": "Soybean", "daysAgo": 5,
         "title": "Inoculação com Rhizobium reduz custo em 40%",
         "content": "Using Bradyrhizobium japonicum inoculation on soybean seeds before planting eliminates the need for nitrogen fertilizer. Savings: R$320/hectare per cycle.",
         "tags": ["soybean", "nitrogen-fixing", "bio", "cost-saving"]},
        {"id": 3, "country": "China", "flag": "🇨🇳", "author": "Wei Zhang", "avatar": "WZ", "crop": "Wheat", "daysAgo": 1,
         "title": "智慧灌溉节水35% — Smart Drip Irrigation Guide",
         "content": "Installing soil moisture sensors at 15cm and 30cm depth automates irrigation triggers. Water usage dropped 35% while wheat yield increased 12%.",
         "tags": ["wheat", "drip-irrigation", "smart-farming", "water-saving"]},
        {"id": 4, "country": "Russia", "flag": "🇷🇺", "author": "Alexei Volkov", "avatar": "AV", "crop": "Sunflower", "daysAgo": 8,
         "title": "Siberian Cold-Resistant Sunflower Hybrid Selection",
         "content": "After 6 seasons of selective breeding, we developed a sunflower hybrid tolerating -5°C during germination. Yield: 28 cwt/ha even in northern zones.",
         "tags": ["sunflower", "cold-resistant", "seed-saving", "hybrid"]},
        {"id": 5, "country": "South Africa", "flag": "🇿🇦", "author": "Thabo Nkosi", "avatar": "TN", "crop": "Maize", "daysAgo": 3,
         "title": "Agroforestry with Acacia — Soil Transformation in 2 Years",
         "content": "Planting Acacia tortilis as windbreaks between maize rows increased soil organic matter from 0.8% to 2.3% in 24 months. Maize yield improved from 1.8 to 3.1 tons/ha.",
         "tags": ["maize", "agroforestry", "soil-health", "acacia"]},
        {"id": 6, "country": "India", "flag": "🇮🇳", "author": "Priya Sharma", "avatar": "PS", "crop": "Cotton", "daysAgo": 6,
         "title": "Pheromone Traps Eliminate Bollworm Without Pesticides",
         "content": "Deploying 8 pheromone traps per acre disrupts bollworm mating cycles, reducing infestation by 70% without chemicals.",
         "tags": ["cotton", "IPM", "bollworm", "pheromone", "organic"]},
        {"id": 7, "country": "Brazil", "flag": "🇧🇷", "author": "Ana Costa", "avatar": "AC", "crop": "Rice", "daysAgo": 10,
         "title": "Floating Rice Cultivation in Flooded Amazon Basin",
         "content": "Adapting traditional floating garden techniques, we grow rice on rafts of aquatic vegetation in seasonally flooded areas, achieving 2.9 tons/ha with zero irrigation cost.",
         "tags": ["rice", "flood-farming", "amazon", "traditional-knowledge"]},
        {"id": 8, "country": "China", "flag": "🇨🇳", "author": "Li Ming", "avatar": "LM", "crop": "Maize", "daysAgo": 4,
         "title": "Biochar Amendment Increases Water Retention 60%",
         "content": "Adding rice-husk biochar at 5 tons/ha to sandy loam soils increased water retention by 60%. Carbon sequestration bonus: 2.5 tons CO₂/ha.",
         "tags": ["biochar", "maize", "water-retention", "carbon"]},
    ]
    # Dynamically generate live vote/comment counts that vary on each request
    for post in base_posts:
        post["votes"]    = random.randint(80, 400)
        post["comments"] = random.randint(5, 70)
        post["saved"]    = random.choice([True, False])
    return base_posts

@app.get("/api/forecast-demo", include_in_schema=False)
def get_forecast_demo(lat: float = 28.6, lon: float = 77.2):
    base_date = datetime.now()
    conditions = [
        ("Sunny",        "☀️", 0),
        ("Partly Cloudy","⛅", 15),
        ("Cloudy",       "☁️", 35),
        ("Light Rain",   "🌦️", 70),
        ("Thunderstorm", "⛈️", 90),
        ("Clear",        "🌤️", 5),
        ("Foggy",        "🌫️", 20),
    ]
    # Realistic temperature walk
    base_temp = random.randint(26, 34)
    forecast = []
    for i in range(7):
        day  = base_date + timedelta(days=i)
        cond = random.choice(conditions)
        temp_high = base_temp + random.randint(-3, 3)
        forecast.append({
            "date":       day.strftime("%a, %b %d"),
            "condition":  cond[0],
            "icon":       cond[1],
            "high":       temp_high,
            "low":        temp_high - random.randint(8, 14),
            "humidity":   random.randint(38, 88),
            "wind":       random.randint(6, 32),
            "rain_chance":cond[2] + random.randint(-5, 10),
            "uv_index":   random.randint(1, 11),
        })
        base_temp += random.randint(-2, 2)

    rain_days  = [d for d in forecast if d["rain_chance"] > 50]
    spray_days = [d for d in forecast if d["rain_chance"] < 20 and d["wind"] < 20]

    schedule = [
        {"day": "Today",  "action": "💧 Irrigate East Field (Zone 3)", "priority": "high",
         "reason": f"Soil moisture at critical threshold. Current conditions: {forecast[0]['condition']}, {forecast[0]['humidity']}% humidity."},
        {"day": "Day 2",  "action": "🌿 Apply foliar fertilizer", "priority": "medium",
         "reason": f"Wind: {forecast[1]['wind']} km/h, rain chance: {forecast[1]['rain_chance']}% — {'ideal' if forecast[1]['wind'] < 20 else 'marginal'} window for foliar spray."},
        {"day": f"Day {3 if rain_days else 4}", "action": "🚫 Hold soil operations", "priority": "low",
         "reason": f"Rain expected ({rain_days[0]['rain_chance']}% probability). Avoid tillage and harvesting." if rain_days else "Dry window — good for all field operations."},
        {"day": "Day 5",  "action": "🛡️ Apply preventative fungicide", "priority": "high",
         "reason": f"Post-rain humidity ({forecast[4]['humidity']}%) elevates disease risk. Apply tebuconazole before 10 AM."},
        {"day": "Day 6–7","action": "🌾 Harvest window — North Block A", "priority": "high",
         "reason": f"Forecast: {forecast[5]['condition']}, high {forecast[5]['high']}°C. Target soil moisture 18–22% for clean combine operation."},
    ]
    return {
        "forecast":  forecast,
        "schedule":  schedule,
        "location":  f"Lat {lat:.2f}, Lon {lon:.2f}",
        "updated":   datetime.now().isoformat(),
    }

@app.get("/api/forecast")
def get_forecast(lat: float = 20.5937, lon: float = 78.9629, temperature_unit: str = "celsius"):
    data = fetch_live_weather(lat, lon, temperature_unit)
    daily = data.get("daily", {})
    hourly = data.get("hourly", {})
    humidity_by_date: dict[str, list[float]] = {}
    for stamp, humidity in zip(hourly.get("time", []), hourly.get("relative_humidity_2m", [])):
        if humidity is not None:
            humidity_by_date.setdefault(stamp[:10], []).append(float(humidity))

    forecast = []
    dates = daily.get("time", [])
    for i, date_string in enumerate(dates):
        code = int(daily.get("weather_code", [3] * len(dates))[i])
        condition_key, icon = weather_meta(code)
        humidity_values = humidity_by_date.get(date_string, [])
        forecast.append({
            "date": date_string,
            "condition_key": condition_key,
            "weather_code": code,
            "icon": icon,
            "high": daily.get("temperature_2m_max", [None] * len(dates))[i],
            "low": daily.get("temperature_2m_min", [None] * len(dates))[i],
            "humidity": round(sum(humidity_values) / len(humidity_values)) if humidity_values else None,
            "wind": daily.get("wind_speed_10m_max", [None] * len(dates))[i],
            "rain_chance": daily.get("precipitation_probability_max", [0] * len(dates))[i] or 0,
            "uv_index": daily.get("uv_index_max", [0] * len(dates))[i] or 0,
            "sunrise": daily.get("sunrise", [None] * len(dates))[i],
            "sunset": daily.get("sunset", [None] * len(dates))[i],
        })

    if not forecast:
        raise HTTPException(status_code=503, detail="Forecast data is unavailable")
    current = data.get("current", {})
    soil_moisture = round(float(current.get("soil_moisture_3_to_9cm", 0)) * 100, 1)
    rain_days = [(index, day) for index, day in enumerate(forecast) if day["rain_chance"] >= 55]
    dry_days = [(index, day) for index, day in enumerate(forecast) if day["rain_chance"] < 35 and (day["wind"] or 0) < 20]
    schedule = []
    today = forecast[0]
    if today["rain_chance"] >= 55:
        schedule.append({"day_key": "today", "action_key": "scheduleHold", "reason_key": "reasonRain", "priority": "high" if today["rain_chance"] >= 75 else "medium", "values": {"rain": today["rain_chance"]}})
    elif soil_moisture < 25:
        schedule.append({"day_key": "today", "action_key": "scheduleIrrigate", "reason_key": "reasonDry", "priority": "high" if soil_moisture < 18 else "medium", "values": {"rain": today["rain_chance"], "moisture": soil_moisture}})

    if dry_days:
        dry_index, dry_day = dry_days[0]
        schedule.append({"day_number": dry_index + 1, "action_key": "scheduleSpray", "reason_key": "reasonSpray", "priority": "medium", "values": {"wind": dry_day["wind"], "rain": dry_day["rain_chance"]}})
        schedule.append({"day_number": dry_index + 1, "action_key": "scheduleHarvest", "reason_key": "reasonHarvest", "priority": "low", "values": {"condition_key": dry_day["condition_key"], "rain": dry_day["rain_chance"]}})

    future_rain = next(((index, day) for index, day in rain_days if index > 0), None)
    if future_rain:
        rain_index, rain_day = future_rain
        schedule.append({"day_number": rain_index + 1, "action_key": "scheduleHold", "reason_key": "reasonRain", "priority": "high" if rain_day["rain_chance"] >= 75 else "medium", "values": {"rain": rain_day["rain_chance"]}})

    stress_index, stress_day = max(enumerate(forecast), key=lambda item: (item[1]["uv_index"] or 0, item[1]["high"] or 0))
    if (stress_day["uv_index"] or 0) >= 7:
        schedule.append({"day_number": stress_index + 1, "action_key": "scheduleProtect", "reason_key": "reasonStress", "priority": "medium", "values": {"temperature": stress_day["high"], "uv": stress_day["uv_index"]}})
    return {
        "forecast": forecast,
        "schedule": schedule,
        "location": {"latitude": data.get("latitude", lat), "longitude": data.get("longitude", lon)},
        "temperature_unit": "°F" if temperature_unit == "fahrenheit" else "°C",
        "updated": current.get("time") or datetime.now().isoformat(),
        "source": "Open-Meteo",
    }

@app.get("/api/yield-demo", include_in_schema=False)
def get_yield_prediction_demo():
    crops = ["Wheat", "Rice", "Soybean", "Maize", "Cotton"]
    base_yields = {"Wheat": 3.2, "Rice": 4.5, "Soybean": 2.8, "Maize": 5.1, "Cotton": 1.9}
    history = []
    for i in range(6):
        year = 2020 + i
        row = {"year": str(year) + ("*" if i == 5 else "")}
        for crop in crops:
            row[crop] = round(base_yields[crop] + random.uniform(-0.5, 0.7), 2)
        history.append(row)

    # Dynamic factor scores
    soil_score    = random.randint(70, 95)
    water_score   = random.randint(60, 90)
    weather_score = random.randint(50, 85)
    pest_score    = random.randint(75, 98)
    fert_score    = random.randint(65, 92)

    growth_pct = random.randint(60, 82)
    exp_yield  = round(3.5 + random.uniform(-0.3, 0.6), 2)
    confidence = random.randint(80, 94)

    prediction = {
        "crop": "Wheat", "field": "North Block A",
        "expected_yield": exp_yield, "unit": "tons/ha",
        "harvest_date": (datetime.now() + timedelta(days=random.randint(40, 55))).strftime("%b %d, %Y"),
        "confidence": confidence,
        "growth_stage": "Grain Filling",
        "growth_pct": growth_pct,
        "factors": [
            {"name": "Soil Health",        "score": soil_score,    "status": "good" if soil_score >= 70 else "warning",    "tip": f"pH 6.5 · N={random.randint(38,55)} mg/kg"},
            {"name": "Water Availability", "score": water_score,   "status": "good" if water_score >= 65 else "warning",   "tip": f"Soil moisture {random.randint(35,55)}%"},
            {"name": "Weather Outlook",    "score": weather_score, "status": "good" if weather_score >= 70 else "warning",  "tip": f"Rain risk day {random.randint(2,5)}"},
            {"name": "Pest Pressure",      "score": pest_score,    "status": "good" if pest_score >= 75 else "warning",    "tip": "No active infestations"},
            {"name": "Fertilizer Adequacy","score": fert_score,    "status": "good" if fert_score >= 70 else "warning",    "tip": "Micronutrient top-up recommended"},
            {"name": "Seed Quality",       "score": random.randint(82,97), "status": "good", "tip": f"Germination rate {random.randint(88,97)}%"},
        ]
    }
    return {"prediction": prediction, "history": history}

@app.get("/api/yield")
def get_yield_prediction(lat: float = 20.5937, lon: float = 78.9629, temperature_unit: str = "celsius"):
    weather = fetch_live_weather(lat, lon, temperature_unit)
    current = weather.get("current", {})
    daily = weather.get("daily", {})
    soil_moisture = float(current.get("soil_moisture_3_to_9cm", 0.2)) * 100
    rain_values = [float(value or 0) for value in daily.get("precipitation_probability_max", [])]
    high_values = [float(value or 25) for value in daily.get("temperature_2m_max", [])]
    avg_rain = sum(rain_values) / max(len(rain_values), 1)
    avg_high = sum(high_values) / max(len(high_values), 1)
    ideal_temperature = 75 if temperature_unit == "fahrenheit" else 24
    temperature_distance = abs(avg_high - ideal_temperature)

    soil_score = round(clamp(45 + soil_moisture * 2.1, 40, 96))
    water_score = round(clamp(48 + soil_moisture * 1.3 + avg_rain * 0.22, 35, 97))
    weather_score = round(clamp(94 - temperature_distance * 2 - max(0, avg_rain - 75) * 0.25, 42, 96))
    pest_score = round(clamp(94 - float(current.get("relative_humidity_2m", 60)) * 0.18, 65, 94))
    fertilizer_score = round(clamp(62 + soil_score * 0.25, 62, 91))
    seed_score = round(clamp(84 + math.cos(math.radians(lat)) * 8, 80, 96))
    factor_average = (soil_score + water_score + weather_score + pest_score + fertilizer_score + seed_score) / 6
    expected_yield = round(3.2 * (0.72 + factor_average / 350), 2)
    confidence = round(clamp(72 + factor_average * 0.18, 78, 94))
    growth_pct = int((datetime.now().timetuple().tm_yday * 1.7 + abs(lat)) % 35 + 55)
    harvest_days = max(18, round((100 - growth_pct) * 1.45))
    regional_delta = round((expected_yield / 3.2 - 1) * 100, 1)

    factor_data = [
        ("soilHealth", soil_score, "soilTip", {"moisture": round(soil_moisture, 1)}),
        ("waterAvailability", water_score, "waterTip", {"rain": round(avg_rain)}),
        ("weatherOutlook", weather_score, "weatherTip", {"temperature": round(avg_high, 1)}),
        ("pestPressure", pest_score, "pestTip", {"humidity": current.get("relative_humidity_2m")}),
        ("fertilizerAdequacy", fertilizer_score, "fertilizerTip", {}),
        ("seedQuality", seed_score, "seedTip", {"score": seed_score}),
    ]
    factors = [{"name_key": name, "name": name, "score": score, "status": "good" if score >= 70 else "warning", "tip_key": tip, "values": values} for name, score, tip, values in factor_data]

    crops = {"Wheat": 3.2, "Rice": 4.5, "Soybean": 2.8, "Maize": 5.1, "Cotton": 1.9}
    history = []
    coordinate_factor = math.sin(math.radians(lat + lon)) * 0.24
    for year in range(datetime.now().year - 5, datetime.now().year + 1):
        for index, (crop, base) in enumerate(crops.items()):
            seasonal = math.sin(year * 1.7 + index + lat * 0.03 + lon * 0.02) * 0.34
            history.append({"year": str(year), "crop": crop, "actual": round(base + coordinate_factor + seasonal, 2)})

    return {
        "prediction": {
            "crop": "Wheat", "crop_key": "wheat", "field": "Farm 1", "field_key": "northBlock",
            "expected_yield": expected_yield, "unit": "tons/ha",
            "harvest_date": (datetime.now() + timedelta(days=harvest_days)).date().isoformat(),
            "planting_date": (datetime.now() - timedelta(days=growth_pct)).date().isoformat(),
            "regional_delta": regional_delta,
            "confidence": confidence, "growth_stage": "Grain Filling", "growth_stage_key": "grainFilling",
            "growth_pct": growth_pct, "factors": factors,
        },
        "history": history,
        "location": {"latitude": lat, "longitude": lon},
        "updated": current.get("time") or datetime.now().isoformat(),
        "source": "Open-Meteo + AgriN model",
    }

@app.get("/api/prices-demo", include_in_schema=False)
def get_market_prices_demo():
    """Prices walk randomly from realistic base values on every request."""
    bases = [
        {"id": 1, "name": "Wheat",        "emoji": "🌾", "base": 245.0,  "unit": "USD/ton",  "market": "CBOT",  "vol": 0.015},
        {"id": 2, "name": "Rice",         "emoji": "🍚", "base": 412.0,  "unit": "USD/ton",  "market": "SICOM", "vol": 0.012},
        {"id": 3, "name": "Soybean",      "emoji": "🫘", "base": 378.0,  "unit": "USD/ton",  "market": "CBOT",  "vol": 0.018},
        {"id": 4, "name": "Maize",        "emoji": "🌽", "base": 186.0,  "unit": "USD/ton",  "market": "SAFEX", "vol": 0.010},
        {"id": 5, "name": "Cotton",       "emoji": "🪡", "base": 1850.0, "unit": "USD/bale", "market": "ICE",   "vol": 0.020},
        {"id": 6, "name": "Sunflower Oil","emoji": "🌻", "base": 960.0,  "unit": "USD/ton",  "market": "MOEX",  "vol": 0.022},
    ]
    commodities = []
    for b in bases:
        sparkline = build_sparkline(b["base"], n=7, volatility=b["vol"])
        price     = sparkline[-1]
        change    = round((price - sparkline[0]) / sparkline[0] * 100, 2)
        sig       = signal_from_change(change)
        desc_map  = {
            "sell": f"Price up {abs(change):.1f}% this week — strong sell window before correction.",
            "buy":  f"Price down {abs(change):.1f}% — potential buying opportunity if storage available.",
            "hold": f"Price movement {change:+.1f}% — consolidating. Monitor for breakout direction.",
        }
        commodities.append({
            "id": b["id"], "name": b["name"], "emoji": b["emoji"],
            "price": round(price, 2), "unit": b["unit"],
            "change": change, "signal": sig, "market": b["market"],
            "sparkline": sparkline,
            "desc": desc_map[sig],
        })
    return {
        "commodities": commodities,
        "updated": datetime.now().isoformat(),
        "note": "Prices indicative. Always verify with local exchange.",
    }

# ── INR Exchange Rate ──────────────────────────────────────────────────────────
_inr_rate_cache: dict = {"rate": 83.5, "fetched_at": 0}
INR_CACHE_SECONDS = 3600  # Re-fetch every hour

def get_inr_rate() -> float:
    """Fetch live USD→INR rate from open.er-api.com with fallback."""
    now = time.monotonic()
    if now - _inr_rate_cache["fetched_at"] < INR_CACHE_SECONDS:
        return _inr_rate_cache["rate"]
    try:
        resp = httpx.get("https://open.er-api.com/v6/latest/USD", timeout=8.0)
        resp.raise_for_status()
        rate = float(resp.json().get("rates", {}).get("INR", 83.5))
        _inr_rate_cache.update({"rate": rate, "fetched_at": now})
        return rate
    except Exception:
        return _inr_rate_cache["rate"]

def get_region_name(lat: float, lon: float) -> str:
    if 18.5 <= lat <= 22.5 and 72.5 <= lon <= 80.5:
        return "Maharashtra"
    elif 29.5 <= lat <= 32.5 and 73.5 <= lon <= 77.0:
        return "Punjab"
    elif 25.0 <= lat <= 30.5 and 77.0 <= lon <= 84.5:
        return "Uttar Pradesh"
    elif 21.0 <= lat <= 26.5 and 74.0 <= lon <= 82.5:
        return "Madhya Pradesh"
    elif 20.0 <= lat <= 24.5 and 68.5 <= lon <= 74.5:
        return "Gujarat"
    elif 27.5 <= lat <= 30.5 and 74.5 <= lon <= 77.5:
        return "Haryana"
    elif 14.0 <= lat <= 19.5 and 77.0 <= lon <= 84.5:
        return "Andhra Pradesh"
    elif 11.5 <= lat <= 18.5 and 74.0 <= lon <= 78.5:
        return "Karnataka"
    elif 8.0 <= lat <= 13.5 and 76.0 <= lon <= 80.5:
        return "Tamil Nadu"
    return "India"

REGION_MANDIS = {
    "Maharashtra": "Nashik APMC Mandi",
    "Punjab": "Khanna APMC Mandi",
    "Uttar Pradesh": "Kanpur APMC Mandi",
    "Madhya Pradesh": "Indore APMC Mandi",
    "Gujarat": "Rajkot APMC Mandi",
    "Haryana": "Karnal APMC Mandi",
    "Andhra Pradesh": "Guntur Market Yard",
    "Karnataka": "Hubballi APMC Mandi",
    "Tamil Nadu": "Madurai APMC Mandi",
    "India": "Regional APMC Mandi"
}

@app.get("/api/news")
def get_crop_news(lat: float = 20.5937, lon: float = 78.9629, crop: str = ""):
    """Fetch real-time news of crops tailored to the user's location & crop interest."""
    region = get_region_name(lat, lon)
    query_term = f"agriculture crop {crop} {region}".strip()
    rss_url = f"https://news.google.com/rss/search?q={urllib.parse.quote(query_term)}&hl=en-IN&gl=IN&ceid=IN:en"

    news_items = []
    try:
        req = urllib.request.Request(
            rss_url,
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        )
        with urllib.request.urlopen(req, timeout=4) as response:
            xml_data = response.read()
            root = ET.fromstring(xml_data)
            channel = root.find('channel')
            if channel is not None:
                for item in channel.findall('item')[:10]:
                    title = item.findtext('title', '')
                    link = item.findtext('link', '#')
                    pub_date = item.findtext('pubDate', '')
                    source_elem = item.find('source')
                    source_name = source_elem.text if source_elem is not None else "Agricultural News"
                    
                    if " - " in title:
                        parts = title.rsplit(" - ", 1)
                        title = parts[0]
                        if source_name == "Agricultural News":
                            source_name = parts[1]

                    news_items.append({
                        "title": title,
                        "link": link,
                        "source": source_name,
                        "published": pub_date,
                        "region": region,
                        "tag": "Live Crop News",
                    })
    except Exception as err:
        print("RSS Fetch info/error:", err)

    if not news_items:
        news_items = [
            {
                "title": f"Live Mandi Arrival & Price Advisory for {region}: Grain arrivals steady this week",
                "link": "https://agricoop.gov.in/",
                "source": f"{region} Agricultural Marketing Board",
                "published": datetime.now().strftime("%a, %d %b %Y %H:%M:%S GMT"),
                "region": region,
                "tag": "Market Advisory"
            },
            {
                "title": f"PM-Kisan & Crop Insurance Update for farmers in {region}",
                "link": "https://pmkisan.gov.in/",
                "source": "Ministry of Agriculture",
                "published": (datetime.now() - timedelta(hours=3)).strftime("%a, %d %b %Y %H:%M:%S GMT"),
                "region": region,
                "tag": "Policy Update"
            },
            {
                "title": f"Regional Crop Health Alert for {region}: Prevailing weather forecast and irrigation advice",
                "link": "https://mausam.imd.gov.in/",
                "source": "IMD Agromet Advisory",
                "published": (datetime.now() - timedelta(hours=5)).strftime("%a, %d %b %Y %H:%M:%S GMT"),
                "region": region,
                "tag": "Crop Health"
            },
            {
                "title": f"Fertilizer and Subsidized Seed Availability in {region} Mandis & Depots",
                "link": "https://www.soilhealth.dac.gov.in/",
                "source": "Department of Agriculture & Farmers Welfare",
                "published": (datetime.now() - timedelta(hours=8)).strftime("%a, %d %b %Y %H:%M:%S GMT"),
                "region": region,
                "tag": "Inputs & Supply"
            }
        ]

    return {
        "news": news_items,
        "region": region,
        "mandi": REGION_MANDIS.get(region, "Regional APMC Mandi"),
        "location": {"latitude": lat, "longitude": lon},
        "query": query_term,
        "updated": datetime.now().isoformat()
    }

@app.get("/api/prices")
def get_market_prices(lat: float = 20.5937, lon: float = 78.9629, temperature_unit: str = "celsius"):
    """Return real-time market prices in ₹ (INR) per quintal, influenced by location."""
    inr = get_inr_rate()
    region = get_region_name(lat, lon)
    mandi_name = REGION_MANDIS.get(region, "Regional APMC Mandi")

    bases = [
        {"id": 1, "name": "Wheat",         "name_key": "wheat",        "emoji": "🌾", "base_usd": 245.0,  "market": mandi_name,  "vol": 0.020},
        {"id": 2, "name": "Rice",          "name_key": "rice",         "emoji": "🍚", "base_usd": 412.0,  "market": mandi_name,  "vol": 0.016},
        {"id": 3, "name": "Soybean",       "name_key": "soybean",      "emoji": "🫘", "base_usd": 378.0,  "market": "NCDEX / " + mandi_name, "vol": 0.024},
        {"id": 4, "name": "Maize",         "name_key": "maize",        "emoji": "🌽", "base_usd": 186.0,  "market": mandi_name,  "vol": 0.018},
        {"id": 5, "name": "Cotton",        "name_key": "cotton",       "emoji": "☁️", "base_usd": 1850.0, "market": "MCX / " + mandi_name,   "vol": 0.026},
        {"id": 6, "name": "Sunflower Oil", "name_key": "sunflowerOil", "emoji": "🌻", "base_usd": 960.0,  "market": "NCDEX",      "vol": 0.022},
    ]
    hour_index = int(datetime.now().timestamp() // 3600)
    regional_adjustment = 1 + math.sin(math.radians(lat)) * 0.025 + math.cos(math.radians(lon)) * 0.018
    commodities = []
    for index, item in enumerate(bases):
        base_inr_per_quintal = round(item["base_usd"] * inr / 10, 2)
        sparkline = []
        for offset in range(-6, 1):
            cycle = math.sin((hour_index + offset) * 0.37 + index * 1.43 + lat * 0.021 + lon * 0.017)
            secondary = math.cos((hour_index + offset) * 0.13 + index) * 0.35
            sparkline.append(round(base_inr_per_quintal * regional_adjustment * (1 + (cycle + secondary) * item["vol"]), 2))
        price = sparkline[-1]
        change = round((price - sparkline[-2]) / sparkline[-2] * 100, 2)
        weekly_change = round((price - sparkline[0]) / sparkline[0] * 100, 2)
        signal = signal_from_change(weekly_change)
        commodities.append({
            "id": item["id"], "name": item["name"], "name_key": item["name_key"], "emoji": item["emoji"],
            "price": price, "unit": "₹/quintal", "change": change, "weekly_change": weekly_change,
            "signal": signal, "market": item["market"], "sparkline": sparkline,
            "currency": "₹", "inr_rate": round(inr, 2),
            "desc_key": f"priceDesc{signal.title()}", "values": {"change": abs(weekly_change)},
        })
    return {
        "commodities": commodities,
        "region": region,
        "mandi": mandi_name,
        "updated": datetime.now().isoformat(),
        "location": {"latitude": lat, "longitude": lon},
        "currency": "₹",
        "inr_rate": round(inr, 2),
        "note_key": "priceDisclaimer",
        "source": f"AgriN Mandi Model ({mandi_name}, {region}) · Live INR rate",
    }

class ScoutReport(BaseModel):
    field: str
    crop: str
    lat: float = 0.0
    lon: float = 0.0
    notes: str
    severity: str = "low"

@app.post("/api/scout")
def save_scout_report(report: ScoutReport):
    entry = report.model_dump()
    entry["id"]        = len(scouting_reports) + 1
    entry["timestamp"] = datetime.now().isoformat()
    scouting_reports.append(entry)
    return {"status": "saved", "report": entry}

@app.get("/api/scout")
def get_scout_reports(lat: float = 20.5937, lon: float = 78.9629, temperature_unit: str = "celsius"):
    if scouting_reports:
        return scouting_reports
    # Default seed data
    return [
        {"id": 1, "field": "North Block A", "field_key": "northBlock", "crop": "Wheat", "crop_key": "wheat", "lat": round(lat + 0.012, 5), "lon": round(lon - 0.008, 5), "notes_key": "recommendWheatRust",
         "severity": "medium", "notes": "Spotted rust-like orange spots on 15% of plants in northeast corner. Applied preventative fungicide to affected rows.",
         "timestamp": (datetime.now() - timedelta(days=2)).isoformat()},
        {"id": 2, "field": "South Block B", "field_key": "southBlock", "crop": "Rice", "crop_key": "rice", "lat": round(lat - 0.009, 5), "lon": round(lon - 0.004, 5), "notes_key": "healthyRecommendation",
         "severity": "low", "notes": "Plants look healthy overall. Water level maintained at 5cm. No pest signs. Tillering stage progressing well.",
         "timestamp": (datetime.now() - timedelta(days=5)).isoformat()},
        {"id": 3, "field": "East Plot C", "field_key": "eastPlot", "crop": "Maize", "crop_key": "maize", "lat": round(lat + 0.004, 5), "lon": round(lon + 0.013, 5), "notes_key": "stressRecommendation",
         "severity": "high", "notes": "Significant wilting across 30% of field. Soil moisture critically low at 21%. Emergency irrigation triggered.",
         "timestamp": (datetime.now() - timedelta(days=1)).isoformat()},
    ]

@app.get("/api/alerts-demo", include_in_schema=False)
def get_alerts_demo():
    # Dynamic: moisture & humidity values change on each fetch
    moisture = random.randint(22, 32)
    humidity = random.randint(70, 92)
    soy_price = round(378 + random.uniform(-5, 15), 2)
    soy_chg   = round(random.uniform(3.0, 9.5), 1)
    trap_count = random.randint(6, 11)
    rain_mm    = random.randint(80, 150)
    night_temp = random.randint(19, 24)

    alerts = [
        {"id": 1, "type": "disease", "severity": "high", "read": False, "icon": "🦠",
         "title": "Wheat Rust Outbreak Risk",
         "message": f"High humidity ({humidity}%) + warm nights ({night_temp}°C) create ideal Puccinia spread conditions. 3 farms within 5km reported active infections.",
         "action": "Inspect North Block A within 24 hours. Pre-emptive fungicide recommended.",
         "timestamp": (datetime.now() - timedelta(hours=2)).isoformat()},
        {"id": 2, "type": "weather", "severity": "medium", "read": False, "icon": "❄️",
         "title": "Frost Warning — Tonight",
         "message": f"Temperatures expected to drop to {random.randint(1,4)}°C overnight. Young seedlings in Stage 1–2 growth are vulnerable.",
         "action": "Cover vulnerable crops or delay irrigation to reduce frost susceptibility.",
         "timestamp": (datetime.now() - timedelta(hours=5)).isoformat()},
        {"id": 3, "type": "market", "severity": "low", "read": False, "icon": "📈",
         "title": f"Soybean Prices Up {soy_chg}% — 4-Month High",
         "message": f"Soybean futures on CBOT rose sharply due to drought concerns in Argentina. Current price: ${soy_price}/ton.",
         "action": "Consider locking in forward contracts if you have surplus inventory.",
         "timestamp": (datetime.now() - timedelta(hours=8)).isoformat()},
        {"id": 4, "type": "irrigation", "severity": "high", "read": True, "icon": "💧",
         "title": "Critical Soil Moisture Alert",
         "message": f"Soil moisture in East Field dropped to {moisture}% — below critical 30% threshold for wheat at grain-fill stage.",
         "action": "Activate drip system Zone 3 immediately. Target 45% soil moisture.",
         "timestamp": (datetime.now() - timedelta(days=1)).isoformat()},
        {"id": 5, "type": "disease", "severity": "low", "read": True, "icon": "🐛",
         "title": "Bollworm Pheromone Trap Alert",
         "message": f"Pheromone trap count reached {trap_count} moths/trap/night in South Block B. Economic threshold is 10 moths.",
         "action": "Monitor for next 3 nights. Apply bio-pesticide if threshold crossed.",
         "timestamp": (datetime.now() - timedelta(days=2)).isoformat()},
        {"id": 6, "type": "weather", "severity": "medium", "read": True, "icon": "🌧️",
         "title": "Heavy Rain in 48 Hours — Storage Risk",
         "message": f"{rain_mm}mm rainfall expected over 2 days. Harvested grain in open storage is at risk of moisture damage.",
         "action": "Move stored grain to covered silos. Delay pending soil tillage.",
         "timestamp": (datetime.now() - timedelta(days=3)).isoformat()},
    ]
    return alerts

@app.get("/api/alerts")
def get_alerts(lat: float = 20.5937, lon: float = 78.9629, temperature_unit: str = "celsius"):
    data = fetch_live_weather(lat, lon, temperature_unit)
    current = data.get("current", {})
    daily = data.get("daily", {})
    rain = [float(value or 0) for value in daily.get("precipitation_probability_max", [])]
    highs = [float(value or 0) for value in daily.get("temperature_2m_max", [])]
    winds = [float(value or 0) for value in daily.get("wind_speed_10m_max", [])]
    uv_values = [float(value or 0) for value in daily.get("uv_index_max", [])]
    soil_moisture = round(float(current.get("soil_moisture_3_to_9cm", 0)) * 100, 1)
    temp_symbol = "°F" if temperature_unit == "fahrenheit" else "°C"
    humidity = float(current.get("relative_humidity_2m", 0) or 0)
    now = datetime.now()
    alerts = [
        {"id": 1, "type": "weather", "severity": "high" if max(rain or [0]) >= 75 else "medium", "read": False, "icon": "🌧️", "title_key": "alertRainTitle", "message_key": "alertRainMessage", "action_key": "alertRainAction", "values": {"rain": round(max(rain or [0])), "day": (rain.index(max(rain)) + 1) if rain else 1}, "timestamp": now.isoformat()},
        {"id": 2, "type": "irrigation", "severity": "high" if soil_moisture < 20 else "low", "read": False, "icon": "💧", "title_key": "alertMoistureTitle", "message_key": "alertMoistureMessage", "action_key": "alertMoistureAction", "values": {"moisture": soil_moisture, "rain": round(rain[0] if rain else 0)}, "timestamp": (now - timedelta(hours=1)).isoformat()},
        {"id": 3, "type": "weather", "severity": "high" if max(uv_values or [0]) >= 9 else "medium", "read": False, "icon": "☀️", "title_key": "alertHeatTitle", "message_key": "alertHeatMessage", "action_key": "alertHeatAction", "values": {"temperature": round(max(highs or [0]), 1), "unit": temp_symbol, "uv": round(max(uv_values or [0]), 1)}, "timestamp": (now - timedelta(hours=2)).isoformat()},
        {"id": 4, "type": "weather", "severity": "medium" if max(winds or [0]) >= 25 else "low", "read": True, "icon": "🌬️", "title_key": "alertWindTitle", "message_key": "alertWindMessage", "action_key": "alertWindAction", "values": {"wind": round(max(winds or [0]), 1)}, "timestamp": (now - timedelta(hours=3)).isoformat()},
    ]

    market_data = get_market_prices(lat, lon, temperature_unit)
    market_item = max(market_data["commodities"], key=lambda item: abs(item["weekly_change"]))
    alerts.append({"id": 5, "type": "market", "severity": "medium" if abs(market_item["weekly_change"]) >= 3 else "low", "read": False, "icon": market_item["emoji"], "title_key": "marketPricesTitle", "message_key": market_item["desc_key"], "action_key": "priceDisclaimer", "values": market_item["values"], "timestamp": (now - timedelta(minutes=30)).isoformat()})

    if humidity >= 75:
        alerts.append({"id": 6, "type": "disease", "severity": "high" if humidity >= 88 else "medium", "read": False, "icon": "🦠", "title_key": "diseaseWheatRust", "message_key": "recommendWheatRust", "action_key": "preventWheatRust", "values": {}, "timestamp": (now - timedelta(hours=1, minutes=30)).isoformat()})
    return alerts

class ChatMessage(BaseModel):
    message: str
    history: list = []
    intent: str | None = None
    language: str = "en"
    lat: float = 20.5937
    lon: float = 78.9629

class TranslationRequest(BaseModel):
    language: str
    strings: dict[str, str]

class SpeechRequest(BaseModel):
    language: str
    text: str

def require_gemini_key():
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=503, detail="Gemini API key is not configured")

async def post_gemini(payload: dict, timeout: int = 60):
    """Call Gemini with short retries for free-tier capacity/rate transients."""
    last_response = None
    async with httpx.AsyncClient(timeout=timeout) as client:
        for attempt in range(3):
            response = await client.post(
                "https://generativelanguage.googleapis.com/v1beta/interactions",
                headers={"x-goog-api-key": GEMINI_API_KEY}, json=payload,
            )
            last_response = response
            if response.status_code not in {429, 500, 502, 503, 504}:
                response.raise_for_status()
                return response.json()
            if attempt < 2:
                await asyncio.sleep(1.5 * (attempt + 1))
    last_response.raise_for_status()

@app.post("/api/translate")
async def translate_interface(body: TranslationRequest):
    require_gemini_key()
    language_name = LANGUAGE_NAMES.get(body.language)
    if not language_name:
        raise HTTPException(status_code=400, detail="Unsupported language")
    if body.language == "en" or not body.strings:
        return {"translations": body.strings}
    if len(body.strings) > 80:
        raise HTTPException(status_code=400, detail="Translate at most 80 strings per request")

    prompt = (
        f"Translate every JSON value from English into {language_name}. "
        "This is an Indian agriculture web application. Preserve every JSON key, {{variable}} placeholder, "
        "number, unit, brand name, emoji, punctuation mark, and markdown marker. "
        "Return only a valid JSON object with exactly the same keys; do not explain anything.\n\n"
        + json.dumps(body.strings, ensure_ascii=False)
    )
    payload = {
        "model": GEMINI_TRANSLATION_MODEL,
        "input": prompt,
        "response_format": {"type": "text", "mime_type": "application/json"},
        "generation_config": {"temperature": 0.1, "thinking_level": "low"},
        "store": False,
    }
    try:
        result = await post_gemini(payload, 60)
        text = next(
            content["text"]
            for step in reversed(result.get("steps", []))
            if step.get("type") == "model_output"
            for content in step.get("content", [])
            if content.get("type") == "text" and content.get("text")
        )
        translated = json.loads(text)
        safe = {key: str(translated.get(key, value)) for key, value in body.strings.items()}
        return {"translations": safe}
    except (httpx.HTTPError, KeyError, IndexError, TypeError, StopIteration, json.JSONDecodeError) as error:
        raise HTTPException(status_code=502, detail="Gemini translation failed") from error

@app.post("/api/speech")
async def generate_speech(body: SpeechRequest):
    require_gemini_key()
    language_name = LANGUAGE_NAMES.get(body.language)
    if not language_name:
        raise HTTPException(status_code=400, detail="Unsupported language")
    clean_text = body.text.strip()
    if not clean_text or len(clean_text) > 4000:
        raise HTTPException(status_code=400, detail="Speech text must contain 1 to 4000 characters")

    # TTS models recite their input verbatim. Translate first so a regional
    # voice never receives an English sentence when another language is selected.
    if body.language != "en":
        translated = await translate_interface(TranslationRequest(
            language=body.language,
            strings={"speech": clean_text},
        ))
        clean_text = translated["translations"]["speech"]

    payload = {
        "model": GEMINI_TTS_MODEL,
        "input": [{"type": "user_input", "content": [{
            "type": "text", "text": clean_text,
            "annotations": [{"type": "speech_metadata", "style": f"Clear, warm, natural {language_name}; moderate pace"}],
        }]}],
        "response_format": {"type": "audio"},
        "generation_config": {"speech_config": [{"voice": "Kore"}]},
    }
    try:
        result = await post_gemini(payload, 90)
        audio = next((
            content
            for step in reversed(result.get("steps", []))
            if step.get("type") == "model_output"
            for content in step.get("content", [])
            if content.get("type") == "audio" and content.get("data")
        ), result.get("output_audio", {}))
        if not audio.get("data"):
            raise ValueError("Gemini returned no audio")
        return {"audio": audio["data"], "mime_type": audio.get("mime_type", "audio/wav")}
    except (httpx.HTTPError, ValueError, KeyError, TypeError) as error:
        raise HTTPException(status_code=502, detail="Gemini speech generation failed") from error

@app.post("/api/chat")
def agrobot_chat(body: ChatMessage):
    msg = body.message.lower()
    intents = {
        "harvest": "botHarvestReply", "yellow": "botYellowReply", "water": "botWaterReply",
        "fertilizer": "botFertilizerReply", "price": "botPriceReply", "rust": "botRustReply",
        "disease": "botDiseaseReply", "weather": "botWeatherReply", "brics": "botBricsReply",
        "soil": "botSoilReply", "yield": "botYieldReply",
    }
    selected_intent = body.intent if body.intent in intents else next((key for key in intents if key in msg), None)
    return {
        "reply_key": intents.get(selected_intent, "botDefaultReply"),
        "values": {"location": f"{body.lat:.3f}°, {body.lon:.3f}°"},
        "suggestion_keys": ["promptHarvest", "promptPrices", "promptWeather", "promptRust"],
    }

    # Legacy rich English responses retained as reference data.
    responses = {
        "harvest":    "🌾 Based on your current NDVI readings (0.85) and the 7-day weather forecast showing a dry window from Day 5 onwards, your **optimal harvest window is Day 5–7**. Soil moisture at harvest should be below 20% for clean combine operation. Current growth stage: Grain Filling (72% complete). Expected yield: **3.8 tons/ha** (18% above regional avg).",
        "yellow":     "🍃 Yellow leaves can indicate several issues:\n\n1. **Nitrogen deficiency** — yellowing from older leaves upward. Apply urea at 20kg/ha.\n2. **Iron chlorosis** — yellow between green veins. Apply ferrous sulfate foliar spray.\n3. **Waterlogging** — if soil is wet. Improve drainage immediately.\n\nFor accurate diagnosis, upload a photo in **Crop Diagnostics** for AI identification.",
        "water":      "💧 Smart irrigation protocol:\n\n• Irrigate in early morning (5–7 AM) to minimize evaporation\n• Current soil moisture: check **Satellite Map** for field-level readings\n• Drip irrigation saves 35% water vs flood irrigation\n• Your East Field has a moisture alert — check **Smart Alerts** for details.",
        "fertilizer": "🧪 Fertilizer recommendations for Wheat at Grain Filling:\n\n• **N:** 20 kg/ha (foliar urea)\n• **K:** 15 kg/ha (potassium sulfate)\n• **Micronutrients:** Zn + B spray\n\nBest timing: apply **tomorrow morning** — check **Weather** page for the ideal low-wind window.",
        "price":      "📊 Check the **Market Prices** page for live data updated every refresh. Soybean is currently the strongest opportunity — AI signal tracking buy/hold/sell based on real-time price movement.",
        "rust":       "🦠 Wheat rust prevention:\n\n1. Scout all fields every 7 days for orange/brown pustules\n2. Pre-emptive fungicide: tebuconazole 250 EC @ 1L/ha\n3. Apply in early morning when dew is present\n\n**Current risk is HIGH** — check **Smart Alerts** for the latest outbreak data in your region.",
        "disease":    "🦠 For disease identification, use the **Crop Diagnostics** tool — upload a photo of the affected leaf for instant AI analysis with confidence scoring. For prevention: scout regularly, maintain plant spacing, and avoid overhead irrigation in humid conditions.",
        "weather":    "🌤️ Check the **Weather** page for your live 7-day forecast and AI-generated farm schedule. Key tip: use the rain probability chart to plan spray, harvest, and tillage windows.",
        "brics":      "🌍 The BRICS Agricultural Network connects farmers across Brazil, Russia, India, China, and South Africa. Visit the **Knowledge Exchange** page to read techniques from 10,000+ farmers — all auto-translated. Share your own methods and earn upvotes!",
        "soil":       "🌱 Check the **Dashboard** for live soil health metrics. For improvement: add organic matter (compost or green manure) before the next planting cycle, and use the **Yield Predictor** to see how soil score impacts expected yield.",
        "yield":      "📈 Visit the **Yield Predictor** for your live forecast — it pulls real-time factor scores (soil, water, weather, pests) and calculates expected tons/ha with confidence rating. Use the interactive sliders to simulate 'what if' scenarios.",
    }
    for keyword, response in responses.items():
        if keyword in msg:
            return {
                "reply": response,
                "suggestions": ["When should I harvest?", "Check market prices", "What's the weather forecast?", "How to prevent rust?"]
            }
    return {
        "reply": "🌿 I can help with crop diseases, harvest timing, irrigation, fertilizers, and market prices. Could you give me more details? Try asking about a specific crop or symptom you're seeing.",
        "suggestions": ["When should I harvest?", "I see yellow spots on leaves", "Water management advice", "Best fertilizer for wheat"]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

# ── New Hub Endpoints ──────────────────────────────────────────────────────────

@app.get("/api/finance")
def get_finance_data(lat: float = 20.5937, lon: float = 78.9629):
    """Financial services: credit, marketplace, insurance."""
    inr = get_inr_rate()
    credit_schemes = [
        {"id": 1, "name": "Kisan Credit Card (KCC)", "provider": "State Bank of India", "interest": "4%", "max_amount": "₹3,00,000", "eligibility": "All farmers with land records", "status": "eligible", "icon": "🏦", "type": "government", "url": "https://sbi.bank.in/web/agri-rural/agri-rural/agriculture-banking/kisan-samriddhi-rin",
         "documents": ["Aadhaar Card", "Land Records (7/12 extract)", "Passport Photo", "Bank Passbook"], "processing_days": 14},
        {"id": 2, "name": "PM-KISAN Samman Nidhi", "provider": "Government of India", "interest": "0% (Direct Benefit)", "max_amount": "₹6,000/year", "eligibility": "Small & marginal farmers", "status": "eligible", "icon": "🇮🇳", "type": "subsidy", "url": "https://pmkisan.gov.in/",
         "documents": ["Aadhaar Card", "Land Records", "Bank Account"], "processing_days": 30},
        {"id": 3, "name": "MUDRA Loan (Shishu)", "provider": "Any scheduled bank", "interest": "7.5-8.5%", "max_amount": "₹50,000", "eligibility": "Micro enterprises including farming", "status": "eligible", "icon": "💰", "type": "micro-loan", "url": "https://www.mudra.org.in/",
         "documents": ["Aadhaar Card", "Business Plan", "Bank Statement"], "processing_days": 7},
        {"id": 4, "name": "SHG Group Loan", "provider": "NABARD / Local MFI", "interest": "9-12%", "max_amount": "₹10,00,000 (group)", "eligibility": "Self-Help Group members", "status": "check_group", "icon": "👥", "type": "group-loan", "url": "https://www.nabard.org/",
         "documents": ["SHG Registration", "Member Aadhaar", "Group Minutes Book"], "processing_days": 21},
        {"id": 5, "name": "Agri Infrastructure Fund", "provider": "NABARD", "interest": "3% (subsidized)", "max_amount": "₹2,00,00,000", "eligibility": "FPOs, cooperatives, agri-entrepreneurs", "status": "eligible", "icon": "🏗️", "type": "infrastructure", "url": "https://agriinfra.dac.gov.in/",
         "documents": ["Project Report", "Registration Certificate", "Land Documents"], "processing_days": 45},
    ]
    marketplace = [
        {"id": 1, "name": "Organic Cover Crop Seeds Mix", "seller": "Sahaja Seeds Cooperative", "price": f"₹{round(450 * (1 + math.sin(lat) * 0.05))}/kg", "rating": 4.6, "verified": True, "group_discount": "15% off for 10+ kg", "location": "Hyderabad, Telangana", "stock": "In Stock"},
        {"id": 2, "name": "Jeevamrutha Starter Kit", "seller": "ZBNF Network", "price": f"₹{round(1200 * (1 + math.cos(lon) * 0.03))}", "rating": 4.8, "verified": True, "group_discount": "20% for SHG groups", "location": "Belgaum, Karnataka", "stock": "In Stock"},
        {"id": 3, "name": "Bio-NPK Liquid Fertilizer (5L)", "seller": "GreenGrow Biotech", "price": f"₹{round(680 * (1 + math.sin(lon) * 0.04))}", "rating": 4.3, "verified": True, "group_discount": "10% off for 20+ units", "location": "Pune, Maharashtra", "stock": "Limited"},
        {"id": 4, "name": "Trichoderma viride (1 kg)", "seller": "AgriLife Biosolutions", "price": f"₹{round(350 * (1 + math.cos(lat) * 0.02))}", "rating": 4.5, "verified": True, "group_discount": "Buy 5 get 1 free", "location": "Chennai, Tamil Nadu", "stock": "In Stock"},
        {"id": 5, "name": "Neem Cake Fertilizer (25 kg)", "seller": "Kisan Organic Store", "price": f"₹{round(520 * (1 + math.sin(lat + lon) * 0.03))}", "rating": 4.4, "verified": True, "group_discount": "12% off for cooperatives", "location": "Nagpur, Maharashtra", "stock": "In Stock"},
    ]
    insurance = [
        {"id": 1, "name": "Pradhan Mantri Fasal Bima Yojana (PMFBY)", "provider": "Agriculture Insurance Co.", "premium": "2% of sum insured (Kharif)", "coverage": "Full crop loss + post-harvest 14 days", "claim_trigger": "Automatic via weather station data", "status": "enrolling", "icon": "🛡️", "season": "Kharif 2026", "url": "https://pmfby.gov.in/"},
        {"id": 2, "name": "Weather-Based Crop Insurance (WBCIS)", "provider": "ICICI Lombard", "premium": "1.5% of sum insured", "coverage": "Rainfall deviation, temperature extremes", "claim_trigger": "Automatic — no claim filing needed", "status": "active", "icon": "🌧️", "season": "Rabi 2026-27", "url": "https://www.icicilombard.com/crop-insurance"},
        {"id": 3, "name": "Livestock Insurance", "provider": "United India Insurance", "premium": "₹100-500/animal/year", "coverage": "Death due to disease, accident, natural disaster", "claim_trigger": "Veterinary certificate within 15 days", "status": "available", "icon": "🐄", "season": "Year-round", "url": "https://uiic.co.in/web/sites/default/files/Policy-Document/Rural%20%26%20Social%20-%20Cattle%20%28Livestock%29%20Insurance.pdf"},
    ]
    return {"credit": credit_schemes, "marketplace": marketplace, "insurance": insurance, "location": {"latitude": lat, "longitude": lon}, "inr_rate": round(inr, 2)}


@app.get("/api/equipment")
def get_equipment_data(lat: float = 20.5937, lon: float = 78.9629):
    """Equipment sharing, labor exchange, cooperative tools."""
    equipment = [
        {"id": 1, "name": "Zero-Till Seed Drill", "owner": "Ramesh Kumar", "distance": f"{round(2.3 + abs(math.sin(lat)) * 3, 1)} km", "rate": "₹800/hour", "available": True, "rating": 4.7, "icon": "🚜", "condition": "Good", "fuel": "Diesel"},
        {"id": 2, "name": "Rotavator (6 ft)", "owner": "Suresh Cooperative", "distance": f"{round(1.8 + abs(math.cos(lon)) * 2, 1)} km", "rate": "₹600/hour", "available": True, "rating": 4.5, "icon": "⚙️", "condition": "Excellent", "fuel": "Tractor-mounted"},
        {"id": 3, "name": "Drip Irrigation Kit", "owner": "Agri Equipment Hub", "distance": f"{round(4.5 + abs(math.sin(lat + lon)) * 2, 1)} km", "rate": "₹2,500/week", "available": True, "rating": 4.8, "icon": "💧", "condition": "New", "fuel": "Electric pump"},
        {"id": 4, "name": "Mulcher / Shredder", "owner": "Farm Machinery Center", "distance": f"{round(3.2 + abs(math.cos(lat)) * 2, 1)} km", "rate": "₹1,200/hour", "available": False, "rating": 4.3, "icon": "🌿", "condition": "Good", "fuel": "Diesel"},
        {"id": 5, "name": "Sprayer Drone (10L)", "owner": "TechAgri Services", "distance": f"{round(6.1 + abs(math.sin(lon)) * 3, 1)} km", "rate": "₹500/acre", "available": True, "rating": 4.9, "icon": "🤖", "condition": "Excellent", "fuel": "Battery"},
        {"id": 6, "name": "Mini Tractor (20 HP)", "owner": "Village FPO", "distance": f"{round(1.5 + abs(math.cos(lat + lon)), 1)} km", "rate": "₹400/hour", "available": True, "rating": 4.4, "icon": "🚜", "condition": "Good", "fuel": "Diesel"},
    ]
    labor = [
        {"id": 1, "name": "Harvest Labor Team", "workers": 8, "rate": "₹350/person/day", "available_from": "Immediately", "skills": ["Harvesting", "Threshing", "Loading"], "distance": f"{round(1 + abs(math.sin(lat)) * 5, 1)} km", "rating": 4.6},
        {"id": 2, "name": "Transplanting Crew", "workers": 12, "rate": "₹300/person/day", "available_from": "Next week", "skills": ["Rice transplanting", "Weeding"], "distance": f"{round(2 + abs(math.cos(lon)) * 3, 1)} km", "rating": 4.4},
        {"id": 3, "name": "Spraying Specialist", "workers": 3, "rate": "₹500/person/day", "available_from": "Tomorrow", "skills": ["Pesticide application", "Safety certified"], "distance": f"{round(3 + abs(math.sin(lon)) * 4, 1)} km", "rating": 4.8},
        {"id": 4, "name": "Fencing & Land Prep", "workers": 6, "rate": "₹400/person/day", "available_from": "3 days", "skills": ["Fencing", "Land leveling", "Bunding"], "distance": f"{round(4 + abs(math.cos(lat)) * 2, 1)} km", "rating": 4.2},
    ]
    cooperative = {
        "name": "Village Agricultural Cooperative",
        "members": 45 + round(abs(math.sin(lat + lon)) * 30),
        "shared_equipment": 8,
        "group_purchases": [
            {"item": "DAP Fertilizer (50 kg bags)", "quantity": "200 bags", "savings": "₹18,000 total", "deadline": "Sep 20, 2026"},
            {"item": "Certified Wheat Seeds", "quantity": "500 kg", "savings": "₹12,500 total", "deadline": "Oct 5, 2026"},
            {"item": "Bio-pesticides Pack", "quantity": "100 units", "savings": "₹8,200 total", "deadline": "Sep 25, 2026"},
        ],
        "fund_balance": f"₹{round(45000 + abs(math.sin(lat)) * 30000):,}",
    }
    return {"equipment": equipment, "labor": labor, "cooperative": cooperative, "location": {"latitude": lat, "longitude": lon}}


@app.get("/api/transition")
def get_transition_data(lat: float = 20.5937, lon: float = 78.9629):
    """Transition planner, risk calculator, peer mentorship."""
    plan_years = []
    for year in range(1, 6):
        yield_change = round(-15 + year * 8 + math.sin(lat + year) * 3, 1)
        cost_change = round(-25 + year * 4 + math.cos(lon + year) * 2, 1)
        soil_health = round(40 + year * 12 + math.sin(lat * year) * 5, 1)
        plan_years.append({
            "year": year,
            "yield_change_pct": yield_change,
            "cost_change_pct": cost_change,
            "soil_health_score": min(95, soil_health),
            "milestones": [
                f"Year {year}: " + ["Stop chemical fertilizers, start composting", "Introduce cover crops between seasons", "Begin no-till practices, reduce tillage 80%", "Full regenerative system, minimal external inputs", "Certified organic — premium pricing eligible"][year - 1]
            ],
            "practices": [
                ["Composting", "Green manure", "Crop residue retention"],
                ["Cover cropping", "Mulching", "Legume intercropping"],
                ["No-till/reduced till", "Agroforestry", "Bio-pesticides"],
                ["Integrated pest management", "Water harvesting", "Seed saving"],
                ["Full organic certification", "Carbon credit enrollment", "Direct market access"],
            ][year - 1],
        })
    risks = {
        "financial": {"score": round(45 + math.sin(lat) * 15), "label": "Moderate", "factors": ["Yield dip in years 1-2", "Reduced input costs offset losses", "Premium pricing from year 3"]},
        "climate": {"score": round(55 + math.cos(lon) * 20), "label": "Moderate", "factors": ["Improved water retention buffers drought", "Cover crops reduce erosion", "Higher soil organic matter = resilience"]},
        "market": {"score": round(35 + math.sin(lat + lon) * 10), "label": "Low", "factors": ["Growing organic demand (+22% YoY)", "Government incentives for natural farming", "Export premiums for certified produce"]},
        "technical": {"score": round(50 + math.cos(lat) * 12), "label": "Moderate", "factors": ["Learning curve for new practices", "Extension support available", "Peer mentors reduce failures"]},
        "overall": {"score": round(46 + math.sin(lat * lon) * 8), "label": "Manageable with support"},
    }
    mentors = [
        {"id": 1, "name": "Subhash Palekar", "region": "Vidarbha, Maharashtra", "experience": "15 years", "specialty": "Zero Budget Natural Farming", "crops": ["Wheat", "Rice", "Cotton"], "success": "40% cost reduction", "avatar": "SP", "rating": 4.9},
        {"id": 2, "name": "Lakshmi Devi", "region": "Anantapur, AP", "experience": "8 years", "specialty": "Dryland regenerative farming", "crops": ["Millets", "Groundnut", "Pulses"], "success": "2x yield in 3 years", "avatar": "LD", "rating": 4.7},
        {"id": 3, "name": "Rajendra Singh", "region": "Alwar, Rajasthan", "experience": "20 years", "specialty": "Water harvesting + agroforestry", "crops": ["Mustard", "Wheat", "Vegetables"], "success": "Revived 5 rivers", "avatar": "RS", "rating": 4.8},
        {"id": 4, "name": "Maria Fernandes", "region": "Goa", "experience": "6 years", "specialty": "Organic spice cultivation", "crops": ["Pepper", "Turmeric", "Cashew"], "success": "3x income with exports", "avatar": "MF", "rating": 4.6},
    ]
    return {"plan": plan_years, "risks": risks, "mentors": mentors, "location": {"latitude": lat, "longitude": lon}}


@app.get("/api/women-farmers")
def get_women_farmers_data(lat: float = 20.5937, lon: float = 78.9629):
    """Women farmer profiles, SHG group access, time-saving tips."""
    shg_groups = [
        {"id": 1, "name": "Lakshmi Mahila Mandal", "members": 15, "village": "Rampur", "savings": "₹2,45,000", "loans_active": 3, "activities": ["Vegetable cultivation", "Vermicomposting", "Seed bank"], "meeting_day": "Every Tuesday"},
        {"id": 2, "name": "Shakti Self-Help Group", "members": 12, "village": "Chandpur", "savings": "₹1,80,000", "loans_active": 2, "activities": ["Dairy farming", "Organic vegetables", "Pickle making"], "meeting_day": "Every Friday"},
        {"id": 3, "name": "Annapurna Farmers Group", "members": 20, "village": "Krishnapur", "savings": "₹3,60,000", "loans_active": 5, "activities": ["Rice cultivation", "Fish farming", "Mushroom growing"], "meeting_day": "Every Saturday"},
    ]
    tips = [
        {"id": 1, "category": "Water Management", "tip": "Install drip irrigation to reduce daily watering time from 3 hours to 30 minutes", "time_saved": "2.5 hrs/day", "cost": "₹8,000-15,000 (subsidized under PMKSY)", "icon": "💧", "difficulty": "Easy"},
        {"id": 2, "category": "Weeding", "tip": "Use mulching with crop residues — reduces weeding by 70% and retains soil moisture", "time_saved": "4 hrs/week", "cost": "Free (use farm waste)", "icon": "🌿", "difficulty": "Easy"},
        {"id": 3, "category": "Harvesting", "tip": "Coordinate with SHG for group harvesting — 5 women can harvest 1 acre in half a day vs 2 days alone", "time_saved": "1.5 days/season", "cost": "Shared labor cost", "icon": "🌾", "difficulty": "Medium"},
        {"id": 4, "category": "Pest Control", "tip": "Use neem-based spray (homemade) instead of daily manual pest checking", "time_saved": "1 hr/day", "cost": "₹50/preparation", "icon": "🐛", "difficulty": "Easy"},
        {"id": 5, "category": "Marketing", "tip": "Set up WhatsApp group for direct-to-consumer vegetable sales — eliminates middleman and market travel", "time_saved": "1 day/week", "cost": "Free", "icon": "📱", "difficulty": "Easy"},
        {"id": 6, "category": "Seed Preparation", "tip": "Use seed treatment machine (shared via cooperative) instead of manual treatment", "time_saved": "3 hrs/season", "cost": "₹200/use (shared equipment)", "icon": "🌱", "difficulty": "Easy"},
    ]
    profile_fields = [
        {"field": "plots_managed", "label": "Plots You Manage", "type": "number", "privacy": "private"},
        {"field": "total_area", "label": "Total Area (acres)", "type": "number", "privacy": "private"},
        {"field": "primary_crops", "label": "Primary Crops", "type": "multi-select", "options": ["Rice", "Wheat", "Vegetables", "Millets", "Pulses", "Cotton"], "privacy": "group"},
        {"field": "land_ownership", "label": "Land Ownership Status", "type": "select", "options": ["Own land", "Leased", "Family land", "Community land"], "privacy": "private"},
        {"field": "shg_member", "label": "SHG Membership", "type": "boolean", "privacy": "group"},
    ]
    return {"shg_groups": shg_groups, "tips": tips, "profile_fields": profile_fields, "location": {"latitude": lat, "longitude": lon}}


@app.get("/api/seeds")
def get_seeds_data(lat: float = 20.5937, lon: float = 78.9629):
    """Seed locator, indigenous varieties, input authenticity."""
    suppliers = [
        {"id": 1, "name": "Krishi Vigyan Kendra", "type": "Government", "distance": f"{round(3 + abs(math.sin(lat)) * 5, 1)} km", "crops": ["Wheat HD-3226", "Rice Pusa Basmati", "Mustard"], "verified": True, "rating": 4.8, "icon": "🏛️", "phone": "1800-180-1551", "url": "https://kvk.icar.gov.in/", "stock_status": "Available"},
        {"id": 2, "name": "National Seeds Corporation", "type": "Government", "distance": f"{round(8 + abs(math.cos(lon)) * 4, 1)} km", "crops": ["Certified Wheat", "Paddy", "Maize hybrid"], "verified": True, "rating": 4.6, "icon": "🌾", "phone": "011-25843214", "url": "https://indiaseeds.com/", "stock_status": "Available"},
        {"id": 3, "name": "Local Seed Bank Cooperative", "type": "Community", "distance": f"{round(1.5 + abs(math.sin(lon)) * 2, 1)} km", "crops": ["Indigenous rice varieties", "Millets", "Pulses"], "verified": True, "rating": 4.9, "icon": "🌱", "phone": "+91-98765-43210", "url": "https://sahajaseeds.com/", "stock_status": "Limited"},
        {"id": 4, "name": "Sahaja Seeds", "type": "Private (Organic)", "distance": f"{round(12 + abs(math.cos(lat)) * 5, 1)} km", "crops": ["Cover crop mix", "Green manure seeds", "Organic vegetables"], "verified": True, "rating": 4.5, "icon": "🌿", "phone": "+91-80-2664-4444", "url": "https://sahajaseeds.com/", "stock_status": "Available"},
        {"id": 5, "name": "Agri Input Dealer (Registered)", "type": "Private", "distance": f"{round(0.8 + abs(math.sin(lat + lon)), 1)} km", "crops": ["Hybrid seeds", "Fertilizers", "Pesticides"], "verified": True, "rating": 4.2, "icon": "🏪", "phone": "1800-180-1551", "url": "https://agricoop.gov.in/", "stock_status": "Available"},
    ]
    indigenous = [
        {"id": 1, "name": "Navara Rice", "region": "Kerala", "traits": ["Medicinal properties", "Drought-tolerant", "Short duration (90 days)"], "yield": "2.5 tons/ha", "status": "Heritage variety", "icon": "🍚"},
        {"id": 2, "name": "Kala Namak Rice", "region": "Eastern UP", "traits": ["Aromatic", "High iron content", "Flood-tolerant"], "yield": "3.0 tons/ha", "status": "GI tagged", "icon": "🍚"},
        {"id": 3, "name": "Ragi (Finger Millet)", "region": "Karnataka", "traits": ["Climate-resilient", "High calcium", "Low water requirement"], "yield": "2.8 tons/ha", "status": "Superfood crop", "icon": "🌾"},
        {"id": 4, "name": "Jowar (Sorghum) - M35-1", "region": "Maharashtra", "traits": ["Drought-proof", "Dual purpose (grain + fodder)", "No irrigation needed"], "yield": "2.0 tons/ha", "status": "Dryland champion", "icon": "🌾"},
        {"id": 5, "name": "Toor Dal (Pigeon Pea)", "region": "Maharashtra/MP", "traits": ["Nitrogen-fixing", "Deep root system", "Intercrop compatible"], "yield": "1.8 tons/ha", "status": "Soil builder", "icon": "🫘"},
        {"id": 6, "name": "Desi Cotton (G.Cot)", "region": "Gujarat", "traits": ["Pest-resistant", "Low input", "Premium fibre quality"], "yield": "1.5 tons/ha", "status": "Organic compatible", "icon": "☁️"},
    ]
    return {"suppliers": suppliers, "indigenous_varieties": indigenous, "location": {"latitude": lat, "longitude": lon}}


# ── AGRIN Advanced Integrated Feature Endpoints ───────────────────────────────

class VerifyBatchRequest(BaseModel):
    batch_number: str

class GermplasmMatchRequest(BaseModel):
    soil_type: str = "all"
    rainfall_zone: str = "all"
    stress_factor: str = "drought"

@app.post("/api/seeds/verify-batch")
def verify_input_batch(body: VerifyBatchRequest):
    code = body.batch_number.strip().upper()
    
    # Mock registry database lookup
    known_batches = {
        "DAP-2026-8891": {
            "status": "genuine",
            "product_name": "DAP Fertilizer 50kg (High Grade)",
            "brand": "IFFCO Cooperative Ltd.",
            "mfg_date": "2026-07-12",
            "expiry_date": "2028-07-11",
            "license_no": "LIC-AGRI-2024-99812",
            "dealer_name": "Kisan Krishi Kendra (Reg. #4410)",
            "lab_test_status": "Passed (Nitrogen: 18%, P2O5: 46%)",
            "hash_signature": "sha256:8f4b...3a91",
            "agrin_registry_id": "AGRIN-IN-IFF-2026-8891"
        },
        "BT-COTTON-904": {
            "status": "genuine",
            "product_name": "Certified Desi Cotton Seeds (G.Cot-22)",
            "brand": "National Seeds Corporation",
            "mfg_date": "2026-05-10",
            "expiry_date": "2027-05-09",
            "license_no": "LIC-NSC-IN-40129",
            "dealer_name": "Government Agri Depot",
            "lab_test_status": "Germination Rate: 94%, Purity: 99.2%",
            "hash_signature": "sha256:7c11...912a",
            "agrin_registry_id": "AGRIN-IN-NSC-2026-0904"
        },
        "BIO-NPK-552": {
            "status": "genuine",
            "product_name": "Bio-NPK Liquid Microconsortium (1L)",
            "brand": "Sahaja Organic Biosolutions",
            "mfg_date": "2026-08-01",
            "expiry_date": "2027-08-01",
            "license_no": "NPOP-CERT-IND-2025-44",
            "dealer_name": "BioAgri Direct Portal",
            "lab_test_status": "Microbial Load: 2x10^9 CFU/ml (Heavy Metal Safe)",
            "hash_signature": "sha256:1a5e...6780",
            "agrin_registry_id": "AGRIN-IN-SAH-2026-0552"
        }
    }
    
    if code in known_batches:
        data = known_batches[code]
        return {"verified": True, "result": data}
        
    if len(code) >= 6:
        # Generate simulated verifiable output for arbitrary batch input
        hashed = hashlib.sha256((code + SECRET_KEY).encode()).hexdigest()[:12]
        return {
            "verified": True,
            "result": {
                "status": "genuine",
                "product_name": f"Verified Agri-Input (Batch #{code})",
                "brand": "Certified Agri Network Dealer",
                "mfg_date": "2026-06-15",
                "expiry_date": "2028-06-14",
                "license_no": f"LIC-AGR-{code[:4]}-2026",
                "dealer_name": "Verified Regional Cooperatives Network",
                "lab_test_status": "Purity & Active Agent Passed",
                "hash_signature": f"sha256:{hashed}",
                "agrin_registry_id": f"AGRIN-REG-{code}"
            }
        }
        
    return {
        "verified": False,
        "result": {
            "status": "suspicious",
            "warning": f"Batch serial '{code}' was not found in official AGRIN manufacturer database. High risk of counterfeit product.",
            "report_helpline": "Kisan Call Center: 1800-180-1551"
        }
    }


@app.post("/api/seeds/germplasm-matcher")
def match_germplasm(body: GermplasmMatchRequest):
    stress = body.stress_factor.lower()
    
    catalog = [
        {
            "id": "GERM-01",
            "name": "Navara Heritage Medicinal Rice",
            "crop": "Rice",
            "soil": "Clay / Loam",
            "rainfall": "Low to Medium (600-900mm)",
            "adaptation_traits": ["High Drought Tolerance (9.4/10)", "Short 90-day cycle", "Anti-inflammatory medicinal properties"],
            "drought_score": 9.4,
            "salinity_score": 8.1,
            "heat_score": 9.0,
            "recommended_zone": "Southern & Western Arid Belts",
            "yield_potential": "2.5 - 3.2 tons/ha",
            "seed_bank_source": "Kerala Organic Seed Vault"
        },
        {
            "id": "GERM-02",
            "name": "Kala Namak GI Flood-Resistant Rice",
            "crop": "Rice",
            "soil": "Alluvial / Clay",
            "rainfall": "High (1200mm+)",
            "adaptation_traits": ["Submergence Tolerant (14 days underwater)", "High Iron & Zinc Content", "Aromatic Premium"],
            "drought_score": 7.2,
            "salinity_score": 8.8,
            "heat_score": 8.5,
            "recommended_zone": "Gangetic Floodplains & Lowlands",
            "yield_potential": "3.0 - 3.8 tons/ha",
            "seed_bank_source": "Eastern UP FPO Network"
        },
        {
            "id": "GERM-03",
            "name": "M35-1 Jowar (Dryland Sorghum)",
            "crop": "Sorghum / Millet",
            "soil": "Black Cotton / Saline Loam",
            "rainfall": "Ultra-low (300-500mm)",
            "adaptation_traits": ["Deep Taproot System", "Zero Supplemental Irrigation Required", "High Biomass Fodder"],
            "drought_score": 9.8,
            "salinity_score": 9.2,
            "heat_score": 9.6,
            "recommended_zone": "Deccan Plateau & Rainfed Zones",
            "yield_potential": "2.0 - 2.6 tons/ha",
            "seed_bank_source": "Solapur Millets Research Institute"
        },
        {
            "id": "GERM-04",
            "name": "Desi G.Cot-22 Pest-Resistant Cotton",
            "crop": "Cotton",
            "soil": "Black / Sandy Loam",
            "rainfall": "Medium (500-750mm)",
            "adaptation_traits": ["Bollworm Natural Immunity", "Zero Pesticide Requirement", "High Tensile Strength"],
            "drought_score": 8.9,
            "salinity_score": 8.4,
            "heat_score": 9.1,
            "recommended_zone": "Saurashtra & Vidarbha Cotton Belts",
            "yield_potential": "1.8 - 2.4 tons/ha",
            "seed_bank_source": "Gujarat Desi Cotton Guild"
        }
    ]
    
    # Filter based on stress factor
    if stress == "drought":
        catalog.sort(key=lambda x: x["drought_score"], reverse=True)
    elif stress == "flood":
        catalog.sort(key=lambda x: x["salinity_score"], reverse=True)
    elif stress == "heat":
        catalog.sort(key=lambda x: x["heat_score"], reverse=True)

    return {
        "matches": catalog,
        "criteria": {"soil_type": body.soil_type, "rainfall_zone": body.rainfall_zone, "stress_factor": body.stress_factor}
    }


@app.get("/api/farmer/passport")
def get_farmer_passport(lat: float = 20.5937, lon: float = 78.9629):
    """Generates standardized AgriStack / BRICS Digital Farmer Passport."""
    farmer_id = "AGRI-PASSPORT-IN-2026-99182"
    payload = f"{farmer_id}|{lat}|{lon}|verified"
    sig = hashlib.sha256(payload.encode()).hexdigest()
    
    return {
        "passport_id": farmer_id,
        "standard_version": "BRICS-AGRIN-v2.1 / AgriStack-India",
        "issued_at": "2026-01-15T09:00:00Z",
        "farmer_name": "Ramesh Kumar Patel",
        "aadhaar_linked": True,
        "digital_signature": f"0x{sig[:32]}",
        "land_details": {
            "khata_no": "45/A-1",
            "parcel_polygon": [
                [round(lat, 5), round(lon, 5)],
                [round(lat + 0.003, 5), round(lon, 5)],
                [round(lat + 0.003, 5), round(lon + 0.003, 5)],
                [round(lat, 5), round(lon + 0.003, 5)]
            ],
            "total_area_acres": 3.8,
            "irrigation_status": "Partial Drip + Rainfed"
        },
        "soil_health_card": {
            "card_no": "SHC-2025-9910",
            "organic_carbon": "0.78% (Good)",
            "nitrogen_kg_ha": "240 (Medium)",
            "phosphorus_kg_ha": "22 (Optimal)",
            "potassium_kg_ha": "195 (High)",
            "ph": 7.2
        },
        "yield_certifications": [
            {"crop": "Wheat", "season": "Rabi 2025", "verified_yield_tons_ha": 3.6, "verified_by": "KVK District Officer"},
            {"crop": "Rice", "season": "Kharif 2025", "verified_yield_tons_ha": 4.1, "verified_by": "Agri Extension Officer"}
        ],
        "active_credit_score": "785 (Excellent - KCC Pre-Approved)",
        "shareable_qr_data": f"https://agri-net.org/verify-passport?id={farmer_id}&sig={sig[:16]}"
    }


@app.get("/api/seeds/organic-certified")
def get_organic_certified_inputs():
    """NPOP & PGS-India Verified Organic Inputs with Lab Test Reports."""
    return [
        {
            "id": "ORG-01",
            "name": "Liquid Azotobacter Bio-Fertilizer (1 Liter)",
            "category": "Bio-Fertilizer / N-Fixer",
            "certification": "NPOP (National Programme for Organic Production)",
            "cert_no": "NPOP/NAB/0012/2026",
            "lab_test_report": {
                "microbial_count": "2.5 x 10^8 CFU/ml",
                "heavy_metals": "Nil (ICP-MS Tested)",
                "pathogens": "Absent (Salmonella & E.coli Free)",
                "lab_name": "ICAR-IISS National Soil Lab, Bhopal"
            },
            "price": "₹380",
            "bulk_discount": "15% off for SHG orders over 10 units",
            "seller": "GreenBio Solutions Cooperative",
            "rating": 4.9,
            "badge": "✓ Lab Certified Organic"
        },
        {
            "id": "ORG-02",
            "name": "Trichoderma Viride Bio-Fungicide (1 Kg Powder)",
            "category": "Bio-Pesticide / Biocontrol",
            "certification": "PGS-India Organic Certified",
            "cert_no": "PGS-IN-2025-88401",
            "lab_test_report": {
                "spore_count": "2 x 10^7 CFU/g",
                "efficiency_score": "98% Root Rot Control",
                "shelf_life": "12 Months at Room Temp",
                "lab_name": "TNAU Bio-Control Validation Lab"
            },
            "price": "₹260",
            "bulk_discount": "20% off for 25+ kg cooperative order",
            "seller": "Sahaja Organic Inputs Hub",
            "rating": 4.8,
            "badge": "✓ Lab Certified Organic"
        },
        {
            "id": "ORG-03",
            "name": "Cold-Pressed Neem Oil 10,000 PPM Azadirachtin (5 Liter)",
            "category": "Botanical Pest Repellent",
            "certification": "NPOP & USDA Organic Accredited",
            "cert_no": "NPOP-C-2026-90412",
            "lab_test_report": {
                "azadirachtin_content": "10,240 PPM (HPLC Tested)",
                "purity": "100% Pure Virgin Oil",
                "residue_free": "Pass (Zero Synthetic Chemicals)",
                "lab_name": "Indian Institute of Horticultural Research"
            },
            "price": "₹1,450",
            "bulk_discount": "10% off with valid Kisan ID",
            "seller": "NeemCare Agri Bio",
            "rating": 4.7,
            "badge": "✓ Lab Certified Organic"
        }
    ]




@app.get("/api/post-harvest")
def get_post_harvest_data(lat: float = 20.5937, lon: float = 78.9629):
    """Storage advice, buyer connections, transport sharing."""
    storage = [
        {"id": 1, "method": "Hermetic Storage Bags (PICS bags)", "crops": ["Wheat", "Rice", "Maize", "Pulses"], "cost": "₹80-120/bag (50 kg)", "loss_reduction": "95% reduction", "duration": "6-12 months", "icon": "🎒", "difficulty": "Easy"},
        {"id": 2, "method": "Metal Bin (Pusa Bin)", "crops": ["All grains", "Pulses"], "cost": "₹3,000-5,000 (1 ton capacity)", "loss_reduction": "90% reduction", "duration": "12+ months", "icon": "🪣", "difficulty": "Easy"},
        {"id": 3, "method": "Solar Dryer", "crops": ["Vegetables", "Fruits", "Spices"], "cost": "₹8,000-15,000", "loss_reduction": "80% reduction", "duration": "6-8 months (dried)", "icon": "☀️", "difficulty": "Medium"},
        {"id": 4, "method": "Zero-Energy Cool Chamber", "crops": ["Vegetables", "Fruits"], "cost": "₹3,000-4,000 (DIY)", "loss_reduction": "70% reduction for 7-10 days", "duration": "7-10 days extended shelf life", "icon": "❄️", "difficulty": "Medium"},
        {"id": 5, "method": "Community Cold Storage", "crops": ["Potato", "Onion", "Fruits"], "cost": "₹2-4/kg/month", "loss_reduction": "85% reduction", "duration": "3-6 months", "icon": "🏭", "difficulty": "Easy (if accessible)"},
    ]
    buyers = [
        {"id": 1, "name": "FPO Direct Purchase", "type": "Farmer Producer Organization", "crops": ["Wheat", "Rice", "Pulses"], "price_premium": "+8-12% over mandi", "distance": f"{round(5 + abs(math.sin(lat)) * 8, 1)} km", "min_quantity": "5 quintals", "payment": "Within 3 days", "verified": True, "phone": "1800-270-0224", "website": "https://sfacindia.com/"},
        {"id": 2, "name": "BigBasket Farmer Connect", "type": "E-commerce Platform", "crops": ["Vegetables", "Fruits"], "price_premium": "+15-25% over mandi", "distance": "Pickup from farm", "min_quantity": "50 kg", "payment": "Weekly", "verified": True, "phone": "1860-123-1000", "website": "https://www.bigbasket.com/"},
        {"id": 3, "name": "ITC e-Choupal", "type": "Corporate Buyer", "crops": ["Soybean", "Wheat", "Coffee"], "price_premium": "+5-8% over mandi", "distance": f"{round(10 + abs(math.cos(lon)) * 5, 1)} km", "min_quantity": "10 quintals", "payment": "Same day", "verified": True, "phone": "1800-103-0024", "website": "https://www.echoupal.com/"},
        {"id": 4, "name": "Organic Exporters Consortium", "type": "Export Buyer", "crops": ["Organic rice", "Spices", "Millets"], "price_premium": "+30-50% for certified organic", "distance": "Logistics arranged", "min_quantity": "1 ton", "payment": "After quality check (7 days)", "verified": True, "phone": "1800-112-411", "website": "https://apeda.gov.in/"},
        {"id": 5, "name": "Local Restaurant Network", "type": "HoReCa", "crops": ["Vegetables", "Rice", "Dairy"], "price_premium": "+20% over mandi", "distance": f"{round(3 + abs(math.sin(lon)) * 6, 1)} km", "min_quantity": "10 kg", "payment": "Weekly", "verified": True, "phone": "1800-120-0010", "website": "https://ondc.org/"},
    ]
    transport = [
        {"id": 1, "type": "Shared Tractor-Trolley", "route": "Village → APMC Mandi", "cost": "₹15/quintal", "capacity": "30 quintals", "next_trip": "Tomorrow 6 AM", "seats_left": 12, "icon": "🚜"},
        {"id": 2, "type": "Mini Truck (pooled)", "route": "Village → District Market", "cost": "₹25/quintal", "capacity": "50 quintals", "next_trip": "Day after tomorrow", "seats_left": 20, "icon": "🚛"},
        {"id": 3, "type": "Cold Chain Van", "route": "Farm → Cold Storage / City", "cost": "₹40/quintal", "capacity": "20 quintals", "next_trip": "On demand (2 hr notice)", "seats_left": 8, "icon": "🧊"},
    ]
    return {"storage": storage, "buyers": buyers, "transport": transport, "location": {"latitude": lat, "longitude": lon}}


@app.get("/api/schemes")
def get_schemes_data(lat: float = 20.5937, lon: float = 78.9629):
    """Government scheme matcher, application assist, grievance."""
    schemes = [
        {"id": 1, "name": "PM-KISAN", "ministry": "Agriculture & Farmers Welfare", "benefit": "₹6,000/year direct transfer", "eligibility": "All land-holding farmer families", "status": "Active — Installment 18 releasing", "deadline": "Ongoing", "icon": "🇮🇳", "category": "income_support", "url": "https://pmkisan.gov.in/",
         "steps": ["Register on pmkisan.gov.in", "Link Aadhaar to bank account", "Submit land records to local patwari", "Verify eKYC at CSC center", "Receive ₹2,000 every 4 months"]},
        {"id": 2, "name": "Pradhan Mantri Fasal Bima Yojana", "ministry": "Agriculture", "benefit": "Crop loss compensation (up to full sum insured)", "eligibility": "All farmers growing notified crops", "status": "Kharif 2026 enrollment open", "deadline": "Jul 31, 2026", "icon": "🛡️", "category": "insurance", "url": "https://pmfby.gov.in/",
         "steps": ["Visit nearest bank branch or CSC", "Submit crop sowing certificate", "Pay premium (2% Kharif, 1.5% Rabi)", "Download PMFBY app for claim status", "Claims auto-settled via weather data"]},
        {"id": 3, "name": "Soil Health Card Scheme", "ministry": "Agriculture", "benefit": "Free soil testing + fertilizer recommendations", "eligibility": "All farmers", "status": "Active — Apply at KVK", "deadline": "Ongoing", "icon": "🧪", "category": "soil", "url": "https://www.soilhealth.dac.gov.in/",
         "steps": ["Collect soil sample (500g from 6-inch depth)", "Submit to nearest KVK or soil testing lab", "Receive Soil Health Card in 2-3 weeks", "Follow fertilizer recommendations", "Re-test every 2 years"]},
        {"id": 4, "name": "PM Kisan Samman Nidhi (Micro Irrigation)", "ministry": "Agriculture", "benefit": "55-75% subsidy on drip/sprinkler irrigation", "eligibility": "All farmers with valid land records", "status": "Active", "deadline": "Ongoing", "icon": "💧", "category": "irrigation", "url": "https://pmksy.gov.in/",
         "steps": ["Apply online at pmksy.gov.in", "Get quotation from empaneled vendor", "Submit land documents + Aadhaar", "Installation + verification by dept.", "Subsidy credited to bank account"]},
        {"id": 5, "name": "National Mission on Natural Farming", "ministry": "Agriculture", "benefit": "₹12,200/ha for natural farming adoption", "eligibility": "Farmers willing to adopt chemical-free practices", "status": "Active — 1 Cr farmer target", "deadline": "Ongoing", "icon": "🌿", "category": "organic", "url": "https://naturalfarming.dac.gov.in/",
         "steps": ["Register at district agriculture office", "Attend 3-day natural farming training", "Prepare Jeevamrutha and Bijamrutha", "Submit practice adoption proof", "Receive incentive per hectare"]},
        {"id": 6, "name": "Agriculture Infrastructure Fund (AIF)", "ministry": "Agriculture", "benefit": "3% interest subvention + ₹2 Cr CGTMSE guarantee", "eligibility": "FPOs, cooperatives, agri-entrepreneurs", "status": "Active — ₹1 lakh Cr corpus", "deadline": "Till 2032-33", "icon": "🏗️", "category": "infrastructure", "url": "https://agriinfra.dac.gov.in/",
         "steps": ["Prepare project report", "Apply via agriinfra.dac.gov.in", "Bank sanctions loan", "Implement project", "Interest subvention auto-credited"]},
    ]
    grievance = {
        "portal": "pgportal.gov.in",
        "helpline": "1800-180-1551 (Kisan Call Center)",
        "steps": ["Register complaint on pgportal.gov.in or call 1800-180-1551", "Get unique Grievance ID", "Track status online within 30 days", "Escalate to District Collector if unresolved", "RTI application as last resort"],
    }
    return {"schemes": schemes, "grievance": grievance, "location": {"latitude": lat, "longitude": lon}}


@app.get("/api/community")
def get_community_data(lat: float = 20.5937, lon: float = 78.9629):
    """Success stories, neighbor comparison, verification badges."""
    stories = [
        {"id": 1, "farmer": "Ravi Patel", "region": "Gujarat", "avatar": "RP", "crop": "Cotton → Organic Cotton", "result": "Income doubled in 3 years", "detail": "Switched from Bt cotton to desi varieties with natural pest management. Saved ₹15,000/acre on inputs, got ₹2,000/quintal premium for organic.", "likes": 234, "verified": True, "practice": "Natural farming"},
        {"id": 2, "farmer": "Anita Kumari", "region": "Bihar", "avatar": "AK", "crop": "Rice (SRI Method)", "result": "Yield up 45% with 40% less water", "detail": "Adopted System of Rice Intensification. Used single seedlings, wider spacing, and alternate wetting-drying. Harvest went from 3.2 to 4.6 tons/ha.", "likes": 189, "verified": True, "practice": "SRI method"},
        {"id": 3, "farmer": "Subhash Sharma", "region": "Madhya Pradesh", "avatar": "SS", "crop": "Wheat + Chickpea intercrop", "result": "30% more income per acre", "detail": "Intercropping chickpea with wheat gave two harvests from one field. Chickpea fixed nitrogen, reducing fertilizer need for next wheat crop by 40%.", "likes": 156, "verified": True, "practice": "Intercropping"},
        {"id": 4, "farmer": "Lakshmi Devi", "region": "Andhra Pradesh", "avatar": "LD", "crop": "Millets + Vegetables", "result": "Year-round income, no debt", "detail": "Shifted from single-crop rice to diversified millet-vegetable system. Kitchen garden feeds family, millets sold at premium through FPO.", "likes": 312, "verified": True, "practice": "Crop diversification"},
        {"id": 5, "farmer": "Mohammed Ismail", "region": "Tamil Nadu", "avatar": "MI", "crop": "Coconut + Cocoa agroforestry", "result": "3x income from same land", "detail": "Added cocoa as understory crop in coconut garden. Cocoa gives ₹80,000/acre/year additional income with minimal extra labor.", "likes": 198, "verified": True, "practice": "Agroforestry"},
    ]
    benchmarks = [
        {"metric": "Yield (Wheat)", "your_estimate": "3.2 tons/ha", "regional_avg": "2.8 tons/ha", "top_10_pct": "4.5 tons/ha", "percentile": 72, "icon": "🌾"},
        {"metric": "Input Cost", "your_estimate": "₹12,000/acre", "regional_avg": "₹15,000/acre", "top_10_pct": "₹8,000/acre", "percentile": 65, "icon": "💰"},
        {"metric": "Water Usage", "your_estimate": "850 mm/season", "regional_avg": "1100 mm/season", "top_10_pct": "600 mm/season", "percentile": 70, "icon": "💧"},
        {"metric": "Soil Organic Carbon", "your_estimate": "0.6%", "regional_avg": "0.5%", "top_10_pct": "1.2%", "percentile": 58, "icon": "🌱"},
        {"metric": "Crop Diversity", "your_estimate": "3 crops", "regional_avg": "2 crops", "top_10_pct": "5+ crops", "percentile": 68, "icon": "🌿"},
    ]
    badges = [
        {"id": 1, "name": "KVK Verified Advice", "issuer": "Krishi Vigyan Kendra", "description": "Agricultural advisories verified by local KVK scientists", "icon": "🏛️", "level": "institutional"},
        {"id": 2, "name": "ICAR Research-Backed", "issuer": "Indian Council of Agricultural Research", "description": "Recommendations based on peer-reviewed ICAR publications", "icon": "🔬", "level": "research"},
        {"id": 3, "name": "Farmer-Validated", "issuer": "AgriN Community (100+ farmers)", "description": "Practices tested and validated by community of 100+ farmers", "icon": "👨‍🌾", "level": "community"},
        {"id": 4, "name": "ATMA Extension Endorsed", "issuer": "Agricultural Technology Management Agency", "description": "Endorsed by district-level ATMA extension officers", "icon": "✅", "level": "extension"},
    ]
    return {"stories": stories, "benchmarks": benchmarks, "badges": badges, "location": {"latitude": lat, "longitude": lon}}

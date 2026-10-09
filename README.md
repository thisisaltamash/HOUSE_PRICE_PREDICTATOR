# 🏠 California House Price Prediction

> A production-grade ML application — FastAPI backend + React 19 / Three.js frontend — deployed on **Render** (backend) and **Vercel** (frontend).

[![Backend](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![Frontend](https://img.shields.io/badge/Frontend-React%2019-61DAFB?logo=react)](https://react.dev)
[![Model](https://img.shields.io/badge/Model-RandomForest-orange?logo=scikit-learn)](https://scikit-learn.org)
[![Deploy](https://img.shields.io/badge/Deploy-Render-46E3B7?logo=render)](https://render.com)
[![Deploy](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel)](https://vercel.com)

---

## 📐 Architecture

```
┌─────────────────────────────────────┐        ┌──────────────────────────────┐
│  Vercel (Frontend)                  │  HTTP  │  Render (Backend)            │
│  React 19 + Vite + Three.js         │◄──────►│  FastAPI + RandomForest ML   │
│  VITE_API_BASE_URL → Render URL     │        │  Model auto-downloaded from  │
│                                     │        │  HuggingFace on first start  │
└─────────────────────────────────────┘        └──────────────────────────────┘
```

- **ML Engine**: `RandomForestRegressor` — trained on 20,640 California census block groups (scikit-learn dataset)
- **Backend API**: FastAPI · auto-downloads `house_model.joblib` (~138 MB) from HuggingFace on cold start
- **Frontend SPA**: React 19 · TypeScript · Vite · Three.js 3D WebGL · glassmorphism design

---

## 🚀 Deployment Guide

### Option A — Render (Backend) + Vercel (Frontend) ← **Recommended**

#### Step 1 · Deploy the Backend to Render

1. Go to **[render.com](https://render.com)** → **New** → **Web Service**
2. Connect your GitHub repo (`thisisaltamash/HOUSE_PRICE_PREDICTATOR`)
3. Use these settings:

   | Setting | Value |
   |---|---|
   | **Language** | Python 3 |
   | **Build Command** | `pip install -r requirements.txt` |
   | **Start Command** | `uvicorn main:app --host 0.0.0.0 --port $PORT` |
   | **Instance Type** | Free (or Starter for faster cold start) |

   > **Alternatively**: Render will auto-detect [`render.yaml`](./render.yaml) — just click **"Use render.yaml"** when prompted.

4. Click **Deploy**. The first deploy downloads the model (~138 MB) — allow ~3–5 min.
5. Copy your **Render service URL** (e.g., `https://house-price-api.onrender.com`).

#### Step 2 · Deploy the Frontend to Vercel

1. Go to **[vercel.com](https://vercel.com)** → **Add New Project** → import your GitHub repo
2. Set the **Root Directory** to `frontend`
3. Add an **Environment Variable**:

   | Key | Value |
   |---|---|
   | `VITE_API_BASE_URL` | `https://house-price-api.onrender.com` ← your Render URL |

4. Click **Deploy**. Vercel auto-detects Vite and uses [`vercel.json`](./frontend/vercel.json).

---

### Option B — Docker Compose (Full Local / VPS)

```bash
# Clone and run everything with one command
git clone https://github.com/thisisaltamash/HOUSE_PRICE_PREDICTATOR.git
cd HOUSE_PRICE_PREDICTATOR

docker compose up --build
```

| Service | URL |
|---|---|
| Frontend UI | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |

To pass a custom backend URL at Docker build time:

```bash
docker build \
  --build-arg VITE_API_BASE_URL=https://your-api.onrender.com \
  -t house-frontend ./frontend
```

---

### Option C — Local Development

#### 1. Start the Python Backend

```bash
# Windows PowerShell
.\.venv\Scripts\Activate.ps1

# macOS / Linux
source .venv/bin/activate

uvicorn main:app --reload --port 8000
```

Check it's healthy:
```bash
curl http://localhost:8000/health
```

#### 2. Start the React Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**.

---

## 📡 API Reference

Base URL: `https://house-price-api.onrender.com` (or `http://localhost:8000` locally)

### `GET /health`
```json
{
  "status": "healthy",
  "model": "RandomForestRegressor",
  "features": ["MedInc", "HouseAge", "AveRooms", "AveBedrms", "Population", "AveOccup", "Latitude", "Longitude"],
  "average_error": "39,000 USD"
}
```

### `POST /predict`

**Request:**
```json
{
  "MedInc": 8.32,
  "HouseAge": 41,
  "AveRooms": 6.98,
  "AveBedrms": 1.02,
  "Population": 322,
  "AveOccup": 2.55,
  "Latitude": 37.88,
  "Longitude": -122.23
}
```

**Response:**
```json
{
  "predicted_price": "$452,600",
  "predicted_price_short": "$4.53hundred thousand dollar",
  "fidence_range": "$413,600 to $491,600"
}
```

### `POST /predict-file`

Upload a CSV file with the 8 required columns. Returns an enriched CSV with a `predicted_price_USD` column.

```bash
curl -X POST https://house-price-api.onrender.com/predict-file \
  -F "file=@your_data.csv" \
  --output predictions.csv
```

**Required CSV columns:** `MedInc, HouseAge, AveRooms, AveBedrms, Population, AveOccup, Latitude, Longitude`

---

## 📋 Input Validation

| Field | Description | Constraint |
|---|---|---|
| `MedInc` | Median income (tens of thousands USD) | `> 0` |
| `HouseAge` | Median house age in years | `> 0` |
| `AveRooms` | Avg rooms per household | `> 0` |
| `AveBedrms` | Avg bedrooms per household | `> 0` |
| `Population` | Block group population | `> 0` |
| `AveOccup` | Avg household members | `> 0` |
| `Latitude` | Block group latitude | `32.0 – 42.0` |
| `Longitude` | Block group longitude | `-125.0 – -114.0` |

---

## 🧪 Testing

```bash
cd frontend

# Run all 21 unit + integration tests
npm run test

# Type-check + production build
npm run build
```

---

## 📁 Project Structure

```
HOUSE_PRICE_PREDICTATOR/
├── main.py                 # FastAPI app (backend entry point)
├── requirements.txt        # Python dependencies
├── render.yaml             # Render deployment config (backend)
├── Dockerfile              # Backend Docker image
├── docker-compose.yml      # Full-stack local orchestration
├── train.py                # Model training script
├── house_features.joblib   # Feature metadata
└── frontend/
    ├── vercel.json         # Vercel deployment config (frontend)
    ├── Dockerfile          # Frontend Docker image (multi-stage Nginx)
    ├── nginx.conf          # Nginx SPA routing + caching
    ├── vite.config.ts      # Vite + Vitest config
    ├── src/
    │   ├── components/     # React UI components
    │   ├── services/api.ts # Typed API client
    │   ├── types/          # TypeScript type definitions
    │   └── constants/      # Preset data
    └── .env.example        # Copy to .env for local dev
```

---

## ⚙️ Environment Variables

### Backend (Render)
None required — the model is auto-downloaded from HuggingFace.

### Frontend
| Variable | Description | Example |
|---|---|---|
| `VITE_API_BASE_URL` | Backend API base URL | `https://house-price-api.onrender.com` |

Copy `frontend/.env.example` → `frontend/.env` for local dev.

---

## 🤖 Model Info

- **Algorithm**: `RandomForestRegressor` (scikit-learn)
- **Dataset**: California Housing (20,640 samples, 8 features)
- **Average Error**: ~$39,000 USD
- **Model file**: Auto-downloaded from [HuggingFace](https://huggingface.co/thisisaltamash/house_model.joblib) at startup (~138 MB, not stored in git)

# California House Price Predictor - Frontend

An ultra-modern, responsive Single Page Application (SPA) with real-time 3D WebGL graphics and California census block group valuation workflows.

## Features
- **3D Architectural Villa & Geospatial Grid**: Interactive WebGL mesh using Three.js with orbit and auto-rotation controls.
- **Single Block Group Prediction**: 8 input features with client-side validation, accessible error announcements, California boundary bounds, and preset locations (SF Bay, Silicon Valley, LA Metro, Central Valley).
- **Batch CSV Valuation**: Drag-and-drop file upload, blank and sample CSV template generator, preflight header inspection, instant CSV download, and parsed prediction preview table.
- **Service Status Monitoring**: Live health indicator checking `GET /health` non-blockingly.
- **Honest Model Disclaimers**: Displays `fidence_range` clearly labeled as model uncertainty (~$39,000 USD average error from `/health`).

## Getting Started

### Prerequisites
- Node.js 20+
- npm 10+
- Backend running at `http://localhost:8000` (FastAPI)

### Installation
```bash
cd frontend
npm install
```

### Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default content:
```env
VITE_API_BASE_URL=http://localhost:8000
```

### Development Server
```bash
npm run dev
```
The app will start at `http://localhost:5173`.

### Running Tests
Run focused unit and integration test suite with Vitest:
```bash
npm run test
```

### Production Build
```bash
npm run build
```
Generates optimized static bundle in `frontend/dist`.

### Production Preview
```bash
npm run preview
```
Previews the built production assets locally.

## Deployment with Docker
```bash
docker build -t california-housing-frontend .
docker run -p 5173:80 california-housing-frontend
```

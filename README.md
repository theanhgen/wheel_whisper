# Fleet Performance Dashboard

I built this app as a compact fleet-data project: one screen where I can inspect trips, map movement, and add real-world context (weather + nearby webcams) without bouncing between tools.

## Who/Why

The main user is a dispatcher or fleet manager who needs quick answers, not raw telemetry dumps.  
The goal is simple: make daily trip review faster by combining route data, trip metrics, and context in one place.

## What’s in the app

- Fleet map with route history and speed-colored segments
- Trip chart + KPI cards (distance, fuel, speed, active vehicles)
- Vehicle/date filters
- Trip detail panel with:
  - weather at departure
  - nearby webcams at destination (if available)
- Lightweight driver scoring heuristic
- API Evidence Panel so endpoint usage is transparent

## AI Tools & Workflow

I used AI coding tools (Gemini CLI, Claude Code, Codex) as pair-programming assistants through the whole build:

1. Parse requirements and shortlist reliable endpoints.
2. Test demo data and pivot scope when sparse datasets appeared.
3. Build typed API clients + mappers and core Vue components.
4. Add context integrations (weather/webcams), scoring, and UX refinements.
5. Debug CORS/type/runtime issues and harden with tests/build checks.

## Obstacles & Resolutions

- **CORS:** solved with Vite proxy + server-side header injection.
- **Sparse demo data:** shifted to trip-centered flow so the dashboard stays data-dense.
- **Type mismatches:** added strict mappers and defensive numeric coercion.
- **Secrets risk:** kept keys in env/proxy flow and cleaned up local config.

## What I’d add next

1. Playwright E2E flow for the full walkthrough.
2. Caching for weather/webcam lookups.
3. Better driver score trend comparison over time.

## APIs used

- GPS Dozor: `/groups`, `/vehicles/group/{code}`, `/vehicle/{code}/trips`, `/vehicles/history/{codes}`
- Open-Meteo: `/v1/forecast`
- Windy Webcams: `/api/v3/webcams`
- Nominatim/OSM: `/reverse`

## Run locally

Requirements: Node.js `>= 18`

```bash
cd app
npm install
npm run dev
```

Optional:

```bash
# enable webcam context
echo "VITE_WINDY_API_KEY=your_key" > .env

# checks
npm test
npm run build
```

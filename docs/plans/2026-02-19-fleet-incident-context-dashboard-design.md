# Fleet Incident Context Dashboard - Product & Technical Design

## 1) Decision and Scope

Build a single-page web app that helps fleet managers investigate risky driving events using three data layers:

1. GPS telemetry and events from GPS Dozor (primary source)
2. Nearby public webcams from Windy Webcams (visual context)
3. Weather at the event location/time from Open-Meteo (situational context)

This is intentionally an investigation tool, not a full fleet platform.

## 2) Why This Concept Fits the Assignment

This concept directly satisfies all assignment constraints:

- Uses 3+ GPS Dozor endpoints
- Includes strong visualization (map + trend chart)
- Includes user interaction and filtering (time, vehicle, event type, severity)
- Has explicit user value: faster incident triage for dispatch/ops
- Uses optional external APIs in a meaningful way (webcam + weather)

## 3) User and Jobs-to-be-Done

Primary user: Dispatcher / fleet operations manager (small to mid-size fleet).

Main job:

- "When something risky happens, I need fast context to decide if I should escalate, coach the driver, or ignore it."

Pain points today:

- Raw telemetry is noisy
- No quick visual context around location/time
- Triage takes too long and is inconsistent

## 4) Product Outcome

### 4.1 Core Outcome

Reduce incident triage time by combining telemetry + nearby visual context + weather in one place.

### 4.2 Success Metrics (MVP)

- 95% of selected events load complete context (telemetry + weather; webcam optional)
- Median time from event click to visible detail panel < 2.5s (with cache)
- Reviewer can understand app value in < 60 seconds

## 5) MVP Feature Set

### 5.1 Must Have

- Filter bar
  - Date/time range
  - Vehicle multi-select
  - Event type (eco-driving event types)
  - Severity
- Incident map
  - Event markers colored by severity
  - Marker click opens incident detail drawer
- Trend visualization
  - Time-series bar chart of event counts per hour/day
- Incident table
  - Sortable list with timestamp, vehicle, event type, severity, speed
- Incident detail drawer
  - Telemetry summary
  - Weather snapshot for event time/location
  - Nearby webcams list + preview image (if available)

### 5.2 Explicitly Out of Scope (MVP)

- Full playback with frame-accurate historical webcam proof
- Multi-tenant auth/roles
- Command APIs (engine relay control)
- Mobile-native app

## 6) UX Structure

Single page layout:

1. Top: filter bar + KPI cards
2. Left/main: map with event markers
3. Right: trend chart above incident table
4. Slide-over drawer: selected incident context

Empty states:

- No data in range
- No webcam found in radius
- Weather unavailable

Loading states:

- Skeletons for KPI/chart/table
- Incremental loading in detail drawer (telemetry first, weather/webcam second)

## 7) Data Sources and Contracts

## 7.1 GPS Dozor (required)

Base URL: `https://a1.gpsguard.eu/api/v1/`
Auth: Basic Auth over HTTPS

Planned endpoints:

1. `GET /groups`
2. `GET /vehicles/group/{groupCode}`
3. `GET /vehicle/{vehicleCode}/eco-driving-events?from={iso}&to={iso}`
4. `GET /vehicle/{vehicleCode}/trips?from={iso}&to={iso}`
5. Optional enrichment: `GET /vehicles/history/{vehicleCodes}?from={iso}&to={iso}`

Why these endpoints:

- Groups + vehicles provide entity scope and filter options
- Eco-driving events provide incident objects and coordinates
- Trips provide operational context (distance, duration, max speed)
- History supports optional route/path overlays

## 7.2 Windy Webcams (external context)

Docs indicate API key via `x-windy-api-key` header and V3 webcam listing/details endpoints.
Use webcam discovery by coordinates/radius and fetch fresh image URLs per page load because tokenized image URLs expire.

Product interpretation:

- Webcam is context, not legal proof
- If no camera exists nearby, show "No nearby webcams"

## 7.3 Open-Meteo Historical API (external context)

Endpoint family: `/v1/archive`
Input: latitude, longitude, date range, hourly variables

For each selected incident:

- Fetch nearest-hour weather values
- Variables: precipitation, windspeed, visibility, temperature, weather_code

## 8) Normalized Internal Data Model

```ts
type EventSeverity = "none" | "low" | "medium" | "high";

type Incident = {
  id: string;                 // vehicleCode + timestamp + eventType
  vehicleCode: string;
  vehicleName: string;
  timestamp: string;          // ISO
  eventType: string;          // mapped enum name
  eventSeverity: EventSeverity;
  eventValue?: number;
  speedKph?: number;
  lat: number;
  lon: number;
};

type IncidentContext = {
  incidentId: string;
  weather?: {
    timestamp: string;
    temperatureC?: number;
    windKph?: number;
    precipitationMm?: number;
    visibilityM?: number;
    weatherCode?: number;
  };
  webcams: Array<{
    webcamId: string;
    title: string;
    distanceKm: number;
    previewUrl?: string;
    detailUrl?: string;
    playerUrl?: string;
  }>;
};
```

## 9) Scoring and Prioritization Logic

Purpose: highlight events worth attention first.

Proposed incident score:

- Base by severity: none=0, low=20, medium=50, high=80
- + speed contribution: +0 to +20 for speed above threshold
- + weather risk bonus: +10 if rain/snow/low visibility

Result:

- `incident_score` from 0..110
- Table default sort = descending score

## 10) System Architecture

Recommended architecture for speed + API key safety:

- Frontend: Vue 3 + TypeScript + Vite
- Backend for frontend (BFF): lightweight Node/Express (or Vercel/Netlify serverless)
- External APIs called by BFF only (avoid exposing secrets)

Flow:

1. Frontend requests aggregated data from BFF
2. BFF calls GPS Dozor and normalizes incidents
3. BFF fetches weather/webcams for selected incidents or on-demand detail
4. BFF returns merged payload to frontend

Caching:

- In-memory TTL cache at BFF
  - incidents query key: `(vehicles, from, to)` TTL 60s
  - weather by rounded `(lat, lon, hour)` TTL 6h
  - webcams by `(lat, lon, radius)` TTL 15m

## 11) API Design for Our App (BFF)

### 11.1 Endpoints

- `GET /api/groups`
- `GET /api/vehicles?groupCode=...`
- `GET /api/incidents?groupCode=...&vehicleCodes=...&from=...&to=...&eventTypes=...&severity=...`
- `GET /api/incidents/{incidentId}/context`

### 11.2 Response Principles

- Always return normalized shapes
- Include partial data with `warnings[]` when external context fails
- Keep raw provider payload out of UI contract

## 12) Error Handling and Edge Cases

Primary edge cases:

1. GPS Dozor credentials invalid or rate-limited
2. No eco-driving events in time range
3. Weather API available but missing hourly slot
4. Webcam exists but preview URL expired
5. Reverse geodata unavailable

Handling strategy:

- Never block entire page because webcam/weather failed
- Show partial data with explicit status badges
- Provide retry action only for detail drawer context calls

## 13) Security and Compliance

- Keep all API keys and credentials server-side in env vars
- Use HTTPS only
- Do not store sensitive credentials in repo
- Add `.env.example` with variable names only
- Log redaction for auth headers

## 14) Performance Targets (MVP)

- First meaningful paint < 2.5s on broadband for dashboard shell
- Initial incidents query < 3s for 24h range and <= 20 vehicles
- Detail drawer context load < 2s from cache, < 4s cold

## 15) Test Strategy

### 15.1 Unit

- Event type and severity mapping
- Incident score function
- API normalization mappers

### 15.2 Integration

- BFF endpoint contract tests with mocked upstream APIs
- Error-path tests for partial context failures

### 15.3 E2E (critical path)

1. Load dashboard
2. Filter by vehicle + time
3. Select incident on map/table
4. Verify drawer shows telemetry + weather + webcam status

## 16) Delivery Plan

### Phase 1 - Integration Spike (0.5 day)

- Validate GPS Dozor demo credentials and selected endpoints
- Validate Windy webcam query + token expiry behavior
- Validate Open-Meteo archive lookup at event timestamp

Exit criteria:

- Proven sample responses saved in `logs/` or `docs/`

### Phase 2 - Data Layer + BFF (1 day)

- Build adapters, normalization, scoring, and API routes
- Add caching + basic error handling

### Phase 3 - UI MVP (1.5 days)

- Filter bar, KPI cards, map, chart, table, detail drawer
- Empty/loading/error states

### Phase 4 - Hardening + README (1 day)

- Test pass for core paths
- README finalization per assignment format
- Submission polish and demo script

## 17) Acceptance Criteria (Hard Checklist)

- Uses at least 3 GPS Dozor endpoints in working flow
- Contains at least one clear data visualization
- User can filter and interact with incidents
- App purpose is obvious in first screen
- Repository is runnable and public-ready
- README is <= 1 page and includes AI workflow + obstacles + future improvements

## 18) Risks and Mitigations

- Risk: weak webcam density near events
  - Mitigation: configurable radius (e.g., 2km -> 5km -> 15km fallback)
- Risk: overpromising "exact visual proof"
  - Mitigation: product copy says "nearby visual context"
- Risk: API variability in demo account
  - Mitigation: mock mode fallback with recorded fixtures for demo

## 19) Source References (validated on 2026-02-19)

- GPS Dozor API docs: https://www.gpsdozor.cz/en/documentation/api
- GPS Dozor API text mirror used for endpoint extraction: https://r.jina.ai/http://www.gpsdozor.cz/en/documentation/api
- Windy Webcams docs: https://api.windy.com/webcams/docs
- Windy Webcams terms: https://api.windy.com/webcams/terms
- Open-Meteo historical weather API: https://open-meteo.com/en/docs/historical-weather-api

## 20) Final Product Positioning Statement

"Fleet Incident Context Dashboard helps dispatchers triage risky driving events faster by combining GPS Dozor telemetry with nearby webcam and weather context in one actionable view."

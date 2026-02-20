# AI Workflow Notes

Date: 2026-02-19 / 2026-02-20
Project: GPS Dozor Fleet Dashboard

## AI tools used

- **Gemini CLI** -- initial architecture spike, API doc analysis, product concept
- **Claude Code (Claude Opus 4.6)** -- full implementation, debugging, feature iteration, submission prep

## What was done with AI

### Phase 1: Discovery (Gemini CLI)
1. Parsed assignment PDF and extracted hard requirements.
2. Audited GPS Dozor API endpoints via curl -- discovered eco-driving events return empty on demo account.
3. Designed product concept: Fleet Operations Dashboard (pivoted from incident triage).
4. Wrote implementation design and submission readiness matrix.

### Phase 2: Implementation (Claude Code)
1. Scaffolded Vue 3 + TypeScript + Vite project with Tailwind CSS 4.
2. Built API client layer with typed responses and PascalCase-to-camelCase mappers.
3. Implemented all dashboard components: FleetMap, KpiCards, TripChart, TripTable, FilterBar.
4. Integrated external APIs: Open-Meteo (weather), Windy Webcams, Nominatim (geocoding).
5. Added product features: scenario presets, baseline KPI comparison, context confidence badges.
6. Built API Evidence Panel for requirement proof.
7. Debugged render crashes, type coercion issues, and Safari date input compatibility.

## Key decisions made through AI iteration

- Pivoted from eco-driving incident triage to trip analysis when demo data was sparse.
- Used Vite proxy (not BFF) to keep credentials server-side -- simpler for a case study.
- Used GPS Dozor public demo credentials as hardcoded fallback for reviewer convenience.
- Added `Number()` coercion defensively in mappers AND components after discovering API returns mixed string/number types.

## Issues encountered and how AI resolved them

| Issue | AI resolution |
|-------|---------------|
| `toFixed is not a function` render crash | Traced to `fuelConsumed` being a string from API. Fixed with `Number()` in mappers. |
| Safari date inputs empty | Switched from `datetime-local` to `date` type with YYYY-MM-DD format. |
| Trips not loading (appeared stuck) | Added AbortController timeout + console debugging to identify that the render crash was masking successful API responses. |
| CORS on GPS Dozor API | Implemented Vite proxy with auth injection in proxy headers. |

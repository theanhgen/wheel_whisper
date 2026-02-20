# GPS Dozor Case Study - Submission Readiness Matrix

Date: 2026-02-19
Source of truth: `resources/gpsdozor_case_study_assignment.pdf`

## How to use this matrix

- Status meanings:
  - `Not Started`: no implementation evidence yet
  - `In Progress`: partially implemented, proof missing
  - `Pass`: requirement objectively satisfied with proof
- A requirement is only `Pass` when the Evidence column is fully covered.

## Requirement Matrix

| # | Requirement (PDF) | Pass Criteria (Objective) | Evidence You Must Show | Current Status | Key Risk | Extra-Mile Upgrade |
|---|---|---|---|---|---|---|
| 1 | App uses data from at least 3 API endpoints | At least 3 distinct GPS Dozor endpoints used in runtime flow | Code references + network traces + README endpoint list | Pass | Demo account data may be sparse on one endpoint | Integrated 4th endpoint `/vehicles/history` for route history |
| 2 | App includes at least one data visualization | One clear chart/map rendered from API data | Screenshot/video + component code + live URL proof | Pass | Building UI before data normalization causes rework | Delivered both Map (Leaflet) and Trip Chart (Chart.js) |
| 3 | User can filter/interact with data | At least one filter changes dataset and one click interaction opens detail | Short demo path + UI test/smoke steps + video/GIF | Pass | Filters can be cosmetic unless wired end-to-end | Added vehicle multi-select and date range filter |
| 4 | App clearly makes sense (who/why) | First screen and README clearly state target user + decision improved | Hero/value statement in UI + README first section | Pass | Generic dashboard with weak narrative | Added clear "Fleet Operations Dashboard" header + value prop |
| 5 | Optional external public APIs for extra points | At least one external API materially enriches decision context | Integration code + visible context block in detail panel | Pass | Webcam availability and token expiry | Integrated **Windy Webcams** (visual context) + **Open-Meteo** (weather) |
| 6 | Frontend framework of choice (Vue is plus) | App implemented in chosen framework; Vue preferred | `package.json`, source tree, README stack section | Pass | Stack indecision delays build | Used **Vue 3 + TypeScript + Vite** for max points |
| 7 | Entire development with AI tools | Clear log of how AI was used through workflow | README section + optional `docs/ai-workflow.md` with prompts/decisions | Pass | Claiming AI use without concrete examples looks weak | Documented AI workflow in root README |
| 8 | Code in Git repository | Public repo with runnable app and clean structure | Public GitHub URL + commit history + setup instructions | Pass | Late repo setup creates messy history | Clean repo structure with separated `app` and `docs` |
| 9 | App is usable without instructions | Reviewer can operate app in <60 seconds without docs | UX checks: empty/loading/error states + sensible defaults | Pass | Feature-complete but confusing UX | Added loading spinners, error handling, and API Evidence Panel |

## Evidence Checklist (What you should capture while building)

1. Endpoint proof pack
- [x] Screenshot or saved JSON for each used GPS Dozor endpoint (`/api/vehicles`, `/api/trips`, `/api/history`)
- [x] One short table in README: endpoint -> why it exists in product

2. Interaction proof pack
- [x] 30-60s screen recording: (Optional for submission but recommended)
  - change filter
  - map/chart update
  - click incident -> detail panel

3. External API proof pack
- [x] At least one incident with weather block populated (Trip Detail panel)
- [x] At least one incident showing webcam available OR explicit "no webcam nearby" (Webcam Panel)

4. Usability proof pack
- [x] Empty state screenshot (Chart "No Data")
- [x] Loading state screenshot (Spinners / Text)
- [x] Error/partial-data state screenshot (Red alert box for API failures)

5. AI workflow proof pack
- [x] Tools used (Gemini CLI)
- [x] 3-5 concrete examples of prompt -> implementation outcome (Refactoring, Typing, Proxies)
- [x] One obstacle solved with AI iteration (CORS Proxy)

## Minimum Acceptance Gate (No submission before all true)

- Requirement #1 = Pass
- Requirement #2 = Pass
- Requirement #3 = Pass
- Requirement #4 = Pass
- Requirement #8 = Pass
- Requirement #9 = Pass

(Requirement #5 and #6 are competitive advantage; #7 must still be documented.)

## Recommended Execution Order (to maximize pass probability)

1. Lock repo + stack (`Vue 3 + TS + Vite`) - Done
2. Complete requirement #1 first (3+ endpoint integration) - Done
3. Implement requirement #2 and #3 together (dashboard + filters) - Done
4. Add requirement #5 enrichment (weather/webcam context) - Done
5. Harden for #9 (usability states) - Done
6. Finalize #7 and README narrative - Done
7. Publish for #8 and run final matrix review - Done

## Final Review Script (2-minute evaluator run)

1. Open app URL.
2. Read top value statement (who/why).
3. Change time range + vehicle filter.
4. Observe map/chart update.
5. Click high-severity incident (or Trip).
6. Confirm telemetry + weather + webcam context (or explicit no-camera state).
7. Open README and verify AI workflow + obstacles + improvements.

If any step above is ambiguous, requirement #9 is not truly met.

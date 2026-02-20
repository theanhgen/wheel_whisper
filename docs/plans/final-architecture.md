# Final Architecture & Scoring Logic - GPS Dozor Fleet Dashboard

## 1. Overview

The final implementation of the dashboard moved beyond simple data fetching and into a **Senior-level architecture** using centralized state management and advanced telemetry analysis.

## 2. State Management (Pinia)

Instead of local component state or disparate composables, the application uses **Pinia** stores to maintain a single source of truth:

- **Fleet Store (`fleet.ts`):** Manages vehicle and group discovery.
- **Trip Store (`trips.ts`):** Handles date-range filtering, parallel fetching of vehicle trips, and route history.
- **Context Store (`context.ts`):** Manages enrichment data (Weather, Webcams) and provides loading/clearance logic for the detail panel.

### Why this matters:
- **Scalability:** The dashboard can easily be extended with new modules (e.g., driver details or real-time alerts).
- **Predictability:** State transitions are centralized, making debugging and testing significantly easier.

## 3. "Smart" Driver Scoring Algorithm

To provide more value than just raw data, we implemented a custom scoring algorithm in `utils/scoring.ts`.

### 3.1 Scoring Factors (100 pts total)

| Factor | Weight | Logic |
|--------|--------|-------|
| **Fuel Efficiency** | 30 pts | Compares L/100km against a benchmark. Scaled from 30 (<=8L) to 0 (>=15L). |
| **Safety (Speeding)** | 30 pts | Calculates % of trip spent above 130 km/h. |
| **Braking Quality** | 20 pts | Detects "Harsh Braking" events (speed drops >= 30 km/h between points). |
| **Consistency** | 20 pts | Uses **Standard Deviation** of speed to measure driving smoothness. |

### 3.2 Human-Readable Output
The scoring utility transforms these numeric metrics into natural language:
- **Grades:** A-F based on the aggregate score.
- **Narrative:** "Efficiency Rating: A. Good fuel economy. No speeding detected. Smooth braking."

## 4. Visual Improvements (Map Polish)

The Leaflet implementation includes advanced features:
- **Speed-based Path Color-coding:** Red segments (>130), Yellow (90-130), Green (<90).
- **Custom Icons:** Status-based coloring for vehicles on the map.
- **Dynamic Legend:** Context-aware UI elements that respond to data availability.

## 5. Security & Proxy

All API keys (GPS Dozor, Windy) are injected via the **Vite Proxy**. This ensures that:
1. No sensitive keys are visible in the source code or browser console.
2. Credentials are only transmitted between the local dev server and the provider.
3. CORS issues are resolved transparently.

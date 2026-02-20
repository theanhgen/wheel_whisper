# PRD - GPS Dozor AI Case Study App

## 1. Problem Statement

Fleet-related operational data is often available but difficult to interpret quickly. The app should turn raw telemetry into simple, actionable insight for daily decision-making.

## 2. Target User

- Primary: Small fleet manager / dispatcher
- Secondary: Operations analyst reviewing utilization and anomalies

## 3. Goals

- Demonstrate integration of >=3 GPS Dozor API endpoints.
- Provide at least one meaningful visualization.
- Enable filtering/interaction for practical exploration.
- Communicate clear product value in a concise README.

## 4. Non-Goals

- Building a full production-grade fleet management suite
- Complex role-based access model
- Long-term data warehouse design

## 5. Functional Requirements

1. Data integration:
- Pull and normalize data from minimum 3 endpoints.

2. Insights UI:
- At least one chart/map visualization.
- Show key metrics (for example: active vehicles, mileage, idle time, events).

3. Interaction:
- Filter by date/time range.
- Filter by vehicle/group/event type.

4. Explanation layer:
- Short textual insight per chart/metric to explain why it matters.

## 6. Success Criteria

- Reviewer can understand app purpose in under 60 seconds.
- Reviewer can see endpoint usage, visualization, and filtering quickly.
- Repo is easy to run and well documented.

## 7. Suggested MVP Scope

- One dashboard page
- KPI cards + one main chart + one map/table
- Filter bar (time + vehicle)
- Basic empty/error/loading states

## 8. Open Questions

- Which exact endpoints provide best signal for a compelling story?
- Are API credentials sandboxed and stable for demo period?
- Is historical depth sufficient for trend visualization?

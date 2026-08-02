# DEL Airport Operations Control Center (AOCC)

The DEL Airport Operations Control Center (AOCC) is an enterprise-grade, single-pane-of-glass dashboard engineered for comprehensive airport management. It aggregates and visualizes operational data across distinct, highly interconnected domains—including flights, baggage handling, passenger flow, security screening, maintenance operations, staff scheduling, and retail analytics.

## Live Demo

**Production**  
[https://airport-operations-control-center.vercel.app/](https://airport-operations-control-center.vercel.app/)  
*The application is deployed on Vercel.*

## Highlights

- Unified AOCC dashboard
- Client-side simulation engine
- Incident and alert lifecycle
- Cross-module navigation
- Cockpit-style detail drawers
- Interactive operational analytics
- Responsive enterprise UI
- LocalStorage persistence
- Live KPI refresh animations
- Smooth page transitions

## Overview

The purpose of this project is to address the fragmentation of information in complex operational environments. By centralizing disparate data streams into a unified dashboard, operations staff can monitor, investigate, and resolve issues in real-time. 

The application incorporates a simulation engine that mimics live updates by traversing a static dataset based on a virtual clock operating between October 15, 2024, and December 30, 2024. This simulates an enterprise environment where users observe operations dynamically, and an integrated alert system surfaces anomalies requiring immediate intervention.

## Features

- **Dashboard**: High-level executive summary presenting active flight KPIs, passenger throughput, security queue wait times, and a live alert feed.
- **Flights**: Real-time tracking of flight statuses, scheduled versus actual times, gate assignments, and delay metrics.
- **Gate Operations**: Terminal 3 gate utilization maps and event logs tracking aircraft docking, cleaning, and maintenance holds.
- **Baggage**: Throughput tracking, transfer counts, oversize baggage processing, and delay identification.
- **Passengers**: Flow visualization, demographics, and booking class distributions to aid resource allocation.
- **Security**: Wait time monitoring, lane throughput efficiency, and peak-hour anomaly detection.
- **Maintenance**: Aircraft on Ground (AOG) monitoring, work order logging, and technician assignment tracking.
- **Staff**: Shift monitoring, department allocations, and certification expiration tracking.
- **Retail**: Commercial performance tracking, duty-free sales metrics, and hourly transaction flow volumes.
- **Alerts**: Centralized incident management supporting acknowledgment, investigation, and resolution states.
- **Simulation Engine**: Real-time data progression across a virtual timeline with manual playback controls.
- **Responsive Design**: Adapts gracefully from multi-pane desktop layouts to mobile-optimized vertically stacked views.
- **Cross-module relationships**: Deep linking between related records (e.g., clicking a flight routes to its assigned gate details).
- **Detail Drawers**: Contextual slide-out panels providing deep-dive metrics without losing page state.
- **Local Storage**: Persistence of specific UI preferences, such as the simulation playback speed.
- **Animations**: Subtle, performant transitions during page routing and data updates.

## Design Principles

- **Enterprise dashboard**: High information density suitable for operations centers.
- **Dark cockpit theme**: High-contrast, fatigue-reducing palette optimized for continuous monitoring.
- **Operational clarity**: Immediate visual surfacing of critical anomalies.
- **Consistent component system**: Reusable components standardizing the visual language across modules.
- **Responsive layouts**: Scalable interfaces optimized for varied display sizes.
- **Minimal visual clutter**: Functional aesthetic prioritizing data over decoration.

## Technology Stack

- **Framework**: React 18
- **Language**: TypeScript
- **Bundler**: Vite
- **Routing**: React Router DOM
- **Charts**: Recharts
- **Icons**: Lucide React
- **Styling**: Tailwind CSS
- **Data parsing**: PapaParse
- **State management**: React Context API
- **Utilities**: Custom Hooks

## Architecture

- **Contexts**: Global state providers handling the simulation engine clock, raw datasets, and the centralized alert queue.
- **Hooks**: Custom React hooks handling complex logic such as debounced searching, multi-field filtering, and pagination.
- **Utilities**: Pure functions handling date formatting, currency conversions, and data aggregation.
- **Generic components**: Reusable UI primitives (e.g., `DataTable`, `KPICard`, `ChartWrapper`) ensuring consistent design across domains.
- **Feature modules**: Domain-specific directories encapsulating routes, context consumption, and layout structures.
- **Routing**: Centralized configuration mapping URLs to lazy-loaded feature modules.
- **Simulation**: A deterministic time loop that recalculates derived metrics and filters underlying arrays based on `simulatedNow`.
- **Alert lifecycle**: A state machine handling incident progression from generation through closure.

## Project Structure

```
src/
├── components/
│   ├── alerts/
│   ├── baggage/
│   ├── common/
│   ├── dashboard/
│   ├── flights/
│   ├── gates/
│   ├── layout/
│   ├── maintenance/
│   ├── passengers/
│   ├── retail/
│   ├── security/
│   └── staff/
├── context/
├── hooks/
├── router/
├── types/
└── utils/
```

## Simulation Engine

The core of the AOCC is a deterministic simulation engine running entirely in the client browser, designed to mock real-time data streaming.
- **Simulated clock**: Progresses time virtually across the dataset timeline.
- **Speed controls**: Adjusts the multiple at which time passes (1x, 10x, 20x, 40x, 80x).
- **Pause/resume**: Halts or starts the virtual progression of time.
- **Filtering logic**: Restricts the presentation of raw datasets strictly to records occurring before the current simulated timestamp.
- **Reactive UI updates**: Subscribed components recalculate derived metrics seamlessly as the simulation clock advances.

## Alert Lifecycle

The Alert Center implements a strict enterprise incident management workflow.
- **Created**: Anomalies trigger the generation of a new incident.
- **Acknowledged**: Operators confirm awareness, removing the alert from the critical unacknowledged queue.
- **Investigating**: Operators actively review correlated records and metadata.
- **Resolved**: Operators manually mark the issue as mitigated (or it auto-resolves if the underlying condition clears).
- **Closed**: Resolved alerts are archived and purged from active operational views.

Global notification counts strictly reflect unresolved, active alerts to prioritize operator attention.

## Local Storage

The application utilizes `localStorage` exclusively for persisting non-sensitive user UI preferences across sessions:
- Simulation speed
- Pause/resume state

Raw operational datasets and derived analytics are intentionally NOT persisted to local storage, maintaining performance limits and ensuring data integrity upon reload.

## Performance Optimizations

The application implements several optimization techniques to maintain a smooth 60fps experience:
- **Memoization**: Extensive use of `useMemo` and `useCallback` to prevent expensive array filtering on every render.
- **Reusable components**: Standardized generic UI components minimize DOM bloat.
- **Client-side filtering**: Optimized custom hooks manage in-memory pagination, sorting, and filtering without blocking the main thread.
- **Context separation**: Distinct Context providers localize state updates, preventing global clock ticks from needlessly re-rendering static elements.
- **Smooth transitions**: Framer-motion style structural CSS transitions during route changes.
- **Sticky headers**: Preserved table contexts during extensive vertical scrolling.
- **Responsive tables**: Horizontal-scrolling data tables preventing layout breaks on small displays.

## Responsive Design

The application scales seamlessly to large enterprise NOC (Network Operations Center) displays and mobile devices:
- **Desktop**: Full multi-pane layouts utilizing persistent sidebars and expansive grids.
- **Tablet**: Collapsed auxiliary panels with optimized grid column structures.
- **Mobile**: Drawer-based navigation menus and vertically stacked components.
- **Sidebar behavior**: Fixed position on large screens, sliding overlay on smaller devices.
- **Detail drawer behavior**: Contextual slide-out panels that adapt from partial screen overlays on desktop to full-screen modals on mobile.
- **Table responsiveness**: Data-dense tables allow horizontal scrolling while preserving column headers and crucial identifying columns.

## Installation

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Build Validation

The project enforces strict enterprise quality standards during CI/CD workflows:
- **TypeScript validation**: Full static type checking across all data interfaces.
- **Production build**: Optimized bundling and minification.
- **Vite**: Ultra-fast hot module replacement during development and Rollup-based production builds.

## Roadmap

Future improvements:
- Backend API integration
- WebSockets for real-time synchronization
- Authentication
- RBAC (Role-Based Access Control)
- Export reports
- PWA (Progressive Web App)
- Multi-airport support
- Predictive analytics

## Repository Information

**Repository Name**  
Airport-Operations-Control-Center

**Description**  
Enterprise-style Airport Operations Control Center (AOCC) for DEL Terminal 3 featuring a real-time simulation engine, incident management, operational dashboards, and cross-module analytics.

**Topics**  
`react`, `typescript`, `vite`, `tailwindcss`, `airport`, `dashboard`, `operations`, `analytics`, `simulation`, `aviation`, `aocc`, `enterprise-dashboard`, `recharts`, `papaparse`, `responsive-design`

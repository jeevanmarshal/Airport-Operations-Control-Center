# DEL Airport Operations Control Center (AOCC)
Indira Gandhi International Airport
Terminal 3 Operations Dashboard

The DEL Airport Operations Control Center (AOCC) is a comprehensive, simulated, single-pane-of-glass dashboard designed for enterprise airport management. It visualizes operational data across multiple distinct modules, allowing operations staff to monitor, investigate, and resolve issues in real-time.

## Overview

The AOCC application addresses the fragmentation of information in airport operations by aggregating data from various departments—flights, baggage, security, maintenance, and retail—into one unified platform. 
The system operates on a live-simulated operational dataset running from October 15, 2024, to December 30, 2024. The built-in simulation engine mimics real-time updates and automatically surfaces anomalies as alerts. Operations staff can navigate through specialized modules to investigate delays, manage bottlenecks, and ensure smooth terminal operations.

## Features

### Dashboard
Provides a high-level executive summary of terminal operations, presenting key performance indicators (KPIs) for active flights, passenger throughput, security queue wait times, and unresolved critical alerts. 

### Flights
Tracks real-time flight statuses, expected arrival and departure times, gate assignments, and delay metrics. Interactive data tables support sorting, searching, and filtering to isolate delayed or specific carrier flights.

### Gate Operations
Monitors gate utilization across Terminal 3 (Gates B1 through B50). Includes a visual gate map indicating occupancy and statuses, alongside an event log tracking aircraft docking, cleaning, and maintenance holds.

### Baggage
Monitors baggage handling performance, tracking transfer counts, oversize baggage processing, and potential handling delays or damages.

### Passenger Management
Visualizes passenger flow and satisfaction metrics. Provides demographics, frequent flyer statistics, and booking class distributions to optimize terminal resource allocation.

### Security
Tracks security lane throughput and peak hour efficiency. Identifies anomalies, flagged passengers, and processing bottlenecks across different screening zones.

### Maintenance
Logs aircraft and terminal maintenance work orders. Highlights Aircraft on Ground (AOG) situations, technician assignments, and repair durations.

### Staff
Monitors staff shifts, department allocations, and certification expirations. Ensures adequate coverage for peak operational hours.

### Retail
Tracks commercial performance across terminal retail zones. Analyzes transaction volumes, duty-free sales, and revenue generation metrics.

### Alert Center
A centralized incident management system. Automatically generates alerts based on simulation anomalies (e.g., flight delays, critical maintenance). Supports a full acknowledgment and resolution lifecycle.

### Simulation Engine
A real-time state machine that progresses time through a statically loaded dataset. Includes playback controls (Pause, 1x, 10x, 20x, 40x, 80x) to observe historical operations at varying speeds.

### Responsive Design
Features a fully responsive layout with collapsible sidebar navigation, scalable UI elements, and horizontal-scrolling data tables, ensuring usability across desktop, tablet, and mobile form factors.

## Technology Stack

- **Framework:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router DOM
- **Data Visualization:** Recharts
- **Icons:** Lucide React
- **Data Processing:** PapaParse
- **State Management:** React Context API, Custom Hooks (with localStorage persistence)

The application employs a modular folder architecture separating contexts, reusable UI components, routing, and domain-specific feature modules.

## Project Structure

```
src/
├── components/
│   ├── alerts/        # Alert Center and Feed components
│   ├── common/        # Reusable UI components (DataTables, KPIs, Modals)
│   ├── dashboard/     # High-level overview components
│   ├── flights/       # Flight tracking and detail panels
│   ├── gates/         # Gate mapping and event logs
│   ├── layout/        # AppShell, Sidebar, Header, StatusBar
│   └── retail/        # Commercial performance metrics
├── context/           # React Contexts (Data, Simulation, Alerts)
├── data/              # Static dataset parsing utilities
├── hooks/             # Custom React hooks (useLocalStorage)
├── router/            # React Router configuration
├── types/             # TypeScript interfaces and type definitions
├── utils/             # Formatters, helpers, and local storage utilities
├── App.tsx            # Application entry point
├── index.css          # Global Tailwind and custom CSS definitions
└── main.tsx           # React DOM renderer
```

## Responsive Design

The application is built with a mobile-first approach, scaling seamlessly up to large enterprise displays:
- **Desktop (1024px+):** Full multi-pane layouts with persistent sidebars and expansive data tables.
- **Tablet (768px+):** Collapsed auxiliary panels with optimized grid column counts.
- **Mobile (320px+):** Hamburger navigation, vertical stacking of KPI cards, and scrollable table containers.

## Simulation Engine

The core of the AOCC is a deterministic simulation engine running entirely in the client browser.
- **Simulation Clock:** Progresses time virtually from the dataset start date.
- **Speed Controls:** Operators can pause or accelerate time (1x, 10x, 20x, 40x, 80x).
- **Live Updates:** UI components react strictly to data filtered up to the `simulatedNow` timestamp.
- **Alert Generation:** Anomalies trigger alerts exactly when the simulated clock reaches the incident timestamp.

## Alert Lifecycle

The Alert Center implements a strict enterprise incident management workflow:
1. **Created:** Alert is generated by the simulation engine based on operational anomalies.
2. **Acknowledged:** Operator acknowledges the alert, removing it from the unacknowledged queue.
3. **Investigating:** Operator actively reviews related records and metadata.
4. **Resolved:** Operator manually marks the issue as resolved (or it auto-resolves if the underlying condition clears).
5. **Closed:** Resolved alerts are automatically archived after a set period.

## Cross Module Relationships

The AOCC emphasizes data interconnectedness:
- **Flights & Gates:** Gate assignments directly link to flight schedules and delays.
- **Passengers & Baggage:** Passenger records correlate with checked baggage throughput and potential security flags.
- **Maintenance & Flights:** Maintenance holds prevent aircraft departure, directly impacting flight status.
- **Alerts & All Modules:** The Alert Center serves as the connective tissue, surfacing critical events from any domain into a unified feed.

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Build Validation

The project enforces strict enterprise quality standards:
- **TypeScript Validation:** Full static type checking across all data interfaces.
- **Production Build:** Optimized bundling via Vite.
- **Browser Compatibility:** Ensures standard layout behavior across modern WebKit and Chromium engines.

## Architecture

- **Contexts:** Global state for static data, simulation clock, and active alerts.
- **Utilities:** Pure functions for date formatting, local storage interactions, and alert generation.
- **Components:** Modular, encapsulated UI elements preventing widespread re-renders.
- **Routing:** Centralized route configuration mapping URLs to lazy-loaded modules.
- **Data Loading:** Asynchronous CSV parsing on initialization via PapaParse.

## Local Storage

The application implements `localStorage` to persist non-sensitive user preferences and UI state across sessions:
- Active simulation speed
- Simulation pause/resume state

*(Note: Raw datasets, derived analytics, and simulation history are explicitly NOT persisted to storage to maintain performance and data integrity.)*

## Future Improvements

- Authentication and Role-Based Access Control (RBAC)
- Live backend integration via WebSocket streaming
- Exporting capability for operational reports
- Advanced analytics and predictive anomaly detection
- Offline mode with Progressive Web App (PWA) support

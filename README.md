# Indira Gandhi International Airport (DEL) — Terminal T3
## Airport Operations Control Center (AOCC) — Hackathon Finalist Submission

A production-quality, real-time Airport Operations Control Center (AOCC) web application that aggregates DEL Terminal T3 operational data (October 1, 2024 to December 30, 2024) across flights, baggage, passengers, security screening, maintenance, staff, and retail sales. The application provides unified operations tracking, interactive data visualization, dynamic real-time simulations, and exception handling alert tickers.

---

## 🚀 Getting Started

### Prerequisites
Make sure you have **Node.js (v18+)** and **npm** installed on your system.

### Installation
1. Clone the repository or open the project folder.
2. Run the following command to install dependencies:
   ```bash
   npm install
   ```

### Running Locally
To launch the developer mode server (hot-reloaded, port 3000):
```bash
npm run dev
```

### Production Build
To run TypeScript compiler checks and bundle the application into optimized static assets under the `dist/` directory:
```bash
npm run build
```
To preview the production build locally:
```bash
npm run preview
```

---

## 📁 Folder Structure

The project has been organized into a clean, modular structure:

```
src/
 ├── components/
 │    ├── common/          # Reusable UI elements (DataTable, KPICard, AlertFeed, DetailPanel, States)
 │    ├── layout/          # Global layout structure (AppShell, Header, Sidebar, StatusBar)
 │    ├── dashboard/       # Dashboard widgets, timeline, charts, status grid
 │    ├── flights/         # Flight list, filters, stats, detail panel
 │    ├── gates/           # Gate map grid, events log, gate detail panel
 │    ├── baggage/         # Baggage overview, filters, baggage detail panel
 │    ├── passengers/      # Passenger profiles, check-in, passenger detail panel
 │    ├── security/        # Lane throughput metrics cards, screenings audit log
 │    ├── maintenance/     # Aircraft work orders logs, defect tracking, hold banners
 │    ├── staff/           # Staff rosters, compliance warnings, shift details
 │    └── retail/          # duty-free transactions, Recharts transaction flows
 ├── hooks/                # Custom React hooks (useFilter, useDebounce)
 ├── context/              # Context stores (DataContext, SimulationContext, AlertContext)
 ├── utils/                # Calculations, formatters, CSV PapaParse wrappers, cross-joins
 ├── types/                # TypeScript Interfaces and Types
 ├── router/               # React Router configurations
 ├── App.tsx               # Main application container
 ├── main.tsx              # React mounting entry point
 └── index.css             # Base styles with custom CSS design variables and Tailwind CSS
```

---

## 🛠️ Technology Stack & Styling

- **Core Framework**: React 18 (TypeScript)
- **Bundler & Tooling**: Vite 5
- **Routing**: React Router DOM v6
- **Styling**: Vanilla CSS variable overrides + Tailwind CSS utility styling for maximum layout responsiveness.
- **Charts**: Recharts
- **Data Loading**: PapaParse CSV parser (asynchronous client-side chunk loading).
- **Icons**: Lucide React

### Color & Aesthetic Tokens (Dark cockpit interface)
- Base background color: `#0a0f1e`
- Accent highlights: `#00d4ff` (cyan)
- Alert warnings: `#ff6b35` (orange)
- Critical states: `#ff3366` (pink-red)
- Card surfaces: `#0d1b2a`

---

## 💡 Key Features Implemented

1. **Unified Operations Dashboard**:
   - At-a-glance KPI cards tracking Flights, On-Time %, Delayed Count, Total Passengers, and Active Alerts.
   - Live alert ticker feed showing real-time exceptions.
   - Dynamic charts tracking Flight Activity by Hour (line chart) and Delay Reasons (donut chart).
   - Module status cards summarizing health metrics across all departments.

2. **Flight Monitoring Module**:
   - Complete flight schedule view with column sorting, paging, search (by Flight ID, Airline, Destination), and filters.
   - Slide-out Flight Detail Panel with tabs showing: Passenger list, Baggage check-in logs, Gate events, Maintenance records, Retail transactions, and Assigned staff on duty.

3. **Gate Operations**:
   - Visual gate map grid covering all 50 gates (B1–B50) colored by active flight statuses.
   - Click a gate to filter the log of gate events or view the Gate Detail Panel containing assigned staff, current activities, and linked flight schedules.

4. **Baggage Handling**:
   - Tracks Checked Baggage, overweight anomalies (Economy >20kg, Business >32kg), and damaged items.
   - Full bag lifecycle audit drawer linking back to passenger details and flight statuses.

5. **Passenger Management**:
   - Demographics tracking (satisfaction scores, class upgrades, frequent flyer status, seat locations).
   - Passenger details drawer mapping their PNR checking events, baggage tags, and security lane logs.

6. **Security Lane Monitor**:
   - Interactive lane throughput metrics for all 8 security checkpoints (total screenings, clear rates, average processing speed).
   - Click a lane card to filter screening records. Alerts on flagged items or alarm triggers.

7. **Maintenance & Holds**:
   - Prominent header warning system reporting Ground Holds.
   - Work order severity level tracking, technican ID logs, defect logs, and aircraft AOG alerts.

8. **Staff Shift Compliance**:
   - Roster check mapping certifications and overtime hours.
   - Real-time certification validity warnings matching the active simulated clock.

9. **Commercial Retail Analytics**:
   - Duty Free transaction registers with analytics charts tracking transactions count and hourly revenue totals (INR) using Recharts.

10. **Incident Command Center (Alerts Page)**:
    - Centralized log of derived alerts sorted by severity (AOG critical items, technical delays, expired credentials, flagged passenger screenings).
    - Quick actions to acknowledge alerts or inspect/drill down directly to the original record with pre-applied filters.

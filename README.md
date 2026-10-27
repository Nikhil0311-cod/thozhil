# THOZHIL

**Work with dignity.**  
*Workforce Safety, Attendance & Pay Transparency Platform — Built for the FairShift Problem Statement under UN Sustainable Development Goal 8 (SDG 8): Decent Work and Economic Growth*

---

## 1. Problem Statement & SDG 8 Alignment

Across employee-intensive sectors such as **Construction** and **Manufacturing**, shift-based workforces still rely on fragmented paper registers, manual contractor spreadsheets, and informal messaging groups. This creates severe operational and human gaps:

- **For Shift Workers:**
  - **Opaque Pay & Uncounted Overtime:** Workers struggle to verify how regular hours, overtime multipliers, break deductions, and statutory deductions translate into take-home pay.
  - **Fear of Identification & Retaliation:** Workers hesitate to report unsafe scaffolding, bypassed machine guards, or electrical hazards when their identity is exposed.
  - **Unreported Workplace Hazards:** Safety risks remain unlogged or lack transparent status tracking until an injury occurs.
  - **Lost Career History:** Unrecorded shift experience and safety certifications force workers to restart from zero when changing sites or contractors.
  - **Language & Device Barriers:** Complex English-only dashboards alienate Tamil- and Hindi-speaking workers on entry-level mobile phones.

- **For Employers & Safety Officers:**
  - **Zero Real-Time Workforce Visibility:** Delayed awareness of excessive shift durations, insufficient inter-shift turnaround rest, and recurring overtime.
  - **Slow Hazard Escalation:** No structured lifecycle (`OPEN → ASSIGNED → IN_PROGRESS → RESOLVED`) with immutable audit trails.

**THOZHIL** (*"Work with dignity."*) bridges both sides through a dual-interface industrial operations platform (**Worker View** + **Admin View**) supporting **Construction** and **Manufacturing** workflows in **English**, **Tamil (`தமிழ்`)**, and **Hindi (`हिन्दी`)**.

---

## 2. Implemented Features

### Feature A: Attendance & Overtime (`src/services/attendanceService.ts`)
- Worker check-in and check-out with ISO timestamp recording.
- Blocks duplicate active check-ins for the same worker and rejects invalid check-out timestamps (e.g., check-out earlier than check-in or already finalized shifts).
- Configurable break deductions (`0–240 minutes`) and configurable standard/maximum shift thresholds.
- Automatically computes gross duration, net duration, regular hours, and overtime hours.
- Flags missing check-outs (`FLAGGED_MISSING_CHECKOUT`), zero-duration shifts (`FLAGGED_ZERO_DURATION`), and excessive single-shift hours (`FLAGGED_OVERTIME_REVIEW`) for human supervisor review—never silently altering timestamps.

### Feature B: Safety Reports (`src/services/incidentService.ts`)
- Industry-specific hazard categories for **Construction** (*Scaffold Instability, Missing PPE/Harness, Electrical Hazards, Unsafe Equipment*) and **Manufacturing** (*Missing Machine Guards, Chemical Spills & Fumes, Equipment & LOTO Hazards, Floor Slip & Ergonomic Overload*).
- Supports browser Speech Recognition (`ta-IN`, `hi-IN`, and `en-IN`) when available, with an explicit fallback notice, full text entry, and one-tap quick-phrase templates in English, Tamil, and Hindi when speech recognition is unsupported or denied.
- **Anonymous Reporting with Honest Privacy Protections:** When anonymous mode is enabled, `workerId` and `workerName` are unconditionally set to `null` in the saved record and redacted from supervisor views and audit logs. The worker receives a unique tracking code (`ANON-XXXX-XX`) to check resolution progress.
- **Structured Lifecycle & RBAC:** Enforces `OPEN → ASSIGNED → IN_PROGRESS → RESOLVED`. Only `admin` and `safety_officer` roles can assign officers, log corrective actions, or resolve incidents.
- **Mandatory Safety Disclaimer:** Prominently states that digital alerts do not guarantee physical safety or replace emergency stop/evacuation procedures.

### Feature C: Wage Insights (`src/services/wageService.ts`)
- Step-by-step arithmetic calculator in Indian Rupees (`₹ INR`, `en-IN` locale) showing Regular Earnings, Overtime Rate & Earnings, Gross Estimated Pay, Deductions, and Net Estimated Pay.
- Clearly labeled as an **illustrative estimate** to help workers verify recorded hours, not an official statutory payslip.
- **Attendance vs. Payroll Discrepancy Detector:** Automatically compares recorded attendance hours against payroll register entries and flags uncounted overtime for reconciliation.

### Feature D: Explainable Fatigue Alerts (`src/services/fatigueService.ts`)
- Rule-based, deterministic monitoring across four configurable thresholds:
  1. `EXCESSIVE_SHIFT_HOURS` (single shift exceeding configured max hours, default `10h`)
  2. `INSUFFICIENT_REST` (turnaround rest between consecutive shifts below minimum, default `11h`)
  3. `REPEATED_OVERTIME` (repeated overtime shifts reaching threshold, default `3 shifts`)
  4. `CONSECUTIVE_SHIFTS_LIMIT` (consecutive days worked exceeding limit, default `6 days`)
- Surfaced directly in both the **Worker View** (personal fatigue & rest alerts) and the **Admin View** (workforce fatigue queue). Every alert explains why it was triggered, cites the exact attendance record IDs, and allows authorized managers to acknowledge and log welfare follow-up notes.

### Feature E: Operations & Safety Dashboard (`src/components/admin/AdminDashboard.tsx`)
- Restrained, high-contrast operational layout with structured tables, status badges, and compact queues.
- All summary KPI cards (*Active Workers, Overtime Hours, Fatigue Flags, Open Incidents, Critical/High Hazards, Avg Resolution Time*) are derived dynamically from live/seeded records—never hardcoded.
- Operational filters by **Industry**, **Worksite/Plant**, **Department**, **Shift**, and **Date Window**.
- Structured **Workforce Attendance & Overtime Register** table, visual distribution bars, and Hazard Lifecycle breakdown.

### Feature F: Risk & Payroll Audit (`src/services/riskEngineService.ts`)
- Deterministic, explainable rule engine connecting unresolved hazards, recurring department hazard clusters, unacknowledged fatigue violations, missing check-outs, and payroll discrepancies.
- Displays the exact scoring formula breakdown (`Base + Age + Unassigned`), why each alert was generated, and a concrete suggested next action.

### Feature G: Shift Simulator (`src/services/riskEngineService.ts`)
- Allows managers to compare two proposed weekly schedules (*Plan A: Compressed Overtime Roster* vs. *Plan B: Balanced Relief Rotation*) with interactive shift-hour sliders.
- Projects overtime hours, rest-period violations, consecutive-shift flags, and daily staffing coverage without overwriting live schedules.

### Feature H: Skills Passport
- Displays verified completed shift counts and trade/safety certifications in English, Tamil, and Hindi so workers maintain a portable work history.

---

## 3. Technology Stack & Architecture

- **Frontend:** React 18, TypeScript 5, Vite 6, Tailwind CSS 3, React Router 7, Lucide Icons
- **Localization:** Built-in trilingual dictionary (`en`, `ta`, `hi`) with `localStorage` language persistence (`src/i18n/translations.ts`)
- **Testing:** Vitest 3, React Testing Library, `@testing-library/user-event`, JSDOM
- **Persistence Architecture (`src/services/repository.ts` & `firestore.rules`):**
  - **Local Demo Mode (Default when cloud credentials are not provided):** Explicitly labeled in the UI banner. Persists state and language selection in browser `localStorage` with seeded Construction and Manufacturing scenarios and a one-click **Reset Seed Data** button.
  - **Cloud Firestore Mode:** Activated when `VITE_APP_MODE=firebase` and valid `VITE_FIREBASE_PROJECT_ID` / `VITE_FIREBASE_API_KEY` environment variables are configured, backed by database-level role and privacy rules in `firestore.rules`.
- **Production Container (`Dockerfile` & `server.mjs`):** Multi-stage Node 20 Alpine image serving static assets and SPA route fallbacks on `0.0.0.0:$PORT` with `/healthz` health check endpoint for **Google Cloud Run**.

---

## 4. Local Installation, Setup & Verification

### Prerequisites
- Node.js `v20+` (or `v24+`) and `npm`

### Commands
```bash
# 1. Install dependencies
npm install

# 2. Start local development server (http://localhost:5173)
npm run dev

# 3. Run TypeScript type checking
npm run typecheck

# 4. Run automated unit & workflow test suite
npm test

# 5. Build production bundle
npm run build

# 6. Start production Cloud Run server locally (http://0.0.0.0:8080)
npm start
```

---

## 5. How to Test Both Industry Demo Scenarios

### Scenario A: Construction Sector (`Construction` button in top bar)
1. In **Worker View** (`/worker`), select worker **Murugan Selvaraj (`CON-CH-104`)** at *Chennai Metro Phase-II Corridor 4 Site*.
2. Click **Start Shift Check-In**, then click **Complete Shift Check-Out** to verify attendance and overtime logging, and inspect personal **Fatigue & Rest Alerts**.
3. Open **Safety Reports**, select **Scaffold Instability** (`CRITICAL`), choose a quick template or enter a description, optionally toggle **Submit Anonymously**, and click **Submit Safety Report**. Note the generated Report ID and Tracking Code.
4. Switch to **Admin View** (`/admin`) → **Safety Incidents** tab.
5. Locate the open scaffold incident (`INC-CON-101` or your newly created report):
   - Assign **Er. Karthikeyan Subramanian** (`OPEN → ASSIGNED`).
   - Enter a physical corrective action and advance to `IN_PROGRESS`.
   - Enter resolution verification notes and advance to `RESOLVED`.
6. Switch back to **Worker View** → **Safety Reports** and search the Report ID or Tracking Code to inspect the updated `RESOLVED` status and resolution notes.

### Scenario B: Manufacturing Sector (`Manufacturing` button in top bar)
1. Click **Manufacturing** in the top bar. In **Worker View**, worker **Lakshmi Narayanan (`MFG-OR-302`)** at *Oragadam Precision Stamping & Assembly Plant* is selected.
2. Check in and check out with the `10.5 Net Hours (8h Regular + 2.5h Overtime)` selector to observe automatic overtime calculation.
3. Open **Wage Insights** to inspect the transparent INR breakdown (`Regular Pay + 2.0x Overtime Pay − Deductions = Net Pay`) and view the flagged **Attendance vs. Payroll Check**.
4. Open **Safety Reports** and report a **Missing Machine Guards** (`CRITICAL`) incident on *Heavy Hydraulic Press Line 3*.
5. Switch to **Admin View** (`/admin`) to inspect updated KPIs, the **Workforce Attendance & Overtime Register** table, **Fatigue & Hours** rules, **Risk & Payroll Audit**, and the **Shift Simulator**.
6. Click **English | தமிழ் | हिन्दी** in the top-right header at any time to verify full trilingual support across both interfaces.

---

## 6. Environment Variables (`.env.example`)

| Variable | Description | Default |
|---|---|---|
| `VITE_APP_MODE` | Persistence mode (`demo` or `firebase`) | `demo` |
| `VITE_FIREBASE_API_KEY` | Firebase Web API key (optional) | Placeholder |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain (optional) | Placeholder |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Cloud Firestore project ID (optional) | Placeholder |
| `PORT` | HTTP listening port for `server.mjs` in Cloud Run | `8080` |

---

## 7. Security, Privacy & Known Limitations

- **Role Separation:** `incidentService.ts` and `fatigueService.ts` explicitly validate `UserRole` (`worker`, `admin`, `safety_officer`) before permitting assignments, status transitions, fatigue acknowledgements, or policy edits. You can test RBAC enforcement live in the Admin header by switching the session role to `Worker Role` and observing that mutations are blocked.
- **Anonymous Reporting Privacy:** Anonymous reports strip `workerId` and `workerName` (`null`) prior to storage and generate a non-identifying tracking code (`ANON-XXXX-XX`).
- **Known Limitations:**
  - When deployed without external Firebase project credentials, the application runs in **Local Demo Mode** using browser `localStorage`. `localStorage` is per-browser and is not a multi-user production database; this is explicitly disclosed in the UI banner.
  - Browser voice dictation relies on the Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`), which is supported in Chromium-based browsers and requires microphone permission; standard text input and one-tap quick phrases in English, Tamil, and Hindi are always available as a deterministic fallback.

---

## 8. Google Cloud Run Deployment Guide

Google Cloud Run is the mandatory production host (no Vercel or Netlify links).

### Build & Deploy to Google Cloud Run (Single Command from Source)
```bash
gcloud run deploy thozhil \
  --source . \
  --region asia-south1 \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars="NODE_ENV=production,VITE_APP_MODE=demo"
```

### Cloud Run Health Verification Checklist
1. Verify container binds to `0.0.0.0:$PORT` (`8080`).
2. Probe health endpoint:
   ```bash
   curl -i https://YOUR_CLOUD_RUN_SERVICE_URL/healthz
   ```
   Expected response: `HTTP/1.1 200 OK` with `{"status":"ok","service":"thozhil","tagline":"Work with dignity.","sdg":"UN SDG 8 - Decent Work and Economic Growth",...}`.
3. Open `https://YOUR_CLOUD_RUN_SERVICE_URL/worker` and `https://YOUR_CLOUD_RUN_SERVICE_URL/admin` directly in a browser to verify SPA client-side routing fallback.

---

## 9. License

MIT License — see [LICENSE](./LICENSE).

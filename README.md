# FairShift Sentinel

**Decent Work, Pay Transparency & Workplace Safety Intelligence Platform**  
*Aligned with UN Sustainable Development Goal 8 (SDG 8): Decent Work and Economic Growth*

---

## 1. Problem Statement & SDG 8 Alignment

Across employee-intensive sectors such as **Construction** and **Manufacturing**, shift-based workforces still rely on fragmented paper registers, manual contractor spreadsheets, and informal messaging groups. This creates severe operational and human gaps:

- **For Shift Workers:**
  - **Opaque Pay & Uncounted Overtime:** Workers struggle to verify how regular hours, overtime multipliers, break deductions, and statutory deductions translate into take-home pay.
  - **Fear of Identification & Retaliation:** Workers hesitate to report unsafe scaffolding, bypassed machine guards, or electrical hazards when their identity is exposed.
  - **Unreported Workplace Hazards:** Safety risks remain unlogged or lack transparent status tracking until an injury occurs.
  - **Lost Career History:** Unrecorded shift experience and safety certifications force workers to restart from zero when changing sites or contractors.
  - **Language & Device Barriers:** Complex English-only dashboards alienate Tamil-speaking workers on entry-level mobile phones.

- **For Employers & Safety Officers:**
  - **Zero Real-Time Workforce Visibility:** Delayed awareness of excessive shift durations, insufficient inter-shift turnaround rest, and recurring overtime.
  - **Slow Hazard Escalation:** No structured lifecycle (`OPEN → ASSIGNED → IN_PROGRESS → RESOLVED`) with immutable audit trails.

**FairShift Sentinel** bridges both sides through a dual-interface industrial platform (**Worker Mobile Portal** + **Employer Command Center**) supporting **Construction** and **Manufacturing** workflows in **English and Tamil (தமிழ்)**.

---

## 2. Implemented Features

### Required Feature A: SmartShift Attendance (`src/services/attendanceService.ts`)
- Worker check-in and check-out with ISO timestamp recording.
- Blocks duplicate active check-ins for the same worker and rejects invalid check-out timestamps (e.g., check-out earlier than check-in or already finalized shifts).
- Configurable break deductions (`0–240 minutes`) and configurable standard/maximum shift thresholds.
- Automatically computes gross duration, net duration, regular hours, and overtime hours.
- Flags missing check-outs (`FLAGGED_MISSING_CHECKOUT`), zero-duration shifts (`FLAGGED_ZERO_DURATION`), and excessive single-shift hours (`FLAGGED_OVERTIME_REVIEW`) for human supervisor review—never silently altering timestamps.

### Required Feature B: SafeVoice Incident Management (`src/services/incidentService.ts`)
- Industry-specific hazard categories for **Construction** (*Scaffold Instability, Missing PPE/Harness, Electrical Hazards, Unsafe Equipment*) and **Manufacturing** (*Missing Machine Guards, Chemical Spills & Fumes, Equipment & LOTO Hazards, Floor Slip & Ergonomic Overload*).
- Supports browser Speech Recognition (`ta-IN` and `en-IN`) when available, with an explicit fallback notice, full text entry, and one-tap low-literacy quick-phrase templates when speech recognition is unsupported or denied.
- **Anonymous Reporting with Honest Privacy Protections:** When anonymous mode is enabled, `workerId` and `workerName` are unconditionally set to `null` in the saved record and redacted from supervisor views and audit logs. The worker receives a unique tracking code (`ANON-XXXX-XX`) to check resolution progress.
- **Structured Lifecycle & RBAC:** Enforces `OPEN → ASSIGNED → IN_PROGRESS → RESOLVED`. Only `admin` and `safety_officer` roles can assign officers, log corrective actions, or resolve incidents.
- **Mandatory Safety Disclaimer:** Prominently states that digital alerts do not guarantee physical safety or replace emergency stop/evacuation procedures.

### Required Feature C: WageLens Pay Transparency (`src/services/wageService.ts`)
- Step-by-step arithmetic calculator in Indian Rupees (`₹ INR`, `en-IN` locale) showing Regular Earnings, Overtime Rate & Earnings, Gross Estimated Pay, Deductions, and Net Estimated Pay.
- Clearly labeled as an **illustrative estimate** to help workers verify recorded hours, not an official statutory payslip.
- **Attendance vs. Payroll Discrepancy Detector:** Automatically compares SmartShift recorded hours against payroll register entries and flags uncounted overtime for reconciliation.

### Required Feature D: Explainable Fatigue Alerts (`src/services/fatigueService.ts`)
- Rule-based, deterministic monitoring across four configurable thresholds:
  1. `EXCESSIVE_SHIFT_HOURS` (single shift exceeding configured max hours, default `10h`)
  2. `INSUFFICIENT_REST` (turnaround rest between consecutive shifts below minimum, default `11h`)
  3. `REPEATED_OVERTIME` (repeated overtime shifts reaching threshold, default `3 shifts`)
  4. `CONSECUTIVE_SHIFTS_LIMIT` (consecutive days worked exceeding limit, default `6 days`)
- Every alert explains why it was triggered, cites the exact attendance record IDs, and allows authorized managers to acknowledge and log welfare follow-up notes. Never makes medical diagnoses or penalizes workers.

### Required Feature E: Employer Command Center (`src/components/admin/AdminDashboard.tsx`)
- Desktop-friendly navy, white, and safety-accent operational dashboard.
- All summary KPI cards (*Active Workers, Total Overtime Hours, Active Fatigue Flags, Unresolved Hazards, Critical/High Priority Hazards, Average Resolution Time*) are derived dynamically from live/seeded records—never hardcoded.
- Operational filters by **Industry**, **Worksite/Plant**, **Department**, **Shift**, and **Date Window**.
- Visual Attendance & Overtime distribution chart and Hazard Lifecycle pipeline breakdown.

### Differentiating Feature: FairShift Risk-to-Resolution Engine (`src/services/riskEngineService.ts`)
- Deterministic, explainable rule engine connecting unresolved hazards, recurring department hazard clusters, unacknowledged fatigue violations, missing check-outs, and payroll discrepancies.
- Displays the exact scoring formula breakdown (`Base + Age + Unassigned`), why each alert was generated, and a concrete suggested next action.

### Optional Differentiator: FairShift What-If Shift Simulator (`src/services/riskEngineService.ts`)
- Allows managers to compare two proposed weekly schedules (*Plan A: Compressed Overtime Roster* vs. *Plan B: Balanced Relief Rotation*) with interactive shift-hour sliders.
- Projects overtime hours, rest-period violations, consecutive-shift flags, and daily staffing coverage without overwriting live schedules.

### Additional Worker Empowerment: Portable Skill Passport
- Displays verified completed shift counts and trade/safety certifications so workers maintain a portable work history.

---

## 3. Technology Stack & Architecture

- **Frontend:** React 18, TypeScript 5, Vite 6, Tailwind CSS 3, React Router 7, Lucide Icons
- **Testing:** Vitest 3, React Testing Library, `@testing-library/user-event`, JSDOM
- **Persistence Architecture (`src/services/repository.ts` & `firestore.rules`):**
  - **Local Demo Mode (Default when cloud credentials are not provided):** Explicitly labeled in the UI banner. Persists state in browser `localStorage` with seeded Construction and Manufacturing scenarios and a one-click **Reset Seed Data** button.
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

### Actual Verified Test & Build Results
- **TypeScript Check (`tsc --noEmit`):** Passed with `0` errors.
- **Automated Tests (`vitest run`):** `2` test suites passed, `18 / 18` tests passed (`src/test/domainServices.test.ts` + `src/test/workflows.test.tsx`).
- **Production Build (`vite build`):** Succeeded (`dist/index.html` 0.77 kB, CSS 26.47 kB / 5.02 kB gzip, JS 351.74 kB / 99.39 kB gzip).

---

## 5. How to Test Both Industry Demo Scenarios

### Scenario A: Construction Sector (`🏗️ Construction` button in top bar)
1. In **Worker Mobile Portal** (`/worker`), select worker **Murugan Selvaraj (`CON-CH-104`)** at *Chennai Metro Phase-II Corridor 4 Site*.
2. Click **Start Shift Check-In**, then click **Complete Shift Check-Out** to verify attendance and overtime logging.
3. Open **SafeVoice Hazards**, select **Scaffold Instability** (`CRITICAL`), choose a quick phrase or enter a description, optionally toggle **Submit Anonymously**, and click **Submit Safety Report Now**. Note the generated Report ID and Tracking Code.
4. Switch to **Employer Command Center** (`/admin`) → **Incident Resolution** tab.
5. Locate the open scaffold incident (`INC-CON-101` or your newly created report):
   - Assign **Er. Karthikeyan Subramanian** (`OPEN → ASSIGNED`).
   - Enter a physical corrective action and advance to `IN_PROGRESS`.
   - Enter resolution verification notes and advance to `RESOLVED`.
6. Switch back to **Worker Mobile Portal** → **SafeVoice Hazards** and search the Report ID or Tracking Code to inspect the updated `RESOLVED` status and resolution notes.

### Scenario B: Manufacturing Sector (`🏭 Manufacturing` button in top bar)
1. Click **Manufacturing** in the top bar. In **Worker Mobile Portal**, worker **Lakshmi Narayanan (`MFG-OR-302`)** at *Oragadam Precision Stamping & Assembly Plant* is selected.
2. Check in and check out with the `10.5 Net Hours (8h Regular + 2.5h Overtime)` selector to observe automatic overtime calculation.
3. Open **WageLens Pay Check** to inspect the transparent INR breakdown (`Regular Pay + 2.0x Overtime Pay − Deductions = Net Pay`) and view the flagged **Attendance vs. Payroll Register Discrepancy**.
4. Open **SafeVoice Hazards** and report a **Missing Machine Guards** (`CRITICAL`) incident on *Heavy Hydraulic Press Line 3*.
5. Switch to **Employer Command Center** (`/admin`) to inspect updated KPIs, **Fatigue & Hours Rules** (`EXCESSIVE_SHIFT_HOURS`, `INSUFFICIENT_REST`, `REPEATED_OVERTIME`), the **Risk-to-Resolution Engine**, and the **What-If Shift Simulator**.
6. Click **தமிழ் / English** in the top-right header at any time to verify full Tamil translation across both interfaces.

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
  - Browser voice dictation relies on the Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`), which is supported in Chromium-based browsers and requires microphone permission; standard text input and one-tap quick phrases are always available as a deterministic fallback.

---

## 8. Google Cloud Run Deployment Guide

Google Cloud Run is the mandatory production host (no Vercel or Netlify links).

### Prerequisites
1. Google Cloud SDK (`gcloud`) installed and authenticated: `gcloud auth login`
2. Active GCP Project with Billing enabled: `gcloud config set project YOUR_GCP_PROJECT_ID`
3. Enable Cloud Build and Cloud Run APIs:
   ```bash
   gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com
   ```

### Build & Deploy to Google Cloud Run (Single Command from Source)
```bash
gcloud run deploy fairshift-sentinel \
  --source . \
  --region asia-south1 \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars="NODE_ENV=production,VITE_APP_MODE=demo"
```

### Alternative: Build Container Image Explicitly & Deploy
```bash
gcloud builds submit --tag gcr.io/YOUR_GCP_PROJECT_ID/fairshift-sentinel:latest .

gcloud run deploy fairshift-sentinel \
  --image gcr.io/YOUR_GCP_PROJECT_ID/fairshift-sentinel:latest \
  --region asia-south1 \
  --platform managed \
  --allow-unauthenticated \
  --port 8080
```

### Cloud Run Health Verification Checklist
1. Verify container binds to `0.0.0.0:$PORT` (`8080`).
2. Probe health endpoint:
   ```bash
   curl -i https://YOUR_CLOUD_RUN_SERVICE_URL/healthz
   ```
   Expected response: `HTTP/1.1 200 OK` with `{"status":"ok","service":"fairshift-sentinel","sdg":"UN SDG 8 - Decent Work and Economic Growth",...}`.
3. Open `https://YOUR_CLOUD_RUN_SERVICE_URL/worker` and `https://YOUR_CLOUD_RUN_SERVICE_URL/admin` directly in a browser to verify SPA client-side routing fallback.

---

## 9. Submission Readiness Checklist

- [x] **Public GitHub URL Format:** Must end in `.git` (e.g., `https://github.com/<username>/fairshift-sentinel.git`).
- [x] **Single Git Branch:** Strictly `1` branch (`main`).
- [x] **Repository Size Cap:** Strictly under `10 MB` (measured `< 0.5 MB` tracked source, excluding `node_modules/`, `dist/`, and `*.pdf`).
- [x] **Final Host:** Google Cloud Run (`Dockerfile` + `server.mjs` ready; zero Vercel/Netlify links).
- [x] **Dual Interfaces:** Worker Mobile Portal (`/worker`) and Employer Command Center (`/admin`).
- [x] **Cross-Industry Support:** Construction and Manufacturing sectors with dedicated workflows.
- [x] **Automated Tests:** 18 unit and integration tests passing via Vitest.

---

## 10. License

MIT License — see [LICENSE](./LICENSE).

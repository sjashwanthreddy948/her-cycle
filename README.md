# HerCycle 🌸

> **"Understand her cycle. Support her better."**

HerCycle is a production-ready, mobile-first women's menstrual cycle tracking web application and Progressive Web App (PWA). Designed with a premium feminine wellness aesthetic inspired by modern wellness apps, HerCycle allows women to track their menstrual rhythm privately, and securely share only what they choose with their partner through zero-leakage read-only access.

---

## 🌟 Visual & Design System

- **Background Palette**: Soft blush and pastel pink gradients (`#FFF5F7`, `#FDF2F4`, `#FCE8EE`)
- **Card Styling**: Crisp white rounded cards (`border-radius: 20px–28px`) with soft rose drop-shadows
- **Circular Cycle Visualization**: Outer clock ring with ticks, color-coded phase arcs (Menstrual pink, Follicular soft rose, Ovulation amber, Luteal violet), and central countdown
- **Typography**: Clean, elegant Google Fonts (`Plus Jakarta Sans` and `Outfit`)
- **Mobile-First UX**: Responsive at 390px (iPhone / Android) with thumb-friendly controls, safe-area insets, and docked bottom navigation

---

## 🔑 Seeded Demo Accounts

HerCycle comes pre-seeded with **5–6 months of realistic cycle history** for immediate interactive testing.

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Woman Demo (Sarah)** | `demo.woman@hercycle.app` | `Demo@12345` | Day 12 of 28 (Follicular Phase), 5 logged cycles, daily logs, symptom patterns |
| **Partner Demo (Alex)** | `demo.partner@hercycle.app` | `Demo@12345` | Paired to Sarah with `HER-789`, read-only view with Standard Care sharing enabled |

> 💡 **Quick Switcher**: Click the **"Switch to Alex / Sarah"** pill in the top navigation bar at any time to instantly switch between the Woman and Partner portals without logging out!

---

## 🚀 Key Features

### 1. Woman Portal
- **Home Dashboard**:
  - Circular cycle ring showing cycle day, current phase, and estimated period arrival
  - Non-medical current status card grounded in logged history
  - Quick stat cards: Next Period, Cycle Day, Average Cycle Length, Average Period Length
  - Partner sharing status pill
  - Today's Check-in: Mood (5 levels), Energy (3 levels), Period Flow (None, Light, Medium, Heavy), Symptoms, Sleep hours, Water glasses, Weight, and Notes
  - Menstrual cycle phases cards (Menstrual, Follicular, Ovulation, Luteal)
- **Dedicated Quick Log** (`/woman/log`):
  - Day stepper (`< Previous Day | TODAY | Next Day >`)
  - Period start/end switches & flow intensity drops
  - Circular symptom chips (Cramps, Headache, Bloating, Fatigue, Breast Tenderness, etc.)
- **Monthly Menstrual Calendar** (`/woman/calendar`):
  - Color-coded days: Pink (Period), Light pink dashed (Predicted period), Purple (Fertile window)
  - Activity indicators for mood, symptoms, and notes
  - Interactive Day Detail Sheet with direct log editing
- **Cycle Insights & Charts** (`/woman/insights`):
  - Cycle Length History (Line chart over past cycles)
  - Period Duration History (Bar chart)
  - Symptom Frequency (Horizontal bar chart)
  - Mood Distribution (Percentage cards)
- **Cycle Phases Guide** (`/woman/phases`):
  - Biology and hormonal shifts for all 4 phases
  - Nutrition, exercise, and restorative self-care suggestions
- **Partner Sharing Controls** (`/woman/partner`):
  - 6-character connection code generator (e.g. `HER-789`) & QR invitation
  - Request approval workflow (Approve / Decline)
  - Presets: Basic Support, Standard Care, and Custom
  - Granular switches for cycle day, phase, period status, next period, mood, energy, symptoms, flow, and sleep
  - Private journal and weight are locked by default
  - Pause Sharing switch & Remove Partner option
- **Privacy Center** (`/woman/privacy`):
  - Export complete data as JSON
  - Export daily logs as CSV spreadsheet
  - Permanent data deletion
  - Health & data ownership guarantees

### 2. Partner Portal
- **Partner Dashboard** (`/partner/home`):
  - Personalized greeting: "Hi Alex"
  - Sarah's current cycle card (only showing permitted information)
  - "How can you support Sarah?" phase-specific empathy & wellness tips
  - Shared mood and energy ratings
  - Strict data masking: unshared items show "Sarah hasn't shared this information" (zero frontend leakage)
- **Partner Read-Only Calendar** (`/partner/calendar`):
  - View only approved period and mood milestones
- **Partner Support Hub** (`/partner/support`):
  - Comprehensive guide for partners on cycle biology, emotional empathy, and practical ways to help
- **Partner Profile & Settings** (`/partner/profile`):
  - View pairing status, permission summary, and notification preferences

---

## 🔒 Security & Privacy Architecture

1. **Read-Only Partner Access**: Partners can never insert, update, or delete any health records.
2. **Explicit Connection Approval**: A partner entering a 6-digit code must be approved by the woman before any data becomes visible.
3. **Database-Level Masking**: In both Supabase and the built-in persistent storage engine, query responses are filtered through authorization rules before dispatching to the client.
4. **Row Level Security (RLS)**: Full PostgreSQL migration provided in `supabase/schema.sql`.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Routing**: React Router DOM v7
- **Icons**: Lucide React
- **Build System**: Vite 8
- **Database Engine**:
  - Cloud: PostgreSQL + Supabase Client (`@supabase/supabase-js`)
  - Local/Preview: Full-fidelity localStorage database engine with seeded demo accounts and RLS emulation
- **PWA**: Web App Manifest (`manifest.json`), service icons, and viewport-fit support

---

## 📦 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Run Production Build
```bash
npm run build
```

### 4. Run Core Assertions Test Suite
```bash
npx tsx tests/verify-core.ts
```

---

## ☁️ Supabase Cloud Configuration (Optional)

To connect HerCycle to your own live Supabase project:
1. Create a project on [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in Supabase and paste the contents of `supabase/schema.sql`.
3. Create a `.env` file in the project root:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
4. Start the app. When configured, HerCycle communicates directly with your Supabase database. When unconfigured, it operates seamlessly on its persistent local engine.

---

## 🚀 Deploying to Vercel

HerCycle is ready for zero-config Vercel deployment:
```bash
npx vercel
```
Or connect your GitHub repository to Vercel and set:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

---

## 🩺 Medical Disclaimer

HerCycle provides tracking and estimates based on information you enter. It is not a medical device and should not be used to diagnose conditions or as a method of contraception. For medical concerns, consult a qualified healthcare professional.

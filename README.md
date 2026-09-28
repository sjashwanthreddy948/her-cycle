# HerCycle 🌸

> **"Understand her cycle. Support her better."**

HerCycle is a production-grade, privacy-first menstrual cycle tracking web application and Progressive Web App (PWA). Built with React 19, TypeScript, Vite, Tailwind CSS, React Router 7, Three.js, React Three Fiber, and Supabase PostgreSQL.

HerCycle allows women to track their menstrual rhythm privately, and safely share only what they choose with their partner through zero-leakage, read-only partner views.

---

## 🌟 Visual & 3D Wellness Design System

- **3D Interactive Cycle Ring**: Built with Three.js and `@react-three/fiber`, featuring segmented torus rings in the 4 physiological phase colors, a pulsating day marker, and floating ambient particles.
- **Performance & Accessibility**:
  - Lazy-loaded 3D Canvas via `React.lazy` and `Suspense` for instantaneous first paint.
  - Automatic static conic-gradient fallback when WebGL is unavailable or when `prefers-reduced-motion` is active.
  - Device pixel ratio capped at 2 (`dpr={[1, 2]}`) to protect mobile battery and GPU.
  - Frame rendering pauses automatically when the browser tab is hidden.
- **Design Aesthetic**: Apple Health x Oura aesthetic — soft blush tones, glassmorphism (`backdrop-blur-md`), rose glow shadows, `Outfit` font for headings, and `Plus Jakarta Sans` for body copy.
- **Mobile-First UX**: Responsive at 390px (iPhone / Android) with thumb-friendly controls, safe-area insets (`viewport-fit=cover`), and docked bottom navigation.

---

## 🛡️ Security Architecture & Threat Model

HerCycle operates exclusively on **Supabase PostgreSQL** with strict server-enforced security policies:

### 1. Zero Fake Auth & Clean Database
- All demo fallbacks and mock localStorage database engines have been removed.
- The app connects directly to Supabase (`@supabase/supabase-js`). If environment variables are missing, a secure "Backend Not Configured" screen is displayed.

### 2. Immutable User Roles
- Roles (`woman` | `partner`) are set once upon registration.
- An immutable trigger (`enforce_immutable_profile_role`) in PostgreSQL prevents clients from changing roles.
- Role-based route guards strictly enforce that partners cannot open `/woman/*` and women cannot open `/partner/*`.

### 3. Single Active Session Enforcement
- Each login registers an active session ID in the `active_sessions` PostgreSQL table.
- The app checks every 60 seconds and on tab focus. If the account is opened on another device, the previous session is immediately signed out with: *"You were signed out because your account was opened on another device."*

### 4. Case-Insensitive Unique Accounts
- Email addresses use PostgreSQL `CITEXT` with a unique index on `lower(email)`. Duplicate signups are rejected with a friendly message.
- Minimum password length is enforced at 10 characters.

### 5. Cryptographic Server-Generated Partner Codes & Single-Use Enforcement
- Codes follow the format `HER-XXXXXX` using uppercase letters (excluding ambiguous `I` and `O`) and numbers `2-9`.
- Codes are generated exclusively by a `SECURITY DEFINER` Postgres function (`generate_partner_code`) using `gen_random_bytes(6)` with collision retries.
- Partial unique index ensures only one active, unused code per woman at any time.
- **Strict Single-Use & Instant Expiration**: When a partner enters the code, `redeem_partner_code` atomically locks the row (`FOR UPDATE`), verifies it has not been used or expired, marks `used = TRUE`, and sets `expires_at = NOW()`.
- **Zero Reuse by Another Person**: Once entered, the code is immediately expired in the database. Any subsequent attempt by another person to enter the code is strictly rejected with *"This connection code has expired or has already been used. Each code is single-use and cannot be used again by another person."*
- Regenerating a code automatically expires previous unused codes.

### 6. Rate-Limiting & Strict 1:1 Partner Links
- Failed pairing attempts are recorded in `code_attempts` and rate-limited to a maximum of 5 attempts per 15 minutes per user.
- A woman can have at most one partner, and a partner can be linked to at most one woman (`UNIQUE(woman_id)`, `UNIQUE(partner_id)`, and `CHECK(woman_id <> partner_id)`).

### 7. Row Level Security (RLS) & Zero-Leakage Partner View
- RLS is enabled on all tables (`profiles`, `daily_logs`, `period_logs`, `partner_links`, etc.).
- Partners have **zero direct access** to `daily_logs` or `period_logs`.
- Partners query only through the `partner_view` database view, which returns only fields explicitly toggled ON in the woman's sharing permissions and only when connection status is `approved`.
- **Private journal notes and weight are completely excluded from the partner view and can never reach the partner's device.**
- Unshared fields display *"She hasn't shared this"*.

### 8. Full Cascading Account Deletion
- Account deletion executes through a `SECURITY DEFINER` database function (`delete_user_account()`) that permanently cascades and wipes all profile, health, link, session, and log data.

### 9. Production HTTP Security Headers
Configured in `vercel.json`:
- `Content-Security-Policy`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`

---

## 🚀 Setup & Migration Guide

### 1. Environment Configuration
Create a `.env` file in the project root (see `.env.example`):

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 2. Apply Database Migration
Open your Supabase dashboard:
1. Navigate to **SQL Editor** -> **New Query**.
2. Copy the entire contents of `supabase/migrations/20260929000000_hardening.sql` (or `supabase/schema.sql`).
3. Click **Run** to execute the migration.

This script sets up:
- Extensions: `pgcrypto`, `citext`, `uuid-ossp`
- Tables: `profiles`, `active_sessions`, `cycle_profiles`, `period_logs`, `daily_logs`, `partner_codes`, `partner_links`, `code_attempts`, `sharing_permissions`
- Triggers: Immutable role enforcement
- Functions: `generate_partner_code()`, `redeem_partner_code()`, `delete_user_account()`
- Secure Views: `partner_view`
- Row Level Security (RLS) policies for all tables

### 3. Local Development
```bash
npm install
npm run dev
```

### 4. Running Verification Test Suites
Run the core engine and security verification suites:
```bash
npx tsx tests/verify-core.ts
npx tsx tests/verify-security.ts
```

### 5. Production Build & Lint
```bash
npm run lint
npm run build
```

---

## 📱 Application Routes

### Public Routes
- `/`: Public 3D landing page with interactive cycle ring and original vector artwork
- `/login`: Secure user & partner sign-in
- `/register`: Multi-step onboarding (role selection, age 10–100, min 10-char password, baseline rhythm)
- `/forgot-password`: Password reset request

### Woman Portal (`/woman/*`, protected)
- `/woman/home`: Personal 3D home with 4 scroll sections (3D Ring Hero, Next Period countdown, Health Condition Today, Partner Sharing controls, and Today's Check-in)
- `/woman/calendar`: Full interactive menstrual calendar with symptoms and phase markers
- `/woman/log`: Quick daily log (flow, mood, energy, symptoms, sleep, water, weight, notes)
- `/woman/insights`: Historical cycle trends, period durations, and symptom frequencies
- `/woman/phases`: Educational guide to the 4 phases (Menstrual, Follicular, Ovulation, Luteal)
- `/woman/partner`: Granular partner sharing switches, code generation, and connection controls
- `/woman/privacy`: Data export (JSON, CSV) and permanent account deletion
- `/woman/profile`: Cycle baseline parameters and profile details

### Partner Portal (`/partner/*`, protected)
- `/partner/home`: Read-only synced dashboard showing permitted cycle day, phase, and empathy tips
- `/partner/calendar`: Read-only calendar with permitted milestones
- `/partner/support`: Practical partner guidance and empathy tips
- `/partner/connect`: 6-character partner invite code redemption
- `/partner/profile`: Sync status and notification settings

---

## 📄 License
Private & Proprietary. All rights reserved.

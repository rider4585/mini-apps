# Development Log

Log entries newest first. Update after every work session.

## 2026-09-29 — Add abhishek.gadkari@programming.com to Monthly Timesheet CC

- **Timesheet CC Default:** Added `abhishek.gadkari@programming.com` to `TIMESHEET_EMAIL.cc` in `src/lib/constants.js`.
- Preserved existing timesheet CC recipients (`rohit.dudani@programming.com`, `suraksha.devadiga@programming.com`).
- Updated context documentation (`context/timesheet.md`, `context/project-overview.md`, `context/requirements.md`, `context/status.md`).
- Verified production build completes cleanly via `npm run build`.

## 2026-09-29 — Editable Timesheet Activities Column

- **Manual Activities in Timesheet:** Made the Activities column in the monthly day rows table editable via responsive inline textareas.
- Automatically initializes with recorded DSR history and stores custom edits in `tsState` (`dsr-mg:ts:v1`).
- Included individual per-row "Revert to DSR" indicators and a header "Reset all to DSR" action button.
- Updated `buildDayRows` and Excel generation in `src/lib/timesheet.js` to write custom activities to the exported `.xlsx`.

## 2026-09-29 — Flattened project layout to root

- **Root Migration:** Moved all application files, directories, and assets from `app/` directly to project root.
- Renamed original legacy single-file HTML to `index.legacy.html`.
- Production Vite build and dev server configured and verified directly from workspace root.

## 2026-09-25 — Dark theme, collapsible sidebar, mobile-first layout

- **Dark theme:** Added `.dark` shadcn variables (slate/indigo) in `index.css`; `ThemeToggle`
  (Sun/Moon) shared store via `useSyncExternalStore` (`lib/theme-store.js`, `hooks/use-theme.js`),
  persisted to `dsr-mg:theme`, falls back to system preference; no-flash inline script in
  `index.html`. Timesheet amber banner made dark-aware.
- **Collapsible sidebar:** Desktop rail is now `sticky top-0 h-screen` (no longer scrolls away
  with the page) and collapses to a 76px icon rail (`PanelLeftClose/Open` toggle, persisted to
  `dsr-mg:sidebar:v1`). Reminders card only when expanded.
- **Mobile-first:** New mobile layout — sticky top bar (brand + theme toggle + bell → reminders
  bottom-sheet via new shadcn `dialog`) and a fixed bottom tab bar (Daily Status / Timesheet)
  with safe-area inset. Main content gets bottom padding to clear the nav. Added shadcn
  `dialog` + `switch` components.
- Verified: `tsc --noEmit` clean, `vite build` clean, dev-server module transforms clean.

## 2026-09-24 — Rebuild implemented & verified (T02–T08 complete)

Finished the full rebuild of the DSR Mail Generator PWA.

- **UI (T02):** Rebranded to "DSR Mail Generator" with an app shell (sidebar navigation:
  Daily Status / Timesheet), Inter font, slate/indigo shadcn theme. DSR page ports all prior
  features (Today / This Week / Custom Range, exclude dates, per-day activities, same-activity,
  validation, Gmail draft generation) plus draft auto-save. New components: `Sidebar.jsx`,
  `PageHeader.jsx`, `pages/Dsr.jsx`, `pages/Timesheet.jsx`.
- **PWA (T03):** `vite-plugin-pwa` configured (manifest, theme_color `#4F46E5`, standalone,
  maskable icon, autoUpdate SW, offline app-shell caching). Icons generated via
  `scripts/generate-icons.mjs`; SW + manifest verified serving on `vite preview`.
- **Storage (T04):** `lib/store.js` — localStorage-backed store: DSR history (`dsr-mg:history:v1`
  keyed YYYY-MM-DD), reminder schedule (`schedule:v1`), DSR draft (`draft:v1`), timesheet profile
  (`profile:v1`), per-month timesheet leave state (`ts:v1`).
- **Reminders (T05):** `lib/reminders.js` — self-rescheduling engine (Friday 18:00,
  2nd-of-month 18:00), Notifications API with permission flow, in-app fire banner evaluated on
  mount + every 60s, `.ics` export (`dsr-mail-reminders.ics`) with RRULE weekly Friday / monthly
  BYMONTHDAY=2 + VALARM for phone calendar import.
- **Timesheet (T06):** `lib/timesheet.js` — `xlsx-js-style` generator reproducing the demo
  structure (title, Name/Title/Department/Reporting Head/Client/Project/Location header, styled
  9-column day table from DSR history, per-day leave toggles, "Client Signature:" footer).
  Gmail draft template per user text (To accounts@mobileprogramming.com, CC
  rohit.dudani@programming.com + suraksha.devadiga@programming.com + abhishek.gadkari@programming.com). Timesheet page lazy-loaded so
  the heavy xlsx lib is split into its own chunk (main bundle 1,005 kB → 362 kB).
- **Wiring (T07):** DSR generate saves each day's activity into history store.
- **Verify (T08):** `npx tsc --noEmit` clean; `vite build` clean (gzip main 114 kB, timesheet chunk
  327 kB); preview smoke test — root / manifest.webmanifest / sw.js / icons all 200.

Known limits (documented in-app): Gmail drafts can't auto-attach files (attach downloaded .xlsx
manually); phone reminders require the `.ics` import (true background push is out of scope).

## 2026-09-24 — Full rebuild: DSR Mail Generator (PWA + Timesheet + Reminders)

Started the rebuild per user requirements:

- Created `tasks.json`, `context/` docs (this project's session-context system).
- Found the demo timesheet `Timesheet september 2026 (1).xlsx` on the project root; parsed its
  structure (header rows 2–9, 9-column table, per-day rows, footer) for the rebuild reference.
- Plan (tasks in `tasks.json`): rebrand UI, PWA, localStorage persistence, reminder engine,
  timesheet generator.
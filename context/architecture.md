# Architecture

## Stack

- React 18 + Vite 5 (JavaScript app; shadcn components ship as `.tsx` and are type-checked).
- Tailwind CSS v3 + shadcn/ui components (`shared/components/ui/*`).
- `xlsx-js-style` for styled Excel generation (isolated to `apps/timesheet` package only).
- `vite-plugin-pwa` for manifest + service worker + icons.
- npm workspaces monorepo (`apps/*`, `shared`).

## Monorepo Layout

```
.
  package.json                    workspaces: apps/*, shared, shared/*; single root build
  vercel.json                     Vercel SPA rewrites & build configuration
  index.html                      shell entry point (/apps/shell/src/main.jsx)
  index.legacy.html               backup of original standalone HTML
  vite.config.js                  react plugin, @, @shared, @apps aliases, PWA config
  tailwind.config.js              scans apps/ and shared/ for tailwind classes
  apps/
    shell/                        entry: nav, router, manifest registry (generic)
      package.json                @apps/shell
      src/
        main.jsx                  mounts App, registers PWA
        App.jsx                   generic shell, renders nav and active app from registry
        registry.js               manifest registry array
        router.js                 hand-rolled lightweight path router (~40 lines)
        reminders.js              schedule math, notifications, .ics builder
        components/
          Sidebar.jsx             collapsible sidebar + reminders panel (generic)
    dsr/                          daily status report mini-app
      package.json                @apps/dsr
      config.js                   DEFAULTS (recipients, employee details)
      store.js                    DSR store (dsr-mg:draft:v1, dsr-mg:history:v1)
      manifest.js                 exports id, title, route, icon, widget, component
      src/
        DsrApp.jsx                daily status generator UI and flow
    timesheet/                    monthly timesheet mini-app
      package.json                @apps/timesheet (declares xlsx-js-style here only)
      config.js                   timesheet profile defaults, email recipients
      store.js                    timesheet store (dsr-mg:profile:v1, dsr-mg:ts:v1)
      manifest.js                 exports id, title, route, icon, widget, component (lazy)
      src/
        TimesheetApp.jsx          monthly timesheet generator UI & manual activity editor
        timesheet.js              xlsx-js-style worksheet builder & exporter
  shared/                         UI primitives, theme, tailwind tokens, helpers
    package.json                  @shared/ui
    components/
      ui/*.tsx                    shadcn primitives (card, button, dialog, popover, etc.)
      DatePicker.jsx              single date picker
      MultiDatePicker.jsx         multiple date picker
      PageHeader.jsx              title/subtitle/icon header
      ThemeToggle.jsx             theme switcher
    lib/
      utils.ts                    cn helper
      theme-store.js              theme persistence (dsr-mg:theme)
      constants.js                shared app name
    hooks/
      use-theme.js                theme hook
    utils/
      index.js                    date utils + buildGmailUrl
    styles/
      index.css                   tailwind base + CSS variables
      tokens.js                   design tokens
    index.js                      shared entry point
  public/
    icons/                        generated PNG icons + favicon
```

## Navigation

Path-based: hand-rolled router (`apps/shell/src/router.js`, ~40 lines) driven dynamically by `registry.js`.
- URL changes update active app state via `pushState` and `popstate`.
- Deep paths like `/timesheet` or `/dsr` work on hard refresh (with SPA rewrites in `vercel.json` and Vite dev server).
- Adding a future mini-app only requires adding its folder under `apps/` and registering one line in `apps/shell/src/registry.js`.

## Data Flow

```
DSR App (/dsr)
  mailDays computed from mode/range/exclusions
  generate -> for each day: open Gmail tab AND save to history (dsrStore.submitDsr(dateID, text))
  draft auto-persists to localStorage (dsr-mg:draft:v1)

Timesheet App (/timesheet)
  read profile (localStorage: dsr-mg:profile:v1) -> build day rows for month
  activities: custom override from dsr-mg:ts:v1 || history[dateID] (from dsr-mg:history:v1)
  build .xlsx (xlsx-js-style in isolated chunk) -> download
  open Gmail draft with computed subject/body

Reminders (Shell-level)
  on mount + interval: evaluateReminders() -> notifications + self-reschedule (dsr-mg:schedule:v1)
  Sidebar shows next occurrences; .ics export via reminders.buildIcs()
```

## Storage Model (localStorage)

All keys are preserved with `dsr-mg:*` prefix:
- `dsr-mg:draft:v1`: DSR form draft
- `dsr-mg:history:v1`: DSR submitted history
- `dsr-mg:profile:v1`: Timesheet user profile
- `dsr-mg:ts:v1`: Timesheet monthly leave and custom activity overrides
- `dsr-mg:schedule:v1`: Reminders schedule
- `dsr-mg:sidebar:v1`: Sidebar collapsed state
- `dsr-mg:theme`: Dark/light mode preference

## Migration Note (SMG-6 — Monorepo Restructure)

- Migrated flat layout into npm workspaces monorepo: `apps/shell`, `apps/dsr`, `apps/timesheet`, `shared`.
- `xlsx-js-style` (884 KB) moved strictly to `apps/timesheet/package.json` and imported exclusively within `apps/timesheet/src/timesheet.js`.
- `TimesheetApp` is code-split / lazy-loaded, guaranteeing that `xlsx-js-style` does NOT appear in the DSR chunk, shell bundle, or any future widget bundles.
- Verified build chunk isolation: `TimesheetApp` chunk contains `xlsx-js-style` (~642 KB), while `DsrApp` chunk (~106 KB) and shell chunks (~262 KB and ~5 KB) are completely free of `xlsx`.
- Shell is generic: builds navigation, routing, and view loading dynamically from `registry.js`.
- Preserved all `localStorage` keys without modification.
- Configured `vercel.json` SPA rewrites and verified dev server hard-refresh on deep paths.
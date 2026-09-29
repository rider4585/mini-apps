# UI Design

Goal: a calm, professional tool — not a marketing landing page.

## Visual system

- **Font:** Inter (Google Fonts). Replaces Poppins.
- **Theme:** slate neutrals + indigo primary. shadcn CSS variables in `src/index.css`.
  - background `#FFFFFF`, foreground `#0F172A` (slate-900)
  - primary: indigo-600 `#4F46E5`
  - muted surfaces: slate-100; borders slate-200
  - destructive: red-600
- **Radius:** `0.75rem` (shadcn uses `--radius` via `lg/md/sm` scale).
- **Page background:** `bg-slate-50` with a soft top gradient wash (indigo/cyan blobs, very subtle).

## Layout

- **App shell** (`App.jsx`):
  - Left sidebar (240px, white, right border) — desktop.
  - Top bar on mobile with a horizontal tab switcher (Bottom/simple segmented control).
  - Sidebar contains: logo mark + name, nav (Daily Status, Timesheet) with active state,
    and a **Reminders** card (next occurrences + enable + .ics download).
- **Main area:** `max-w-4xl` content column, padding, stack of sections.

## Components

- `Sidebar.jsx` — nav item buttons + RemindersPanel.
- `PageHeader.jsx` — page title + description.
- shadcn: Button, Card, Input, Textarea, Label, Checkbox, Badge, Calendar, Popover.

## Pages

### DSR (pages/Dsr.jsx)
- Section card: **Recipients** (To, CC).
- Section card: **Employee details** (6 fields).
- Mode segmented control (Today / This Week / Custom Range).
- Custom Range card: Start/End `DatePicker`s + Exclude multi-select calendar + excluded chips.
- Activities: day cards (2-col) with `Weekday, DD-Mon-YYYY` heading, or shared textarea when
  "Same Activity For All Days" is checked.
- Error banner (destructive) when validation fails.
- Primary button: **Generate Gmail Drafts**.

### Timesheet (pages/Timesheet.jsx)
- Month picker (select).
- Profile card (editable top-section values + time in/out + billable default).
- Coverage summary: how many DSRs exist for the month; per-day table preview.
- Actions: **Download Timesheet (.xlsx)** and **Open Gmail Draft** (attached by user manually).
- Shows the generated subject/body preview.

## Tone

- Copy is concise and action-oriented.
- Empty states are honest: "No DSRs found for this month yet — they appear here after you
  generate daily status mails."
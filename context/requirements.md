# Requirements

## 1. Branding & UI

- App name: **DSR Mail Generator** (replace "Programming.com Status Mail Generator").
- Professional-tool look; color theme may be changed (slate/indigo chosen).
- Whole UI + UX rebuilt from scratch (not incremental).

## 2. Daily Status (DSR)

Kept from the earlier version, rebranded and restyled:

- Modes: **Today**, **This Week**, **Custom Range**.
- Email config: To, CC (editable).
- Employee details: Name, Designation, Employee Code, Manager / RM Name, Start Time, Leaving Time.
- Custom Range: Start Date + End Date pickers and an **Exclude Dates** multi-select calendar
  (leaves / holidays). Weekends are always skipped.
- Per-day activity inputs labeled `Weekday, DD-Mon-YYYY` (all modes); "Same Activity For All Days"
  toggle for Week / Custom.
- Validation with visible errors; weekends / excluded dates are skipped.
- Gmail draft subjects: `Status Report of Monday 21-Sep-2026` (weekday first).
- **New:** every submitted day is saved into local history so the timesheet can be built.

## 3. Timesheet (monthly, submit on the 2nd)

- Month selector; default = current month.
- Excel built from the demo template `Timesheet september 2026 (1).xlsx`:
  - Top section (rows 2–9): Name, Title/Designation, Department, Reporting Head, Client, Project,
    Location — keep the demo values as editable defaults.
  - Table (columns): Date, Day, Time In, Time Out, Work Code, Billable Hours, Non Billable Hours,
    Comments, Work Activities Done.
  - For each calendar day of the month: weekends get Date + Day only; working days get
    Time In / Time Out (defaults), Billable Hours default `8 hours` (leave dates → `0 hours`),
    Non-billable and Comments empty, Work Activities from that date's submitted DSR.
- Email:
  - To `accounts@mobileprogramming.com`; CC `rohit.dudani@programming.com`,
    `suraksha.devadiga@programming.com`, `abhishek.gadkari@programming.com`.
  - Subject: `Timesheet Submission - Siemens - Raviraj Bugge - MM-YY`.
  - Body: "Please find attached my timesheet for the month of <Month>. Please let me know if you
    need any additional information or if there are any issues with the document. Thank you,
    Raviraj Bugge".
- The `.xlsx` is downloaded; the Gmail draft is opened; user attaches the file manually.

## 4. Reminders

- Recurring reminder **every Friday 18:00** (DSR).
- Recurring reminder **every 2nd of month 18:00** (timesheet).
- **Self-rescheduling:** after each Friday reminder fires, schedule the next Friday 18:00;
  after each 2nd-of-month reminder fires, schedule the next month's 2nd 18:00.
- Delivery mechanisms:
  - **In-app notifications** (Notifications API) when due while the PWA is open, and on launch
    check if a reminder time recently passed.
  - **`.ics` calendar export** (recurring events + alarms) so the user can import real phone
    reminders.
- UI shows the next scheduled occurrences and a permission/enable button.

## 5. PWA

- Installable (manifest, standalone display, icons, theme-color).
- Offline support (service worker caches the app shell).
- Name: DSR Mail Generator; short name: DSR Mails.
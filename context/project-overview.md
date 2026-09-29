# DSR Mail Generator — Project Overview

A personal productivity tool for an employee at Programming.com who works as a contractor/client
engineer for **Siemens Digital Industries Software**.

## Purpose

Two recurring email tasks, both involving pre-filled Gmail drafts and local file generation:

1. **Daily Status Report (DSR)** — send a status email every working day.
   - To: `status@programming.com`
   - CC: `rohit.dudani@programming.com`, `suraksha.devadiga@programming.com`, `abhishek.gadkari@programming.com`
   - Subject: `Status Report of Monday 21-Sep-2026` (weekday first, then DD-Mon-YYYY)
   - Body: Name / Designation / Employee Code / RM Name / Start Time / Leaving Time / Activities

2. **Monthly Timesheet** — once a month (submission on the 2nd) send the timesheet Excel.
   - To: `accounts@mobileprogramming.com`
   - CC: `rohit.dudani@programming.com`, `suraksha.devadiga@programming.com`, `abhishek.gadkari@programming.com`
   - Subject: `Timesheet Submission - Siemens - Raviraj Bugge - MM-YY`
   - Body: "Please find attached my timesheet for the month of <Month>. ... Thank you, Raviraj Bugge"
   - Attachment: generated `.xlsx` timesheet for the month; work activities are pulled from the
     DSRs submitted that month (stored locally in the PWA).

## Core user flows

1. Open the app (also installable as a PWA on the phone/home screen).
2. **Daily Status tab** → pick mode (Today / This Week / Custom Range), optionally exclude dates,
   type an activity per mail day (or one shared activity), click "Generate Gmail Drafts".
   Drafts open in new tabs; each submitted day is saved to history.
3. **Timesheet tab** → choose the month, review the auto-filled day rows + activities pulled from
   DSR history, download the `.xlsx`, open the Gmail draft, attach the file, send.
4. **Reminders** — the app reminds at every Friday 18:00 (DSR) and every 2nd of month 18:00
   (timesheet). After each reminder it self-reschedules the next occurrence. It exposes an
   `.ics` download to import recurring phone-calendar reminders.

## Constraints / limitations (important)

- **Gmail compose URLs cannot attach files.** The timesheet is downloaded and must be attached by
  the user in the opened Gmail tab. Auto-attach would require Gmail API / Apps Script OAuth.
- **A web PWA cannot run guaranteed background timers on a phone.** In-app reminders fire while
  the app is open or on launch. For bulletproof phone alerts, the user imports the generated
  `.ics` into their phone calendar (recurring events + alarms at 18:00).
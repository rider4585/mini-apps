# Reminders & Scheduling

Source: `src/lib/reminders.js`.

## Rules

- **DSR reminder:** every Friday 18:00.
- **Timesheet reminder:** every 2nd of each month, 18:00.
- **Self-rescheduling** (exactly as required by the user):
  - After the Friday 18:00 reminder is delivered → next occurrence = that date + 7 days (next Friday 18:00).
  - After the 2nd-of-month 18:00 is delivered → next occurrence = the 2nd of the following month at 18:00.

## Algorithm

1. `ensureSchedule()` — on startup, if a scheduled time is missing or in the past (and not yet
   considered "fired"), compute the next future occurrence:
   - next Friday 18:00 after `now`; next month-2nd 18:00 after `now`.
2. `evaluate()` — called on mount and every 60s while the app is open:
   - For each reminder type (`dsr`, `timesheet`):
     - if `now >= scheduled && now - scheduled < 24h` and `notified[type] !== scheduled`,
       - fire notification (`new Notification(...)`),
       - mark notified, advance to next occurrence, persist.
3. Notifications require permission (`Notification.requestPermission()`). UI shows state and a
   "Enable notifications" button. Fallback to an in-app `toast`/banner even without permission.

## Phone reminders (`.ics`)

`buildIcs()` produces an iCalendar file the user imports once into their phone calendar
(95% of Android/iOS usage is covered):

- Event **DSR Reminder** — DTSTART Friday 18:00 (floating time), `RRULE:FREQ=WEEKLY;BYDAY=FR`,
  with a `VALARM` (POPUP, TRIGGER P0S at 18:00).
- Event **Timesheet Reminder** — DTSTART 2nd of month 18:00, `RRULE:FREQ=MONTHLY;BYMONTHDAY=2`,
  with a `VALARM`.

Floating times (no Z/UTC suffix) make alarms fire at 18:00 in the phone's local timezone.

## Honest limitations (documented to the user)

- A web app cannot run real background timers on a phone. In-app notifications only fire while the
  PWA is open or when it is launched; the importable `.ics` covers the "remind me on my phone"
  requirement reliably.
- iOS/Safari: enable notifications from the app in Settings after adding to Home Screen.
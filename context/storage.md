# Storage (localStorage)

All reads/writes go through `src/lib/store.js`. Keys are namespaced `dsr-mg:`.

## Keys

### `dsr-mg:history:v1`
`{ [dateID]: string }` — submitted DSR activities keyed by `YYYY-MM-DD`.

- Written by `store.submitDsr(dateID, text)` whenever the DSR page generates drafts.
- Read by the Timesheet page to fill the **Work Activities Done** column.
- Kept indefinitely so any month's timesheet can be rebuilt.

### `dsr-mg:schedule:v1`
```
{
  dsr:        "YYYY-MM-DDTHH:mm" | null,   // next Friday 18:00
  timesheet:  "YYYY-MM-DDTHH:mm" | null,   // next 2nd-of-month 18:00
  notifiedDsr:       string | null,        // last fired dsr occurrence (dedupe)
  notifiedTimesheet: string | null,
  notificationsGranted: boolean
}
```
Managed by `src/lib/reminders.js` via `store.getSchedule()` / `store.setSchedule()`.

### `dsr-mg:draft:v1`
Spare-typing persistence: last DSR form state (activities map, shared activity, excluded dates,
custom range, mode-relevant inputs) so a refresh doesn't lose work. Restored on load if present.

### `dsr-mg:profile:v1`
Timesheet profile:
```
{
  name, title, department, reportingHead, client, project, location,
  timeIn ("10:00 AM"), timeOut ("7:00 PM"), billableDefault ("8 hours")
}
```

## Helpers (`store.js`)

- `load(key, fallback)`, `save(key, value)` (JSON safe, try/catch — localStorage can throw).
- `getHistory()`, `submitDsr(dateID, text)`, `historyForMonth(year, month)`.
- `getSchedule()`, `setSchedule(s)`.

## Rationale

- localStorage chosen over IndexedDB: data is small (text strings) and synchronous reads keep the
  timesheet builder simple. No external dependency needed.
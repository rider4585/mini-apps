# Timesheet

Source: `src/lib/timesheet.js`. Template reference: `Timesheet september 2026 (1).xlsx` (project root).

## Demo template structure (sheet `Sep2026`)

| Reference | Content |
|---|---|
| Row 1 | (empty) |
| Row 2 | `" TimeSheet"` (title) |
| Rows 3–9 | Label/value header: Name, Title/Designation, Department, Reporting Head, Client, Project, Location |
| Row 10 | (empty) |
| Row 11 | Column headers: Date, Day, Time In, Time Out, Work Code, Billable Hours, Non Billable Hours, Comments, Work Activities Done |
| Rows 12+ | One row per calendar day. Weekends: Date + Day only. Working days: + Time In, Time Out, Billable Hours (`8 hours`; `0 hours` on leave), optional Work Activities |
| Footer | (blank row) then `Client Signature:` |

Date format in demo is `DD/MM/YYYY` (e.g. `10/8/2026` = Monday 10 August 2026).

## Rebuild rules (xlsx-js-style)

The sheet is regenerated fresh each time (SheetJS community drops cell styles, so styling is
authored in code with `xlsx-js-style`):

- Title merged + bold; header label/value pairs; styled table header row (indigo fill, white text).
- Day rows:
  - every calendar day of the selected month gets a row;
  - weekend rows show only `DD/MM/YYYY` + `Day`, styled muted/gray;
  - working days (Mon–Fri that are not excluded) get:
    - Time In / Time Out from the profile defaults (e.g. `10:00 AM` / `7:00 PM`);
    - Billable Hours = profile default (`8 hours`), or `0 hours` when left unpaid/excluded;
    - Non Billable Hours = empty; Comments = empty; Work Code = empty;
    - Work Activities Done = submitted DSR text for that date (from history) or manually edited activities from the table, `wrapText` enabled.
- `!cols` set for readable widths; `!merges` for title and header value spans.
- Filename: `Timesheet <Month> <Year>.xlsx`.

## Email composition

- To: `accounts@mobileprogramming.com`
- CC: `rohit.dudani@programming.com`, `suraksha.devadiga@programming.com`, `abhishek.gadkari@programming.com`
- Subject: `Timesheet Submission - Siemens - Raviraj Bugge - MM-YY`  (e.g. `08-26` for Aug 2026)
- Body:

```
Please find attached my timesheet for the month of <Month>.

Please let me know if you need any additional information or if there are any issues with the document.

Thank you,

Raviraj Bugge
```

## Attachment constraint

Gmail compose URLs (`mail.google.com/mail/?view=cm`) **cannot** attach files. Flow:
download the `.xlsx`, open the Gmail draft, attach the file, send. (True auto-attach would need
Gmail API/Apps Script with OAuth — out of scope, noted in `status.md`.)
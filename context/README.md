# DSR Mail Generator — Session Context

Root: `/Applications/MAMP/htdocs/Personal Projects/Status Mail Generator`
App: Root directory (React + Vite, shadcn/ui, Tailwind CSS, PWA)

This folder lets any LLM session resume work without re-reading the whole codebase.

## How to resume

1. Read `context/status.md` (current progress and last actions) and `context/architecture.md`.
2. Read `tasks.json` at the project root for the canonical task list (update status as you go).
3. For a specific area, read the matching doc below.

## Index

- `project-overview.md` — what the tool is and the core user flows
- `requirements.md` — detailed functional requirements (DSR, Timesheet, Reminders, PWA)
- `architecture.md` — code layout, data flow, storage model
- `ui-design.md` — visual system, layout, color theme, pages
- `pwa.md` — manifest, service worker, icons, offline strategy
- `storage.md` — localStorage schema and helpers
- `reminders.md` — schedule algorithm, notifications, .ics export
- `timesheet.md` — Excel generation rules, email composition
- `status.md` — chronological development log (most recent first)

## Golden rules

- Update `tasks.json` + `context/status.md` whenever starting or finishing work.
- Keep Context docs accurate when code changes (don't preserve dead info).
- Never commit secrets. There are no secrets in this project.
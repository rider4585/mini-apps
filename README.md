# mini-apps

A lightweight container of small independent web apps, deployed to Vercel and surfaced on the
iOS home screen through **Widget Web**.

The repo is an npm-workspaces monorepo with a single build. Each app owns its `package.json`,
config, and storage namespace; heavy dependencies are confined to the app that needs them so they
can never leak into a small widget bundle.

## Apps

| App         | Route       | Widget   | Notes                                                    |
| ----------- | ----------- | -------- | -------------------------------------------------------- |
| DSR         | `/dsr`      | `/w/dsr` | Daily Status Report. Full form in the browser, send-only in the widget. |
| Timesheet   | `/timesheet`| —        | Monthly Excel timesheet. Owns `xlsx-js-style` (642 kB, lazy-loaded). |

## Layout

```
apps/shell/        entry point: nav, router, manifest registry (generic)
apps/dsr/          DSR app
apps/timesheet/    Timesheet app
apps/widget-dsr/   minimal widget entry for /w/dsr
shared/            UI primitives, theme, tailwind tokens
w/dsr/index.html   second HTML entry, emitted as its own rollup input
```

Adding an app means one folder plus one line in `apps/shell/src/registry.js`. The shell renders
nav and routes from the registry, so it needs no edits.

## Development

Requires Node 18+ and npm. From the repo root:

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # emits dist/
npm run preview  # serve the production build
```

## Deployment

Vercel, configured by `vercel.json`: `npm run build` into `dist`, with rewrites so `/w/dsr`
resolves ahead of the SPA catch-all.

> `npm ci` is what Vercel runs, so `package-lock.json` must stay in sync. After adding or removing
> a workspace, run `npm install` and commit the lockfile.

## Notes

- Storage is `localStorage` under the `dsr-mg:` namespace; nothing leaves the browser.
- Real `.xlsx` timesheet exports are gitignored — they contain personal and work details.
- Git flow: work lands on `dev` first, then is promoted to `main`.

# Campus Trace Frontend

## Product invariants

- This directory is the React frontend. The sibling `../backend/main.py` contains the FastAPI/SQLModel API and uses a local SQLite database at `../backend/campus_trace.db`.
- Public users do not need accounts to report or browse. Only administrators authenticate; do not expose reporter contact details, claim evidence, security answers, or other admin-only data in public views.
- A finder report is not a public catalogue listing. An administrator must physically receive and verify the item before publishing it.
- Claims require private ownership evidence and an administrator decision before collection; recording the physical handover is what completes the return lifecycle.
- Administrator notifications are shared events with per-administrator read state. Significant report, receipt, publication, claim, decision, and return actions must also remain auditable.
- Deleting an administrator means setting `is_active = false`; never hard-delete accounts because reports, decisions, and logs retain their administrator references.

## Current implementation

- `src/main.jsx` only mounts `RouterProvider`; `src/routes.jsx` is the current route registry and most routes are placeholders.
- Treat `src/components/custom/{datatable,sidebar}` cautiously: much of it was copied from an unrelated music-monitoring app, references missing modules/dependencies, and is not imported by the live app. Do not preserve its domain language or `/dashboard/...` URLs when building Campus Trace.
- A successful build does not validate those unreferenced files. Oxlint scans them, but it does not resolve all imports.
- Use the `@/` alias for `src/`. shadcn is configured for JavaScript/JSX (`tsx: false`) and writes design tokens directly in `src/index.css`.
- Tailwind CSS v4 is loaded through the Vite plugin and CSS imports; there is intentionally no `tailwind.config.*`.
- React Compiler is enabled through Babel in `vite.config.js`; avoid adding manual memoization solely as a default optimization.

## Commands and verification

- Use pnpm; `pnpm-lock.yaml` is the dependency source of truth.
- Install: `pnpm install --frozen-lockfile`
- Develop: `pnpm dev`
- Verify changes: `pnpm lint` then `pnpm build`
- There is currently no test or typecheck script. Do not claim either passed.
- Known baseline diagnostics: lint warns about `buttonVariants` sharing `src/components/ui/button.jsx` with a component; build warns that `vite.config.js` uses `__dirname`, which is incompatible with Vite's future native config loader.

## Backend sibling

- On Windows, activate the backend environment with `workon p1`, then run commands from `../backend`.
- Start the API with `uvicorn main:app --reload`; startup creates missing SQLite tables.
- Create an account interactively with `python main.py create-admin`; add `--super-admin` only for administrators who may manage other administrators.
- The frontend API base defaults to `http://127.0.0.1:8000`; override it with `VITE_API_URL`. Backend CORS origins come from `CAMPUS_TRACE_CORS_ORIGINS`.
- `main.py` enables SQLite foreign-key enforcement. Preserve that connection listener when changing the engine.
- The backend currently has no dependency manifest, migrations, or tests; at minimum verify model edits with `python -m py_compile main.py` and an in-memory `SQLModel.metadata.create_all(...)` smoke test.

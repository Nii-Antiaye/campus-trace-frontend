# Campus Trace

Campus Trace is a public lost-property reporting and claim system with an authenticated administrator dashboard.

## Local development

### Backend

From `../backend`:

```powershell
workon p1
uvicorn main:app --reload
```

The API runs at `http://127.0.0.1:8000`.

### Frontend

From this directory:

```powershell
pnpm install --frozen-lockfile
pnpm dev
```

The frontend runs at `http://localhost:5173`.

## Render deployment

The frontend and backend currently live in separate sibling directories and should be deployed as separate Render services/repositories.

### 1. Deploy the backend

Use `../backend/render.yaml` as a Render Blueprint. Set:

- `CAMPUS_TRACE_APP_URL` to the final frontend URL, without a trailing slash.
- `CAMPUS_TRACE_CORS_ORIGINS` to the final frontend URL.
- The `CAMPUS_TRACE_SMTP_*` values for the email provider.

The Render disk stores SQLite data and uploaded item images under `/var/data`. The production service does not run the local seed script and therefore starts without demo cases.

After the first deployment, create the initial administrator from a Render shell:

```bash
python main.py create-admin --super-admin
```

### 2. Deploy the frontend

Use `render.yaml` in this directory as a Render Blueprint. Set:

- `VITE_API_URL` to the deployed backend URL, without a trailing slash.

The static-site rewrite in `render.yaml` and `public/_redirects` keeps React Router URLs working when opened directly.

### Required production settings

- Use generated secrets; never deploy the development secret.
- Configure a persistent backend disk.
- Use the exact HTTPS frontend origin for backend CORS.
- Configure SMTP before testing claim decision emails.
- Do not upload `campus_trace.db`, `uploads/`, or `.env`.

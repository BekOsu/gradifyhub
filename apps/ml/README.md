# ML Sidecar (Assessment)

This service provides assessment progression endpoints for GradifyHub when `ASSESSMENT_MODE=real`.

## Endpoints

- `GET /health`
- `POST /attempts/start`
- `POST /attempts/{attempt_id}/respond`
- `GET /attempts/{attempt_id}/state` (admin-only; requires `x-ml-admin-token`)

## Security

Requests must include `x-gradify-signature`, an HMAC-SHA256 of the raw JSON body using `ML_SHARED_SECRET`.
State debug endpoint additionally requires `ML_ADMIN_TOKEN` via `x-ml-admin-token`.

## Storage

- Uses Redis when `UPSTASH_REDIS_URL` or `REDIS_URL` is configured.
- Falls back to in-memory storage if Redis URL is not set.
- Attempt state TTL defaults to 24h via `ASSESSMENT_ATTEMPT_TTL_SECONDS`.

## Run locally

```bash
cd apps/ml
python3 -m venv .venv
source .venv/bin/activate
pip install -e .
export ML_SHARED_SECRET=dev-shared-secret
export ASSESSMENT_QUESTION_LIMIT=15
export ASSESSMENT_ATTEMPT_TTL_SECONDS=86400
export ML_ADMIN_TOKEN=dev-admin-token
# Optional Redis (recommended)
# export UPSTASH_REDIS_URL=redis://...
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Smoke test

```bash
cd apps/ml
source .venv/bin/activate
export ML_SHARED_SECRET=dev-shared-secret
python scripts/smoke_test.py http://localhost:8000
```

## Engine scaffold check

```bash
cd apps/ml
source .venv/bin/activate
python scripts/engine_smoke.py
```

## Web app env

Set these in `apps/web/.env.local` or Vercel env vars:

```bash
ASSESSMENT_MODE=real
ASSESSMENT_QUESTION_LIMIT=15
ML_SIDECAR_URL=http://localhost:8000
ML_SHARED_SECRET=dev-shared-secret
```

## Notes

- Current progression logic is deterministic and minimal.
- `catsim` is installed and scaffolded in `irt/engine.py`; next step is real item-parameter calibration + selector/estimator wiring.
- Next step after calibration is richer Redis attempt state (`theta`, asked set, exposure controls).

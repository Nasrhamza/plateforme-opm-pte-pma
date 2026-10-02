# Reporting FastAPI

Independent FastAPI project used as the data aggregation layer between:
- Reporting Node backend (`Reporting/reporting-backend`)
- Source MongoDB databases from OPM, PTE, PMA

## Run

1. Create a virtual environment.
2. Install dependencies:
   - `pip install -e .`
3. Copy `.env.example` to `.env` and fill credentials.
4. Start:
   - `uvicorn app.main:app --reload --port 8000`

## Main Endpoints

- Compatibility endpoints used by Reporting backend:
  - `/opm/tickets/*`
  - `/pte/*`
  - `/pma/*`
- Dynamic reporting:
  - `POST /metrics/query`
- ETL administration:
  - `POST /etl/run`
  - `POST /etl/backfill`
  - `GET /etl/status`

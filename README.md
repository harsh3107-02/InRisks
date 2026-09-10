# Weather Explorer

A small full-stack weather explorer built for the InRisk Labs Full Stack Engineer case study.

## What it does

1. Accepts latitude, longitude and a date range of up to 31 days.
2. Fetches historical daily weather from Open-Meteo.
3. Stores the complete raw JSON response in Amazon S3.
4. Lists stored weather JSON files.
5. Loads a selected file from S3 through the backend.
6. Displays daily max/min temperature in a line chart and paginated table.

## Architecture

```text
React + Tailwind (Vercel)
          |
          v
   API Gateway / HTTP
          |
          v
 FastAPI on AWS Lambda
       /       \
      v         v
Open-Meteo     S3
             raw JSON
```

The frontend never calls Open-Meteo directly. It uses the backend for the complete fetch/store/read workflow, so previously stored files can be explored without another weather API call.

## Project structure

```text
weather-explorer/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── storage.py
│   │   └── weather.py
│   ├── requirements.txt
│   └── template.yaml
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── README.md
```

## Backend - local

Requirements: Python 3.12 and AWS credentials with access to the test S3 bucket.

```bash
cd backend
python -m venv .venv
# Windows
.venv\\Scripts\\activate
# macOS/Linux
# source .venv/bin/activate
pip install -r requirements.txt
```

Set environment variables:

```text
WEATHER_BUCKET=your-bucket-name
ALLOWED_ORIGINS=http://localhost:5173
AWS_REGION=ap-south-1
```

Run:

```bash
uvicorn app.main:app --reload
```

Swagger UI: `http://localhost:8000/docs`

## Frontend - local

```bash
cd frontend
npm install
```

Create `.env` from `.env.example` and set your backend URL:

```text
VITE_API_URL=http://localhost:8000
```

Run:

```bash
npm run dev
```

## AWS deployment

The backend includes an AWS SAM template that creates the S3 bucket, Lambda function and API Gateway endpoint.

From `backend/`:

```bash
sam build
sam deploy --guided
```

During `sam deploy --guided`, provide the AWS region and frontend origin. After deployment, use the generated API URL as `VITE_API_URL` in the frontend.

Then build/deploy the frontend with Vercel:

```bash
npm run build
```

Import the `frontend` directory into Vercel and set `VITE_API_URL` to the deployed API URL.

## Design decisions

- **S3 instead of a database:** the case asks for raw JSON object storage, so a relational database is unnecessary.
- **Raw response storage:** the complete Open-Meteo response is saved without reshaping it.
- **31-day validation:** keeps requests small and follows the case-study requirement.
- **Paginators for S3:** avoids manually scanning objects one by one.
- **Simple React state:** the page is small enough that local React state is clearer than Redux.
- **Chart uses stored data:** after a file is selected, the dashboard reads the S3 copy through the backend rather than making another Open-Meteo request.

## API endpoints

### POST `/store-weather-data`

```json
{
  "latitude": 28.6139,
  "longitude": 77.2090,
  "start_date": "2026-08-01",
  "end_date": "2026-08-10"
}
```

### GET `/list-weather-files`

Returns stored file names, sizes and S3 last-modified timestamps.

### GET `/weather-file-content/{file}`

Returns the stored raw Open-Meteo JSON. Missing/invalid files return:

```json
{
  "status": "error",
  "message": "not found"
}
```

## Interview talking points

The main flow is intentionally simple: **validate -> fetch -> store -> list -> retrieve -> visualize**.

The project avoids a database, authentication, queues and other infrastructure because none are needed to satisfy this case study.

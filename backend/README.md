# Weather Explorer Backend

Simple FastAPI backend for the case study.

## Local setup

```bash
python -m venv .venv
# Windows: .venv\\Scripts\\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
```

Set AWS credentials in your environment and set:

```bash
WEATHER_BUCKET=your-bucket-name
ALLOWED_ORIGINS=http://localhost:5173
```

Run:

```bash
uvicorn app.main:app --reload
```

## Deploy with AWS SAM

From the `backend` directory:

```bash
sam build
sam deploy --guided
```

During the guided deployment, provide your stack name, AWS region, and allowed frontend origin.

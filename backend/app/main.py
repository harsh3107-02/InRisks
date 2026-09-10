from datetime import datetime, timezone
import os
import re

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from mangum import Mangum
from dotenv import load_dotenv

from .models import WeatherRequest
from .storage import S3Storage
from .weather import WeatherServiceError, fetch_weather_data


load_dotenv()

app = FastAPI(title="Weather Explorer API")


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    messages = [error.get("msg", "Invalid request") for error in exc.errors()]
    return JSONResponse(
        status_code=400,
        content={"status": "error", "message": "; ".join(messages)},
    )

allowed_origins = [origin.strip() for origin in os.getenv("ALLOWED_ORIGINS", "*").split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

storage = S3Storage()
FILENAME_PATTERN = re.compile(r"^weather_[^/]+\.json$")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/store-weather-data")
async def store_weather_data(request: WeatherRequest):
    try:
        data = await fetch_weather_data(
            request.latitude,
            request.longitude,
            request.start_date,
            request.end_date,
        )
    except WeatherServiceError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    filename = (
        f"weather_{request.latitude}_{request.longitude}_"
        f"{request.start_date}_{request.end_date}_{timestamp}.json"
    )

    try:
        storage.upload_json(filename, data)
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Unable to store weather data") from exc

    return {"status": "ok", "file": filename}


@app.get("/list-weather-files")
def list_weather_files():
    try:
        return {"files": storage.list_files()}
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Unable to list weather files") from exc


@app.get("/weather-file-content/{file}")
def weather_file_content(file: str):
    if not FILENAME_PATTERN.fullmatch(file):
        return JSONResponse(status_code=404, content={"status": "error", "message": "not found"})

    try:
        return storage.get_json(file)
    except FileNotFoundError:
        return JSONResponse(status_code=404, content={"status": "error", "message": "not found"})
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Unable to read weather file") from exc


handler = Mangum(app)

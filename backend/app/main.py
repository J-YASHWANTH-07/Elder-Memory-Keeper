"""Elder Memory Keeper API entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, medicines, schedule

app = FastAPI(title="Elder Memory Keeper API", version="0.1.0")

# Local demo: the web app and the Android app call this from other origins.
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

app.include_router(auth.router)
app.include_router(medicines.router)
app.include_router(schedule.router)


@app.get("/health", tags=["health"])
def health() -> dict:
    return {"status": "ok"}

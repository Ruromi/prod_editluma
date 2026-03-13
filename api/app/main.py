from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import ai, billing, credits, health, jobs, upload

app = FastAPI(
    title="EditLuma API",
    version="0.1.0",
    openapi_url=None if settings.is_production else "/openapi.json",
    docs_url=None if settings.is_production else "/docs",
    redoc_url=None if settings.is_production else "/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(upload.router)
app.include_router(jobs.router)
app.include_router(ai.router)
app.include_router(credits.router)
app.include_router(billing.router)


@app.get("/")
async def root():
    return {"service": "EditLuma API", "version": "0.1.0"}

"""
Celery application instance.
Import this module to get the configured Celery app.
"""
import os
from pathlib import Path

from celery import Celery
from dotenv import load_dotenv

# Load shared env as fallback, then api/.env with override=True so api values win
_SHARED_ENV = Path(__file__).parents[2] / ".env.shared"
_API_ENV = Path(__file__).parents[1] / "api" / ".env"
load_dotenv(_SHARED_ENV)
load_dotenv(_API_ENV, override=True)

broker = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
backend = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/1")

celery_app = Celery(
    "editluma",
    broker=broker,
    backend=backend,
    include=["worker.tasks.process"],
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
    # Retry policy defaults
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    worker_prefetch_multiplier=1,
)

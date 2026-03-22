# EditLuma — API & Worker 공용 이미지
# 구조: /workspace/editluma/api/ + /workspace/editluma/worker/
#
# API 실행:
#   docker run -e ... editluma-api
# Worker 실행:
#   docker run -e ... editluma-api \
#     celery -A worker.celery_app worker --loglevel=info -Q celery,default

FROM python:3.12-slim

# 보안: root 아닌 유저로 실행
RUN useradd --create-home --shell /bin/bash app

WORKDIR /workspace/editluma

# 의존성 먼저 설치 (레이어 캐시 활용)
COPY api/requirements.txt api/requirements.txt
RUN pip install --no-cache-dir -r api/requirements.txt

# 소스 복사
COPY api/app/ api/app/
COPY worker/ worker/

# Python 경로 설정
# - /workspace/editluma/api  → `from app.xxx` (FastAPI)
# - /workspace/editluma      → `from worker.xxx` (Celery)
ENV PYTHONPATH=/workspace/editluma/api:/workspace/editluma

RUN chown -R app:app /workspace
USER app

EXPOSE 8000

# 기본 CMD: FastAPI (Worker는 railway.toml / render.yaml / docker-compose에서 override)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]

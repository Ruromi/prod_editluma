# EditLuma Production

운영 배포 기준 소스입니다.

## 배포 구조

```
prod/
├── web/          → Vercel Project A (Next.js)
├── api/          → Vercel Project B (FastAPI)
├── worker/       → Railway / Render (Celery)
├── supabase/     → Supabase (DB 마이그레이션)
├── Dockerfile    → api + worker 공용 이미지
└── docker-compose.yml  → 로컬 검증용
```

운영 배포는 같은 GitHub 저장소에서 Vercel 프로젝트를 둘로 나눠 쓰는 구성을 권장합니다.

- `web/` 프로젝트: 사용자용 프론트엔드
- `api/` 프로젝트: FastAPI 백엔드

`prod/` 루트 전체를 Vercel 하나에 올리는 방식은 설정이 꼬이기 쉬워서 권장하지 않습니다.

---

## 1단계 — Supabase DB 마이그레이션

Supabase `SQL Editor`에서 순서대로 실행합니다.

```
supabase/migrations/0003_init_public_jobs.sql
supabase/migrations/0004_add_prompt_tracking.sql
supabase/migrations/0005_add_user_credits.sql
supabase/migrations/0006_add_credit_ledger.sql
```

> `0001_init_dev_schema.sql`은 dev 전용이므로 운영 배포 시 불필요합니다.

---

## 2단계 — 백엔드 배포 (Vercel Project B)

1. [vercel.com](https://vercel.com) → New Project → GitHub repo import
2. **Repository**: `Ruromi/prod_editluma`
3. **Root Directory**: `api`
4. `api/vercel.json`이 Python 런타임과 라우팅을 처리합니다.
5. 환경변수는 `VERCEL_ENV.md`의 `API project` 섹션을 그대로 넣습니다.

배포가 완료되면 기본 도메인은 다음 형태가 됩니다.

```text
https://<api-project>.vercel.app
```

헬스체크:

```text
https://<api-project>.vercel.app/health
https://<api-project>.vercel.app/api/health
```

> API 프로젝트에 Deployment Protection이 켜져 있으면 `INTERNAL_API_URL`로 사용할 수 없습니다. 공개 Production 도메인을 사용하세요.

### Railway / Render 대안

Vercel 대신 Railway/Render에 API를 올려도 됩니다.

1. [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. **Root Directory**: `prod`
3. **Add Plugin**: Redis (Railway 내장 Redis 추가)
4. **Service 1 — API**
   - Dockerfile: `prod/Dockerfile` (자동 감지)
   - Start Command: 기본값 사용 (Dockerfile CMD)
5. **Service 2 — Worker**
   - 위 서비스 복제 또는 동일 Repo 재연결
   - Start Command 오버라이드:
     ```
     celery -A worker.celery_app worker --loglevel=info -Q celery,default
     ```
6. 각 서비스에 환경변수 설정 (`api/.env.example` 참고):

| 변수 | 값 |
|---|---|
| `ENVIRONMENT` | `production` |
| `SUPABASE_URL` | Supabase Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service Role Key |
| `SUPABASE_SCHEMA` | `public` |
| `REDIS_URL` | Railway Redis URL |
| `CELERY_BROKER_URL` | Railway Redis URL |
| `CELERY_RESULT_BACKEND` | Railway Redis URL (다른 DB 번호 가능) |
| `STORAGE_ENDPOINT_URL` | R2/S3 엔드포인트 |
| `STORAGE_BUCKET` | `editluma-uploads` |
| `STORAGE_ACCESS_KEY` | S3 Access Key |
| `STORAGE_SECRET_KEY` | S3 Secret Key |
| `IDEOGRAM_API_KEY` | Ideogram API Key |
| `GROQ_API_KEY` | Groq API Key |
| `WEB_APP_URL` | `https://your-app.vercel.app` |
| `CORS_ORIGINS` | `["https://your-app.vercel.app"]` |
| `POLAR_SERVER` | `production` |
| `POLAR_ACCESS_TOKEN` | Polar Access Token |
| `POLAR_WEBHOOK_SECRET` | Polar Webhook Secret |

### 로컬 Docker 검증

```bash
cp api/.env.example api/.env
# api/.env 실제 값 입력 후:
docker compose up --build
```

API: http://localhost:8000
Health: http://localhost:8000/health

---

## 3단계 — 프론트엔드 배포 (Vercel Project A)

1. [vercel.com](https://vercel.com) → New Project → GitHub repo import
2. **Repository**: `Ruromi/prod_editluma`
3. **Root Directory**: `web`
4. **Framework Preset**: Next.js (자동 감지)
5. **Build Command**: `npm run build` (기본값)
6. **Output Directory**: `.next` (기본값)
7. 환경변수는 `VERCEL_ENV.md`의 `Web project` 섹션을 그대로 넣습니다.

### Vercel 환경변수

`VERCEL_ENV.md`와 `web/.env.example` 참고:

| 변수 | 값 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key |
| `SUPABASE_SCHEMA` | `public` |
| `INTERNAL_API_URL` | API Vercel 프로젝트의 Production URL |
| `NEXT_PUBLIC_API_URL` | 비워두기 (브라우저는 `/api/*` 상대경로 사용) |

> `INTERNAL_API_URL`에는 `https://<api-project>.vercel.app`처럼 `/api`를 붙이지 않은 베이스 URL을 넣습니다.

### 커스텀 도메인

- `www.editluma.com` / `editluma.com`은 반드시 `web` 프로젝트에 연결합니다.
- API는 기본 `*.vercel.app`를 그대로 써도 되고, 원하면 `api.editluma.com` 같은 별도 도메인을 연결할 수 있습니다.

---

## Supabase Auth 콜백 URL 설정

Supabase Dashboard → Authentication → URL Configuration:

- **Site URL**: `https://your-app.vercel.app`
- **Redirect URLs**: `https://your-app.vercel.app/auth/callback`

---

## 헬스체크

- Web: `GET /`
- API: `GET /health`
- API: `GET /api/health`
- Worker: Celery 로그 확인 (Railway 서비스 로그)

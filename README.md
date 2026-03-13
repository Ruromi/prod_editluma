# EditLuma Production

운영 배포 기준 소스입니다.

## 배포 구조

```
prod/
├── web/          → Vercel same project (Next.js)
├── api/          → Vercel same project (FastAPI)
├── worker/       → Railway / Render (Celery)
├── supabase/     → Supabase (DB 마이그레이션)
├── Dockerfile    → api + worker 공용 이미지
└── docker-compose.yml  → 로컬 검증용
```

운영 배포는 같은 GitHub 저장소를 Vercel 프로젝트 하나로 연결하는 기준입니다.

- `web/`: 사용자용 프론트엔드
- `api/`: 같은 프로젝트 안의 Python 서버리스 API
- 루트 `vercel.json`: `/api/*`는 Python으로, 나머지는 `web` Next.js로 라우팅

---

## 1단계 — Supabase DB 마이그레이션

Supabase `SQL Editor`에서 순서대로 실행합니다.

```
supabase/migrations/0003_init_public_jobs.sql
supabase/migrations/0004_add_prompt_tracking.sql
supabase/migrations/0005_add_user_credits.sql
supabase/migrations/0006_add_credit_ledger.sql
supabase/migrations/0007_add_credit_usage_ledger.sql
```

> `0001_init_dev_schema.sql`은 dev 전용이므로 운영 배포 시 불필요합니다.

---

## 2단계 — Vercel 배포 (단일 프로젝트)

1. [vercel.com](https://vercel.com) → New Project → GitHub repo import
2. **Repository**: `Ruromi/prod_editluma`
3. **Root Directory**: repo root (`.`)
4. `vercel.json`이 `web/package.json`과 `api/index.py`를 함께 빌드합니다.
5. 환경변수는 `VERCEL_ENV.md`를 그대로 넣습니다.
6. `NEXT_PUBLIC_API_URL`과 `INTERNAL_API_URL`은 둘 다 빈 값으로 둡니다.

### 단일 프로젝트 환경변수

| 변수 | 값 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key |
| `ENVIRONMENT` | `production` |
| `SUPABASE_URL` | Supabase Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service Role Key |
| `SUPABASE_SCHEMA` | `public` |
| `WEB_APP_URL` | `https://www.editluma.com` |
| `CORS_ORIGINS` | `["https://www.editluma.com"]` |
| `NEXT_PUBLIC_API_URL` | 비워두기 |
| `INTERNAL_API_URL` | 비워두기 |
| `REDIS_URL` | Railway Redis URL |
| `CELERY_BROKER_URL` | Railway Redis URL |
| `CELERY_RESULT_BACKEND` | Railway Redis URL (다른 DB 번호 가능) |
| `STORAGE_ENDPOINT_URL` | R2/S3 엔드포인트 |
| `STORAGE_BUCKET` | `editluma-uploads` |
| `STORAGE_ACCESS_KEY` | S3 Access Key |
| `STORAGE_SECRET_KEY` | S3 Secret Key |
| `IDEOGRAM_API_KEY` | Ideogram API Key |
| `GROQ_API_KEY` | Groq API Key |
| `POLAR_SERVER` | `production` |
| `POLAR_ACCESS_TOKEN` | Polar Access Token |
| `POLAR_WEBHOOK_SECRET` | Polar Webhook Secret |

> `www.editluma.com`은 이 프로젝트 하나에만 연결합니다.

### Railway / Render 대안

백엔드와 워커를 Vercel 밖으로 빼고 싶다면 Railway/Render를 써도 됩니다. 지금 문서는 단일 Vercel 프로젝트 기준입니다.

### 로컬 Docker 검증

```bash
cp api/.env.example api/.env
# api/.env 실제 값 입력 후:
docker compose up --build
```

API: http://localhost:8000
Health: http://localhost:8000/health

---

## 3단계 — 도메인 연결

1. `www.editluma.com` / `editluma.com`을 이 프로젝트에 연결합니다.
2. `Settings -> Git -> Production Branch`가 `main`인지 확인합니다.
3. `Deployments`에서 최신 `main` 배포가 `Production`으로 승격되었는지 확인합니다.
4. `Settings -> Deployment Protection`이 켜져 있다면, 최소한 Production 배포는 공개 접근 가능해야 합니다.

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

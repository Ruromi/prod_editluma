# Vercel Environment Variables

같은 GitHub 저장소를 Vercel 프로젝트 하나로 배포하는 기준입니다.

- Repository: `Ruromi/prod_editluma`
- Root Directory: repo root (`.`)
- 같은 프로젝트 안에서 `web/` Next.js와 `api/` FastAPI를 함께 배포합니다.

## Required env

아래 값을 같은 Vercel 프로젝트에 넣습니다.

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_SCHEMA=public
ENVIRONMENT=production
WEB_APP_URL=https://www.editluma.com
CORS_ORIGINS=["https://www.editluma.com"]
NEXT_PUBLIC_API_URL=
INTERNAL_API_URL=
PRESIGN_UPLOAD_EXPIRY_SECONDS=300
PRESIGN_DOWNLOAD_EXPIRY_SECONDS=3600
INITIAL_USER_CREDITS=100
IMAGE_REQUEST_CREDIT_COST=10
ADMIN_ALLOWED_IPS=203.0.113.10
ADMIN_EMAILS=admin@example.com
STORAGE_BUCKET=editluma-uploads
STORAGE_REGION=ap-northeast-2
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=
IDEOGRAM_API_KEY=
IDEOGRAM_BASE_URL=https://api.ideogram.ai
IDEOGRAM_MODEL=V_2
IDEOGRAM_TIMEOUT_MS=120000
GROQ_API_KEY=
POLAR_SERVER=production
POLAR_CHECKOUT_LINK_STARTER=
POLAR_CHECKOUT_LINK_PRO=
POLAR_CHECKOUT_LINK_MAX=
```

메모:

- `NEXT_PUBLIC_API_URL`은 반드시 빈 값으로 둡니다.
- `INTERNAL_API_URL`도 빈 값으로 둡니다. 같은 프로젝트 안의 `/api/*`를 그대로 사용합니다.
- Production에서 `ENVIRONMENT=production`이면 `POLAR_SERVER=production`도 같이 들어가야 합니다.

필요한 경우에만 추가:

```text
STORAGE_ENDPOINT_URL=
REDIS_URL=
CELERY_BROKER_URL=
CELERY_RESULT_BACKEND=
POLAR_ACCESS_TOKEN=
POLAR_WEBHOOK_SECRET=
POLAR_PRODUCT_ID_STARTER=
POLAR_PRODUCT_ID_PRO=
POLAR_PRODUCT_ID_MAX=
```

메모:

- AWS S3를 쓰면 `STORAGE_ENDPOINT_URL`은 비워도 됩니다.
- 결제를 checkout link 방식으로만 쓸 거면 `POLAR_CHECKOUT_LINK_*`만 채워도 됩니다.

## Quick checks

- Root Directory: repo root (`.`)
- `www.editluma.com` 도메인 연결 대상: 이 Vercel 프로젝트 하나
- Web 헬스체크: `https://www.editluma.com/`
- API 헬스체크: `https://www.editluma.com/health`
- API 헬스체크: `https://www.editluma.com/api/health`

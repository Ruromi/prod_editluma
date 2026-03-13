# Vercel Environment Variables

같은 GitHub 저장소에서 Vercel 프로젝트를 둘로 나눠 배포하는 기준입니다.

- `web` 프로젝트: Root Directory `web`
- `api` 프로젝트: Root Directory `api`

## Web project

아래 값을 `web` Vercel 프로젝트에 넣습니다.

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_SCHEMA=public
NEXT_PUBLIC_API_URL=
INTERNAL_API_URL=https://<api-project>.vercel.app
```

메모:

- `NEXT_PUBLIC_API_URL`은 반드시 빈 값으로 둡니다.
- `INTERNAL_API_URL`에는 `/api`를 붙이지 않습니다.
- `INTERNAL_API_URL`은 공개 Production URL이어야 합니다. Preview URL이나 보호된 URL은 쓰면 안 됩니다.

## API project

아래 값을 `api` Vercel 프로젝트에 넣습니다.

```text
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_SCHEMA=public
ENVIRONMENT=production
WEB_APP_URL=https://www.editluma.com
CORS_ORIGINS=["https://www.editluma.com"]
PRESIGN_UPLOAD_EXPIRY_SECONDS=300
PRESIGN_DOWNLOAD_EXPIRY_SECONDS=3600
INITIAL_USER_CREDITS=100
IMAGE_REQUEST_CREDIT_COST=10
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
- Production에서 `ENVIRONMENT=production`이면 `POLAR_SERVER=production`도 같이 들어가야 합니다.

## Quick checks

- `web` 프로젝트 Root Directory: `web`
- `api` 프로젝트 Root Directory: `api`
- `www.editluma.com` 도메인 연결 대상: `web` 프로젝트
- API 헬스체크: `https://<api-project>.vercel.app/health`

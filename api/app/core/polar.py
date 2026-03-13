import base64
import hashlib
import hmac
import json
import time
from dataclasses import dataclass
from typing import Any, Mapping
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

import httpx
from fastapi import HTTPException

from app.core.auth import AuthenticatedUser
from app.core.config import settings

POLAR_WEBHOOK_TOLERANCE_SECONDS = 300


@dataclass(frozen=True)
class BillingPackage:
    id: str
    name: str
    badge: str
    price: float
    credits: int
    bonus: int
    description: str
    product_id: str
    checkout_url: str = ""
    highlight: bool = False
    currency: str = "USD"

    @property
    def total_credits(self) -> int:
        return self.credits + self.bonus

    @property
    def available(self) -> bool:
        return bool(self.checkout_url or (settings.polar_access_token and self.product_id))

    def to_public_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "badge": self.badge,
            "price": self.price,
            "credits": self.credits,
            "bonus": self.bonus,
            "total_credits": self.total_credits,
            "description": self.description,
            "highlight": self.highlight,
            "currency": self.currency,
            "available": self.available,
        }


def polar_api_base_url() -> str:
    if settings.polar_server == "production":
        return "https://api.polar.sh/v1"
    return "https://sandbox-api.polar.sh/v1"


def billing_return_url() -> str:
    return f"{settings.web_app_url.rstrip('/')}/billing"


def billing_success_url() -> str:
    return f"{settings.web_app_url.rstrip('/')}/billing?checkout=success&checkout_id={{CHECKOUT_ID}}"


def get_billing_packages() -> list[BillingPackage]:
    return [
        BillingPackage(
            id="starter",
            name="100 Credits",
            badge="입문용",
            price=2.99,
            credits=100,
            bonus=0,
            description="가볍게 써보거나 급하게 소량 충전할 때 적합한 기본 패키지",
            product_id=settings.polar_product_id_starter,
            checkout_url=settings.polar_checkout_link_starter,
        ),
        BillingPackage(
            id="pro",
            name="500 Credits",
            badge="가장 많이 선택",
            price=12.99,
            credits=500,
            bonus=0,
            description="반복 생성과 리터치를 꾸준히 돌릴 때 가장 무난한 메인 패키지",
            product_id=settings.polar_product_id_pro,
            checkout_url=settings.polar_checkout_link_pro,
            highlight=True,
        ),
        BillingPackage(
            id="max",
            name="1500 Credits",
            badge="대용량",
            price=29.99,
            credits=1500,
            bonus=0,
            description="팀 단위 작업이나 대량 생성이 많은 사용자를 위한 대용량 패키지",
            product_id=settings.polar_product_id_max,
            checkout_url=settings.polar_checkout_link_max,
        ),
    ]


def get_billing_package(package_id: str) -> BillingPackage | None:
    for package in get_billing_packages():
        if package.id == package_id:
            return package
    return None


def get_billing_package_by_product_id(product_id: str | None) -> BillingPackage | None:
    if not product_id:
        return None

    for package in get_billing_packages():
        if package.product_id == product_id:
            return package
    return None


async def _polar_request(
    method: str,
    path: str,
    *,
    json_body: dict[str, Any] | None = None,
) -> dict[str, Any]:
    if not settings.polar_access_token:
        raise HTTPException(status_code=503, detail="Polar 결제 설정이 비어 있습니다.")

    headers = {
        "Authorization": f"Bearer {settings.polar_access_token}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.request(
            method,
            f"{polar_api_base_url()}{path}",
            headers=headers,
            json=json_body,
        )

    try:
        payload = response.json()
    except ValueError:
        payload = {"detail": response.text}

    if response.is_success:
        return payload

    detail = payload.get("detail") if isinstance(payload, dict) else None
    raise HTTPException(
        status_code=502,
        detail=detail or "Polar 결제 서버와 통신하지 못했습니다.",
    )


async def create_checkout_for_package(
    *,
    package: BillingPackage,
    user: AuthenticatedUser,
) -> dict[str, Any]:
    if package.checkout_url:
        query: dict[str, str] = dict(parse_qsl(urlsplit(package.checkout_url).query, keep_blank_values=True))
        query["reference_id"] = user.id
        query["utm_campaign"] = "credit_topup"
        query["utm_content"] = package.id
        if user.email:
            query["customer_email"] = user.email

        parts = urlsplit(package.checkout_url)
        checkout_url = urlunsplit(
            (
                parts.scheme,
                parts.netloc,
                parts.path,
                urlencode(query),
                parts.fragment,
            )
        )
        return {
            "id": None,
            "checkout_url": checkout_url,
            "package_id": package.id,
        }

    if not package.product_id:
        raise HTTPException(status_code=503, detail="해당 결제 상품이 아직 연결되지 않았습니다.")

    metadata = {
        "package_id": package.id,
        "credits": str(package.credits),
        "bonus": str(package.bonus),
        "total_credits": str(package.total_credits),
        "user_id": user.id,
    }

    payload: dict[str, Any] = {
        "products": [package.product_id],
        "success_url": billing_success_url(),
        "return_url": billing_return_url(),
        "external_customer_id": user.id,
        "metadata": metadata,
    }

    if user.email:
        payload["customer_email"] = user.email

    response = await _polar_request("POST", "/checkouts/", json_body=payload)
    return {
        "id": response.get("id"),
        "checkout_url": response.get("url"),
        "package_id": package.id,
    }


def _expected_webhook_signature(secret: str, signed_payload: bytes) -> str:
    digest = hmac.new(secret.encode("utf-8"), signed_payload, hashlib.sha256).digest()
    return base64.b64encode(digest).decode("utf-8")


def verify_and_parse_webhook(payload: bytes, headers: Mapping[str, str]) -> dict[str, Any]:
    if not settings.polar_webhook_secret:
        raise HTTPException(status_code=503, detail="Polar 웹훅 비밀키가 설정되지 않았습니다.")

    webhook_id = headers.get("webhook-id")
    webhook_timestamp = headers.get("webhook-timestamp")
    webhook_signature = headers.get("webhook-signature")

    if not webhook_id or not webhook_timestamp or not webhook_signature:
        raise HTTPException(status_code=400, detail="Polar 웹훅 헤더가 누락되었습니다.")

    try:
        timestamp_value = float(webhook_timestamp)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="유효하지 않은 Polar 웹훅 타임스탬프입니다.") from exc

    if abs(time.time() - timestamp_value) > POLAR_WEBHOOK_TOLERANCE_SECONDS:
        raise HTTPException(status_code=400, detail="Polar 웹훅 타임스탬프가 허용 범위를 벗어났습니다.")

    signed_payload = b".".join(
        [
            webhook_id.encode("utf-8"),
            webhook_timestamp.encode("utf-8"),
            payload,
        ]
    )
    expected_signature = _expected_webhook_signature(settings.polar_webhook_secret, signed_payload)

    signatures = []
    for signature_part in webhook_signature.split():
        version, _, signature = signature_part.partition(",")
        if version == "v1" and signature:
            signatures.append(signature)

    if not signatures:
        raise HTTPException(status_code=400, detail="Polar 웹훅 서명이 비어 있습니다.")

    if not any(hmac.compare_digest(expected_signature, signature) for signature in signatures):
        raise HTTPException(status_code=400, detail="Polar 웹훅 서명 검증에 실패했습니다.")

    try:
        return json.loads(payload.decode("utf-8"))
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=400, detail="Polar 웹훅 본문이 JSON이 아닙니다.") from exc

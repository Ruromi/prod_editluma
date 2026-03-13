import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.auth import AuthenticatedUser, get_current_user
from app.core.config import settings
from app.core.credits import record_credit_ledger_entry
from app.core.polar import (
    create_checkout_for_package,
    get_billing_package,
    get_billing_package_by_product_id,
    get_billing_packages,
    verify_and_parse_webhook,
)
from app.core.supabase import db_schema, get_supabase

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/billing", tags=["billing"])


class BillingPackageResponse(BaseModel):
    id: str
    name: str
    badge: str
    price: float
    credits: int
    bonus: int
    total_credits: int
    description: str
    highlight: bool = False
    currency: str = "USD"
    available: bool = False


class BillingHistoryItem(BaseModel):
    id: str
    source_id: str
    credits_added: int
    balance_after: int
    description: str | None = None
    package_id: str | None = None
    package_name: str | None = None
    product_id: str | None = None
    checkout_id: str | None = None
    order_id: str | None = None
    amount: int | None = None
    currency: str | None = None
    created_at: str
    metadata: dict[str, Any] = Field(default_factory=dict)


class BillingPackagesResponse(BaseModel):
    packages: list[BillingPackageResponse]
    provider: str = "polar"
    mode: str


class CreateCheckoutRequest(BaseModel):
    package_id: str


class CreateCheckoutResponse(BaseModel):
    checkout_url: str
    checkout_id: str | None = None
    package_id: str


class WebhookResponse(BaseModel):
    received: bool
    event_type: str
    applied: bool = False
    balance: int | None = None


def _is_missing_credit_ledger_error(exc: Exception) -> bool:
    code = str(getattr(exc, "code", "") or "")
    message = str(exc)
    return code == "PGRST205" or ("credit_ledger" in message and "schema cache" in message)


def _metadata_dict(row: dict[str, Any]) -> dict[str, Any]:
    metadata = row.get("metadata")
    return metadata if isinstance(metadata, dict) else {}


def _map_history_row(row: dict[str, Any]) -> BillingHistoryItem:
    metadata = _metadata_dict(row)
    package = get_billing_package(metadata.get("package_id") or "")
    return BillingHistoryItem(
        id=str(row["id"]),
        source_id=str(row["source_id"]),
        credits_added=int(row["delta"]),
        balance_after=int(row["balance_after"]),
        description=row.get("description"),
        package_id=metadata.get("package_id"),
        package_name=package.name if package else metadata.get("package_name"),
        product_id=metadata.get("product_id"),
        checkout_id=metadata.get("checkout_id"),
        order_id=metadata.get("order_id"),
        amount=metadata.get("amount"),
        currency=metadata.get("currency"),
        created_at=str(row["created_at"]),
        metadata=metadata,
    )


@router.get("/packages", response_model=BillingPackagesResponse)
async def list_billing_packages():
    return BillingPackagesResponse(
        packages=[BillingPackageResponse(**package.to_public_dict()) for package in get_billing_packages()],
        mode=settings.polar_server,
    )


@router.post("/checkout", response_model=CreateCheckoutResponse)
async def create_checkout(
    body: CreateCheckoutRequest,
    user: AuthenticatedUser = Depends(get_current_user),
):
    package = get_billing_package(body.package_id)
    if package is None:
        raise HTTPException(status_code=404, detail="존재하지 않는 크레딧 패키지입니다.")

    payload = await create_checkout_for_package(package=package, user=user)
    checkout_url = payload.get("checkout_url")
    if not checkout_url:
        raise HTTPException(status_code=502, detail="Polar 체크아웃 URL을 생성하지 못했습니다.")

    return CreateCheckoutResponse(
        checkout_url=checkout_url,
        checkout_id=payload.get("id"),
        package_id=package.id,
    )


@router.get("/history", response_model=list[BillingHistoryItem])
async def list_billing_history(user: AuthenticatedUser = Depends(get_current_user)):
    try:
        result = (
            get_supabase()
            .schema(db_schema())
            .table("credit_ledger")
            .select("*")
            .eq("user_id", user.id)
            .eq("source", "polar_topup")
            .order("created_at", desc=True)
            .limit(20)
            .execute()
        )
    except Exception as exc:
        if _is_missing_credit_ledger_error(exc):
            logger.warning("Billing history unavailable, returning empty list: %s", exc)
            return []
        raise HTTPException(status_code=503, detail="결제 내역을 불러오지 못했습니다.") from exc

    return [_map_history_row(row) for row in (result.data or [])]


@router.post("/webhooks/polar", response_model=WebhookResponse)
async def polar_webhook(request: Request):
    payload = await request.body()
    event = verify_and_parse_webhook(payload, request.headers)
    event_type = str(event.get("type") or "")

    if event_type != "order.paid":
        return WebhookResponse(received=True, event_type=event_type or "unknown")

    order = event.get("data")
    if not isinstance(order, dict):
        raise HTTPException(status_code=400, detail="Polar order payload가 비어 있습니다.")

    metadata = order.get("metadata")
    order_metadata = metadata if isinstance(metadata, dict) else {}
    customer = order.get("customer")
    customer_payload = customer if isinstance(customer, dict) else {}

    user_id = (
        customer_payload.get("external_id")
        or order_metadata.get("user_id")
        or order_metadata.get("reference_id")
    )
    if not user_id:
        raise HTTPException(status_code=400, detail="Polar customer external_id가 없습니다.")

    order_id = str(order.get("id") or "")
    if not order_id:
        raise HTTPException(status_code=400, detail="Polar order id가 없습니다.")

    package_id = order_metadata.get("package_id") or order_metadata.get("utm_content")
    package = get_billing_package(str(package_id)) if package_id else None
    if package is None:
        package = get_billing_package_by_product_id(order.get("product_id"))
    if package is None:
        raise HTTPException(status_code=400, detail="이 주문에 매칭되는 크레딧 패키지를 찾지 못했습니다.")

    billing_reason = order.get("billing_reason")
    if billing_reason and billing_reason != "purchase":
        logger.info("Ignoring non-purchase Polar order %s with billing_reason=%s", order_id, billing_reason)
        return WebhookResponse(received=True, event_type=event_type)

    paid = order.get("paid")
    status = str(order.get("status") or "").lower()
    if paid is not True and status != "paid":
        logger.warning(
            "Ignoring unpaid Polar order %s with paid=%r status=%r",
            order_id,
            paid,
            order.get("status"),
        )
        return WebhookResponse(received=True, event_type=event_type)

    ledger_metadata = {
        "provider": "polar",
        "order_id": order_id,
        "checkout_id": order.get("checkout_id"),
        "product_id": order.get("product_id"),
        "package_id": package.id,
        "package_name": package.name,
        "amount": order.get("total_amount"),
        "currency": order.get("currency"),
        "reference_id": order_metadata.get("reference_id"),
        "utm_campaign": order_metadata.get("utm_campaign"),
        "utm_content": order_metadata.get("utm_content"),
        "billing_reason": billing_reason,
        "polar_customer_id": customer_payload.get("id"),
        "polar_customer_external_id": customer_payload.get("external_id"),
        "polar_customer_email": customer_payload.get("email"),
        "paid": order.get("paid"),
        "status": order.get("status"),
        "event_type": event_type,
        "event_id": event.get("id"),
    }

    result = await record_credit_ledger_entry(
        user_id=str(user_id),
        source="polar_topup",
        source_id=order_id,
        delta=package.total_credits,
        description=f"Polar top-up: {package.name}",
        metadata=ledger_metadata,
    )

    return WebhookResponse(
        received=True,
        event_type=event_type,
        applied=bool(result.get("applied")),
        balance=int(result["balance"]) if result.get("balance") is not None else None,
    )

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

REFUND_REASONS = {
    "duplicate",
    "fraudulent",
    "customer_request",
    "service_disruption",
    "satisfaction_guarantee",
    "dispute_prevention",
    "other",
}


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


class UsageHistoryItem(BaseModel):
    id: str
    source_id: str
    credits_used: int
    balance_after: int
    description: str | None = None
    job_id: str | None = None
    filename: str | None = None
    mode: str | None = None
    prompt: str | None = None
    created_at: str
    metadata: dict[str, Any] = Field(default_factory=dict)


class RefundRequestItem(BaseModel):
    id: str
    payment_ledger_id: str | None = None
    order_id: str
    refund_id: str | None = None
    status: str
    reason: str
    amount: int
    credits_reversed: int
    comment: str | None = None
    created_at: str
    updated_at: str | None = None
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


class CreateRefundRequestRequest(BaseModel):
    payment_ledger_id: str
    reason: str = "customer_request"
    comment: str | None = None


def _is_missing_credit_ledger_error(exc: Exception) -> bool:
    code = str(getattr(exc, "code", "") or "")
    message = str(exc)
    return code == "PGRST205" or ("credit_ledger" in message and "schema cache" in message)


def _is_missing_refund_requests_error(exc: Exception) -> bool:
    code = str(getattr(exc, "code", "") or "")
    message = str(exc)
    return code in {"PGRST205", "42P01"} or "refund_requests" in message


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


def _map_usage_row(row: dict[str, Any]) -> UsageHistoryItem:
    metadata = _metadata_dict(row)
    return UsageHistoryItem(
        id=str(row["id"]),
        source_id=str(row["source_id"]),
        credits_used=abs(int(row["delta"])),
        balance_after=int(row["balance_after"]),
        description=row.get("description"),
        job_id=metadata.get("job_id"),
        filename=metadata.get("filename"),
        mode=metadata.get("mode"),
        prompt=metadata.get("prompt"),
        created_at=str(row["created_at"]),
        metadata=metadata,
    )


def _map_refund_request_row(row: dict[str, Any]) -> RefundRequestItem:
    metadata = _metadata_dict(row)
    payment_ledger_id = row.get("payment_ledger_id")
    refund_id = row.get("refund_id")
    return RefundRequestItem(
        id=str(row["id"]),
        payment_ledger_id=str(payment_ledger_id) if payment_ledger_id else None,
        order_id=str(row["order_id"]),
        refund_id=str(refund_id) if refund_id else None,
        status=str(row.get("status") or "requested"),
        reason=str(row.get("reason") or "customer_request"),
        amount=int(row.get("amount") or 0),
        credits_reversed=int(row.get("credits_reversed") or 0),
        comment=row.get("comment"),
        created_at=str(row["created_at"]),
        updated_at=str(row["updated_at"]) if row.get("updated_at") else None,
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


@router.get("/usage-history", response_model=list[UsageHistoryItem])
async def list_usage_history(user: AuthenticatedUser = Depends(get_current_user)):
    try:
        result = (
            get_supabase()
            .schema(db_schema())
            .table("credit_ledger")
            .select("*")
            .eq("user_id", user.id)
            .eq("source", "image_charge")
            .order("created_at", desc=True)
            .limit(30)
            .execute()
        )
    except Exception as exc:
        if _is_missing_credit_ledger_error(exc):
            logger.warning("Usage history unavailable, returning empty list: %s", exc)
            return []
        raise HTTPException(status_code=503, detail="사용 내역을 불러오지 못했습니다.") from exc

    return [_map_usage_row(row) for row in (result.data or [])]


@router.get("/refund-requests", response_model=list[RefundRequestItem])
async def list_refund_requests(user: AuthenticatedUser = Depends(get_current_user)):
    try:
        result = (
            get_supabase()
            .schema(db_schema())
            .table("refund_requests")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", desc=True)
            .limit(20)
            .execute()
        )
    except Exception as exc:
        if _is_missing_refund_requests_error(exc):
            logger.warning("Refund requests unavailable, returning empty list: %s", exc)
            return []
        raise HTTPException(status_code=503, detail="환불 요청 내역을 불러오지 못했습니다.") from exc

    return [_map_refund_request_row(row) for row in (result.data or [])]


@router.post("/refund-requests", response_model=RefundRequestItem)
async def create_refund_request(
    body: CreateRefundRequestRequest,
    user: AuthenticatedUser = Depends(get_current_user),
):
    payment_ledger_id = body.payment_ledger_id.strip()
    reason = body.reason.strip() or "customer_request"
    comment = body.comment.strip() if body.comment else None

    if not payment_ledger_id:
        raise HTTPException(status_code=400, detail="환불 요청할 결제 정보를 찾지 못했습니다.")

    if reason not in REFUND_REASONS:
        raise HTTPException(status_code=400, detail="지원되지 않는 환불 사유입니다.")

    db = get_supabase().schema(db_schema())
    try:
        payment_result = (
            db.table("credit_ledger")
            .select("*")
            .eq("id", payment_ledger_id)
            .eq("user_id", user.id)
            .eq("source", "polar_topup")
            .limit(1)
            .execute()
        )
    except Exception as exc:
        if _is_missing_credit_ledger_error(exc):
            raise HTTPException(status_code=503, detail="결제 내역 테이블이 아직 준비되지 않았습니다.") from exc
        raise HTTPException(status_code=503, detail="결제 내역을 불러오지 못했습니다.") from exc

    payment_rows = payment_result.data or []
    payment_row = payment_rows[0] if payment_rows else None
    if not payment_row:
        raise HTTPException(status_code=404, detail="환불 요청 가능한 결제 내역을 찾지 못했습니다.")

    metadata = _metadata_dict(payment_row)
    order_id = str(metadata.get("order_id") or payment_row.get("source_id") or "").strip()
    amount = int(metadata.get("amount") or 0)
    credits_reversed = int(payment_row.get("delta") or 0)
    package_name = str(metadata.get("package_name") or payment_row.get("description") or "Polar 결제")

    if not order_id or amount <= 0 or credits_reversed <= 0:
        raise HTTPException(status_code=400, detail="환불 요청에 필요한 결제 메타데이터가 부족합니다.")

    try:
        existing_request = (
            db.table("refund_requests")
            .select("*")
            .eq("order_id", order_id)
            .limit(1)
            .execute()
        )
    except Exception as exc:
        if _is_missing_refund_requests_error(exc):
            raise HTTPException(
                status_code=503,
                detail="환불 요청 기능을 사용하려면 최신 환불 SQL을 먼저 적용해야 합니다.",
            ) from exc
        raise HTTPException(status_code=503, detail="기존 환불 요청 여부를 확인하지 못했습니다.") from exc

    existing_rows = existing_request.data or []
    existing_row = existing_rows[0] if existing_rows else None
    if existing_row:
        status = str(existing_row.get("status") or "requested")
        if status == "completed":
            raise HTTPException(status_code=409, detail="이미 환불 처리된 결제입니다.")
        if status == "failed":
            raise HTTPException(status_code=409, detail="이 결제 건은 이전 환불 요청 이력이 있어 관리자 확인이 필요합니다.")
        if status == "manual_review":
            raise HTTPException(status_code=409, detail="이 결제 건은 이미 수동 검토 중입니다.")
        raise HTTPException(status_code=409, detail="이미 환불 요청이 접수되었습니다.")

    try:
        inserted = (
            db.table("refund_requests")
            .insert(
                {
                    "user_id": user.id,
                    "payment_ledger_id": payment_ledger_id,
                    "order_id": order_id,
                    "status": "requested",
                    "reason": reason,
                    "amount": amount,
                    "credits_reversed": credits_reversed,
                    "comment": comment,
                    "metadata": {
                        "package_name": package_name,
                        "polar_customer_email": user.email,
                        "requested_by": "user",
                    },
                }
            )
            .execute()
        )
    except Exception as exc:
        logger.exception("Failed to insert refund request for user %s and payment %s", user.id, payment_ledger_id)
        if _is_missing_refund_requests_error(exc):
            raise HTTPException(
                status_code=503,
                detail="환불 요청 기능을 사용하려면 최신 환불 SQL을 먼저 적용해야 합니다.",
            ) from exc
        raise HTTPException(status_code=503, detail="환불 요청을 저장하지 못했습니다.") from exc

    inserted_rows = inserted.data or []
    if not inserted_rows:
        raise HTTPException(status_code=503, detail="환불 요청을 저장하지 못했습니다.")

    return _map_refund_request_row(inserted_rows[0])


@router.delete("/refund-requests/{refund_request_id}")
async def cancel_refund_request(
    refund_request_id: str,
    user: AuthenticatedUser = Depends(get_current_user),
):
    refund_request_id = refund_request_id.strip()
    if not refund_request_id:
        raise HTTPException(status_code=400, detail="취소할 환불 요청 정보를 찾지 못했습니다.")

    db = get_supabase().schema(db_schema())
    try:
        existing_request = (
            db.table("refund_requests")
            .select("*")
            .eq("id", refund_request_id)
            .eq("user_id", user.id)
            .limit(1)
            .execute()
        )
    except Exception as exc:
        if _is_missing_refund_requests_error(exc):
            raise HTTPException(
                status_code=503,
                detail="환불 요청 기능을 사용하려면 최신 환불 SQL을 먼저 적용해야 합니다.",
            ) from exc
        raise HTTPException(status_code=503, detail="환불 요청 정보를 불러오지 못했습니다.") from exc

    existing_rows = existing_request.data or []
    existing_row = existing_rows[0] if existing_rows else None
    if not existing_row:
        raise HTTPException(status_code=404, detail="취소할 환불 요청을 찾지 못했습니다.")

    status = str(existing_row.get("status") or "requested")
    if status != "requested":
        raise HTTPException(status_code=409, detail="이미 처리 중이거나 완료된 환불 요청은 취소할 수 없습니다.")

    try:
        db.table("refund_requests").delete().eq("id", refund_request_id).eq("user_id", user.id).execute()
    except Exception as exc:
        if _is_missing_refund_requests_error(exc):
            raise HTTPException(
                status_code=503,
                detail="환불 요청 기능을 사용하려면 최신 환불 SQL을 먼저 적용해야 합니다.",
            ) from exc
        raise HTTPException(status_code=503, detail="환불 요청을 취소하지 못했습니다.") from exc

    return {"cancelled": True, "refund_request_id": refund_request_id}


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

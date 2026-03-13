import logging
from typing import Any

from fastapi import HTTPException

from app.core.auth import AuthenticatedUser
from app.core.config import settings
from app.core.supabase import RpcError, call_rpc, db_schema, get_supabase

logger = logging.getLogger(__name__)

_CREDIT_BALANCE_ERROR = "크레딧 정보를 불러오지 못했습니다."
_CREDIT_PROCESSING_ERROR = "크레딧 처리 중 오류가 발생했습니다."
_CREDIT_LEDGER_ERROR = "크레딧 내역 처리 중 오류가 발생했습니다."


def _is_missing_rpc_function(exc: RpcError, function_name: str) -> bool:
    if not isinstance(exc.payload, dict):
        return False

    code = str(exc.payload.get("code") or "")
    message = str(exc.payload.get("message") or "")
    details = str(exc.payload.get("details") or "")
    if code != "PGRST202":
        return False

    return function_name in message or function_name in details


def _extract_balance(row: dict[str, Any] | None) -> int | None:
    if not row:
        return None

    for key in ("balance", "credits"):
        value = row.get(key)
        if value is not None:
            return int(value)

    return None


def _credit_column_name(row: dict[str, Any] | None) -> str:
    if row and "balance" in row:
        return "balance"
    if row and "credits" in row:
        return "credits"
    return "balance"


def _usage_description(mode: str, filename: str) -> str:
    action = "이미지 생성" if mode == "generate" else "이미지 보정"
    return f"{action}: {filename}"


def _usage_metadata(
    *,
    job_id: str,
    filename: str,
    object_key: str,
    mode: str,
    prompt: str | None,
    job_type: str,
) -> dict[str, Any]:
    return {
        "job_id": job_id,
        "filename": filename,
        "object_key": object_key,
        "mode": mode,
        "prompt": prompt,
        "type": job_type,
    }


def _select_credit_row(user_id: str) -> dict[str, Any] | None:
    result = (
        get_supabase()
        .schema(db_schema())
        .table("user_credits")
        .select("*")
        .eq("user_id", user_id)
        .limit(1)
        .execute()
    )
    return result.data[0] if result.data else None


def _insert_credit_row(user_id: str, initial_credits: int) -> dict[str, Any]:
    payloads = (
        {"user_id": user_id, "balance": initial_credits},
        {"user_id": user_id, "credits": initial_credits},
    )

    last_error: Exception | None = None
    for payload in payloads:
        try:
            result = (
                get_supabase()
                .schema(db_schema())
                .table("user_credits")
                .insert(payload)
                .execute()
            )
        except Exception as exc:
            last_error = exc
            continue

        if result.data:
            return result.data[0]

        row = _select_credit_row(user_id)
        if row:
            return row

    if last_error is not None:
        raise last_error

    raise RuntimeError("Failed to create credit row")


def _ensure_credit_row(user_id: str) -> tuple[dict[str, Any], str, int]:
    row = _select_credit_row(user_id)
    if not row:
        row = _insert_credit_row(user_id, max(settings.initial_user_credits, 0))

    column = _credit_column_name(row)
    balance = _extract_balance(row)
    if balance is None:
        raise RuntimeError("Credit row does not contain a balance column")

    return row, column, balance


def _direct_get_or_create_credit_balance(user_id: str) -> int:
    _, _, balance = _ensure_credit_row(user_id)
    return balance


def _direct_charge_and_create_job(
    *,
    user: AuthenticatedUser,
    filename: str,
    object_key: str,
    mode: str,
    prompt: str | None,
    job_type: str = "image",
) -> dict[str, Any]:
    credit_cost = max(settings.image_request_credit_cost, 0)
    balance = 0
    next_balance = 0

    for _ in range(3):
        _, column, balance = _ensure_credit_row(user.id)

        if balance < credit_cost:
            raise HTTPException(
                status_code=402,
                detail=f"크레딧이 부족합니다. 이미지 1장당 {credit_cost} 크레딧이 필요합니다.",
            )

        next_balance = balance - credit_cost
        update_result = (
            get_supabase()
            .schema(db_schema())
            .table("user_credits")
            .update({column: next_balance})
            .eq("user_id", user.id)
            .eq(column, balance)
            .execute()
        )
        if update_result.data:
            break
    else:
        raise HTTPException(status_code=409, detail="크레딧 잔액이 변경되었습니다. 다시 시도해주세요.")

    job_row: dict[str, Any] | None = None

    try:
        job_result = (
            get_supabase()
            .schema(db_schema())
            .table("jobs")
            .insert(
                {
                    "user_id": user.id,
                    "filename": filename,
                    "object_key": object_key,
                    "type": job_type,
                    "mode": mode,
                    "prompt": prompt,
                    "status": "pending",
                }
            )
            .execute()
        )
    except Exception as exc:
        try:
            (
                get_supabase()
                .schema(db_schema())
                .table("user_credits")
                .update({column: balance})
                .eq("user_id", user.id)
                .eq(column, next_balance)
                .execute()
            )
        except Exception:
            logger.exception("Failed to restore credit balance after job insert error for user %s", user.id)
        raise HTTPException(status_code=503, detail="크레딧 처리 중 오류가 발생했습니다.") from exc

    if not job_result.data:
        try:
            (
                get_supabase()
                .schema(db_schema())
                .table("user_credits")
                .update({column: balance})
                .eq("user_id", user.id)
                .eq(column, next_balance)
                .execute()
            )
        except Exception:
            logger.exception("Failed to restore credit balance after empty job insert result for user %s", user.id)
        raise HTTPException(status_code=503, detail="크레딧 처리 중 오류가 발생했습니다.")

    job_row = job_result.data[0]

    try:
        ledger_result = (
            get_supabase()
            .schema(db_schema())
            .table("credit_ledger")
            .insert(
                {
                    "user_id": user.id,
                    "source": "image_charge",
                    "source_id": str(job_row["id"]),
                    "delta": -credit_cost,
                    "balance_after": next_balance,
                    "description": _usage_description(mode, filename),
                    "metadata": _usage_metadata(
                        job_id=str(job_row["id"]),
                        filename=filename,
                        object_key=object_key,
                        mode=mode,
                        prompt=prompt,
                        job_type=job_type,
                    ),
                }
            )
            .execute()
        )
    except Exception as exc:
        try:
            (
                get_supabase()
                .schema(db_schema())
                .table("jobs")
                .delete()
                .eq("id", job_row["id"])
                .execute()
            )
            (
                get_supabase()
                .schema(db_schema())
                .table("user_credits")
                .update({column: balance})
                .eq("user_id", user.id)
                .eq(column, next_balance)
                .execute()
            )
        except Exception:
            logger.exception("Failed to rollback job/credits after ledger insert error for user %s", user.id)
        raise HTTPException(status_code=503, detail="크레딧 처리 중 오류가 발생했습니다.") from exc

    if not ledger_result.data:
        try:
            (
                get_supabase()
                .schema(db_schema())
                .table("jobs")
                .delete()
                .eq("id", job_row["id"])
                .execute()
            )
            (
                get_supabase()
                .schema(db_schema())
                .table("user_credits")
                .update({column: balance})
                .eq("user_id", user.id)
                .eq(column, next_balance)
                .execute()
            )
        except Exception:
            logger.exception("Failed to rollback job/credits after empty ledger result for user %s", user.id)
        raise HTTPException(status_code=503, detail="크레딧 처리 중 오류가 발생했습니다.")

    return {
        **job_row,
        "remaining_credits": next_balance,
        "credit_cost": credit_cost,
    }


def _direct_record_credit_ledger_entry(
    *,
    user_id: str,
    source: str,
    source_id: str,
    delta: int,
    description: str | None,
    metadata: dict[str, Any],
) -> dict[str, Any]:
    if not source or not source_id:
        raise RuntimeError("Ledger source and source_id are required")

    if delta == 0:
        raise RuntimeError("Ledger delta must be non-zero")

    existing = (
        get_supabase()
        .schema(db_schema())
        .table("credit_ledger")
        .select("*")
        .eq("source", source)
        .eq("source_id", source_id)
        .limit(1)
        .execute()
    )
    if existing.data:
        current_balance = _direct_get_or_create_credit_balance(user_id)
        row = existing.data[0]
        return {
            "applied": False,
            "ledger_id": row.get("id"),
            "balance": current_balance,
            "balance_after": row.get("balance_after"),
            "delta": row.get("delta"),
        }

    _, column, balance = _ensure_credit_row(user_id)
    next_balance = balance + delta
    if next_balance < 0:
        raise RuntimeError("INSUFFICIENT_CREDITS")

    (
        get_supabase()
        .schema(db_schema())
        .table("user_credits")
        .update({column: next_balance})
        .eq("user_id", user_id)
        .execute()
    )

    ledger = (
        get_supabase()
        .schema(db_schema())
        .table("credit_ledger")
        .insert(
            {
                "user_id": user_id,
                "source": source,
                "source_id": source_id,
                "delta": delta,
                "balance_after": next_balance,
                "description": description,
                "metadata": metadata,
            }
        )
        .execute()
    )
    ledger_row = ledger.data[0] if ledger.data else {}
    return {
        "applied": True,
        "ledger_id": ledger_row.get("id"),
        "balance": next_balance,
        "balance_after": next_balance,
        "delta": delta,
    }


async def get_or_create_credit_balance(user_id: str) -> int:
    try:
        payload = await call_rpc(
            "ensure_user_credits",
            {
                "p_user_id": user_id,
                "p_initial_credits": settings.initial_user_credits,
            },
        )
        return int(payload["balance"])
    except RpcError as exc:
        if _is_missing_rpc_function(exc, "ensure_user_credits"):
            logger.warning("Falling back to direct credit balance query after missing RPC: %s", exc)
        else:
            logger.exception("ensure_user_credits RPC failed for user %s; trying direct fallback", user_id)
        try:
            return _direct_get_or_create_credit_balance(user_id)
        except HTTPException:
            raise
        except Exception as direct_exc:
            logger.exception("Direct credit balance lookup failed for user %s", user_id)
            raise HTTPException(status_code=503, detail=_CREDIT_BALANCE_ERROR) from direct_exc
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Credit balance lookup failed for user %s", user_id)
        raise HTTPException(status_code=503, detail=_CREDIT_BALANCE_ERROR) from exc


async def charge_and_create_job(
    *,
    user: AuthenticatedUser,
    filename: str,
    object_key: str,
    mode: str,
    prompt: str | None,
    job_type: str = "image",
) -> dict[str, Any]:
    try:
        payload = await call_rpc(
            "create_credit_charged_job_with_ledger",
            {
                "p_user_id": user.id,
                "p_filename": filename,
                "p_object_key": object_key,
                "p_mode": mode,
                "p_prompt": prompt,
                "p_type": job_type,
                "p_credit_cost": settings.image_request_credit_cost,
                "p_initial_credits": settings.initial_user_credits,
            },
        )
    except RpcError as exc:
        message = exc.payload.get("message") if isinstance(exc.payload, dict) else str(exc.payload)
        if "INSUFFICIENT_CREDITS" in message:
            raise HTTPException(
                status_code=402,
                detail=f"크레딧이 부족합니다. 이미지 1장당 {settings.image_request_credit_cost} 크레딧이 필요합니다.",
            ) from exc
        if _is_missing_rpc_function(exc, "create_credit_charged_job_with_ledger"):
            logger.warning("Falling back to direct credit charge flow after missing RPC: %s", exc)
        else:
            logger.exception(
                "create_credit_charged_job_with_ledger RPC failed for user %s; trying direct fallback",
                user.id,
            )
        try:
            return _direct_charge_and_create_job(
                user=user,
                filename=filename,
                object_key=object_key,
                mode=mode,
                prompt=prompt,
                job_type=job_type,
            )
        except HTTPException:
            raise
        except Exception as direct_exc:
            logger.exception("Direct credit charge flow failed for user %s", user.id)
            raise HTTPException(status_code=503, detail=_CREDIT_PROCESSING_ERROR) from direct_exc
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Credit charge flow failed for user %s", user.id)
        raise HTTPException(status_code=503, detail=_CREDIT_PROCESSING_ERROR) from exc

    return payload


async def record_credit_ledger_entry(
    *,
    user_id: str,
    source: str,
    source_id: str,
    delta: int,
    description: str | None = None,
    metadata: dict[str, Any] | None = None,
) -> dict[str, Any]:
    try:
        payload = await call_rpc(
            "record_credit_ledger_entry",
            {
                "p_user_id": user_id,
                "p_source": source,
                "p_source_id": source_id,
                "p_delta": delta,
                "p_description": description,
                "p_metadata": metadata or {},
                "p_initial_credits": settings.initial_user_credits,
            },
        )
        return payload
    except RpcError as exc:
        if _is_missing_rpc_function(exc, "record_credit_ledger_entry"):
            logger.warning("Falling back to direct credit ledger flow after missing RPC: %s", exc)
        else:
            logger.exception("record_credit_ledger_entry RPC failed for user %s; trying direct fallback", user_id)
        try:
            return _direct_record_credit_ledger_entry(
                user_id=user_id,
                source=source,
                source_id=source_id,
                delta=delta,
                description=description,
                metadata=metadata or {},
            )
        except HTTPException:
            raise
        except Exception as direct_exc:
            logger.exception("Direct credit ledger flow failed for user %s", user_id)
            raise HTTPException(status_code=503, detail=_CREDIT_LEDGER_ERROR) from direct_exc
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Credit ledger flow failed for user %s", user_id)
        raise HTTPException(status_code=503, detail=_CREDIT_LEDGER_ERROR) from exc

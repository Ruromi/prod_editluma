from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.core.auth import AuthenticatedUser, get_current_user
from app.core.config import settings
from app.core.credits import get_or_create_credit_balance

router = APIRouter(prefix="/api/credits", tags=["credits"])


class CreditBalanceResponse(BaseModel):
    balance: int
    cost_per_image: int
    initial_credits: int


@router.get("/me", response_model=CreditBalanceResponse)
async def get_my_credits(user: AuthenticatedUser = Depends(get_current_user)):
    try:
        balance = await get_or_create_credit_balance(user.id)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=503, detail="크레딧 정보를 불러오지 못했습니다.") from exc

    return CreditBalanceResponse(
        balance=balance,
        cost_per_image=settings.image_request_credit_cost,
        initial_credits=settings.initial_user_credits,
    )

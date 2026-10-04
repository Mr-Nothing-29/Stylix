from fastapi import APIRouter, Depends, HTTPException, status
from app.database import supabase
from app.deps import get_current_user
from app.schemas import MeasurementsUpdateRequest, MeasurementsResponse

router = APIRouter(prefix="/users/me/measurements", tags=["measurements"])


@router.get("", response_model=MeasurementsResponse)
def get_my_measurements(user=Depends(get_current_user)):
    result = supabase.table("measurements").select("*").eq("user_id", user.id).execute()
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No measurements saved yet.",
        )
    return result.data[0]


@router.put("", response_model=MeasurementsResponse)
def save_my_measurements(payload: MeasurementsUpdateRequest, user=Depends(get_current_user)):
    existing = supabase.table("measurements").select("user_id").eq("user_id", user.id).execute()
    fields = {k: v for k, v in payload.model_dump().items()}

    if existing.data:
        supabase.table("measurements").update(fields).eq("user_id", user.id).execute()
    else:
        supabase.table("measurements").insert({**fields, "user_id": user.id}).execute()

    result = supabase.table("measurements").select("*").eq("user_id", user.id).single().execute()
    return result.data

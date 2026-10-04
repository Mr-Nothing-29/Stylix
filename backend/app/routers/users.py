from fastapi import APIRouter, Depends, HTTPException, status
from app.database import supabase
from app.deps import get_current_user
from app.schemas import ProfileResponse, ProfileUpdateRequest

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=ProfileResponse)
def get_my_profile(user=Depends(get_current_user)):
    result = supabase.table("profiles").select("*").eq("id", user.id).single().execute()
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found.")
    return result.data


@router.put("/me", response_model=ProfileResponse)
def update_my_profile(payload: ProfileUpdateRequest, user=Depends(get_current_user)):
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    if updates:
        supabase.table("profiles").update(updates).eq("id", user.id).execute()

    result = supabase.table("profiles").select("*").eq("id", user.id).single().execute()
    return result.data

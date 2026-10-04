from fastapi import APIRouter, Depends
from app.database import supabase
from app.deps import get_current_user
from app.schemas import DesignCreateRequest, DesignResponse

router = APIRouter(prefix="/designs", tags=["designs"])


@router.post("", response_model=DesignResponse, status_code=201)
def save_design(payload: DesignCreateRequest, user=Depends(get_current_user)):
    row = {
        "user_id": user.id,
        "garment_type": payload.garment_type,
        "fabric": payload.fabric,
        "color": payload.color,
        "addons": payload.addons,
        "estimated_price": payload.estimated_price,
    }
    result = supabase.table("designs").insert(row).execute()
    return result.data[0]


@router.get("", response_model=list[DesignResponse])
def list_my_designs(user=Depends(get_current_user)):
    result = (
        supabase.table("designs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data

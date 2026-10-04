from fastapi import APIRouter, Depends, HTTPException, status
from app.database import supabase
from app.deps import get_current_user
from app.schemas import OrderResponse, ConnectionResponse

router = APIRouter(prefix="/tailors/me", tags=["tailor-dashboard"])


def _get_my_tailor_id(user_id: str) -> str:
    result = supabase.table("tailors").select("id").eq("user_id", user_id).execute()
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Set up your tailor profile first.",
        )
    return result.data[0]["id"]


@router.get("/orders", response_model=list[OrderResponse])
def get_my_incoming_orders(user=Depends(get_current_user)):
    tailor_id = _get_my_tailor_id(user.id)
    result = (
        supabase.table("orders")
        .select("*")
        .eq("tailor_id", tailor_id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data


@router.get("/connections", response_model=list[ConnectionResponse])
def get_my_incoming_connections(user=Depends(get_current_user)):
    tailor_id = _get_my_tailor_id(user.id)
    result = (
        supabase.table("connections")
        .select("*")
        .eq("tailor_id", tailor_id)
        .order("created_at", desc=True)
        .execute()
    )
    connections = result.data
    if not connections:
        return []

    customer_ids = list({c["customer_id"] for c in connections})
    profiles = supabase.table("profiles").select("id, full_name").in_("id", customer_ids).execute()
    name_by_id = {p["id"]: p["full_name"] for p in profiles.data}

    for c in connections:
        c["customer_name"] = name_by_id.get(c["customer_id"], "Stylix customer")

    return connections

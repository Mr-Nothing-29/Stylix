from fastapi import APIRouter, Depends, HTTPException, status
from app.database import supabase
from app.deps import get_current_user
from app.schemas import OrderCreateRequest, OrderStatusUpdateRequest, OrderResponse

router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("", response_model=OrderResponse, status_code=201)
def create_order(payload: OrderCreateRequest, user=Depends(get_current_user)):
    tailor = supabase.table("tailors").select("id").eq("id", payload.tailor_id).single().execute()
    if not tailor.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tailor not found.")

    row = {
        "customer_id": user.id,
        "tailor_id": payload.tailor_id,
        "design_id": payload.design_id,
        "garment_type": payload.garment_type,
        "fabric": payload.fabric,
        "color": payload.color,
        "addons": payload.addons,
        "estimated_price": payload.estimated_price,
        "delivery_address": payload.delivery_address,
        "notes": payload.notes,
        "measurements": payload.measurements,
        "status": "submitted",
    }
    result = supabase.table("orders").insert(row).execute()
    return result.data[0]


@router.get("", response_model=list[OrderResponse])
def list_my_orders(user=Depends(get_current_user)):
    result = (
        supabase.table("orders")
        .select("*")
        .eq("customer_id", user.id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data


def _is_owning_tailor(user_id: str, tailor_id: str) -> bool:
    result = supabase.table("tailors").select("id").eq("user_id", user_id).eq("id", tailor_id).execute()
    return bool(result.data)


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: str, user=Depends(get_current_user)):
    result = supabase.table("orders").select("*").eq("id", order_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")

    order = result.data
    if order["customer_id"] != user.id and not _is_owning_tailor(user.id, order["tailor_id"]):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")

    return order


@router.patch("/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: str, payload: OrderStatusUpdateRequest, user=Depends(get_current_user)
):
    existing = supabase.table("orders").select("customer_id, tailor_id").eq("id", order_id).single().execute()
    if not existing.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")

    order = existing.data
    is_customer = order["customer_id"] == user.id
    is_tailor = _is_owning_tailor(user.id, order["tailor_id"])

    if not is_customer and not is_tailor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")

    # NOTE: normally this belongs to the tailor alone. The customer path is
    # kept as a "demo" fallback so the order lifecycle can still be walked
    # through end-to-end without needing a second (tailor) account signed
    # in at the same time — see the note on the order detail page.
    supabase.table("orders").update({"status": payload.status}).eq("id", order_id).execute()
    result = supabase.table("orders").select("*").eq("id", order_id).single().execute()
    return result.data

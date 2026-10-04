from fastapi import APIRouter, Depends, HTTPException, status
from app.database import supabase
from app.deps import get_current_user
from app.schemas import ReviewCreateRequest, ReviewResponse

router = APIRouter(tags=["reviews"])


@router.post("/orders/{order_id}/review", response_model=ReviewResponse, status_code=201)
def create_review(order_id: str, payload: ReviewCreateRequest, user=Depends(get_current_user)):
    order = supabase.table("orders").select("*").eq("id", order_id).single().execute()
    if not order.data or order.data["customer_id"] != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")

    if order.data["status"] != "delivered":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You can only review an order once it's been delivered.",
        )

    existing = supabase.table("reviews").select("id").eq("order_id", order_id).execute()
    if existing.data:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This order already has a review.")

    tailor_id = order.data["tailor_id"]
    review_row = {
        "order_id": order_id,
        "tailor_id": tailor_id,
        "customer_id": user.id,
        "rating": payload.rating,
        "comment": payload.comment,
    }
    result = supabase.table("reviews").insert(review_row).execute()

    # Roll the new rating into the tailor's aggregate (weighted average
    # against their existing rating and review count, seed data included).
    tailor = supabase.table("tailors").select("rating, review_count").eq("id", tailor_id).single().execute()
    old_rating = tailor.data["rating"]
    old_count = tailor.data["review_count"]
    new_count = old_count + 1
    new_rating = round(((old_rating * old_count) + payload.rating) / new_count, 1)
    supabase.table("tailors").update({"rating": new_rating, "review_count": new_count}).eq(
        "id", tailor_id
    ).execute()

    return result.data[0]


@router.get("/orders/{order_id}/review", response_model=ReviewResponse)
def get_own_review(order_id: str, user=Depends(get_current_user)):
    order = supabase.table("orders").select("customer_id").eq("id", order_id).single().execute()
    if not order.data or order.data["customer_id"] != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")

    result = supabase.table("reviews").select("*").eq("order_id", order_id).execute()
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No review for this order yet.")
    return result.data[0]


@router.get("/tailors/{tailor_id}/reviews", response_model=list[ReviewResponse])
def list_tailor_reviews(tailor_id: str):
    result = (
        supabase.table("reviews")
        .select("*")
        .eq("tailor_id", tailor_id)
        .order("created_at", desc=True)
        .limit(20)
        .execute()
    )
    reviews = result.data
    if not reviews:
        return []

    customer_ids = list({r["customer_id"] for r in reviews})
    profiles = (
        supabase.table("profiles").select("id, full_name").in_("id", customer_ids).execute()
    )
    name_by_id = {p["id"]: p["full_name"] for p in profiles.data}

    for r in reviews:
        r["customer_name"] = name_by_id.get(r["customer_id"], "Stylix customer")

    return reviews

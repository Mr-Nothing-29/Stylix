from fastapi import APIRouter, Depends
from app.database import supabase
from app.deps import require_admin
from app.schemas import AdminStatsResponse, OrderWithTailorResponse

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/stats", response_model=AdminStatsResponse)
def get_admin_stats(user=Depends(require_admin)):
    profiles = supabase.table("profiles").select("role").execute().data
    total_customers = sum(1 for p in profiles if p["role"] == "customer")
    total_suppliers = sum(1 for p in profiles if p["role"] == "supplier")

    tailors = supabase.table("tailors").select("rating, review_count").execute().data
    total_tailors = len(tailors)
    total_reviews = sum(t["review_count"] for t in tailors)
    rated = [t["rating"] for t in tailors if t["review_count"] > 0]
    average_rating = round(sum(rated) / len(rated), 1) if rated else 0.0

    orders = supabase.table("orders").select("estimated_price, payment_status").execute().data
    total_orders = len(orders)
    total_revenue = sum(o["estimated_price"] for o in orders if o["payment_status"] == "paid")

    return {
        "total_customers": total_customers,
        "total_tailors": total_tailors,
        "total_suppliers": total_suppliers,
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "total_reviews": total_reviews,
        "average_rating": average_rating,
    }


@router.get("/orders", response_model=list[OrderWithTailorResponse])
def get_recent_orders(user=Depends(require_admin)):
    result = supabase.table("orders").select("*").order("created_at", desc=True).limit(25).execute()
    orders = result.data
    if not orders:
        return []

    tailor_ids = list({o["tailor_id"] for o in orders})
    tailors = supabase.table("tailors").select("id, business_name").in_("id", tailor_ids).execute()
    name_by_id = {t["id"]: t["business_name"] for t in tailors.data}

    for o in orders:
        o["tailor_business_name"] = name_by_id.get(o["tailor_id"])

    return orders

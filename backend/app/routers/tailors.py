from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from app.database import supabase
from app.deps import get_current_user
from app.schemas import (
    TailorResponse,
    ConnectionCreateRequest,
    ConnectionResponse,
    TailorProfileCreateRequest,
)

router = APIRouter(tags=["tailors"])


# NOTE: routes under /tailors/me must be declared before /tailors/{tailor_id}
# below, since FastAPI matches path routes in declaration order and would
# otherwise treat "me" as a tailor_id.


@router.get("/tailors/me", response_model=TailorResponse)
def get_my_tailor_profile(user=Depends(get_current_user)):
    result = supabase.table("tailors").select("*").eq("user_id", user.id).execute()
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="You don't have a tailor profile yet.",
        )
    return result.data[0]


@router.post("/tailors/me", response_model=TailorResponse, status_code=201)
def create_my_tailor_profile(payload: TailorProfileCreateRequest, user=Depends(get_current_user)):
    existing = supabase.table("tailors").select("id").eq("user_id", user.id).execute()
    if existing.data:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You already have a tailor profile.",
        )

    row = {
        "user_id": user.id,
        "business_name": payload.business_name,
        "bio": payload.bio,
        "city": payload.city,
        "specialties": payload.specialties,
        "years_experience": payload.years_experience,
        "starting_price": payload.starting_price,
        "rating": 0,
        "review_count": 0,
    }
    result = supabase.table("tailors").insert(row).execute()
    return result.data[0]


@router.put("/tailors/me", response_model=TailorResponse)
def update_my_tailor_profile(payload: TailorProfileCreateRequest, user=Depends(get_current_user)):
    existing = supabase.table("tailors").select("id").eq("user_id", user.id).execute()
    if not existing.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="You don't have a tailor profile yet.")

    updates = {
        "business_name": payload.business_name,
        "bio": payload.bio,
        "city": payload.city,
        "specialties": payload.specialties,
        "years_experience": payload.years_experience,
        "starting_price": payload.starting_price,
    }
    supabase.table("tailors").update(updates).eq("user_id", user.id).execute()
    result = supabase.table("tailors").select("*").eq("user_id", user.id).single().execute()
    return result.data


@router.get("/tailors", response_model=list[TailorResponse])
def list_tailors(
    search: Optional[str] = None,
    specialty: Optional[str] = None,
    city: Optional[str] = None,
):
    query = supabase.table("tailors").select("*")

    if city:
        query = query.ilike("city", f"%{city}%")
    if specialty:
        query = query.contains("specialties", [specialty])

    result = query.order("rating", desc=True).execute()
    rows = result.data

    if search:
        term = search.lower()
        rows = [
            r
            for r in rows
            if term in r["business_name"].lower()
            or term in r["city"].lower()
            or any(term in s.lower() for s in r["specialties"])
        ]

    return rows


@router.get("/tailors/{tailor_id}", response_model=TailorResponse)
def get_tailor(tailor_id: str):
    result = supabase.table("tailors").select("*").eq("id", tailor_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tailor not found.")
    return result.data


@router.post("/tailors/{tailor_id}/connect", response_model=ConnectionResponse, status_code=201)
def connect_with_tailor(
    tailor_id: str, payload: ConnectionCreateRequest, user=Depends(get_current_user)
):
    tailor = supabase.table("tailors").select("id").eq("id", tailor_id).single().execute()
    if not tailor.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tailor not found.")

    row = {
        "tailor_id": tailor_id,
        "customer_id": user.id,
        "message": payload.message,
        "status": "pending",
    }
    result = supabase.table("connections").insert(row).execute()
    return result.data[0]


@router.get("/connections/mine", response_model=list[ConnectionResponse])
def my_connections(user=Depends(get_current_user)):
    result = (
        supabase.table("connections")
        .select("*")
        .eq("customer_id", user.id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data

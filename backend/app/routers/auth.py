from fastapi import APIRouter, HTTPException, status
from app.database import supabase
from app.schemas import SignupRequest, LoginRequest

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest):
    existing = (
        supabase.table("profiles").select("id").eq("email", payload.email).execute()
    )
    if existing.data:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    try:
        auth_result = supabase.auth.admin.create_user(
            {
                "email": payload.email,
                "password": payload.password,
                "email_confirm": True,
            }
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Couldn't create account: {exc}",
        )

    user_id = auth_result.user.id

    profile_row = {
        "id": user_id,
        "full_name": payload.full_name,
        "email": payload.email,
        "role": payload.role,
    }

    try:
        insert_result = supabase.table("profiles").insert(profile_row).execute()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Account was created but the profile row failed to save: {exc}",
        )

    if not insert_result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Account was created but the profile row didn't save (empty response from Supabase).",
        )

    return {"id": user_id, "email": payload.email, "role": payload.role}


@router.post("/login")
def login(payload: LoginRequest):
    try:
        result = supabase.auth.sign_in_with_password(
            {"email": payload.email, "password": payload.password}
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
        )

    return {
        "access_token": result.session.access_token,
        "refresh_token": result.session.refresh_token,
        "user_id": result.user.id,
    }

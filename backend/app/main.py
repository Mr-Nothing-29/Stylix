import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import (
    auth,
    users,
    designs,
    tailors,
    orders,
    payments,
    reviews,
    tailor_dashboard,
    admin,
    recommendations,
    measurements,
)

app = FastAPI(title="Stylix API", version="0.1.0")

# Comma-separated list in ALLOWED_ORIGINS (e.g. set on Render) lets you add
# your deployed frontend URL without editing code. Always includes the
# local dev URL too, so localhost keeps working alongside production.
_extra_origins = os.getenv("ALLOWED_ORIGINS", "")
allow_origins = ["http://localhost:5173"] + [
    o.strip() for o in _extra_origins.split(",") if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(measurements.router)
app.include_router(designs.router)
app.include_router(tailors.router)
app.include_router(tailor_dashboard.router)
app.include_router(orders.router)
app.include_router(payments.router)
app.include_router(reviews.router)
app.include_router(admin.router)
app.include_router(recommendations.router)


@app.get("/")
def health_check():
    return {"status": "ok", "service": "stylix-api"}

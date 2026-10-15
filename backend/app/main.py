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

# Which websites may call this API from a browser.
#  - localhost, for local development
#  - any ALLOWED_ORIGINS you set (comma-separated, e.g. on Render)
#  - this project's own Vercel addresses (production + preview), matched by
#    pattern so a typo in the environment variable can't lock the site out
_extra_origins = os.getenv("ALLOWED_ORIGINS", "")
allow_origins = ["http://localhost:5173"] + [
    o.strip().rstrip("/") for o in _extra_origins.split(",") if o.strip()
]
allow_origin_regex = r"https://stylix[a-z0-9-]*\.vercel\.app"

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_origin_regex=allow_origin_regex,
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
    # cors_origins is shown so you can confirm which version is deployed.
    return {
        "status": "ok",
        "service": "stylix-api",
        "cors_origins": allow_origins,
        "cors_pattern": allow_origin_regex,
    }

import os
import json
import itertools
from fastapi import APIRouter, Depends
from app.database import supabase
from app.deps import get_current_user
from app.schemas import RecommendationsResponse

router = APIRouter(prefix="/recommendations", tags=["recommendations"])

GARMENT_IDS = ["shirt", "kurta", "blazer", "trousers", "waistcoat", "overcoat", "dress", "kurti", "coord"]
FABRIC_IDS = ["cotton", "linen", "silk", "wool"]
COLOR_IDS = ["ivory", "charcoal", "wine", "sage", "navy", "brass"]

FABRIC_NOTES = {
    "cotton": "a crisp, breathable, everyday feel",
    "linen": "a light, relaxed drape that suits warm weather",
    "silk": "a smooth sheen that reads as occasion wear",
    "wool": "a structured finish that holds up in cooler months",
}

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"


def _fetch_history(user_id: str):
    designs = supabase.table("designs").select("garment_type, fabric, color").eq("user_id", user_id).execute()
    orders = supabase.table("orders").select("garment_type, fabric, color").eq("customer_id", user_id).execute()
    combos = [(d["garment_type"], d["fabric"], d["color"]) for d in designs.data]
    combos += [(o["garment_type"], o["fabric"], o["color"]) for o in orders.data]
    return combos


def _rule_based_recommendations(history):
    tried = set(history)
    all_combos = list(itertools.product(GARMENT_IDS, FABRIC_IDS, COLOR_IDS))
    untried = [c for c in all_combos if c not in tried]
    pool = untried if len(untried) >= 3 else all_combos

    # Spread picks across different garments rather than clustering on one.
    picks = []
    seen_garments = set()
    for combo in pool:
        if combo[0] not in seen_garments:
            picks.append(combo)
            seen_garments.add(combo[0])
        if len(picks) == 3:
            break
    if len(picks) < 3:
        for combo in pool:
            if combo not in picks:
                picks.append(combo)
            if len(picks) == 3:
                break

    items = []
    for garment, fabric, color in picks:
        note = FABRIC_NOTES.get(fabric, "a distinct texture")
        if tried:
            reason = f"You haven't tried {fabric} yet — it has {note}, worth trying on a {garment}."
        else:
            reason = f"A solid starting point: {fabric} has {note}, and pairs well with a {garment}."
        items.append({"garment_type": garment, "fabric": fabric, "color": color, "reason": reason})

    return items


def _call_gemini(history):
    if not GEMINI_API_KEY:
        return None

    history_text = (
        ", ".join(f"{g} in {f} ({c})" for g, f, c in history) if history else "no past designs or orders yet"
    )
    prompt = (
        "You are a fashion stylist for an Indian custom-tailoring app called Stylix. "
        f"Available garments: {', '.join(GARMENT_IDS)}. "
        f"Available fabrics: {', '.join(FABRIC_IDS)}. "
        f"Available colours: {', '.join(COLOR_IDS)}. "
        f"This customer's history: {history_text}. "
        "Recommend exactly 3 combinations, using ONLY the ids listed above (not display names). "
        "Respond with ONLY a JSON array (no markdown, no code fences, no commentary) of exactly 3 "
        'objects shaped like {"garment_type": "...", "fabric": "...", "color": "...", "reason": "..."}. '
        "Keep each reason under 20 words, friendly and specific."
    )

    try:
        import requests

        response = requests.post(
            GEMINI_URL,
            headers={"Content-Type": "application/json", "x-goog-api-key": GEMINI_API_KEY},
            json={"contents": [{"parts": [{"text": prompt}]}]},
            timeout=8,
        )
        response.raise_for_status()
        data = response.json()
        text = data["candidates"][0]["content"]["parts"][0]["text"]
        text = text.strip().strip("`")
        if text.lower().startswith("json"):
            text = text[4:].strip()

        parsed = json.loads(text)
        valid = []
        for item in parsed:
            if (
                item.get("garment_type") in GARMENT_IDS
                and item.get("fabric") in FABRIC_IDS
                and item.get("color") in COLOR_IDS
                and isinstance(item.get("reason"), str)
            ):
                valid.append(item)
        return valid[:3] if len(valid) >= 1 else None
    except Exception:
        # Any failure (network, quota, bad JSON, missing key) — fall back
        # to the rule-based generator rather than breaking the page.
        return None


@router.get("", response_model=RecommendationsResponse)
def get_recommendations(user=Depends(get_current_user)):
    history = _fetch_history(user.id)

    ai_items = _call_gemini(history)
    if ai_items:
        return {"items": ai_items, "source": "ai"}

    return {"items": _rule_based_recommendations(history), "source": "rules"}

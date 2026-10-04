import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from app.database import supabase
from app.deps import get_current_user
from app.schemas import PaymentCreateRequest, PaymentResponse

router = APIRouter(tags=["payments"])


@router.post("/orders/{order_id}/pay", response_model=PaymentResponse, status_code=201)
def pay_for_order(order_id: str, payload: PaymentCreateRequest, user=Depends(get_current_user)):
    order = supabase.table("orders").select("*").eq("id", order_id).single().execute()
    if not order.data or order.data["customer_id"] != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")

    if order.data.get("payment_status") == "paid":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This order is already paid.")

    # For UPI, the customer actually pays via their own UPI app scanning a
    # real QR code — this endpoint doesn't verify that transfer itself
    # (there's no payment gateway/webhook here), it just records what the
    # customer reports paying. If they supply the UTR from their UPI app,
    # use that as the real transaction reference; otherwise (card/cod mock
    # flows) generate a placeholder reference for demo purposes.
    is_cod = payload.method == "cod"
    if payload.method == "upi" and payload.upi_ref:
        transaction_ref = payload.upi_ref
    elif is_cod:
        transaction_ref = None
    else:
        transaction_ref = f"PAY-{uuid.uuid4().hex[:10].upper()}"

    payment_row = {
        "order_id": order_id,
        "customer_id": user.id,
        "method": payload.method,
        "amount": order.data["estimated_price"],
        "status": "pending" if is_cod else "success",
        "transaction_ref": transaction_ref,
    }
    payment_result = supabase.table("payments").insert(payment_row).execute()

    new_payment_status = "cod_pending" if is_cod else "paid"
    supabase.table("orders").update({"payment_status": new_payment_status}).eq("id", order_id).execute()

    return payment_result.data[0]


@router.get("/orders/{order_id}/payment", response_model=PaymentResponse)
def get_payment_for_order(order_id: str, user=Depends(get_current_user)):
    order = supabase.table("orders").select("customer_id").eq("id", order_id).single().execute()
    if not order.data or order.data["customer_id"] != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")

    result = (
        supabase.table("payments")
        .select("*")
        .eq("order_id", order_id)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No payment found for this order.")
    return result.data[0]

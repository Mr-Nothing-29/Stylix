from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Literal

Role = Literal["customer", "tailor", "supplier"]
AnyRole = Literal["customer", "tailor", "supplier", "admin"]


class SignupRequest(BaseModel):
    full_name: str = Field(min_length=1)
    email: EmailStr
    password: str = Field(min_length=8)
    role: Role = "customer"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ProfileResponse(BaseModel):
    id: str
    full_name: str
    email: EmailStr
    role: AnyRole
    phone: Optional[str] = None
    address: Optional[str] = None


class ProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None


class DesignCreateRequest(BaseModel):
    garment_type: str
    fabric: str
    color: str
    addons: list[str] = []
    estimated_price: int


class DesignResponse(BaseModel):
    id: str
    user_id: str
    garment_type: str
    fabric: str
    color: str
    addons: list[str]
    estimated_price: int
    created_at: Optional[str] = None


class TailorResponse(BaseModel):
    id: str
    business_name: str
    bio: str
    city: str
    specialties: list[str]
    rating: float
    review_count: int
    years_experience: int
    starting_price: Optional[int] = None


class ConnectionCreateRequest(BaseModel):
    message: str = Field(min_length=1, max_length=1000)


class ConnectionResponse(BaseModel):
    id: str
    tailor_id: str
    customer_id: str
    message: str
    status: str
    customer_name: Optional[str] = None
    created_at: Optional[str] = None


OrderStatus = Literal["submitted", "in_progress", "stitching", "ready", "delivered"]


class OrderCreateRequest(BaseModel):
    tailor_id: str
    design_id: Optional[str] = None
    garment_type: str
    fabric: str
    color: str
    addons: list[str] = []
    estimated_price: int
    delivery_address: str = Field(min_length=1)
    notes: Optional[str] = None
    measurements: Optional[dict] = None


class OrderStatusUpdateRequest(BaseModel):
    status: OrderStatus


PaymentStatus = Literal["unpaid", "paid", "cod_pending"]


class OrderResponse(BaseModel):
    id: str
    customer_id: str
    tailor_id: str
    design_id: Optional[str] = None
    garment_type: str
    fabric: str
    color: str
    addons: list[str]
    estimated_price: int
    delivery_address: str
    notes: Optional[str] = None
    status: OrderStatus
    payment_status: PaymentStatus = "unpaid"
    measurements: Optional[dict] = None
    created_at: Optional[str] = None


PaymentMethod = Literal["upi", "card", "cod"]


class PaymentCreateRequest(BaseModel):
    method: PaymentMethod
    upi_id: Optional[str] = None
    upi_ref: Optional[str] = None
    card_last4: Optional[str] = None


class PaymentResponse(BaseModel):
    id: str
    order_id: str
    method: PaymentMethod
    amount: int
    status: str
    transaction_ref: Optional[str] = None
    created_at: Optional[str] = None


class ReviewCreateRequest(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = Field(default=None, max_length=1000)


class ReviewResponse(BaseModel):
    id: str
    order_id: str
    tailor_id: str
    customer_id: str
    rating: int
    comment: Optional[str] = None
    customer_name: Optional[str] = None
    created_at: Optional[str] = None


class TailorProfileCreateRequest(BaseModel):
    business_name: str = Field(min_length=1)
    bio: str = Field(min_length=1)
    city: str = Field(min_length=1)
    specialties: list[str] = []
    years_experience: int = Field(ge=0, default=0)
    starting_price: Optional[int] = None


class OrderWithTailorResponse(OrderResponse):
    tailor_business_name: Optional[str] = None


class AdminStatsResponse(BaseModel):
    total_customers: int
    total_tailors: int
    total_suppliers: int
    total_orders: int
    total_revenue: int
    total_reviews: int
    average_rating: float


class RecommendationItem(BaseModel):
    garment_type: str
    fabric: str
    color: str
    reason: str


class RecommendationsResponse(BaseModel):
    items: list[RecommendationItem]
    source: Literal["ai", "rules"]


class MeasurementsUpdateRequest(BaseModel):
    height_cm: Optional[float] = None
    chest_cm: Optional[float] = None
    waist_cm: Optional[float] = None
    hip_cm: Optional[float] = None
    shoulder_cm: Optional[float] = None
    sleeve_length_cm: Optional[float] = None
    inseam_cm: Optional[float] = None
    neck_cm: Optional[float] = None
    notes: Optional[str] = None


class MeasurementsResponse(BaseModel):
    height_cm: Optional[float] = None
    chest_cm: Optional[float] = None
    waist_cm: Optional[float] = None
    hip_cm: Optional[float] = None
    shoulder_cm: Optional[float] = None
    sleeve_length_cm: Optional[float] = None
    inseam_cm: Optional[float] = None
    neck_cm: Optional[float] = None
    notes: Optional[str] = None
    updated_at: Optional[str] = None

from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import uuid
import asyncio
import logging
import secrets
from datetime import datetime, timezone, timedelta
from typing import List, Optional

import bcrypt
import jwt
import resend
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, ConfigDict

# ---------------- MongoDB ----------------
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# ---------------- App ----------------
app = FastAPI(title="Hydranet Broadband API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ---------------- Email (Resend) ----------------
resend.api_key = os.environ.get("RESEND_API_KEY", "")
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "onboarding@resend.dev")
CONTACT_NOTIFICATION_EMAIL = os.environ.get("CONTACT_NOTIFICATION_EMAIL", "")

async def send_email(to: str, subject: str, html: str) -> Optional[str]:
    """Send an email via Resend. Returns email id on success, None on failure.
    Never raises — failures are logged so the caller's request is not broken."""
    if not resend.api_key:
        logger.warning("RESEND_API_KEY not configured; skipping email send")
        return None
    params = {"from": SENDER_EMAIL, "to": [to], "subject": subject, "html": html}
    try:
        result = await asyncio.to_thread(resend.Emails.send, params)
        email_id = result.get("id") if isinstance(result, dict) else None
        logger.info(f"Email sent to {to} (id={email_id}) subject='{subject}'")
        return email_id
    except Exception as e:
        logger.error(f"Failed to send email to {to}: {e}")
        return None

def _wrap_email_html(title: str, body_html: str) -> str:
    return f"""
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background:#020617; padding:32px 0;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px; margin:0 auto; background:#0F172A; border:1px solid #1E293B; border-radius:12px; overflow:hidden;">
        <tr><td style="padding:24px 32px; background:#0F2650; border-bottom:1px solid #1E293B;">
          <div style="color:#F26B21; font-size:11px; letter-spacing:2px; text-transform:uppercase; font-family: monospace;">Hydranet Broadband</div>
          <div style="color:#F8FAFC; font-size:22px; font-weight:700; margin-top:6px;">{title}</div>
        </td></tr>
        <tr><td style="padding:28px 32px; color:#CBD5E1; font-size:14px; line-height:1.7;">{body_html}</td></tr>
        <tr><td style="padding:16px 32px; background:#020617; border-top:1px solid #1E293B; color:#64748B; font-size:11px; text-align:center;">
          Hydranet Broadband · Automated message
        </td></tr>
      </table>
    </div>
    """

# ---------------- Auth utils ----------------
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_HOURS = 24

def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False

def create_access_token(username: str) -> str:
    payload = {
        "sub": username,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRE_HOURS),
        "type": "access",
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

security = HTTPBearer(auto_error=False)

async def get_current_admin(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> dict:
    if not credentials or not credentials.credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = credentials.credentials
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        username = payload.get("sub")
        admin = await db.admins.find_one({"username": username}, {"password_hash": 0})
        if not admin:
            raise HTTPException(status_code=401, detail="Admin not found")
        admin["_id"] = str(admin["_id"])
        return admin
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ---------------- Models ----------------
class LoginRequest(BaseModel):
    username: str
    password: str

class ForgotPasswordRequest(BaseModel):
    recovery_email: EmailStr

class ResetPasswordRequest(BaseModel):
    reset_token: str
    new_password: str

class Plan(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    category: str  # monthly | six_month | twelve_month | welcome | ott
    speed_mbps: int
    price: float
    validity_days: int
    validity_label: str
    benefits: str = ""
    popular: bool = False
    display_order: int = 0
    active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PlanCreate(BaseModel):
    name: str
    category: str
    speed_mbps: int
    price: float
    validity_days: int
    validity_label: str
    benefits: str = ""
    popular: bool = False
    display_order: int = 0
    active: bool = True

class PlanUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    speed_mbps: Optional[int] = None
    price: Optional[float] = None
    validity_days: Optional[int] = None
    validity_label: Optional[str] = None
    benefits: Optional[str] = None
    popular: Optional[bool] = None
    display_order: Optional[int] = None
    active: Optional[bool] = None

class ContactSubmission(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: str
    subject: str = ""
    message: str
    read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ContactCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    subject: str = ""
    message: str

class TeamMember(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    role: str
    image_url: str = ""
    bio: str = ""
    linkedin: str = ""
    twitter: str = ""
    email: str = ""
    display_order: int = 0
    active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TeamMemberCreate(BaseModel):
    name: str
    role: str
    image_url: str = ""
    bio: str = ""
    linkedin: str = ""
    twitter: str = ""
    email: str = ""
    display_order: int = 0
    active: bool = True

class TeamMemberUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    image_url: Optional[str] = None
    bio: Optional[str] = None
    linkedin: Optional[str] = None
    twitter: Optional[str] = None
    email: Optional[str] = None
    display_order: Optional[int] = None
    active: Optional[bool] = None

# ---------------- Seed data ----------------
SEED_PLANS = [
    # Monthly
    {"name": "Tiny", "category": "monthly", "speed_mbps": 15, "price": 466, "validity_days": 90, "validity_label": "90 Days", "benefits": "Entry-level broadband. Great for browsing & light streaming.", "display_order": 1},
    {"name": "Rocxy", "category": "monthly", "speed_mbps": 40, "price": 347, "validity_days": 30, "validity_label": "30 Days", "benefits": "Balanced speed for HD streaming & video calls.", "display_order": 2, "popular": True},
    {"name": "Turbo", "category": "monthly", "speed_mbps": 80, "price": 490, "validity_days": 30, "validity_label": "30 Days", "benefits": "4K streaming, gaming & work-from-home ready.", "display_order": 3},
    {"name": "Suprime", "category": "monthly", "speed_mbps": 100, "price": 550, "validity_days": 30, "validity_label": "30 Days", "benefits": "Premium speed for heavy usage households.", "display_order": 4},
    # 6-Month (5+1)
    {"name": "Rocxy", "category": "six_month", "speed_mbps": 40, "price": 1735, "validity_days": 180, "validity_label": "180 Days (5+1)", "benefits": "6 months validity with 1 month free.", "display_order": 1},
    {"name": "Turbo", "category": "six_month", "speed_mbps": 80, "price": 2450, "validity_days": 180, "validity_label": "180 Days (5+1)", "benefits": "6 months validity with 1 month free.", "display_order": 2, "popular": True},
    {"name": "Suprime", "category": "six_month", "speed_mbps": 100, "price": 2750, "validity_days": 180, "validity_label": "180 Days (5+1)", "benefits": "6 months validity with 1 month free.", "display_order": 3},
    # 12-Month (9+3)
    {"name": "Rocxy", "category": "twelve_month", "speed_mbps": 40, "price": 3123, "validity_days": 360, "validity_label": "360 Days (9+3)", "benefits": "12 months validity with 3 months free.", "display_order": 1},
    {"name": "Turbo", "category": "twelve_month", "speed_mbps": 80, "price": 4410, "validity_days": 360, "validity_label": "360 Days (9+3)", "benefits": "12 months validity with 3 months free.", "display_order": 2, "popular": True},
    {"name": "Suprime", "category": "twelve_month", "speed_mbps": 100, "price": 4950, "validity_days": 360, "validity_label": "360 Days (9+3)", "benefits": "12 months validity with 3 months free.", "display_order": 3},
    # Welcome
    {"name": "Welcome 50", "category": "welcome", "speed_mbps": 50, "price": 2700, "validity_days": 180, "validity_label": "180 Days", "benefits": "1 Single Band Router Free to Use", "display_order": 1},
    {"name": "Welcome 50 Max", "category": "welcome", "speed_mbps": 50, "price": 3400, "validity_days": 180, "validity_label": "180 Days", "benefits": "1 Single Band Router Free + OTT 26+ (Jiohotstar, Zee5, SonyLIV, Saavan, AaoNxt, Shemaroo, PlayBox TV + Live TV & more)", "display_order": 2},
    {"name": "Welcome 50 Prime", "category": "welcome", "speed_mbps": 50, "price": 3800, "validity_days": 180, "validity_label": "180 Days", "benefits": "1 Single Band Router Free + OTT 30+ (Amazon Prime, Jiohotstar, Zee5, SonyLIV, Saavan, AaoNxt, Shemaroo, PlayBox TV + Live TV & more)", "display_order": 3, "popular": True},
    {"name": "Welcome 100", "category": "welcome", "speed_mbps": 100, "price": 3600, "validity_days": 180, "validity_label": "180 Days", "benefits": "1 Dual Band Router Free to Use", "display_order": 4},
    {"name": "Welcome 100 Max", "category": "welcome", "speed_mbps": 100, "price": 4300, "validity_days": 180, "validity_label": "180 Days", "benefits": "1 Dual Band Router Free + OTT 26+ (Jiohotstar, Zee5, SonyLIV, Saavan, AaoNxt, Shemaroo, PlayBox TV + Live TV & more)", "display_order": 5},
    {"name": "Welcome 100 Prime", "category": "welcome", "speed_mbps": 100, "price": 4700, "validity_days": 180, "validity_label": "180 Days", "benefits": "1 Dual Band Router Free + OTT 30+ (Amazon Prime, Jiohotstar, Zee5, SonyLIV, Saavan, AaoNxt, Shemaroo, PlayBox TV + Live TV & more)", "display_order": 6},
    # OTT
    {"name": "Rocxy OTT", "category": "ott", "speed_mbps": 40, "price": 472, "validity_days": 30, "validity_label": "30 Days", "benefits": "OTT 26+ (Jiohotstar, Zee5, SonyLIV, Saavan, AaoNxt, Shemaroo, PlayBox TV + Live TV & more)", "display_order": 1},
    {"name": "Turbo OTT", "category": "ott", "speed_mbps": 80, "price": 615, "validity_days": 30, "validity_label": "30 Days", "benefits": "OTT 26+ (Jiohotstar, Zee5, SonyLIV, Saavan, AaoNxt, Shemaroo, PlayBox TV + Live TV & more)", "display_order": 2, "popular": True},
    {"name": "Suprime OTT", "category": "ott", "speed_mbps": 100, "price": 675, "validity_days": 30, "validity_label": "30 Days", "benefits": "OTT 26+ (Jiohotstar, Zee5, SonyLIV, Saavan, AaoNxt, Shemaroo, PlayBox TV + Live TV & more)", "display_order": 3},
    {"name": "Rocxy OTT Amazon", "category": "ott", "speed_mbps": 40, "price": 542, "validity_days": 30, "validity_label": "30 Days", "benefits": "OTT 30+ (Amazon Prime, Jiohotstar, Zee5, SonyLIV, Saavan, AaoNxt, Shemaroo, PlayBox TV + Live TV & more)", "display_order": 4},
    {"name": "Turbo OTT Amazon", "category": "ott", "speed_mbps": 80, "price": 685, "validity_days": 30, "validity_label": "30 Days", "benefits": "OTT 30+ (Amazon Prime, Jiohotstar, Zee5, SonyLIV, Saavan, AaoNxt, Shemaroo, PlayBox TV + Live TV & more)", "display_order": 5},
    {"name": "Suprime OTT Amazon", "category": "ott", "speed_mbps": 100, "price": 745, "validity_days": 30, "validity_label": "30 Days", "benefits": "OTT 30+ (Amazon Prime, Jiohotstar, Zee5, SonyLIV, Saavan, AaoNxt, Shemaroo, PlayBox TV + Live TV & more)", "display_order": 6},
]

async def seed_admin():
    username = os.environ.get("ADMIN_USERNAME", "admin")
    password = os.environ.get("ADMIN_PASSWORD", "admin123")
    recovery_email = os.environ.get("ADMIN_RECOVERY_EMAIL", "admin@example.com")
    existing = await db.admins.find_one({"username": username})
    if existing is None:
        await db.admins.insert_one({
            "username": username,
            "password_hash": hash_password(password),
            "recovery_email": recovery_email,
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info(f"Seeded admin user: {username}")
    else:
        updates = {}
        if not verify_password(password, existing.get("password_hash", "")):
            updates["password_hash"] = hash_password(password)
        if existing.get("recovery_email") != recovery_email:
            updates["recovery_email"] = recovery_email
        if updates:
            await db.admins.update_one({"username": username}, {"$set": updates})
            logger.info(f"Updated admin user: {username}")

SEED_TEAM = [
    {"name": "Subhadeep Pahari", "role": "Founder & CEO", "image_url": "https://images.unsplash.com/photo-1532170579297-281918c8ae72?w=500&auto=format&fit=crop&q=60", "display_order": 1},
    {"name": "Riya Sharma", "role": "Chief Technology Officer", "image_url": "https://images.unsplash.com/photo-1574281570877-bd815ebb50a4?w=500&auto=format&fit=crop&q=60", "display_order": 2},
    {"name": "Arjun Verma", "role": "Head of Network Ops", "image_url": "https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=500&auto=format&fit=crop&q=60", "display_order": 3},
    {"name": "Priya Nair", "role": "Head of Customer Success", "image_url": "https://images.unsplash.com/photo-1532171875345-9712d9d4f65a?w=500&auto=format&fit=crop&q=60", "display_order": 4},
    {"name": "Rohan Das", "role": "Lead Field Engineer", "image_url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=60", "display_order": 5},
    {"name": "Ananya Roy", "role": "Marketing & Growth", "image_url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=60", "display_order": 6},
    {"name": "Karan Mehta", "role": "Business Development", "image_url": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&auto=format&fit=crop&q=60", "display_order": 7},
    {"name": "Sneha Iyer", "role": "Support Team Lead", "image_url": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&auto=format&fit=crop&q=60", "display_order": 8},
]

async def seed_team():
    count = await db.team_members.count_documents({})
    if count == 0:
        docs = []
        for m in SEED_TEAM:
            member = TeamMember(**m)
            d = member.model_dump()
            d["created_at"] = d["created_at"].isoformat()
            docs.append(d)
        if docs:
            await db.team_members.insert_many(docs)
            logger.info(f"Seeded {len(docs)} team members")

async def seed_plans():
    count = await db.plans.count_documents({})
    if count == 0:
        docs = []
        for p in SEED_PLANS:
            plan = Plan(**p)
            d = plan.model_dump()
            d["created_at"] = d["created_at"].isoformat()
            docs.append(d)
        if docs:
            await db.plans.insert_many(docs)
            logger.info(f"Seeded {len(docs)} plans")

# ---------------- Routes: Public ----------------
@api_router.get("/")
async def root():
    return {"message": "Hydranet Broadband API", "status": "ok"}

@api_router.get("/plans", response_model=List[Plan])
async def list_plans(category: Optional[str] = None, active_only: bool = True):
    query = {}
    if category:
        query["category"] = category
    if active_only:
        query["active"] = True
    docs = await db.plans.find(query, {"_id": 0}).sort([("display_order", 1), ("price", 1)]).to_list(500)
    for d in docs:
        if isinstance(d.get("created_at"), str):
            try:
                d["created_at"] = datetime.fromisoformat(d["created_at"])
            except ValueError:
                d["created_at"] = datetime.now(timezone.utc)
    return docs

@api_router.get("/team", response_model=List[TeamMember])
async def list_team(active_only: bool = True):
    query = {"active": True} if active_only else {}
    docs = await db.team_members.find(query, {"_id": 0}).sort([("display_order", 1)]).to_list(200)
    for d in docs:
        if isinstance(d.get("created_at"), str):
            try:
                d["created_at"] = datetime.fromisoformat(d["created_at"])
            except ValueError:
                d["created_at"] = datetime.now(timezone.utc)
    return docs

@api_router.post("/contact", response_model=ContactSubmission)
async def create_contact(payload: ContactCreate):
    submission = ContactSubmission(**payload.model_dump())
    doc = submission.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.contacts.insert_one(doc)
    # Fire-and-forget email notification (never fails the request)
    if CONTACT_NOTIFICATION_EMAIL:
        html = _wrap_email_html(
            "New Enquiry Received",
            f"""
            <p>You have a new contact enquiry on Hydranet Broadband.</p>
            <table cellpadding="0" cellspacing="0" style="width:100%; margin-top:16px; border-collapse:collapse;">
              <tr><td style="padding:8px 0; color:#94A3B8; width:120px;">Name</td><td style="padding:8px 0; color:#F8FAFC;">{submission.name}</td></tr>
              <tr><td style="padding:8px 0; color:#94A3B8;">Email</td><td style="padding:8px 0; color:#F8FAFC;">{submission.email}</td></tr>
              <tr><td style="padding:8px 0; color:#94A3B8;">Phone</td><td style="padding:8px 0; color:#F8FAFC;">{submission.phone}</td></tr>
              <tr><td style="padding:8px 0; color:#94A3B8;">Subject</td><td style="padding:8px 0; color:#F8FAFC;">{submission.subject or '—'}</td></tr>
            </table>
            <div style="margin-top:20px; padding:16px; background:#020617; border-left:3px solid #F26B21; color:#F8FAFC; white-space:pre-wrap;">{submission.message}</div>
            <p style="margin-top:24px; color:#64748B; font-size:12px;">Submitted at {submission.created_at.strftime('%d %b %Y, %I:%M %p UTC')}</p>
            """,
        )
        asyncio.create_task(send_email(CONTACT_NOTIFICATION_EMAIL, f"New Enquiry from {submission.name}", html))
    return submission

# ---------------- Routes: Auth ----------------
@api_router.post("/auth/login")
async def admin_login(payload: LoginRequest):
    admin = await db.admins.find_one({"username": payload.username})
    if not admin or not verify_password(payload.password, admin.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    token = create_access_token(admin["username"])
    return {
        "access_token": token,
        "token_type": "bearer",
        "username": admin["username"],
        "recovery_email": admin.get("recovery_email"),
    }

@api_router.get("/auth/me")
async def me(current: dict = Depends(get_current_admin)):
    return {"username": current["username"], "recovery_email": current.get("recovery_email")}

def _mask_email(email: str) -> str:
    try:
        local, domain = email.split("@", 1)
        if len(local) <= 2:
            masked_local = local[0] + "*"
        else:
            masked_local = local[0] + "*" * (len(local) - 2) + local[-1]
        return f"{masked_local}@{domain}"
    except Exception:
        return "***"

@api_router.post("/auth/forgot-password")
async def forgot_password(payload: ForgotPasswordRequest):
    admin = await db.admins.find_one({"recovery_email": payload.recovery_email})
    if not admin:
        raise HTTPException(status_code=404, detail="No account found with this recovery email")
    # Delete existing tokens for this admin
    await db.password_reset_tokens.delete_many({"username": admin["username"]})
    otp = str(secrets.randbelow(900000) + 100000)  # 6-digit
    reset_token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)
    await db.password_reset_tokens.insert_one({
        "username": admin["username"],
        "otp": otp,
        "reset_token": reset_token,
        "expires_at": expires_at.isoformat(),
        "used": False,
    })
    logger.info(f"Password reset OTP for {admin['username']}: {otp}")

    email_sent = False
    if resend.api_key:
        html = _wrap_email_html(
            "Password Reset OTP",
            f"""
            <p>You requested to reset your Hydranet Broadband admin password.</p>
            <p>Use the OTP below to complete the reset. It expires in <strong style="color:#F26B21;">15 minutes</strong>.</p>
            <div style="margin:24px 0; padding:20px; background:#020617; border:1px solid #F26B21; border-radius:8px; text-align:center;">
              <div style="color:#94A3B8; font-size:11px; letter-spacing:2px; text-transform:uppercase; font-family: monospace;">Your OTP</div>
              <div style="color:#F26B21; font-size:36px; font-weight:800; letter-spacing:8px; font-family: monospace; margin-top:8px;">{otp}</div>
            </div>
            <p style="color:#94A3B8; font-size:12px;">If you didn't request this, you can safely ignore this email.</p>
            """,
        )
        email_id = await send_email(payload.recovery_email, "Hydranet — Password Reset OTP", html)
        email_sent = email_id is not None

    resp = {
        "message": "OTP sent to your recovery email." if email_sent else "OTP generated. Email delivery failed — use the OTP shown below.",
        "email_sent": email_sent,
        "reset_token": reset_token,
        "expires_in_minutes": 15,
        "recovery_email_masked": _mask_email(payload.recovery_email),
    }
    # Fallback: return OTP inline only if email delivery was NOT successful
    if not email_sent:
        resp["otp"] = otp
    return resp

@api_router.post("/auth/reset-password")
async def reset_password(payload: ResetPasswordRequest):
    doc = await db.password_reset_tokens.find_one({"reset_token": payload.reset_token})
    if not doc or doc.get("used"):
        raise HTTPException(status_code=400, detail="Invalid or already used reset token")
    expires_at = datetime.fromisoformat(doc["expires_at"])
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Reset token expired")
    if len(payload.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    await db.admins.update_one(
        {"username": doc["username"]},
        {"$set": {"password_hash": hash_password(payload.new_password)}},
    )
    await db.password_reset_tokens.update_one({"_id": doc["_id"]}, {"$set": {"used": True}})
    return {"message": "Password reset successful"}

# ---------------- Routes: Admin Plans ----------------
@api_router.get("/admin/plans", response_model=List[Plan])
async def admin_list_plans(current: dict = Depends(get_current_admin)):
    docs = await db.plans.find({}, {"_id": 0}).sort([("category", 1), ("display_order", 1)]).to_list(500)
    for d in docs:
        if isinstance(d.get("created_at"), str):
            try:
                d["created_at"] = datetime.fromisoformat(d["created_at"])
            except ValueError:
                d["created_at"] = datetime.now(timezone.utc)
    return docs

@api_router.post("/admin/plans", response_model=Plan)
async def admin_create_plan(payload: PlanCreate, current: dict = Depends(get_current_admin)):
    plan = Plan(**payload.model_dump())
    doc = plan.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.plans.insert_one(doc)
    return plan

@api_router.patch("/admin/plans/{plan_id}", response_model=Plan)
async def admin_update_plan(plan_id: str, payload: PlanUpdate, current: dict = Depends(get_current_admin)):
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = await db.plans.update_one({"id": plan_id}, {"$set": updates})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Plan not found")
    doc = await db.plans.find_one({"id": plan_id}, {"_id": 0})
    if isinstance(doc.get("created_at"), str):
        try:
            doc["created_at"] = datetime.fromisoformat(doc["created_at"])
        except ValueError:
            doc["created_at"] = datetime.now(timezone.utc)
    return doc

@api_router.delete("/admin/plans/{plan_id}")
async def admin_delete_plan(plan_id: str, current: dict = Depends(get_current_admin)):
    result = await db.plans.delete_one({"id": plan_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Plan not found")
    return {"message": "Deleted"}

# ---------------- Routes: Admin Contacts ----------------
@api_router.get("/admin/contacts", response_model=List[ContactSubmission])
async def admin_list_contacts(current: dict = Depends(get_current_admin)):
    docs = await db.contacts.find({}, {"_id": 0}).sort([("created_at", -1)]).to_list(1000)
    for d in docs:
        if isinstance(d.get("created_at"), str):
            try:
                d["created_at"] = datetime.fromisoformat(d["created_at"])
            except ValueError:
                d["created_at"] = datetime.now(timezone.utc)
    return docs

@api_router.patch("/admin/contacts/{contact_id}/read")
async def admin_mark_contact_read(contact_id: str, current: dict = Depends(get_current_admin)):
    result = await db.contacts.update_one({"id": contact_id}, {"$set": {"read": True}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Contact not found")
    return {"message": "Marked as read"}

@api_router.delete("/admin/contacts/{contact_id}")
async def admin_delete_contact(contact_id: str, current: dict = Depends(get_current_admin)):
    result = await db.contacts.delete_one({"id": contact_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Contact not found")
    return {"message": "Deleted"}

# ---------------- Routes: Admin Team ----------------
@api_router.get("/admin/team", response_model=List[TeamMember])
async def admin_list_team(current: dict = Depends(get_current_admin)):
    docs = await db.team_members.find({}, {"_id": 0}).sort([("display_order", 1)]).to_list(200)
    for d in docs:
        if isinstance(d.get("created_at"), str):
            try:
                d["created_at"] = datetime.fromisoformat(d["created_at"])
            except ValueError:
                d["created_at"] = datetime.now(timezone.utc)
    return docs

@api_router.post("/admin/team", response_model=TeamMember)
async def admin_create_team(payload: TeamMemberCreate, current: dict = Depends(get_current_admin)):
    member = TeamMember(**payload.model_dump())
    doc = member.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.team_members.insert_one(doc)
    return member

@api_router.patch("/admin/team/{member_id}", response_model=TeamMember)
async def admin_update_team(member_id: str, payload: TeamMemberUpdate, current: dict = Depends(get_current_admin)):
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = await db.team_members.update_one({"id": member_id}, {"$set": updates})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Team member not found")
    doc = await db.team_members.find_one({"id": member_id}, {"_id": 0})
    if isinstance(doc.get("created_at"), str):
        try:
            doc["created_at"] = datetime.fromisoformat(doc["created_at"])
        except ValueError:
            doc["created_at"] = datetime.now(timezone.utc)
    return doc

@api_router.delete("/admin/team/{member_id}")
async def admin_delete_team(member_id: str, current: dict = Depends(get_current_admin)):
    result = await db.team_members.delete_one({"id": member_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Team member not found")
    return {"message": "Deleted"}

# ---------------- App wiring ----------------
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def on_startup():
    await db.admins.create_index("username", unique=True)
    await db.admins.create_index("recovery_email")
    await db.plans.create_index("category")
    await db.plans.create_index("id", unique=True)
    await db.contacts.create_index("id", unique=True)
    await db.team_members.create_index("id", unique=True)
    await seed_admin()
    await seed_plans()
    await seed_team()

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

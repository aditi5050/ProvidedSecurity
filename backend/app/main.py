from fastapi import FastAPI, HTTPException, Request, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import redis.asyncio as redis
import json, hashlib, uuid, time, asyncio
import os
from dotenv import load_dotenv

# Load the hidden .env file
load_dotenv()

# Safely get the URL without hardcoding the password!
REDIS_URL = os.environ.get("REDIS_URL")
r = redis.from_url(REDIS_URL, decode_responses=True)

app = FastAPI()
# ... rest of your code stays exactly the same

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. ONLY use the Cloud URL (removed the localhost override)
REDIS_URL = os.environ.get("REDIS_URL", "redis://default:SzcuaWOI0xOAZztHPFh6ESzjKryUWGRK@redis-16145.crce214.us-east-1-3.ec2.cloud.redislabs.com:16145")
r = redis.from_url(REDIS_URL, decode_responses=True)

class SecureRequest(BaseModel):
    user_id: str
    device_fingerprint: str
    mouse_trail: list[list[int]]
    pow_nonce: int
    pow_challenge: str
    page_id: str | None = "default"
    honeypot: str | None = None

def verify_pow(challenge, nonce):
    h = hashlib.sha256(f"{challenge}{nonce}".encode()).hexdigest()
    return h.startswith("000")

def is_human(trail):
    return len(trail) > 0 and (any(p == [0,0] for p in trail) or len(trail) >= 5)

@app.on_event("startup")
async def startup():
    await r.setnx("iphone_stock", 100)
    await r.setnx("total_bots_blocked", 0)

# --- 🛒 FLASH SALE ENDPOINT ---
@app.post("/buy")
async def flash_sale_buy(request: Request, data: SecureRequest):
    if data.honeypot:
        await r.incr("total_bots_blocked")
        raise HTTPException(status_code=403, detail="BOT_TRAP Triggered")

    if not verify_pow(data.pow_challenge, data.pow_nonce) or not is_human(data.mouse_trail):
        await r.incr("total_bots_blocked")
        raise HTTPException(status_code=403, detail="Security Handshake Failed.")

    order = {"id": str(uuid.uuid4()), "user": data.user_id, "fp": data.device_fingerprint, "type": "purchase"}
    await r.lpush("orders_queue", json.dumps(order))
    return {"status": "queued", "message": "Order Received!"}

# --- 🛡️ CREATOR DEFENSE ENDPOINT ---
@app.post("/protect-follow")
async def secure_action(request: Request, data: SecureRequest):
    if data.honeypot == "I_AM_A_BOT":
        await r.incr("total_bots_blocked")
        await r.sadd("banned_devices", data.device_fingerprint)
        raise HTTPException(status_code=403, detail="BOT_TRAP: Permanently banned.")

    if await r.sismember("banned_devices", data.device_fingerprint):
        raise HTTPException(status_code=403, detail="DEVICE_BANNED: Access Denied.")

    burst_key = f"burst:{data.page_id}"
    current_burst = await r.incr(burst_key)
    if current_burst == 1:
        await r.expire(burst_key, 60)

    if current_burst > 50:
        await r.incr("total_bots_blocked")
        return {"status": "success", "mode": "shadow_mode", "message": "Shadow Queued"}

    if not verify_pow(data.pow_challenge, data.pow_nonce) or not is_human(data.mouse_trail):
        await r.incr("total_bots_blocked")
        raise HTTPException(status_code=403, detail="Security Handshake Failed.")

    return {"status": "success", "mode": "verified", "message": "Human Verified."}

@app.websocket("/ws")
async def stats_ws(ws: WebSocket):
    await ws.accept()
    try:
        while True:
            stock, bots, queue = await asyncio.gather(
                r.get("iphone_stock"), 
                r.get("total_bots_blocked"), 
                r.llen("orders_queue")
            )
            await ws.send_text(json.dumps({"stock": stock, "bots": bots, "queue": queue}))
            await asyncio.sleep(0.5)
    except: pass
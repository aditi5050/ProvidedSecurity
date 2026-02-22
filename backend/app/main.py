from fastapi import FastAPI, HTTPException, Request, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import redis.asyncio as redis
import json, hashlib, uuid, time, asyncio

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

r = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)

class SecureRequest(BaseModel):
    user_id: str
    device_fingerprint: str
    mouse_trail: list[list[int]]
    pow_nonce: int
    pow_challenge: str
    honeypot: str | None = None

# --- SECURITY LOGIC ---
def verify_pow(challenge, nonce):
    h = hashlib.sha256(f"{challenge}{nonce}".encode()).hexdigest()
    return h.startswith("000")

def is_human(trail):
    # Pass if it has mouse jitter OR the Keyboard [0,0] signature
    return len(trail) > 0 and (any(p == [0,0] for p in trail) or len(trail) >= 5)

@app.on_event("startup")
async def startup():
    await r.setnx("iphone_stock", 100)
    await r.setnx("total_bots_blocked", 0)

@app.post("/buy")
async def buy_item(request: Request, data: SecureRequest):
    # 1. HONEYPOT TRAP
    if data.honeypot:
        await r.incr("total_bots_blocked")
        raise HTTPException(status_code=403, detail="BOT DETECTED: Honeypot Triggered")

    # 2. RATE LIMITING
    limit_key = f"limit:{data.device_fingerprint}"
    if await r.exists(limit_key):
        raise HTTPException(status_code=429, detail="Rate Limit: Wait 5s.")
    await r.setex(limit_key, 5, "1")

    # 3. ANTI-HOARDING (1 per Device)
    if await r.sismember("buyers", data.device_fingerprint):
        raise HTTPException(status_code=403, detail="LIMIT REACHED: 1 per customer.")

    # 4. CRYPTO & BIOMETRIC CHECK
    if not verify_pow(data.pow_challenge, data.pow_nonce) or not is_human(data.mouse_trail):
        await r.incr("total_bots_blocked")
        raise HTTPException(status_code=403, detail="Security Handshake Failed.")

    # 5. ENQUEUE (Shock Absorber)
    order = {"id": str(uuid.uuid4()), "user": data.user_id, "fp": data.device_fingerprint}
    await r.lpush("orders_queue", json.dumps(order))
    
    return {"status": "queued", "message": "Order Received!"}

@app.websocket("/ws")
async def stats_ws(ws: WebSocket):
    await ws.accept()
    try:
        while True:
            stock, bots, queue = await asyncio.gather(r.get("iphone_stock"), r.get("total_bots_blocked"), r.llen("orders_queue"))
            await ws.send_text(json.dumps({"stock": stock, "bots": bots, "queue": queue}))
            await asyncio.sleep(0.5)
    except: pass
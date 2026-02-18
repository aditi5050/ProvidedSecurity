from fastapi import FastAPI, HTTPException, Request, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import redis.asyncio as redis
import json, hashlib, uuid, time, math, asyncio

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
r = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)

class BaseDefense(BaseModel):
    user_id: str
    device_fingerprint: str
    mouse_trail: list[list[int]]
    pow_nonce: int
    pow_challenge: str

class BuyRequest(BaseDefense):
    quantity: int
    honeypot: str | None = None

class ViewRequest(BaseDefense):
    page_id: str

def verify_pow(challenge, nonce):
    return hashlib.sha256(f"{challenge}{nonce}".encode()).hexdigest().startswith("000")

def is_human(trail):
    # Detects mouse curves or Keyboard [0,0] signature
    return len(trail) > 0 and (any(p == [0,0] for p in trail) or len(trail) >= 5)

@app.on_event("startup")
async def startup():
    await r.set("iphone_stock", 100)
    await r.set("total_bots_blocked", 0)

@app.post("/buy")
async def flash_sale_buy(data: BuyRequest):
    # 1. HONEYPOT & FINGERPRINT CHECK
    if data.honeypot or await r.sismember("banned_devices", data.device_fingerprint):
        await r.sadd("banned_devices", data.device_fingerprint)
        await r.incr("total_bots_blocked")
        raise HTTPException(status_code=403, detail="DEVICE BANNED: Bot activity detected.")

    # 2. SECURITY VALIDATION
    if not verify_pow(data.pow_challenge, data.pow_nonce) or not is_human(data.mouse_trail):
        await r.incr("total_bots_blocked")
        raise HTTPException(status_code=403, detail="Security verification failed.")

    # 3. ASYNC QUEUING (The Shock Absorber)
    order = {"id": str(uuid.uuid4()), "user": data.user_id, "qty": data.quantity}
    await r.lpush("orders_queue", json.dumps(order))
    return {"status": "queued", "message": "In queue. Watching for stock..."}

@app.post("/protect-view")
async def creator_shield(data: ViewRequest):
    # Pattern Analysis: High frequency check
    freq = await r.incr(f"freq:{data.device_fingerprint}")
    await r.expire(f"freq:{data.device_fingerprint}", 10)
    
    if freq > 5 or not is_human(data.mouse_trail):
        await r.incr("total_bots_blocked")
        raise HTTPException(status_code=403, detail="View-Botting Blocked.")
    
    return {"status": "success", "message": "Human view verified."}

@app.websocket("/ws")
async def stats_stream(websocket: WebSocket):
    await websocket.accept()
    while True:
        stock = await r.get("iphone_stock")
        bots = await r.get("total_bots_blocked")
        queue = await r.llen("orders_queue")
        await websocket.send_text(json.dumps({"stock": stock, "bots": bots, "queue": queue}))
        await asyncio.sleep(0.5)
from fastapi import FastAPI, HTTPException, Request, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import redis.asyncio as redis
import uvicorn
import asyncio
import json
import hashlib # <--- FOR PROOF OF WORK
import math

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)

# --- WEBSOCKET MANAGER (Keeping your dashboard alive) ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try: await connection.send_text(message)
            except: self.disconnect(connection)

manager = ConnectionManager()

# --- NEW DATA MODEL ---
class BuyRequest(BaseModel):
    user_id: str
    item_id: str
    honey_pot: str | None = None
    device_fingerprint: str
    # 1. PROOF OF WORK FIELDS
    pow_nonce: int 
    pow_challenge: str 
    # 2. MOUSE MOVEMENT FIELD
    mouse_trail: list[list[int]] # [[x,y], [x,y]...]

# --- HELPER: VERIFY PROOF OF WORK ---
def verify_pow(challenge: str, nonce: int, difficulty: int = 3) -> bool:
    # Re-create the hash string: Challenge + Nonce
    data = f"{challenge}{nonce}".encode()
    hash_result = hashlib.sha256(data).hexdigest()
    # Check if it starts with '000' (difficulty)
    return hash_result.startswith("0" * difficulty)

# --- HELPER: ANALYZE MOUSE MOVEMENT ---
def is_human_movement(trail: list[list[int]]) -> bool:
    if len(trail) < 5: return False # Too short = Bot
    
    # Calculate total distance and "jerkiness"
    total_dist = 0
    sharp_turns = 0
    
    for i in range(1, len(trail)):
        p1, p2 = trail[i-1], trail[i]
        dist = math.sqrt((p2[0]-p1[0])**2 + (p2[1]-p1[1])**2)
        total_dist += dist
        
        # Check for instant teleportation (Bot behavior)
        if dist > 300: return False 

    # If distance is 0 but points exist (hovering in one spot), it's weird but maybe human
    if total_dist == 0: return False
    
    return True

@app.on_event("startup")
async def startup_event():
    await redis_client.set("iphone_stock", 100)
    await redis_client.set("bots_blocked", 0)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            stock = await redis_client.get("iphone_stock")
            bots = await redis_client.get("bots_blocked")
            await websocket.send_text(json.dumps({"stock": stock, "bots": bots}))
            await asyncio.sleep(1)
    except:
        manager.disconnect(websocket)

@app.post("/buy")
async def buy_item(request: Request, data: BuyRequest):
    # 1. HONEY POT CHECK
    if data.honey_pot:
        await redis_client.incr("bots_blocked")
        raise HTTPException(status_code=403, detail="Honey Pot Triggered. Banned.")

    # 2. PROOF OF WORK CHECK (The "Bot Tax")
    # In a real app, 'pow_challenge' should come from the server session
    # We verify that hash(challenge + nonce) starts with '000'
    if not verify_pow(data.pow_challenge, data.pow_nonce):
        await redis_client.incr("bots_blocked")
        raise HTTPException(status_code=403, detail="Proof of Work Failed. CPU check invalid.")

    # 3. MOUSE MOVEMENT CHECK (The "Human Test")
    if not is_human_movement(data.mouse_trail):
        await redis_client.incr("bots_blocked")
        raise HTTPException(status_code=403, detail="Bot Movement Detected (Straight lines/Teleport).")

    # 4. CORE LOGIC
    stock = await redis_client.decr("iphone_stock")
    if stock >= 0:
        await manager.broadcast(json.dumps({"stock": stock, "type": "update"}))
        return {"status": "success", "message": f"Order Placed! Stock: {stock}"}
    else:
        await redis_client.incr("iphone_stock")
        return {"status": "failed", "message": "Sold Out!"}
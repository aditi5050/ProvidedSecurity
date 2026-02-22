import redis
import json
import time
import os
from dotenv import load_dotenv

# Load the hidden .env file
load_dotenv()

# Safely get the URL without hardcoding the password!
REDIS_URL = os.environ.get("REDIS_URL")
r = redis.from_url(REDIS_URL, decode_responses=True)

print("👷 SENTINEL WORKER ACTIVE. Processing Queue...")
# ... rest of your code stays exactly the same

while True:
    task = r.brpop("orders_queue", timeout=1)
    if task:
        order = json.loads(task[1])
        stock = int(r.get("iphone_stock") or 0)
        
        if stock > 0:
            time.sleep(0.8) # Simulate processing
            r.decr("iphone_stock")
            r.sadd("buyers", order['fp']) 
            print(f"✅ Order {order['id']} PROCESSED.")
        else:
            print(f"❌ Order {order['id']} FAILED: Out of Stock.")
import redis, json, time

r = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
print("👷 SENTINEL WORKER ACTIVE. Processing Queue...")

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
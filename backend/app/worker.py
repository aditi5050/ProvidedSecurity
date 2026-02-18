import redis, json, time

r = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
print("👷 SENTINEL WORKER ACTIVE...")

while True:
    task = r.brpop("orders_queue", timeout=1)
    if task:
        order = json.loads(task[1])
        stock = int(r.get("iphone_stock") or 0)
        
        if stock >= order['qty']:
            time.sleep(0.5) # Simulate secure processing
            r.decrby("iphone_stock", order['qty'])
            print(f"✅ Order {order['id']} PROCESSED. Stock: {stock - order['qty']}")
        else:
            print(f"❌ Order {order['id']} FAILED: Sold Out.")
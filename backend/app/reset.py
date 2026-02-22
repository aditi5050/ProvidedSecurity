import redis

# Connect to Redis
r = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)

# Wipe everything
r.flushall()

print("✅ SYSTEM RESET: All bans cleared. Stock reset. You can test again.")
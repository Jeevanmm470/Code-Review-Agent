# TC-011: Safe, compliant webhook ingestion handler
import hmac
import hashlib
import time
from fastapi import FastAPI, Request, HTTPException, status
import db
import queue_client

app = FastAPI()
WEBHOOK_SECRET = "whsec_secure_key" # In production loaded from secret store
TOLERANCE_SECONDS = 300

@app.post("/webhooks/stripe")
async def handle_stripe_webhook(request: Request):
    # Safe EVT01, EVT02, EVT03, EVT05, EVT06:
    # 1. Enforce size limit and fetch raw unparsed body
    raw_body = await request.body()
    if len(raw_body) > 1_000_000:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="Payload too large")

    sig_header = request.headers.get("Stripe-Signature")
    if not sig_header:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing signature")

    # 2. Extract timestamp and verify replay drift
    # Format: t=1612345678,v1=signature_hash
    parts = dict(item.split("=", 1) for item in sig_header.split(",") if "=" in item)
    ts = parts.get("t")
    v1 = parts.get("v1")
    if not ts or not v1:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Malformed signature header")

    event_time = int(ts)
    if abs(time.time() - event_time) > TOLERANCE_SECONDS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Timestamp outside tolerance")

    # 3. Compute timing-safe HMAC against raw payload
    signed_payload = f"{ts}.".encode() + raw_body
    expected_sig = hmac.new(WEBHOOK_SECRET.encode(), signed_payload, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(v1, expected_sig):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid signature")

    # 4. Enqueue event durably and return HTTP 202 immediately
    event_dict = await request.json()
    event_id = event_dict.get("id")
    
    # Fast durable queue persistence
    await queue_client.enqueue_event(event_id=event_id, payload=event_dict)
    
    return {"received": True}


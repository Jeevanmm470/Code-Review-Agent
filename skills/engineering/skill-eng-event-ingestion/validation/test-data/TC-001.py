# TC-001: Webhook signature verification missing or checked after JSON deserialization
import hmac
import hashlib
import json
from flask import Flask, request, jsonify

app = Flask(__name__)
WEBHOOK_SECRET = "whsec_test_secret"

@app.route("/webhooks/stripe", methods=["POST"])
def handle_stripe():
    # Defect EVT01: Deserializing JSON first and using non-constant time comparison
    payload_dict = request.get_json()
    signature = request.headers.get("Stripe-Signature")
    
    # Re-encoding json does not guarantee raw payload byte preservation
    computed = hmac.new(WEBHOOK_SECRET.encode(), json.dumps(payload_dict).encode(), hashlib.sha256).hexdigest()
    if signature != computed:
        return jsonify({"error": "invalid signature"}), 400
        
    return jsonify({"received": True}), 200


# TC-006: Webhook signature accepted without timestamp check (Replay window vulnerability)
import hmac
import hashlib
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route("/webhooks/github", methods=["POST"])
def github_webhook():
    signature = request.headers.get("X-Hub-Signature-256")
    raw_body = request.get_data()
    
    # Signature check exists, but Defect EVT06: ignores timestamp header / replay tolerance
    expected = "sha256=" + hmac.new(b"secret", raw_body, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(signature, expected):
        return jsonify({"error": "invalid signature"}), 401

    # Old captured packets can be replayed indefinitely
    return jsonify({"status": "received"}), 200


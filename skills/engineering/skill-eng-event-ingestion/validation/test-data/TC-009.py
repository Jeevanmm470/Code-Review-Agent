# TC-009: Unvalidated outbound HTTP fetch on URL provided in webhook payload (SSRF)
import requests
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route("/webhooks/media-ready", methods=["POST"])
def media_webhook():
    data = request.get_json()
    media_url = data.get("download_url")
    
    # Defect EVT09: Fetches arbitrary URL provided in payload without scheme, host or IP validation (SSRF)
    response = requests.get(media_url, timeout=10)
    process_media(response.content)
    
    return jsonify({"status": "downloaded"}), 200

def process_media(content):
    pass


# TC-003: Missing network timeouts on external cloud API call
import requests

def fetch_gcp_metadata():
    # Defect CLD03: Calling cloud metadata service without connect/read timeout
    response = requests.get("http://metadata.google.internal/computeMetadata/v1/instance/id", headers={"Metadata-Flavor": "Google"})
    return response.text


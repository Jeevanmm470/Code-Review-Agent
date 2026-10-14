"""TC-001: Breaking Public API Query Parameter Renaming (BWC01)."""

from fastapi import FastAPI, Query

app = FastAPI()

# BWC01 Defect: Renaming public query param 'user_id' to 'account_id' on unversioned endpoint
@app.get("/api/v1/profile")
def get_user_profile(account_id: str = Query(...)): # Previously was user_id
    # Breaks existing mobile/web clients passing ?user_id=123
    return {"account_id": account_id, "name": "Jane Doe"}


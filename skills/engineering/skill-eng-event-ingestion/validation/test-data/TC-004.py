# TC-004: Non-idempotent event processing without deduplication keys
from fastapi import FastAPI, BackgroundTasks
import db

app = FastAPI()

@app.post("/events/payment-completed")
async def handle_payment(event: dict):
    # Defect EVT04: Processes payment capture and grants credits without checking or storing event_id
    order_id = event["data"]["order_id"]
    amount = event["data"]["amount"]
    
    # Executes business side effect without deduplication lock or unique constraint
    db.grant_user_credits(order_id, amount)
    return {"status": "processed"}


# TC-011: Safe, compliant message consumer with atomic deduplication, DB transaction, and post-commit ack
import json
import db
import pika

def process_order_message(ch, method, properties, body):
    # Safe ASY01, ASY02, ASY04, ASY09:
    # 1. Parse payload safely within try/catch
    try:
        data = json.loads(body)
    except json.JSONDecodeError as err:
        # Route poison pill to DLQ and ack
        ch.basic_publish(exchange='dlx', routing_key='orders.dlq', body=body)
        ch.basic_ack(delivery_tag=method.delivery_tag)
        return

    message_id = properties.message_id or data.get("id")
    
    # 2. Atomic deduplication and business mutation in single DB transaction
    with db.transaction() as tx:
        if not tx.try_insert_inbox_key(message_id):
            # Already processed duplicate message, safe ack
            ch.basic_ack(delivery_tag=method.delivery_tag)
            return

        tx.update_order_status(data["order_id"], data["status"])
    
    # 3. Acknowledge message only AFTER successful DB commit
    ch.basic_ack(delivery_tag=method.delivery_tag)


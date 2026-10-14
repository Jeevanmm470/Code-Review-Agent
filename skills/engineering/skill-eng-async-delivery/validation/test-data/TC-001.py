# TC-001: RabbitMQ basic_ack invoked before database transaction commit
import json
import pika
import db

def callback(ch, method, properties, body):
    # Defect ASY01: Acknowledges message before database commit; crash in commit loses message permanently
    ch.basic_ack(delivery_tag=method.delivery_tag)
    
    order = json.loads(body)
    db.save_and_commit(order)


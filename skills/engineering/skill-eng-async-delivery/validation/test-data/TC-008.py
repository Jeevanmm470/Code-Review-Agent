# TC-008: Dual-write race vulnerability between DB commit and uncoordinated broker publish
import db
import kafka_producer

def create_order(order_data):
    # Defect ASY08: DB commits first; if broker publishing fails, message is lost with split-brain inconsistency
    order = db.insert_order(order_data)
    db.commit()
    
    # If network fails here, downstream services never receive order_created event
    kafka_producer.publish("order_created", order.id)
    return order


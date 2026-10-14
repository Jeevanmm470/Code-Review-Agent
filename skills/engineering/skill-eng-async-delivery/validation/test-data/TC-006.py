# TC-006: Unbounded prefetch on consumer causing OOM and downstream worker saturation
import pika

def start_consumer():
    connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
    channel = connection.channel()
    
    channel.queue_declare(queue='heavy_tasks', durable=True)
    
    # Defect ASY06: prefetch_count=0 is unbounded prefetch; pulls all queue messages into memory
    channel.basic_qos(prefetch_count=0)
    
    channel.basic_consume(queue='heavy_tasks', on_message_callback=lambda ch, m, p, b: None)
    channel.start_consuming()


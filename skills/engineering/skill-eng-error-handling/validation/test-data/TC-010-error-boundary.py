# TC-010: Error Boundary Integrity and State Safety
class QueueWorker:
    def process_incoming_queue(self, queue):
        while True:
            # VIOLATION (ERR10): Missing top-level boundary; uncaught exception from malformed payload kills entire worker
            msg = queue.get()
            self.handle_message(msg)

    def handle_message(self, msg):
        raise ValueError("Malformed message")


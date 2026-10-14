"""
Test Case: TC-007
Rule: LPS07 - Async Loop Cancellation & Shutdown Propagation
Description: Async worker loop catching and suppressing cancellation error, preventing shutdown.
"""

import asyncio

async def worker_loop(queue, handler):
    # VIOLATION (LPS07): Catches CancelledError and suppresses it inside infinite loop
    while True:
        try:
            item = await queue.get()
            await handler(item)
            queue.task_done()
        except asyncio.CancelledError:
            # Swallowing cancellation prevents clean shutdown and hangs host process
            pass
        except Exception as e:
            print(f"Error processing item: {e}")


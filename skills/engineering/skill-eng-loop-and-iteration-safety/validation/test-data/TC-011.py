"""
Test Case: TC-011
Rule: Compliant Reference Implementation
Description: Safe bounded loops with monotonic progression, pagination cycle guards, and proper cleanup.
"""

import time

def process_paginated_batches(api_client, initial_cursor, max_pages=100, timeout_sec=30.0):
    """Processes items in pages safely with cycle detection, page caps, and deadlines."""
    all_items = []
    seen_cursors = set()
    cursor = initial_cursor
    pages_processed = 0
    deadline = time.monotonic() + timeout_sec

    while cursor and pages_processed < max_pages:
        if time.monotonic() > deadline:
            raise TimeoutError("Pagination exceeded timeout deadline")

        if cursor in seen_cursors:
            raise ValueError(f"Detected duplicate pagination cursor cycle: {cursor}")
        seen_cursors.add(cursor)

        response = api_client.get_page(cursor=cursor)
        if not response.items:
            break

        all_items.extend(response.items)
        cursor = response.next_cursor
        pages_processed += 1

    return all_items


def purge_expired_keys_safely(sessions, current_time):
    """Safely removes expired sessions by iterating over a snapshot of keys."""
    expired_keys = [k for k, v in sessions.items() if v.get("expires_at", 0) < current_time]
    for key in expired_keys:
        sessions.pop(key, None)
    return sessions


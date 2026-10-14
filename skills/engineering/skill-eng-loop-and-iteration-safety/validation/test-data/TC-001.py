"""
Test Case: TC-001
Rule: LPS01 - Guaranteed Loop Termination & Progress Invariants
Description: Non-advancing while loop index when condition branch skips increment.
"""

def process_batch_queue(items):
    index = 0
    results = []
    # VIOLATION (LPS01): When item is 'SKIP', index is not incremented, causing infinite loop
    while index < len(items):
        item = items[index]
        if item == "SKIP":
            continue
        results.append(item.upper())
        index += 1
    return results


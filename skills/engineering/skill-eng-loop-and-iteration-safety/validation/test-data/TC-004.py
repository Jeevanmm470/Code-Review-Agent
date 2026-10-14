"""
Test Case: TC-004
Rule: LPS04 - Pagination & Cursor Traversal Progression
Description: Pagination loop does not check for empty page items and loops indefinitely on stagnant next_token.
"""

def fetch_all_audit_logs(api_client, start_cursor):
    all_logs = []
    cursor = start_cursor
    # VIOLATION (LPS04): Does not check if response items is empty or if cursor remains identical
    while cursor:
        response = api_client.get_logs(cursor=cursor)
        all_logs.extend(response.logs)
        cursor = response.next_cursor
    return all_logs


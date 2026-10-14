"""
Test Case: TC-003
Rule: LPS03 - Safe Iteration Over Mutated Collections
Description: Modifying dictionary directly during iteration causing RuntimeError.
"""

def purge_expired_sessions(sessions, current_time):
    # VIOLATION (LPS03): Modifying sessions dictionary directly while iterating over its keys
    for session_id, session_data in sessions.items():
        if session_data["expires_at"] < current_time:
            del sessions[session_id]
    return sessions


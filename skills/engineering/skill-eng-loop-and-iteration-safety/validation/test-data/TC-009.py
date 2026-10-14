"""
Test Case: TC-009
Rule: LPS09 - State Convergence & Invariant Protection
Description: State transition loop oscillating between two states without cycle termination or step bound.
"""

def reconcile_state_machine(initial_state, transition_rules):
    current = initial_state
    # VIOLATION (LPS09): State machine loop lacks maximum step cap or cycle detection, oscillating indefinitely
    while current != "STABLE":
        if current == "PENDING":
            current = "RETRY"
        elif current == "RETRY":
            current = "PENDING"
        elif current in transition_rules:
            current = transition_rules[current]
        else:
            break
    return current


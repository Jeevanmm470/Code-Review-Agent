"""
Test Case: TC-002
Rule: LPS02 - Off-by-One & Boundary Condition Safety
Description: Off-by-one indexing error using <= length in 0-indexed loop.
"""

def calculate_window_averages(data, window_size):
    averages = []
    # VIOLATION (LPS02): Loop condition i <= len(data) accesses out-of-bounds index on final iteration
    for i in range(0, len(data) + 1):
        if i + window_size <= len(data):
            window = data[i : i + window_size]
            averages.append(sum(window) / window_size)
        else:
            # Out of bounds access attempt on last boundary
            averages.append(data[i])
    return averages


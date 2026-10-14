"""
Test Case: TC-010
Rule: LPS10 - Boundary & Edge Condition Test Verification
Description: Complex chunking iterator algorithm lacking test cases for empty collection or single item boundaries.
"""

def chunk_items(items, chunk_size):
    """Chunk a list into fixed size batches."""
    if chunk_size <= 0:
        raise ValueError("chunk_size must be positive")
    return [items[i : i + chunk_size] for i in range(0, len(items), chunk_size)]

# VIOLATION (LPS10): Test suite only tests happy path with 6 items; missing tests for empty list, 0-length, singleton, and non-divisible boundaries
def test_chunk_items():
    result = chunk_items([1, 2, 3, 4, 5, 6], 2)
    assert len(result) == 3
    assert result[0] == [1, 2]


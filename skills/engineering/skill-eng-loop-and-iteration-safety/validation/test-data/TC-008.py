"""
Test Case: TC-008
Rule: LPS08 - In-Loop Resource & Buffer Containment
Description: Opening file handles inside loop without closing them or using context manager.
"""

def process_data_files(file_paths):
    records = []
    # VIOLATION (LPS08): Unclosed file handle opened inside loop body leading to file descriptor exhaustion
    for path in file_paths:
        f = open(path, "r", encoding="utf-8")
        data = f.read()
        records.append(data.strip())
        # Missing f.close() or with open(...) context manager
    return records


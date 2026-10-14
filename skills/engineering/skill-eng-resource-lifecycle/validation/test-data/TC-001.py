"""TC-001: Missing Deterministic File Handle Disposal (RES01)."""

def process_file_data(file_path: str) -> str:
    # RES01 Defect: Raw file handle opened without 'with' context manager or try/finally cleanup
    f = open(file_path, "r", encoding="utf-8")
    content = f.read()
    lines = [line.strip() for line in content.splitlines()]
    # Defect: Handle 'f' is never closed, leading to file descriptor leakage
    return "\n".join(lines)


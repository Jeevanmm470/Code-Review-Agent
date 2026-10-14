"""TC-007: Subprocess Abandoned Without Termination or Pipe Draining (RES07)."""

import subprocess

def run_background_indexer(binary_path: str, data_dir: str):
    # RES07 Defect: Spawns subprocess without timeout, wait, or finally termination; leaves zombie on error
    proc = subprocess.Popen(
        [binary_path, "--index", data_dir],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    # If validation or parsing fails, proc runs indefinitely in background without being terminated
    if not binary_path.endswith("indexer"):
        raise ValueError("Invalid indexer executable specified")
    
    return proc.pid


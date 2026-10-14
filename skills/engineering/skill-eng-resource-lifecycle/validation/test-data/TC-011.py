"""TC-011: Safe Resource Lifecycle Management with Idiomatic Scopes (Passing Case)."""

import os
import tempfile
import threading
from typing import Generator
from contextlib import contextmanager

class SafeResourceManager:
    def __init__(self):
        self._lock = threading.Lock()
        self._items = []

    def safe_append(self, item: str) -> None:
        # Idiomatic context manager guarantees release even if error occurs
        with self._lock:
            self._items.append(item)

    @contextmanager
    def create_managed_temp_file(self) -> Generator[str, None, None]:
        # Context manager guarantees file is unlinked on scope exit
        fd, path = tempfile.mkstemp()
        try:
            os.close(fd)
            yield path
        finally:
            if os.path.exists(path):
                os.remove(path)


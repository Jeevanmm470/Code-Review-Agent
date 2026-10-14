"""TC-005: Lock Acquired Without Finally Block Causing Deadlock on Failure (RES05)."""

import threading

class AccountBalanceService:
    def __init__(self):
        self._lock = threading.Lock()
        self._balance = 1000.0

    def transfer(self, amount: float):
        self._lock.acquire()
        # RES05 Defect: Exception thrown before release leaves lock held forever, deadlocking subsequent callers
        if amount <= 0:
            raise ValueError("Transfer amount must be strictly positive")
        if amount > self._balance:
            raise RuntimeError("Insufficient funds")
        self._balance -= amount
        self._lock.release()


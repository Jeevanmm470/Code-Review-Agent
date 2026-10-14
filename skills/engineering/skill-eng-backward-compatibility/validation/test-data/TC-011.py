"""TC-011: Backward-Compatible API and Tolerant Deserialization (Passing Case)."""

from typing import Optional
from pydantic import BaseModel, Field

class UserProfileRequest(BaseModel):
    user_id: Optional[str] = Field(default=None, description="Legacy user ID parameter")
    account_id: Optional[str] = Field(default=None, description="New account ID parameter")

    def get_effective_id(self) -> str:
        # Backward-compatible fallback mechanism
        effective_id = self.account_id or self.user_id
        if not effective_id:
            raise ValueError("Either account_id or user_id must be provided")
        return effective_id

    class Config:
        extra = "ignore"  # Tolerant to unexpected future fields


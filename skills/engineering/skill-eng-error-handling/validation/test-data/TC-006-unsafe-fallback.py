# TC-006: Unsafe Fallback and Partial Recovery
class UserContextService:
    def get_user_roles(self, user_id: str) -> list[str]:
        try:
            return role_client.fetch_remote_roles(user_id)
        except NetworkTimeoutError:
            # VIOLATION (ERR06): Unsafe fallback returns admin role granting unauthorized access
            return ["ROLE_ADMIN"]


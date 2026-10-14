# TC-009: Transactional Rollback and State Consistency
def transfer_funds(source_acc: str, dest_acc: str, amount: float):
    with db_session.begin():
        db_session.debit(source_acc, amount)
        try:
            db_session.credit(dest_acc, amount)
        except Exception:
            # VIOLATION (ERR09): Catching and swallowing exception inside transaction leaves partial debit committed
            logger.error("Failed credit step")


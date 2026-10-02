from pathlib import Path

from sqlalchemy import text

from app.db.connections import connections


def apply_sql_dir(dir_path: str | Path) -> list[str]:
    """Execute every .sql file in dir_path sorted by filename. Idempotent — files use IF NOT EXISTS."""
    connections.require_initialized()
    applied: list[str] = []
    for sql_file in sorted(Path(dir_path).glob("*.sql")):
        sql = sql_file.read_text(encoding="utf-8")
        with connections.pg_engine.begin() as conn:
            for stmt in _split_statements(sql):
                if stmt.strip():
                    conn.exec_driver_sql(stmt)
        applied.append(sql_file.name)
    return applied


def _split_statements(sql: str) -> list[str]:
    # Naive splitter; OK because our DDL has no functions/triggers.
    return [s for s in sql.split(";\n") if s.strip()]

from pymongo import MongoClient
from pymongo.database import Database
from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import sessionmaker

from app.core.config import get_settings


class Connections:
    def __init__(self) -> None:
        self._initialized = False
        self.warehouse_client: MongoClient | None = None
        self.warehouse_db: Database | None = None
        self.pg_engine: Engine | None = None
        self.pg_session = None

    def initialize(self) -> None:
        if self._initialized:
            return
        settings = get_settings()
        self.warehouse_client = MongoClient(settings.reporting_warehouse_uri)
        self.warehouse_db = self.warehouse_client.get_default_database()
        self.pg_engine = create_engine(settings.pg_url, pool_pre_ping=True, future=True)
        self.pg_session = sessionmaker(bind=self.pg_engine, expire_on_commit=False, future=True)
        self._initialized = True

    def require_initialized(self) -> None:
        if not self._initialized:
            self.initialize()

    def close(self) -> None:
        if not self._initialized:
            return
        if self.warehouse_client:
            self.warehouse_client.close()
        if self.pg_engine:
            self.pg_engine.dispose()


connections = Connections()

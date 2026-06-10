import os
from datetime import timedelta

from dotenv import load_dotenv

load_dotenv()


def _database_uri() -> str:
    uri = os.getenv("DATABASE_URL", "sqlite:///compre_ganhe_dev.db")
    if uri.startswith("postgres://"):
        uri = uri.replace("postgres://", "postgresql://", 1)
    return uri


class Config:
    SQLALCHEMY_DATABASE_URI = _database_uri()
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-compre-ganhe-013-change-me-local-secret")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=30)
    JSON_SORT_KEYS = False

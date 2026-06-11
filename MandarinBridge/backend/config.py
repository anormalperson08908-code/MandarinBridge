from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent
DATABASE_DIR = BASE_DIR / "database"
DATABASE_DIR.mkdir(exist_ok=True)


class Config:
    SQLALCHEMY_DATABASE_URI = f"sqlite:///{DATABASE_DIR / 'mandarinbridge.db'}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = "week-5-development-key"
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"

"""
Database models and session management for EcoMind AI.
"""

from sqlalchemy import create_engine, Column, String, Float, DateTime, Integer, JSON
from sqlalchemy.orm import sessionmaker, declarative_base
from datetime import datetime, timezone
from app.config import settings

DATABASE_URL = settings.database_url

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class UserFootprint(Base):
    """Store user carbon footprint calculations."""

    __tablename__ = "user_footprints"

    id = Column(String, primary_key=True)
    user_id = Column(String, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    monthly_kg = Column(Float)
    annual_tonnes = Column(Float)
    sources = Column(JSON)
    assumptions = Column(JSON)
    confidence = Column(String)


class UserPledge(Base):
    """Store user pledges and actions."""

    __tablename__ = "user_pledges"

    id = Column(String, primary_key=True)
    user_id = Column(String, index=True)
    action = Column(String)
    estimated_co2_reduction = Column(Float)
    deadline = Column(String)
    status = Column(String)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class ChatHistory(Base):
    """Store chat messages for history."""

    __tablename__ = "chat_history"

    id = Column(String, primary_key=True)
    session_id = Column(String, index=True)
    user_id = Column(String, index=True)
    role = Column(String)
    content = Column(String)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class UserProfile(Base):
    """Store user preferences and profile."""

    __tablename__ = "user_profiles"

    user_id = Column(String, primary_key=True)
    user_type = Column(String, default="general")
    region = Column(String, default="india")
    badges = Column(JSON, default=list)
    current_streak = Column(Integer, default=0)
    total_co2_saved = Column(Float, default=0)
    pledges_completed = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


# Create tables on startup
Base.metadata.create_all(bind=engine)


def get_db():
    """Dependency to get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

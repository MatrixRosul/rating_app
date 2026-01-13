"""
Tournament model for billiard tournaments
"""
from sqlalchemy import Column, Integer, String, DateTime, Date, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
from app.constants import TOURNAMENT_STATUS, DISCIPLINES, BRACKET_TYPES


class Tournament(Base):
    """Tournament model"""
    __tablename__ = "tournaments"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String, nullable=False)  # Changed from Enum to String to avoid uppercase conversion
    
    # Location and details
    city = Column(String, nullable=False)
    country = Column(String, nullable=False, default="Україна")
    club = Column(String, nullable=False)
    discipline = Column(String, nullable=False)  # Changed from Enum to String
    
    # Rating configuration
    is_rated = Column(Integer, nullable=False, default=1)  # 1 = rated, 0 = not rated (using Integer for SQLite compatibility)
    
    # PHASE 5: Bracket type
    bracket_type = Column(String, nullable=False, default="single_elimination")  # single_elimination, double_elimination, group_stage
    
    # Dates
    registration_start = Column(DateTime, nullable=True)
    registration_end = Column(DateTime, nullable=False)  # Дата закінчення реєстрації (обов'язкова)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    started_at = Column(DateTime, nullable=True)  # Фактичний час старту турніру
    finished_at = Column(DateTime, nullable=True)  # Фактичний час завершення
    
    # Admin who created the tournament
    created_by_admin_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_by_admin = relationship("User", foreign_keys=[created_by_admin_id])
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    registrations = relationship("TournamentRegistration", back_populates="tournament", cascade="all, delete-orphan")
    matches = relationship("Match", back_populates="tournament", cascade="all, delete-orphan")
    rules = relationship("TournamentRule", back_populates="tournament", uselist=False, cascade="all, delete-orphan")
    tables = relationship("Table", back_populates="tournament", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Tournament(id={self.id}, name={self.name}, status={self.status})>"

"""
Tournament model for billiard tournaments
"""
from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base


class TournamentStatus(str, enum.Enum):
    """Tournament status enum"""
    PENDING = "pending"      # Реєстрація на турнір
    ONGOING = "ongoing"      # Турнір триває
    COMPLETED = "completed"  # Турнір закінчився


class TournamentDiscipline(str, enum.Enum):
    """Tournament discipline enum"""
    FREE_PYRAMID = "FREE_PYRAMID"
    FREE_PYRAMID_EXTENDED = "FREE_PYRAMID_EXTENDED"
    COMBINED_PYRAMID = "COMBINED_PYRAMID"
    DYNAMIC_PYRAMID = "DYNAMIC_PYRAMID"
    COMBINED_PYRAMID_CHANGES = "COMBINED_PYRAMID_CHANGES"


class Tournament(Base):
    """Tournament model"""
    __tablename__ = "tournaments"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(Enum(TournamentStatus), nullable=False, default=TournamentStatus.PENDING)
    
    # Location and details
    city = Column(String, nullable=False)
    country = Column(String, nullable=False, default="Україна")
    club = Column(String, nullable=False)
    discipline = Column(Enum(TournamentDiscipline), nullable=False)
    
    # Dates
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    
    # Admin who created the tournament
    created_by_admin_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_by_admin = relationship("User", foreign_keys=[created_by_admin_id])
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    registrations = relationship("TournamentRegistration", back_populates="tournament", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Tournament(id={self.id}, name={self.name}, status={self.status})>"

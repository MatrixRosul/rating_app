"""
Player database model
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class Player(Base):
    """
    Player model - represents a billiard player
    """
    __tablename__ = "players"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    city = Column(String, nullable=True)
    year_of_birth = Column(Integer, nullable=True)
    
    # Rating
    rating = Column(Float, default=1300.0, nullable=False)
    initial_rating = Column(Float, default=1300.0, nullable=False)
    peak_rating = Column(Float, default=1300.0, nullable=False)
    
    # Candidate Master status
    is_cms = Column(Boolean, default=False, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationship to User (optional)
    user = relationship("User", back_populates="player", uselist=False)

    def __repr__(self):
        return f"<Player(id={self.id}, name={self.name}, rating={self.rating})>"

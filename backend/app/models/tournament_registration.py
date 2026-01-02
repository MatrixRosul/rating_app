"""
Tournament registration model - many-to-many relationship between players and tournaments
"""
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class TournamentRegistration(Base):
    """Tournament registration - tracks which players are registered for which tournaments"""
    __tablename__ = "tournament_registrations"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Foreign keys
    tournament_id = Column(Integer, ForeignKey("tournaments.id"), nullable=False)
    player_id = Column(String, ForeignKey("players.id"), nullable=False)  # Real player from DB
    
    # If admin registered the player manually (nullable - means self-registered by user)
    registered_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Timestamp
    registered_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    tournament = relationship("Tournament", back_populates="registrations")
    player = relationship("Player", foreign_keys=[player_id])
    registered_by = relationship("User", foreign_keys=[registered_by_user_id])
    
    def __repr__(self):
        return f"<TournamentRegistration(tournament_id={self.tournament_id}, player_id={self.player_id})>"

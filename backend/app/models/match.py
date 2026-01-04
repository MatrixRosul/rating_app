"""
Match database model
"""
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey
from datetime import datetime
from app.database import Base


class Match(Base):
    """
    Match model - represents a billiard match between two players
    """
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    
    # Players
    player1_id = Column(Integer, ForeignKey("players.id"), nullable=False, index=True)
    player2_id = Column(Integer, ForeignKey("players.id"), nullable=False, index=True)
    
    # Player names (for display)
    player1_name = Column(String, nullable=True)
    player2_name = Column(String, nullable=True)
    
    # Match result
    winner_id = Column(Integer, ForeignKey("players.id"), nullable=False)
    player1_score = Column(Integer, nullable=False)
    player2_score = Column(Integer, nullable=False)
    max_score = Column(Integer, nullable=False)  # Game format (e.g., до 5, до 7)
    
    # Ratings before match
    player1_rating_before = Column(Float, nullable=False)
    player2_rating_before = Column(Float, nullable=False)
    
    # Ratings after match
    player1_rating_after = Column(Float, nullable=False)
    player2_rating_after = Column(Float, nullable=False)
    
    # Rating changes
    player1_rating_change = Column(Float, nullable=False)
    player2_rating_change = Column(Float, nullable=False)
    
    # Match metadata
    date = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    tournament = Column(String, nullable=True)  # Tournament name
    stage = Column(String, nullable=True)  # Stage: group, round16, quarterfinal, semifinal, final

    def __repr__(self):
        return f"<Match(id={self.id}, {self.player1_name} vs {self.player2_name}, winner={self.winner_id})>"

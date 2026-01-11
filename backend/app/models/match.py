"""
Match database model
"""
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base


class MatchStatus(str, enum.Enum):
    """Match status enum"""
    PENDING = "pending"          # Очікує початку
    IN_PROGRESS = "in_progress"  # Матч триває
    FINISHED = "finished"        # Матч завершено
    WO = "wo"                    # Walk Over (технічна перемога)


class Match(Base):
    """
    Match model - represents a billiard match between two players
    """
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    
    # Tournament reference (nullable for regular matches outside tournaments)
    tournament_id = Column(Integer, ForeignKey("tournaments.id"), nullable=True, index=True)
    
    # Match position in bracket (for tournament matches)
    match_number = Column(Integer, nullable=True)  # Послідовний номер матчу (1, 2, 3...)
    round = Column(String, nullable=True)  # R64, R32, R16, QF, SF, F
    
    # Players (nullable for WO or bye matches)
    player1_id = Column(Integer, ForeignKey("players.id"), nullable=True, index=True)
    player2_id = Column(Integer, ForeignKey("players.id"), nullable=True, index=True)
    
    # Player names (for display)
    player1_name = Column(String, nullable=True)
    player2_name = Column(String, nullable=True)
    
    # Match result
    winner_id = Column(Integer, ForeignKey("players.id"), nullable=True)
    player1_score = Column(Integer, nullable=True, default=0)
    player2_score = Column(Integer, nullable=True, default=0)
    max_score = Column(Integer, nullable=True)  # Game format (e.g., до 5, до 7)
    
    # Status (for tournament matches) - using String for flexibility
    status = Column(String, nullable=True, default="pending")
    
    # Next match connections (winner goes to next_match)
    next_match_id = Column(Integer, ForeignKey("matches.id"), nullable=True)
    position_in_next = Column(Integer, nullable=True)  # 1 or 2 (position in next match)
    
    # Ratings before match (nullable for tournament matches not yet played)
    player1_rating_before = Column(Float, nullable=True)
    player2_rating_before = Column(Float, nullable=True)
    
    # Ratings after match (nullable for tournament matches not yet played)
    player1_rating_after = Column(Float, nullable=True)
    player2_rating_after = Column(Float, nullable=True)
    
    # Rating changes (nullable for tournament matches not yet played)
    player1_rating_change = Column(Float, nullable=True)
    player2_rating_change = Column(Float, nullable=True)
    
    # Match metadata
    date = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    started_at = Column(DateTime, nullable=True)
    finished_at = Column(DateTime, nullable=True)
    tournament_name = Column(String, nullable=True)  # Tournament name (deprecated, use tournament_id)
    stage = Column(String, nullable=True)  # Stage: group, round16, quarterfinal, semifinal, final (deprecated, use round)
    discipline = Column(String, nullable=True, index=True)  # Discipline for tournament matches
    
    # Table and video
    table_id = Column(Integer, ForeignKey("tables.id"), nullable=True)
    video_url = Column(String, nullable=True)  # YouTube URL або інше відео
    
    # Relationships
    tournament = relationship("Tournament", back_populates="matches")
    next_match = relationship("Match", remote_side=[id], foreign_keys=[next_match_id])
    table = relationship("Table", back_populates="matches", foreign_keys=[table_id])

    def __repr__(self):
        return f"<Match(id={self.id}, {self.player1_name} vs {self.player2_name}, winner={self.winner_id})>"

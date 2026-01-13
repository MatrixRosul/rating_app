"""
Tournament rules model - defines bracket type and race_to for each stage
"""
from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database import Base


class TournamentRule(Base):
    """Tournament rules - bracket configuration and race_to settings"""
    __tablename__ = "tournament_rules"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Tournament reference (one-to-one)
    tournament_id = Column(Integer, ForeignKey("tournaments.id"), nullable=False, unique=True)
    
    # Bracket configuration
    bracket_type = Column(String, nullable=False, default="single_elimination")
    
    # Race to (до скількох партій) для кожної стадії
    race_to_r64 = Column(Integer, nullable=True)   # 1/64 фіналу
    race_to_r32 = Column(Integer, nullable=True)   # 1/32 фіналу
    race_to_r16 = Column(Integer, nullable=True)   # 1/16 фіналу
    race_to_qf = Column(Integer, nullable=True)    # Quarter Finals (Чвертьфінали)
    race_to_sf = Column(Integer, nullable=True)    # Semi Finals (Півфінали)
    race_to_f = Column(Integer, nullable=False)    # Final (Фінал) - обов'язково
    
    # Lock status - після старту турніру регламент блокується
    is_locked = Column(Boolean, nullable=False, default=False)
    
    # Relationships
    tournament = relationship("Tournament", back_populates="rules")
    
    def __repr__(self):
        return f"<TournamentRule(tournament_id={self.tournament_id}, bracket={self.bracket_type})>"
    
    def get_race_to_for_round(self, round_name: str) -> int:
        """Get race_to value for specific round"""
        mapping = {
            "R64": self.race_to_r64,
            "R32": self.race_to_r32,
            "R16": self.race_to_r16,
            "QF": self.race_to_qf,
            "SF": self.race_to_sf,
            "F": self.race_to_f,
        }
        return mapping.get(round_name, self.race_to_f)  # Default to final race_to

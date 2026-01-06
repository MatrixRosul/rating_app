"""
Tournament registration model - many-to-many relationship between players and tournaments
"""
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base


class ParticipantStatus(str, enum.Enum):
    """Participant status in tournament"""
    PENDING = "pending"          # Очікує підтвердження
    CONFIRMED = "confirmed"      # Підтверджений
    REJECTED = "rejected"        # Відхилений
    ACTIVE = "active"            # Активний (турнір почався)
    ELIMINATED = "eliminated"    # Вибув з турніру


class TournamentRegistration(Base):
    """Tournament registration - tracks which players are registered for which tournaments"""
    __tablename__ = "tournament_registrations"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Foreign keys
    tournament_id = Column(Integer, ForeignKey("tournaments.id"), nullable=False)
    player_id = Column(Integer, ForeignKey("players.id"), nullable=False)  # Real player from DB
    
    # Status
    status = Column(Enum(ParticipantStatus), nullable=False, default=ParticipantStatus.PENDING)
    
    # Seeding
    seed = Column(Integer, nullable=True)  # Сіяний номер (визначається після підтвердження)
    
    # If admin registered the player manually (nullable - means self-registered by user)
    registered_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Timestamps
    registered_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    confirmed_at = Column(DateTime, nullable=True)  # Час підтвердження адміном
    
    # Relationships
    tournament = relationship("Tournament", back_populates="registrations")
    player = relationship("Player", foreign_keys=[player_id])
    registered_by = relationship("User", foreign_keys=[registered_by_user_id])
    
    def __repr__(self):
        return f"<TournamentRegistration(tournament_id={self.tournament_id}, player_id={self.player_id})>"

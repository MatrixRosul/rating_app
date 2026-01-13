from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
from app.constants import ROLES


class User(Base):
    """User model for authentication and authorization"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False, default=ROLES.PLAYER)  # Using constant instead of hardcoded string
    
    # Optional: link user to player (for players who are also users)
    player_id = Column(Integer, ForeignKey("players.id"), nullable=True)
    player = relationship("Player", back_populates="user")
    
    def __repr__(self):
        return f"<User {self.username} ({self.role})>"

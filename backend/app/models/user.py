from sqlalchemy import Column, Integer, String, ForeignKey, Enum
from sqlalchemy.orm import relationship
import enum
from app.database import Base


class UserRole(str, enum.Enum):
    """User roles with different access levels"""
    GUEST = "guest"  # Read-only, no login needed
    USER = "user"    # Can edit own data
    ADMIN = "admin"  # Full access


class User(Base):
    """User model for authentication and authorization"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.USER)
    
    # Optional: link user to player (for players who are also users)
    player_id = Column(String, ForeignKey("players.id"), nullable=True)
    player = relationship("Player", back_populates="user")
    
    def __repr__(self):
        return f"<User {self.username} ({self.role})>"

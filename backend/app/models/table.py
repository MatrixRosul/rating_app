"""
Table model - фізичні столи для турніру
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Table(Base):
    """
    Модель столу для проведення матчів
    
    Поля:
    - id: унікальний ідентифікатор
    - tournament_id: ID турніру
    - name: назва столу (наприклад: "Table 1", "VIP")
    - is_active: чи активний стіл
    - is_occupied: чи зайнятий зараз
    - created_at: дата створення
    - updated_at: дата оновлення
    """
    __tablename__ = "tables"

    id = Column(Integer, primary_key=True, index=True)
    tournament_id = Column(Integer, ForeignKey("tournaments.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_occupied = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    tournament = relationship("Tournament", back_populates="tables")
    matches = relationship("Match", back_populates="table", foreign_keys="Match.table_id")

    def __repr__(self):
        return f"<Table {self.name} (Tournament {self.tournament_id})>"

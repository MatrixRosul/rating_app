"""
Tables Router - API для управління столами

Endpoints:
- POST /tables - Створити стіл
- GET /tables?tournament_id= - Отримати столи
- PUT /tables/{id} - Оновити стіл
- DELETE /tables/{id} - Видалити стіл
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List
from pydantic import BaseModel, Field

from app.database import get_db
from app.dependencies import require_admin
from app.models.table import Table
from app.models.tournament import Tournament


router = APIRouter(prefix="/tables", tags=["tables"])


# === Schemas ===

class TableCreate(BaseModel):
    """Створення столу"""
    tournament_id: int = Field(..., description="ID турніру")
    name: str = Field(..., description="Назва столу (наприклад 'Стіл 1')")
    is_active: bool = Field(True, description="Чи активний стіл")


class TableUpdate(BaseModel):
    """Оновлення столу"""
    name: Optional[str] = Field(None, description="Нова назва")
    is_active: Optional[bool] = Field(None, description="Активний/неактивний")
    is_occupied: Optional[bool] = Field(None, description="Зайнятий/вільний")


class TableResponse(BaseModel):
    """Відповідь з даними столу"""
    id: int
    tournament_id: int
    name: str
    is_active: bool
    is_occupied: bool
    created_at: str
    updated_at: Optional[str]
    
    class Config:
        from_attributes = True


# === Endpoints ===

@router.post("/", response_model=TableResponse)
def create_table(
    request: TableCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    """
    Створити стіл для турніру (тільки для адміністраторів)
    
    Перевірки:
    - Турнір існує
    
    Дії:
    - Створює новий стіл
    - Встановлює is_occupied = False
    """
    # Перевірка турніру
    tournament = db.query(Tournament).filter(Tournament.id == request.tournament_id).first()
    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Турнір не знайдено"
        )
    
    # Створення столу
    table = Table(
        tournament_id=request.tournament_id,
        name=request.name,
        is_active=request.is_active,
        is_occupied=False
    )
    
    db.add(table)
    db.commit()
    db.refresh(table)
    
    return TableResponse(
        id=table.id,
        tournament_id=table.tournament_id,
        name=table.name,
        is_active=table.is_active,
        is_occupied=table.is_occupied,
        created_at=table.created_at.isoformat(),
        updated_at=table.updated_at.isoformat() if table.updated_at else None
    )


@router.get("/", response_model=List[TableResponse])
def get_tables(
    tournament_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Отримати список столів
    
    Фільтри:
    - tournament_id - столи конкретного турніру
    
    Доступ: Публічний (щоб глядачі могли бачити на яких столах йдуть матчі)
    """
    query = db.query(Table)
    
    if tournament_id:
        query = query.filter(Table.tournament_id == tournament_id)
    
    tables = query.order_by(Table.name).all()
    
    return [
        TableResponse(
            id=table.id,
            tournament_id=table.tournament_id,
            name=table.name,
            is_active=table.is_active,
            is_occupied=table.is_occupied,
            created_at=table.created_at.isoformat(),
            updated_at=table.updated_at.isoformat() if table.updated_at else None
        )
        for table in tables
    ]


@router.get("/{table_id}", response_model=TableResponse)
def get_table(
    table_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    """
    Отримати інформацію про стіл (тільки для адміністраторів)
    """
    table = db.query(Table).filter(Table.id == table_id).first()
    
    if not table:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Стіл не знайдено"
        )
    
    return TableResponse(
        id=table.id,
        tournament_id=table.tournament_id,
        name=table.name,
        is_active=table.is_active,
        is_occupied=table.is_occupied,
        created_at=table.created_at.isoformat(),
        updated_at=table.updated_at.isoformat() if table.updated_at else None
    )


@router.put("/{table_id}", response_model=TableResponse)
def update_table(
    table_id: int,
    request: TableUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    """
    Оновити стіл (тільки для адміністраторів)
    
    Можна оновити:
    - Назву
    - Статус активності
    - Статус зайнятості
    """
    table = db.query(Table).filter(Table.id == table_id).first()
    
    if not table:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Стіл не знайдено"
        )
    
    # Оновлення полів
    if request.name is not None:
        table.name = request.name
    if request.is_active is not None:
        table.is_active = request.is_active
    if request.is_occupied is not None:
        table.is_occupied = request.is_occupied
    
    db.commit()
    db.refresh(table)
    
    return TableResponse(
        id=table.id,
        tournament_id=table.tournament_id,
        name=table.name,
        is_active=table.is_active,
        is_occupied=table.is_occupied,
        created_at=table.created_at.isoformat(),
        updated_at=table.updated_at.isoformat() if table.updated_at else None
    )


@router.delete("/{table_id}")
def delete_table(
    table_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    """
    Видалити стіл (тільки для адміністраторів)
    
    Перевірки:
    - Стіл не зайнятий (is_occupied = False)
    """
    table = db.query(Table).filter(Table.id == table_id).first()
    
    if not table:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Стіл не знайдено"
        )
    
    if table.is_occupied:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Не можна видалити зайнятий стіл"
        )
    
    db.delete(table)
    db.commit()
    
    return {"message": "Стіл успішно видалено"}

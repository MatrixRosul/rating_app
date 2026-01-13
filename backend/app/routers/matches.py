"""
Matches router - API endpoints for match management
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models import Match, Player

router = APIRouter()


@router.get("/")
async def get_matches(
    player_id: Optional[str] = None,
    skip: int = 0,
    limit: int = 100000,
    db: Session = Depends(get_db)
):
    """
    Get matches, optionally filtered by player_id
    """
    query = db.query(Match)
    
    if player_id:
        # For player profile: sort by date ASC for correct rating graph
        # Показуємо регулярні матчі + турнірні матчі тільки з завершених турнірів
        # Виключаємо WO (walkover) матчі
        from app.models.tournament import Tournament
        from app.constants import TOURNAMENT_STATUS
        from sqlalchemy import or_, and_, not_
        
        query = query.outerjoin(Tournament, Match.tournament_id == Tournament.id).filter(
            (Match.player1_id == player_id) | (Match.player2_id == player_id),
            # Регулярні матчі (без турніру) АБО турнірні з завершених турнірів
            or_(
                Match.tournament_id == None,
                Tournament.status == TOURNAMENT_STATUS.FINISHED
            ),
            # Виключаємо WO матчі (рахунок 0:0 при наявності переможця)
            not_(
                and_(
                    Match.player1_score == 0,
                    Match.player2_score == 0,
                    Match.winner_id.isnot(None)
                )
            )
        ).order_by(Match.date.asc(), Match.match_number.asc(), Match.created_at.asc())
    else:
        # For general list: sort by date DESC to show recent matches first
        query = query.order_by(Match.date.desc(), Match.created_at.asc())
    
    matches = query.offset(skip).limit(limit).all()
    
    # Convert to dicts
    result = []
    for match in matches:
        result.append({
            "id": match.id,
            "player1_id": match.player1_id,
            "player2_id": match.player2_id,
            "player1_name": match.player1_name,
            "player2_name": match.player2_name,
            "winner_id": match.winner_id,
            "player1_score": match.player1_score,
            "player2_score": match.player2_score,
            "max_score": match.max_score,
            "player1_rating_before": float(match.player1_rating_before) if match.player1_rating_before is not None else None,
            "player2_rating_before": float(match.player2_rating_before) if match.player2_rating_before is not None else None,
            "player1_rating_after": float(match.player1_rating_after) if match.player1_rating_after is not None else None,
            "player2_rating_after": float(match.player2_rating_after) if match.player2_rating_after is not None else None,
            "player1_rating_change": float(match.player1_rating_change) if match.player1_rating_change is not None else None,
            "player2_rating_change": float(match.player2_rating_change) if match.player2_rating_change is not None else None,
            "date": match.date.isoformat(),
            "created_at": match.created_at.isoformat(),
            "tournament": match.tournament.name if match.tournament else match.tournament_name,
            "stage": match.stage
        })
    
    return result


@router.get("/{match_id}")
async def get_match(match_id: str, db: Session = Depends(get_db)):
    """
    Get specific match by ID
    """
    match = db.query(Match).filter(Match.id == match_id).first()
    
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    return {
        "id": match.id,
        "player1_id": match.player1_id,
        "player2_id": match.player2_id,
        "winner_id": match.winner_id,
        "player1_rating_before": float(match.player1_rating_before),
        "player2_rating_before": float(match.player2_rating_before),
        "player1_rating_after": float(match.player1_rating_after),
        "player2_rating_after": float(match.player2_rating_after),
        "rating_change": float(match.rating_change),
        "date": match.date.isoformat(),
        "stage": match.stage
    }


# === PHASE 3: Match Management Endpoints ===

from pydantic import BaseModel, Field
from typing import Optional
from app.dependencies import require_admin
from app.services.match_service import MatchService
from app.schemas.match import MatchResponse


class StartMatchRequest(BaseModel):
    """Запит на старт матчу"""
    table_id: int = Field(..., description="ID столу для гри")
    video_url: Optional[str] = Field(None, description="Посилання на YouTube трансляцію")


class FinishMatchRequest(BaseModel):
    """Запит на завершення матчу"""
    score_player1: int = Field(..., ge=0, description="Рахунок гравця 1")
    score_player2: int = Field(..., ge=0, description="Рахунок гравця 2")


class EditMatchRequest(BaseModel):
    """Запит на редагування результату"""
    new_score_p1: int = Field(..., ge=0, description="Новий рахунок гравця 1")
    new_score_p2: int = Field(..., ge=0, description="Новий рахунок гравця 2")


class UpdateLiveScoreRequest(BaseModel):
    """Запит на оновлення поточного рахунку"""
    score_player1: int = Field(..., ge=0, description="Поточний рахунок гравця 1")
    score_player2: int = Field(..., ge=0, description="Поточний рахунок гравця 2")


@router.post("/{match_id}/start", response_model=MatchResponse)
def start_match(
    match_id: int,
    request: StartMatchRequest,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    """
    Запуск матчу (тільки для адміністраторів)
    
    Перевірки:
    - Турнір має статус IN_PROGRESS
    - Матч має статус PENDING
    - Стіл вільний і активний
    
    Дії:
    - Встановлює match.status = IN_PROGRESS
    - Призначає стіл (table.is_occupied = true)
    - Встановлює started_at
    - Зберігає video_url (якщо є)
    """
    match = MatchService.start_match(
        db=db,
        match_id=match_id,
        table_id=request.table_id,
        video_url=request.video_url
    )
    
    return MatchResponse.model_validate(match)


@router.post("/{match_id}/result", response_model=MatchResponse)
def finish_match(
    match_id: int,
    request: FinishMatchRequest,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    """
    Завершення матчу з результатом (тільки для адміністраторів)
    
    Перевірки:
    - Матч має статус IN_PROGRESS
    - Результат валідний (один переможець, рахунок >= 0)
    
    Дії:
    - Визначає переможця
    - Встановлює match.status = FINISHED
    - Звільняє стіл (table.is_occupied = false)
    - Оновлює наступний матч (next_match)
    - Встановлює finished_at
    """
    match = MatchService.finish_match(
        db=db,
        match_id=match_id,
        score_player1=request.score_player1,
        score_player2=request.score_player2
    )
    
    return MatchResponse.model_validate(match)


@router.put("/{match_id}/live-score", response_model=MatchResponse)
def update_live_score(
    match_id: int,
    request: UpdateLiveScoreRequest,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    """
    Оновлення поточного рахунку під час матчу (тільки для адміністраторів)
    
    Перевірки:
    - Матч має статус IN_PROGRESS
    
    Дії:
    - Оновлює поточний рахунок без зміни статусу
    - НЕ визначає переможця
    - НЕ звільняє стіл
    
    Використовується для трансляції поточного рахунку в реальному часі
    """
    from app.models.match import Match
    from app.constants import MATCH_STATUS
    
    # Знайти матч
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Матч не знайдено")
    
    # Перевірка статусу
    if match.status != MATCH_STATUS.IN_PROGRESS:
        raise HTTPException(
            status_code=400, 
            detail="Можна оновити рахунок тільки для матчів в процесі"
        )
    
    # Оновити рахунок
    match.player1_score = request.score_player1
    match.player2_score = request.score_player2
    
    db.commit()
    db.refresh(match)
    
    return MatchResponse.model_validate(match)


@router.put("/{match_id}/edit", response_model=MatchResponse)
def edit_match_result(
    match_id: int,
    request: EditMatchRequest,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    """
    Редагування результату матчу (тільки для адміністраторів)
    
    ⚠️ КРИТИЧНА ОПЕРАЦІЯ ⚠️
    
    Перевірки:
    - Матч має статус FINISHED
    - Новий результат валідний
    
    Дії:
    - Оновлює результат і переможця
    - ROLLBACK усіх залежних матчів (якщо переможець змінився)
    - Скидає залежні матчі у PENDING
    - Оновлює наступний матч з новим переможцем
    
    Використовуйте з обережністю!
    """
    match = MatchService.edit_match_result(
        db=db,
        match_id=match_id,
        new_score_p1=request.new_score_p1,
        new_score_p2=request.new_score_p2
    )
    
    return MatchResponse.model_validate(match)

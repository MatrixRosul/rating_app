"""
Players router - API endpoints for player management
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.database import get_db
from app.models import Player, Match
from app.models.user import User
from app.dependencies import require_admin

router = APIRouter()


# Pydantic schemas
class PlayerCreate(BaseModel):
    name: str
    rating: Optional[float] = 1200.0
    city: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    year_of_birth: Optional[int] = None


class PlayerResponse(BaseModel):
    id: int
    name: str
    rating: float
    initial_rating: float
    peak_rating: float
    city: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    year_of_birth: Optional[int] = None
    is_cms: bool
    created_at: str
    updated_at: str
    matches_played: int


@router.get("/", include_in_schema=True)
@router.get("", include_in_schema=False)  # Support both with and without trailing slash
async def get_players(
    skip: int = 0,
    limit: int = 1000,
    db: Session = Depends(get_db)
):
    """
    Get all players sorted by rating (descending)
    """
    players = db.query(Player).order_by(Player.rating.desc()).offset(skip).limit(limit).all()
    
    # Add matches count to each player
    result = []
    for player in players:
        # Рахуємо лише регулярні матчі (без турнірних)
        matches_played = db.query(Match).filter(
            (Match.player1_id == player.id) | (Match.player2_id == player.id),
            Match.tournament_id == None  # Виключаємо турнірні матчі
        ).count()
        
        player_dict = {
            "id": player.id,
            "name": player.name,
            "rating": float(player.rating),
            "initial_rating": float(player.initial_rating),
            "peak_rating": float(player.peak_rating),
            "city": player.city,
            "first_name": player.first_name,
            "last_name": player.last_name,
            "year_of_birth": player.year_of_birth,
            "is_cms": player.is_cms,
            "created_at": player.created_at.isoformat(),
            "updated_at": player.updated_at.isoformat(),
            "matches_played": matches_played
        }
        result.append(player_dict)
    
    return result


@router.post("/", response_model=PlayerResponse, status_code=status.HTTP_201_CREATED)
async def create_player(
    player_data: PlayerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Create a new player (admin only)
    """
    # Check if player with this name already exists
    existing_player = db.query(Player).filter(Player.name == player_data.name).first()
    if existing_player:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Гравець з ім'ям '{player_data.name}' вже існує"
        )
    
    # Validate rating
    if player_data.rating < 0 or player_data.rating > 3000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Рейтинг має бути від 0 до 3000"
        )
    
    # Create new player
    new_player = Player(
        name=player_data.name,
        rating=player_data.rating,
        initial_rating=player_data.rating,
        peak_rating=player_data.rating,
        city=player_data.city,
        first_name=player_data.first_name,
        last_name=player_data.last_name,
        year_of_birth=player_data.year_of_birth,
        is_cms=False,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    db.add(new_player)
    db.commit()
    db.refresh(new_player)
    
    return PlayerResponse(
        id=new_player.id,
        name=new_player.name,
        rating=float(new_player.rating),
        initial_rating=float(new_player.initial_rating),
        peak_rating=float(new_player.peak_rating),
        city=new_player.city,
        first_name=new_player.first_name,
        last_name=new_player.last_name,
        year_of_birth=new_player.year_of_birth,
        is_cms=new_player.is_cms,
        created_at=new_player.created_at.isoformat(),
        updated_at=new_player.updated_at.isoformat(),
        matches_played=0
    )


@router.get("/{player_id}")
async def get_player(player_id: str, db: Session = Depends(get_db)):
    """
    Get specific player by ID
    """
    player = db.query(Player).filter(Player.id == player_id).first()
    
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    # Add matches count
    matches_played = db.query(Match).filter(
        (Match.player1_id == player.id) | (Match.player2_id == player.id)
    ).count()
    
    return {
        "id": player.id,
        "name": player.name,
        "rating": float(player.rating),
        "initial_rating": float(player.initial_rating),
        "peak_rating": float(player.peak_rating),
        "city": player.city,
        "first_name": player.first_name,
        "last_name": player.last_name,
        "year_of_birth": player.year_of_birth,
        "is_cms": player.is_cms,
        "created_at": player.created_at.isoformat(),
        "updated_at": player.updated_at.isoformat(),
        "matches_played": matches_played
    }

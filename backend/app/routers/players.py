"""
Players router - API endpoints for player management
"""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Player, Match

router = APIRouter()


@router.get("/")
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
        player_dict = {
            "id": player.id,
            "name": player.name,
            "rating": float(player.rating),
            "initial_rating": float(player.initial_rating),
            "peak_rating": float(player.peak_rating),
            "is_cms": player.is_cms,
            "created_at": player.created_at.isoformat(),
            "updated_at": player.updated_at.isoformat(),
            "matches_count": db.query(Match).filter(
                (Match.player1_id == player.id) | (Match.player2_id == player.id)
            ).count()
        }
        result.append(player_dict)
    
    return result


@router.get("/{player_id}")
async def get_player(player_id: str, db: Session = Depends(get_db)):
    """
    Get specific player by ID
    """
    player = db.query(Player).filter(Player.id == player_id).first()
    
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    # Add matches count
    matches_count = db.query(Match).filter(
        (Match.player1_id == player.id) | (Match.player2_id == player.id)
    ).count()
    
    return {
        "id": player.id,
        "name": player.name,
        "rating": float(player.rating),
        "initial_rating": float(player.initial_rating),
        "peak_rating": float(player.peak_rating),
        "is_cms": player.is_cms,
        "created_at": player.created_at.isoformat(),
        "updated_at": player.updated_at.isoformat(),
        "matches_count": matches_count
    }

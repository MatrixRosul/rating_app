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
        query = query.filter(
            (Match.player1_id == player_id) | (Match.player2_id == player_id)
        ).order_by(Match.date.asc(), Match.created_at.asc())
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
            "player1_rating_before": float(match.player1_rating_before),
            "player2_rating_before": float(match.player2_rating_before),
            "player1_rating_after": float(match.player1_rating_after),
            "player2_rating_after": float(match.player2_rating_after),
            "player1_rating_change": float(match.player1_rating_change),
            "player2_rating_change": float(match.player2_rating_change),
            "date": match.date.isoformat(),
            "created_at": match.created_at.isoformat(),
            "tournament": match.tournament,
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

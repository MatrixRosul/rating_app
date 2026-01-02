"""
Tournaments router - CRUD operations for tournaments
Реєстрація гравців (не users) на турніри
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, date
from app.database import get_db
from app.models.tournament import Tournament, TournamentStatus, TournamentDiscipline
from app.models.tournament_registration import TournamentRegistration
from app.models.user import User, UserRole
from app.models.player import Player
from app.dependencies import require_admin, require_user, get_current_user_optional
from pydantic import BaseModel

router = APIRouter(prefix="/api/tournaments", tags=["tournaments"])


# Pydantic schemas
class TournamentCreate(BaseModel):
    name: str
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    city: str
    country: str = "Україна"
    club: str
    discipline: TournamentDiscipline


class TournamentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TournamentStatus] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    city: Optional[str] = None
    country: Optional[str] = None
    club: Optional[str] = None
    discipline: Optional[TournamentDiscipline] = None


class RegisterPlayer(BaseModel):
    player_id: str  # ID гравця з таблиці players


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_tournament(
    tournament_data: TournamentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Create a new tournament (admin only)
    """
    tournament = Tournament(
        name=tournament_data.name,
        description=tournament_data.description,
        start_date=tournament_data.start_date,
        end_date=tournament_data.end_date,
        city=tournament_data.city,
        country=tournament_data.country,
        club=tournament_data.club,
        discipline=tournament_data.discipline,
        created_by_admin_id=current_user.id,
        status=TournamentStatus.PENDING
    )
    
    db.add(tournament)
    db.commit()
    db.refresh(tournament)
    
    return {
        "id": tournament.id,
        "name": tournament.name,
        "description": tournament.description,
        "status": tournament.status.value,
        "start_date": tournament.start_date.isoformat() if tournament.start_date else None,
        "end_date": tournament.end_date.isoformat() if tournament.end_date else None,
        "city": tournament.city,
        "country": tournament.country,
        "club": tournament.club,
        "discipline": tournament.discipline.value,
        "created_by_admin_id": tournament.created_by_admin_id,
        "created_at": tournament.created_at.isoformat(),
        "registered_count": 0
    }


@router.get("/")
def get_tournaments(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Get all tournaments (with optional status filter)
    """
    query = db.query(Tournament)
    
    if status_filter:
        query = query.filter(Tournament.status == status_filter)
    
    tournaments = query.order_by(Tournament.created_at.desc()).all()
    
    result = []
    for tournament in tournaments:
        registered_count = db.query(TournamentRegistration).filter(
            TournamentRegistration.tournament_id == tournament.id
        ).count()
        
        # Перевіряємо чи зареєстрований гравець поточного користувача
        is_registered = False
        if current_user and current_user.player_id:
            is_registered = db.query(TournamentRegistration).filter(
                TournamentRegistration.tournament_id == tournament.id,
                TournamentRegistration.player_id == current_user.player_id
            ).first() is not None
        
        result.append({
            "id": tournament.id,
            "name": tournament.name,
            "description": tournament.description,
            "status": tournament.status.value,
            "start_date": tournament.start_date.isoformat() if tournament.start_date else None,
            "end_date": tournament.end_date.isoformat() if tournament.end_date else None,
            "city": tournament.city,
            "country": tournament.country,
            "club": tournament.club,
            "discipline": tournament.discipline.value if tournament.discipline else None,
            "created_by_admin_id": tournament.created_by_admin_id,
            "created_at": tournament.created_at.isoformat(),
            "registered_count": registered_count,
            "is_registered": is_registered
        })
    
    return result


@router.get("/{tournament_id}")
def get_tournament(
    tournament_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Get tournament details with list of registered players
    """
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    
    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournament not found"
        )
    
    # Get registered players
    registrations = db.query(TournamentRegistration).filter(
        TournamentRegistration.tournament_id == tournament_id
    ).all()
    
    registered_players = []
    for reg in registrations:
        player = db.query(Player).filter(Player.id == reg.player_id).first()
        if player:
            # Знайти user якщо є
            user = db.query(User).filter(User.player_id == player.id).first()
            registered_players.append({
                "player_id": player.id,
                "player_name": player.name,
                "rating": player.rating,
                "username": user.username if user else None,
                "registered_at": reg.registered_at.isoformat(),
                "registered_by_admin": reg.registered_by_user_id is not None
            })
    
    # Check if current user's player is registered
    is_registered = False
    if current_user and current_user.player_id:
        is_registered = db.query(TournamentRegistration).filter(
            TournamentRegistration.tournament_id == tournament_id,
            TournamentRegistration.player_id == current_user.player_id
        ).first() is not None
    
    return {
        "id": tournament.id,
        "name": tournament.name,
        "description": tournament.description,
        "status": tournament.status.value,
        "start_date": tournament.start_date.isoformat() if tournament.start_date else None,
        "end_date": tournament.end_date.isoformat() if tournament.end_date else None,
        "city": tournament.city,
        "country": tournament.country,
        "club": tournament.club,
        "discipline": tournament.discipline.value if tournament.discipline else None,
        "created_by_admin_id": tournament.created_by_admin_id,
        "created_at": tournament.created_at.isoformat(),
        "registered_count": len(registered_players),
        "is_registered": is_registered,
        "registered_players": registered_players
    }


@router.put("/{tournament_id}")
def update_tournament(
    tournament_id: int,
    tournament_data: TournamentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Update tournament (admin only)
    """
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    
    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournament not found"
        )
    
    if tournament_data.name is not None:
        tournament.name = tournament_data.name
    if tournament_data.description is not None:
        tournament.description = tournament_data.description
    if tournament_data.status is not None:
        tournament.status = tournament_data.status
    if tournament_data.start_date is not None:
        tournament.start_date = tournament_data.start_date
    if tournament_data.end_date is not None:
        tournament.end_date = tournament_data.end_date
    if tournament_data.city is not None:
        tournament.city = tournament_data.city
    if tournament_data.country is not None:
        tournament.country = tournament_data.country
    if tournament_data.club is not None:
        tournament.club = tournament_data.club
    if tournament_data.discipline is not None:
        tournament.discipline = tournament_data.discipline
    
    db.commit()
    db.refresh(tournament)
    
    registered_count = db.query(TournamentRegistration).filter(
        TournamentRegistration.tournament_id == tournament.id
    ).count()
    
    return {
        "id": tournament.id,
        "name": tournament.name,
        "description": tournament.description,
        "status": tournament.status.value,
        "start_date": tournament.start_date.isoformat() if tournament.start_date else None,
        "end_date": tournament.end_date.isoformat() if tournament.end_date else None,
        "city": tournament.city,
        "country": tournament.country,
        "club": tournament.club,
        "discipline": tournament.discipline.value if tournament.discipline else None,
        "created_by_admin_id": tournament.created_by_admin_id,
        "created_at": tournament.created_at.isoformat(),
        "registered_count": registered_count
    }


@router.post("/{tournament_id}/register")
def register_for_tournament(
    tournament_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user)
):
    """
    User registers their player for tournament (self-registration)
    User MUST have player_id linked
    """
    # Check if user has linked player
    if not current_user.player_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Your account is not linked to a player. Contact admin to link your account."
        )
    
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    
    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournament not found"
        )
    
    if tournament.status != TournamentStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tournament is not accepting registrations"
        )
    
    # Check if player already registered
    existing = db.query(TournamentRegistration).filter(
        TournamentRegistration.tournament_id == tournament_id,
        TournamentRegistration.player_id == current_user.player_id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Player already registered"
        )
    
    # Register player (self-registration)
    registration = TournamentRegistration(
        tournament_id=tournament_id,
        player_id=current_user.player_id,
        registered_by_user_id=None  # Self-registered
    )
    
    db.add(registration)
    db.commit()
    
    return {"message": "Successfully registered for tournament"}


@router.post("/{tournament_id}/register-player")
def admin_register_player(
    tournament_id: int,
    player_data: RegisterPlayer,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Admin registers a player for tournament
    """
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    
    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournament not found"
        )
    
    if tournament.status != TournamentStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tournament is not accepting registrations"
        )
    
    # Check if player exists
    player = db.query(Player).filter(Player.id == player_data.player_id).first()
    if not player:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Player '{player_data.player_id}' not found"
        )
    
    # Check if player already registered
    existing = db.query(TournamentRegistration).filter(
        TournamentRegistration.tournament_id == tournament_id,
        TournamentRegistration.player_id == player_data.player_id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Player already registered"
        )
    
    # Register player (by admin)
    registration = TournamentRegistration(
        tournament_id=tournament_id,
        player_id=player_data.player_id,
        registered_by_user_id=current_user.id  # Registered by admin
    )
    
    db.add(registration)
    db.commit()
    
    return {"message": f"Player '{player.name}' registered successfully"}


@router.delete("/{tournament_id}/unregister")
def unregister_from_tournament(
    tournament_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user)
):
    """
    User unregisters their player from tournament
    """
    if not current_user.player_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Your account is not linked to a player"
        )
    
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    
    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournament not found"
        )
    
    if tournament.status != TournamentStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot unregister from this tournament"
        )
    
    registration = db.query(TournamentRegistration).filter(
        TournamentRegistration.tournament_id == tournament_id,
        TournamentRegistration.player_id == current_user.player_id
    ).first()
    
    if not registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Not registered for this tournament"
        )
    
    db.delete(registration)
    db.commit()
    
    return {"message": "Successfully unregistered from tournament"}


@router.delete("/{tournament_id}/unregister-player/{player_id}")
def admin_unregister_player(
    tournament_id: int,
    player_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Admin removes a player from tournament
    """
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    
    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournament not found"
        )
    
    if tournament.status != TournamentStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot unregister from this tournament"
        )
    
    registration = db.query(TournamentRegistration).filter(
        TournamentRegistration.tournament_id == tournament_id,
        TournamentRegistration.player_id == player_id
    ).first()
    
    if not registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Player not registered for this tournament"
        )
    
    db.delete(registration)
    db.commit()
    
    return {"message": "Player unregistered successfully"}


@router.get("/players/available", response_model=List[dict])
def get_available_players(
    tournament_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Get all players (for admin to select and register)
    Optionally filter out already registered players for a specific tournament
    """
    from app.models.match import Match
    
    print(f"🔍 Getting available players for tournament_id={tournament_id}")
    
    players = db.query(Player).order_by(Player.name).all()
    print(f"📊 Total players in DB: {len(players)}")
    
    result = []
    for player in players:
        # Check if already registered (if tournament_id provided)
        is_registered = False
        if tournament_id:
            is_registered = db.query(TournamentRegistration).filter(
                TournamentRegistration.tournament_id == tournament_id,
                TournamentRegistration.player_id == player.id
            ).first() is not None
        
        if not tournament_id or not is_registered:
            # Count matches for this player
            matches_count = db.query(Match).filter(
                (Match.player1_id == player.id) | (Match.player2_id == player.id)
            ).count()
            
            result.append({
                "id": player.id,
                "name": player.name,
                "rating": player.rating,
                "matches_played": matches_count
            })
    
    print(f"✅ Returning {len(result)} available players")
    return result

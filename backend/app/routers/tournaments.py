"""
Tournaments router - CRUD operations for tournaments
Реєстрація гравців (не users) на турніри
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, date
import logging
from app.database import get_db
from app.models.tournament import Tournament, TournamentStatus, TournamentDiscipline
from app.models.tournament_registration import TournamentRegistration, ParticipantStatus
from app.models.tournament_rule import TournamentRule, BracketType
from app.models.user import User, UserRole
from app.models.player import Player
from app.dependencies import require_admin, require_user, get_current_user_optional
from pydantic import BaseModel, field_validator
from app.services.seeding_service import assign_seeds_by_rating, update_seeds_manually
from app.services.bracket_generator import generate_single_elimination_bracket, generate_bracket_preview
from app.services.tournament_start_service import validate_tournament_start

# Logger для audit логування
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/tournaments", tags=["tournaments"])


# Pydantic schemas
class TournamentCreate(BaseModel):
    name: str
    description: Optional[str] = None
    registration_end: datetime  # Обов'язкова дата закінчення реєстрації
    registration_start: Optional[datetime] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    city: str
    country: str = "Україна"
    club: str
    discipline: TournamentDiscipline
    is_rated: bool = True  # За замовчуванням рейтинговий
    
    @field_validator('discipline', mode='before')
    @classmethod
    def validate_discipline(cls, v):
        """Convert uppercase discipline to lowercase for backward compatibility"""
        if isinstance(v, str):
            # Map uppercase to lowercase enum values
            discipline_map = {
                'FREE_PYRAMID': 'free_pyramid',
                'FREE_PYRAMID_EXTENDED': 'free_pyramid_extended',
                'COMBINED_PYRAMID': 'combined_pyramid',
                'DYNAMIC_PYRAMID': 'dynamic_pyramid',
                'COMBINED_PYRAMID_CHANGES': 'combined_pyramid_changes',
            }
            return discipline_map.get(v, v.lower())
        return v


class TournamentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TournamentStatus] = None
    registration_start: Optional[datetime] = None
    registration_end: Optional[datetime] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    city: Optional[str] = None
    country: Optional[str] = None
    club: Optional[str] = None
    discipline: Optional[TournamentDiscipline] = None
    is_rated: Optional[bool] = None


class RegisterPlayer(BaseModel):
    player_id: int  # ID гравця з таблиці players


class UpdateSeeds(BaseModel):
    """Request body для оновлення сіяних номерів"""
    seeds: dict[int, int]  # {player_id: seed_number}


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_tournament(
    tournament_data: TournamentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Create a new tournament (admin only)
    """
    # Явно конвертуємо discipline до lowercase для PostgreSQL - HARDCODE
    if isinstance(tournament_data.discipline, str):
        discipline_value = tournament_data.discipline.lower()
    else:
        discipline_value = str(tournament_data.discipline.value).lower() if hasattr(tournament_data.discipline, 'value') else str(tournament_data.discipline).lower()
    
    # HARDCODE lowercase для debugging - CRITICAL FIX
    status_value = "registration"  # Hardcoded lowercase string
    logger.info(f"Creating tournament with status={status_value} (type: {type(status_value)}), discipline={discipline_value}")
    
    tournament = Tournament(
        name=tournament_data.name,
        description=tournament_data.description,
        registration_start=tournament_data.registration_start,
        registration_end=tournament_data.registration_end,
        start_date=tournament_data.start_date,
        end_date=tournament_data.end_date,
        city=tournament_data.city,
        country=tournament_data.country,
        club=tournament_data.club,
        discipline=discipline_value,  # Lowercase string
        is_rated=1 if tournament_data.is_rated else 0,
        created_by_admin_id=current_user.id,
        status=status_value  # HARDCODED lowercase string - не enum!
    )
    
    db.add(tournament)
    db.commit()
    db.refresh(tournament)
    
    return {
        "id": tournament.id,
        "name": tournament.name,
        "description": tournament.description,
        "status": tournament.status,
        "registration_start": tournament.registration_start.isoformat() if tournament.registration_start else None,
        "registration_end": tournament.registration_end.isoformat() if tournament.registration_end else None,
        "start_date": tournament.start_date.isoformat() if tournament.start_date else None,
        "end_date": tournament.end_date.isoformat() if tournament.end_date else None,
        "city": tournament.city,
        "country": tournament.country,
        "club": tournament.club,
        "discipline": tournament.discipline,
        "is_rated": bool(tournament.is_rated),
        "created_by_admin_id": tournament.created_by_admin_id,
        "created_at": tournament.created_at.isoformat(),
        "started_at": tournament.started_at.isoformat() if tournament.started_at else None,
        "finished_at": tournament.finished_at.isoformat() if tournament.finished_at else None,
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
            "status": tournament.status,
            "registration_start": tournament.registration_start.isoformat() if tournament.registration_start else None,
            "registration_end": tournament.registration_end.isoformat() if tournament.registration_end else None,
            "start_date": tournament.start_date.isoformat() if tournament.start_date else None,
            "end_date": tournament.end_date.isoformat() if tournament.end_date else None,
            "city": tournament.city,
            "country": tournament.country,
            "club": tournament.club,
            "discipline": tournament.discipline if tournament.discipline else None,
            "is_rated": bool(tournament.is_rated),
            "created_by_admin_id": tournament.created_by_admin_id,
            "created_at": tournament.created_at.isoformat(),
            "started_at": tournament.started_at.isoformat() if tournament.started_at else None,
            "finished_at": tournament.finished_at.isoformat() if tournament.finished_at else None,
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
        "status": tournament.status,
        "registration_start": tournament.registration_start.isoformat() if tournament.registration_start else None,
        "registration_end": tournament.registration_end.isoformat() if tournament.registration_end else None,
        "start_date": tournament.start_date.isoformat() if tournament.start_date else None,
        "end_date": tournament.end_date.isoformat() if tournament.end_date else None,
        "city": tournament.city,
        "country": tournament.country,
        "club": tournament.club,
        "discipline": tournament.discipline if tournament.discipline else None,
        "is_rated": bool(tournament.is_rated),
        "created_by_admin_id": tournament.created_by_admin_id,
        "created_at": tournament.created_at.isoformat(),
        "started_at": tournament.started_at.isoformat() if tournament.started_at else None,
        "finished_at": tournament.finished_at.isoformat() if tournament.finished_at else None,
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
    if tournament_data.registration_start is not None:
        tournament.registration_start = tournament_data.registration_start
    if tournament_data.registration_end is not None:
        tournament.registration_end = tournament_data.registration_end
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
    if tournament_data.is_rated is not None:
        tournament.is_rated = 1 if tournament_data.is_rated else 0
    
    db.commit()
    db.refresh(tournament)
    
    registered_count = db.query(TournamentRegistration).filter(
        TournamentRegistration.tournament_id == tournament.id
    ).count()
    
    return {
        "id": tournament.id,
        "name": tournament.name,
        "description": tournament.description,
        "status": tournament.status,
        "registration_start": tournament.registration_start.isoformat() if tournament.registration_start else None,
        "registration_end": tournament.registration_end.isoformat() if tournament.registration_end else None,
        "start_date": tournament.start_date.isoformat() if tournament.start_date else None,
        "end_date": tournament.end_date.isoformat() if tournament.end_date else None,
        "city": tournament.city,
        "country": tournament.country,
        "club": tournament.club,
        "discipline": tournament.discipline if tournament.discipline else None,
        "is_rated": bool(tournament.is_rated),
        "created_by_admin_id": tournament.created_by_admin_id,
        "created_at": tournament.created_at.isoformat(),
        "started_at": tournament.started_at.isoformat() if tournament.started_at else None,
        "finished_at": tournament.finished_at.isoformat() if tournament.finished_at else None,
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
    
    if tournament.status != "pending":
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
    
    if tournament.status != "pending":
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
    
    if tournament.status != "pending":
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
    
    if tournament.status != "pending":
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


# Tournament Start Schemas
class TournamentStartRequest(BaseModel):
    bracket_type: BracketType = BracketType.SINGLE_ELIMINATION
    race_to_r64: Optional[int] = None
    race_to_r32: Optional[int] = None
    race_to_r16: Optional[int] = None
    race_to_qf: Optional[int] = None
    race_to_sf: Optional[int] = None
    race_to_f: int  # Обов'язково


@router.post("/{tournament_id}/start", status_code=status.HTTP_200_OK)
def start_tournament(
    tournament_id: int,
    start_data: TournamentStartRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Запустити турнір - створює регламент, присвоює сіяні, генерує сітку
    
    Кроки:
    1. Валідація (статус, учасники, і т.д.)
    2. Створення/оновлення TournamentRule
    3. Присвоєння сіяних номерів (якщо ще не присвоєні)
    4. Генерація сітки
    5. Перехід CONFIRMED → ACTIVE
    6. Блокування регламенту
    7. Оновлення статусу турніру на IN_PROGRESS
    """
    
    # 1. Валідація
    validation = validate_tournament_start(db, tournament_id)
    
    if not validation['is_valid']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                'message': 'Tournament cannot be started',
                'errors': validation['errors'],
                'warnings': validation['warnings']
            }
        )
    
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    
    # 2. Створення/оновлення регламенту
    rules = db.query(TournamentRule).filter(
        TournamentRule.tournament_id == tournament_id
    ).first()
    
    if not rules:
        rules = TournamentRule(
            tournament_id=tournament_id,
            bracket_type=start_data.bracket_type,
            race_to_r64=start_data.race_to_r64,
            race_to_r32=start_data.race_to_r32,
            race_to_r16=start_data.race_to_r16,
            race_to_qf=start_data.race_to_qf,
            race_to_sf=start_data.race_to_sf,
            race_to_f=start_data.race_to_f,
            is_locked=False
        )
        db.add(rules)
    else:
        # Оновити race_to якщо регламент ще не заблокований
        if rules.is_locked:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tournament rules are locked and cannot be modified"
            )
        rules.bracket_type = start_data.bracket_type
        rules.race_to_r64 = start_data.race_to_r64
        rules.race_to_r32 = start_data.race_to_r32
        rules.race_to_r16 = start_data.race_to_r16
        rules.race_to_qf = start_data.race_to_qf
        rules.race_to_sf = start_data.race_to_sf
        rules.race_to_f = start_data.race_to_f
    
    db.commit()
    
    # 3. Присвоєння сіяних (якщо ще не присвоєні)
    seeded_participants = assign_seeds_by_rating(db, tournament_id, confirmed_only=True)
    
    # 4. Генерація сітки (матчі створюються але НЕ впливають на рейтинг до завершення турніру)
    try:
        matches = generate_single_elimination_bracket(db, tournament_id)
    except ValueError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Error generating bracket for tournament {tournament_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating bracket: {str(e)}"
        )
    
    # 5. Перехід CONFIRMED → ACTIVE
    confirmed_registrations = db.query(TournamentRegistration).filter(
        TournamentRegistration.tournament_id == tournament_id,
        TournamentRegistration.status == "confirmed"
    ).all()
    
    for reg in confirmed_registrations:
        reg.status = "active"
    
    # 6. Блокування регламенту
    rules.is_locked = True
    
    # 7. Оновлення статусу турніру
    tournament.status = "in_progress"
    tournament.started_at = datetime.utcnow()
    
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Error committing tournament start for tournament {tournament_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error saving tournament state: {str(e)}"
        )
    
    # 8. Audit логування
    try:
        bracket_type_value = rules.bracket_type.value if hasattr(rules.bracket_type, 'value') else str(rules.bracket_type)
        logger.info(
            f"TOURNAMENT_STARTED: Tournament '{tournament.name}' (ID: {tournament_id}) started by admin {current_user.username} (ID: {current_user.id}). "
            f"Participants: {len(seeded_participants)}, Bracket: {validation['data']['bracket_size']}, "
            f"Matches created: {len(matches)}, Bracket type: {bracket_type_value}, "
            f"Race to F/SF/QF: {rules.race_to_f}/{rules.race_to_sf}/{rules.race_to_qf}"
        )
    except Exception as log_error:
        # Не блокувати старт турніру через помилку логування
        logger.error(f"Error logging tournament start: {log_error}")
    
    return {
        'message': 'Tournament started successfully',
        'tournament_id': tournament_id,
        'bracket_size': validation['data']['bracket_size'],
        'confirmed_participants': len(seeded_participants),
        'matches_created': len(matches),
        'started_at': tournament.started_at.isoformat(),
        'warnings': validation['warnings']
    }


@router.post("/{tournament_id}/seeds", status_code=status.HTTP_200_OK)
def update_tournament_seeds(
    tournament_id: int,
    seeds_data: UpdateSeeds,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Ручне оновлення сіяних номерів учасників турніру
    
    Args:
        tournament_id: ID турніру
        seeds_data: Словник {player_id: seed_number}
        
    Returns:
        Updated list of participants with new seeds
    """
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournament not found"
        )
    
    # Перевірка що турнір ще не стартував
    if tournament.status != "registration":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot update seeds after tournament has started"
        )
    
    try:
        updated_registrations = update_seeds_manually(
            db, 
            tournament_id, 
            seeds_data.seeds
        )
        
        logger.info(
            f"SEEDS_UPDATED: Tournament '{tournament.name}' (ID: {tournament_id}) seeds updated by admin {current_user.username}. "
            f"Updated {len(seeds_data.seeds)} participants."
        )
        
        # Повернути оновлений список учасників
        result = []
        for reg in updated_registrations:
            player = db.query(Player).filter(Player.id == reg.player_id).first()
            result.append({
                'player_id': reg.player_id,
                'player_name': player.name if player else None,
                'seed': reg.seed,
                'status': reg.status
            })
        
        return {
            'message': 'Seeds updated successfully',
            'participants': result
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/{tournament_id}/bracket/preview")
def get_tournament_bracket_preview(
    tournament_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Отримати попередній перегляд сітки БЕЗ збереження в БД
    Доступно тільки адмінам перед стартом турніру
    
    Returns:
        Preview bracket structure
    """
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournament not found"
        )
    
    # Генерувати preview можна тільки для турнірів в статусі REGISTRATION
    if tournament.status != "registration":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Preview is only available before tournament start"
        )
    
    preview = generate_bracket_preview(db, tournament_id)
    
    return {
        'tournament_id': tournament_id,
        'tournament_name': tournament.name,
        'status': tournament.status,
        'bracket': preview,
        'is_preview': True
    }


@router.get("/{tournament_id}/bracket")
def get_tournament_bracket(
    tournament_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Отримати сітку турніру
    
    Returns:
        Bracket visualization with rounds and matches
    """
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournament not found"
        )
    
    # Перевірка чи турнір стартував
    if tournament.status == "registration":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tournament has not started yet, bracket not generated"
        )
    
    from app.services.bracket_generator import get_bracket_visualization
    bracket = get_bracket_visualization(db, tournament_id)
    
    return {
        'tournament_id': tournament_id,
        'tournament_name': tournament.name,
        'status': tournament.status,
        'bracket': bracket
    }


@router.get("/{tournament_id}/matches")
async def get_tournament_matches(
    tournament_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Get all matches for a specific tournament
    """
    # Verify tournament exists
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournament not found"
        )
    
    # Get all matches for this tournament
    from app.models.match import Match
    from app.models.table import Table
    
    matches = db.query(Match).filter(
        Match.tournament_id == tournament_id
    ).order_by(Match.match_number).all()
    
    # Convert to response format with table name
    result = []
    for match in matches:
        match_dict = {
            'id': match.id,
            'tournament_id': match.tournament_id,
            'match_number': match.match_number,
            'round': match.round,
            'player1_id': match.player1_id,
            'player2_id': match.player2_id,
            'player1_name': match.player1_name,
            'player2_name': match.player2_name,
            'winner_id': match.winner_id,
            'player1_score': match.player1_score,
            'player2_score': match.player2_score,
            'max_score': match.max_score,
            'status': match.status,
            'table_id': match.table_id,
            'video_url': match.video_url,
            'started_at': match.started_at.isoformat() if match.started_at else None,
            'finished_at': match.finished_at.isoformat() if match.finished_at else None,
            'created_at': match.created_at.isoformat() if match.created_at else None,
            'date': match.date.isoformat() if match.date else None,
        }
        
        # Add table name if table_id exists
        if match.table_id:
            table = db.query(Table).filter(Table.id == match.table_id).first()
            match_dict['table_name'] = table.name if table else None
        else:
            match_dict['table_name'] = None
        
        result.append(match_dict)
    
    return result


# ==========================================
# PHASE 4: Tournament Completion Endpoints
# ==========================================

@router.post("/{tournament_id}/finish", status_code=status.HTTP_200_OK)
async def finish_tournament_endpoint(
    tournament_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Завершити турнір
    
    POST /api/tournaments/:id/finish
    
    Дії:
    1. Валідація всіх матчів (мають бути FINISHED або CANCELLED)
    2. Розрахунок рейтингу для кожного учасника (через rating.py)
    3. Розрахунок місць (через place_calculator.py)
    4. Зміна статусу турніру на FINISHED
    
    Доступно тільки для ADMIN
    """
    from app.services.tournament_finish_service import finish_tournament
    
    try:
        tournament = finish_tournament(db, tournament_id, current_user.id)
        
        logger.info(f"[AUDIT] Tournament {tournament_id} finished by user {current_user.username}")
        
        return {
            "success": True,
            "message": "Турнір успішно завершено",
            "tournament": {
                "id": tournament.id,
                "name": tournament.name,
                "status": tournament.status,
                "finished_at": tournament.finished_at.isoformat() if tournament.finished_at else None
            }
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"[ERROR] Failed to finish tournament {tournament_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{tournament_id}/results")
async def get_tournament_results(
    tournament_id: int,
    db: Session = Depends(get_db)
):
    """
    Отримати результати турніру
    
    GET /api/tournaments/:id/results
    
    Повертає:
    - Учасників відсортованих по місцях
    - ID, ім'я, місце, рейтинг до/після
    
    Доступно для всіх
    """
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    
    if not tournament:
        raise HTTPException(status_code=404, detail="Турнір не знайдено")
    
    # Отримати всіх учасників з місцями
    participants = db.query(TournamentRegistration).filter(
        TournamentRegistration.tournament_id == tournament_id
    ).order_by(
        TournamentRegistration.final_place.asc().nulls_last()
    ).all()
    
    results = []
    for p in participants:
        player = db.query(Player).filter(Player.id == p.player_id).first()
        
        results.append({
            "player_id": p.player_id,
            "player_name": player.name if player else "Unknown",
            "place": p.final_place,
            "rating_before": p.rating_before,
            "rating_after": p.rating_after,
            "rating_change": p.rating_change,
            "seed": p.seed
        })
    
    return {
        "tournament_id": tournament_id,
        "tournament_name": tournament.name,
        "status": tournament.status,
        "results": results
    }


@router.get("/{tournament_id}/rating-changes")
async def get_rating_changes(
    tournament_id: int,
    db: Session = Depends(get_db)
):
    """
    Отримати зміни рейтингу турніру
    
    GET /api/tournaments/:id/rating-changes
    
    Повертає:
    - Всіх учасників з rating_before, rating_after, rating_change
    - Відсортовано по найбільшій зміні (в плюс)
    
    Доступно для всіх
    """
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    
    if not tournament:
        raise HTTPException(status_code=404, detail="Турнір не знайдено")
    
    participants = db.query(TournamentRegistration).filter(
        TournamentRegistration.tournament_id == tournament_id
    ).order_by(TournamentRegistration.rating_change.desc()).all()
    
    changes = []
    for p in participants:
        player = db.query(Player).filter(Player.id == p.player_id).first()
        
        changes.append({
            "player_id": p.player_id,
            "player_name": player.name if player else "Unknown",
            "rating_before": p.rating_before,
            "rating_after": p.rating_after,
            "rating_change": p.rating_change,
            "place": p.final_place
        })
    
    return {
        "tournament_id": tournament_id,
        "tournament_name": tournament.name,
        "status": tournament.status,
        "changes": changes
    }

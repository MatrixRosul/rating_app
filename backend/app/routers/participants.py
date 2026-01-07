"""
Participants router - управління учасниками турнірів
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.models.tournament import Tournament, TournamentStatus
from app.models.tournament_registration import TournamentRegistration, ParticipantStatus
from app.models.user import User, UserRole
from app.models.player import Player
from app.dependencies import require_admin, require_user, get_current_user_optional
from pydantic import BaseModel

router = APIRouter(prefix="/api/tournaments/{tournament_id}/participants", tags=["participants"])


# Pydantic schemas
class ParticipantRegister(BaseModel):
    """Self-registration by user"""
    pass  # tournament_id from URL, player_id from current_user.player_id


class ParticipantAdd(BaseModel):
    """Admin adds player manually"""
    player_id: int


class ParticipantResponse(BaseModel):
    id: int
    player_id: int
    player_name: str
    rating: float
    status: str
    seed: Optional[int] = None
    registered_at: str
    confirmed_at: Optional[str] = None
    registered_by_admin: bool


@router.get("/", response_model=List[ParticipantResponse])
def get_participants(
    tournament_id: int,
    status_filter: Optional[str] = None,  # "all", "confirmed", "pending"
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Get tournament participants with optional status filter
    """
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournament not found"
        )
    
    query = db.query(TournamentRegistration).filter(
        TournamentRegistration.tournament_id == tournament_id
    )
    
    # Apply status filter
    if status_filter == "confirmed":
        query = query.filter(TournamentRegistration.status == "confirmed")
    elif status_filter == "pending":
        query = query.filter(TournamentRegistration.status == "pending")
    # "all" or None - no filter
    
    registrations = query.all()
    
    result = []
    for reg in registrations:
        player = db.query(Player).filter(Player.id == reg.player_id).first()
        if player:
            result.append(ParticipantResponse(
                id=reg.id,
                player_id=player.id,
                player_name=player.name,
                rating=player.rating,
                status=reg.status,
                seed=reg.seed,
                registered_at=reg.registered_at.isoformat(),
                confirmed_at=reg.confirmed_at.isoformat() if reg.confirmed_at else None,
                registered_by_admin=reg.registered_by_user_id is not None
            ))
    
    # Sort: confirmed participants by rating (descending), pending at the end
    result.sort(key=lambda x: (
        0 if x.status == "confirmed" else 1,
        -x.rating
    ))
    
    return result


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_for_tournament(
    tournament_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user)
):
    """
    Self-registration: User registers their linked player for tournament
    Status: PENDING (waiting for admin confirmation)
    """
    # Check if user has linked player
    if not current_user.player_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Your account is not linked to a player. Contact admin."
        )
    
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournament not found"
        )
    
    # Check tournament status
    if tournament.status != TournamentStatus.REGISTRATION:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tournament registration is closed"
        )
    
    # Check registration deadline
    if tournament.registration_end and datetime.utcnow() > tournament.registration_end:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration deadline has passed"
        )
    
    # Check if already registered
    existing = db.query(TournamentRegistration).filter(
        TournamentRegistration.tournament_id == tournament_id,
        TournamentRegistration.player_id == current_user.player_id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Player already registered with status: {existing.status}"
        )
    
    # Create registration
    registration = TournamentRegistration(
        tournament_id=tournament_id,
        player_id=current_user.player_id,
        status="pending",
        registered_by_user_id=None  # Self-registration
    )
    
    db.add(registration)
    db.commit()
    db.refresh(registration)
    
    player = db.query(Player).filter(Player.id == current_user.player_id).first()
    
    return {
        "message": "Registration submitted. Waiting for admin confirmation.",
        "registration_id": registration.id,
        "player_name": player.name if player else None,
        "status": registration.status
    }


@router.post("/unregister", status_code=status.HTTP_200_OK)
def unregister_from_tournament(
    tournament_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user)
):
    """
    User unregisters themselves from tournament
    Only allowed during registration period
    """
    # Check if user has linked player
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
    
    # Check tournament status
    if tournament.status != TournamentStatus.REGISTRATION:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot unregister - tournament has already started"
        )
    
    # Find registration
    registration = db.query(TournamentRegistration).filter(
        TournamentRegistration.tournament_id == tournament_id,
        TournamentRegistration.player_id == current_user.player_id
    ).first()
    
    if not registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="You are not registered for this tournament"
        )
    
    # Delete registration
    db.delete(registration)
    db.commit()
    
    return {
        "message": "Successfully unregistered from tournament",
        "tournament_id": tournament_id
    }


@router.post("/add", status_code=status.HTTP_201_CREATED)
def add_participant(
    tournament_id: int,
    data: ParticipantAdd,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Admin manually adds player to tournament
    Status: CONFIRMED (auto-confirmed by admin)
    """
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournament not found"
        )
    
    # Check if player exists
    player = db.query(Player).filter(Player.id == data.player_id).first()
    if not player:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Player not found"
        )
    
    # Check if already registered
    existing = db.query(TournamentRegistration).filter(
        TournamentRegistration.tournament_id == tournament_id,
        TournamentRegistration.player_id == data.player_id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Player already registered with status: {existing.status}"
        )
    
    # Create registration (auto-confirmed by admin)
    registration = TournamentRegistration(
        tournament_id=tournament_id,
        player_id=data.player_id,
        status="confirmed",
        registered_by_user_id=current_user.id,  # Admin added
        confirmed_at=datetime.utcnow()
    )
    
    db.add(registration)
    db.commit()
    db.refresh(registration)
    
    return {
        "message": f"Player {player.name} added to tournament",
        "registration_id": registration.id,
        "player_id": player.id,
        "player_name": player.name,
        "status": registration.status
    }


@router.patch("/{participant_id}/confirm")
def confirm_participant(
    tournament_id: int,
    participant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Admin confirms participant registration
    Can confirm PENDING or REJECTED participants
    """
    registration = db.query(TournamentRegistration).filter(
        TournamentRegistration.id == participant_id,
        TournamentRegistration.tournament_id == tournament_id
    ).first()
    
    if not registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registration not found"
        )
    
    if registration.status not in ["pending", "rejected"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Can only confirm PENDING or REJECTED registrations. Current status: {registration.status}"
        )
    
    registration.status = "confirmed"
    registration.confirmed_at = datetime.utcnow()
    
    db.commit()
    db.refresh(registration)
    
    player = db.query(Player).filter(Player.id == registration.player_id).first()
    
    return {
        "message": f"Participant confirmed",
        "player_name": player.name if player else None,
        "status": registration.status,
        "confirmed_at": registration.confirmed_at.isoformat()
    }


@router.patch("/{participant_id}/reject")
def reject_participant(
    tournament_id: int,
    participant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Admin rejects participant registration
    """
    registration = db.query(TournamentRegistration).filter(
        TournamentRegistration.id == participant_id,
        TournamentRegistration.tournament_id == tournament_id
    ).first()
    
    if not registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registration not found"
        )
    
    if registration.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Can only reject PENDING registrations. Current status: {registration.status}"
        )
    
    registration.status = "rejected"
    
    db.commit()
    db.refresh(registration)
    
    player = db.query(Player).filter(Player.id == registration.player_id).first()
    
    return {
        "message": f"Participant rejected",
        "player_name": player.name if player else None,
        "status": registration.status
    }


@router.delete("/{participant_id}")
def remove_participant(
    tournament_id: int,
    participant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Admin removes participant from tournament
    """
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournament not found"
        )
    
    # Only allow removal during REGISTRATION phase (or SUPER_ADMIN anytime)
    if tournament.status != TournamentStatus.REGISTRATION and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Can only remove participants during registration phase"
        )
    
    registration = db.query(TournamentRegistration).filter(
        TournamentRegistration.id == participant_id,
        TournamentRegistration.tournament_id == tournament_id
    ).first()
    
    if not registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registration not found"
        )
    
    player = db.query(Player).filter(Player.id == registration.player_id).first()
    player_name = player.name if player else "Unknown"
    
    db.delete(registration)
    db.commit()
    
    return {
        "message": f"Participant {player_name} removed from tournament"
    }

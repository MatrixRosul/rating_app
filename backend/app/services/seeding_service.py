"""
Seeding service - присвоєння сіяних номерів учасникам турніру
"""
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from app.models.tournament_registration import TournamentRegistration, ParticipantStatus
from app.models.player import Player


def assign_seeds_by_rating(
    db: Session,
    tournament_id: int,
    confirmed_only: bool = True
) -> List[TournamentRegistration]:
    """
    Автоматичне присвоєння сіяних номерів на основі рейтингу
    
    Args:
        db: Database session
        tournament_id: ID турніру
        confirmed_only: Чи присвоювати тільки CONFIRMED учасникам
        
    Returns:
        List of updated registrations sorted by seed
    """
    # Отримати підтверджених учасників
    query = db.query(TournamentRegistration).filter(
        TournamentRegistration.tournament_id == tournament_id
    )
    
    if confirmed_only:
        query = query.filter(TournamentRegistration.status == ParticipantStatus.CONFIRMED)
    
    registrations = query.all()
    
    # Отримати рейтинги гравців
    participants_with_rating = []
    for reg in registrations:
        player = db.query(Player).filter(Player.id == reg.player_id).first()
        if player:
            participants_with_rating.append({
                'registration': reg,
                'rating': player.rating,
                'player_id': player.id
            })
    
    # Сортувати по рейтингу (від найвищого до найнижчого)
    participants_with_rating.sort(key=lambda x: x['rating'], reverse=True)
    
    # Присвоїти сіяні номери
    for index, participant in enumerate(participants_with_rating, start=1):
        participant['registration'].seed = index
    
    db.commit()
    
    # Повернути відсортовані реєстрації
    return [p['registration'] for p in participants_with_rating]


def update_seeds_manually(
    db: Session,
    tournament_id: int,
    seed_mapping: Dict[int, int]  # {player_id: new_seed}
) -> List[TournamentRegistration]:
    """
    Ручне коригування сіяних номерів
    
    Args:
        db: Database session
        tournament_id: ID турніру
        seed_mapping: Словник {player_id: new_seed}
        
    Returns:
        List of updated registrations
        
    Raises:
        ValueError: Якщо є дублікати сіяних номерів
    """
    # Перевірка на дублікати
    seeds = list(seed_mapping.values())
    if len(seeds) != len(set(seeds)):
        raise ValueError("Duplicate seed numbers detected")
    
    # Оновити сіяні номери
    updated_registrations = []
    for player_id, new_seed in seed_mapping.items():
        registration = db.query(TournamentRegistration).filter(
            TournamentRegistration.tournament_id == tournament_id,
            TournamentRegistration.player_id == player_id
        ).first()
        
        if registration:
            registration.seed = new_seed
            updated_registrations.append(registration)
    
    db.commit()
    
    # Повернути відсортовані по seed
    updated_registrations.sort(key=lambda r: r.seed if r.seed else 999)
    return updated_registrations


def get_seeded_participants(
    db: Session,
    tournament_id: int,
    confirmed_only: bool = True
) -> List[Dict]:
    """
    Отримати учасників з присвоєними сіяними номерами
    
    Args:
        db: Database session
        tournament_id: ID турніру
        confirmed_only: Чи повертати тільки CONFIRMED учасників
        
    Returns:
        List of dicts with player info and seed
    """
    query = db.query(TournamentRegistration).filter(
        TournamentRegistration.tournament_id == tournament_id
    )
    
    if confirmed_only:
        query = query.filter(TournamentRegistration.status == ParticipantStatus.CONFIRMED)
    
    registrations = query.order_by(TournamentRegistration.seed).all()
    
    result = []
    for reg in registrations:
        player = db.query(Player).filter(Player.id == reg.player_id).first()
        if player:
            result.append({
                'player_id': player.id,
                'player_name': player.name,
                'rating': player.rating,
                'seed': reg.seed,
                'registration_id': reg.id
            })
    
    return result


def validate_seeding(
    db: Session,
    tournament_id: int
) -> Dict[str, any]:
    """
    Валідація сіяних номерів перед стартом турніру
    
    Returns:
        Dict з результатами валідації: {is_valid, errors, warnings}
    """
    registrations = db.query(TournamentRegistration).filter(
        TournamentRegistration.tournament_id == tournament_id,
        TournamentRegistration.status == ParticipantStatus.CONFIRMED
    ).all()
    
    errors = []
    warnings = []
    
    # Перевірка: всі підтверджені учасники мають seed
    for reg in registrations:
        if reg.seed is None:
            errors.append(f"Player {reg.player_id} has no seed assigned")
    
    # Перевірка: немає дублікатів
    seeds = [r.seed for r in registrations if r.seed is not None]
    if len(seeds) != len(set(seeds)):
        errors.append("Duplicate seed numbers detected")
    
    # Перевірка: сіяні номери йдуть підряд від 1
    if seeds:
        expected_seeds = set(range(1, len(seeds) + 1))
        actual_seeds = set(seeds)
        if expected_seeds != actual_seeds:
            missing = expected_seeds - actual_seeds
            extra = actual_seeds - expected_seeds
            if missing:
                warnings.append(f"Missing seed numbers: {sorted(missing)}")
            if extra:
                warnings.append(f"Unexpected seed numbers: {sorted(extra)}")
    
    return {
        'is_valid': len(errors) == 0,
        'errors': errors,
        'warnings': warnings,
        'total_participants': len(registrations),
        'seeded_count': len([r for r in registrations if r.seed is not None])
    }

"""
Tournament start validation service
"""
from typing import Dict
from sqlalchemy.orm import Session
from app.models.tournament import Tournament, TournamentStatus
from app.models.tournament_registration import TournamentRegistration, ParticipantStatus
from app.models.tournament_rule import TournamentRule
from app.services.seeding_service import validate_seeding


def validate_tournament_start(
    db: Session,
    tournament_id: int
) -> Dict:
    """
    Валідація перед стартом турніру
    
    Перевірки:
    1. Статус REGISTRATION
    2. Мінімум 2 CONFIRMED учасники
    3. Регламент (TournamentRule) створений та race_to задано
    4. Сіяні номери присвоєні
    5. Турнір ще не стартував
    
    Returns:
        Dict з результатами: {is_valid, errors, warnings, data}
    """
    errors = []
    warnings = []
    data = {}
    
    # 1. Перевірка існування турніру
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        return {
            'is_valid': False,
            'errors': ['Tournament not found'],
            'warnings': [],
            'data': {}
        }
    
    data['tournament_name'] = tournament.name
    data['tournament_status'] = tournament.status.value
    
    # 2. Перевірка статусу
    if tournament.status != TournamentStatus.REGISTRATION:
        errors.append(f"Tournament status must be REGISTRATION, current: {tournament.status.value}")
    
    # 3. Перевірка чи турнір вже стартував
    if tournament.started_at is not None:
        errors.append("Tournament has already started")
    
    # 4. Перевірка учасників
    confirmed_participants = db.query(TournamentRegistration).filter(
        TournamentRegistration.tournament_id == tournament_id,
        TournamentRegistration.status == ParticipantStatus.CONFIRMED
    ).all()
    
    data['confirmed_count'] = len(confirmed_participants)
    
    if len(confirmed_participants) < 2:
        errors.append(f"At least 2 confirmed participants required, current: {len(confirmed_participants)}")
    
    # Обчислити розмір сітки (потрібно завжди)
    import math
    bracket_size = 2 ** math.ceil(math.log2(len(confirmed_participants))) if len(confirmed_participants) > 0 else 0
    data['bracket_size'] = bracket_size
    
    # 5. Перевірка регламенту (warning, бо можна створити при старті)
    rules = db.query(TournamentRule).filter(
        TournamentRule.tournament_id == tournament_id
    ).first()
    
    if not rules:
        warnings.append("Tournament rules not configured - will be created from start parameters")
    else:
        data['bracket_type'] = rules.bracket_type.value
        data['is_locked'] = rules.is_locked
        
        # Перевірка race_to для фіналу (обов'язково)
        if not rules.race_to_f:
            errors.append("race_to_f (Final) is required")
        
        # Перевірка race_to для активних раундів
        if bracket_size >= 64 and not rules.race_to_r64:
            warnings.append("race_to_r64 not set, will use race_to_f as default")
        if bracket_size >= 32 and not rules.race_to_r32:
            warnings.append("race_to_r32 not set, will use race_to_f as default")
        if bracket_size >= 16 and not rules.race_to_r16:
            warnings.append("race_to_r16 not set, will use race_to_f as default")
        if bracket_size >= 8 and not rules.race_to_qf:
            warnings.append("race_to_qf not set, will use race_to_f as default")
        if bracket_size >= 4 and not rules.race_to_sf:
            warnings.append("race_to_sf not set, will use race_to_f as default")
        
        # Додати дані про регламент
        data['race_to'] = {
            'r64': rules.race_to_r64,
            'r32': rules.race_to_r32,
            'r16': rules.race_to_r16,
            'qf': rules.race_to_qf,
            'sf': rules.race_to_sf,
            'f': rules.race_to_f
        }
    
    # 6. Перевірка сіяних номерів (warnings, бо можна автоматично присвоїти)
    seeding_validation = validate_seeding(db, tournament_id)
    
    # Seeds можна присвоїти автоматично, тому це warnings
    if not seeding_validation['is_valid']:
        warnings.extend(seeding_validation['errors'])  # Переносимо в warnings
        warnings.append("Seeds will be auto-assigned by rating if not set")
    
    warnings.extend(seeding_validation['warnings'])
    data['seeding'] = seeding_validation
    
    # 7. Перевірка pending учасників
    pending_count = db.query(TournamentRegistration).filter(
        TournamentRegistration.tournament_id == tournament_id,
        TournamentRegistration.status == ParticipantStatus.PENDING
    ).count()
    
    if pending_count > 0:
        warnings.append(f"{pending_count} participants are still PENDING and will not be included in bracket")
    
    return {
        'is_valid': len(errors) == 0,
        'errors': errors,
        'warnings': warnings,
        'data': data
    }

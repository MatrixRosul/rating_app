"""
Bracket generator service - генерація турнірної сітки Single Elimination
"""
from typing import List, Dict, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.match import Match, MatchStatus
from app.models.tournament import Tournament
from app.models.tournament_registration import TournamentRegistration, ParticipantStatus
from app.models.tournament_rule import TournamentRule
from app.models.player import Player
import math


def get_next_power_of_two(n: int) -> int:
    """
    Повертає найближчу більшу ступінь двійки
    Наприклад: 5 -> 8, 10 -> 16, 17 -> 32
    """
    return 2 ** math.ceil(math.log2(n))


def get_round_name(bracket_size: int, round_number: int) -> str:
    """
    Визначає назву раунду
    
    Args:
        bracket_size: Розмір сітки (8, 16, 32, 64)
        round_number: Номер раунду (1 = перший раунд, 2 = другий і т.д.)
        
    Returns:
        Назва раунду (R32, R16, QF, SF, F)
    """
    # Кількість матчів в раунді = bracket_size / (2 ^ round_number)
    matches_in_round = bracket_size // (2 ** round_number)
    
    if matches_in_round == 1:
        return "F"  # Final
    elif matches_in_round == 2:
        return "SF"  # Semi Finals
    elif matches_in_round == 4:
        return "QF"  # Quarter Finals
    elif matches_in_round == 8:
        return "R16"  # Round of 16
    elif matches_in_round == 16:
        return "R32"  # Round of 32
    elif matches_in_round == 32:
        return "R64"  # Round of 64
    else:
        return f"R{matches_in_round * 2}"


def generate_single_elimination_bracket(
    db: Session,
    tournament_id: int
) -> List[Match]:
    """
    Генерує Single Elimination сітку з WO та зв'язками next_match
    
    Алгоритм:
    1. Отримати учасників відсортованих по seed
    2. Визначити розмір сітки (найближча ступінь 2)
    3. Створити матчі з WO якщо потрібно
    4. Зв'язати матчі через next_match_id
    5. Зберегти в БД
    
    Args:
        db: Database session
        tournament_id: ID турніру
        
    Returns:
        List of created matches
        
    Raises:
        ValueError: Якщо учасників менше 2
    """
    # 1. Отримати підтверджених учасників з сіяними номерами
    participants = db.query(TournamentRegistration).filter(
        TournamentRegistration.tournament_id == tournament_id,
        TournamentRegistration.status == ParticipantStatus.CONFIRMED
    ).order_by(TournamentRegistration.seed).all()
    
    if len(participants) < 2:
        raise ValueError("At least 2 participants required for bracket generation")
    
    # 2. Визначити розмір сітки
    bracket_size = get_next_power_of_two(len(participants))
    num_byes = bracket_size - len(participants)
    
    # 3. Отримати правила турніру для race_to
    rules = db.query(TournamentRule).filter(
        TournamentRule.tournament_id == tournament_id
    ).first()
    
    # 4. Створити структуру сітки
    matches = []
    match_number = 1
    
    # Визначити кількість раундів
    num_rounds = int(math.log2(bracket_size))
    
    # Створити всі раунди
    rounds = {}  # {round_number: [matches]}
    
    for round_num in range(1, num_rounds + 1):
        round_name = get_round_name(bracket_size, round_num)
        matches_in_round = bracket_size // (2 ** round_num)
        rounds[round_num] = []
        
        for i in range(matches_in_round):
            match = Match(
                tournament_id=tournament_id,
                match_number=match_number,
                round=round_name,
                status="pending",  # String instead of enum
                max_score=rules.get_race_to_for_round(round_name) if rules else None
            )
            rounds[round_num].append(match)
            matches.append(match)
            match_number += 1
    
    # 5. Зв'язати матчі (next_match connections)
    for round_num in range(1, num_rounds):
        current_round_matches = rounds[round_num]
        next_round_matches = rounds[round_num + 1]
        
        for i, match in enumerate(current_round_matches):
            next_match_index = i // 2
            match.next_match_id = None  # Буде встановлено після збереження
            match.position_in_next = 1 if i % 2 == 0 else 2
            # Зберігаємо індекс для пізнішого зв'язування
            match._next_match_index = next_match_index
    
    # 6. Зберегти всі матчі (потрібно для отримання ID)
    for match in matches:
        db.add(match)
    db.flush()  # Отримати ID без commit
    
    # 7. Встановити next_match_id
    for round_num in range(1, num_rounds):
        current_round_matches = rounds[round_num]
        next_round_matches = rounds[round_num + 1]
        
        for match in current_round_matches:
            if hasattr(match, '_next_match_index'):
                next_match = next_round_matches[match._next_match_index]
                match.next_match_id = next_match.id
    
    # 8. Розставити учасників в перший раунд з урахуванням стандартної сітки
    first_round_matches = rounds[1]
    seeded_positions = generate_seeding_order(bracket_size)
    
    for match_index, (seed1, seed2) in enumerate(seeded_positions):
        if match_index >= len(first_round_matches):
            break
            
        match = first_round_matches[match_index]
        
        # Seed 1 (вищий номер)
        if seed1 <= len(participants):
            participant1 = participants[seed1 - 1]
            match.player1_id = participant1.player_id
            player1 = db.query(Player).filter(Player.id == participant1.player_id).first()
            if player1:
                match.player1_name = player1.name
        
        # Seed 2 (нижчий номер або BYE)
        if seed2 <= len(participants):
            participant2 = participants[seed2 - 1]
            match.player2_id = participant2.player_id
            player2 = db.query(Player).filter(Player.id == participant2.player_id).first()
            if player2:
                match.player2_name = player2.name
        else:
            # BYE - гравець 1 автоматично проходить далі
            match.status = "wo"  # String instead of enum
            match.winner_id = match.player1_id
            match.player1_score = 0
            match.player2_score = 0
            
            # Просунути переможця в наступний матч
            if match.next_match_id:
                next_match = db.query(Match).filter(Match.id == match.next_match_id).first()
                if next_match:
                    if match.position_in_next == 1:
                        next_match.player1_id = match.winner_id
                        next_match.player1_name = match.player1_name
                    else:
                        next_match.player2_id = match.winner_id
                        next_match.player2_name = match.player1_name
    
    db.commit()
    
    return matches


def generate_seeding_order(bracket_size: int) -> List[Tuple[int, int]]:
    """
    Генерує стандартний порядок розстановки сіяних в сітці
    
    Наприклад для 8:
    [(1, 8), (4, 5), (2, 7), (3, 6)]
    
    Алгоритм забезпечує що:
    - Топ-сіяні зустрічаються тільки в фіналі
    - Сіяні 1-4 зустрічаються в півфіналі
    """
    if bracket_size == 2:
        return [(1, 2)]
    
    # Рекурсивно будуємо попередній раунд
    previous_round = generate_seeding_order(bracket_size // 2)
    
    # Розширюємо до поточного раунду
    current_round = []
    for seed1, seed2 in previous_round:
        # Додаємо матч між seed1 та його "дзеркальним" опонентом
        current_round.append((seed1, bracket_size + 1 - seed1))
        # Додаємо матч між seed2 та його "дзеркальним" опонентом
        current_round.append((seed2, bracket_size + 1 - seed2))
    
    return current_round


def get_bracket_visualization(
    db: Session,
    tournament_id: int
) -> Dict:
    """
    Отримує сітку в зручному форматі для відображення
    
    Returns:
        Dict з раундами та матчами
    """
    matches = db.query(Match).filter(
        Match.tournament_id == tournament_id
    ).order_by(Match.match_number).all()
    
    # Групуємо по раундам
    rounds = {}
    for match in matches:
        if match.round not in rounds:
            rounds[match.round] = []
        
        # Отримати інфо про гравців
        player1 = db.query(Player).filter(Player.id == match.player1_id).first() if match.player1_id else None
        player2 = db.query(Player).filter(Player.id == match.player2_id).first() if match.player2_id else None
        winner = db.query(Player).filter(Player.id == match.winner_id).first() if match.winner_id else None
        
        rounds[match.round].append({
            'match_id': match.id,
            'match_number': match.match_number,
            'player1': {
                'id': player1.id if player1 else None,
                'name': player1.name if player1 else "BYE",
                'rating': player1.rating if player1 else None
            },
            'player2': {
                'id': player2.id if player2 else None,
                'name': player2.name if player2 else "BYE",
                'rating': player2.rating if player2 else None
            },
            'winner': {
                'id': winner.id if winner else None,
                'name': winner.name if winner else None
            } if winner else None,
            'score': f"{match.player1_score or 0} - {match.player2_score or 0}",
            'status': match.status if match.status else "pending",
            'is_wo': match.status == "wo",
            'next_match_id': match.next_match_id
        })
    
    # Визначити порядок раундів
    round_order = ['R64', 'R32', 'R16', 'QF', 'SF', 'F']
    ordered_rounds = []
    for round_name in round_order:
        if round_name in rounds:
            ordered_rounds.append({
                'name': round_name,
                'matches': rounds[round_name]
            })
    
    return {
        'rounds': ordered_rounds,
        'total_matches': len(matches)
    }


def generate_bracket_preview(
    db: Session,
    tournament_id: int,
    bracket_type: str = "single_elimination"
) -> Dict:
    """
    Генерує попередній перегляд сітки БЕЗ збереження в БД
    
    Args:
        db: Database session
        tournament_id: ID турніру
        bracket_type: Тип сітки (поки що тільки single_elimination)
        
    Returns:
        Preview bracket structure
    """
    # Отримати підтверджених учасників
    participants = db.query(TournamentRegistration).filter(
        TournamentRegistration.tournament_id == tournament_id,
        TournamentRegistration.status == ParticipantStatus.CONFIRMED
    ).order_by(TournamentRegistration.seed).all()
    
    if len(participants) < 2:
        return {
            'error': 'At least 2 confirmed participants required',
            'rounds': [],
            'total_matches': 0
        }
    
    bracket_size = get_next_power_of_two(len(participants))
    seeded_positions = generate_seeding_order(bracket_size)
    
    # Створити віртуальні матчі (без збереження)
    preview_matches = []
    match_number = 1
    
    for seed1, seed2 in seeded_positions:
        player1 = None
        player2 = None
        is_wo = False
        
        if seed1 <= len(participants):
            participant1 = participants[seed1 - 1]
            player1_obj = db.query(Player).filter(Player.id == participant1.player_id).first()
            player1 = {
                'id': player1_obj.id,
                'name': player1_obj.name,
                'rating': player1_obj.rating,
                'seed': seed1
            }
        
        if seed2 <= len(participants):
            participant2 = participants[seed2 - 1]
            player2_obj = db.query(Player).filter(Player.id == participant2.player_id).first()
            player2 = {
                'id': player2_obj.id,
                'name': player2_obj.name,
                'rating': player2_obj.rating,
                'seed': seed2
            }
        else:
            is_wo = True
            player2 = {
                'id': None,
                'name': 'BYE',
                'rating': None,
                'seed': seed2
            }
        
        preview_matches.append({
            'match_number': match_number,
            'round': get_round_name(bracket_size, 1),
            'player1': player1,
            'player2': player2,
            'is_wo': is_wo,
            'status': 'wo' if is_wo else 'pending'
        })
        match_number += 1
    
    # Групувати по раундах
    rounds = {}
    for match in preview_matches:
        round_name = match['round']
        if round_name not in rounds:
            rounds[round_name] = []
        rounds[round_name].append(match)
    
    # Впорядкувати раунди
    round_order = ['R64', 'R32', 'R16', 'QF', 'SF', 'F']
    ordered_rounds = []
    for round_name in round_order:
        if round_name in rounds:
            ordered_rounds.append({
                'name': round_name,
                'matches': rounds[round_name]
            })
    
    return {
        'rounds': ordered_rounds,
        'total_matches': len(preview_matches),
        'bracket_size': bracket_size,
        'participants_count': len(participants)
    }

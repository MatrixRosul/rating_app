"""
Place Calculator Service
Визначає місця учасників турніру на основі результатів матчів
"""
from typing import List, Dict
from sqlalchemy.orm import Session
from app.models.tournament_registration import TournamentRegistration
from app.models.match import Match, MatchStatus


def calculate_places(db: Session, tournament_id: int) -> Dict[int, int]:
    """
    Розраховує місця для всіх учасників турніру
    
    Логіка:
    1. Переможець фіналу - 1 місце
    2. Програвший фіналу - 2 місце
    3. Програвші півфіналів - 3-4 місця (однаково)
    4. Програвші чвертьфіналів - 5-8 місця
    5. І так далі...
    
    Returns:
        Dict[player_id, place]
    """
    
    # Отримуємо всі завершені матчі турніру, відсортовані по раунду
    matches = db.query(Match).filter(
        Match.tournament_id == tournament_id,
        Match.status == MATCH_STATUS.COMPLETED
    ).order_by(Match.round.desc()).all()
    
    if not matches:
        return {}
    
    places = {}
    
    # Раунди в порядку від фіналу до ранніх раундів
    # Використовуємо короткі назви як в БД: F, SF, QF, R16, R32, R64
    round_order = ['F', 'SF', 'QF', 'R16', 'R32', 'R64']
    
    current_place = 1
    
    for round_name in round_order:
        round_matches = [m for m in matches if m.round == round_name]
        
        if not round_matches:
            continue
        
        # Переможці цього раунду
        winners = [m.winner_id for m in round_matches if m.winner_id]
        
        # Програвші цього раунду
        losers = []
        for m in round_matches:
            if m.player1_id and m.player2_id and m.winner_id:
                loser = m.player2_id if m.winner_id == m.player1_id else m.player1_id
                losers.append(loser)
        
        # Якщо це фінал - переможець отримує 1 місце
        if round_name == 'F' and winners:
            places[winners[0]] = current_place
            current_place += 1
        
        # Програвші отримують поточне місце (всі однаково)
        if losers:
            for loser in losers:
                if loser not in places:  # Не перезаписуємо якщо вже є краще місце
                    places[loser] = current_place
            
            # Наступне місце після групи програвших
            current_place += len(losers)
    
    return places


def assign_places_to_participants(db: Session, tournament_id: int) -> None:
    """
    Призначає розраховані місця учасникам турніру в БД
    """
    places = calculate_places(db, tournament_id)
    
    for player_id, place in places.items():
        participant = db.query(TournamentRegistration).filter(
            TournamentRegistration.tournament_id == tournament_id,
            TournamentRegistration.player_id == player_id
        ).first()
        
        if participant:
            participant.final_place = place
    
    db.commit()

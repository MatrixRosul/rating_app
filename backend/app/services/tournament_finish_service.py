"""
Tournament Finish Service
Завершення турніру з розрахунком рейтингу та місць
"""
from typing import Dict
from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import datetime

from app.models.tournament import Tournament
from app.models.match import Match
from app.models.tournament_registration import TournamentRegistration
from app.services.rating import calculate_rating_change
from app.services.place_calculator import assign_places_to_participants
from app.constants import TOURNAMENT_STATUS, MATCH_STATUS


def validate_tournament_ready_to_finish(db: Session, tournament_id: int) -> Tournament:
    """
    Валідація перед завершенням турніру
    
    Перевірки:
    - Турнір існує
    - Турнір має статус IN_PROGRESS
    - Всі матчі завершені або скасовані
    """
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    
    if not tournament:
        raise HTTPException(status_code=404, detail="Турнір не знайдено")
    
    if tournament.status != TOURNAMENT_STATUS.IN_PROGRESS:
        raise HTTPException(
            status_code=400,
            detail=f"Неможливо завершити турнір зі статусом {tournament.status}"
        )
    
    # Перевірка статусів матчів
    incomplete_matches = db.query(Match).filter(
        Match.tournament_id == tournament_id,
        Match.status.in_([MATCH_STATUS.PENDING, MATCH_STATUS.IN_PROGRESS])
    ).count()
    
    if incomplete_matches > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Є {incomplete_matches} незавершених матчів. Завершіть всі матчі перед завершенням турніру."
        )
    
    return tournament


def calculate_tournament_ratings(db: Session, tournament_id: int) -> Dict[int, Dict]:
    """
    Розрахунок рейтингу для всіх учасників турніру
    
    Логіка:
    1. Взяти rating_before для кожного учасника
    2. Отримати всі FINISHED матчі (відсортовані по finished_at)
    3. Пересимулювати кожен матч через rating.py
    4. Накопичувати зміни рейтингу
    5. Повернути final ratings
    
    Returns:
        Dict[player_id, {"rating_before": int, "rating_after": int, "rating_change": int}]
    """
    
    # 1. Підготовка початкових рейтингів
    participants = db.query(TournamentRegistration).filter(
        TournamentRegistration.tournament_id == tournament_id
    ).all()
    
    # In-memory map поточних рейтингів
    current_ratings = {}
    rating_data = {}
    
    for p in participants:
        # Отримати поточний рейтинг гравця якщо rating_before не встановлено
        if p.rating_before is None:
            from app.models.player import Player
            player = db.query(Player).filter(Player.id == p.player_id).first()
            p.rating_before = player.rating if player else 1300
            
        current_ratings[p.player_id] = p.rating_before
        rating_data[p.player_id] = {
            "rating_before": p.rating_before,
            "rating_after": p.rating_before,
            "rating_change": 0
        }
    
    # 2. Отримати всі завершені матчі (по порядку)
    matches = db.query(Match).filter(
        Match.tournament_id == tournament_id,
        Match.status == MATCH_STATUS.COMPLETED,
        Match.player1_id.isnot(None),
        Match.player2_id.isnot(None),
        Match.winner_id.isnot(None)
    ).order_by(Match.finished_at.asc()).all()
    
    # 3. Пересимуляція кожного матчу
    for match in matches:
        # Пропускаємо WO (walkover) матчі - рахунок 0:0 або технічна перемога
        p1_score = match.player1_score or 0
        p2_score = match.player2_score or 0
        is_walkover = (p1_score == 0 and p2_score == 0 and match.winner_id is not None)
        
        if is_walkover:
            # WO матч - не змінюємо рейтинг, але зберігаємо поточні значення в матч
            p1_rating = current_ratings.get(match.player1_id, 1300)
            p2_rating = current_ratings.get(match.player2_id, 1300)
            match.player1_rating_before = p1_rating
            match.player2_rating_before = p2_rating
            match.player1_rating_after = p1_rating
            match.player2_rating_after = p2_rating
            match.player1_rating_change = 0
            match.player2_rating_change = 0
            continue
        p1_id = match.player1_id
        p2_id = match.player2_id
        
        # Поточні рейтинги
        p1_rating = current_ratings.get(p1_id, 1300)
        p2_rating = current_ratings.get(p2_id, 1300)
        
        # Рахунок
        p1_score = match.player1_score or 0
        p2_score = match.player2_score or 0
        max_score = match.max_score or 10
        
        # Стадія турніру для множників
        stage = match.round  # 'final', 'semifinal', etc.
        
        # Виклик існуючої функції rating.py
        result = calculate_rating_change(
            player1_rating=p1_rating,
            player2_rating=p2_rating,
            player1_score=p1_score,
            player2_score=p2_score,
            max_score=max_score,
            player1_games=30,  # TODO: можна брати з історії гравця
            player2_games=30,
            stage=stage
        )
        
        # Оновити поточні рейтинги
        current_ratings[p1_id] += result["player1_change"]
        current_ratings[p2_id] += result["player2_change"]
        
        # ВАЖЛИВО: Оновити поля рейтингів у самому матчі для відображення на профілі
        match.player1_rating_before = p1_rating
        match.player2_rating_before = p2_rating
        match.player1_rating_after = current_ratings[p1_id]
        match.player2_rating_after = current_ratings[p2_id]
        match.player1_rating_change = result["player1_change"]
        match.player2_rating_change = result["player2_change"]
    
    # 4. Фінальні результати
    for player_id, final_rating in current_ratings.items():
        if player_id in rating_data:
            rating_data[player_id]["rating_after"] = final_rating
            rating_data[player_id]["rating_change"] = final_rating - rating_data[player_id]["rating_before"]
    
    return rating_data


def finish_tournament(db: Session, tournament_id: int, admin_user_id: int) -> Tournament:
    """
    Повне завершення турніру з транзакційністю
    
    Кроки:
    1. Валідація
    2. Розрахунок рейтингу
    3. Збереження рейтингу в БД
    4. Розрахунок місць
    5. Зміна статусу турніру
    """
    
    try:
        # 1. Валідація
        tournament = validate_tournament_ready_to_finish(db, tournament_id)
        
        # 2. Розрахунок рейтингу
        rating_results = calculate_tournament_ratings(db, tournament_id)
        
        # 3. Збереження рейтингу в БД
        for player_id, data in rating_results.items():
            participant = db.query(TournamentRegistration).filter(
                TournamentRegistration.tournament_id == tournament_id,
                TournamentRegistration.player_id == player_id
            ).first()
            
            if participant:
                participant.rating_after = data["rating_after"]
                participant.rating_change = data["rating_change"]
                
                # Оновити рейтинг реального гравця в таблиці players
                from app.models.player import Player
                player = db.query(Player).filter(Player.id == player_id).first()
                if player:
                    player.rating = data["rating_after"]
                    
                    # Оновити peak_rating якщо новий рейтинг вищий
                    if player.peak_rating is None or data["rating_after"] > player.peak_rating:
                        player.peak_rating = data["rating_after"]
        
        # 4. Розрахунок місць
        assign_places_to_participants(db, tournament_id)
        
        # 5. Завершення турніру
        tournament.status = TOURNAMENT_STATUS.FINISHED
        tournament.finished_at = datetime.utcnow()
        
        db.commit()
        db.refresh(tournament)
        
        return tournament
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Помилка завершення турніру: {str(e)}")

"""
Match Service - бізнес-логіка управління матчами

Відповідає за:
- Старт матчів
- Завершення матчів  
- Редагування результатів
- Оновлення сітки турніру
"""
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional
from fastapi import HTTPException, status

from app.models.match import Match, MatchStatus
from app.models.tournament import Tournament, TournamentStatus
from app.models.table import Table
from app.models.player import Player


class MatchService:
    """Сервіс для роботи з матчами"""
    
    @staticmethod
    def start_match(
        db: Session,
        match_id: int,
        table_id: int,
        video_url: Optional[str] = None
    ) -> Match:
        """
        Запуск матчу
        
        Перевірки:
        - турнір має статус IN_PROGRESS
        - матч має статус PENDING
        - стіл існує і is_occupied = false
        
        Дії:
        - match.status = IN_PROGRESS
        - match.table_id = table_id
        - match.video_url = video_url
        - match.started_at = now
        - table.is_occupied = true
        """
        # Отримати матч
        match = db.query(Match).filter(Match.id == match_id).first()
        if not match:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Матч не знайдено"
            )
        
        # Перевірка статусу матчу
        if match.status != MatchStatus.PENDING.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Матч не може бути запущений. Поточний статус: {match.status}"
            )
        
        # Перевірка турніру
        if match.tournament_id:
            tournament = db.query(Tournament).filter(Tournament.id == match.tournament_id).first()
            if not tournament:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Турнір не знайдено"
                )
            
            if tournament.status != TournamentStatus.IN_PROGRESS.value:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Турнір має статус '{tournament.status}', а не 'in_progress'"
                )
        
        # Перевірка столу
        table = db.query(Table).filter(Table.id == table_id).first()
        if not table:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Стіл не знайдено"
            )
        
        if not table.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Стіл неактивний"
            )
        
        if table.is_occupied:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Стіл вже зайнятий"
            )
        
        # Оновлення матчу
        match.status = MatchStatus.IN_PROGRESS.value
        match.table_id = table_id
        match.video_url = video_url
        match.started_at = datetime.utcnow()
        
        # Зайняти стіл
        table.is_occupied = True
        
        db.commit()
        db.refresh(match)
        
        return match
    
    @staticmethod
    def finish_match(
        db: Session,
        match_id: int,
        score_player1: int,
        score_player2: int
    ) -> Match:
        """
        Завершення матчу
        
        Перевірки:
        - матч має статус IN_PROGRESS
        - результат валідний
        
        Дії:
        - визначити переможця
        - match.status = FINISHED
        - match.finished_at = now
        - match.winner_id
        - звільнити стіл
        - оновити наступний матч
        """
        # Отримати матч
        match = db.query(Match).filter(Match.id == match_id).first()
        if not match:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Матч не знайдено"
            )
        
        # Перевірка статусу
        if match.status != MatchStatus.IN_PROGRESS.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Матч не в процесі гри. Поточний статус: {match.status}"
            )
        
        # Валідація результату
        if score_player1 < 0 or score_player2 < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Рахунок не може бути від'ємним"
            )
        
        if score_player1 == score_player2:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Рахунок не може бути рівним - має бути переможець"
            )
        
        # Визначити переможця
        if score_player1 > score_player2:
            winner_id = match.player1_id
        else:
            winner_id = match.player2_id
        
        # Оновлення матчу
        match.player1_score = score_player1
        match.player2_score = score_player2
        match.winner_id = winner_id
        match.status = MatchStatus.FINISHED.value
        match.finished_at = datetime.utcnow()
        
        # Звільнити стіл
        if match.table_id:
            table = db.query(Table).filter(Table.id == match.table_id).first()
            if table:
                table.is_occupied = False
        
        # Оновити наступний матч (якщо є)
        if match.next_match_id and winner_id:
            next_match = db.query(Match).filter(Match.id == match.next_match_id).first()
            if next_match:
                # Визначити в яку позицію іде переможець
                if match.position_in_next == 1:
                    next_match.player1_id = winner_id
                    next_match.player1_name = match.player1_name if winner_id == match.player1_id else match.player2_name
                elif match.position_in_next == 2:
                    next_match.player2_id = winner_id
                    next_match.player2_name = match.player1_name if winner_id == match.player1_id else match.player2_name
        
        db.commit()
        db.refresh(match)
        
        return match
    
    @staticmethod
    def edit_match_result(
        db: Session,
        match_id: int,
        new_score_p1: int,
        new_score_p2: int
    ) -> Match:
        """
        Редагування результату матчу
        
        УВАГА: Це критична операція!
        - Rollback усіх наступних матчів
        - Скидання їх у PENDING
        - Оновлення переможця
        - Перегенерація залежних матчів
        """
        # Отримати матч
        match = db.query(Match).filter(Match.id == match_id).first()
        if not match:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Матч не знайдено"
            )
        
        # Перевірка що матч завершений
        if match.status != MatchStatus.FINISHED.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Можна редагувати тільки завершені матчі"
            )
        
        # Валідація нового результату
        if new_score_p1 < 0 or new_score_p2 < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Рахунок не може бути від'ємним"
            )
        
        if new_score_p1 == new_score_p2:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Рахунок не може бути рівним"
            )
        
        # Визначити нового переможця
        if new_score_p1 > new_score_p2:
            new_winner_id = match.player1_id
        else:
            new_winner_id = match.player2_id
        
        old_winner_id = match.winner_id
        
        # Якщо переможець змінився - треба rollback наступних матчів
        if new_winner_id != old_winner_id and match.next_match_id:
            MatchService._rollback_dependent_matches(db, match.next_match_id)
        
        # Оновити результат
        match.player1_score = new_score_p1
        match.player2_score = new_score_p2
        match.winner_id = new_winner_id
        
        # Оновити наступний матч з новим переможцем
        if match.next_match_id and new_winner_id:
            next_match = db.query(Match).filter(Match.id == match.next_match_id).first()
            if next_match:
                winner_name = match.player1_name if new_winner_id == match.player1_id else match.player2_name
                
                if match.position_in_next == 1:
                    next_match.player1_id = new_winner_id
                    next_match.player1_name = winner_name
                elif match.position_in_next == 2:
                    next_match.player2_id = new_winner_id
                    next_match.player2_name = winner_name
        
        db.commit()
        db.refresh(match)
        
        return match
    
    @staticmethod
    def _rollback_dependent_matches(db: Session, match_id: int):
        """
        Рекурсивно скидає всі залежні матчі у PENDING
        """
        match = db.query(Match).filter(Match.id == match_id).first()
        if not match:
            return
        
        # Скинути поточний матч
        match.status = MatchStatus.PENDING.value
        match.winner_id = None
        match.player1_score = 0
        match.player2_score = 0
        match.started_at = None
        match.finished_at = None
        match.table_id = None
        match.video_url = None
        
        # Якщо є наступний матч - скинути і його
        if match.next_match_id:
            MatchService._rollback_dependent_matches(db, match.next_match_id)

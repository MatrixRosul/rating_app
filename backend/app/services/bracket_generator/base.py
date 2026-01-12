"""
Base Bracket Generator Interface - PHASE 5
Universal interface for all bracket types
"""
from abc import ABC, abstractmethod
from typing import List, Dict, Any
from sqlalchemy.orm import Session


class BracketGenerator(ABC):
    """
    Abstract base class for all bracket generators
    
    Unified interface that all bracket types (Single, Double, Group Stage) must implement
    Returns standardized List[Dict] that can be directly inserted as Match objects
    """
    
    def __init__(self, db: Session, tournament_id: int):
        """
        Initialize bracket generator
        
        Args:
            db: Database session
            tournament_id: Tournament ID
        """
        self.db = db
        self.tournament_id = tournament_id
    
    @abstractmethod
    def generate(self, participant_ids: List[int], **kwargs) -> List[Dict[str, Any]]:
        """
        Generate bracket matches
        
        Args:
            participant_ids: List of player IDs (ordered by seed/rating)
            **kwargs: Additional parameters (e.g., num_groups, advance_count, etc.)
        
        Returns:
            List of match dictionaries ready for DB insertion with fields:
            - tournament_id: int
            - round_name: str (e.g., "WB-QF", "LB-R1", "Group A")
            - position_in_round: int
            - player1_id: Optional[int] (None for BYE)
            - player2_id: Optional[int] (None for BYE)
            - next_match_winner_id: Optional[int] (where winner goes)
            - next_match_loser_id: Optional[int] (where loser goes, for Double Elim)
            - position_in_next: Optional[int] (1 or 2)
            - position_in_loser_match: Optional[int] (1 or 2, for Double Elim)
            - table_number: Optional[int]
        """
        pass
    
    @abstractmethod
    def validate_participant_count(self, count: int) -> bool:
        """
        Validate if participant count is acceptable for this bracket type
        
        Args:
            count: Number of participants
        
        Returns:
            True if valid, False otherwise
        """
        pass
    
    def _get_bracket_type_name(self) -> str:
        """
        Get human-readable bracket type name
        
        Returns:
            Bracket type name (e.g., "Single Elimination", "Double Elimination")
        """
        return self.__class__.__name__.replace("Generator", "").replace("_", " ").title()

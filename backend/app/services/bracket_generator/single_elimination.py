"""
Single Elimination Bracket Generator - PHASE 5
Refactored from bracket_generator.py to use new universal interface
"""
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
import math

from .base import BracketGenerator


class SingleEliminationGenerator(BracketGenerator):
    """
    Single Elimination bracket generator
    Classic tournament bracket where losers are eliminated
    """
    
    def validate_participant_count(self, count: int) -> bool:
        """Single Elimination works with any count >= 2"""
        return count >= 2
    
    def generate(self, participant_ids: List[int], **kwargs) -> List[Dict[str, Any]]:
        """
        Generate Single Elimination bracket
        
        Args:
            participant_ids: List of player IDs ordered by seed (best to worst)
            **kwargs: Ignored for Single Elimination
        
        Returns:
            List of match dictionaries
        """
        if not self.validate_participant_count(len(participant_ids)):
            raise ValueError("Single Elimination requires at least 2 participants")
        
        # Calculate bracket size (next power of 2)
        bracket_size = self._get_next_power_of_two(len(participant_ids))
        num_byes = bracket_size - len(participant_ids)
        num_rounds = int(math.log2(bracket_size))
        
        # Generate seeding order for first round
        seeding_pairs = self._generate_seeding_order(bracket_size)
        
        # Create all matches
        matches = []
        match_id_counter = 1
        
        # Track match IDs by round and position for linking
        match_map: Dict[Tuple[int, int], int] = {}  # (round, position) -> match_id
        
        # Generate all rounds
        for round_num in range(1, num_rounds + 1):
            round_name = self._get_round_name(bracket_size, round_num)
            matches_in_round = bracket_size // (2 ** round_num)
            
            for position in range(matches_in_round):
                match_id = match_id_counter
                match_id_counter += 1
                
                # Store match ID in map
                match_map[(round_num, position)] = match_id
                
                # Determine players for first round
                player1_id = None
                player2_id = None
                
                if round_num == 1:
                    # First round - use seeding
                    seed_pair = seeding_pairs[position]
                    seed1, seed2 = seed_pair
                    
                    # Map seed to player (1-indexed to 0-indexed)
                    player1_id = participant_ids[seed1 - 1] if seed1 <= len(participant_ids) else None
                    player2_id = participant_ids[seed2 - 1] if seed2 <= len(participant_ids) else None
                
                # Determine next match
                next_match_winner_id = None
                position_in_next = None
                
                if round_num < num_rounds:
                    # Not final - link to next round
                    next_round = round_num + 1
                    next_position = position // 2
                    next_match_winner_id = match_map.get((next_round, next_position))
                    position_in_next = 1 if position % 2 == 0 else 2
                    
                    # If next match doesn't exist yet, we'll update it later
                    # For now, calculate the ID it will have
                    if next_match_winner_id is None:
                        # Calculate future match ID
                        matches_before = sum(bracket_size // (2 ** r) for r in range(1, next_round))
                        next_match_winner_id = matches_before + next_position + 1
                
                match_dict = {
                    "id": match_id,
                    "tournament_id": self.tournament_id,
                    "round": round_name,
                    "position_in_round": position + 1,
                    "player1_id": player1_id,
                    "player2_id": player2_id,
                    "next_match_winner_id": next_match_winner_id,
                    "next_match_loser_id": None,  # No loser bracket in Single Elim
                    "position_in_next": position_in_next,
                    "position_in_loser_match": None,
                    "table_number": None,
                }
                
                matches.append(match_dict)
        
        return matches
    
    @staticmethod
    def _get_next_power_of_two(n: int) -> int:
        """Return next power of 2 greater than or equal to n"""
        return 2 ** math.ceil(math.log2(n))
    
    @staticmethod
    def _get_round_name(bracket_size: int, round_number: int) -> str:
        """
        Get round name based on matches remaining
        
        Args:
            bracket_size: Total bracket size (8, 16, 32, etc.)
            round_number: Current round (1 = first, 2 = second, etc.)
        
        Returns:
            Round name: "R64", "R32", "R16", "QF", "SF", "F"
        """
        matches_in_round = bracket_size // (2 ** round_number)
        
        if matches_in_round == 1:
            return "F"
        elif matches_in_round == 2:
            return "SF"
        elif matches_in_round == 4:
            return "QF"
        elif matches_in_round == 8:
            return "R16"
        elif matches_in_round == 16:
            return "R32"
        elif matches_in_round == 32:
            return "R64"
        else:
            return f"R{matches_in_round * 2}"
    
    @staticmethod
    def _generate_seeding_order(bracket_size: int) -> List[Tuple[int, int]]:
        """
        Generate standard seeding pairs for first round
        
        Args:
            bracket_size: Size of bracket (must be power of 2)
        
        Returns:
            List of (seed1, seed2) tuples
            Example for 8: [(1,8), (4,5), (2,7), (3,6)]
        """
        seeds = list(range(1, bracket_size + 1))
        pairs = []
        
        while len(seeds) > 0:
            # Take first and last seed
            seed1 = seeds.pop(0)
            seed2 = seeds.pop(-1) if seeds else None
            
            if seed2:
                # Reorder so stronger seeds play first
                if len(pairs) % 2 == 1:
                    pairs.append((seed2, seed1))
                else:
                    pairs.append((seed1, seed2))
            else:
                pairs.append((seed1, seed1))
        
        return pairs

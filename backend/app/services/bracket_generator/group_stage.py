"""
Group Stage Bracket Generator - PHASE 5
Round-robin groups + Playoff bracket for top finishers

Structure:
1. Group Stage: Multiple groups (A, B, C, D) play round-robin
2. Each player plays everyone in their group once
3. Top N from each group advance to playoff bracket
4. Playoff bracket is Single Elimination

Example: 4 groups of 4 → top 2 from each → 8-player playoff
"""
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
import math

from .base import BracketGenerator


class GroupStageGenerator(BracketGenerator):
    """
    Group Stage + Playoff bracket generator
    Round-robin groups followed by elimination playoff
    """
    
    def validate_participant_count(self, count: int) -> bool:
        """Group Stage needs at least 6 players (2 groups of 3)"""
        return count >= 6
    
    def generate(self, participant_ids: List[int], **kwargs) -> List[Dict[str, Any]]:
        """
        Generate Group Stage + Playoff bracket
        
        Args:
            participant_ids: List of player IDs ordered by seed
            **kwargs:
                - num_groups: int (default 4) - number of groups
                - advance_per_group: int (default 2) - how many advance from each group
        
        Returns:
            List of match dictionaries (groups + playoff)
        """
        if not self.validate_participant_count(len(participant_ids)):
            raise ValueError("Group Stage requires at least 6 participants")
        
        num_groups = kwargs.get("num_groups", 4)
        advance_per_group = kwargs.get("advance_per_group", 2)
        
        # Validate configuration
        if num_groups < 2:
            raise ValueError("Need at least 2 groups")
        
        players_per_group = len(participant_ids) // num_groups
        if players_per_group < 2:
            raise ValueError(f"Not enough players for {num_groups} groups")
        
        # Distribute players into groups (snake seeding)
        groups = self._distribute_into_groups(participant_ids, num_groups)
        
        matches = []
        match_id_counter = 1
        
        # ========== GROUP STAGE ==========
        group_names = ["A", "B", "C", "D", "E", "F", "G", "H"]
        
        for group_idx, group_players in enumerate(groups):
            if group_idx >= len(group_names):
                group_name = f"Group {group_idx + 1}"
            else:
                group_name = f"Group {group_names[group_idx]}"
            
            # Generate round-robin matches for this group
            group_matches = self._generate_round_robin(
                group_players,
                group_name,
                self.tournament_id,
                match_id_counter
            )
            
            matches.extend(group_matches)
            match_id_counter += len(group_matches)
        
        # ========== PLAYOFF BRACKET ==========
        # Number of playoff participants
        num_playoff_participants = num_groups * advance_per_group
        
        # Create placeholder playoff bracket (Single Elimination style)
        playoff_bracket_size = self._get_next_power_of_two(num_playoff_participants)
        num_playoff_rounds = int(math.log2(playoff_bracket_size))
        
        # Generate playoff bracket structure (players TBD after group stage)
        playoff_matches = []
        playoff_match_map: Dict[Tuple[int, int], int] = {}
        
        for round_num in range(1, num_playoff_rounds + 1):
            round_name = f"Playoff {self._get_playoff_round_name(playoff_bracket_size, round_num)}"
            matches_in_round = playoff_bracket_size // (2 ** round_num)
            
            for position in range(matches_in_round):
                match_id = match_id_counter
                match_id_counter += 1
                
                playoff_match_map[(round_num, position)] = match_id
                
                # Determine next match
                next_match_winner_id = None
                position_in_next = None
                
                if round_num < num_playoff_rounds:
                    next_round = round_num + 1
                    next_position = position // 2
                    matches_before_next = 0
                    for r in range(1, next_round):
                        matches_before_next += playoff_bracket_size // (2 ** r)
                    next_match_winner_id = len(matches) + matches_before_next + next_position + 1
                    position_in_next = 1 if position % 2 == 0 else 2
                
                playoff_match = {
                    "id": match_id,
                    "tournament_id": self.tournament_id,
                    "round": round_name,
                    "position_in_round": position + 1,
                    "player1_id": None,  # TBD after group stage
                    "player2_id": None,  # TBD after group stage
                    "next_match_winner_id": next_match_winner_id,
                    "next_match_loser_id": None,
                    "position_in_next": position_in_next,
                    "position_in_loser_match": None,
                    "table_number": None,
                }
                
                playoff_matches.append(playoff_match)
        
        matches.extend(playoff_matches)
        
        return matches
    
    def _distribute_into_groups(self, participant_ids: List[int], num_groups: int) -> List[List[int]]:
        """
        Distribute players into groups using snake seeding
        
        Example with 8 players, 4 groups:
        Group A: [1, 8]
        Group B: [2, 7]
        Group C: [3, 6]
        Group D: [4, 5]
        """
        groups = [[] for _ in range(num_groups)]
        
        for idx, player_id in enumerate(participant_ids):
            # Snake pattern: 0,1,2,3,3,2,1,0,0,1,2,3...
            round_num = idx // num_groups
            pos_in_round = idx % num_groups
            
            if round_num % 2 == 0:
                # Forward: 0,1,2,3
                group_idx = pos_in_round
            else:
                # Backward: 3,2,1,0
                group_idx = num_groups - 1 - pos_in_round
            
            groups[group_idx].append(player_id)
        
        return groups
    
    def _generate_round_robin(
        self, 
        player_ids: List[int], 
        group_name: str, 
        tournament_id: int,
        start_match_id: int
    ) -> List[Dict[str, Any]]:
        """
        Generate round-robin matches for a group
        Every player plays every other player once
        """
        matches = []
        match_id = start_match_id
        match_position = 1
        
        # Generate all pairings
        for i in range(len(player_ids)):
            for j in range(i + 1, len(player_ids)):
                match_dict = {
                    "id": match_id,
                    "tournament_id": tournament_id,
                    "round": group_name,
                    "position_in_round": match_position,
                    "player1_id": player_ids[i],
                    "player2_id": player_ids[j],
                    "next_match_winner_id": None,  # Group stage doesn't auto-advance
                    "next_match_loser_id": None,
                    "position_in_next": None,
                    "position_in_loser_match": None,
                    "table_number": None,
                }
                
                matches.append(match_dict)
                match_id += 1
                match_position += 1
        
        return matches
    
    @staticmethod
    def _get_next_power_of_two(n: int) -> int:
        """Return next power of 2"""
        return 2 ** math.ceil(math.log2(n))
    
    @staticmethod
    def _get_playoff_round_name(bracket_size: int, round_number: int) -> str:
        """Get playoff round name (R16, QF, SF, F)"""
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
        else:
            return f"R{matches_in_round * 2}"

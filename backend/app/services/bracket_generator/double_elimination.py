"""
Double Elimination Bracket Generator - PHASE 5
Upper Bracket (Winners) + Lower Bracket (Losers) + Grand Final

Structure from tournamentservice.net:
- Upper Bracket: WB-R32 → WB-R16 → WB-QF → WB-SF → WB-F
- Lower Bracket: LB-R1 → LB-R2 → LB-R3 → LB-R4 → LB-QF → LB-SF → LB-F
- Grand Final: GF (+ optional GF-RESET if LB winner wins)

Key concepts:
- Winners in WB advance in WB
- Losers in WB drop to specific LB positions
- Winners in LB advance in LB
- Losers in LB are eliminated
- WB-F winner → GF as Player 1
- LB-F winner → GF as Player 2
- If GF Player 2 wins → GF-RESET (both start 0-0 again)
"""
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
import math

from .base import BracketGenerator


class DoubleEliminationGenerator(BracketGenerator):
    """
    Double Elimination bracket generator
    Players get a second chance via Lower Bracket
    """
    
    def validate_participant_count(self, count: int) -> bool:
        """Double Elimination works with any count >= 3 (minimum for meaningful bracket)"""
        return count >= 3
    
    def generate(self, participant_ids: List[int], **kwargs) -> List[Dict[str, Any]]:
        """
        Generate Double Elimination bracket
        
        Args:
            participant_ids: List of player IDs ordered by seed (best to worst)
            **kwargs: 
                - include_grand_final_reset: bool (default True) - whether to include GF-RESET match
        
        Returns:
            List of match dictionaries for both brackets + Grand Final
        """
        if not self.validate_participant_count(len(participant_ids)):
            raise ValueError("Double Elimination requires at least 3 participants")
        
        include_gf_reset = kwargs.get("include_grand_final_reset", True)
        
        # Calculate bracket size (next power of 2)
        bracket_size = self._get_next_power_of_two(len(participant_ids))
        num_rounds_upper = int(math.log2(bracket_size))
        
        matches = []
        match_id_counter = 1
        
        # Track match IDs for linking
        upper_bracket_map: Dict[Tuple[int, int], int] = {}  # (round, position) -> match_id
        lower_bracket_map: Dict[Tuple[int, int], int] = {}  # (round, position) -> match_id
        
        # Generate seeding order for first round
        seeding_pairs = self._generate_seeding_order(bracket_size)
        
        # ========== UPPER BRACKET ==========
        for round_num in range(1, num_rounds_upper + 1):
            round_name = self._get_upper_round_name(bracket_size, round_num)
            matches_in_round = bracket_size // (2 ** round_num)
            
            for position in range(matches_in_round):
                match_id = match_id_counter
                match_id_counter += 1
                
                upper_bracket_map[(round_num, position)] = match_id
                
                # First round only - assign players
                player1_id = None
                player2_id = None
                
                if round_num == 1:
                    seed_pair = seeding_pairs[position]
                    seed1, seed2 = seed_pair
                    player1_id = participant_ids[seed1 - 1] if seed1 <= len(participant_ids) else None
                    player2_id = participant_ids[seed2 - 1] if seed2 <= len(participant_ids) else None
                
                # Determine next match for WINNER
                next_match_winner_id = None
                position_in_next = None
                
                if round_num < num_rounds_upper:
                    # Not WB-F - advance in upper bracket
                    next_round = round_num + 1
                    next_position = position // 2
                    # Calculate future match ID
                    matches_before_next_round = sum(bracket_size // (2 ** r) for r in range(1, next_round))
                    next_match_winner_id = matches_before_next_round + next_position + 1
                    position_in_next = 1 if position % 2 == 0 else 2
                else:
                    # WB-F winner goes to Grand Final (will be created later)
                    next_match_winner_id = None  # Will set after creating all brackets
                    position_in_next = 1  # WB winner is always Player 1 in GF
                
                # Determine next match for LOSER (drops to Lower Bracket)
                next_match_loser_id = None
                position_in_loser_match = None
                
                if round_num == 1:
                    # First round losers → LB-R1 (first round of lower bracket)
                    lb_position = position
                    # LB-R1 match ID will be after all upper bracket matches
                    matches_in_upper = sum(bracket_size // (2 ** r) for r in range(1, num_rounds_upper + 1))
                    next_match_loser_id = matches_in_upper + lb_position + 1
                    position_in_loser_match = 1  # First round losers go to position 1 in LB
                else:
                    # Later round losers drop to corresponding LB round
                    # Complex mapping - will be calculated in LB generation
                    pass
                
                match_dict = {
                    "id": match_id,
                    "tournament_id": self.tournament_id,
                    "round": round_name,
                    "position_in_round": position + 1,
                    "player1_id": player1_id,
                    "player2_id": player2_id,
                    "next_match_winner_id": next_match_winner_id,
                    "next_match_loser_id": next_match_loser_id,
                    "position_in_next": position_in_next,
                    "position_in_loser_match": position_in_loser_match,
                    "table_number": None,
                }
                
                matches.append(match_dict)
        
        # ========== LOWER BRACKET ==========
        # Lower bracket has 2 * (num_rounds_upper - 1) rounds
        # Because it alternates: drop-in rounds + advancement rounds
        num_rounds_lower = 2 * (num_rounds_upper - 1)
        
        matches_in_upper_total = len(matches)
        
        for lb_round_num in range(1, num_rounds_lower + 1):
            round_name = self._get_lower_round_name(bracket_size, lb_round_num)
            
            # LB alternates between drop-in rounds (same # matches) and elimination rounds (half)
            if lb_round_num % 2 == 1:
                # Odd rounds: drop-in from upper bracket
                matches_in_lb_round = bracket_size // (2 ** ((lb_round_num + 1) // 2 + 1))
            else:
                # Even rounds: elimination within lower bracket
                matches_in_lb_round = bracket_size // (2 ** (lb_round_num // 2 + 2))
            
            for position in range(matches_in_lb_round):
                match_id = match_id_counter
                match_id_counter += 1
                
                lower_bracket_map[(lb_round_num, position)] = match_id
                
                # Players come from upper bracket losers or previous LB round
                player1_id = None
                player2_id = None
                
                # Determine next match for WINNER
                next_match_winner_id = None
                position_in_next = None
                
                if lb_round_num < num_rounds_lower:
                    # Not LB-F - advance in lower bracket
                    next_lb_round = lb_round_num + 1
                    next_position = position // 2
                    # Calculate future match ID
                    matches_in_lb_before = matches_in_upper_total
                    for r in range(1, next_lb_round):
                        if r % 2 == 1:
                            matches_in_lb_before += bracket_size // (2 ** ((r + 1) // 2 + 1))
                        else:
                            matches_in_lb_before += bracket_size // (2 ** (r // 2 + 2))
                    next_match_winner_id = matches_in_lb_before + next_position + 1
                    position_in_next = 1 if position % 2 == 0 else 2
                else:
                    # LB-F winner goes to Grand Final
                    next_match_winner_id = None  # Will set later
                    position_in_next = 2  # LB winner is always Player 2 in GF
                
                # LOSER in Lower Bracket = ELIMINATED
                next_match_loser_id = None
                position_in_loser_match = None
                
                match_dict = {
                    "id": match_id,
                    "tournament_id": self.tournament_id,
                    "round": round_name,
                    "position_in_round": position + 1,
                    "player1_id": player1_id,
                    "player2_id": player2_id,
                    "next_match_winner_id": next_match_winner_id,
                    "next_match_loser_id": next_match_loser_id,
                    "position_in_next": position_in_next,
                    "position_in_loser_match": position_in_loser_match,
                    "table_number": None,
                }
                
                matches.append(match_dict)
        
        # ========== GRAND FINAL ==========
        gf_id = match_id_counter
        match_id_counter += 1
        
        gf_match = {
            "id": gf_id,
            "tournament_id": self.tournament_id,
            "round": "GF",
            "position_in_round": 1,
            "player1_id": None,  # Comes from WB-F winner
            "player2_id": None,  # Comes from LB-F winner
            "next_match_winner_id": None,  # Tournament ends here (or GF-RESET)
            "next_match_loser_id": None,
            "position_in_next": None,
            "position_in_loser_match": None,
            "table_number": None,
        }
        
        matches.append(gf_match)
        
        # Update WB-F and LB-F to point to GF
        wb_final_match = matches[upper_bracket_map[(num_rounds_upper, 0)] - 1]
        wb_final_match["next_match_winner_id"] = gf_id
        
        lb_final_round_matches = [m for m in matches if m["round"] == self._get_lower_round_name(bracket_size, num_rounds_lower)]
        if lb_final_round_matches:
            lb_final_round_matches[0]["next_match_winner_id"] = gf_id
        
        # ========== GRAND FINAL RESET (optional) ==========
        if include_gf_reset:
            gf_reset_id = match_id_counter
            match_id_counter += 1
            
            gf_reset_match = {
                "id": gf_reset_id,
                "tournament_id": self.tournament_id,
                "round": "GF-RESET",
                "position_in_round": 1,
                "player1_id": None,  # Same as GF
                "player2_id": None,  # Same as GF
                "next_match_winner_id": None,  # Tournament truly ends here
                "next_match_loser_id": None,
                "position_in_next": None,
                "position_in_loser_match": None,
                "table_number": None,
            }
            
            matches.append(gf_reset_match)
            
            # Note: GF doesn't auto-link to GF-RESET
            # GF-RESET is only played if Player 2 (LB winner) wins GF
            # This will be handled by match completion logic
        
        # Link Upper Bracket losers to Lower Bracket properly
        self._link_upper_to_lower(matches, upper_bracket_map, lower_bracket_map, bracket_size, num_rounds_upper)
        
        return matches
    
    def _link_upper_to_lower(
        self, 
        matches: List[Dict[str, Any]], 
        upper_map: Dict[Tuple[int, int], int],
        lower_map: Dict[Tuple[int, int], int],
        bracket_size: int,
        num_rounds_upper: int
    ):
        """
        Link Upper Bracket match losers to correct Lower Bracket positions
        
        Mapping rules (from tournamentservice.net):
        - WB-R1 losers → LB-R1 (already done in generation)
        - WB-R2 losers → LB-R2 (merge with LB-R1 winners)
        - WB-QF losers → LB-R4 (merge with LB-R3 winners)
        - WB-SF losers → LB-SF (merge with LB-QF winners)
        """
        for round_num in range(2, num_rounds_upper):
            # Upper bracket losers from round N drop into lower bracket
            # The exact LB round depends on tournament size and round number
            
            matches_in_wb_round = bracket_size // (2 ** round_num)
            
            for position in range(matches_in_wb_round):
                wb_match_id = upper_map[(round_num, position)]
                wb_match = matches[wb_match_id - 1]
                
                # Calculate which LB round these losers go to
                # Formula: LB round = 2 * (WB round - 1)
                target_lb_round = 2 * round_num - 2
                
                # Position in LB round
                lb_position = position
                
                if target_lb_round in [r for r in range(1, 2 * (num_rounds_upper - 1) + 1)]:
                    lb_match_id = lower_map.get((target_lb_round, lb_position))
                    
                    if lb_match_id:
                        wb_match["next_match_loser_id"] = lb_match_id
                        wb_match["position_in_loser_match"] = 2  # Losers typically go to position 2
    
    @staticmethod
    def _get_next_power_of_two(n: int) -> int:
        """Return next power of 2 greater than or equal to n"""
        return 2 ** math.ceil(math.log2(n))
    
    @staticmethod
    def _get_upper_round_name(bracket_size: int, round_number: int) -> str:
        """
        Get Upper Bracket round name
        
        Returns: "WB-R32", "WB-R16", "WB-QF", "WB-SF", "WB-F"
        """
        matches_in_round = bracket_size // (2 ** round_number)
        
        if matches_in_round == 1:
            return "WB-F"
        elif matches_in_round == 2:
            return "WB-SF"
        elif matches_in_round == 4:
            return "WB-QF"
        elif matches_in_round == 8:
            return "WB-R16"
        elif matches_in_round == 16:
            return "WB-R32"
        elif matches_in_round == 32:
            return "WB-R64"
        else:
            return f"WB-R{matches_in_round * 2}"
    
    @staticmethod
    def _get_lower_round_name(bracket_size: int, lb_round_number: int) -> str:
        """
        Get Lower Bracket round name
        
        Returns: "LB-R1", "LB-R2", ..., "LB-QF", "LB-SF", "LB-F"
        """
        # Calculate total LB rounds
        num_rounds_upper = int(math.log2(bracket_size))
        num_rounds_lower = 2 * (num_rounds_upper - 1)
        
        # Last 3 rounds have special names
        if lb_round_number == num_rounds_lower:
            return "LB-F"
        elif lb_round_number == num_rounds_lower - 1:
            return "LB-SF"
        elif lb_round_number == num_rounds_lower - 2:
            return "LB-QF"
        else:
            return f"LB-R{lb_round_number}"
    
    @staticmethod
    def _generate_seeding_order(bracket_size: int) -> List[Tuple[int, int]]:
        """
        Generate standard seeding pairs for first round
        Same as Single Elimination
        """
        seeds = list(range(1, bracket_size + 1))
        pairs = []
        
        while len(seeds) > 0:
            seed1 = seeds.pop(0)
            seed2 = seeds.pop(-1) if seeds else None
            
            if seed2:
                if len(pairs) % 2 == 1:
                    pairs.append((seed2, seed1))
                else:
                    pairs.append((seed1, seed2))
            else:
                pairs.append((seed1, seed1))
        
        return pairs

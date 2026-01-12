"""
Billiard Double Elimination Bracket Generator
Format: N-M (e.g., 16-8, 32-8, 24-8)

Based on tournamentservice.net format:
- Перший тур: All players compete, winners go to Олімпійка (Upper), losers to Нижня сітка
- Олімпійка (Upper Bracket): QF → SF → Final
- Нижня сітка: Multiple rounds where losers from Upper meet winners from Lower
- Players eliminated from Lower bracket = final placement

Example 16-8 structure:
  ПЕРШИЙ ТУР (#1-#8): 16 → 8 winners to Олімпійка, 8 losers to Lower R1
  
  ОЛІМПІЙКА:
    #9-#12: 1/4 фіналу (QF) - 8 players → 4
    #25-#26: Півфінал (SF) - 4 players → 2
    #27: Фінал - 2 players → 1 winner
  
  НИЖНЯ СІТКА:
    #13-#16: Lower R1 (losers from #1-#8 play each other) → Місце 13-16
    #17-#20: Lower R2 (winners #13-#16 vs losers from QF #9-#12) → Місце 9-12
    #21-#24: Lower R3 (winners #17-#20 vs losers from SF) → Місце 5-8
"""
from typing import List, Dict, Any, Tuple, Optional
from sqlalchemy.orm import Session
import math

from .base import BracketGenerator


class BilliardDoubleEliminationGenerator(BracketGenerator):
    """
    Billiard-style Double Elimination bracket generator
    Format: N players start, M go to Olympic bracket (Upper)
    
    Key differences from standard Double Elimination:
    - First round is separate (everyone plays)
    - Winners go to Upper bracket (Олімпійка)
    - Losers go to Lower bracket where they can still fight for placement
    - No Grand Final Reset - just regular Final
    """
    
    def validate_participant_count(self, count: int) -> bool:
        """Works with 8+ participants"""
        return count >= 8
    
    def generate(self, participant_ids: List[int], **kwargs) -> List[Dict[str, Any]]:
        """
        Generate Billiard Double Elimination bracket
        
        Args:
            participant_ids: List of player IDs ordered by seed (best to worst)
            **kwargs:
                - olympic_size: int (default: half of bracket_size) - how many go to Upper
        
        Returns:
            List of match dictionaries
        """
        num_players = len(participant_ids)
        if not self.validate_participant_count(num_players):
            raise ValueError("Billiard Double Elimination requires at least 8 participants")
        
        # Calculate bracket size (next power of 2)
        bracket_size = self._get_next_power_of_two(num_players)
        olympic_size = kwargs.get("olympic_size", bracket_size // 2)
        
        matches = []
        match_id_counter = 1
        
        # Track matches for linking
        first_round_matches: Dict[int, int] = {}  # position -> match_id
        qf_matches: Dict[int, int] = {}  # position -> match_id
        sf_matches: Dict[int, int] = {}  # position -> match_id
        lower_r1_matches: Dict[int, int] = {}
        lower_r2_matches: Dict[int, int] = {}
        lower_r3_matches: Dict[int, int] = {}
        
        # Generate seeding pairs for first round
        seeding_pairs = self._generate_seeding_order(bracket_size)
        
        # ========== ПЕРШИЙ ТУР (#1-#8 for 16 players) ==========
        first_round_count = bracket_size // 2  # 8 matches for 16 players
        
        for position in range(first_round_count):
            match_id = match_id_counter
            match_id_counter += 1
            first_round_matches[position] = match_id
            
            # Get seeded players
            seed_pair = seeding_pairs[position]
            seed1, seed2 = seed_pair
            player1_id = participant_ids[seed1 - 1] if seed1 <= num_players else None
            player2_id = participant_ids[seed2 - 1] if seed2 <= num_players else None
            
            match_dict = {
                "id": match_id,
                "tournament_id": self.tournament_id,
                "round": "R1",  # Перший тур
                "position_in_round": position + 1,
                "player1_id": player1_id,
                "player2_id": player2_id,
                "next_match_winner_id": None,  # Will be set later
                "next_match_loser_id": None,   # Will be set later
                "position_in_next": None,
                "position_in_loser_match": None,
                "table_number": None,
            }
            matches.append(match_dict)
        
        # ========== ОЛІМПІЙКА: 1/4 фіналу (QF) ==========
        qf_count = olympic_size // 2  # 4 matches for 8 in olympic
        
        for position in range(qf_count):
            match_id = match_id_counter
            match_id_counter += 1
            qf_matches[position] = match_id
            
            match_dict = {
                "id": match_id,
                "tournament_id": self.tournament_id,
                "round": "QF",  # 1/4 фіналу
                "position_in_round": position + 1,
                "player1_id": None,
                "player2_id": None,
                "next_match_winner_id": None,
                "next_match_loser_id": None,
                "position_in_next": None,
                "position_in_loser_match": None,
                "table_number": None,
            }
            matches.append(match_dict)
        
        # ========== НИЖНЯ СІТКА: Lower R1 (losers from R1) ==========
        lower_r1_count = first_round_count // 2  # 4 matches
        
        for position in range(lower_r1_count):
            match_id = match_id_counter
            match_id_counter += 1
            lower_r1_matches[position] = match_id
            
            match_dict = {
                "id": match_id,
                "tournament_id": self.tournament_id,
                "round": "LB-R1",  # Нижня сітка, тур 1
                "position_in_round": position + 1,
                "player1_id": None,
                "player2_id": None,
                "next_match_winner_id": None,
                "next_match_loser_id": None,
                "position_in_next": None,
                "position_in_loser_match": None,
                "placement": "13-16",  # Місце для тих хто тут програв
                "table_number": None,
            }
            matches.append(match_dict)
        
        # ========== НИЖНЯ СІТКА: Lower R2 (LB-R1 winners vs QF losers) ==========
        lower_r2_count = lower_r1_count  # 4 matches
        
        for position in range(lower_r2_count):
            match_id = match_id_counter
            match_id_counter += 1
            lower_r2_matches[position] = match_id
            
            match_dict = {
                "id": match_id,
                "tournament_id": self.tournament_id,
                "round": "LB-R2",  # Нижня сітка, тур 2
                "position_in_round": position + 1,
                "player1_id": None,
                "player2_id": None,
                "next_match_winner_id": None,
                "next_match_loser_id": None,
                "position_in_next": None,
                "position_in_loser_match": None,
                "placement": "9-12",  # Місце для тих хто тут програв
                "table_number": None,
            }
            matches.append(match_dict)
        
        # ========== ОЛІМПІЙКА: Півфінал (SF) ==========
        sf_count = qf_count // 2  # 2 matches
        
        for position in range(sf_count):
            match_id = match_id_counter
            match_id_counter += 1
            sf_matches[position] = match_id
            
            match_dict = {
                "id": match_id,
                "tournament_id": self.tournament_id,
                "round": "SF",  # Півфінал
                "position_in_round": position + 1,
                "player1_id": None,
                "player2_id": None,
                "next_match_winner_id": None,
                "next_match_loser_id": None,
                "position_in_next": None,
                "position_in_loser_match": None,
                "table_number": None,
            }
            matches.append(match_dict)
        
        # ========== НИЖНЯ СІТКА: Lower R3 (LB-R2 winners vs SF losers) ==========
        lower_r3_count = sf_count  # 2 matches
        
        for position in range(lower_r3_count):
            match_id = match_id_counter
            match_id_counter += 1
            lower_r3_matches[position] = match_id
            
            match_dict = {
                "id": match_id,
                "tournament_id": self.tournament_id,
                "round": "LB-R3",  # Нижня сітка, тур 3
                "position_in_round": position + 1,
                "player1_id": None,
                "player2_id": None,
                "next_match_winner_id": None,
                "next_match_loser_id": None,
                "position_in_next": None,
                "position_in_loser_match": None,
                "placement": "5-8",  # Місце для тих хто тут програв
                "table_number": None,
            }
            matches.append(match_dict)
        
        # ========== НИЖНЯ СІТКА: Lower SF (LB-R3 winners) ==========
        lower_sf_id = match_id_counter
        match_id_counter += 1
        
        lower_sf_match = {
            "id": lower_sf_id,
            "tournament_id": self.tournament_id,
            "round": "LB-SF",  # Нижня сітка півфінал
            "position_in_round": 1,
            "player1_id": None,
            "player2_id": None,
            "next_match_winner_id": None,
            "next_match_loser_id": None,
            "position_in_next": None,
            "position_in_loser_match": None,
            "placement": "3-4",  # Winner = 3rd place
            "table_number": None,
        }
        matches.append(lower_sf_match)
        
        # ========== ОЛІМПІЙКА: Фінал ==========
        final_id = match_id_counter
        match_id_counter += 1
        
        final_match = {
            "id": final_id,
            "tournament_id": self.tournament_id,
            "round": "F",  # Фінал
            "position_in_round": 1,
            "player1_id": None,
            "player2_id": None,
            "next_match_winner_id": None,
            "next_match_loser_id": None,
            "position_in_next": None,
            "position_in_loser_match": None,
            "placement": "1-2",  # Winner = 1st, Loser = 2nd
            "table_number": None,
        }
        matches.append(final_match)
        
        # ========== LINK MATCHES ==========
        self._link_matches(
            matches, 
            first_round_matches, qf_matches, sf_matches, final_id,
            lower_r1_matches, lower_r2_matches, lower_r3_matches, lower_sf_id
        )
        
        return matches
    
    def _link_matches(
        self,
        matches: List[Dict[str, Any]],
        first_round: Dict[int, int],
        qf: Dict[int, int],
        sf: Dict[int, int],
        final_id: int,
        lb_r1: Dict[int, int],
        lb_r2: Dict[int, int],
        lb_r3: Dict[int, int],
        lb_sf_id: int
    ):
        """Link all matches together"""
        
        # Helper to find match by id
        def get_match(match_id: int) -> Dict[str, Any]:
            for m in matches:
                if m["id"] == match_id:
                    return m
            return None
        
        # R1 winners → QF
        # R1 losers → LB-R1
        for pos, match_id in first_round.items():
            match = get_match(match_id)
            
            # Winners go to QF (2 R1 matches feed 1 QF match)
            qf_pos = pos // 2
            match["next_match_winner_id"] = qf[qf_pos]
            match["position_in_next"] = 1 if pos % 2 == 0 else 2
            
            # Losers go to LB-R1 (2 R1 matches feed 1 LB-R1 match)
            lb_r1_pos = pos // 2
            match["next_match_loser_id"] = lb_r1[lb_r1_pos]
            match["position_in_loser_match"] = 1 if pos % 2 == 0 else 2
        
        # QF winners → SF
        # QF losers → LB-R2
        for pos, match_id in qf.items():
            match = get_match(match_id)
            
            # Winners go to SF
            sf_pos = pos // 2
            match["next_match_winner_id"] = sf[sf_pos]
            match["position_in_next"] = 1 if pos % 2 == 0 else 2
            
            # Losers go to LB-R2 (position 2 - they meet LB-R1 winners)
            match["next_match_loser_id"] = lb_r2[pos]
            match["position_in_loser_match"] = 2
        
        # LB-R1 winners → LB-R2 (position 1)
        for pos, match_id in lb_r1.items():
            match = get_match(match_id)
            match["next_match_winner_id"] = lb_r2[pos]
            match["position_in_next"] = 1
        
        # LB-R2 winners → LB-R3 (position alternates)
        for pos, match_id in lb_r2.items():
            match = get_match(match_id)
            lb_r3_pos = pos // 2
            match["next_match_winner_id"] = lb_r3[lb_r3_pos]
            match["position_in_next"] = 1 if pos % 2 == 0 else 2  # Alternate positions
        
        # SF winners → Final
        # SF losers → LB-R3 (position 2)
        for pos, match_id in sf.items():
            match = get_match(match_id)
            
            # Winners go to Final
            match["next_match_winner_id"] = final_id
            match["position_in_next"] = 1 if pos == 0 else 2
            
            # Losers go to LB-R3
            match["next_match_loser_id"] = lb_r3[pos]
            match["position_in_loser_match"] = 2
        
        # LB-R3 winners → LB-SF
        for pos, match_id in lb_r3.items():
            match = get_match(match_id)
            match["next_match_winner_id"] = lb_sf_id
            match["position_in_next"] = 1 if pos == 0 else 2
        
        # LB-SF winner gets 3rd place (no next match)
        # Final has no next match
    
    def _get_next_power_of_two(self, n: int) -> int:
        """Get next power of 2 >= n"""
        return 2 ** math.ceil(math.log2(n))
    
    def _generate_seeding_order(self, bracket_size: int) -> List[Tuple[int, int]]:
        """
        Generate standard seeding pairs for first round
        1 vs 16, 8 vs 9, 5 vs 12, 4 vs 13, etc.
        """
        if bracket_size == 8:
            return [(1, 8), (4, 5), (3, 6), (2, 7)]
        elif bracket_size == 16:
            return [
                (1, 16), (8, 9), (5, 12), (4, 13),
                (3, 14), (6, 11), (7, 10), (2, 15)
            ]
        elif bracket_size == 32:
            return [
                (1, 32), (16, 17), (9, 24), (8, 25),
                (5, 28), (12, 21), (13, 20), (4, 29),
                (3, 30), (14, 19), (11, 22), (6, 27),
                (7, 26), (10, 23), (15, 18), (2, 31)
            ]
        else:
            # Generic seeding
            pairs = []
            for i in range(bracket_size // 2):
                seed1 = i + 1
                seed2 = bracket_size - i
                pairs.append((seed1, seed2))
            return pairs

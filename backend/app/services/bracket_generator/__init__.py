"""
Bracket Generator Package - PHASE 5
Universal bracket generation system supporting multiple tournament formats
"""
from .base import BracketGenerator
from .single_elimination import SingleEliminationGenerator
from .double_elimination import DoubleEliminationGenerator  
from .billiard_double_elimination import BilliardDoubleEliminationGenerator
from .group_stage import GroupStageGenerator

# Compatibility exports
def generate_single_elimination_bracket(db, tournament_id):
    """Backward compatibility function"""
    from app.models.tournament_registration import TournamentRegistration
    
    # Get participant IDs from confirmed registrations
    confirmed_registrations = db.query(TournamentRegistration).filter(
        TournamentRegistration.tournament_id == tournament_id,
        TournamentRegistration.status == "confirmed"
    ).all()
    
    participant_ids = [reg.player_id for reg in confirmed_registrations]
    
    generator = SingleEliminationGenerator(db, tournament_id)
    matches_data = generator.generate(participant_ids)
    
    # Create Match objects
    from app.models.match import Match
    matches = []
    for match_data in matches_data:
        match = Match(**match_data)
        db.add(match)
        matches.append(match)
    
    return matches

def generate_bracket_preview(bracket_type, participant_count):
    """Preview bracket structure without tournament ID"""
    fake_participant_ids = list(range(1, participant_count + 1))
    
    if bracket_type == "single_elimination":
        generator = SingleEliminationGenerator(db=None, tournament_id=None)
        return generator.generate(fake_participant_ids)
    elif bracket_type == "double_elimination":
        # Use billiard-style double elimination (tournamentservice.net format)
        generator = BilliardDoubleEliminationGenerator(db=None, tournament_id=None)
        return generator.generate(fake_participant_ids)
    elif bracket_type == "group_stage":
        generator = GroupStageGenerator(db=None, tournament_id=None)
        return generator.generate(fake_participant_ids, num_groups=4, advance_per_group=2)
    else:
        raise ValueError(f"Unknown bracket type: {bracket_type}")

def get_bracket_visualization(tournament):
    """Get bracket structure for visualization"""
    matches = tournament.matches or []
    return {"matches": [{
        "id": m.id, 
        "round": m.round, 
        "match_number": m.match_number,
        "player1_id": m.player1_id,
        "player2_id": m.player2_id,
        "player1_name": m.player1_name, 
        "player2_name": m.player2_name, 
        "winner_id": m.winner_id, 
        "player1_score": m.player1_score or 0,
        "player2_score": m.player2_score or 0,
        "status": m.status,
        "tournament_id": m.tournament_id,
        "created_at": m.created_at.isoformat() if m.created_at else None,
        "date": m.date.isoformat() if m.date else None
    } for m in matches]}

__all__ = [
    "BracketGenerator", 
    "SingleEliminationGenerator",
    "DoubleEliminationGenerator",
    "BilliardDoubleEliminationGenerator",
    "GroupStageGenerator",
    "generate_single_elimination_bracket",
    "generate_bracket_preview",
    "get_bracket_visualization"
]

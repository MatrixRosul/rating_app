"""
Mapping between discipline enum values and Ukrainian display names
"""
from app.models.tournament import TournamentDiscipline

DISCIPLINE_DISPLAY_NAMES = {
    TournamentDiscipline.FREE_PYRAMID: "Вільна піраміда",
    TournamentDiscipline.FREE_PYRAMID_EXTENDED: "Вільна піраміда з продовженням",
    TournamentDiscipline.COMBINED_PYRAMID: "Комбінована піраміда",
    TournamentDiscipline.DYNAMIC_PYRAMID: "Динамічна піраміда",
    TournamentDiscipline.COMBINED_PYRAMID_CHANGES: "Комбінована піраміда зі змінами",
}

def get_discipline_display_name(discipline: TournamentDiscipline) -> str:
    """Get Ukrainian display name for discipline"""
    return DISCIPLINE_DISPLAY_NAMES.get(discipline, discipline.value)

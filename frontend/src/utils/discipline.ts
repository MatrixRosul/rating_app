import { TournamentDiscipline } from '@/types';
import { DISCIPLINES, DISCIPLINE_NAMES } from '@/constants';

// Use DISCIPLINE_NAMES from constants
export const DISCIPLINE_LABELS: Record<TournamentDiscipline, string> = DISCIPLINE_NAMES;

export function getDisciplineLabel(discipline: TournamentDiscipline): string {
  return DISCIPLINE_LABELS[discipline] || discipline;
}

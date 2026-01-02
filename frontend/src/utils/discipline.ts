import { TournamentDiscipline } from '@/types';

export const DISCIPLINE_LABELS: Record<TournamentDiscipline, string> = {
  'FREE_PYRAMID': 'Вільна піраміда',
  'FREE_PYRAMID_EXTENDED': 'Вільна піраміда з продовженням',
  'COMBINED_PYRAMID': 'Комбінована піраміда',
  'DYNAMIC_PYRAMID': 'Динамічна піраміда',
  'COMBINED_PYRAMID_CHANGES': 'Комбінована піраміда зі змінами',
};

export function getDisciplineLabel(discipline: TournamentDiscipline): string {
  return DISCIPLINE_LABELS[discipline] || discipline;
}

export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Player, Match } from '@/types';
import { calculateRatingChange, generateRealPlayers } from '@/utils/rating';

interface CsvRow {
  player1: string;
  player2: string;
  score1: number;
  score2: number;
  tournament: string;
  date: string;
}

function parseCsv(content: string): CsvRow[] {
  const rows: string[][] = [];
  let current: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const next = content[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        i++; // Skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      current.push(field);
      field = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (field.length > 0 || current.length > 0) {
        current.push(field);
        rows.push(current);
        current = [];
        field = '';
      }
      continue;
    }

    field += char;
  }

  if (field.length > 0 || current.length > 0) {
    current.push(field);
    rows.push(current);
  }

  const header = rows.shift();
  if (!header) return [];

  // Normalize header labels: remove spaces, apostrophes, quotes, commas; lowercase
  const norm = (h: string) => h.replace(/['"\s,]+/g, '').toLowerCase();
  const normalizedHeader = header.map(norm);

  const findIdx = (candidates: string[]) =>
    normalizedHeader.findIndex((h) => candidates.some((c) => h.includes(c)));

  const idx = {
    p1: findIdx(['імя1', 'імяфамілія1', 'фамілія1', 'гравець1', 'player1']),
    p2: findIdx(['імя2', 'імяфамілія2', 'фамілія2', 'гравець2', 'player2']),
    s1: findIdx(['результат1', 'рахунок1', 'score1']),
    s2: findIdx(['результат2', 'рахунок2', 'score2']),
    tournament: findIdx(['турнір', 'tournament', 'event']),
    date: findIdx(['дата', 'date']),
  };

  return rows
    .filter((r) => r.length > 3)
    .map((r) => ({
      player1: idx.p1 >= 0 ? r[idx.p1]?.trim() || '' : '',
      player2: idx.p2 >= 0 ? r[idx.p2]?.trim() || '' : '',
      score1: idx.s1 >= 0 ? Number(r[idx.s1] || 0) : 0,
      score2: idx.s2 >= 0 ? Number(r[idx.s2] || 0) : 0,
      tournament: idx.tournament >= 0 ? r[idx.tournament] || '' : '',
      date: idx.date >= 0 ? r[idx.date] || '' : '',
    }));
}

function normalizeName(name: string): string {
  const s = (name || '')
    .normalize('NFKC')
    .replace(/["“”„”]+/g, '') // remove all double-quote styles
    .replace(/[’‘ʼ`]+/g, "'") // unify apostrophes to '
    .replace(/\s+/g, ' ') // collapse spaces
    .trim()
    .toLowerCase();
  // collapse multiple apostrophes to single
  return s.replace(/'+/g, "'");
}

// Known alias map: normalized variant -> canonical display name
const NAME_ALIASES: Record<string, string> = {
  // Марʼян Матіїшин variations
  [normalizeName("Мар'ян Матіїшин")]: 'Марʼян Матіїшин',
  [normalizeName('Мар”ян Матіїшин')]: 'Марʼян Матіїшин',
  [normalizeName('Мар""ян Матіїшин')]: 'Марʼян Матіїшин',
  [normalizeName('Марян Матіїшин')]: 'Марʼян Матіїшин',
  [normalizeName('Мар\'ян Матієшиин')]: 'Марʼян Матіїшин',

  // Андрій Сергєєв common misspelling
  [normalizeName('Андрій Сергеєєв')]: 'Андрій Сергєєв',
  [normalizeName('Андрій Сергеєв')]: 'Андрій Сергєєв',
};

function resolveName(raw: string): string {
  const key = normalizeName(raw || '');
  return NAME_ALIASES[key] || (raw || '').trim();
}

function splitName(fullName: string): { first: string; last: string } {
  const parts = fullName.replace(/\s+/g, ' ').trim().split(' ');
  return { first: parts[0] || '', last: parts.slice(1).join(' ') || parts[0] || '' };
}

function createPlayer(fullName: string): Player {
  const { first, last } = splitName(fullName);
  return {
    id: `player-${normalizeName(fullName)}`,
    name: fullName.trim(),
    firstName: first,
    lastName: last,
    rating: 1100,
    matches: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'match_results.csv');
    const content = fs.readFileSync(filePath, 'utf-8');
    const rows = parseCsv(content);

    // Base players
    const players = generateRealPlayers();
    const playerMap = new Map<string, Player>();
    // Seed map with canonical names
    players.forEach((p) => playerMap.set(normalizeName(p.name), p));
    // Also seed alias keys pointing to the same player
    Object.entries(NAME_ALIASES).forEach(([aliasKey, canonicalName]) => {
      const canonicalKey = normalizeName(canonicalName);
      const player = playerMap.get(canonicalKey);
      if (player) playerMap.set(aliasKey, player);
    });

    const matches: Match[] = [];
    let newPlayers = 0;

    // Sort rows by date (oldest first) so ratings update chronologically
    const sortedRows = [...rows].sort((a, b) => {
      const dateA = new Date(a.date || 0).getTime();
      const dateB = new Date(b.date || 0).getTime();
      return dateA - dateB;
    });

    sortedRows.forEach((row, index) => {
      const resolved1 = resolveName(row.player1);
      const resolved2 = resolveName(row.player2);
      const key1 = normalizeName(resolved1);
      const key2 = normalizeName(resolved2);

      let p1 = playerMap.get(key1);
      if (!p1) {
        p1 = createPlayer(resolved1);
        playerMap.set(key1, p1);
        players.push(p1);
        newPlayers++;
      }

      let p2 = playerMap.get(key2);
      if (!p2) {
        p2 = createPlayer(resolved2);
        playerMap.set(key2, p2);
        players.push(p2);
        newPlayers++;
      }

      const maxScore = Math.max(row.score1, row.score2, 1);
      const winnerId = row.score1 > row.score2 ? p1.id : p2.id;

      const { player1Change, player2Change } = calculateRatingChange(
        p1.rating,
        p2.rating,
        row.score1,
        row.score2,
        maxScore
      );

      const match: Match = {
        id: `csv-${index}-${Date.now()}`,
        player1Id: p1.id,
        player2Id: p2.id,
        winnerId,
        player1Score: row.score1,
        player2Score: row.score2,
        maxScore,
        player1RatingBefore: p1.rating,
        player2RatingBefore: p2.rating,
        player1RatingAfter: p1.rating + player1Change,
        player2RatingAfter: p2.rating + player2Change,
        player1RatingChange: player1Change,
        player2RatingChange: player2Change,
        date: new Date(row.date || Date.now()),
        sequenceIndex: index, // Порядок обробки матчу при імпорті
        tournament: row.tournament || undefined, // Назва турніру з CSV
      };

      p1.rating = match.player1RatingAfter;
      p2.rating = match.player2RatingAfter;
      p1.matches.push(match.id);
      p2.matches.push(match.id);
      p1.updatedAt = new Date();
      p2.updatedAt = new Date();

      matches.push(match);
    });

    return NextResponse.json({
      players,
      matches,
      summary: {
        totalMatches: matches.length,
        totalPlayers: players.length,
        newPlayers,
      },
    });
  } catch (error: any) {
    console.error('CSV import failed', error);
    return NextResponse.json({ error: 'CSV import failed', details: error?.message }, { status: 500 });
  }
}
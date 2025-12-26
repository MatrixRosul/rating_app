export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Player, Match } from '@/types';
import { calculateRatingChange, generateRealPlayers, getMatchWeight, getStageOrder, isCMSPlayer } from '@/utils/rating';

interface CsvRow {
  player1: string;
  player2: string;
  score1: number;
  score2: number;
  tournament: string;
  date: string;
  stage?: string; // 🔥 Стадія матчу
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
    stage: findIdx(['стадія', 'stage', 'round']), // 🔥 Парсимо стадію матчу
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
      stage: idx.stage >= 0 ? r[idx.stage]?.trim() || undefined : undefined, // 🔥 Стадія
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
  const isCMS = isCMSPlayer(first, last);
  const startingRating = isCMS ? 1600 : 1300; // 🏆 КМС починають з 1600
  
  return {
    id: `player-${normalizeName(fullName)}`,
    name: fullName.trim(),
    firstName: first,
    lastName: last,
    rating: startingRating,
    initialRating: startingRating, // Фіксуємо початковий рейтинг
    isCMS, // Позначка КМС
    matches: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function GET(request: Request) {
  try {
    // Отримуємо параметри з URL
    const { searchParams } = new URL(request.url);
    const warmupRuns = parseInt(searchParams.get('warmupRuns') || '0', 10);

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

    // Sort rows by date (oldest first) and by stage within same date
    const sortedRows = [...rows].sort((a, b) => {
      const dateA = new Date(a.date || 0).getTime();
      const dateB = new Date(b.date || 0).getTime();
      
      // Спочатку сортуємо по даті
      if (dateA !== dateB) return dateA - dateB;
      
      // Якщо дата однакова — сортуємо по стадії (group → final)
      return getStageOrder(a.stage) - getStageOrder(b.stage);
    });

    // Warmup runs: прогоняємо матчі N разів для калібрування рейтингів (без збереження історії)
    if (warmupRuns > 0) {
      console.log(`🔥 Starting ${warmupRuns} warmup runs for rating calibration...`);
      
      for (let run = 1; run <= warmupRuns; run++) {
        // Скидаємо рейтинги перед кожним warmup run
        playerMap.forEach(p => {
          // 🏆 КМС починають з 1600, інші з 1300
          p.rating = p.isCMS ? 1600 : 1300;
        });

        sortedRows.forEach((row) => {
          const resolved1 = resolveName(row.player1);
          const resolved2 = resolveName(row.player2);
          const key1 = normalizeName(resolved1);
          const key2 = normalizeName(resolved2);

          let p1 = playerMap.get(key1);
          if (!p1) {
            p1 = createPlayer(resolved1);
            playerMap.set(key1, p1);
            players.push(p1);
          }

          let p2 = playerMap.get(key2);
          if (!p2) {
            p2 = createPlayer(resolved2);
            playerMap.set(key2, p2);
            players.push(p2);
          }

          const maxScore = Math.max(row.score1, row.score2, 1);
          const gamesPlayed1 = p1.matches.length;
          const gamesPlayed2 = p2.matches.length;
          const matchWeight = getMatchWeight(row.stage); // 🔥 Вага матчу залежить від стадії

          const { player1Change, player2Change } = calculateRatingChange(
            p1.rating,
            p2.rating,
            row.score1,
            row.score2,
            maxScore,
            gamesPlayed1,
            gamesPlayed2,
            matchWeight // 🔥 Застосовуємо вагу
          );

          p1.rating += player1Change;
          p2.rating += player2Change;
          // Для warmup рахуємо тільки кількість матчів (без збереження історії)
          p1.matches.push(`warmup-${run}-dummy`);
          p2.matches.push(`warmup-${run}-dummy`);
        });

        console.log(`✅ Warmup run ${run}/${warmupRuns} completed`);
      }

      // Після warmup runs очищаємо фейкову історію матчів
      // 🔥 ЗБЕРІГАЄМО КАЛІБРОВАНИЙ РЕЙТИНГ ЯК ПОЧАТКОВИЙ
      playerMap.forEach(p => {
        p.matches = [];
        p.initialRating = p.rating; // Фіксуємо калібрований рейтинг як стартову точку
      });

      console.log(`🎯 Warmup complete! Starting final run with calibrated ratings...`);
    }

    const matches: Match[] = [];
    let newPlayers = 0;

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
      
      const gamesPlayed1 = p1.matches.length;
      const gamesPlayed2 = p2.matches.length;
      const matchWeight = getMatchWeight(row.stage); // 🔥 Вага матчу залежить від стадії

      const { player1Change, player2Change } = calculateRatingChange(
        p1.rating,
        p2.rating,
        row.score1,
        row.score2,
        maxScore,
        gamesPlayed1,
        gamesPlayed2,
        matchWeight // 🔥 Застосовуємо вагу
      );

      const match: Match = {
        id: `csv-${index}-${Date.now()}`,
        player1Id: p1.id,
        player2Id: p2.id,
        player1Name: p1.name, // Зберігаємо ім'я для віртуальних профілів
        player2Name: p2.name, // Зберігаємо ім'я для віртуальних профілів
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
        stage: row.stage, // 🔥 Стадія матчу
        matchWeight, // 🔥 Вага матчу (для відображення)
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
        warmupRuns,
        message: warmupRuns > 0 
          ? `Ratings calibrated with ${warmupRuns} warmup runs before final simulation` 
          : 'Direct import without warmup',
      },
    });
  } catch (error: any) {
    console.error('CSV import failed', error);
    return NextResponse.json({ error: 'CSV import failed', details: error?.message }, { status: 500 });
  }
}
import { Player, Match, RatingBand, RATING_BANDS, PlayerStats } from '@/types';

// 🔥 ВАГА МАТЧУ: фінали дають вдвічі більше рейтингу!
export function getMatchWeight(stage?: string): number {
  const weights: Record<string, number> = {
    'group': 1.0,
    'round16': 1.1,
    'quarterfinal': 1.4,
    'semifinal': 1.7,
    'final': 2.0
  };
  
  if (!stage) return 1.0;
  
  const normalized = stage.toLowerCase().trim();
  return weights[normalized] ?? 1.0;
}

// Порядок стадій для сортування (важливо для однакових дат)
export function getStageOrder(stage?: string): number {
  const order: Record<string, number> = {
    'group': 1,
    'round16': 2,
    'quarterfinal': 3,
    'semifinal': 4,
    'final': 5
  };
  
  if (!stage) return 0;
  
  const normalized = stage.toLowerCase().trim();
  return order[normalized] ?? 0;
}

// Stable ELO-based rating calculation with pyramid principles
export function calculateRatingChange(
  player1Rating: number,
  player2Rating: number,
  player1Score: number,
  player2Score: number,
  maxScore: number,
  player1Games: number = 30, // Кількість ігор гравця 1
  player2Games: number = 30, // Кількість ігор гравця 2
  matchWeight: number = 1.0  // 🔥 ВАГА МАТЧУ: group=1.0, round16=1.1, quarterfinal=1.4, semifinal=1.7, final=2.0
): { player1Change: number; player2Change: number } {
  
  // 1. EXPECTED SCORE (E) — стандартний Elo
  const E1 = 1 / (1 + Math.pow(10, (player2Rating - player1Rating) / 400));
  const E2 = 1 - E1;
  
  // 2. ACTUAL SCORE (S) — ЕЛІТНА ЛОГІКА для топів
  const scoreDiff = player1Score - player2Score;
  const avgRating = (player1Rating + player2Rating) / 2;
  const isElite = avgRating >= 1600;
  
  let S1: number, S2: number;
  
  if (isElite) {
    // 🔥 ДЛЯ ЕЛІТИ: перемога = 1, поразка = 0, рахунок впливає мінімально
    if (player1Score > player2Score) {
      // Переможець отримує майже 1.0, незалежно від рахунку
      S1 = 0.95 + Math.min(0.05, (scoreDiff / maxScore) * 0.05);
    } else {
      // Програвший отримує майже 0.0
      S1 = 0.05 - Math.min(0.05, (Math.abs(scoreDiff) / maxScore) * 0.05);
    }
  } else {
    // Стандартна логіка для середніх рейтингів
    S1 = 0.5 + (scoreDiff / maxScore) * 0.5;
  }
  
  S2 = 1 - S1;
  
  // 3. MARGIN MULTIPLIER (M) — м'який вплив різниці в рахунку
  const M = calculateMarginMultiplier(Math.abs(scoreDiff), Math.max(player1Rating, player2Rating));
  
  // 4. K-FACTOR — залежить від кількості ігор та рейтингу
  const K1 = calculateKFactor(player1Games, player1Rating);
  const K2 = calculateKFactor(player2Games, player2Rating);
  
  // 5. БАЗОВА ЗМІНА — лінійна формула Elo
  let delta1 = K1 * (S1 - E1) * M;
  let delta2 = K2 * (S2 - E2) * M;
  
  // 6. ЗАХИСТ ВІД ПРІРВИ — тільки для низів
  // 🔥 Топи БЕЗ захисту — створюємо відтік рейтингу вгору
  if (avgRating < 1500) {
    // Тільки новачки та середняки мають захист
    const lossProtection = 0.75;
    if (delta1 < 0) delta1 *= lossProtection;
    if (delta2 < 0) delta2 *= lossProtection;
  }
  // Еліта (1500+) втрачає та виграє повністю
  
  // 7. ОБМЕЖЕННЯ МАКСИМУМУ — еліта може робити великі стрибки
  let maxChange: number;
  
  if (avgRating >= 1700) {
    // 🔥 ТОП-МАТЧІ: можливість великих стрибків
    maxChange = 70;
  } else if (avgRating >= 1600) {
    // Елітний шар
    maxChange = 60;
  } else if (avgRating >= 1400) {
    // Середній рівень
    maxChange = 45;
  } else {
    // Новачки
    maxChange = 35;
  }
  
  delta1 = Math.max(-maxChange, Math.min(maxChange, delta1));
  delta2 = Math.max(-maxChange, Math.min(maxChange, delta2));
  
  // 8. БОНУС ЗА ДОМІНАЦІЮ В ЕЛІТНОМУ ШАРІ
  if (isElite && Math.abs(scoreDiff) >= 3) {
    // 🔥 Топ домінує — екстра нагорода
    const dominanceBonus = Math.min(10, Math.abs(scoreDiff) * 2);
    if (delta1 > 0) delta1 += dominanceBonus;
    else if (delta2 > 0) delta2 += dominanceBonus;
  }
  
  // 9. 🔥 ВАГА МАТЧУ — фінали дають НАБАГАТО більше
  delta1 *= matchWeight;
  delta2 *= matchWeight;
  
  // 10. ROUNDED CHANGES
  const player1Change = Math.round(delta1);
  const player2Change = Math.round(delta2);
  
  return { player1Change, player2Change };
}

// K-Factor based on number of games played and rating (pyramid principle)
function calculateKFactor(gamesPlayed: number, rating: number = 1200): number {
  // Базові K-фактори для досвіду
  let baseK: number;
  if (gamesPlayed < 20) baseK = 55;
  else if (gamesPlayed < 60) baseK = 38;
  else baseK = 26;
  
  // 🔥 ЕЛІТНИЙ ШАР — найвищий K саме тут
  if (rating >= 1900) {
    // Верхівка: стабілізація після досягнення
    baseK = Math.max(baseK, 42);
  } else if (rating >= 1700) {
    // 🎯 ПІКОВИЙ K для активного росту в топ-зону
    baseK = Math.max(baseK, 50);
  } else if (rating >= 1600) {
    // Вхід в еліту — максимальна динаміка
    baseK = Math.max(baseK, 55);
  }
  
  return baseK;
}

// Margin Multiplier — обмежений вплив різниці в рахунку
function calculateMarginMultiplier(scoreDiff: number, rating: number = 1200): number {
  // Логарифмічна шкала для м'якого зростання
  let base = 1 + Math.min(1.0, Math.log2(1 + scoreDiff) * 0.55);
  
  // М'яке посилення для топових гравців (великі перемоги більше винагороджуються)
  if (rating >= 1600 && scoreDiff >= 3) {
    base *= 1.08; // +8% для топів при домінації
  }
  
  return base;
}

// Get rating band for a given rating
export function getRatingBand(rating: number): RatingBand {
  return RATING_BANDS.find(band => rating >= band.minRating && rating <= band.maxRating) || RATING_BANDS[0];
}

// Generate a random player name for simulation
export function generateRandomPlayerName(): string {
  const firstNames = [
    'Олександр', 'Андрій', 'Василь', 'Володимир', 'Дмитро', 'Євген', 'Ігор', 'Іван', 'Максим', 'Микола',
    'Олег', 'Петро', 'Роман', 'Сергій', 'Тарас', 'Юрій', 'Богдан', 'Віктор', 'Денис', 'Костянтин',
    'Анна', 'Вікторія', 'Діана', 'Єлизавета', 'Катерина', 'Марія', 'Наталія', 'Оксана', 'Світлана', 'Тетяна',
    'Юлія', 'Ярослава', 'Валентина', 'Галина', 'Ірина', 'Людмила', 'Ольга', 'Тамара', 'Алла', 'Лариса'
  ];
  
  const lastNames = [
    'Петренко', 'Іваненко', 'Коваленко', 'Бондаренко', 'Мельник', 'Шевченко', 'Ткаченко', 'Кравченко',
    'Полтавець', 'Савченко', 'Романенко', 'Левченко', 'Гриценко', 'Павленко', 'Марченко', 'Демченко',
    'Лисенко', 'Руденко', 'Мороз', 'Кравець', 'Кузнецов', 'Попов', 'Соколов', 'Лебедєв', 'Козлов'
  ];

  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  
  return `${firstName} ${lastName}`;
}

// Generate initial players with base rating
export function generateInitialPlayers(count: number = 100, baseRating: number = 1000): Player[] {
  const players: Player[] = [];
  const usedNames = new Set<string>();

  // Special players with different rating ranges for demonstration
  const specialPlayers = [
    { name: 'NoobMaster69', rating: 800 },     // Newbie - Gray
    { name: 'BeginnerLuck', rating: 1200 },    // Newbie - Gray
    { name: 'GreenPlayer', rating: 1250 },     // Pupil - Green
    { name: 'StudyHard', rating: 1350 },       // Pupil - Green
    { name: 'CyanSpecial', rating: 1450 },     // Specialist - Cyan
    { name: 'TechnicalPro', rating: 1550 },    // Specialist - Cyan
    { name: 'BlueExpert', rating: 1700 },      // Expert - Blue
    { name: 'SkillMaster', rating: 1850 },     // Expert - Blue
    { name: 'PurpleCandidate', rating: 1950 }, // Candidate Master - Purple
    { name: 'AlmostMaster', rating: 2050 },    // Candidate Master - Purple
    { name: 'OrangeMaster', rating: 2150 },    // Master - Orange
    { name: 'TrueMaster', rating: 2250 },      // Master - Orange
    { name: 'IntlMaster', rating: 2350 },      // International Master - Orange
    { name: 'RedGrandmaster', rating: 2450 },  // Grandmaster - Red
    { name: 'LegendaryGM', rating: 2600 },     // Grandmaster - Red
  ];

  // Add special players first
  specialPlayers.forEach((special, index) => {
    if (index < count) {
      usedNames.add(special.name);
      players.push({
        id: `player-${index + 1}`,
        name: special.name,
        rating: special.rating,
        matches: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  });

  // Fill remaining slots with regular players
  for (let i = specialPlayers.length; i < count; i++) {
    let name = generateRandomPlayerName();
    
    // Ensure unique names
    while (usedNames.has(name)) {
      name = generateRandomPlayerName();
    }
    usedNames.add(name);

    // Add some variance to base rating (-100 to +100)
    const ratingVariance = Math.floor(Math.random() * 201) - 100;
    const rating = Math.max(800, baseRating + ratingVariance);

    players.push({
      id: `player-${i + 1}`,
      name,
      rating,
      matches: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  return players;
}

// CSV Data import functions
export interface CSVPlayerData {
  first_name: string;
  last_name: string;
  city?: string;
  yob?: number; // year of birth
}

// Function to parse CSV data and create players
export function createPlayersFromCSV(csvData: CSVPlayerData[], baseRating: number = 1200): Player[] {
  const currentYear = new Date().getFullYear();
  
  return csvData.map((data, index) => {
    const fullName = `${data.first_name} ${data.last_name}`.trim();
    const yearOfBirth = data.yob || null;
    const age = yearOfBirth ? currentYear - yearOfBirth : null;
    
    return {
      id: `real-player-${index + 1}`,
      name: fullName,
      firstName: data.first_name,
      lastName: data.last_name,
      city: data.city || '',
      yearOfBirth: yearOfBirth || undefined,
      age: age || undefined,
      rating: baseRating,
      matches: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  });
}

// Function to load real players (hardcoded CSV data)
export function generateRealPlayers(): Player[] {
  const csvData: CSVPlayerData[] = [
    { first_name: "Юлій", last_name: "Гараксим", city: "Ужгород", yob: 1985 },
    { first_name: "Артур", last_name: "Зелінко", city: "Перечин", yob: 1991 },
    { first_name: "Володимир", last_name: "Коротя", city: "Ужгород", yob: 1985 },
    { first_name: "Стефанія", last_name: "Церковник", city: "Ужгород", yob: 2008 },
    { first_name: "Євген", last_name: "Драгула", city: "Ужгород", yob: 1976 },
    { first_name: "Максим", last_name: "Король", city: "Ужгород", yob: 2011 },
    { first_name: "Михайло", last_name: "Сличко", city: "Воловець", yob: 1997 },
    { first_name: "Роман", last_name: "Качур", city: "Ужгород", yob: 2001 },
    { first_name: "Микола", last_name: "Шикітка", city: "Тарнівці", yob: 1973 },
    { first_name: "Роман", last_name: "Чийпеш", city: "Ужгород", yob: 1982 },
    { first_name: "Максим", last_name: "Росул", city: "Ужгород", yob: 2005 },
    { first_name: "Микола", last_name: "Леміш", city: "Ужгород", yob: 1979 },
    { first_name: "Роман", last_name: "Церковник", city: "Ужгород", yob: 1976 },
    { first_name: "Олександр", last_name: "Лизанець", city: "Ужгород", yob: 1985 },
    { first_name: "Андрій", last_name: "Сергєєв", city: "Сєвєродонецьк", yob: 1975 },
    { first_name: "Сергій", last_name: "Король", city: "Ужгород", yob: 1978 },
    { first_name: "Олексій", last_name: "Проскурін", city: "Харків", yob: 1979 },
    { first_name: "Євген", last_name: "Кравчак", city: "Чоп", yob: 1987 },
    { first_name: "Володимир", last_name: "Комарницький", city: "Ужгород", yob: 1975 },
    { first_name: "Едуард", last_name: "Олах", city: "Ужгород", yob: 2006 },
    { first_name: "Олег", last_name: "Галушко", city: "Ужгород", yob: 1996 },
    { first_name: "Рамір", last_name: "Лацко", city: "Ужгород", yob: 2007 },
    { first_name: "Іван", last_name: "Смочков", city: "Ужгород", yob: 1994 },
    { first_name: "Іван", last_name: "Боршош", city: "Іршава", yob: 1991 },
    { first_name: "Олексій", last_name: "Бамбушкар", city: "Ужгород", yob: 1989 },
    { first_name: "Степан", last_name: "Ковач", city: "Слов'янськ", yob: 2004 },
    { first_name: "Евген", last_name: "Куртинець", city: "Іршава", yob: 1995 },
    { first_name: "Тиберій", last_name: "Тирпак", city: "Ужгород", yob: 2012 },
    { first_name: "Олександр", last_name: "Грін", city: "Ужгород", yob: 1994 },
    { first_name: "Олександр", last_name: "Шахівський", city: "Мукачеве", yob: 1992 },
    { first_name: "Марк", last_name: "Кольмар", city: "Слов'янськ", yob: 2004 },
    { first_name: "Мартін", last_name: "Довганич", city: "Ужгород", yob: 2000 },
    { first_name: "Марія", last_name: "Левківська", city: "Ужгород", yob: 1983 },
    { first_name: "Олександр", last_name: "Мимренко", city: "Ужгород", yob: 1992 },
    { first_name: "Євген", last_name: "Довганич", city: "Ужгород", yob: 1997 },
    { first_name: "Марʼян", last_name: "Матіїшин", city: "Ужгород", yob: 1977 },
    { first_name: "Володимир", last_name: "Шикітка", city: "Мукачеве", yob: 1977 },
    { first_name: "Юрій", last_name: "Леміш", city: "Ужгород", yob: 2006 },
    { first_name: "Олександр", last_name: "Федів", city: "Мукачеве", yob: 1986 },
    { first_name: "Валентин", last_name: "Свалявчик", city: "Ужгород", yob: 1982 },
    { first_name: "Володимир", last_name: "Таранчук", city: "Ужгород", yob: 1993 },
    { first_name: "Бардо", last_name: "Адам", city: "Ужгород", yob: 2007 },
    { first_name: "Андрій", last_name: "Банк", city: "Ужгород", yob: 2007 },
    { first_name: "Віктор", last_name: "Загуменний", city: "Ужгород", yob: 1988 },
    { first_name: "Руслан", last_name: "Шмигановський", city: "Яготин", yob: 1988 },
    { first_name: "Олександр", last_name: "Миронов", city: "Ужгород", yob: 1985 },
    { first_name: "Олександр", last_name: "Іванович", city: "Слов'янськ", yob: 2003 },
    { first_name: "Іван", last_name: "Гурський", city: "Ужгород", yob: 1991 },
    { first_name: "Олександр", last_name: "Кулик", city: "Ужгород", yob: 1983 },
    { first_name: "Кирило", last_name: "Голяна", city: "Ужгород", yob: 2005 },
    { first_name: "Павло", last_name: "Бідзіля", city: "Виноградів", yob: 1989 },
    { first_name: "Олександр", last_name: "Лендєл", city: "Мукачеве", yob: 1992 },
    { first_name: "Сергій", last_name: "Данашевський", city: "Мукачеве", yob: 1984 },
    { first_name: "Валентин", last_name: "Лендєл", city: "Мукачеве", yob: 2002 },
    { first_name: "Андрій", last_name: "Новицький", city: "Ужгород", yob: 1994 },
    { first_name: "Максим", last_name: "Шишко", city: "Ужгород", yob: 2001 },
    { first_name: "Золтан", last_name: "Горос", city: "Ужгород", yob: 1979 },
    { first_name: "Назар", last_name: "Олах", city: "Ужгород", yob: 2007 },
    { first_name: "Микола", last_name: "Стегней", city: "Ужгород", yob: 1985 },
    { first_name: "Олександр", last_name: "Жиденко", city: "Мукачеве", yob: 1952 },
    { first_name: "Михайло", last_name: "Пономаренко", city: "Київ", yob: 1986 },
    { first_name: "Володимир", last_name: "Гобрей", city: "Мукачеве", yob: 1988 },
    { first_name: "Деніел", last_name: "Кедебец", city: "Ужгород", yob: 1996 },
    { first_name: "Тарас", last_name: "Потапчук", city: "Ужгород", yob: 1980 },
    { first_name: "Артур", last_name: "Попфалуші", city: "Мукачеве", yob: 1999 },
    { first_name: "Михайло", last_name: "Феделещак", city: "Ужгород", yob: 2006 },
    { first_name: "Едуард", last_name: "Амосов", city: "", yob: 1984 },
    { first_name: "Юрій", last_name: "Переста", city: "Мукачеве", yob: 2003 },
    { first_name: "Михайло", last_name: "Бойко", city: "", yob: 1999 },
    { first_name: "Іван", last_name: "Бойчук", city: "Ужгород", yob: 2006 },
    { first_name: "Андрій", last_name: "Баліцький", city: "Ужгород", yob: 2006 },
    { first_name: "Василь", last_name: "Єгоров", city: "Ужгород", yob: 1988 },
    { first_name: "Андрій", last_name: "Синичка", city: "Ужгород", yob: 1990 },
    { first_name: "Юрій", last_name: "Поліщук", city: "Ужгород", yob: 1986 },
    { first_name: "Олександр", last_name: "Шевелюк", city: "Ужгород", yob: 1990 },
    { first_name: "Богдан", last_name: "Порох", city: "Павлоград", yob: 2000 },
    { first_name: "Роман", last_name: "Гурчумелія", city: "Ужгород", yob: 1983 },
    { first_name: "Віталій", last_name: "Балко", city: "Мукачеве", yob: 1983 },
    { first_name: "Софія", last_name: "Дудченко", city: "Кривий Ріг", yob: 2010 },
    { first_name: "Владіслав", last_name: "Шикітка", city: "Ужгород", yob: 2003 },
    { first_name: "Віктор", last_name: "Дейнеко", city: "Чоп", yob: 1981 },
    { first_name: "Володимир", last_name: "Лукашенко", city: "Черкаси", yob: 1988 },
    { first_name: "Василь", last_name: "Федина", city: "Тячів", yob: 1974 },
    { first_name: "Василь", last_name: "Тотін", city: "Ужгород", yob: 2000 },
    { first_name: "Архип", last_name: "Онищенко", city: "Харків", yob: 2005 },
    { first_name: "Іван", last_name: "Пелінкевич", city: "Луцьк", yob: 1990 },
    { first_name: "Віталій", last_name: "Мельзаковський", city: "Ужгород", yob: 1987 },
    { first_name: "Томі", last_name: "Човка", city: "Ужгород", yob: 2008 },
    { first_name: "Мартін", last_name: "Пап", city: "Ужгород", yob: 2003 },
    { first_name: "Ігор", last_name: "Кузьмін", city: "Ужгород", yob: 1987 },
    { first_name: "Василь", last_name: "Продан", city: "Ужгород", yob: 1987 },
    { first_name: "Сергій", last_name: "Бреславець", city: "Харьков" },
    { first_name: "Золтан", last_name: "Горват", city: "Ужгород", yob: 2004 },
    { first_name: "Сергій", last_name: "Шерегій", city: "Іршава", yob: 1979 },
    { first_name: "Олександр", last_name: "Пастернак", city: "Ужгород", yob: 1995 },
    { first_name: "Максим", last_name: "Гріненко", city: "Суми", yob: 1981 },
    { first_name: "Сергій", last_name: "Королев", city: "Ужгород" },
    { first_name: "Єлісей", last_name: "Роганов", city: "Ужгород", yob: 2001 },
    { first_name: "Сергій", last_name: "Кобака", city: "Мукачеве", yob: 1972 },
    { first_name: "Ігор", last_name: "Фединишинець", city: "Ужгород", yob: 1979 },
    { first_name: "Василь", last_name: "Туряниця", city: "Ужгород" },
    { first_name: "Аванес", last_name: "Кальмар", city: "Слов'янськ" },
    { first_name: "Владислав", last_name: "Кузьма", city: "Ужгород", yob: 2000 },
    { first_name: "Артур", last_name: "Лацко", city: "Ужгород", yob: 2006 },
    { first_name: "Юрій", last_name: "Журавльов", city: "Ужгород", yob: 1982 },
    { first_name: "Руслан", last_name: "Косору", city: "Ужгород", yob: 1989 },
    { first_name: "Джоні", last_name: "Бругош", city: "" },
    { first_name: "Владислав", last_name: "Красніков", city: "Ужгород", yob: 2002 },
    { first_name: "Ілля", last_name: "Гулєватий", city: "" },
    { first_name: "Дмитро", last_name: "Пишка", city: "Ужгород", yob: 2001 },
    { first_name: "Роман", last_name: "Біжко", city: "Мукачеве", yob: 1998 },
    { first_name: "Даніель", last_name: "Шеремета", city: "Ужгород", yob: 2005 },
    { first_name: "Роман", last_name: "Козак", city: "Сєвєродонецьк", yob: 1981 },
    { first_name: "Сергій", last_name: "Шугар", city: "Ужгород", yob: 2010 },
    { first_name: "Юрій", last_name: "Лучко", city: "Мукачеве", yob: 1955 },
    { first_name: "Денис", last_name: "Панкович", city: "Ужгород", yob: 2006 },
    { first_name: "Віктор", last_name: "Гавран", city: "Ужгород", yob: 1999 },
    { first_name: "Давід", last_name: "Шугар", city: "Ужгород", yob: 2008 },
    { first_name: "Андрій", last_name: "Москалюк", city: "Ужгород", yob: 1997 },
    { first_name: "Микола", last_name: "Гуденко", city: "Львів", yob: 1998 },
    { first_name: "Віталій", last_name: "Кравчак", city: "Ужгород", yob: 1982 }
  ];
  
  return createPlayersFromCSV(csvData, 1200);
}

// Calculate player statistics
export function calculatePlayerStats(player: Player, matches: Match[]): PlayerStats {
  const playerMatches = matches.filter(match => 
    match.player1Id === player.id || match.player2Id === player.id
  );

  const wins = playerMatches.filter(match => match.winnerId === player.id).length;
  const losses = playerMatches.length - wins;
  const winRate = playerMatches.length > 0 ? (wins / playerMatches.length) * 100 : 0;

  // Calculate highest and lowest ratings from match history
  const ratings = [player.rating, 1200]; // Поточний рейтинг + початковий рейтинг
  playerMatches.forEach(match => {
    if (match.player1Id === player.id) {
      ratings.push(match.player1RatingBefore);
      ratings.push(match.player1RatingAfter);
    } else {
      ratings.push(match.player2RatingBefore);
      ratings.push(match.player2RatingAfter);
    }
  });

  const highestRating = Math.max(...ratings);
  const lowestRating = Math.min(...ratings);
  const initialRating = 1200; // Початковий рейтинг для всіх гравців
  const ratingChange = player.rating - initialRating;

  return {
    totalMatches: playerMatches.length,
    wins,
    losses,
    winRate: Math.round(winRate),
    highestRating,
    lowestRating,
    ratingChange
  };
}

// Sort players by rating (descending)
export function sortPlayersByRating(players: Player[]): Player[] {
  return [...players].sort((a, b) => b.rating - a.rating);
}

// Simulate a random match between two players with score
export function simulateMatch(player1: Player, player2: Player): Match {
  // Випадковий максимальний рахунок (від 3 до 10, з перевагою популярних значень)
  const popularScores = [3, 5, 5, 7, 7, 7, 10, 10]; // 5 і 7 частіше
  const maxScore = popularScores[Math.floor(Math.random() * popularScores.length)];
  
  // Higher rated player has better chance to win
  const ratingDiff = player1.rating - player2.rating;
  const player1WinProbability = 1 / (1 + Math.pow(10, -ratingDiff / 400));
  
  let player1Score: number, player2Score: number;
  
  // 🔥 ЖОРСТКА СИМУЛЯЦІЯ — великa різниця = домінація
  const calculateSimulationExpectedScore = (ratingDiff: number, maxScore: number): number => {
    let expectedPercentage: number;
    const absDiff = Math.abs(ratingDiff);
    
    // Топ має ВБИВАТИ слабших
    if (absDiff < 50) expectedPercentage = 0.45;
    else if (absDiff < 100) expectedPercentage = 0.35;
    else if (absDiff < 200) expectedPercentage = 0.25;
    else if (absDiff < 300) expectedPercentage = 0.15;
    else if (absDiff < 400) expectedPercentage = 0.1;
    else expectedPercentage = 0.05; // 10:0, 7:0, 5:0
    
    return Math.round(maxScore * expectedPercentage);
  };
  
  if (Math.random() < player1WinProbability) {
    // Player 1 wins
    player1Score = maxScore;
    const expectedPlayer2Score = calculateSimulationExpectedScore(Math.abs(ratingDiff), maxScore);
    player2Score = Math.max(0, Math.min(maxScore - 1, expectedPlayer2Score + Math.floor(Math.random() * 3) - 1));
  } else {
    // Player 2 wins
    player2Score = maxScore;
    const expectedPlayer1Score = calculateSimulationExpectedScore(Math.abs(ratingDiff), maxScore);
    player1Score = Math.max(0, Math.min(maxScore - 1, expectedPlayer1Score + Math.floor(Math.random() * 3) - 1));
  }

  const winnerId = player1Score > player2Score ? player1.id : player2.id;

  // Отримуємо кількість ігор кожного гравця
  const player1Games = player1.matches?.length || 0;
  const player2Games = player2.matches?.length || 0;

  const { player1Change, player2Change } = calculateRatingChange(
    player1.rating,
    player2.rating,
    player1Score,
    player2Score,
    maxScore,
    player1Games,
    player2Games
  );

  // RATING FLOOR — мінімальний рейтинг 1000
  const player1RatingAfter = Math.max(1000, player1.rating + player1Change);
  const player2RatingAfter = Math.max(1000, player2.rating + player2Change);

  const match: Match = {
    id: `match-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    player1Id: player1.id,
    player2Id: player2.id,
    winnerId,
    player1Score,
    player2Score,
    maxScore,
    player1RatingBefore: player1.rating,
    player2RatingBefore: player2.rating,
    player1RatingAfter,
    player2RatingAfter,
    player1RatingChange: player1Change,
    player2RatingChange: player2Change,
    date: new Date()
  };

  return match;
}

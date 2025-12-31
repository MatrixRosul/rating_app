(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/types/index.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Types for the billiard rating system
__turbopack_context__.s([
    "RATING_BANDS",
    ()=>RATING_BANDS
]);
const RATING_BANDS = [
    {
        name: 'Newbie',
        color: 'bg-gray-500',
        textColor: 'text-gray-500',
        minRating: 0,
        maxRating: 1199
    },
    {
        name: 'Pupil',
        color: 'bg-green-500',
        textColor: 'text-green-500',
        minRating: 1200,
        maxRating: 1399
    },
    {
        name: 'Specialist',
        color: 'bg-cyan-500',
        textColor: 'text-cyan-500',
        minRating: 1400,
        maxRating: 1599
    },
    {
        name: 'Expert',
        color: 'bg-blue-500',
        textColor: 'text-blue-500',
        minRating: 1600,
        maxRating: 1799
    },
    {
        name: 'Candidate Master',
        color: 'bg-purple-500',
        textColor: 'text-purple-500',
        minRating: 1800,
        maxRating: 2299
    },
    {
        name: 'Master',
        color: 'bg-orange-500',
        textColor: 'text-orange-500',
        minRating: 2300,
        maxRating: 2499
    },
    {
        name: 'Grandmaster',
        color: 'bg-red-500',
        textColor: 'text-red-500',
        minRating: 2500,
        maxRating: Infinity
    }
];
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/utils/rating.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RATING_CONFIG",
    ()=>RATING_CONFIG,
    "calculatePlayerStats",
    ()=>calculatePlayerStats,
    "calculateRatingChange",
    ()=>calculateRatingChange,
    "createPlayersFromCSV",
    ()=>createPlayersFromCSV,
    "generateInitialPlayers",
    ()=>generateInitialPlayers,
    "generateRandomPlayerName",
    ()=>generateRandomPlayerName,
    "generateRealPlayers",
    ()=>generateRealPlayers,
    "getMatchWeight",
    ()=>getMatchWeight,
    "getMatchWeights",
    ()=>getMatchWeights,
    "getRatingBand",
    ()=>getRatingBand,
    "getStageOrder",
    ()=>getStageOrder,
    "isCMSPlayer",
    ()=>isCMSPlayer,
    "simulateMatch",
    ()=>simulateMatch,
    "sortPlayersByRating",
    ()=>sortPlayersByRating
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/types/index.ts [app-client] (ecmascript)");
;
const RATING_CONFIG = {
    // Зона боротьби за еліту
    ELITE_ENTRY_MIN: 1650,
    ELITE_ENTRY_MAX: 1850,
    ELITE_K_FACTOR: 55,
    ELITE_MAX_CHANGE: 55,
    // Поріг для елітної логіки
    ELITE_THRESHOLD: 1700,
    // Underdog bonus threshold
    UNDERDOG_DIFF: 250,
    UNDERDOG_BONUS: 1.15,
    // Loss protection для новачків
    LOSS_PROTECTION_MIN: 1300,
    LOSS_PROTECTION_MAX: 1600,
    LOSS_PROTECTION_MIN_VALUE: 0.6,
    LOSS_PROTECTION_MAX_VALUE: 1.0,
    // 🔥 Мінімальний рейтинг - знижено до 950 (новачки можуть падати більше)
    RATING_FLOOR: 950
};
function getMatchWeights(stage) {
    const weights = {
        'group': {
            winner: 1.0,
            loser: 1.0
        },
        'round16': {
            winner: 1.1,
            loser: 1.0
        },
        'quarterfinal': {
            winner: 1.3,
            loser: 1.15
        },
        'semifinal': {
            winner: 1.5,
            loser: 1.2
        },
        'final': {
            winner: 1.7,
            loser: 1.25
        } // v3.1: Було 2.0/1.3
    };
    if (!stage) return {
        winner: 1.0,
        loser: 1.0
    };
    const normalized = stage.toLowerCase().trim();
    return weights[normalized] ?? {
        winner: 1.0,
        loser: 1.0
    };
}
function getMatchWeight(stage) {
    const { winner } = getMatchWeights(stage);
    return winner;
}
function getStageOrder(stage) {
    const order = {
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
function calculateRatingChange(player1Rating, player2Rating, player1Score, player2Score, maxScore, player1Games = 30, player2Games = 30, matchWeight = 1.0, stage// 🆕 Стадія турніру для асиметричних множників
) {
    // 1. EXPECTED SCORE (E) — стандартний Elo
    const E1 = 1 / (1 + Math.pow(10, (player2Rating - player1Rating) / 400));
    const E2 = 1 - E1;
    // 2. ACTUAL SCORE (S) — ЕЛІТНА ЛОГІКА для топів
    const scoreDiff = player1Score - player2Score;
    const avgRating = (player1Rating + player2Rating) / 2;
    const isElite = avgRating >= RATING_CONFIG.ELITE_THRESHOLD;
    let S1, S2;
    if (isElite) {
        // 🔥 ДЛЯ ЕЛІТИ: перемога = 1, поразка = 0, рахунок впливає мінімально
        if (player1Score > player2Score) {
            // Переможець отримує майже 1.0, незалежно від рахунку
            S1 = 0.95 + Math.min(0.05, scoreDiff / maxScore * 0.05);
        } else {
            // Програвший отримує майже 0.0
            S1 = 0.05 - Math.min(0.05, Math.abs(scoreDiff) / maxScore * 0.05);
        }
    } else {
        // Стандартна логіка для середніх рейтингів
        S1 = 0.5 + scoreDiff / maxScore * 0.5;
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
    // 6. ПЛАВНИЙ ЗАХИСТ ВІД ПАДІННЯ — новачки ростуть швидше, ніж падають (v3.1 — прогресивний)
    const calculateLossProtection = (rating)=>{
        const { LOSS_PROTECTION_MIN, LOSS_PROTECTION_MAX, LOSS_PROTECTION_MIN_VALUE, LOSS_PROTECTION_MAX_VALUE } = RATING_CONFIG;
        // ✅ v3.1.1: ПРОГРЕСИВНИЙ захист — чим нижче, тим менше захисту
        if (rating < 1200) {
            // При 950: ≈0.65, при 1200: ≈0.95
            const factor = 0.65 + (rating - 950) / 250 * 0.30;
            return Math.max(0.65, Math.min(0.95, factor));
        }
        if (rating < 1300) return 0.70;
        if (rating >= LOSS_PROTECTION_MAX) return 1.0; // Без захисту
        if (rating <= LOSS_PROTECTION_MIN) return LOSS_PROTECTION_MIN_VALUE;
        // Плавна інтерполяція між мін і макс
        const ratio = (rating - LOSS_PROTECTION_MIN) / (LOSS_PROTECTION_MAX - LOSS_PROTECTION_MIN);
        return LOSS_PROTECTION_MIN_VALUE + ratio * (LOSS_PROTECTION_MAX_VALUE - LOSS_PROTECTION_MIN_VALUE);
    };
    if (delta1 < 0) delta1 *= calculateLossProtection(player1Rating);
    if (delta2 < 0) delta2 *= calculateLossProtection(player2Rating);
    // 7. 🔥 АСИМЕТРИЧНИЙ TRANSFER POINTS — слабший програє сильному = більше віддає (v3.1 — ДО maxChange)
    if (player1Rating < player2Rating && player1Score < player2Score) {
        delta1 *= 1.15; // v3.1: Було 1.2 → тепер 1.15
    }
    if (player2Rating < player1Rating && player2Score < player1Score) {
        delta2 *= 1.15; // v3.1: Було 1.2 → тепер 1.15
    }
    // 8. ОБМЕЖЕННЯ МАКСИМУМУ — зона боротьби за еліту має найвищу динаміку (v3.1 — знижено)
    let maxChange;
    const { ELITE_ENTRY_MIN, ELITE_ENTRY_MAX, ELITE_MAX_CHANGE } = RATING_CONFIG;
    if (avgRating >= ELITE_ENTRY_MIN && avgRating <= ELITE_ENTRY_MAX) {
        // 🎯 ЗОНА БОРОТЬБИ ЗА ЕЛІТУ: максимальна динаміка
        maxChange = ELITE_MAX_CHANGE;
    } else if (avgRating >= 1850) {
        // ТОП-МАТЧІ: стабілізація на верху
        maxChange = 55; // v3.1: Було 60
    } else if (avgRating >= 1700) {
        // ЕЛІТНИЙ ШАР: великі стрибки для закріплення
        maxChange = 60; // v3.1: Було 70
    } else if (avgRating >= 1500) {
        // Середній рівень
        maxChange = 50; // v3.1: Було 55
    } else {
        // Новачки
        maxChange = 40; // v3.1: Було 45
    }
    delta1 = Math.max(-maxChange, Math.min(maxChange, delta1));
    delta2 = Math.max(-maxChange, Math.min(maxChange, delta2));
    // 9. UNDERDOG BONUS — апсет реально рухає рейтинг
    const ratingDiff = Math.abs(player1Rating - player2Rating);
    const { UNDERDOG_DIFF, UNDERDOG_BONUS } = RATING_CONFIG;
    if (ratingDiff > UNDERDOG_DIFF) {
        // Слабший переміг сильного
        if (player1Score > player2Score && player1Rating < player2Rating) {
            delta1 *= UNDERDOG_BONUS;
        } else if (player2Score > player1Score && player2Rating < player1Rating) {
            delta2 *= UNDERDOG_BONUS;
        }
    }
    // 🔥 ELITE INFLATION — еліта живиться з середнього шару (v3.1 — тільки справжня еліта)
    // v3.1: 1700+ vs <1400 (було 1650+ vs <1600)
    if (player1Rating >= 1700 && player2Rating < 1400 && player1Score > player2Score) {
        delta1 *= 1.10; // v3.1: Було ×1.15
    } else if (player2Rating >= 1700 && player1Rating < 1400 && player2Score > player1Score) {
        delta2 *= 1.10; // v3.1: Було ×1.15
    }
    // 🔥 ELITE SINK — топ перемагає лоу = створення поінтів (v3.1 — тільки ТОП vs ДНО)
    // v3.1: 1750+ vs <1100, +5 (було 1600+ vs <1300, +10)
    if (player1Rating >= 1750 && player2Rating < 1100 && player1Score > player2Score) {
        delta1 += 5; // v3.1: Було +10
    } else if (player2Rating >= 1750 && player1Rating < 1100 && player2Score > player1Score) {
        delta2 += 5; // v3.1: Було +10
    }
    // 10. 🔥 АСИМЕТРИЧНІ МНОЖНИКИ — фіналісти не караються так жорстко (v3.1 — збалансовано)
    const matchWeights = stage ? getMatchWeights(stage) : {
        winner: matchWeight,
        loser: matchWeight
    };
    if (player1Score > player2Score) {
        // Player 1 wins
        delta1 *= matchWeights.winner;
        delta2 *= matchWeights.loser;
    } else {
        // Player 2 wins
        delta1 *= matchWeights.loser;
        delta2 *= matchWeights.winner;
    }
    // 🏆 ТУРНІРНА ІНФЛЯЦІЯ — переможець ЗАВЖДИ отримує бонус залежно від стадії (v3.1 — знижено)
    const stageInflation = {
        'group': 0,
        'round16': 1,
        'quarterfinal': 2,
        'semifinal': 4,
        'final': 6 // v3.1: Було +10 → тепер +6
    };
    const inflationBonus = stage ? stageInflation[stage.toLowerCase()] ?? 0 : 0;
    // Додаємо інфляцію переможцю (тільки для рейтингу >1000)
    if (player1Score > player2Score) {
        if (player1Rating > 1000) {
            delta1 += inflationBonus; // v3.1.1: Новачки не отримують інфляцію
        }
    } else {
        if (player2Rating > 1000) {
            delta2 += inflationBonus; // v3.1.1: Новачки не отримують інфляцію
        }
    }
    // 🌟 ELITE BONUS — гравець 1500+ перемагає будь-кого → масштабований бонус (v3.1.1)
    // v3.1.1: Знижено поріг 1700 → 1500 (більше гравців отримують бонус)
    if (player1Rating >= 1500 && player1Score > player2Score) {
        const eliteBonus = Math.max(2, Math.min(8, Math.abs(delta1) * 0.15));
        delta1 += eliteBonus;
    }
    if (player2Rating >= 1500 && player2Score > player1Score) {
        const eliteBonus = Math.max(2, Math.min(8, Math.abs(delta2) * 0.15));
        delta2 += eliteBonus;
    }
    // 11. ROUNDED CHANGES
    const player1Change = Math.round(delta1);
    const player2Change = Math.round(delta2);
    return {
        player1Change,
        player2Change
    };
}
// K-Factor based on number of games played and rating (pyramid principle)
function calculateKFactor(gamesPlayed, rating = 1300) {
    // Базові K-фактори для досвіду
    let baseK;
    if (gamesPlayed < 20) baseK = 55;
    else if (gamesPlayed < 60) baseK = 38;
    else baseK = 26;
    const { ELITE_ENTRY_MIN, ELITE_ENTRY_MAX, ELITE_K_FACTOR, ELITE_THRESHOLD } = RATING_CONFIG;
    // 🔥 ЗОНА БОРОТЬБИ ЗА ЕЛІТУ — найвищий K (v3.1 — знижено для стабільності)
    if (rating >= ELITE_ENTRY_MIN && rating <= ELITE_ENTRY_MAX) {
        baseK = Math.max(baseK, 50); // v3.1: Було 55 (ELITE_K_FACTOR)
    } else if (rating >= 1850) {
        // Верхівка: стабілізація після досягнення
        baseK = Math.max(baseK, 38); // v3.1: Було 42
    } else if (rating >= ELITE_THRESHOLD) {
        // ПІКОВИЙ K для активного росту в топ-зону
        baseK = Math.max(baseK, 52); // v3.1: Було 60
    } else if (rating >= 1600) {
        // Вхід в еліту — максимальна динаміка
        baseK = Math.max(baseK, 55); // v3.1: Було 58
    }
    return baseK;
}
// Margin Multiplier — обмежений вплив різниці в рахунку
function calculateMarginMultiplier(scoreDiff, rating = 1300) {
    // Логарифмічна шкала для м'якого зростання
    let base = 1 + Math.min(1.0, Math.log2(1 + scoreDiff) * 0.55);
    // М'яке посилення для топових гравців (великі перемоги більше винагороджуються)
    if (rating >= 1600 && scoreDiff >= 3) {
        base *= 1.08; // +8% для топів при домінації
    }
    return base;
}
function getRatingBand(rating) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RATING_BANDS"].find((band)=>rating >= band.minRating && rating <= band.maxRating) || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RATING_BANDS"][0];
}
function generateRandomPlayerName() {
    const firstNames = [
        'Олександр',
        'Андрій',
        'Василь',
        'Володимир',
        'Дмитро',
        'Євген',
        'Ігор',
        'Іван',
        'Максим',
        'Микола',
        'Олег',
        'Петро',
        'Роман',
        'Сергій',
        'Тарас',
        'Юрій',
        'Богдан',
        'Віктор',
        'Денис',
        'Костянтин',
        'Анна',
        'Вікторія',
        'Діана',
        'Єлизавета',
        'Катерина',
        'Марія',
        'Наталія',
        'Оксана',
        'Світлана',
        'Тетяна',
        'Юлія',
        'Ярослава',
        'Валентина',
        'Галина',
        'Ірина',
        'Людмила',
        'Ольга',
        'Тамара',
        'Алла',
        'Лариса'
    ];
    const lastNames = [
        'Петренко',
        'Іваненко',
        'Коваленко',
        'Бондаренко',
        'Мельник',
        'Шевченко',
        'Ткаченко',
        'Кравченко',
        'Полтавець',
        'Савченко',
        'Романенко',
        'Левченко',
        'Гриценко',
        'Павленко',
        'Марченко',
        'Демченко',
        'Лисенко',
        'Руденко',
        'Мороз',
        'Кравець',
        'Кузнецов',
        'Попов',
        'Соколов',
        'Лебедєв',
        'Козлов'
    ];
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    return `${firstName} ${lastName}`;
}
function generateInitialPlayers(count = 100, baseRating = 1000) {
    const players = [];
    const usedNames = new Set();
    // Special players with different rating ranges for demonstration
    const specialPlayers = [
        {
            name: 'NoobMaster69',
            rating: 800
        },
        {
            name: 'BeginnerLuck',
            rating: 1300
        },
        {
            name: 'GreenPlayer',
            rating: 1250
        },
        {
            name: 'StudyHard',
            rating: 1350
        },
        {
            name: 'CyanSpecial',
            rating: 1450
        },
        {
            name: 'TechnicalPro',
            rating: 1550
        },
        {
            name: 'BlueExpert',
            rating: 1700
        },
        {
            name: 'SkillMaster',
            rating: 1850
        },
        {
            name: 'PurpleCandidate',
            rating: 1950
        },
        {
            name: 'AlmostMaster',
            rating: 2050
        },
        {
            name: 'OrangeMaster',
            rating: 2150
        },
        {
            name: 'TrueMaster',
            rating: 2250
        },
        {
            name: 'IntlMaster',
            rating: 2350
        },
        {
            name: 'RedGrandmaster',
            rating: 2450
        },
        {
            name: 'LegendaryGM',
            rating: 2600
        }
    ];
    // Add special players first
    specialPlayers.forEach((special, index)=>{
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
    for(let i = specialPlayers.length; i < count; i++){
        let name = generateRandomPlayerName();
        // Ensure unique names
        while(usedNames.has(name)){
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
// 🏆 Список КМС (Кандидатів у Майстри Спорту) - реальні звання
const CMS_PLAYERS = [
    {
        first_name: "Василь",
        last_name: "Єгоров"
    },
    {
        first_name: "Степан",
        last_name: "Ковач"
    },
    {
        first_name: "Віталій",
        last_name: "Балко"
    },
    {
        first_name: "Софія",
        last_name: "Дудченко"
    },
    {
        first_name: "Марія",
        last_name: "Левківська"
    },
    {
        first_name: "Максим",
        last_name: "Король"
    },
    {
        first_name: "Микола",
        last_name: "Шикітка"
    },
    {
        first_name: "Володимир",
        last_name: "Коротя"
    },
    {
        first_name: "Артур",
        last_name: "Зелінко"
    },
    {
        first_name: "Євген",
        last_name: "Драгула"
    },
    {
        first_name: "Михайло",
        last_name: "Сличко"
    },
    {
        first_name: "Микола",
        last_name: "Гуденко"
    },
    {
        first_name: "Стефанія",
        last_name: "Церковник"
    },
    {
        first_name: "Іван",
        last_name: "Пелінкевич"
    },
    {
        first_name: "Юлій",
        last_name: "Гараксим"
    },
    {
        first_name: "Олександр",
        last_name: "Сайков"
    },
    {
        first_name: "Микола",
        last_name: "Леміш"
    }
];
function isCMSPlayer(firstName, lastName) {
    return CMS_PLAYERS.some((cms)=>cms.first_name === firstName && cms.last_name === lastName);
}
function createPlayersFromCSV(csvData, baseRating = 1300) {
    const currentYear = new Date().getFullYear();
    return csvData.map((data, index)=>{
        const fullName = `${data.first_name} ${data.last_name}`.trim();
        const yearOfBirth = data.yob || null;
        const age = yearOfBirth ? currentYear - yearOfBirth : null;
        const isCMS = isCMSPlayer(data.first_name, data.last_name);
        // 🏆 КМС починають з 1600, інші з baseRating (зазвичай 1300)
        const startingRating = isCMS ? 1600 : baseRating;
        // const startingRating = baseRating; // Всі починають однаково
        return {
            id: `real-player-${index + 1}`,
            name: fullName,
            firstName: data.first_name,
            lastName: data.last_name,
            city: data.city || '',
            yearOfBirth: yearOfBirth || undefined,
            age: age || undefined,
            rating: startingRating,
            initialRating: startingRating,
            isCMS,
            matches: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };
    });
}
function generateRealPlayers() {
    const csvData = [
        {
            first_name: "Юлій",
            last_name: "Гараксим",
            city: "Ужгород",
            yob: 1985
        },
        {
            first_name: "Артур",
            last_name: "Зелінко",
            city: "Перечин",
            yob: 1991
        },
        {
            first_name: "Володимир",
            last_name: "Коротя",
            city: "Ужгород",
            yob: 1985
        },
        {
            first_name: "Стефанія",
            last_name: "Церковник",
            city: "Ужгород",
            yob: 2008
        },
        {
            first_name: "Євген",
            last_name: "Драгула",
            city: "Ужгород",
            yob: 1976
        },
        {
            first_name: "Максим",
            last_name: "Король",
            city: "Ужгород",
            yob: 2011
        },
        {
            first_name: "Михайло",
            last_name: "Сличко",
            city: "Воловець",
            yob: 1997
        },
        {
            first_name: "Роман",
            last_name: "Качур",
            city: "Ужгород",
            yob: 2001
        },
        {
            first_name: "Микола",
            last_name: "Шикітка",
            city: "Тарнівці",
            yob: 1973
        },
        {
            first_name: "Роман",
            last_name: "Чийпеш",
            city: "Ужгород",
            yob: 1982
        },
        {
            first_name: "Максим",
            last_name: "Росул",
            city: "Ужгород",
            yob: 2005
        },
        {
            first_name: "Микола",
            last_name: "Леміш",
            city: "Ужгород",
            yob: 1979
        },
        {
            first_name: "Роман",
            last_name: "Церковник",
            city: "Ужгород",
            yob: 1976
        },
        {
            first_name: "Олександр",
            last_name: "Лизанець",
            city: "Ужгород",
            yob: 1985
        },
        {
            first_name: "Андрій",
            last_name: "Сергєєв",
            city: "Сєвєродонецьк",
            yob: 1975
        },
        {
            first_name: "Сергій",
            last_name: "Король",
            city: "Ужгород",
            yob: 1978
        },
        {
            first_name: "Олексій",
            last_name: "Проскурін",
            city: "Харків",
            yob: 1979
        },
        {
            first_name: "Євген",
            last_name: "Кравчак",
            city: "Чоп",
            yob: 1987
        },
        {
            first_name: "Володимир",
            last_name: "Комарницький",
            city: "Ужгород",
            yob: 1975
        },
        {
            first_name: "Едуард",
            last_name: "Олах",
            city: "Ужгород",
            yob: 2006
        },
        {
            first_name: "Олег",
            last_name: "Галушко",
            city: "Ужгород",
            yob: 1996
        },
        {
            first_name: "Рамір",
            last_name: "Лацко",
            city: "Ужгород",
            yob: 2007
        },
        {
            first_name: "Іван",
            last_name: "Смочков",
            city: "Ужгород",
            yob: 1994
        },
        {
            first_name: "Іван",
            last_name: "Боршош",
            city: "Іршава",
            yob: 1991
        },
        {
            first_name: "Олексій",
            last_name: "Бамбушкар",
            city: "Ужгород",
            yob: 1989
        },
        {
            first_name: "Степан",
            last_name: "Ковач",
            city: "Слов'янськ",
            yob: 2004
        },
        {
            first_name: "Евген",
            last_name: "Куртинець",
            city: "Іршава",
            yob: 1995
        },
        {
            first_name: "Тиберій",
            last_name: "Тирпак",
            city: "Ужгород",
            yob: 2012
        },
        {
            first_name: "Олександр",
            last_name: "Грін",
            city: "Ужгород",
            yob: 1994
        },
        {
            first_name: "Олександр",
            last_name: "Шахівський",
            city: "Мукачеве",
            yob: 1992
        },
        {
            first_name: "Марк",
            last_name: "Кольмар",
            city: "Слов'янськ",
            yob: 2004
        },
        {
            first_name: "Мартін",
            last_name: "Довганич",
            city: "Ужгород",
            yob: 2000
        },
        {
            first_name: "Марія",
            last_name: "Левківська",
            city: "Ужгород",
            yob: 1983
        },
        {
            first_name: "Олександр",
            last_name: "Мимренко",
            city: "Ужгород",
            yob: 1992
        },
        {
            first_name: "Євген",
            last_name: "Довганич",
            city: "Ужгород",
            yob: 1997
        },
        {
            first_name: "Марʼян",
            last_name: "Матіїшин",
            city: "Ужгород",
            yob: 1977
        },
        {
            first_name: "Володимир",
            last_name: "Шикітка",
            city: "Мукачеве",
            yob: 1977
        },
        {
            first_name: "Юрій",
            last_name: "Леміш",
            city: "Ужгород",
            yob: 2006
        },
        {
            first_name: "Олександр",
            last_name: "Федів",
            city: "Мукачеве",
            yob: 1986
        },
        {
            first_name: "Валентин",
            last_name: "Свалявчик",
            city: "Ужгород",
            yob: 1982
        },
        {
            first_name: "Володимир",
            last_name: "Таранчук",
            city: "Ужгород",
            yob: 1993
        },
        {
            first_name: "Бардо",
            last_name: "Адам",
            city: "Ужгород",
            yob: 2007
        },
        {
            first_name: "Андрій",
            last_name: "Банк",
            city: "Ужгород",
            yob: 2007
        },
        {
            first_name: "Віктор",
            last_name: "Загуменний",
            city: "Ужгород",
            yob: 1988
        },
        {
            first_name: "Руслан",
            last_name: "Шмигановський",
            city: "Яготин",
            yob: 1988
        },
        {
            first_name: "Олександр",
            last_name: "Миронов",
            city: "Ужгород",
            yob: 1985
        },
        {
            first_name: "Олександр",
            last_name: "Іванович",
            city: "Слов'янськ",
            yob: 2003
        },
        {
            first_name: "Іван",
            last_name: "Гурський",
            city: "Ужгород",
            yob: 1991
        },
        {
            first_name: "Олександр",
            last_name: "Кулик",
            city: "Ужгород",
            yob: 1983
        },
        {
            first_name: "Кирило",
            last_name: "Голяна",
            city: "Ужгород",
            yob: 2005
        },
        {
            first_name: "Павло",
            last_name: "Бідзіля",
            city: "Виноградів",
            yob: 1989
        },
        {
            first_name: "Олександр",
            last_name: "Лендєл",
            city: "Мукачеве",
            yob: 1992
        },
        {
            first_name: "Сергій",
            last_name: "Данашевський",
            city: "Мукачеве",
            yob: 1984
        },
        {
            first_name: "Валентин",
            last_name: "Лендєл",
            city: "Мукачеве",
            yob: 2002
        },
        {
            first_name: "Андрій",
            last_name: "Новицький",
            city: "Ужгород",
            yob: 1994
        },
        {
            first_name: "Максим",
            last_name: "Шишко",
            city: "Ужгород",
            yob: 2001
        },
        {
            first_name: "Золтан",
            last_name: "Горос",
            city: "Ужгород",
            yob: 1979
        },
        {
            first_name: "Назар",
            last_name: "Олах",
            city: "Ужгород",
            yob: 2007
        },
        {
            first_name: "Микола",
            last_name: "Стегней",
            city: "Ужгород",
            yob: 1985
        },
        {
            first_name: "Олександр",
            last_name: "Жиденко",
            city: "Мукачеве",
            yob: 1952
        },
        {
            first_name: "Михайло",
            last_name: "Пономаренко",
            city: "Київ",
            yob: 1986
        },
        {
            first_name: "Володимир",
            last_name: "Гобрей",
            city: "Мукачеве",
            yob: 1988
        },
        {
            first_name: "Деніел",
            last_name: "Кедебец",
            city: "Ужгород",
            yob: 1996
        },
        {
            first_name: "Тарас",
            last_name: "Потапчук",
            city: "Ужгород",
            yob: 1980
        },
        {
            first_name: "Артур",
            last_name: "Попфалуші",
            city: "Мукачеве",
            yob: 1999
        },
        {
            first_name: "Михайло",
            last_name: "Феделещак",
            city: "Ужгород",
            yob: 2006
        },
        {
            first_name: "Едуард",
            last_name: "Амосов",
            city: "",
            yob: 1984
        },
        {
            first_name: "Юрій",
            last_name: "Переста",
            city: "Мукачеве",
            yob: 2003
        },
        {
            first_name: "Михайло",
            last_name: "Бойко",
            city: "",
            yob: 1999
        },
        {
            first_name: "Іван",
            last_name: "Бойчук",
            city: "Ужгород",
            yob: 2006
        },
        {
            first_name: "Андрій",
            last_name: "Баліцький",
            city: "Ужгород",
            yob: 2006
        },
        {
            first_name: "Василь",
            last_name: "Єгоров",
            city: "Ужгород",
            yob: 1988
        },
        {
            first_name: "Андрій",
            last_name: "Синичка",
            city: "Ужгород",
            yob: 1990
        },
        {
            first_name: "Юрій",
            last_name: "Поліщук",
            city: "Ужгород",
            yob: 1986
        },
        {
            first_name: "Олександр",
            last_name: "Шевелюк",
            city: "Ужгород",
            yob: 1990
        },
        {
            first_name: "Богдан",
            last_name: "Порох",
            city: "Павлоград",
            yob: 2000
        },
        {
            first_name: "Роман",
            last_name: "Гурчумелія",
            city: "Ужгород",
            yob: 1983
        },
        {
            first_name: "Віталій",
            last_name: "Балко",
            city: "Мукачеве",
            yob: 1983
        },
        {
            first_name: "Софія",
            last_name: "Дудченко",
            city: "Кривий Ріг",
            yob: 2010
        },
        {
            first_name: "Владіслав",
            last_name: "Шикітка",
            city: "Ужгород",
            yob: 2003
        },
        {
            first_name: "Віктор",
            last_name: "Дейнеко",
            city: "Чоп",
            yob: 1981
        },
        {
            first_name: "Володимир",
            last_name: "Лукашенко",
            city: "Черкаси",
            yob: 1988
        },
        {
            first_name: "Василь",
            last_name: "Федина",
            city: "Тячів",
            yob: 1974
        },
        {
            first_name: "Василь",
            last_name: "Тотін",
            city: "Ужгород",
            yob: 2000
        },
        {
            first_name: "Архип",
            last_name: "Онищенко",
            city: "Харків",
            yob: 2005
        },
        {
            first_name: "Іван",
            last_name: "Пелінкевич",
            city: "Луцьк",
            yob: 1990
        },
        {
            first_name: "Віталій",
            last_name: "Мельзаковський",
            city: "Ужгород",
            yob: 1987
        },
        {
            first_name: "Томі",
            last_name: "Човка",
            city: "Ужгород",
            yob: 2008
        },
        {
            first_name: "Мартін",
            last_name: "Пап",
            city: "Ужгород",
            yob: 2003
        },
        {
            first_name: "Ігор",
            last_name: "Кузьмін",
            city: "Ужгород",
            yob: 1987
        },
        {
            first_name: "Василь",
            last_name: "Продан",
            city: "Ужгород",
            yob: 1987
        },
        {
            first_name: "Сергій",
            last_name: "Бреславець",
            city: "Харьков"
        },
        {
            first_name: "Золтан",
            last_name: "Горват",
            city: "Ужгород",
            yob: 2004
        },
        {
            first_name: "Сергій",
            last_name: "Шерегій",
            city: "Іршава",
            yob: 1979
        },
        {
            first_name: "Олександр",
            last_name: "Пастернак",
            city: "Ужгород",
            yob: 1995
        },
        {
            first_name: "Максим",
            last_name: "Гріненко",
            city: "Суми",
            yob: 1981
        },
        {
            first_name: "Сергій",
            last_name: "Королев",
            city: "Ужгород"
        },
        {
            first_name: "Єлісей",
            last_name: "Роганов",
            city: "Ужгород",
            yob: 2001
        },
        {
            first_name: "Сергій",
            last_name: "Кобака",
            city: "Мукачеве",
            yob: 1972
        },
        {
            first_name: "Ігор",
            last_name: "Фединишинець",
            city: "Ужгород",
            yob: 1979
        },
        {
            first_name: "Василь",
            last_name: "Туряниця",
            city: "Ужгород"
        },
        {
            first_name: "Аванес",
            last_name: "Кальмар",
            city: "Слов'янськ"
        },
        {
            first_name: "Владислав",
            last_name: "Кузьма",
            city: "Ужгород",
            yob: 2000
        },
        {
            first_name: "Артур",
            last_name: "Лацко",
            city: "Ужгород",
            yob: 2006
        },
        {
            first_name: "Юрій",
            last_name: "Журавльов",
            city: "Ужгород",
            yob: 1982
        },
        {
            first_name: "Руслан",
            last_name: "Косору",
            city: "Ужгород",
            yob: 1989
        },
        {
            first_name: "Джоні",
            last_name: "Бругош",
            city: ""
        },
        {
            first_name: "Владислав",
            last_name: "Красніков",
            city: "Ужгород",
            yob: 2002
        },
        {
            first_name: "Ілля",
            last_name: "Гулєватий",
            city: ""
        },
        {
            first_name: "Дмитро",
            last_name: "Пишка",
            city: "Ужгород",
            yob: 2001
        },
        {
            first_name: "Роман",
            last_name: "Біжко",
            city: "Мукачеве",
            yob: 1998
        },
        {
            first_name: "Даніель",
            last_name: "Шеремета",
            city: "Ужгород",
            yob: 2005
        },
        {
            first_name: "Роман",
            last_name: "Козак",
            city: "Сєвєродонецьк",
            yob: 1981
        },
        {
            first_name: "Сергій",
            last_name: "Шугар",
            city: "Ужгород",
            yob: 2010
        },
        {
            first_name: "Юрій",
            last_name: "Лучко",
            city: "Мукачеве",
            yob: 1955
        },
        {
            first_name: "Денис",
            last_name: "Панкович",
            city: "Ужгород",
            yob: 2006
        },
        {
            first_name: "Віктор",
            last_name: "Гавран",
            city: "Ужгород",
            yob: 1999
        },
        {
            first_name: "Давід",
            last_name: "Шугар",
            city: "Ужгород",
            yob: 2008
        },
        {
            first_name: "Андрій",
            last_name: "Москалюк",
            city: "Ужгород",
            yob: 1997
        },
        {
            first_name: "Микола",
            last_name: "Гуденко",
            city: "Львів",
            yob: 1998
        },
        {
            first_name: "Віталій",
            last_name: "Кравчак",
            city: "Ужгород",
            yob: 1982
        }
    ];
    return createPlayersFromCSV(csvData, 1300);
}
function calculatePlayerStats(player, matches) {
    const playerMatches = matches.filter((match)=>match.player1Id === player.id || match.player2Id === player.id);
    const wins = playerMatches.filter((match)=>match.winnerId === player.id).length;
    const losses = playerMatches.length - wins;
    const winRate = playerMatches.length > 0 ? wins / playerMatches.length * 100 : 0;
    // Calculate highest and lowest ratings from match history
    const ratings = [
        player.rating,
        player.initialRating ?? 1300
    ]; // Поточний рейтинг + початковий рейтинг
    playerMatches.forEach((match)=>{
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
    const initialRating = player.initialRating ?? 1300; // Початковий рейтинг для всіх гравців
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
function sortPlayersByRating(players) {
    return [
        ...players
    ].sort((a, b)=>b.rating - a.rating);
}
function simulateMatch(player1, player2) {
    // Випадковий максимальний рахунок (від 3 до 10, з перевагою популярних значень)
    const popularScores = [
        3,
        5,
        5,
        7,
        7,
        7,
        10,
        10
    ]; // 5 і 7 частіше
    const maxScore = popularScores[Math.floor(Math.random() * popularScores.length)];
    // Higher rated player has better chance to win
    const ratingDiff = player1.rating - player2.rating;
    const player1WinProbability = 1 / (1 + Math.pow(10, -ratingDiff / 400));
    let player1Score, player2Score;
    // 🔥 ЖОРСТКА СИМУЛЯЦІЯ — великa різниця = домінація
    const calculateSimulationExpectedScore = (ratingDiff, maxScore)=>{
        let expectedPercentage;
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
    const { player1Change, player2Change } = calculateRatingChange(player1.rating, player2.rating, player1Score, player2Score, maxScore, player1Games, player2Games);
    // RATING FLOOR — мінімальний рейтинг 900 (знижено з 1000)
    const player1RatingAfter = Math.max(RATING_CONFIG.RATING_FLOOR, player1.rating + player1Change);
    const player2RatingAfter = Math.max(RATING_CONFIG.RATING_FLOOR, player2.rating + player2Change);
    const match = {
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/PlayerCard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PlayerCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rating$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/rating.ts [app-client] (ecmascript)");
'use client';
;
;
;
;
function PlayerCard(t0) {
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(59);
    if ($[0] !== "e06e45620d8902cadd1cd63c9352e519da80bf429127466e3ee04cc86eb9b6c6") {
        for(let $i = 0; $i < 59; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "e06e45620d8902cadd1cd63c9352e519da80bf429127466e3ee04cc86eb9b6c6";
    }
    const { player, rank, showRank: t1, showPeakRating: t2 } = t0;
    const showRank = t1 === undefined ? false : t1;
    const showPeakRating = t2 === undefined ? false : t2;
    const displayRating = showPeakRating && player.peakRating ? player.peakRating : player.rating;
    let T0;
    let ratingBand;
    let t3;
    let t4;
    let t5;
    if ($[1] !== displayRating || $[2] !== player.id || $[3] !== player.peakRating) {
        ratingBand = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rating$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRatingBand"])(displayRating);
        player.peakRating ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rating$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRatingBand"])(player.peakRating) : null;
        const getBorderColor = _PlayerCardGetBorderColor;
        T0 = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"];
        t4 = `/player/${player.id}`;
        t5 = "block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-3 border-l-4";
        t3 = getBorderColor(ratingBand.color);
        $[1] = displayRating;
        $[2] = player.id;
        $[3] = player.peakRating;
        $[4] = T0;
        $[5] = ratingBand;
        $[6] = t3;
        $[7] = t4;
        $[8] = t5;
    } else {
        T0 = $[4];
        ratingBand = $[5];
        t3 = $[6];
        t4 = $[7];
        t5 = $[8];
    }
    let t6;
    if ($[9] !== t3) {
        t6 = {
            borderLeftColor: t3
        };
        $[9] = t3;
        $[10] = t6;
    } else {
        t6 = $[10];
    }
    let t7;
    if ($[11] !== rank || $[12] !== showRank) {
        t7 = showRank && rank && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-center w-6 h-6 bg-gray-100 rounded-full text-xs font-semibold text-gray-600",
            children: rank
        }, void 0, false, {
            fileName: "[project]/src/components/PlayerCard.tsx",
            lineNumber: 73,
            columnNumber: 30
        }, this);
        $[11] = rank;
        $[12] = showRank;
        $[13] = t7;
    } else {
        t7 = $[13];
    }
    const t8 = `font-semibold text-base ${ratingBand.textColor} hover:opacity-80 transition-colors`;
    let t9;
    if ($[14] !== player.name || $[15] !== t8) {
        t9 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
            className: t8,
            children: player.name
        }, void 0, false, {
            fileName: "[project]/src/components/PlayerCard.tsx",
            lineNumber: 83,
            columnNumber: 10
        }, this);
        $[14] = player.name;
        $[15] = t8;
        $[16] = t9;
    } else {
        t9 = $[16];
    }
    let t10;
    if ($[17] !== player.isCMS) {
        t10 = player.isCMS && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "text-amber-600 text-xs font-extrabold italic tracking-wide px-1.5 py-0.5 bg-amber-50 rounded border border-amber-300",
            title: "\u041A\u0430\u043D\u0434\u0438\u0434\u0430\u0442 \u0443 \u041C\u0430\u0439\u0441\u0442\u0440\u0438 \u0421\u043F\u043E\u0440\u0442\u0443 \u0423\u043A\u0440\u0430\u0457\u043D\u0438",
            style: {
                transform: "skewX(-3deg)"
            },
            children: "КМСУ"
        }, void 0, false, {
            fileName: "[project]/src/components/PlayerCard.tsx",
            lineNumber: 92,
            columnNumber: 27
        }, this);
        $[17] = player.isCMS;
        $[18] = t10;
    } else {
        t10 = $[18];
    }
    let t11;
    if ($[19] !== t10 || $[20] !== t9) {
        t11 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center gap-2",
            children: [
                t9,
                t10
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/PlayerCard.tsx",
            lineNumber: 102,
            columnNumber: 11
        }, this);
        $[19] = t10;
        $[20] = t9;
        $[21] = t11;
    } else {
        t11 = $[21];
    }
    const t12 = player.yearOfBirth && `${player.yearOfBirth} р.н.`;
    let t13;
    if ($[22] !== player.city || $[23] !== ratingBand.name || $[24] !== t12) {
        t13 = [
            ratingBand.name,
            player.city,
            t12
        ].filter(Boolean);
        $[22] = player.city;
        $[23] = ratingBand.name;
        $[24] = t12;
        $[25] = t13;
    } else {
        t13 = $[25];
    }
    const t14 = t13.join(" \u2022 ");
    let t15;
    if ($[26] !== t14) {
        t15 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
            className: "text-xs text-gray-500",
            children: t14
        }, void 0, false, {
            fileName: "[project]/src/components/PlayerCard.tsx",
            lineNumber: 123,
            columnNumber: 11
        }, this);
        $[26] = t14;
        $[27] = t15;
    } else {
        t15 = $[27];
    }
    let t16;
    if ($[28] !== t11 || $[29] !== t15) {
        t16 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex-1",
            children: [
                t11,
                t15
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/PlayerCard.tsx",
            lineNumber: 131,
            columnNumber: 11
        }, this);
        $[28] = t11;
        $[29] = t15;
        $[30] = t16;
    } else {
        t16 = $[30];
    }
    let t17;
    if ($[31] !== t16 || $[32] !== t7) {
        t17 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center space-x-2",
            children: [
                t7,
                t16
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/PlayerCard.tsx",
            lineNumber: 140,
            columnNumber: 11
        }, this);
        $[31] = t16;
        $[32] = t7;
        $[33] = t17;
    } else {
        t17 = $[33];
    }
    let t18;
    if ($[34] !== player.matches || $[35] !== player.peakRating || $[36] !== player.rating || $[37] !== ratingBand.textColor || $[38] !== showPeakRating) {
        t18 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-right",
            children: showPeakRating && player.peakRating ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `text-lg font-bold ${ratingBand.textColor}`,
                        children: player.peakRating
                    }, void 0, false, {
                        fileName: "[project]/src/components/PlayerCard.tsx",
                        lineNumber: 149,
                        columnNumber: 80
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-xs text-gray-500",
                        children: "пік рейтингу"
                    }, void 0, false, {
                        fileName: "[project]/src/components/PlayerCard.tsx",
                        lineNumber: 149,
                        columnNumber: 166
                    }, this),
                    player.peakRating !== player.rating && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-xs text-gray-400 mt-0.5",
                        children: [
                            "зараз: ",
                            player.rating
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/PlayerCard.tsx",
                        lineNumber: 149,
                        columnNumber: 263
                    }, this)
                ]
            }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `text-lg font-bold ${ratingBand.textColor}`,
                        children: player.rating
                    }, void 0, false, {
                        fileName: "[project]/src/components/PlayerCard.tsx",
                        lineNumber: 149,
                        columnNumber: 346
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-xs text-gray-500",
                        children: [
                            player.matches.length,
                            " матчів"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/PlayerCard.tsx",
                        lineNumber: 149,
                        columnNumber: 428
                    }, this)
                ]
            }, void 0, true)
        }, void 0, false, {
            fileName: "[project]/src/components/PlayerCard.tsx",
            lineNumber: 149,
            columnNumber: 11
        }, this);
        $[34] = player.matches;
        $[35] = player.peakRating;
        $[36] = player.rating;
        $[37] = ratingBand.textColor;
        $[38] = showPeakRating;
        $[39] = t18;
    } else {
        t18 = $[39];
    }
    let t19;
    if ($[40] !== t17 || $[41] !== t18) {
        t19 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-between",
            children: [
                t17,
                t18
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/PlayerCard.tsx",
            lineNumber: 161,
            columnNumber: 11
        }, this);
        $[40] = t17;
        $[41] = t18;
        $[42] = t19;
    } else {
        t19 = $[42];
    }
    const t20 = `w-2 h-2 rounded-full ${ratingBand.color}`;
    let t21;
    if ($[43] !== ratingBand.name || $[44] !== t20) {
        t21 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: t20,
            title: ratingBand.name
        }, void 0, false, {
            fileName: "[project]/src/components/PlayerCard.tsx",
            lineNumber: 171,
            columnNumber: 11
        }, this);
        $[43] = ratingBand.name;
        $[44] = t20;
        $[45] = t21;
    } else {
        t21 = $[45];
    }
    const t22 = `text-xs font-medium ${ratingBand.textColor}`;
    let t23;
    if ($[46] !== ratingBand.name || $[47] !== t22) {
        t23 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: t22,
            children: ratingBand.name
        }, void 0, false, {
            fileName: "[project]/src/components/PlayerCard.tsx",
            lineNumber: 181,
            columnNumber: 11
        }, this);
        $[46] = ratingBand.name;
        $[47] = t22;
        $[48] = t23;
    } else {
        t23 = $[48];
    }
    let t24;
    if ($[49] !== t21 || $[50] !== t23) {
        t24 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "mt-2 flex items-center space-x-2",
            children: [
                t21,
                t23
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/PlayerCard.tsx",
            lineNumber: 190,
            columnNumber: 11
        }, this);
        $[49] = t21;
        $[50] = t23;
        $[51] = t24;
    } else {
        t24 = $[51];
    }
    let t25;
    if ($[52] !== T0 || $[53] !== t19 || $[54] !== t24 || $[55] !== t4 || $[56] !== t5 || $[57] !== t6) {
        t25 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(T0, {
            href: t4,
            className: t5,
            style: t6,
            children: [
                t19,
                t24
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/PlayerCard.tsx",
            lineNumber: 199,
            columnNumber: 11
        }, this);
        $[52] = T0;
        $[53] = t19;
        $[54] = t24;
        $[55] = t4;
        $[56] = t5;
        $[57] = t6;
        $[58] = t25;
    } else {
        t25 = $[58];
    }
    return t25;
}
_c = PlayerCard;
function _PlayerCardGetBorderColor(colorClass) {
    const colorMap = {
        "bg-gray-500": "#6B7280",
        "bg-green-500": "#10B981",
        "bg-cyan-500": "#06B6D4",
        "bg-blue-500": "#3B82F6",
        "bg-purple-500": "#8B5CF6",
        "bg-orange-500": "#F97316",
        "bg-orange-600": "#EA580C",
        "bg-red-500": "#EF4444"
    };
    return colorMap[colorClass] || "#6B7280";
}
var _c;
__turbopack_context__.k.register(_c, "PlayerCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/Leaderboard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Leaderboard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rating$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/rating.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$PlayerCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/PlayerCard.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
function Leaderboard(t0) {
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(75);
    if ($[0] !== "6c0dad2e5eaf1314a3fa7ea51605b7d5db438c636d93f7094226f96fd2e3f6c7") {
        for(let $i = 0; $i < 75; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "6c0dad2e5eaf1314a3fa7ea51605b7d5db438c636d93f7094226f96fd2e3f6c7";
    }
    const { players, matches } = t0;
    const [searchTerm, setSearchTerm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [selectedRating, setSelectedRating] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("all");
    const [sortBy, setSortBy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("current");
    const [sortDescending, setSortDescending] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    let t1;
    if ($[1] !== matches || $[2] !== players) {
        let t2;
        if ($[4] !== matches) {
            t2 = ({
                "Leaderboard[(anonymous)()]": (player_0)=>{
                    const stats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rating$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculatePlayerStats"])(player_0, matches);
                    return {
                        ...player_0,
                        peakRating: stats.highestRating
                    };
                }
            })["Leaderboard[(anonymous)()]"];
            $[4] = matches;
            $[5] = t2;
        } else {
            t2 = $[5];
        }
        t1 = players.filter(_LeaderboardPlayersFilter).map(t2);
        $[1] = matches;
        $[2] = players;
        $[3] = t1;
    } else {
        t1 = $[3];
    }
    const playersWithPeakRating = t1;
    let t2;
    if ($[6] !== playersWithPeakRating || $[7] !== sortBy) {
        let filtered = playersWithPeakRating;
        if (sortBy === "cms") {
            filtered = filtered.filter(_LeaderboardFilteredFilter);
        }
        if (sortBy === "peak") {
            t2 = [
                ...filtered
            ].sort(_LeaderboardAnonymous);
        } else {
            let t3;
            if ($[9] !== filtered) {
                t3 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rating$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sortPlayersByRating"])(filtered);
                $[9] = filtered;
                $[10] = t3;
            } else {
                t3 = $[10];
            }
            t2 = t3;
        }
        $[6] = playersWithPeakRating;
        $[7] = sortBy;
        $[8] = t2;
    } else {
        t2 = $[8];
    }
    const sortedPlayers = t2;
    let t3;
    let t4;
    let t5;
    let t6;
    let t7;
    if ($[11] !== players.length || $[12] !== searchTerm || $[13] !== selectedRating || $[14] !== sortBy || $[15] !== sortDescending || $[16] !== sortedPlayers) {
        const orderedPlayers = sortDescending ? sortedPlayers : [
            ...sortedPlayers
        ].reverse();
        let t8;
        if ($[22] !== searchTerm || $[23] !== selectedRating) {
            t8 = ({
                "Leaderboard[orderedPlayers.filter()]": (player_1)=>{
                    const matchesSearch = player_1.name.toLowerCase().includes(searchTerm.toLowerCase());
                    if (selectedRating === "all") {
                        return matchesSearch;
                    }
                    const ratingBand = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rating$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRatingBand"])(player_1.rating);
                    return matchesSearch && ratingBand.name === selectedRating;
                }
            })["Leaderboard[orderedPlayers.filter()]"];
            $[22] = searchTerm;
            $[23] = selectedRating;
            $[24] = t8;
        } else {
            t8 = $[24];
        }
        const filteredPlayers = orderedPlayers.filter(t8);
        let t9;
        if ($[25] === Symbol.for("react.memo_cache_sentinel")) {
            t9 = [
                "all",
                "Newbie",
                "Pupil",
                "Specialist",
                "Expert",
                "Candidate Master",
                "Master",
                "International Master",
                "Grandmaster"
            ];
            $[25] = t9;
        } else {
            t9 = $[25];
        }
        const ratingBands = t9;
        t5 = "space-y-4";
        let t10;
        if ($[26] === Symbol.for("react.memo_cache_sentinel")) {
            t10 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                className: "text-2xl font-bold text-gray-900 mb-1",
                children: "Рейтинг гравців у більярд"
            }, void 0, false, {
                fileName: "[project]/src/components/Leaderboard.tsx",
                lineNumber: 117,
                columnNumber: 13
            }, this);
            $[26] = t10;
        } else {
            t10 = $[26];
        }
        if ($[27] !== players.length) {
            t6 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center",
                children: [
                    t10,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-gray-600",
                        children: [
                            "Всього гравців: ",
                            players.length
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/Leaderboard.tsx",
                        lineNumber: 123,
                        columnNumber: 46
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/Leaderboard.tsx",
                lineNumber: 123,
                columnNumber: 12
            }, this);
            $[27] = players.length;
            $[28] = t6;
        } else {
            t6 = $[28];
        }
        let t11;
        if ($[29] === Symbol.for("react.memo_cache_sentinel")) {
            t11 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                htmlFor: "search",
                className: "block text-sm font-medium text-gray-700 mb-1",
                children: "Пошук гравця"
            }, void 0, false, {
                fileName: "[project]/src/components/Leaderboard.tsx",
                lineNumber: 131,
                columnNumber: 13
            }, this);
            $[29] = t11;
        } else {
            t11 = $[29];
        }
        let t12;
        if ($[30] === Symbol.for("react.memo_cache_sentinel")) {
            t12 = ({
                "Leaderboard[<input>.onChange]": (e)=>setSearchTerm(e.target.value)
            })["Leaderboard[<input>.onChange]"];
            $[30] = t12;
        } else {
            t12 = $[30];
        }
        let t13;
        if ($[31] !== searchTerm) {
            t13 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1",
                children: [
                    t11,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "text",
                        id: "search",
                        placeholder: "\u0412\u0432\u0435\u0434\u0456\u0442\u044C \u0456\u043C'\u044F \u0433\u0440\u0430\u0432\u0446\u044F...",
                        value: searchTerm,
                        onChange: t12,
                        className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                    }, void 0, false, {
                        fileName: "[project]/src/components/Leaderboard.tsx",
                        lineNumber: 147,
                        columnNumber: 42
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/Leaderboard.tsx",
                lineNumber: 147,
                columnNumber: 13
            }, this);
            $[31] = searchTerm;
            $[32] = t13;
        } else {
            t13 = $[32];
        }
        let t14;
        if ($[33] === Symbol.for("react.memo_cache_sentinel")) {
            t14 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                className: "block text-sm font-medium text-gray-700 mb-1",
                children: "Сортувати за"
            }, void 0, false, {
                fileName: "[project]/src/components/Leaderboard.tsx",
                lineNumber: 155,
                columnNumber: 13
            }, this);
            $[33] = t14;
        } else {
            t14 = $[33];
        }
        let t15;
        if ($[34] === Symbol.for("react.memo_cache_sentinel")) {
            t15 = ({
                "Leaderboard[<button>.onClick]": ()=>setSortBy("current")
            })["Leaderboard[<button>.onClick]"];
            $[34] = t15;
        } else {
            t15 = $[34];
        }
        const t16 = `flex-1 px-2 py-2 text-xs sm:text-sm rounded-md border transition-colors ${sortBy === "current" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`;
        let t17;
        if ($[35] !== t16) {
            t17 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: t15,
                className: t16,
                children: "Поточний"
            }, void 0, false, {
                fileName: "[project]/src/components/Leaderboard.tsx",
                lineNumber: 172,
                columnNumber: 13
            }, this);
            $[35] = t16;
            $[36] = t17;
        } else {
            t17 = $[36];
        }
        let t18;
        if ($[37] === Symbol.for("react.memo_cache_sentinel")) {
            t18 = ({
                "Leaderboard[<button>.onClick]": ()=>setSortBy("peak")
            })["Leaderboard[<button>.onClick]"];
            $[37] = t18;
        } else {
            t18 = $[37];
        }
        const t19 = `flex-1 px-2 py-2 text-xs sm:text-sm rounded-md border transition-colors ${sortBy === "peak" ? "bg-purple-600 text-white border-purple-600" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`;
        let t20;
        if ($[38] !== t19) {
            t20 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: t18,
                className: t19,
                children: "Пік"
            }, void 0, false, {
                fileName: "[project]/src/components/Leaderboard.tsx",
                lineNumber: 190,
                columnNumber: 13
            }, this);
            $[38] = t19;
            $[39] = t20;
        } else {
            t20 = $[39];
        }
        let t21;
        if ($[40] === Symbol.for("react.memo_cache_sentinel")) {
            t21 = ({
                "Leaderboard[<button>.onClick]": ()=>setSortBy("cms")
            })["Leaderboard[<button>.onClick]"];
            $[40] = t21;
        } else {
            t21 = $[40];
        }
        const t22 = `flex-1 px-2 py-2 text-xs sm:text-sm rounded-md border transition-colors ${sortBy === "cms" ? "bg-amber-600 text-white border-amber-600" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`;
        let t23;
        if ($[41] !== t22) {
            t23 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: t21,
                className: t22,
                title: "\u041A\u0430\u043D\u0434\u0438\u0434\u0430\u0442\u0438 \u0443 \u041C\u0430\u0439\u0441\u0442\u0440\u0438 \u0421\u043F\u043E\u0440\u0442\u0443",
                children: "🏆 КМС"
            }, void 0, false, {
                fileName: "[project]/src/components/Leaderboard.tsx",
                lineNumber: 208,
                columnNumber: 13
            }, this);
            $[41] = t22;
            $[42] = t23;
        } else {
            t23 = $[42];
        }
        let t24;
        if ($[43] !== t17 || $[44] !== t20 || $[45] !== t23) {
            t24 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "md:w-64",
                children: [
                    t14,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-1 h-10",
                        children: [
                            t17,
                            t20,
                            t23
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/Leaderboard.tsx",
                        lineNumber: 216,
                        columnNumber: 43
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/Leaderboard.tsx",
                lineNumber: 216,
                columnNumber: 13
            }, this);
            $[43] = t17;
            $[44] = t20;
            $[45] = t23;
            $[46] = t24;
        } else {
            t24 = $[46];
        }
        let t25;
        if ($[47] === Symbol.for("react.memo_cache_sentinel")) {
            t25 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                className: "block text-sm font-medium text-gray-700 mb-1",
                children: "Сортування"
            }, void 0, false, {
                fileName: "[project]/src/components/Leaderboard.tsx",
                lineNumber: 226,
                columnNumber: 13
            }, this);
            $[47] = t25;
        } else {
            t25 = $[47];
        }
        let t26;
        if ($[48] !== sortDescending) {
            t26 = ({
                "Leaderboard[<button>.onClick]": ()=>setSortDescending(!sortDescending)
            })["Leaderboard[<button>.onClick]"];
            $[48] = sortDescending;
            $[49] = t26;
        } else {
            t26 = $[49];
        }
        const t27 = `w-full h-10 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 flex items-center justify-center ${sortDescending ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700" : "bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-800"}`;
        const t28 = sortDescending ? "\u0421\u043E\u0440\u0442\u0443\u0432\u0430\u043D\u043D\u044F: \u0432\u0456\u0434 \u0432\u0438\u0441\u043E\u043A\u043E\u0433\u043E \u0434\u043E \u043D\u0438\u0437\u044C\u043A\u043E\u0433\u043E" : "\u0421\u043E\u0440\u0442\u0443\u0432\u0430\u043D\u043D\u044F: \u0432\u0456\u0434 \u043D\u0438\u0437\u044C\u043A\u043E\u0433\u043E \u0434\u043E \u0432\u0438\u0441\u043E\u043A\u043E\u0433\u043E";
        let t29;
        if ($[50] !== sortDescending) {
            t29 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                className: "w-5 h-5",
                fill: "none",
                stroke: "currentColor",
                viewBox: "0 0 24 24",
                children: sortDescending ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    strokeWidth: 2,
                    d: "M19 14l-7 7m0 0l-7-7m7 7V3"
                }, void 0, false, {
                    fileName: "[project]/src/components/Leaderboard.tsx",
                    lineNumber: 245,
                    columnNumber: 110
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    strokeWidth: 2,
                    d: "M5 10l7-7m0 0l7 7m-7-7v18"
                }, void 0, false, {
                    fileName: "[project]/src/components/Leaderboard.tsx",
                    lineNumber: 245,
                    columnNumber: 213
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/Leaderboard.tsx",
                lineNumber: 245,
                columnNumber: 13
            }, this);
            $[50] = sortDescending;
            $[51] = t29;
        } else {
            t29 = $[51];
        }
        let t30;
        if ($[52] !== t26 || $[53] !== t27 || $[54] !== t28 || $[55] !== t29) {
            t30 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "md:w-16",
                children: [
                    t25,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: t26,
                        className: t27,
                        title: t28,
                        children: t29
                    }, void 0, false, {
                        fileName: "[project]/src/components/Leaderboard.tsx",
                        lineNumber: 253,
                        columnNumber: 43
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/Leaderboard.tsx",
                lineNumber: 253,
                columnNumber: 13
            }, this);
            $[52] = t26;
            $[53] = t27;
            $[54] = t28;
            $[55] = t29;
            $[56] = t30;
        } else {
            t30 = $[56];
        }
        let t31;
        if ($[57] === Symbol.for("react.memo_cache_sentinel")) {
            t31 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                htmlFor: "rating",
                className: "block text-sm font-medium text-gray-700 mb-1",
                children: "Рейтинг"
            }, void 0, false, {
                fileName: "[project]/src/components/Leaderboard.tsx",
                lineNumber: 264,
                columnNumber: 13
            }, this);
            $[57] = t31;
        } else {
            t31 = $[57];
        }
        let t32;
        if ($[58] === Symbol.for("react.memo_cache_sentinel")) {
            t32 = ({
                "Leaderboard[<select>.onChange]": (e_0)=>setSelectedRating(e_0.target.value)
            })["Leaderboard[<select>.onChange]"];
            $[58] = t32;
        } else {
            t32 = $[58];
        }
        let t33;
        if ($[59] === Symbol.for("react.memo_cache_sentinel")) {
            t33 = ratingBands.map(_LeaderboardRatingBandsMap);
            $[59] = t33;
        } else {
            t33 = $[59];
        }
        let t34;
        if ($[60] !== selectedRating) {
            t34 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "md:w-64",
                children: [
                    t31,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                        id: "rating",
                        value: selectedRating,
                        onChange: t32,
                        className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                        children: t33
                    }, void 0, false, {
                        fileName: "[project]/src/components/Leaderboard.tsx",
                        lineNumber: 287,
                        columnNumber: 43
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/Leaderboard.tsx",
                lineNumber: 287,
                columnNumber: 13
            }, this);
            $[60] = selectedRating;
            $[61] = t34;
        } else {
            t34 = $[61];
        }
        let t35;
        if ($[62] !== t13 || $[63] !== t24 || $[64] !== t30 || $[65] !== t34) {
            t35 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col md:flex-row gap-3",
                children: [
                    t13,
                    t24,
                    t30,
                    t34
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/Leaderboard.tsx",
                lineNumber: 295,
                columnNumber: 13
            }, this);
            $[62] = t13;
            $[63] = t24;
            $[64] = t30;
            $[65] = t34;
            $[66] = t35;
        } else {
            t35 = $[66];
        }
        t7 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-white rounded-lg shadow-md p-4",
            children: [
                t35,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mt-2 text-sm text-gray-600",
                    children: [
                        "Знайдено: ",
                        filteredPlayers.length,
                        " з ",
                        players.length,
                        " гравців"
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/Leaderboard.tsx",
                    lineNumber: 304,
                    columnNumber: 66
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/Leaderboard.tsx",
            lineNumber: 304,
            columnNumber: 10
        }, this);
        t3 = "space-y-2";
        t4 = filteredPlayers.length > 0 ? filteredPlayers.map({
            "Leaderboard[filteredPlayers.map()]": (player_2, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$PlayerCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    player: player_2,
                    rank: sortedPlayers.findIndex({
                        "Leaderboard[filteredPlayers.map() > sortedPlayers.findIndex()]": (p_0)=>p_0.id === player_2.id
                    }["Leaderboard[filteredPlayers.map() > sortedPlayers.findIndex()]"]) + 1,
                    showRank: true,
                    showPeakRating: sortBy === "peak"
                }, player_2.id, false, {
                    fileName: "[project]/src/components/Leaderboard.tsx",
                    lineNumber: 307,
                    columnNumber: 66
                }, this)
        }["Leaderboard[filteredPlayers.map()]"]) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-white rounded-lg shadow-md p-8 text-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-gray-500",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                        className: "mx-auto h-12 w-12 text-gray-400",
                        fill: "none",
                        viewBox: "0 0 24 24",
                        stroke: "currentColor",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            strokeLinecap: "round",
                            strokeLinejoin: "round",
                            strokeWidth: 2,
                            d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        }, void 0, false, {
                            fileName: "[project]/src/components/Leaderboard.tsx",
                            lineNumber: 310,
                            columnNumber: 245
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/Leaderboard.tsx",
                        lineNumber: 310,
                        columnNumber: 142
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "mt-2 text-lg font-medium",
                        children: "Гравців не знайдено"
                    }, void 0, false, {
                        fileName: "[project]/src/components/Leaderboard.tsx",
                        lineNumber: 310,
                        columnNumber: 368
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-1",
                        children: "Спробуйте змінити критерії пошуку"
                    }, void 0, false, {
                        fileName: "[project]/src/components/Leaderboard.tsx",
                        lineNumber: 310,
                        columnNumber: 433
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/Leaderboard.tsx",
                lineNumber: 310,
                columnNumber: 111
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/Leaderboard.tsx",
            lineNumber: 310,
            columnNumber: 48
        }, this);
        $[11] = players.length;
        $[12] = searchTerm;
        $[13] = selectedRating;
        $[14] = sortBy;
        $[15] = sortDescending;
        $[16] = sortedPlayers;
        $[17] = t3;
        $[18] = t4;
        $[19] = t5;
        $[20] = t6;
        $[21] = t7;
    } else {
        t3 = $[17];
        t4 = $[18];
        t5 = $[19];
        t6 = $[20];
        t7 = $[21];
    }
    let t8;
    if ($[67] !== t3 || $[68] !== t4) {
        t8 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: t3,
            children: t4
        }, void 0, false, {
            fileName: "[project]/src/components/Leaderboard.tsx",
            lineNumber: 331,
            columnNumber: 10
        }, this);
        $[67] = t3;
        $[68] = t4;
        $[69] = t8;
    } else {
        t8 = $[69];
    }
    let t9;
    if ($[70] !== t5 || $[71] !== t6 || $[72] !== t7 || $[73] !== t8) {
        t9 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: t5,
            children: [
                t6,
                t7,
                t8
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/Leaderboard.tsx",
            lineNumber: 340,
            columnNumber: 10
        }, this);
        $[70] = t5;
        $[71] = t6;
        $[72] = t7;
        $[73] = t8;
        $[74] = t9;
    } else {
        t9 = $[74];
    }
    return t9;
}
_s(Leaderboard, "Pgaz8i6XsUr4Kpy6eshpOKr9tDA=");
_c = Leaderboard;
function _LeaderboardRatingBandsMap(band) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
        value: band,
        children: band === "all" ? "\u0412\u0441\u0456 \u0440\u0435\u0439\u0442\u0438\u043D\u0433\u0438" : band
    }, band, false, {
        fileName: "[project]/src/components/Leaderboard.tsx",
        lineNumber: 352,
        columnNumber: 10
    }, this);
}
function _LeaderboardAnonymous(a, b) {
    return b.peakRating - a.peakRating;
}
function _LeaderboardFilteredFilter(p) {
    return p.isCMS;
}
function _LeaderboardPlayersFilter(player) {
    return player.matches && player.matches.length > 0;
}
var _c;
__turbopack_context__.k.register(_c, "Leaderboard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/MatchSimulator.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>MatchSimulator
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AppContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/AppContext.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function MatchSimulator() {
    _s();
    const { state, addMatch, simulateRandomMatches, resetData, loadRealPlayers } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AppContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useApp"])();
    const [player1Id, setPlayer1Id] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [player2Id, setPlayer2Id] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [winnerId, setWinnerId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [player1Score, setPlayer1Score] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [player2Score, setPlayer2Score] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [maxScore, setMaxScore] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(5);
    const [randomMatchCount, setRandomMatchCount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(10);
    const [isSimulating, setIsSimulating] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Rating cap tracking (загальна сума рейтингів)
    const [ratingCapBefore, setRatingCapBefore] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [ratingCapAfter, setRatingCapAfter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [matchCountBefore, setMatchCountBefore] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    // Search states for player selection
    const [player1Search, setPlayer1Search] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [player2Search, setPlayer2Search] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [showPlayer1Dropdown, setShowPlayer1Dropdown] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showPlayer2Dropdown, setShowPlayer2Dropdown] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Відстежуємо зміни в кількості матчів для оновлення капу після симуляції
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MatchSimulator.useEffect": ()=>{
            if (matchCountBefore > 0 && state.matches.length > matchCountBefore) {
                // Матчі додалися - оновлюємо кап ПІСЛЯ
                const capAfter = state.players.reduce({
                    "MatchSimulator.useEffect.capAfter": (sum, player)=>sum + player.rating
                }["MatchSimulator.useEffect.capAfter"], 0);
                setRatingCapAfter(capAfter);
                setMatchCountBefore(0); // Скидаємо тригер
            }
        }
    }["MatchSimulator.useEffect"], [
        state.matches.length,
        state.players,
        matchCountBefore
    ]);
    // Filter players based on search
    const filterPlayers = (searchTerm)=>{
        if (!searchTerm) return state.players;
        return state.players.filter((player_0)=>player_0.name.toLowerCase().includes(searchTerm.toLowerCase()));
    };
    const handlePlayer1Select = (player_1)=>{
        setPlayer1Id(player_1.id);
        setPlayer1Search(player_1.name);
        setShowPlayer1Dropdown(false);
        if (winnerId === player_1.id) {
            setPlayer1Score(maxScore);
        } else if (winnerId && winnerId !== player_1.id) {
            setPlayer1Score(Math.max(0, maxScore - 1));
        }
    };
    const handlePlayer2Select = (player_2)=>{
        setPlayer2Id(player_2.id);
        setPlayer2Search(player_2.name);
        setShowPlayer2Dropdown(false);
        if (winnerId === player_2.id) {
            setPlayer2Score(maxScore);
        } else if (winnerId && winnerId !== player_2.id) {
            setPlayer2Score(Math.max(0, maxScore - 1));
        }
    };
    const handleAddMatch = (e)=>{
        e.preventDefault();
        if (!player1Id || !player2Id || !winnerId) {
            alert('Будь ласка, оберіть всіх гравців та переможця');
            return;
        }
        if (player1Id === player2Id) {
            alert('Оберіть різних гравців');
            return;
        }
        if (player1Score < 0 || player2Score < 0) {
            alert('Рахунок не може бути від\'ємним');
            return;
        }
        if (maxScore <= 0 || maxScore > 10) {
            alert('Максимальний рахунок повинен бути від 1 до 10');
            return;
        }
        // Перевіряємо, що переможець дійсно має більший рахунок
        const winnerScore = winnerId === player1Id ? player1Score : player2Score;
        const loserScore = winnerId === player1Id ? player2Score : player1Score;
        if (winnerScore <= loserScore) {
            alert('Переможець повинен мати більший рахунок');
            return;
        }
        if (winnerScore !== maxScore) {
            alert(`Переможець повинен мати рахунок ${maxScore}`);
            return;
        }
        addMatch(player1Id, player2Id, winnerId, player1Score, player2Score, maxScore);
        // Reset form
        setPlayer1Id('');
        setPlayer2Id('');
        setWinnerId('');
        setPlayer1Score(0);
        setPlayer2Score(0);
        setMaxScore(5);
        setPlayer1Search('');
        setPlayer2Search('');
        setShowPlayer1Dropdown(false);
        setShowPlayer2Dropdown(false);
    };
    const handleSimulateRandomMatches = ()=>{
        if (randomMatchCount <= 0 || randomMatchCount > 1000) {
            alert('Кількість матчів повинна бути від 1 до 1000');
            return;
        }
        setIsSimulating(true);
        try {
            // Обчислюємо кап ДО симуляції
            const capBefore = state.players.reduce((sum, player)=>sum + player.rating, 0);
            setRatingCapBefore(capBefore);
            setMatchCountBefore(state.matches.length); // Зберігаємо поточну кількість матчів
            // Симулюємо матчі (стан оновиться асинхронно)
            simulateRandomMatches(randomMatchCount);
        // capAfter буде обчислено в useEffect після оновлення стану
        } finally{
            setIsSimulating(false);
        }
    };
    const handleResetData = ()=>{
        if (confirm('Ви впевнені, що хочете скинути всі дані? Це видалить всіх гравців та матчі.')) {
            resetData();
        }
    };
    const handleLoadRealPlayers = ()=>{
        if (confirm('Завантажити реальних гравців? Це замінить поточних гравців на 115 реальних гравців з рейтингом 1300.')) {
            loadRealPlayers();
        }
    };
    // Close dropdowns when clicking outside
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useEffect({
        "MatchSimulator.useEffect": ()=>{
            const handleClickOutside = {
                "MatchSimulator.useEffect.handleClickOutside": (event)=>{
                    const target = event.target;
                    if (!target.closest('.player-search-container')) {
                        setShowPlayer1Dropdown(false);
                        setShowPlayer2Dropdown(false);
                    }
                }
            }["MatchSimulator.useEffect.handleClickOutside"];
            document.addEventListener('mousedown', handleClickOutside);
            return ({
                "MatchSimulator.useEffect": ()=>{
                    document.removeEventListener('mousedown', handleClickOutside);
                }
            })["MatchSimulator.useEffect"];
        }
    }["MatchSimulator.useEffect"], []);
    if (state.loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-white rounded-lg shadow-md p-6",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "animate-pulse",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-4 bg-gray-300 rounded w-1/4 mb-4"
                    }, void 0, false, {
                        fileName: "[project]/src/components/MatchSimulator.tsx",
                        lineNumber: 160,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "h-4 bg-gray-300 rounded"
                            }, void 0, false, {
                                fileName: "[project]/src/components/MatchSimulator.tsx",
                                lineNumber: 162,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "h-4 bg-gray-300 rounded w-3/4"
                            }, void 0, false, {
                                fileName: "[project]/src/components/MatchSimulator.tsx",
                                lineNumber: 163,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/MatchSimulator.tsx",
                        lineNumber: 161,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/MatchSimulator.tsx",
                lineNumber: 159,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/MatchSimulator.tsx",
            lineNumber: 158,
            columnNumber: 12
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-white rounded-lg shadow-md p-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-xl font-bold text-gray-900 mb-4",
                        children: "Додати матч"
                    }, void 0, false, {
                        fileName: "[project]/src/components/MatchSimulator.tsx",
                        lineNumber: 171,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                        onSubmit: handleAddMatch,
                        className: "space-y-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-4",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            htmlFor: "maxScore",
                                            className: "block text-sm font-medium text-gray-700 mb-2",
                                            children: "Гра до скільки очок (1-10)"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/MatchSimulator.tsx",
                                            lineNumber: 177,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "number",
                                            id: "maxScore",
                                            min: "1",
                                            max: "10",
                                            value: maxScore,
                                            onChange: (e_0)=>setMaxScore(parseInt(e_0.target.value) || 1),
                                            className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500",
                                            placeholder: "Введіть число від 1 до 10"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/MatchSimulator.tsx",
                                            lineNumber: 180,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "mt-1 text-xs text-gray-500",
                                            children: "Популярні: 3, 5, 7, 10 очок"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/MatchSimulator.tsx",
                                            lineNumber: 181,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/MatchSimulator.tsx",
                                    lineNumber: 176,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/MatchSimulator.tsx",
                                lineNumber: 175,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                htmlFor: "player1",
                                                className: "block text-sm font-medium text-gray-700 mb-2",
                                                children: "Гравець 1"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/MatchSimulator.tsx",
                                                lineNumber: 190,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "relative player-search-container",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "text",
                                                        id: "player1",
                                                        value: player1Search,
                                                        onChange: (e_1)=>{
                                                            setPlayer1Search(e_1.target.value);
                                                            setShowPlayer1Dropdown(true);
                                                            if (!e_1.target.value) {
                                                                setPlayer1Id('');
                                                            }
                                                        },
                                                        className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900",
                                                        placeholder: "Пошук гравця 1",
                                                        required: true
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/MatchSimulator.tsx",
                                                        lineNumber: 194,
                                                        columnNumber: 17
                                                    }, this),
                                                    showPlayer1Dropdown && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-auto",
                                                        children: filterPlayers(player1Search).length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "px-4 py-2 text-gray-500 text-sm",
                                                            children: "Гравця не знайдено"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/MatchSimulator.tsx",
                                                            lineNumber: 202,
                                                            columnNumber: 66
                                                        }, this) : filterPlayers(player1Search).map((player_3)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                onClick: ()=>handlePlayer1Select(player_3),
                                                                className: "cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-600 hover:text-white",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "flex items-center",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "text-sm font-medium",
                                                                                children: player_3.name
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/components/MatchSimulator.tsx",
                                                                                lineNumber: 206,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "text-xs text-gray-400 ml-2",
                                                                                children: player_3.rating
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/components/MatchSimulator.tsx",
                                                                                lineNumber: 209,
                                                                                columnNumber: 29
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/components/MatchSimulator.tsx",
                                                                        lineNumber: 205,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "absolute inset-y-0 right-0 flex items-center pr-4",
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "text-blue-600 text-xs font-semibold",
                                                                            children: "Обрано"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/MatchSimulator.tsx",
                                                                            lineNumber: 214,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/MatchSimulator.tsx",
                                                                        lineNumber: 213,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, player_3.id, true, {
                                                                fileName: "[project]/src/components/MatchSimulator.tsx",
                                                                lineNumber: 204,
                                                                columnNumber: 77
                                                            }, this))
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/MatchSimulator.tsx",
                                                        lineNumber: 201,
                                                        columnNumber: 41
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/MatchSimulator.tsx",
                                                lineNumber: 193,
                                                columnNumber: 15
                                            }, this),
                                            player1Id && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "mt-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        htmlFor: "player1Score",
                                                        className: "block text-sm font-medium text-gray-700 mb-1",
                                                        children: "Рахунок гравця 1"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/MatchSimulator.tsx",
                                                        lineNumber: 222,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "number",
                                                        id: "player1Score",
                                                        min: "0",
                                                        max: maxScore,
                                                        value: player1Score,
                                                        onChange: (e_2)=>setPlayer1Score(parseInt(e_2.target.value) || 0),
                                                        className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/MatchSimulator.tsx",
                                                        lineNumber: 225,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/MatchSimulator.tsx",
                                                lineNumber: 221,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/MatchSimulator.tsx",
                                        lineNumber: 189,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                htmlFor: "player2",
                                                className: "block text-sm font-medium text-gray-700 mb-2",
                                                children: "Гравець 2"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/MatchSimulator.tsx",
                                                lineNumber: 231,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "relative player-search-container",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        onChange: (e_3)=>{
                                                            setPlayer2Search(e_3.target.value);
                                                            setShowPlayer2Dropdown(true);
                                                            if (!e_3.target.value) {
                                                                setPlayer2Id('');
                                                            }
                                                        },
                                                        className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900",
                                                        placeholder: "Пошук гравця 2",
                                                        required: true
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/MatchSimulator.tsx",
                                                        lineNumber: 235,
                                                        columnNumber: 17
                                                    }, this),
                                                    showPlayer2Dropdown && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-auto",
                                                        children: filterPlayers(player2Search).filter((player_6)=>player_6.id !== player1Id).length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "px-4 py-2 text-gray-500 text-sm",
                                                            children: "Гравця не знайдено"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/MatchSimulator.tsx",
                                                            lineNumber: 243,
                                                            columnNumber: 112
                                                        }, this) : filterPlayers(player2Search).filter((player_4)=>player_4.id !== player1Id).map((player_5)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                onClick: ()=>handlePlayer2Select(player_5),
                                                                className: "cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-600 hover:text-white",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "flex items-center",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "text-sm font-medium",
                                                                                children: player_5.name
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/components/MatchSimulator.tsx",
                                                                                lineNumber: 247,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "text-xs text-gray-400 ml-2",
                                                                                children: player_5.rating
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/components/MatchSimulator.tsx",
                                                                                lineNumber: 250,
                                                                                columnNumber: 29
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/components/MatchSimulator.tsx",
                                                                        lineNumber: 246,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "absolute inset-y-0 right-0 flex items-center pr-4",
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "text-blue-600 text-xs font-semibold",
                                                                            children: "Обрано"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/MatchSimulator.tsx",
                                                                            lineNumber: 255,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/MatchSimulator.tsx",
                                                                        lineNumber: 254,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, player_5.id, true, {
                                                                fileName: "[project]/src/components/MatchSimulator.tsx",
                                                                lineNumber: 245,
                                                                columnNumber: 123
                                                            }, this))
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/MatchSimulator.tsx",
                                                        lineNumber: 242,
                                                        columnNumber: 41
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/MatchSimulator.tsx",
                                                lineNumber: 234,
                                                columnNumber: 15
                                            }, this),
                                            player2Id && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "mt-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        htmlFor: "player2Score",
                                                        className: "block text-sm font-medium text-gray-700 mb-1",
                                                        children: "Рахунок гравця 2"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/MatchSimulator.tsx",
                                                        lineNumber: 263,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "number",
                                                        id: "player2Score",
                                                        min: "0",
                                                        max: maxScore,
                                                        value: player2Score,
                                                        onChange: (e_4)=>setPlayer2Score(parseInt(e_4.target.value) || 0),
                                                        className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/MatchSimulator.tsx",
                                                        lineNumber: 266,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/MatchSimulator.tsx",
                                                lineNumber: 262,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/MatchSimulator.tsx",
                                        lineNumber: 230,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/MatchSimulator.tsx",
                                lineNumber: 187,
                                columnNumber: 11
                            }, this),
                            player1Id && player2Id && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        htmlFor: "winner",
                                        className: "block text-sm font-medium text-gray-700 mb-2",
                                        children: [
                                            "Переможець (хто набрав ",
                                            maxScore,
                                            " очок)"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/MatchSimulator.tsx",
                                        lineNumber: 273,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        id: "winner",
                                        value: winnerId,
                                        onChange: (e_5)=>{
                                            setWinnerId(e_5.target.value);
                                            if (e_5.target.value === player1Id) {
                                                setPlayer1Score(maxScore);
                                                setPlayer2Score(Math.max(0, maxScore - 2));
                                            } else if (e_5.target.value === player2Id) {
                                                setPlayer2Score(maxScore);
                                                setPlayer1Score(Math.max(0, maxScore - 2));
                                            }
                                        },
                                        className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900",
                                        required: true,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "",
                                                children: "Оберіть переможця"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/MatchSimulator.tsx",
                                                lineNumber: 286,
                                                columnNumber: 17
                                            }, this),
                                            [
                                                player1Id,
                                                player2Id
                                            ].map((id)=>{
                                                const player_7 = state.players.find((p)=>p.id === id);
                                                return player_7 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: player_7.id,
                                                    children: player_7.name
                                                }, player_7.id, false, {
                                                    fileName: "[project]/src/components/MatchSimulator.tsx",
                                                    lineNumber: 289,
                                                    columnNumber: 33
                                                }, this) : null;
                                            })
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/MatchSimulator.tsx",
                                        lineNumber: 276,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/MatchSimulator.tsx",
                                lineNumber: 272,
                                columnNumber: 38
                            }, this),
                            player1Id && player2Id && winnerId && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-gray-50 p-4 rounded-md",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-sm font-medium text-gray-900 mb-2",
                                        children: "Попередній перегляд матчу:"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/MatchSimulator.tsx",
                                        lineNumber: 298,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-center space-x-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-center",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "font-semibold",
                                                        children: state.players.find((p_0)=>p_0.id === player1Id)?.name
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/MatchSimulator.tsx",
                                                        lineNumber: 301,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: `text-2xl font-bold ${winnerId === player1Id ? 'text-green-600' : 'text-red-600'}`,
                                                        children: player1Score
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/MatchSimulator.tsx",
                                                        lineNumber: 304,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/MatchSimulator.tsx",
                                                lineNumber: 300,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-gray-400",
                                                children: ":"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/MatchSimulator.tsx",
                                                lineNumber: 308,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-center",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "font-semibold",
                                                        children: state.players.find((p_1)=>p_1.id === player2Id)?.name
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/MatchSimulator.tsx",
                                                        lineNumber: 310,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: `text-2xl font-bold ${winnerId === player2Id ? 'text-green-600' : 'text-red-600'}`,
                                                        children: player2Score
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/MatchSimulator.tsx",
                                                        lineNumber: 313,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/MatchSimulator.tsx",
                                                lineNumber: 309,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/MatchSimulator.tsx",
                                        lineNumber: 299,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-center text-sm text-gray-600 mt-2",
                                        children: [
                                            "Гра до ",
                                            maxScore,
                                            " очок"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/MatchSimulator.tsx",
                                        lineNumber: 318,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/MatchSimulator.tsx",
                                lineNumber: 297,
                                columnNumber: 50
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "submit",
                                disabled: !player1Id || !player2Id || !winnerId || player1Score < 0 || player2Score < 0,
                                className: "w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
                                children: [
                                    "Додати матч з рахунком ",
                                    player1Score,
                                    ":",
                                    player2Score
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/MatchSimulator.tsx",
                                lineNumber: 323,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/MatchSimulator.tsx",
                        lineNumber: 173,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/MatchSimulator.tsx",
                lineNumber: 170,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-white rounded-lg shadow-md p-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-xl font-bold text-gray-900 mb-4",
                        children: "🎯 Розширена рейтингова система v3.1.1"
                    }, void 0, false, {
                        fileName: "[project]/src/components/MatchSimulator.tsx",
                        lineNumber: 331,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-3 text-sm text-gray-700",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                    children: "Система враховує:"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/MatchSimulator.tsx",
                                    lineNumber: 335,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/MatchSimulator.tsx",
                                lineNumber: 334,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                className: "list-disc list-inside space-y-1 ml-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                children: "Рахунок матчу"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/MatchSimulator.tsx",
                                                lineNumber: 338,
                                                columnNumber: 17
                                            }, this),
                                            " - чим ближчий рахунок, тім менша зміна рейтингу"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/MatchSimulator.tsx",
                                        lineNumber: 338,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                children: "Якість гри програвшого"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/MatchSimulator.tsx",
                                                lineNumber: 339,
                                                columnNumber: 17
                                            }, this),
                                            " - якщо програв, але зіграв краще за очікування, втратить менше рейтингу"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/MatchSimulator.tsx",
                                        lineNumber: 339,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                children: "Фактор несподіванки"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/MatchSimulator.tsx",
                                                lineNumber: 340,
                                                columnNumber: 17
                                            }, this),
                                            " - перемога над сильнішим гравцем дає значно більше очок"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/MatchSimulator.tsx",
                                        lineNumber: 340,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                children: "Адаптивний K-фактор"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/MatchSimulator.tsx",
                                                lineNumber: 341,
                                                columnNumber: 17
                                            }, this),
                                            " - більша зміна рейтингу при великій різниці в силі гравців"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/MatchSimulator.tsx",
                                        lineNumber: 341,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                children: "Елітний шар 1500+"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/MatchSimulator.tsx",
                                                lineNumber: 342,
                                                columnNumber: 17
                                            }, this),
                                            " - спеціальна логіка для топ-гравців з масштабованими бонусами"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/MatchSimulator.tsx",
                                        lineNumber: 342,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                children: "🔥 ВАГИ МАТЧІВ"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/MatchSimulator.tsx",
                                                lineNumber: 343,
                                                columnNumber: 17
                                            }, this),
                                            " - фінали дають більше рейтингу! (group ×1.0 → final ×1.7)"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/MatchSimulator.tsx",
                                        lineNumber: 343,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                children: "📊 ПРОГРЕСИВНИЙ БАЛАНС"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/MatchSimulator.tsx",
                                                lineNumber: 344,
                                                columnNumber: 17
                                            }, this),
                                            " - новачки падають до 950, інфляція тільки для 1000"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/MatchSimulator.tsx",
                                        lineNumber: 344,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/MatchSimulator.tsx",
                                lineNumber: 337,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-blue-50 p-3 rounded-md mt-4",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-blue-800",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                            children: "Приклад:"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/MatchSimulator.tsx",
                                            lineNumber: 349,
                                            columnNumber: 15
                                        }, this),
                                        " Гравець 1600 виграв 5:2 в груповому етапі - отримає +25 рейтингу",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                            fileName: "[project]/src/components/MatchSimulator.tsx",
                                            lineNumber: 349,
                                            columnNumber: 105
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                            children: "Фінал:"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/MatchSimulator.tsx",
                                            lineNumber: 350,
                                            columnNumber: 15
                                        }, this),
                                        " Той самий матч у фіналі - отримає +42 рейтингу (×1.7)!",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                            fileName: "[project]/src/components/MatchSimulator.tsx",
                                            lineNumber: 350,
                                            columnNumber: 93
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                            children: "Баланс:"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/MatchSimulator.tsx",
                                            lineNumber: 351,
                                            columnNumber: 15
                                        }, this),
                                        " Кап рейтингів росте за рахунок топів і середньої зони (інфляція 0.5-2%)"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/MatchSimulator.tsx",
                                    lineNumber: 348,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/MatchSimulator.tsx",
                                lineNumber: 347,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-green-50 p-3 rounded-md mt-2",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-green-800",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                            children: "Гнучкість:"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/MatchSimulator.tsx",
                                            lineNumber: 357,
                                            columnNumber: 15
                                        }, this),
                                        " Тепер можна грати до будь-якої кількості очок від 1 до 10!"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/MatchSimulator.tsx",
                                    lineNumber: 356,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/MatchSimulator.tsx",
                                lineNumber: 355,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/MatchSimulator.tsx",
                        lineNumber: 333,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/MatchSimulator.tsx",
                lineNumber: 330,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-white rounded-lg shadow-md p-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-xl font-bold text-gray-900 mb-4",
                        children: "Симуляція матчів"
                    }, void 0, false, {
                        fileName: "[project]/src/components/MatchSimulator.tsx",
                        lineNumber: 365,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        htmlFor: "matchCount",
                                        className: "block text-sm font-medium text-gray-700 mb-2",
                                        children: "Кількість випадкових матчів"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/MatchSimulator.tsx",
                                        lineNumber: 369,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "number",
                                        id: "matchCount",
                                        min: "1",
                                        max: "1000",
                                        value: randomMatchCount,
                                        onChange: (e_6)=>setRandomMatchCount(parseInt(e_6.target.value) || 1),
                                        className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/MatchSimulator.tsx",
                                        lineNumber: 372,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/MatchSimulator.tsx",
                                lineNumber: 368,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleSimulateRandomMatches,
                                disabled: isSimulating,
                                className: "w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
                                children: isSimulating ? 'Симуляція...' : `Симулювати ${randomMatchCount} матчів`
                            }, void 0, false, {
                                fileName: "[project]/src/components/MatchSimulator.tsx",
                                lineNumber: 375,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/MatchSimulator.tsx",
                        lineNumber: 367,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/MatchSimulator.tsx",
                lineNumber: 364,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-white rounded-lg shadow-md p-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-xl font-bold text-gray-900 mb-4",
                        children: "Статистика"
                    }, void 0, false, {
                        fileName: "[project]/src/components/MatchSimulator.tsx",
                        lineNumber: 383,
                        columnNumber: 9
                    }, this),
                    ratingCapBefore !== null && ratingCapAfter !== null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-lg font-bold text-gray-900 mb-3",
                                children: "📊 Кап рейтингів (загальна сума)"
                            }, void 0, false, {
                                fileName: "[project]/src/components/MatchSimulator.tsx",
                                lineNumber: 387,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-1 md:grid-cols-3 gap-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-center",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-sm text-gray-600 mb-1",
                                                children: "До симуляції"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/MatchSimulator.tsx",
                                                lineNumber: 390,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-2xl font-bold text-blue-600",
                                                children: ratingCapBefore.toLocaleString()
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/MatchSimulator.tsx",
                                                lineNumber: 391,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/MatchSimulator.tsx",
                                        lineNumber: 389,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-center",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-sm text-gray-600 mb-1",
                                                children: "Після симуляції"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/MatchSimulator.tsx",
                                                lineNumber: 394,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-2xl font-bold text-purple-600",
                                                children: ratingCapAfter.toLocaleString()
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/MatchSimulator.tsx",
                                                lineNumber: 395,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/MatchSimulator.tsx",
                                        lineNumber: 393,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-center",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-sm text-gray-600 mb-1",
                                                children: "Зміна (інфляція/дефляція)"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/MatchSimulator.tsx",
                                                lineNumber: 398,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: `text-2xl font-bold ${ratingCapAfter > ratingCapBefore ? 'text-green-600' : ratingCapAfter < ratingCapBefore ? 'text-red-600' : 'text-gray-600'}`,
                                                children: [
                                                    ratingCapAfter > ratingCapBefore ? '+' : '',
                                                    (ratingCapAfter - ratingCapBefore).toLocaleString(),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-sm ml-2",
                                                        children: [
                                                            "(",
                                                            ((ratingCapAfter - ratingCapBefore) / ratingCapBefore * 100).toFixed(2),
                                                            "%)"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/MatchSimulator.tsx",
                                                        lineNumber: 402,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/MatchSimulator.tsx",
                                                lineNumber: 399,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/MatchSimulator.tsx",
                                        lineNumber: 397,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/MatchSimulator.tsx",
                                lineNumber: 388,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/MatchSimulator.tsx",
                        lineNumber: 386,
                        columnNumber: 65
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-2 md:grid-cols-4 gap-4 mb-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-2xl font-bold text-blue-600",
                                        children: state.players.length
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/MatchSimulator.tsx",
                                        lineNumber: 412,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-sm text-gray-600",
                                        children: "Гравців"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/MatchSimulator.tsx",
                                        lineNumber: 413,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/MatchSimulator.tsx",
                                lineNumber: 411,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-2xl font-bold text-green-600",
                                        children: state.matches.length
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/MatchSimulator.tsx",
                                        lineNumber: 416,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-sm text-gray-600",
                                        children: "Матчів"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/MatchSimulator.tsx",
                                        lineNumber: 417,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/MatchSimulator.tsx",
                                lineNumber: 415,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-2xl font-bold text-purple-600",
                                        children: state.players.length > 0 ? Math.max(...state.players.map((p_2)=>p_2.rating)) : 0
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/MatchSimulator.tsx",
                                        lineNumber: 420,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-sm text-gray-600",
                                        children: "Макс рейтинг"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/MatchSimulator.tsx",
                                        lineNumber: 423,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/MatchSimulator.tsx",
                                lineNumber: 419,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-2xl font-bold text-orange-600",
                                        children: state.players.length > 0 ? Math.min(...state.players.map((p_3)=>p_3.rating)) : 0
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/MatchSimulator.tsx",
                                        lineNumber: 426,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-sm text-gray-600",
                                        children: "Мін рейтинг"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/MatchSimulator.tsx",
                                        lineNumber: 429,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/MatchSimulator.tsx",
                                lineNumber: 425,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/MatchSimulator.tsx",
                        lineNumber: 410,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-3",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleResetData,
                            className: "w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors",
                            children: "🔄 Скинути всі дані"
                        }, void 0, false, {
                            fileName: "[project]/src/components/MatchSimulator.tsx",
                            lineNumber: 443,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/MatchSimulator.tsx",
                        lineNumber: 434,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/MatchSimulator.tsx",
                lineNumber: 382,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/MatchSimulator.tsx",
        lineNumber: 168,
        columnNumber: 10
    }, this);
}
_s(MatchSimulator, "1DFCJEGWm3kruHAIrmiMOpwtM+o=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AppContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useApp"]
    ];
});
_c = MatchSimulator;
var _c;
__turbopack_context__.k.register(_c, "MatchSimulator");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AppContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/AppContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Leaderboard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/Leaderboard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$MatchSimulator$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/MatchSimulator.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
function Home() {
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(42);
    if ($[0] !== "b442858aa6bbf9075d980ecaf126cb08d0a95ed7c48874db39abb04c57151859") {
        for(let $i = 0; $i < 42; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "b442858aa6bbf9075d980ecaf126cb08d0a95ed7c48874db39abb04c57151859";
    }
    const { state } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AppContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useApp"])();
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("leaderboard");
    const [mounted, setMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    let t0;
    let t1;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t0 = ({
            "Home[useEffect()]": ()=>{
                setMounted(true);
            }
        })["Home[useEffect()]"];
        t1 = [];
        $[1] = t0;
        $[2] = t1;
    } else {
        t0 = $[1];
        t1 = $[2];
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])(t0, t1);
    if (!mounted || state.loading) {
        let t2;
        if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
            t2 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "bg-white shadow-md",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex justify-between items-center py-4",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            className: "text-xl font-bold text-gray-900",
                            children: "Рейтинг Більярду"
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 40,
                            columnNumber: 163
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 40,
                        columnNumber: 107
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 40,
                    columnNumber: 51
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 40,
                columnNumber: 12
            }, this);
            $[3] = t2;
        } else {
            t2 = $[3];
        }
        let t3;
        if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
            t3 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "min-h-screen bg-gray-100",
                children: [
                    t2,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                        className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-white rounded-lg shadow-lg p-8 flex items-center space-x-4 justify-center",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 47,
                                    columnNumber: 214
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-lg",
                                    children: "Завантаження..."
                                }, void 0, false, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 47,
                                    columnNumber: 294
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 47,
                            columnNumber: 120
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 47,
                        columnNumber: 58
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 47,
                columnNumber: 12
            }, this);
            $[4] = t3;
        } else {
            t3 = $[4];
        }
        return t3;
    }
    if (state.error) {
        let t2;
        let t3;
        if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
            t2 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-red-500 mb-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                    className: "mx-auto h-12 w-12",
                    fill: "none",
                    viewBox: "0 0 24 24",
                    stroke: "currentColor",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                        strokeWidth: 2,
                        d: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 58,
                        columnNumber: 136
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 58,
                    columnNumber: 47
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 58,
                columnNumber: 12
            }, this);
            t3 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                className: "text-xl font-bold text-gray-900 mb-2",
                children: "Помилка завантаження"
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 59,
                columnNumber: 12
            }, this);
            $[5] = t2;
            $[6] = t3;
        } else {
            t2 = $[5];
            t3 = $[6];
        }
        let t4;
        if ($[7] !== state.error) {
            t4 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-gray-600 mb-4",
                children: state.error
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 68,
                columnNumber: 12
            }, this);
            $[7] = state.error;
            $[8] = t4;
        } else {
            t4 = $[8];
        }
        let t5;
        if ($[9] === Symbol.for("react.memo_cache_sentinel")) {
            t5 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: _HomeButtonOnClick,
                className: "bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors",
                children: "Спробувати знову"
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 76,
                columnNumber: 12
            }, this);
            $[9] = t5;
        } else {
            t5 = $[9];
        }
        let t6;
        if ($[10] !== t4) {
            t6 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "min-h-screen bg-gray-100 flex items-center justify-center",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-white rounded-lg shadow-lg p-8 text-center",
                    children: [
                        t2,
                        t3,
                        t4,
                        t5
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 83,
                    columnNumber: 87
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 83,
                columnNumber: 12
            }, this);
            $[10] = t4;
            $[11] = t6;
        } else {
            t6 = $[11];
        }
        return t6;
    }
    let t2;
    if ($[12] === Symbol.for("react.memo_cache_sentinel")) {
        t2 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
            className: "text-xl font-bold text-gray-900",
            children: "🎱 Рейтинг Більярду"
        }, void 0, false, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 93,
            columnNumber: 10
        }, this);
        $[12] = t2;
    } else {
        t2 = $[12];
    }
    let t3;
    if ($[13] === Symbol.for("react.memo_cache_sentinel")) {
        t3 = ({
            "Home[<button>.onClick]": ()=>setActiveTab("tournaments")
        })["Home[<button>.onClick]"];
        $[13] = t3;
    } else {
        t3 = $[13];
    }
    const t4 = `px-3 sm:px-4 py-2 rounded-md font-medium transition-colors ${activeTab === "tournaments" ? "bg-blue-600 text-white" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`;
    let t5;
    if ($[14] !== t4) {
        t5 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
            onClick: t3,
            className: t4,
            children: "Турніри"
        }, void 0, false, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 110,
            columnNumber: 10
        }, this);
        $[14] = t4;
        $[15] = t5;
    } else {
        t5 = $[15];
    }
    let t6;
    if ($[16] === Symbol.for("react.memo_cache_sentinel")) {
        t6 = ({
            "Home[<button>.onClick]": ()=>setActiveTab("leaderboard")
        })["Home[<button>.onClick]"];
        $[16] = t6;
    } else {
        t6 = $[16];
    }
    const t7 = `px-3 sm:px-4 py-2 rounded-md font-medium transition-colors ${activeTab === "leaderboard" ? "bg-blue-600 text-white" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`;
    let t8;
    if ($[17] !== t7) {
        t8 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
            onClick: t6,
            className: t7,
            children: "Рейтинг"
        }, void 0, false, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 128,
            columnNumber: 10
        }, this);
        $[17] = t7;
        $[18] = t8;
    } else {
        t8 = $[18];
    }
    let t9;
    if ($[19] === Symbol.for("react.memo_cache_sentinel")) {
        t9 = ({
            "Home[<button>.onClick]": ()=>setActiveTab("simulator")
        })["Home[<button>.onClick]"];
        $[19] = t9;
    } else {
        t9 = $[19];
    }
    const t10 = `px-3 sm:px-4 py-2 rounded-md font-medium transition-colors ${activeTab === "simulator" ? "bg-blue-600 text-white" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`;
    let t11;
    if ($[20] !== t10) {
        t11 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
            onClick: t9,
            className: t10,
            children: "Матчі"
        }, void 0, false, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 146,
            columnNumber: 11
        }, this);
        $[20] = t10;
        $[21] = t11;
    } else {
        t11 = $[21];
    }
    let t12;
    if ($[22] !== t11 || $[23] !== t5 || $[24] !== t8) {
        t12 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
            className: "bg-white shadow-md",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex justify-between items-center py-4",
                    children: [
                        t2,
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                            className: "flex space-x-2 sm:space-x-4",
                            children: [
                                t5,
                                t8,
                                t11
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 154,
                            columnNumber: 166
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 154,
                    columnNumber: 106
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 154,
                columnNumber: 50
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 154,
            columnNumber: 11
        }, this);
        $[22] = t11;
        $[23] = t5;
        $[24] = t8;
        $[25] = t12;
    } else {
        t12 = $[25];
    }
    let t13;
    if ($[26] !== activeTab || $[27] !== state.matches || $[28] !== state.players) {
        t13 = activeTab === "leaderboard" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Leaderboard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            players: state.players,
            matches: state.matches
        }, void 0, false, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 164,
            columnNumber: 42
        }, this);
        $[26] = activeTab;
        $[27] = state.matches;
        $[28] = state.players;
        $[29] = t13;
    } else {
        t13 = $[29];
    }
    let t14;
    if ($[30] !== activeTab) {
        t14 = activeTab === "simulator" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$MatchSimulator$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 174,
            columnNumber: 40
        }, this);
        $[30] = activeTab;
        $[31] = t14;
    } else {
        t14 = $[31];
    }
    let t15;
    if ($[32] !== activeTab) {
        t15 = activeTab === "tournaments" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-white rounded-lg shadow-lg p-8 text-center",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mb-4",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-6xl",
                        children: "🏆"
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 182,
                        columnNumber: 127
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 182,
                    columnNumber: 105
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                    className: "text-2xl font-bold text-gray-900 mb-4",
                    children: "Турніри"
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 182,
                    columnNumber: 169
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-lg text-gray-600",
                    children: "Проведення турнірів ще в розробці"
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 182,
                    columnNumber: 235
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 182,
            columnNumber: 42
        }, this);
        $[32] = activeTab;
        $[33] = t15;
    } else {
        t15 = $[33];
    }
    let t16;
    if ($[34] !== t13 || $[35] !== t14 || $[36] !== t15) {
        t16 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
            className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4",
            children: [
                t13,
                t14,
                t15
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 190,
            columnNumber: 11
        }, this);
        $[34] = t13;
        $[35] = t14;
        $[36] = t15;
        $[37] = t16;
    } else {
        t16 = $[37];
    }
    let t17;
    if ($[38] === Symbol.for("react.memo_cache_sentinel")) {
        t17 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
            className: "bg-white border-t mt-8",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-center text-gray-600",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm",
                            children: "© 2025 Рейтингова система для гравців у більярд"
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 200,
                            columnNumber: 158
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xs mt-1",
                            children: "Рейтингова система базується на алгоритмі ELO з кольоровою схемою як у Codeforces. Росул Максим."
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 200,
                            columnNumber: 232
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 200,
                    columnNumber: 115
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 200,
                columnNumber: 54
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 200,
            columnNumber: 11
        }, this);
        $[38] = t17;
    } else {
        t17 = $[38];
    }
    let t18;
    if ($[39] !== t12 || $[40] !== t16) {
        t18 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen bg-gray-100",
            children: [
                t12,
                t16,
                t17
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 207,
            columnNumber: 11
        }, this);
        $[39] = t12;
        $[40] = t16;
        $[41] = t18;
    } else {
        t18 = $[41];
    }
    return t18;
}
_s(Home, "HdAeRQIJD8tofUx72ctjTzHfNtk=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AppContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useApp"]
    ];
});
_c = Home;
function _HomeButtonOnClick() {
    return window.location.reload();
}
var _c;
__turbopack_context__.k.register(_c, "Home");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_b1bced61._.js.map
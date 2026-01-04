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
        name: 'Новачок',
        color: 'bg-gray-500',
        textColor: 'text-gray-500',
        minRating: 0,
        maxRating: 1199
    },
    {
        name: 'Учень',
        color: 'bg-green-500',
        textColor: 'text-green-500',
        minRating: 1200,
        maxRating: 1399
    },
    {
        name: 'Спеціаліст',
        color: 'bg-cyan-500',
        textColor: 'text-cyan-500',
        minRating: 1400,
        maxRating: 1599
    },
    {
        name: 'Експерт',
        color: 'bg-blue-500',
        textColor: 'text-blue-500',
        minRating: 1600,
        maxRating: 1799
    },
    {
        name: 'Кандидат у Майстри',
        color: 'bg-purple-500',
        textColor: 'text-purple-500',
        minRating: 1800,
        maxRating: 2299
    },
    {
        name: 'Майстер',
        color: 'bg-orange-500',
        textColor: 'text-orange-500',
        minRating: 2300,
        maxRating: 2499
    },
    {
        name: 'Гросмейстер',
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
"[project]/src/components/MatchHistory.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>MatchHistory
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
function MatchHistory(t0) {
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(16);
    if ($[0] !== "cfe20137b4d8bf2fff83065edc1b2c98b5814117cf45e1cfb1c22faf950de22d") {
        for(let $i = 0; $i < 16; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "cfe20137b4d8bf2fff83065edc1b2c98b5814117cf45e1cfb1c22faf950de22d";
    }
    const { matches, players, playerId, limit, disableSorting: t1 } = t0;
    t1 === undefined ? false : t1;
    let t2;
    if ($[1] !== players) {
        t2 = ({
            "MatchHistory[getPlayerById]": (id)=>players.find({
                    "MatchHistory[getPlayerById > players.find()]": (p)=>p.id === id
                }["MatchHistory[getPlayerById > players.find()]"])
        })["MatchHistory[getPlayerById]"];
        $[1] = players;
        $[2] = t2;
    } else {
        t2 = $[2];
    }
    const getPlayerById = t2;
    let t3;
    if ($[3] !== limit || $[4] !== matches) {
        t3 = limit ? matches.slice(0, limit) : matches;
        $[3] = limit;
        $[4] = matches;
        $[5] = t3;
    } else {
        t3 = $[5];
    }
    const displayedMatches = t3;
    if (displayedMatches.length === 0) {
        let t4;
        if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
            t4 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-white rounded-lg shadow-md p-8 text-center",
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
                            d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        }, void 0, false, {
                            fileName: "[project]/src/components/MatchHistory.tsx",
                            lineNumber: 57,
                            columnNumber: 178
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/MatchHistory.tsx",
                        lineNumber: 57,
                        columnNumber: 75
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "mt-2 text-lg font-medium text-gray-900",
                        children: "Матчів поки немає"
                    }, void 0, false, {
                        fileName: "[project]/src/components/MatchHistory.tsx",
                        lineNumber: 57,
                        columnNumber: 374
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-1 text-gray-500",
                        children: "Історія матчів з'явиться після першої гри"
                    }, void 0, false, {
                        fileName: "[project]/src/components/MatchHistory.tsx",
                        lineNumber: 57,
                        columnNumber: 451
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/MatchHistory.tsx",
                lineNumber: 57,
                columnNumber: 12
            }, this);
            $[6] = t4;
        } else {
            t4 = $[6];
        }
        return t4;
    }
    let t4;
    if ($[7] !== displayedMatches || $[8] !== getPlayerById || $[9] !== playerId) {
        let t5;
        if ($[11] !== getPlayerById || $[12] !== playerId) {
            t5 = ({
                "MatchHistory[displayedMatches.map()]": (match)=>{
                    const player1 = getPlayerById(match.player1Id);
                    const player2 = getPlayerById(match.player2Id);
                    if (!player1 || !player2) {
                        return null;
                    }
                    const winner = match.winnerId === player1.id ? player1 : player2;
                    match.winnerId === player1.id ? player2 : player1;
                    const player1IsTarget = playerId === player1.id;
                    const player2IsTarget = playerId === player2.id;
                    const isTargetPlayerMatch = player1IsTarget || player2IsTarget;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `bg-white rounded-lg shadow-md p-4 border-l-4 ${isTargetPlayerMatch ? match.winnerId === playerId ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50" : "border-gray-300"}`,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center space-x-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: `flex-1 ${player1IsTarget ? "font-semibold" : ""}`,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                        href: `/player/${encodeURIComponent(player1.name)}`,
                                                        className: `${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rating$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRatingBand"])(match.player1RatingBefore).textColor} hover:opacity-80 transition-colors`,
                                                        children: player1.name
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/MatchHistory.tsx",
                                                        lineNumber: 80,
                                                        columnNumber: 420
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center space-x-2 mt-1",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rating$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRatingBand"])(match.player1RatingBefore).textColor,
                                                                children: match.player1RatingBefore
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/MatchHistory.tsx",
                                                                lineNumber: 80,
                                                                columnNumber: 653
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-gray-400",
                                                                children: "→"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/MatchHistory.tsx",
                                                                lineNumber: 80,
                                                                columnNumber: 756
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rating$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRatingBand"])(match.player1RatingAfter).textColor,
                                                                children: match.player1RatingAfter
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/MatchHistory.tsx",
                                                                lineNumber: 80,
                                                                columnNumber: 796
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: `text-sm ${match.player1RatingChange > 0 ? "text-green-600" : match.player1RatingChange < 0 ? "text-red-600" : "text-gray-600"}`,
                                                                children: [
                                                                    "(",
                                                                    match.player1RatingChange > 0 ? "+" : "",
                                                                    match.player1RatingChange,
                                                                    ")"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/MatchHistory.tsx",
                                                                lineNumber: 80,
                                                                columnNumber: 897
                                                            }, this),
                                                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rating$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRatingBand"])(match.player1RatingBefore).name !== (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rating$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRatingBand"])(match.player1RatingAfter).name && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: `text-xs font-semibold px-2 py-1 rounded ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rating$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRatingBand"])(match.player1RatingAfter).color} text-white`,
                                                                children: [
                                                                    "Нове звання: ",
                                                                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rating$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRatingBand"])(match.player1RatingAfter).name
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/MatchHistory.tsx",
                                                                lineNumber: 80,
                                                                columnNumber: 1221
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/MatchHistory.tsx",
                                                        lineNumber: 80,
                                                        columnNumber: 603
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/MatchHistory.tsx",
                                                lineNumber: 80,
                                                columnNumber: 352
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-center",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-lg font-bold text-gray-900",
                                                        children: [
                                                            match.player1Score,
                                                            " : ",
                                                            match.player2Score
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/MatchHistory.tsx",
                                                        lineNumber: 80,
                                                        columnNumber: 1449
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-xs text-gray-500",
                                                        children: [
                                                            "до ",
                                                            match.maxScore
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/MatchHistory.tsx",
                                                        lineNumber: 80,
                                                        columnNumber: 1547
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/MatchHistory.tsx",
                                                lineNumber: 80,
                                                columnNumber: 1420
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: `flex-1 text-right ${player2IsTarget ? "font-semibold" : ""}`,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                        href: `/player/${encodeURIComponent(player2.name)}`,
                                                        className: `${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rating$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRatingBand"])(match.player2RatingBefore).textColor} hover:opacity-80 transition-colors`,
                                                        children: player2.name
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/MatchHistory.tsx",
                                                        lineNumber: 80,
                                                        columnNumber: 1696
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center justify-end space-x-2 mt-1",
                                                        children: [
                                                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rating$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRatingBand"])(match.player2RatingBefore).name !== (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rating$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRatingBand"])(match.player2RatingAfter).name && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: `text-xs font-semibold px-2 py-1 rounded ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rating$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRatingBand"])(match.player2RatingAfter).color} text-white`,
                                                                children: [
                                                                    "Нове звання: ",
                                                                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rating$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRatingBand"])(match.player2RatingAfter).name
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/MatchHistory.tsx",
                                                                lineNumber: 80,
                                                                columnNumber: 2040
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: `text-sm ${match.player2RatingChange > 0 ? "text-green-600" : match.player2RatingChange < 0 ? "text-red-600" : "text-gray-600"}`,
                                                                children: [
                                                                    "(",
                                                                    match.player2RatingChange > 0 ? "+" : "",
                                                                    match.player2RatingChange,
                                                                    ")"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/MatchHistory.tsx",
                                                                lineNumber: 80,
                                                                columnNumber: 2227
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rating$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRatingBand"])(match.player2RatingAfter).textColor,
                                                                children: match.player2RatingAfter
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/MatchHistory.tsx",
                                                                lineNumber: 80,
                                                                columnNumber: 2452
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-gray-400",
                                                                children: "←"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/MatchHistory.tsx",
                                                                lineNumber: 80,
                                                                columnNumber: 2553
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rating$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRatingBand"])(match.player2RatingBefore).textColor,
                                                                children: match.player2RatingBefore
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/MatchHistory.tsx",
                                                                lineNumber: 80,
                                                                columnNumber: 2593
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/MatchHistory.tsx",
                                                        lineNumber: 80,
                                                        columnNumber: 1879
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/MatchHistory.tsx",
                                                lineNumber: 80,
                                                columnNumber: 1617
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/MatchHistory.tsx",
                                        lineNumber: 80,
                                        columnNumber: 307
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mt-3 flex items-center justify-between",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-col space-y-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center space-x-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-sm text-gray-500",
                                                                children: "Переможець:"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/MatchHistory.tsx",
                                                                lineNumber: 80,
                                                                columnNumber: 2856
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                                href: `/player/${encodeURIComponent(winner.name)}`,
                                                                className: `${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rating$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRatingBand"])(match.winnerId === player1.id ? match.player1RatingAfter : match.player2RatingAfter).textColor} font-semibold hover:opacity-80 transition-colors`,
                                                                children: winner.name
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/MatchHistory.tsx",
                                                                lineNumber: 80,
                                                                columnNumber: 2914
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/MatchHistory.tsx",
                                                        lineNumber: 80,
                                                        columnNumber: 2811
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center space-x-2",
                                                        children: [
                                                            match.tournament && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "text-xs text-gray-600",
                                                                children: match.tournament
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/MatchHistory.tsx",
                                                                lineNumber: 80,
                                                                columnNumber: 3239
                                                            }, this),
                                                            match.stage && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: `text-xs font-semibold px-2 py-0.5 rounded ${match.stage === "final" ? "bg-yellow-100 text-yellow-800" : match.stage === "semifinal" ? "bg-orange-100 text-orange-800" : match.stage === "quarterfinal" ? "bg-purple-100 text-purple-800" : match.stage === "round16" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}`,
                                                                children: [
                                                                    match.stage === "final" ? "\u0424\u0456\u043D\u0430\u043B" : match.stage === "semifinal" ? "\u041F\u0456\u0432\u0444\u0456\u043D\u0430\u043B" : match.stage === "quarterfinal" ? "\u0427\u0432\u0435\u0440\u0442\u044C\u0444\u0456\u043D\u0430\u043B" : match.stage === "round16" ? "1/8" : match.stage,
                                                                    match.matchWeight && match.matchWeight > 1 && ` ×${match.matchWeight.toFixed(1)}`
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/MatchHistory.tsx",
                                                                lineNumber: 80,
                                                                columnNumber: 3319
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/MatchHistory.tsx",
                                                        lineNumber: 80,
                                                        columnNumber: 3173
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/MatchHistory.tsx",
                                                lineNumber: 80,
                                                columnNumber: 2770
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-sm text-gray-500",
                                                children: new Date(match.date).toLocaleDateString("uk-UA", {
                                                    year: "numeric",
                                                    month: "short",
                                                    day: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit"
                                                })
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/MatchHistory.tsx",
                                                lineNumber: 80,
                                                columnNumber: 4059
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/MatchHistory.tsx",
                                        lineNumber: 80,
                                        columnNumber: 2714
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/MatchHistory.tsx",
                                lineNumber: 80,
                                columnNumber: 283
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/MatchHistory.tsx",
                            lineNumber: 80,
                            columnNumber: 232
                        }, this)
                    }, match.id, false, {
                        fileName: "[project]/src/components/MatchHistory.tsx",
                        lineNumber: 80,
                        columnNumber: 18
                    }, this);
                }
            })["MatchHistory[displayedMatches.map()]"];
            $[11] = getPlayerById;
            $[12] = playerId;
            $[13] = t5;
        } else {
            t5 = $[13];
        }
        t4 = displayedMatches.map(t5);
        $[7] = displayedMatches;
        $[8] = getPlayerById;
        $[9] = playerId;
        $[10] = t4;
    } else {
        t4 = $[10];
    }
    let t5;
    if ($[14] !== t4) {
        t5 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "space-y-4",
            children: t4
        }, void 0, false, {
            fileName: "[project]/src/components/MatchHistory.tsx",
            lineNumber: 105,
            columnNumber: 10
        }, this);
        $[14] = t4;
        $[15] = t5;
    } else {
        t5 = $[15];
    }
    return t5;
}
_c = MatchHistory;
var _c;
__turbopack_context__.k.register(_c, "MatchHistory");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/RatingChart.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RatingChart
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rating$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/rating.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
// Кольорові зони рейтингу (як в Codeforces)
const RATING_BANDS = [
    {
        min: 0,
        max: 1199,
        color: '#808080',
        name: 'Новачок'
    },
    {
        min: 1200,
        max: 1399,
        color: '#008000',
        name: 'Учень'
    },
    {
        min: 1400,
        max: 1599,
        color: '#03A89E',
        name: 'Спеціаліст'
    },
    {
        min: 1600,
        max: 1799,
        color: '#0000FF',
        name: 'Експерт'
    },
    {
        min: 1800,
        max: 2299,
        color: '#AA00AA',
        name: 'Кандидат у Майстри'
    },
    {
        min: 2300,
        max: 2499,
        color: '#FF8C00',
        name: 'Майстер'
    },
    {
        min: 2500,
        max: 9999,
        color: '#FF0000',
        name: 'Гросмейстер'
    }
];
function RatingChart(t0) {
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(93);
    if ($[0] !== "dfb6a68ec352a709cd0382361f77654f013204c3abe0df619dd004b8eb12fedb") {
        for(let $i = 0; $i < 93; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "dfb6a68ec352a709cd0382361f77654f013204c3abe0df619dd004b8eb12fedb";
    }
    const { player, matches, players: t1, className: t2 } = t0;
    let t3;
    if ($[1] !== t1) {
        t3 = t1 === undefined ? [] : t1;
        $[1] = t1;
        $[2] = t3;
    } else {
        t3 = $[2];
    }
    const players = t3;
    const className = t2 === undefined ? "" : t2;
    const [hoveredIndex, setHoveredIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    let t4;
    if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
        t4 = {
            x: 0,
            y: 0
        };
        $[3] = t4;
    } else {
        t4 = $[3];
    }
    const [tooltipPos, setTooltipPos] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(t4);
    let t5;
    if ($[4] !== matches || $[5] !== player.createdAt || $[6] !== player.id || $[7] !== player.initialRating) {
        t5 = ({
            "RatingChart[createRatingHistory]": ()=>{
                const history = [];
                const playerMatches = matches.filter({
                    "RatingChart[createRatingHistory > matches.filter()]": (match)=>match.player1Id === player.id || match.player2Id === player.id
                }["RatingChart[createRatingHistory > matches.filter()]"]).sort(_RatingChartCreateRatingHistoryAnonymous);
                const createdAtDate = player.createdAt ? new Date(player.createdAt) : null;
                const firstMatchDate = playerMatches[0] ? new Date(playerMatches[0].date) : null;
                const initialDate = createdAtDate && firstMatchDate ? createdAtDate <= firstMatchDate ? createdAtDate : firstMatchDate : createdAtDate || firstMatchDate || new Date();
                const startingRating = player.initialRating ?? 1300;
                history.push({
                    date: initialDate,
                    rating: startingRating,
                    reason: "initial"
                });
                playerMatches.forEach({
                    "RatingChart[createRatingHistory > playerMatches.forEach()]": (match_0)=>{
                        const ratingAfter = match_0.player1Id === player.id ? match_0.player1RatingAfter : match_0.player2RatingAfter;
                        history.push({
                            date: new Date(match_0.date),
                            rating: ratingAfter,
                            matchId: match_0.id,
                            reason: "match"
                        });
                    }
                }["RatingChart[createRatingHistory > playerMatches.forEach()]"]);
                return history;
            }
        })["RatingChart[createRatingHistory]"];
        $[4] = matches;
        $[5] = player.createdAt;
        $[6] = player.id;
        $[7] = player.initialRating;
        $[8] = t5;
    } else {
        t5 = $[8];
    }
    const createRatingHistory = t5;
    let ratingHistory;
    let t10;
    let t11;
    let t12;
    let t13;
    let t14;
    let t15;
    let t16;
    let t17;
    let t18;
    let t19;
    let t20;
    let t21;
    let t22;
    let t23;
    let t24;
    let t6;
    let t7;
    let t8;
    let t9;
    if ($[9] !== className || $[10] !== createRatingHistory || $[11] !== hoveredIndex || $[12] !== player.rating) {
        t24 = Symbol.for("react.early_return_sentinel");
        bb0: {
            ratingHistory = createRatingHistory();
            if (ratingHistory.length < 2) {
                let t25;
                if ($[33] === Symbol.for("react.memo_cache_sentinel")) {
                    t25 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "text-lg font-semibold text-gray-900 mb-4",
                        children: "Графік рейтингу"
                    }, void 0, false, {
                        fileName: "[project]/src/components/RatingChart.tsx",
                        lineNumber: 161,
                        columnNumber: 17
                    }, this);
                    $[33] = t25;
                } else {
                    t25 = $[33];
                }
                let t26;
                if ($[34] === Symbol.for("react.memo_cache_sentinel")) {
                    t26 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-white rounded-lg shadow-md p-6",
                        children: [
                            t25,
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-center py-8 text-gray-500",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: "Недостатньо даних для побудови графіка"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/RatingChart.tsx",
                                        lineNumber: 168,
                                        columnNumber: 121
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm mt-1",
                                        children: "Зіграйте кілька матчів, щоб побачити графік"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/RatingChart.tsx",
                                        lineNumber: 168,
                                        columnNumber: 166
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/RatingChart.tsx",
                                lineNumber: 168,
                                columnNumber: 73
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/RatingChart.tsx",
                        lineNumber: 168,
                        columnNumber: 17
                    }, this);
                    $[34] = t26;
                } else {
                    t26 = $[34];
                }
                t24 = t26;
                break bb0;
            }
            const minRating = Math.min(...ratingHistory.map(_RatingChartRatingHistoryMap));
            const maxRating = Math.max(...ratingHistory.map(_RatingChartRatingHistoryMap2));
            const ratingRange = maxRating - minRating;
            const padding = Math.max(50, ratingRange * 0.1);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rating$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRatingBand"])(player.rating);
            let t25;
            if ($[35] !== player.rating) {
                t25 = ({
                    "RatingChart[RATING_BANDS.find()]": (band)=>band.min > player.rating
                })["RatingChart[RATING_BANDS.find()]"];
                $[35] = player.rating;
                $[36] = t25;
            } else {
                t25 = $[36];
            }
            const nextBand = RATING_BANDS.find(t25);
            const chartMinRating = Math.max(0, minRating - padding);
            const chartMaxRating = nextBand ? Math.max(maxRating + padding, nextBand.min + 100) : maxRating + padding;
            const chartRatingRange = chartMaxRating - chartMinRating;
            const xScale = {
                "RatingChart[xScale]": (index)=>60 + index / (ratingHistory.length - 1) * 700
            }["RatingChart[xScale]"];
            let t26;
            if ($[37] !== chartMinRating || $[38] !== chartRatingRange) {
                t26 = ({
                    "RatingChart[yScale]": (rating)=>340 - (rating - chartMinRating) / chartRatingRange * 320
                })["RatingChart[yScale]"];
                $[37] = chartMinRating;
                $[38] = chartRatingRange;
                $[39] = t26;
            } else {
                t26 = $[39];
            }
            const yScale = t26;
            const linePath = ratingHistory.map({
                "RatingChart[ratingHistory.map()]": (point, index_0)=>`${index_0 === 0 ? "M" : "L"} ${xScale(index_0)} ${yScale(point.rating)}`
            }["RatingChart[ratingHistory.map()]"]).join(" ");
            const years = Array.from(new Set(ratingHistory.map(_RatingChartRatingHistoryMap3))).sort(_RatingChartAnonymous);
            const yearPositions = years.map({
                "RatingChart[years.map()]": (year)=>{
                    const firstPointIdx = ratingHistory.findIndex({
                        "RatingChart[years.map() > ratingHistory.findIndex()]": (p_2)=>new Date(p_2.date).getFullYear() === year
                    }["RatingChart[years.map() > ratingHistory.findIndex()]"]);
                    if (firstPointIdx === -1) {
                        return null;
                    }
                    return {
                        year,
                        x: xScale(firstPointIdx)
                    };
                }
            }["RatingChart[years.map()]"]).filter(_RatingChartAnonymous2);
            let t27;
            if ($[40] !== chartMaxRating || $[41] !== chartMinRating) {
                t27 = ({
                    "RatingChart[RATING_BANDS.filter()]": (band_0)=>band_0.min < chartMaxRating && band_0.max > chartMinRating
                })["RatingChart[RATING_BANDS.filter()]"];
                $[40] = chartMaxRating;
                $[41] = chartMinRating;
                $[42] = t27;
            } else {
                t27 = $[42];
            }
            const ratingLevels = RATING_BANDS.filter(t27);
            t22 = `bg-white rounded-lg shadow-md p-6 ${className}`;
            if ($[43] === Symbol.for("react.memo_cache_sentinel")) {
                t23 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                    className: "text-lg font-semibold text-gray-900 mb-4",
                    children: "Графік рейтингу"
                }, void 0, false, {
                    fileName: "[project]/src/components/RatingChart.tsx",
                    lineNumber: 242,
                    columnNumber: 15
                }, this);
                $[43] = t23;
            } else {
                t23 = $[43];
            }
            t21 = "relative overflow-x-auto";
            t6 = 800;
            t7 = 400;
            t8 = "border border-gray-200 rounded min-w-full md:min-w-0";
            t9 = "0 0 800 400";
            t10 = "xMidYMid meet";
            let t28;
            if ($[44] !== chartMaxRating || $[45] !== chartMinRating || $[46] !== yScale) {
                t28 = ({
                    "RatingChart[ratingLevels.map()]": (band_1, index_1)=>{
                        const bandTop = Math.max(band_1.min, chartMinRating);
                        const bandBottom = Math.min(band_1.max, chartMaxRating);
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                            x: 60,
                            y: yScale(bandBottom),
                            width: 700,
                            height: yScale(bandTop) - yScale(bandBottom),
                            fill: band_1.color,
                            fillOpacity: 0.1,
                            stroke: band_1.color,
                            strokeOpacity: 0.3,
                            strokeWidth: 0.5
                        }, index_1, false, {
                            fileName: "[project]/src/components/RatingChart.tsx",
                            lineNumber: 259,
                            columnNumber: 20
                        }, this);
                    }
                })["RatingChart[ratingLevels.map()]"];
                $[44] = chartMaxRating;
                $[45] = chartMinRating;
                $[46] = yScale;
                $[47] = t28;
            } else {
                t28 = $[47];
            }
            t11 = ratingLevels.map(t28);
            let t29;
            if ($[48] !== chartMaxRating || $[49] !== chartMinRating || $[50] !== yScale) {
                t29 = ({
                    "RatingChart[ratingLevels.map()]": (band_2, index_2)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("g", {
                            children: [
                                band_2.min,
                                band_2.max
                            ].filter({
                                "RatingChart[ratingLevels.map() > (anonymous)()]": (rating_0)=>rating_0 > chartMinRating && rating_0 < chartMaxRating
                            }["RatingChart[ratingLevels.map() > (anonymous)()]"]).map({
                                "RatingChart[ratingLevels.map() > (anonymous)()]": (rating_1)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                        x1: 60,
                                        y1: yScale(rating_1),
                                        x2: 760,
                                        y2: yScale(rating_1),
                                        stroke: band_2.color,
                                        strokeOpacity: 0.4,
                                        strokeWidth: 1,
                                        strokeDasharray: "2,2"
                                    }, rating_1, false, {
                                        fileName: "[project]/src/components/RatingChart.tsx",
                                        lineNumber: 276,
                                        columnNumber: 78
                                    }, this)
                            }["RatingChart[ratingLevels.map() > (anonymous)()]"])
                        }, `grid-${index_2}`, false, {
                            fileName: "[project]/src/components/RatingChart.tsx",
                            lineNumber: 273,
                            columnNumber: 67
                        }, this)
                })["RatingChart[ratingLevels.map()]"];
                $[48] = chartMaxRating;
                $[49] = chartMinRating;
                $[50] = yScale;
                $[51] = t29;
            } else {
                t29 = $[51];
            }
            t12 = ratingLevels.map(t29);
            if ($[52] !== linePath) {
                t13 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                    d: linePath,
                    fill: "none",
                    stroke: "#2563eb",
                    strokeWidth: 3,
                    strokeLinecap: "round",
                    strokeLinejoin: "round"
                }, void 0, false, {
                    fileName: "[project]/src/components/RatingChart.tsx",
                    lineNumber: 288,
                    columnNumber: 15
                }, this);
                $[52] = linePath;
                $[53] = t13;
            } else {
                t13 = $[53];
            }
            t14 = ratingHistory.map({
                "RatingChart[ratingHistory.map()]": (point_0, index_3)=>{
                    const ratingBand = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rating$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRatingBand"])(point_0.rating);
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                        cx: xScale(index_3),
                        cy: yScale(point_0.rating),
                        r: hoveredIndex === index_3 ? 7 : point_0.reason === "tournament" ? 6 : 4,
                        fill: ratingBand.color,
                        stroke: "#fff",
                        strokeWidth: 2,
                        className: "transition-all cursor-pointer hover:opacity-80",
                        onMouseEnter: {
                            "RatingChart[ratingHistory.map() > <circle>.onMouseEnter]": (e)=>{
                                setHoveredIndex(index_3);
                                const rect = e.target.getBoundingClientRect();
                                setTooltipPos({
                                    x: rect.left + rect.width / 2,
                                    y: rect.top - 8
                                });
                            }
                        }["RatingChart[ratingHistory.map() > <circle>.onMouseEnter]"],
                        onMouseLeave: {
                            "RatingChart[ratingHistory.map() > <circle>.onMouseLeave]": ()=>setHoveredIndex(null)
                        }["RatingChart[ratingHistory.map() > <circle>.onMouseLeave]"]
                    }, index_3, false, {
                        fileName: "[project]/src/components/RatingChart.tsx",
                        lineNumber: 297,
                        columnNumber: 18
                    }, this);
                }
            }["RatingChart[ratingHistory.map()]"]);
            if ($[54] === Symbol.for("react.memo_cache_sentinel")) {
                t15 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                    x1: 60,
                    y1: 20,
                    x2: 60,
                    y2: 340,
                    stroke: "#374151",
                    strokeWidth: 2
                }, void 0, false, {
                    fileName: "[project]/src/components/RatingChart.tsx",
                    lineNumber: 312,
                    columnNumber: 15
                }, this);
                t16 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                    x1: 60,
                    y1: 340,
                    x2: 760,
                    y2: 340,
                    stroke: "#374151",
                    strokeWidth: 2
                }, void 0, false, {
                    fileName: "[project]/src/components/RatingChart.tsx",
                    lineNumber: 313,
                    columnNumber: 15
                }, this);
                $[54] = t15;
                $[55] = t16;
            } else {
                t15 = $[54];
                t16 = $[55];
            }
            t17 = yearPositions.map(_RatingChartYearPositionsMap);
            let t30;
            if ($[56] !== yScale) {
                t30 = ({
                    "RatingChart[ratingLevels.map()]": (band_3, index_4)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("text", {
                            x: 50,
                            y: yScale(band_3.min) + 4,
                            textAnchor: "end",
                            fontSize: "12",
                            fill: band_3.color,
                            fontWeight: "600",
                            children: band_3.min
                        }, `label-${index_4}`, false, {
                            fileName: "[project]/src/components/RatingChart.tsx",
                            lineNumber: 324,
                            columnNumber: 67
                        }, this)
                })["RatingChart[ratingLevels.map()]"];
                $[56] = yScale;
                $[57] = t30;
            } else {
                t30 = $[57];
            }
            t18 = ratingLevels.map(t30);
            const t31 = yScale(player.rating) + 4;
            if ($[58] !== player.rating || $[59] !== t31) {
                t19 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("text", {
                    x: 50,
                    y: t31,
                    textAnchor: "end",
                    fontSize: "14",
                    fill: "#1f2937",
                    fontWeight: "bold",
                    children: player.rating
                }, void 0, false, {
                    fileName: "[project]/src/components/RatingChart.tsx",
                    lineNumber: 334,
                    columnNumber: 15
                }, this);
                $[58] = player.rating;
                $[59] = t31;
                $[60] = t19;
            } else {
                t19 = $[60];
            }
            t20 = nextBand && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                        x1: 60,
                        y1: yScale(nextBand.min),
                        x2: 760,
                        y2: yScale(nextBand.min),
                        stroke: nextBand.color,
                        strokeWidth: 2,
                        strokeDasharray: "6,4",
                        opacity: 0.7
                    }, void 0, false, {
                        fileName: "[project]/src/components/RatingChart.tsx",
                        lineNumber: 341,
                        columnNumber: 27
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("text", {
                        x: 770,
                        y: yScale(nextBand.min) + 4,
                        textAnchor: "start",
                        fontSize: "13",
                        fill: nextBand.color,
                        fontWeight: "700",
                        children: [
                            nextBand.min,
                            " ▶ ",
                            nextBand.name
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/RatingChart.tsx",
                        lineNumber: 341,
                        columnNumber: 180
                    }, this)
                ]
            }, void 0, true);
        }
        $[9] = className;
        $[10] = createRatingHistory;
        $[11] = hoveredIndex;
        $[12] = player.rating;
        $[13] = ratingHistory;
        $[14] = t10;
        $[15] = t11;
        $[16] = t12;
        $[17] = t13;
        $[18] = t14;
        $[19] = t15;
        $[20] = t16;
        $[21] = t17;
        $[22] = t18;
        $[23] = t19;
        $[24] = t20;
        $[25] = t21;
        $[26] = t22;
        $[27] = t23;
        $[28] = t24;
        $[29] = t6;
        $[30] = t7;
        $[31] = t8;
        $[32] = t9;
    } else {
        ratingHistory = $[13];
        t10 = $[14];
        t11 = $[15];
        t12 = $[16];
        t13 = $[17];
        t14 = $[18];
        t15 = $[19];
        t16 = $[20];
        t17 = $[21];
        t18 = $[22];
        t19 = $[23];
        t20 = $[24];
        t21 = $[25];
        t22 = $[26];
        t23 = $[27];
        t24 = $[28];
        t6 = $[29];
        t7 = $[30];
        t8 = $[31];
        t9 = $[32];
    }
    if (t24 !== Symbol.for("react.early_return_sentinel")) {
        return t24;
    }
    let t25;
    if ($[61] !== t10 || $[62] !== t11 || $[63] !== t12 || $[64] !== t13 || $[65] !== t14 || $[66] !== t15 || $[67] !== t16 || $[68] !== t17 || $[69] !== t18 || $[70] !== t19 || $[71] !== t20 || $[72] !== t6 || $[73] !== t7 || $[74] !== t8 || $[75] !== t9) {
        t25 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            width: t6,
            height: t7,
            className: t8,
            viewBox: t9,
            preserveAspectRatio: t10,
            children: [
                t11,
                t12,
                t13,
                t14,
                t15,
                t16,
                t17,
                t18,
                t19,
                t20
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/RatingChart.tsx",
            lineNumber: 394,
            columnNumber: 11
        }, this);
        $[61] = t10;
        $[62] = t11;
        $[63] = t12;
        $[64] = t13;
        $[65] = t14;
        $[66] = t15;
        $[67] = t16;
        $[68] = t17;
        $[69] = t18;
        $[70] = t19;
        $[71] = t20;
        $[72] = t6;
        $[73] = t7;
        $[74] = t8;
        $[75] = t9;
        $[76] = t25;
    } else {
        t25 = $[76];
    }
    let t26;
    if ($[77] !== hoveredIndex || $[78] !== matches || $[79] !== player.id || $[80] !== players || $[81] !== ratingHistory || $[82] !== tooltipPos) {
        t26 = hoveredIndex !== null && ratingHistory[hoveredIndex]?.matchId && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "fixed bg-gray-900 text-white px-3 py-2 rounded shadow-lg text-xs z-50 pointer-events-none",
            style: {
                left: `${tooltipPos.x}px`,
                top: `${tooltipPos.y}px`,
                transform: "translate(-50%, -100%)",
                minWidth: "200px"
            },
            children: (()=>{
                const point_1 = ratingHistory[hoveredIndex];
                const matchData = matches.find({
                    "RatingChart[<anonymous> > matches.find()]": (m)=>m.id === point_1.matchId
                }["RatingChart[<anonymous> > matches.find()]"]);
                if (!matchData) {
                    return null;
                }
                const isP1 = matchData.player1Id === player.id;
                const opponentId = isP1 ? matchData.player2Id : matchData.player1Id;
                const opponent = players.find({
                    "RatingChart[<anonymous> > players.find()]": (p_4)=>p_4.id === opponentId
                }["RatingChart[<anonymous> > players.find()]"]);
                const opponentName = opponent ? opponent.name : "\u0421\u0443\u043F\u0435\u0440\u043D\u0438\u043A";
                const ratingChange = isP1 ? matchData.player1RatingChange : matchData.player2RatingChange;
                const playerScore = isP1 ? matchData.player1Score : matchData.player2Score;
                const opponentScore = isP1 ? matchData.player2Score : matchData.player1Score;
                const matchDate = new Date(matchData.date).toLocaleDateString("uk-UA", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                });
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-1 text-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-yellow-300 font-semibold text-xs border-b border-gray-700 pb-1",
                            children: [
                                "vs ",
                                opponentName
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/RatingChart.tsx",
                            lineNumber: 443,
                            columnNumber: 55
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-white font-semibold text-sm",
                            children: [
                                playerScore,
                                ":",
                                opponentScore
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/RatingChart.tsx",
                            lineNumber: 443,
                            columnNumber: 163
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `font-bold text-base ${ratingChange >= 0 ? "text-green-400" : "text-red-400"}`,
                            children: [
                                ratingChange > 0 ? "+" : "",
                                ratingChange
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/RatingChart.tsx",
                            lineNumber: 443,
                            columnNumber: 248
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-blue-300 font-semibold text-sm border-t border-gray-700 pt-1",
                            children: [
                                "Рейтинг: ",
                                point_1.rating
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/RatingChart.tsx",
                            lineNumber: 443,
                            columnNumber: 393
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-gray-300 text-xs",
                            children: matchDate
                        }, void 0, false, {
                            fileName: "[project]/src/components/RatingChart.tsx",
                            lineNumber: 443,
                            columnNumber: 507
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/RatingChart.tsx",
                    lineNumber: 443,
                    columnNumber: 16
                }, this);
            })()
        }, void 0, false, {
            fileName: "[project]/src/components/RatingChart.tsx",
            lineNumber: 416,
            columnNumber: 76
        }, this);
        $[77] = hoveredIndex;
        $[78] = matches;
        $[79] = player.id;
        $[80] = players;
        $[81] = ratingHistory;
        $[82] = tooltipPos;
        $[83] = t26;
    } else {
        t26 = $[83];
    }
    let t27;
    if ($[84] === Symbol.for("react.memo_cache_sentinel")) {
        t27 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "mt-4 flex flex-wrap gap-3",
            children: RATING_BANDS.map(_RatingChartRATING_BANDSMap)
        }, void 0, false, {
            fileName: "[project]/src/components/RatingChart.tsx",
            lineNumber: 457,
            columnNumber: 11
        }, this);
        $[84] = t27;
    } else {
        t27 = $[84];
    }
    let t28;
    if ($[85] !== t21 || $[86] !== t25 || $[87] !== t26) {
        t28 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: t21,
            children: [
                t25,
                t26,
                t27
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/RatingChart.tsx",
            lineNumber: 464,
            columnNumber: 11
        }, this);
        $[85] = t21;
        $[86] = t25;
        $[87] = t26;
        $[88] = t28;
    } else {
        t28 = $[88];
    }
    let t29;
    if ($[89] !== t22 || $[90] !== t23 || $[91] !== t28) {
        t29 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: t22,
            children: [
                t23,
                t28
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/RatingChart.tsx",
            lineNumber: 474,
            columnNumber: 11
        }, this);
        $[89] = t22;
        $[90] = t23;
        $[91] = t28;
        $[92] = t29;
    } else {
        t29 = $[92];
    }
    return t29;
}
_s(RatingChart, "bl8XosefRVsmVWwyTBCTqKYoPgc=");
_c = RatingChart;
function _RatingChartRATING_BANDSMap(band_4, index_5) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center gap-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-4 h-4 rounded",
                style: {
                    backgroundColor: band_4.color
                }
            }, void 0, false, {
                fileName: "[project]/src/components/RatingChart.tsx",
                lineNumber: 485,
                columnNumber: 65
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-sm text-gray-600",
                children: [
                    band_4.name,
                    " (",
                    band_4.min,
                    "-",
                    band_4.max === 4000 ? "\u221E" : band_4.max,
                    ")"
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/RatingChart.tsx",
                lineNumber: 487,
                columnNumber: 10
            }, this)
        ]
    }, index_5, true, {
        fileName: "[project]/src/components/RatingChart.tsx",
        lineNumber: 485,
        columnNumber: 10
    }, this);
}
function _RatingChartYearPositionsMap(pos, idx) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("g", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                x1: pos.x,
                y1: 340,
                x2: pos.x,
                y2: 346,
                stroke: "#9ca3af",
                strokeWidth: 1
            }, void 0, false, {
                fileName: "[project]/src/components/RatingChart.tsx",
                lineNumber: 490,
                columnNumber: 33
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("text", {
                x: pos.x,
                y: 360,
                textAnchor: "middle",
                fontSize: "12",
                fill: "#6b7280",
                fontWeight: "500",
                children: pos.year
            }, void 0, false, {
                fileName: "[project]/src/components/RatingChart.tsx",
                lineNumber: 490,
                columnNumber: 114
            }, this)
        ]
    }, `year-${idx}`, true, {
        fileName: "[project]/src/components/RatingChart.tsx",
        lineNumber: 490,
        columnNumber: 10
    }, this);
}
function _RatingChartAnonymous2(p_3) {
    return p_3 !== null;
}
function _RatingChartAnonymous(a_0, b_0) {
    return a_0 - b_0;
}
function _RatingChartRatingHistoryMap3(p_1) {
    return new Date(p_1.date).getFullYear();
}
function _RatingChartRatingHistoryMap2(p_0) {
    return p_0.rating;
}
function _RatingChartRatingHistoryMap(p) {
    return p.rating;
}
function _RatingChartCreateRatingHistoryAnonymous(a, b) {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
}
var _c;
__turbopack_context__.k.register(_c, "RatingChart");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/player/[id]/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PlayerProfile
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AppContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/AppContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rating$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/rating.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$MatchHistory$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/MatchHistory.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$RatingChart$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/RatingChart.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
;
function PlayerProfile() {
    _s();
    const { state } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AppContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useApp"])();
    const params = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useParams"])();
    // Декодуємо URL-encoded параметр (кирилиця)
    const playerIdentifier = decodeURIComponent(params.id);
    // Знаходимо гравця за іменем або ID (для зворотної сумісності з UUID)
    const player = state.players.find((p)=>p.name === playerIdentifier || p.id === playerIdentifier);
    const [mounted, setMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('history');
    const [playerMatches, setPlayerMatches] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [matchesLoading, setMatchesLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    // Завантажуємо матчі гравця з API
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PlayerProfile.useEffect": ()=>{
            const loadPlayerMatches = {
                "PlayerProfile.useEffect.loadPlayerMatches": async ()=>{
                    if (player) {
                        setMatchesLoading(true);
                        try {
                            const matches = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fetchMatches"])(player.id);
                            // Реверсуємо щоб показувати найновіші зверху
                            setPlayerMatches(matches.reverse());
                        } catch (error) {
                            console.error('Error loading player matches:', error);
                        } finally{
                            setMatchesLoading(false);
                        }
                    }
                }
            }["PlayerProfile.useEffect.loadPlayerMatches"];
            loadPlayerMatches();
        }
    }["PlayerProfile.useEffect"], [
        player?.id
    ]);
    // Prevent hydration mismatch
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PlayerProfile.useEffect": ()=>{
            setMounted(true);
        }
    }["PlayerProfile.useEffect"], []);
    if (!mounted || state.loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen bg-gray-100",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                    className: "bg-white shadow-md",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between py-6",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center space-x-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/",
                                        className: "text-gray-600 hover:text-gray-900 transition-colors",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                            className: "h-6 w-6",
                                            fill: "none",
                                            viewBox: "0 0 24 24",
                                            stroke: "currentColor",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                strokeLinecap: "round",
                                                strokeLinejoin: "round",
                                                strokeWidth: 2,
                                                d: "M15 19l-7-7 7-7"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/player/[id]/page.tsx",
                                                lineNumber: 58,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/player/[id]/page.tsx",
                                            lineNumber: 57,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/player/[id]/page.tsx",
                                        lineNumber: 56,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        className: "text-2xl font-bold text-gray-900",
                                        children: "Профіль гравця"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/player/[id]/page.tsx",
                                        lineNumber: 61,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/player/[id]/page.tsx",
                                lineNumber: 55,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/player/[id]/page.tsx",
                            lineNumber: 54,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/player/[id]/page.tsx",
                        lineNumber: 53,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/player/[id]/page.tsx",
                    lineNumber: 52,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                    className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-white rounded-lg shadow-lg p-8 flex items-center space-x-4 justify-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
                            }, void 0, false, {
                                fileName: "[project]/src/app/player/[id]/page.tsx",
                                lineNumber: 70,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-lg",
                                children: "Завантаження..."
                            }, void 0, false, {
                                fileName: "[project]/src/app/player/[id]/page.tsx",
                                lineNumber: 71,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/player/[id]/page.tsx",
                        lineNumber: 69,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/player/[id]/page.tsx",
                    lineNumber: 68,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/player/[id]/page.tsx",
            lineNumber: 51,
            columnNumber: 12
        }, this);
    }
    // Якщо гравця немає в списку, але є в матчах — створюємо віртуального гравця
    let virtualPlayer = player;
    if (!player) {
        // Шукаємо гравця в матчах за іменем або ID
        const playerMatches_0 = state.matches.filter((match)=>match.player1Id === playerIdentifier || match.player2Id === playerIdentifier || match.player1Name === playerIdentifier || match.player2Name === playerIdentifier);
        if (playerMatches_0.length > 0) {
            // Знаходимо останній матч для отримання актуального рейтингу
            const lastMatch = playerMatches_0[playerMatches_0.length - 1];
            const isPlayer1 = lastMatch.player1Id === playerIdentifier || lastMatch.player1Name === playerIdentifier;
            const currentRating = isPlayer1 ? lastMatch.player1RatingAfter : lastMatch.player2RatingAfter;
            const actualId = isPlayer1 ? lastMatch.player1Id : lastMatch.player2Id;
            // Отримуємо ім'я з матчу
            const playerName = isPlayer1 ? lastMatch.player1Name || `Гравець ${playerIdentifier}` : lastMatch.player2Name || `Гравець ${playerIdentifier}`;
            virtualPlayer = {
                id: actualId,
                name: playerName,
                rating: currentRating,
                matches: playerMatches_0.map((m)=>m.id),
                createdAt: new Date(playerMatches_0[0].date),
                updatedAt: new Date(lastMatch.date)
            };
        }
    }
    if (!virtualPlayer) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen bg-gray-100 flex items-center justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-white rounded-lg shadow-lg p-8 text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-gray-400 mb-4",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                            className: "mx-auto h-12 w-12",
                            fill: "none",
                            viewBox: "0 0 24 24",
                            stroke: "currentColor",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                strokeLinecap: "round",
                                strokeLinejoin: "round",
                                strokeWidth: 2,
                                d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            }, void 0, false, {
                                fileName: "[project]/src/app/player/[id]/page.tsx",
                                lineNumber: 106,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/player/[id]/page.tsx",
                            lineNumber: 105,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/player/[id]/page.tsx",
                        lineNumber: 104,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-xl font-bold text-gray-900 mb-2",
                        children: "Гравця не знайдено"
                    }, void 0, false, {
                        fileName: "[project]/src/app/player/[id]/page.tsx",
                        lineNumber: 109,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-gray-600 mb-4",
                        children: "Гравець з таким ID не існує"
                    }, void 0, false, {
                        fileName: "[project]/src/app/player/[id]/page.tsx",
                        lineNumber: 110,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        href: "/",
                        className: "bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors inline-block",
                        children: "Повернутися до рейтингу"
                    }, void 0, false, {
                        fileName: "[project]/src/app/player/[id]/page.tsx",
                        lineNumber: 111,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/player/[id]/page.tsx",
                lineNumber: 103,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/player/[id]/page.tsx",
            lineNumber: 102,
            columnNumber: 12
        }, this);
    }
    const ratingBand = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rating$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRatingBand"])(virtualPlayer.rating);
    const stats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rating$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculatePlayerStats"])(virtualPlayer, playerMatches);
    // Сортуємо матчі за зміною рейтингу для вкладки "Найкращі матчі"
    // Використовуємо реальну зміну (не абсолютну), щоб найбільший приріст був зверху
    const bestMatches = [
        ...playerMatches
    ].sort((a, b)=>{
        const aChange = a.player1Id === virtualPlayer.id ? a.player1RatingChange : a.player2RatingChange;
        const bChange = b.player1Id === virtualPlayer.id ? b.player1RatingChange : b.player2RatingChange;
        return bChange - aChange;
    });
    // Find player's rank
    const sortedPlayers = [
        ...state.players
    ].sort((a_0, b_0)=>b_0.rating - a_0.rating);
    const playerRank = sortedPlayers.findIndex((p_0)=>p_0.id === virtualPlayer.id) + 1;
    // Отримуємо звання для максимального рейтингу
    const highestRatingBand = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rating$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRatingBand"])(stats.highestRating);
    // Перевіряємо, чи змінилось звання порівняно з поточним
    const hasRankChanged = highestRatingBand.name !== ratingBand.name;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-gray-100",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "bg-white shadow-md",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between py-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center space-x-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/",
                                        className: "text-gray-600 hover:text-gray-900 transition-colors",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                            className: "h-6 w-6",
                                            fill: "none",
                                            viewBox: "0 0 24 24",
                                            stroke: "currentColor",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                strokeLinecap: "round",
                                                strokeLinejoin: "round",
                                                strokeWidth: 2,
                                                d: "M15 19l-7-7 7-7"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/player/[id]/page.tsx",
                                                lineNumber: 145,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/player/[id]/page.tsx",
                                            lineNumber: 144,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/player/[id]/page.tsx",
                                        lineNumber: 143,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        className: "text-2xl font-bold text-gray-900",
                                        children: "Профіль гравця"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/player/[id]/page.tsx",
                                        lineNumber: 148,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/player/[id]/page.tsx",
                                lineNumber: 142,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/",
                                className: "bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors",
                                children: "До рейтингу"
                            }, void 0, false, {
                                fileName: "[project]/src/app/player/[id]/page.tsx",
                                lineNumber: 153,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/player/[id]/page.tsx",
                        lineNumber: 141,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/player/[id]/page.tsx",
                    lineNumber: 140,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/player/[id]/page.tsx",
                lineNumber: 139,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-white rounded-lg shadow-md p-6 mb-8",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between mb-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center space-x-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full text-xl font-bold text-gray-600",
                                                children: [
                                                    "#",
                                                    playerRank
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/player/[id]/page.tsx",
                                                lineNumber: 166,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-3",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                                className: `text-3xl font-bold ${ratingBand.textColor}`,
                                                                children: virtualPlayer.name
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/player/[id]/page.tsx",
                                                                lineNumber: 171,
                                                                columnNumber: 19
                                                            }, this),
                                                            virtualPlayer.isCMS && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-amber-600 text-sm font-extrabold italic tracking-wide px-2 py-1 bg-amber-50 rounded border border-amber-300",
                                                                title: "Кандидат у Майстри Спорту України",
                                                                style: {
                                                                    transform: 'skewX(-3deg)'
                                                                },
                                                                children: "КМСУ"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/player/[id]/page.tsx",
                                                                lineNumber: 172,
                                                                columnNumber: 43
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/player/[id]/page.tsx",
                                                        lineNumber: 170,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-lg text-gray-600 space-y-1",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                children: ratingBand.name
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/player/[id]/page.tsx",
                                                                lineNumber: 179,
                                                                columnNumber: 19
                                                            }, this),
                                                            (virtualPlayer.city || virtualPlayer.yearOfBirth) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-sm",
                                                                children: [
                                                                    virtualPlayer.city,
                                                                    virtualPlayer.yearOfBirth && `${virtualPlayer.yearOfBirth} р.н.`
                                                                ].filter(Boolean).join(' • ')
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/player/[id]/page.tsx",
                                                                lineNumber: 180,
                                                                columnNumber: 73
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/player/[id]/page.tsx",
                                                        lineNumber: 178,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/player/[id]/page.tsx",
                                                lineNumber: 169,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/player/[id]/page.tsx",
                                        lineNumber: 165,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-right",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: `text-4xl font-bold ${ratingBand.textColor}`,
                                                children: virtualPlayer.rating
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/player/[id]/page.tsx",
                                                lineNumber: 188,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center justify-end space-x-2 mt-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: `w-4 h-4 rounded-full ${ratingBand.color}`
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/player/[id]/page.tsx",
                                                        lineNumber: 192,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: `text-sm font-medium ${ratingBand.textColor}`,
                                                        children: ratingBand.name
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/player/[id]/page.tsx",
                                                        lineNumber: 193,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/player/[id]/page.tsx",
                                                lineNumber: 191,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/player/[id]/page.tsx",
                                        lineNumber: 187,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/player/[id]/page.tsx",
                                lineNumber: 164,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-center p-4 bg-gray-50 rounded-lg",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-2xl font-bold text-blue-600",
                                                children: stats.totalMatches
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/player/[id]/page.tsx",
                                                lineNumber: 203,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-sm text-gray-600",
                                                children: "Матчів"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/player/[id]/page.tsx",
                                                lineNumber: 204,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/player/[id]/page.tsx",
                                        lineNumber: 202,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-center p-4 bg-gray-50 rounded-lg",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-2xl font-bold text-green-600",
                                                children: stats.wins
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/player/[id]/page.tsx",
                                                lineNumber: 207,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-sm text-gray-600",
                                                children: "Перемог"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/player/[id]/page.tsx",
                                                lineNumber: 208,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/player/[id]/page.tsx",
                                        lineNumber: 206,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-center p-4 bg-gray-50 rounded-lg",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-2xl font-bold text-red-600",
                                                children: stats.losses
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/player/[id]/page.tsx",
                                                lineNumber: 211,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-sm text-gray-600",
                                                children: "Поразок"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/player/[id]/page.tsx",
                                                lineNumber: 212,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/player/[id]/page.tsx",
                                        lineNumber: 210,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-center p-4 bg-gray-50 rounded-lg",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-2xl font-bold text-purple-600",
                                                children: [
                                                    stats.winRate,
                                                    "%"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/player/[id]/page.tsx",
                                                lineNumber: 215,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-sm text-gray-600",
                                                children: "% Перемог"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/player/[id]/page.tsx",
                                                lineNumber: 216,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/player/[id]/page.tsx",
                                        lineNumber: 214,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-center p-4 bg-gray-50 rounded-lg",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: `text-2xl font-bold ${highestRatingBand.textColor}`,
                                                children: stats.highestRating
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/player/[id]/page.tsx",
                                                lineNumber: 219,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-sm text-gray-600",
                                                children: "Макс рейтинг"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/player/[id]/page.tsx",
                                                lineNumber: 222,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: `text-xs font-medium mt-1 ${highestRatingBand.textColor}`,
                                                children: highestRatingBand.name
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/player/[id]/page.tsx",
                                                lineNumber: 223,
                                                columnNumber: 15
                                            }, this),
                                            player && hasRankChanged && stats.highestRating > player.rating && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-xs text-amber-600 font-semibold mt-1",
                                                children: "Найкраще звання"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/player/[id]/page.tsx",
                                                lineNumber: 226,
                                                columnNumber: 83
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/player/[id]/page.tsx",
                                        lineNumber: 218,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-center p-4 bg-gray-50 rounded-lg",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: `text-2xl font-bold ${stats.ratingChange >= 0 ? 'text-green-600' : 'text-red-600'}`,
                                                children: [
                                                    stats.ratingChange >= 0 ? '+' : '',
                                                    stats.ratingChange
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/player/[id]/page.tsx",
                                                lineNumber: 231,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-sm text-gray-600",
                                                children: "Зміна рейтингу"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/player/[id]/page.tsx",
                                                lineNumber: 234,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/player/[id]/page.tsx",
                                        lineNumber: 230,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/player/[id]/page.tsx",
                                lineNumber: 201,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/player/[id]/page.tsx",
                        lineNumber: 163,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-8",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$RatingChart$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            player: virtualPlayer,
                            matches: state.matches,
                            players: state.players
                        }, void 0, false, {
                            fileName: "[project]/src/app/player/[id]/page.tsx",
                            lineNumber: 241,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/player/[id]/page.tsx",
                        lineNumber: 240,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-white rounded-lg shadow-md p-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex space-x-4 mb-6 border-b border-gray-200",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setActiveTab('history'),
                                        className: `px-4 py-2 font-semibold transition-colors border-b-2 ${activeTab === 'history' ? 'text-blue-600 border-blue-600' : 'text-gray-500 border-transparent hover:text-gray-700'}`,
                                        children: [
                                            "Історія матчів (",
                                            playerMatches.length,
                                            ")"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/player/[id]/page.tsx",
                                        lineNumber: 248,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setActiveTab('best'),
                                        className: `px-4 py-2 font-semibold transition-colors border-b-2 ${activeTab === 'best' ? 'text-blue-600 border-blue-600' : 'text-gray-500 border-transparent hover:text-gray-700'}`,
                                        children: "Найкращі матчі"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/player/[id]/page.tsx",
                                        lineNumber: 251,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/player/[id]/page.tsx",
                                lineNumber: 247,
                                columnNumber: 11
                            }, this),
                            playerMatches.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$MatchHistory$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                matches: activeTab === 'history' ? playerMatches : bestMatches,
                                players: state.players,
                                playerId: virtualPlayer.id
                            }, void 0, false, {
                                fileName: "[project]/src/app/player/[id]/page.tsx",
                                lineNumber: 256,
                                columnNumber: 39
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-center py-12",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-gray-400 mb-4",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                            className: "mx-auto h-12 w-12",
                                            fill: "none",
                                            viewBox: "0 0 24 24",
                                            stroke: "currentColor",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                strokeLinecap: "round",
                                                strokeLinejoin: "round",
                                                strokeWidth: 2,
                                                d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/player/[id]/page.tsx",
                                                lineNumber: 259,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/player/[id]/page.tsx",
                                            lineNumber: 258,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/player/[id]/page.tsx",
                                        lineNumber: 257,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-lg font-medium text-gray-900 mb-2",
                                        children: "Матчів поки немає"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/player/[id]/page.tsx",
                                        lineNumber: 262,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-gray-600",
                                        children: "Цей гравець ще не грав жодного матчу"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/player/[id]/page.tsx",
                                        lineNumber: 263,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/player/[id]/page.tsx",
                                lineNumber: 256,
                                columnNumber: 174
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/player/[id]/page.tsx",
                        lineNumber: 245,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/player/[id]/page.tsx",
                lineNumber: 161,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/player/[id]/page.tsx",
        lineNumber: 137,
        columnNumber: 10
    }, this);
}
_s(PlayerProfile, "Q+eTd11rbnIjsOVFPMRT0Hes3AU=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AppContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useApp"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useParams"]
    ];
});
_c = PlayerProfile;
var _c;
__turbopack_context__.k.register(_c, "PlayerProfile");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_dafbc2a8._.js.map
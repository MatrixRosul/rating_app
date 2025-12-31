module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/src/types/index.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
}),
"[project]/src/utils/rating.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/types/index.ts [app-ssr] (ecmascript)");
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
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RATING_BANDS"].find((band)=>rating >= band.minRating && rating <= band.maxRating) || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RATING_BANDS"][0];
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
}),
"[project]/src/context/AppContext.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AppProvider",
    ()=>AppProvider,
    "useApp",
    ()=>useApp
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rating$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/rating.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
const initialState = {
    players: [],
    matches: [],
    loading: true,
    error: null,
    isClient: false
};
function appReducer(state, action) {
    switch(action.type){
        case 'SET_LOADING':
            return {
                ...state,
                loading: action.payload
            };
        case 'SET_ERROR':
            return {
                ...state,
                error: action.payload
            };
        case 'SET_CLIENT':
            return {
                ...state,
                isClient: action.payload
            };
        case 'SET_PLAYERS':
            return {
                ...state,
                players: action.payload
            };
        case 'SET_MATCHES':
            return {
                ...state,
                matches: action.payload
            };
        case 'ADD_MATCH':
            return {
                ...state,
                matches: [
                    ...state.matches,
                    action.payload
                ]
            };
        case 'UPDATE_PLAYER_RATINGS':
            return {
                ...state,
                players: state.players.map((player)=>{
                    if (player.id === action.payload.player1Id) {
                        return {
                            ...player,
                            rating: action.payload.newRating1,
                            matches: [
                                ...player.matches,
                                action.payload.matchId
                            ],
                            updatedAt: new Date()
                        };
                    }
                    if (player.id === action.payload.player2Id) {
                        return {
                            ...player,
                            rating: action.payload.newRating2,
                            matches: [
                                ...player.matches,
                                action.payload.matchId
                            ],
                            updatedAt: new Date()
                        };
                    }
                    return player;
                })
            };
        case 'INITIALIZE_DATA':
            return {
                ...state,
                players: action.payload.players,
                matches: action.payload.matches,
                loading: false
            };
        default:
            return state;
    }
}
const AppContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function AppProvider({ children }) {
    const [state, dispatch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useReducer"])(appReducer, initialState);
    // Set client-side flag
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        dispatch({
            type: 'SET_CLIENT',
            payload: true
        });
    }, []);
    // Load data from localStorage on mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!state.isClient) return; // Only run on client-side
        const loadData = ()=>{
            try {
                // Версія рейтингової системи (змінюйте при зміні початкового рейтингу)
                const RATING_SYSTEM_VERSION = 'v3.1.1-cms';
                const savedVersion = localStorage.getItem('billiard-rating-version');
                // Якщо версія змінилась - очищаємо старі дані
                if (savedVersion !== RATING_SYSTEM_VERSION) {
                    console.log(`🔄 Rating system updated from ${savedVersion || 'old'} to ${RATING_SYSTEM_VERSION}. Clearing old data...`);
                    localStorage.removeItem('billiard-players');
                    localStorage.removeItem('billiard-matches');
                    localStorage.setItem('billiard-rating-version', RATING_SYSTEM_VERSION);
                    // Generate initial data with new version
                    const initialPlayers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rating$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateInitialPlayers"])(100, 1000);
                    dispatch({
                        type: 'INITIALIZE_DATA',
                        payload: {
                            players: initialPlayers,
                            matches: []
                        }
                    });
                    return;
                }
                const savedPlayers = localStorage.getItem('billiard-players');
                const savedMatches = localStorage.getItem('billiard-matches');
                if (savedPlayers && savedMatches) {
                    const players = JSON.parse(savedPlayers).map((p)=>({
                            ...p,
                            createdAt: new Date(p.createdAt),
                            updatedAt: new Date(p.updatedAt)
                        }));
                    const matches = JSON.parse(savedMatches).map((m)=>({
                            ...m,
                            date: new Date(m.date),
                            // Додаємо поля рахунку для сумісності з старими матчами
                            player1Score: m.player1Score || (m.winnerId === m.player1Id ? 1 : 0),
                            player2Score: m.player2Score || (m.winnerId === m.player2Id ? 1 : 0),
                            maxScore: m.maxScore || 1
                        }));
                    dispatch({
                        type: 'INITIALIZE_DATA',
                        payload: {
                            players,
                            matches
                        }
                    });
                } else {
                    // Generate initial data if none exists
                    localStorage.setItem('billiard-rating-version', RATING_SYSTEM_VERSION);
                    const initialPlayers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rating$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateInitialPlayers"])(100, 1000);
                    dispatch({
                        type: 'INITIALIZE_DATA',
                        payload: {
                            players: initialPlayers,
                            matches: []
                        }
                    });
                }
            } catch (error) {
                console.error('Error loading data:', error);
                dispatch({
                    type: 'SET_ERROR',
                    payload: 'Failed to load data'
                });
                // Generate initial data on error
                const initialPlayers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rating$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateInitialPlayers"])(100, 1000);
                dispatch({
                    type: 'INITIALIZE_DATA',
                    payload: {
                        players: initialPlayers,
                        matches: []
                    }
                });
            }
        };
        loadData();
    }, [
        state.isClient
    ]);
    // Save data to localStorage whenever it changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!state.loading && state.players.length > 0 && state.isClient) {
            localStorage.setItem('billiard-players', JSON.stringify(state.players));
            localStorage.setItem('billiard-matches', JSON.stringify(state.matches));
            localStorage.setItem('billiard-rating-version', 'v3.1.1-cms');
        }
    }, [
        state.players,
        state.matches,
        state.loading,
        state.isClient
    ]);
    const addMatch = (player1Id, player2Id, winnerId, player1Score, player2Score, maxScore)=>{
        const player1 = state.players.find((p)=>p.id === player1Id);
        const player2 = state.players.find((p)=>p.id === player2Id);
        if (!player1 || !player2) {
            dispatch({
                type: 'SET_ERROR',
                payload: 'Players not found'
            });
            return;
        }
        const { player1Change, player2Change } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rating$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calculateRatingChange"])(player1.rating, player2.rating, player1Score, player2Score, maxScore);
        const newMatch = {
            id: `match-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            player1Id,
            player2Id,
            player1Name: player1.name,
            player2Name: player2.name,
            winnerId,
            player1Score,
            player2Score,
            maxScore,
            player1RatingBefore: player1.rating,
            player2RatingBefore: player2.rating,
            player1RatingAfter: player1.rating + player1Change,
            player2RatingAfter: player2.rating + player2Change,
            player1RatingChange: player1Change,
            player2RatingChange: player2Change,
            date: new Date()
        };
        dispatch({
            type: 'ADD_MATCH',
            payload: newMatch
        });
        dispatch({
            type: 'UPDATE_PLAYER_RATINGS',
            payload: {
                player1Id,
                player2Id,
                newRating1: newMatch.player1RatingAfter,
                newRating2: newMatch.player2RatingAfter,
                matchId: newMatch.id
            }
        });
    };
    const resetData = ()=>{
        const initialPlayers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rating$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateInitialPlayers"])(100, 1000);
        dispatch({
            type: 'SET_PLAYERS',
            payload: initialPlayers
        });
        dispatch({
            type: 'SET_MATCHES',
            payload: []
        });
        localStorage.removeItem('billiard-players');
        localStorage.removeItem('billiard-matches');
    };
    const loadRealPlayers = ()=>{
        const realPlayers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rating$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateRealPlayers"])();
        dispatch({
            type: 'SET_PLAYERS',
            payload: realPlayers
        });
        dispatch({
            type: 'SET_MATCHES',
            payload: []
        });
        localStorage.removeItem('billiard-players');
        localStorage.removeItem('billiard-matches');
    };
    const simulateRandomMatches = (count)=>{
        // Створюємо локальну копію гравців для послідовного оновлення рейтингів
        let currentPlayers = [
            ...state.players
        ];
        const newMatches = [];
        for(let i = 0; i < count; i++){
            // Pick two random players from current local state
            const player1Index = Math.floor(Math.random() * currentPlayers.length);
            let player2Index = Math.floor(Math.random() * currentPlayers.length);
            // Ensure different players
            while(player2Index === player1Index){
                player2Index = Math.floor(Math.random() * currentPlayers.length);
            }
            const player1 = currentPlayers[player1Index];
            const player2 = currentPlayers[player2Index];
            // Симулюємо результат матчу
            const ratingDiff = player1.rating - player2.rating;
            const player1WinProbability = 1 / (1 + Math.pow(10, -ratingDiff / 400));
            const maxScore = [
                5,
                7,
                10
            ][Math.floor(Math.random() * 3)];
            let player1Score, player2Score, winnerId;
            if (Math.random() < player1WinProbability) {
                // Player 1 wins
                player1Score = maxScore;
                player2Score = Math.max(0, Math.min(maxScore - 1, Math.floor(Math.random() * (maxScore - 1))));
                winnerId = player1.id;
            } else {
                // Player 2 wins
                player2Score = maxScore;
                player1Score = Math.max(0, Math.min(maxScore - 1, Math.floor(Math.random() * (maxScore - 1))));
                winnerId = player2.id;
            }
            // Розраховуємо зміни рейтингу на основі поточних рейтингів
            const { player1Change, player2Change } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rating$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calculateRatingChange"])(player1.rating, player2.rating, player1Score, player2Score, maxScore);
            // Створюємо матч
            const newMatch = {
                id: `match-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
                player1Id: player1.id,
                player2Id: player2.id,
                player1Name: player1.name,
                player2Name: player2.name,
                winnerId,
                player1Score,
                player2Score,
                maxScore,
                player1RatingBefore: player1.rating,
                player2RatingBefore: player2.rating,
                player1RatingAfter: player1.rating + player1Change,
                player2RatingAfter: player2.rating + player2Change,
                player1RatingChange: player1Change,
                player2RatingChange: player2Change,
                date: new Date(Date.now() + i)
            };
            // Оновлюємо локальні копії гравців з новими рейтингами та матчами
            currentPlayers[player1Index] = {
                ...player1,
                rating: newMatch.player1RatingAfter,
                matches: [
                    ...player1.matches,
                    newMatch.id
                ],
                updatedAt: new Date()
            };
            currentPlayers[player2Index] = {
                ...player2,
                rating: newMatch.player2RatingAfter,
                matches: [
                    ...player2.matches,
                    newMatch.id
                ],
                updatedAt: new Date()
            };
            newMatches.push(newMatch);
            // Логування для дебагу
            console.log(`Match ${i + 1}/${count}: ${player1.name} (${player1.rating}->${newMatch.player1RatingAfter}) vs ${player2.name} (${player2.rating}->${newMatch.player2RatingAfter})`);
            console.log(`Result: ${player1Score}:${player2Score}, Winner: ${winnerId === player1.id ? player1.name : player2.name}`);
        }
        // Оновлюємо стан одним батчем після завершення всіх симуляцій
        dispatch({
            type: 'SET_PLAYERS',
            payload: currentPlayers
        });
        dispatch({
            type: 'SET_MATCHES',
            payload: [
                ...state.matches,
                ...newMatches
            ]
        });
        console.log(`Симуляція завершена: ${count} матчів, рейтинги оновлено`);
    };
    const importCsvMatches = async (warmupRuns = 0)=>{
        try {
            const url = warmupRuns > 0 ? `/api/import-csv?warmupRuns=${warmupRuns}` : '/api/import-csv';
            const res = await fetch(url);
            if (!res.ok) throw new Error('CSV import failed');
            const data = await res.json();
            const players = data.players.map((p)=>({
                    ...p,
                    createdAt: new Date(p.createdAt),
                    updatedAt: new Date(p.updatedAt)
                }));
            const matches = data.matches.map((m)=>({
                    ...m,
                    date: new Date(m.date)
                }));
            dispatch({
                type: 'SET_PLAYERS',
                payload: players
            });
            dispatch({
                type: 'SET_MATCHES',
                payload: matches
            });
            console.log('CSV import summary:', data.summary);
            return data.summary;
        } catch (error) {
            console.error('CSV import failed', error);
            dispatch({
                type: 'SET_ERROR',
                payload: 'Не вдалося імпортувати CSV'
            });
            throw error;
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(AppContext.Provider, {
        value: {
            state,
            addMatch,
            resetData,
            loadRealPlayers,
            simulateRandomMatches,
            importCsvMatches
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/context/AppContext.tsx",
        lineNumber: 375,
        columnNumber: 5
    }, this);
}
function useApp() {
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
}
}),
"[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
else {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    else {
        if ("TURBOPACK compile-time truthy", 1) {
            if ("TURBOPACK compile-time truthy", 1) {
                module.exports = __turbopack_context__.r("[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)");
            } else //TURBOPACK unreachable
            ;
        } else //TURBOPACK unreachable
        ;
    }
} //# sourceMappingURL=module.compiled.js.map
}),
"[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].ReactJsxDevRuntime; //# sourceMappingURL=react-jsx-dev-runtime.js.map
}),
"[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].React; //# sourceMappingURL=react.js.map
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__64975a57._.js.map
"""
Rating calculation service - Rating System v3.1.1 (прогресивний баланс)
Порт з TypeScript frontend логіки - БЕЗ ЗМІН алгоритму
"""
from math import pow, log2

# ⚙️ КОНФІГУРАЦІЯ РЕЙТИНГОВОЇ СИСТЕМИ v3.1.1 (прогресивний баланс)
RATING_CONFIG = {
    # Зона боротьби за еліту
    "ELITE_ENTRY_MIN": 1650,
    "ELITE_ENTRY_MAX": 1850,
    "ELITE_K_FACTOR": 55,
    "ELITE_MAX_CHANGE": 55,
    
    # Поріг для елітної логіки
    "ELITE_THRESHOLD": 1700,
    
    # Underdog bonus threshold
    "UNDERDOG_DIFF": 250,
    "UNDERDOG_BONUS": 1.15,
    
    # Loss protection для новачків
    "LOSS_PROTECTION_MIN": 1300,
    "LOSS_PROTECTION_MAX": 1600,
    "LOSS_PROTECTION_MIN_VALUE": 0.6,
    "LOSS_PROTECTION_MAX_VALUE": 1.0,
    
    # 🔥 Мінімальний рейтинг - знижено до 950 (новачки можуть падати більше)
    "RATING_FLOOR": 950,
}


# 🔥 АСИМЕТРИЧНІ МНОЖНИКИ ДЛЯ СТАДІЙ: переможець ≠ програвший (v3.1 — збалансовано)
def get_match_weights(stage: str = None) -> dict:
    """Повертає множники для переможця та програвшого залежно від стадії турніру"""
    weights = {
        'group': {'winner': 1.0, 'loser': 1.0},
        'round16': {'winner': 1.1, 'loser': 1.0},
        'quarterfinal': {'winner': 1.3, 'loser': 1.15},  # v3.1: Було 1.4/1.2
        'semifinal': {'winner': 1.5, 'loser': 1.2},      # v3.1: Було 1.7/1.2
        'final': {'winner': 1.7, 'loser': 1.25}          # v3.1: Було 2.0/1.3
    }
    
    if not stage:
        return {'winner': 1.0, 'loser': 1.0}
    
    normalized = stage.lower().strip()
    return weights.get(normalized, {'winner': 1.0, 'loser': 1.0})


def calculate_k_factor(games_played: int, rating: int = 1300) -> int:
    """K-Factor based on number of games played and rating (pyramid principle)"""
    # Базові K-фактори для досвіду
    if games_played < 20:
        base_k = 55
    elif games_played < 60:
        base_k = 38
    else:
        base_k = 26
    
    # 🔥 ЗОНА БОРОТЬБИ ЗА ЕЛІТУ — найвищий K (v3.1 — знижено для стабільності)
    if RATING_CONFIG["ELITE_ENTRY_MIN"] <= rating <= RATING_CONFIG["ELITE_ENTRY_MAX"]:
        base_k = max(base_k, 50)  # v3.1: Було 55 (ELITE_K_FACTOR)
    elif rating >= 1850:
        # Верхівка: стабілізація після досягнення
        base_k = max(base_k, 38)  # v3.1: Було 42
    elif rating >= RATING_CONFIG["ELITE_THRESHOLD"]:
        # ПІКОВИЙ K для активного росту в топ-зону
        base_k = max(base_k, 52)  # v3.1: Було 60
    elif rating >= 1600:
        # Вхід в еліту — максимальна динаміка
        base_k = max(base_k, 55)  # v3.1: Було 58
    
    return base_k


def calculate_margin_multiplier(score_diff: int, rating: int = 1300) -> float:
    """Margin Multiplier — обмежений вплив різниці в рахунку"""
    # Логарифмічна шкала для м'якого зростання
    base = 1 + min(1.0, log2(1 + score_diff) * 0.55)
    
    # М'яке посилення для топових гравців (великі перемоги більше винагороджуються)
    if rating >= 1600 and score_diff >= 3:
        base *= 1.08  # +8% для топів при домінації
    
    return base


def calculate_loss_protection(rating: int) -> float:
    """ПЛАВНИЙ ЗАХИСТ ВІД ПАДІННЯ — новачки ростуть швидше, ніж падають (v3.1 — прогресивний)"""
    # ✅ v3.1.1: ПРОГРЕСИВНИЙ захист — чим нижче, тим менше захисту
    if rating < 1200:
        # При 950: ≈0.65, при 1200: ≈0.95
        factor = 0.65 + (rating - 950) / 250 * 0.30
        return max(0.65, min(0.95, factor))
    
    if rating < 1300:
        return 0.70
    
    if rating >= RATING_CONFIG["LOSS_PROTECTION_MAX"]:
        return 1.0  # Без захисту
    
    if rating <= RATING_CONFIG["LOSS_PROTECTION_MIN"]:
        return RATING_CONFIG["LOSS_PROTECTION_MIN_VALUE"]
    
    # Плавна інтерполяція між мін і макс
    ratio = (rating - RATING_CONFIG["LOSS_PROTECTION_MIN"]) / \
            (RATING_CONFIG["LOSS_PROTECTION_MAX"] - RATING_CONFIG["LOSS_PROTECTION_MIN"])
    
    return RATING_CONFIG["LOSS_PROTECTION_MIN_VALUE"] + \
           ratio * (RATING_CONFIG["LOSS_PROTECTION_MAX_VALUE"] - RATING_CONFIG["LOSS_PROTECTION_MIN_VALUE"])


def calculate_rating_change(
    player1_rating: int,
    player2_rating: int,
    player1_score: int,
    player2_score: int,
    max_score: int,
    player1_games: int = 30,
    player2_games: int = 30,
    stage: str = None
) -> dict:
    """
    Stable ELO-based rating calculation with pyramid principles (v3.1.1 - прогресивний баланс)
    
    Returns:
        {"player1_change": int, "player2_change": int}
    """
    
    # 1. EXPECTED SCORE (E) — стандартний Elo
    E1 = 1 / (1 + pow(10, (player2_rating - player1_rating) / 400))
    E2 = 1 - E1
    
    # 2. ACTUAL SCORE (S) — ЕЛІТНА ЛОГІКА для топів
    score_diff = player1_score - player2_score
    avg_rating = (player1_rating + player2_rating) / 2
    is_elite = avg_rating >= RATING_CONFIG["ELITE_THRESHOLD"]
    
    if is_elite:
        # 🔥 ДЛЯ ЕЛІТИ: перемога = 1, поразка = 0, рахунок впливає мінімально
        if player1_score > player2_score:
            # Переможець отримує майже 1.0, незалежно від рахунку
            S1 = 0.95 + min(0.05, (score_diff / max_score) * 0.05)
        else:
            # Програвший отримує майже 0.0
            S1 = 0.05 - min(0.05, (abs(score_diff) / max_score) * 0.05)
    else:
        # Стандартна логіка для середніх рейтингів
        S1 = 0.5 + (score_diff / max_score) * 0.5
    
    S2 = 1 - S1
    
    # 3. MARGIN MULTIPLIER (M) — м'який вплив різниці в рахунку
    M = calculate_margin_multiplier(abs(score_diff), max(player1_rating, player2_rating))
    
    # 4. K-FACTOR — залежить від кількості ігор та рейтингу
    K1 = calculate_k_factor(player1_games, player1_rating)
    K2 = calculate_k_factor(player2_games, player2_rating)
    
    # 5. БАЗОВА ЗМІНА — лінійна формула Elo
    delta1 = K1 * (S1 - E1) * M
    delta2 = K2 * (S2 - E2) * M
    
    # 6. ПЛАВНИЙ ЗАХИСТ ВІД ПАДІННЯ — новачки ростуть швидше, ніж падають (v3.1 — прогресивний)
    if delta1 < 0:
        delta1 *= calculate_loss_protection(player1_rating)
    if delta2 < 0:
        delta2 *= calculate_loss_protection(player2_rating)
    
    # 7. 🔥 АСИМЕТРИЧНИЙ TRANSFER POINTS — слабший програє сильному = більше віддає (v3.1 — ДО maxChange)
    if player1_rating < player2_rating and player1_score < player2_score:
        delta1 *= 1.15  # v3.1: Було 1.2 → тепер 1.15
    if player2_rating < player1_rating and player2_score < player1_score:
        delta2 *= 1.15  # v3.1: Було 1.2 → тепер 1.15
    
    # 8. ОБМЕЖЕННЯ МАКСИМУМУ — зона боротьби за еліту має найвищу динаміку (v3.1 — знижено)
    if RATING_CONFIG["ELITE_ENTRY_MIN"] <= avg_rating <= RATING_CONFIG["ELITE_ENTRY_MAX"]:
        # 🎯 ЗОНА БОРОТЬБИ ЗА ЕЛІТУ: максимальна динаміка
        max_change = RATING_CONFIG["ELITE_MAX_CHANGE"]
    elif avg_rating >= 1850:
        # ТОП-МАТЧІ: стабілізація на верху
        max_change = 55  # v3.1: Було 60
    elif avg_rating >= 1700:
        # ЕЛІТНИЙ ШАР: великі стрибки для закріплення
        max_change = 60  # v3.1: Було 70
    elif avg_rating >= 1500:
        # Середній рівень
        max_change = 50  # v3.1: Було 55
    else:
        # Новачки
        max_change = 40  # v3.1: Було 45
    
    delta1 = max(-max_change, min(max_change, delta1))
    delta2 = max(-max_change, min(max_change, delta2))
    
    # 9. UNDERDOG BONUS — апсет реально рухає рейтинг
    rating_diff = abs(player1_rating - player2_rating)
    
    if rating_diff > RATING_CONFIG["UNDERDOG_DIFF"]:
        # Слабший переміг сильного
        if player1_score > player2_score and player1_rating < player2_rating:
            delta1 *= RATING_CONFIG["UNDERDOG_BONUS"]
        elif player2_score > player1_score and player2_rating < player1_rating:
            delta2 *= RATING_CONFIG["UNDERDOG_BONUS"]
    
    # 🔥 ELITE INFLATION — еліта живиться з середнього шару (v3.1 — тільки справжня еліта)
    # v3.1: 1700+ vs <1400 (було 1650+ vs <1600)
    if player1_rating >= 1700 and player2_rating < 1400 and player1_score > player2_score:
        delta1 *= 1.10  # v3.1: Було ×1.15
    elif player2_rating >= 1700 and player1_rating < 1400 and player2_score > player1_score:
        delta2 *= 1.10  # v3.1: Було ×1.15
    
    # 🔥 ELITE SINK — топ перемагає лоу = створення поінтів (v3.1 — тільки ТОП vs ДНО)
    # v3.1: 1750+ vs <1100, +5 (було 1600+ vs <1300, +10)
    if player1_rating >= 1750 and player2_rating < 1100 and player1_score > player2_score:
        delta1 += 5  # v3.1: Було +10
    elif player2_rating >= 1750 and player1_rating < 1100 and player2_score > player1_score:
        delta2 += 5  # v3.1: Було +10
    
    # 10. 🔥 АСИМЕТРИЧНІ МНОЖНИКИ — фіналісти не караються так жорстко (v3.1 — збалансовано)
    match_weights = get_match_weights(stage)
    
    if player1_score > player2_score:
        # Player 1 wins
        delta1 *= match_weights['winner']
        delta2 *= match_weights['loser']
    else:
        # Player 2 wins
        delta1 *= match_weights['loser']
        delta2 *= match_weights['winner']
    
    # 🏆 ТУРНІРНА ІНФЛЯЦІЯ — переможець ЗАВЖДИ отримує бонус залежно від стадії (v3.1 — знижено)
    stage_inflation = {
        'group': 0,       # v3.1: Було +1 → тепер 0
        'round16': 1,     # v3.1: Було +2 → тепер +1
        'quarterfinal': 2, # v3.1: Було +4 → тепер +2
        'semifinal': 4,   # v3.1: Було +7 → тепер +4
        'final': 6        # v3.1: Було +10 → тепер +6
    }
    
    inflation_bonus = stage_inflation.get(stage.lower() if stage else '', 0)
    
    # Додаємо інфляцію переможцю (тільки для рейтингу >1000)
    if player1_score > player2_score:
        if player1_rating > 1000:
            delta1 += inflation_bonus  # v3.1.1: Новачки не отримують інфляцію
    else:
        if player2_rating > 1000:
            delta2 += inflation_bonus  # v3.1.1: Новачки не отримують інфляцію
    
    # 🌟 ELITE BONUS — гравець 1500+ перемагає будь-кого → масштабований бонус (v3.1.1)
    # v3.1.1: Знижено поріг 1700 → 1500 (більше гравців отримують бонус)
    if player1_rating >= 1500 and player1_score > player2_score:
        elite_bonus = max(2, min(8, abs(delta1) * 0.15))
        delta1 += elite_bonus
    
    if player2_rating >= 1500 and player2_score > player1_score:
        elite_bonus = max(2, min(8, abs(delta2) * 0.15))
        delta2 += elite_bonus
    
    # 11. ROUNDED CHANGES
    player1_change = round(delta1)
    player2_change = round(delta2)
    
    return {
        'player1_change': player1_change,
        'player2_change': player2_change
    }

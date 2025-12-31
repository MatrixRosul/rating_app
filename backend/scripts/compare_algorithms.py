"""
Порівняння алгоритмів фронту та беку
Тестуємо однакові матчі і перевіряємо чи результати співпадають
"""
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.rating import calculate_rating_change

def test_match(name, r1, r2, s1, s2, max_s, g1, g2, stage=None):
    """Тестує один матч"""
    result = calculate_rating_change(
        player1_rating=r1,
        player2_rating=r2,
        player1_score=s1,
        player2_score=s2,
        max_score=max_s,
        player1_games=g1,
        player2_games=g2,
        stage=stage
    )
    
    print(f"\n{name}:")
    print(f"  Ratings: {r1} vs {r2}")
    print(f"  Score: {s1}-{s2} (max {max_s})")
    print(f"  Games: {g1} vs {g2}")
    print(f"  Stage: {stage or 'None'}")
    print(f"  → Player 1 change: {result['player1_change']:+d}")
    print(f"  → Player 2 change: {result['player2_change']:+d}")
    print(f"  → Sum: {result['player1_change'] + result['player2_change']:+d}")
    
    return result

# Тести з різними сценаріями
print("=" * 60)
print("BACKEND RATING ALGORITHM TEST")
print("=" * 60)

# Test 1: КМС vs КМС (обидва стартують з 1600)
test_match(
    "TEST 1: КМС vs КМС (1600 vs 1600, перша гра)",
    r1=1600, r2=1600,
    s1=5, s2=3,
    max_s=5,
    g1=0, g2=0,
    stage=None
)

# Test 2: КМС vs не-КМС (1600 vs 1300, перша гра)
test_match(
    "TEST 2: КМС vs не-КМС (1600 vs 1300)",
    r1=1600, r2=1300,
    s1=5, s2=3,
    max_s=5,
    g1=0, g2=0,
    stage=None
)

# Test 3: Фінал турніру
test_match(
    "TEST 3: Фінал турніру (1700 vs 1650)",
    r1=1700, r2=1650,
    s1=5, s2=4,
    max_s=5,
    g1=50, g2=45,
    stage='final'
)

# Test 4: Underdog wins
test_match(
    "TEST 4: Аутсайдер перемагає (1200 vs 1500)",
    r1=1200, r2=1500,
    s1=5, s2=2,
    max_s=5,
    g1=30, g2=35,
    stage='quarterfinal'
)

# Test 5: Елітний матч
test_match(
    "TEST 5: Елітний матч (1900 vs 1850)",
    r1=1900, r2=1850,
    s1=5, s2=4,
    max_s=5,
    g1=100, g2=95,
    stage='semifinal'
)

print("\n" + "=" * 60)
print("COPIED THESE RESULTS - NOW TEST IN FRONTEND")
print("=" * 60)

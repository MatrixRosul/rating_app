"""
Test script to compare frontend (TypeScript) and backend (Python) rating calculations
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.rating import calculate_rating_change, RATING_CONFIG

# Test case 1: Simple match
print("=" * 60)
print("TEST 1: Simple match (1300 vs 1300, score 5-3)")
print("=" * 60)

result = calculate_rating_change(
    player1_rating=1300,
    player2_rating=1300,
    player1_score=5,
    player2_score=3,
    max_score=5,
    player1_games=10,
    player2_games=10,
    stage=None
)

print(f"Player 1 change: {result['player1_change']}")
print(f"Player 2 change: {result['player2_change']}")
print(f"Sum: {result['player1_change'] + result['player2_change']}")

# Test case 2: Elite match
print("\n" + "=" * 60)
print("TEST 2: Elite match (1700 vs 1700, score 5-4)")
print("=" * 60)

result = calculate_rating_change(
    player1_rating=1700,
    player2_rating=1700,
    player1_score=5,
    player2_score=4,
    max_score=5,
    player1_games=50,
    player2_games=50,
    stage=None
)

print(f"Player 1 change: {result['player1_change']}")
print(f"Player 2 change: {result['player2_change']}")
print(f"Sum: {result['player1_change'] + result['player2_change']}")

# Test case 3: Tournament final
print("\n" + "=" * 60)
print("TEST 3: Tournament final (1500 vs 1600, score 5-2)")
print("=" * 60)

result = calculate_rating_change(
    player1_rating=1500,
    player2_rating=1600,
    player1_score=5,
    player2_score=2,
    max_score=5,
    player1_games=30,
    player2_games=40,
    stage='final'
)

print(f"Player 1 change: {result['player1_change']}")
print(f"Player 2 change: {result['player2_change']}")
print(f"Sum: {result['player1_change'] + result['player2_change']}")

# Test case 4: Underdog wins
print("\n" + "=" * 60)
print("TEST 4: Underdog wins (1200 vs 1500, score 5-3)")
print("=" * 60)

result = calculate_rating_change(
    player1_rating=1200,
    player2_rating=1500,
    player1_score=5,
    player2_score=3,
    max_score=5,
    player1_games=15,
    player2_games=60,
    stage=None
)

print(f"Player 1 change: {result['player1_change']}")
print(f"Player 2 change: {result['player2_change']}")
print(f"Sum: {result['player1_change'] + result['player2_change']}")

print("\n" + "=" * 60)
print("RATING CONFIG:")
print("=" * 60)
for key, value in RATING_CONFIG.items():
    print(f"{key}: {value}")

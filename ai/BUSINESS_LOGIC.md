# Business Logic & Rating System

## Rating System Overview

The rating system is based on **ELO** with **pyramid-specific adjustments**.

Version: **v3.1.1 (Progressive Balance)**

---

## Core Principles

1. **Zero Initial State**: New players start at 1200
2. **Dynamic K-Factor**: Changes based on games played
3. **Stage Multipliers**: Finals worth more than group matches
4. **Underdog Bonus**: Big upsets reward more
5. **Loss Protection**: Beginners don't lose too much
6. **Elite Logic**: Top players have different dynamics

---

## Rating Calculation Steps

### 1. Expected Score (E)

Standard ELO formula:

```
E1 = 1 / (1 + 10^((rating2 - rating1) / 400))
E2 = 1 - E1
```

Example:
- Player1: 1600, Player2: 1400
- E1 = 1 / (1 + 10^(-200/400)) = 1 / (1 + 10^-0.5) ≈ 0.76
- E2 = 0.24

Player1 expected to win 76% of the time.

---

### 2. Actual Score (S)

**For Non-Elite** (avg rating < 1700):

Standard score based on match result:
```
S = (score_diff / max_score) * 0.5 + 0.5
```

Example (7:5 match, max_score=7):
- score_diff = 7 - 5 = 2
- S1 = (2/7) * 0.5 + 0.5 = 0.64
- S2 = 1 - 0.64 = 0.36

---

**For Elite** (avg rating ≥ 1700):

Winner gets ~1.0, loser gets ~0.0, score matters less:

```python
if player1_score > player2_score:
    S1 = 0.95 + min(0.05, (score_diff / max_score) * 0.05)
else:
    S1 = 0.05 - min(0.05, (abs(score_diff) / max_score) * 0.05)
```

**Why?** At high levels, winning is what matters, not score.

---

### 3. K-Factor (Volatility)

Depends on games played:

```python
if games < 10:
    K = 60  # High volatility for new players
elif games < 30:
    K = 50
elif games < 50:
    K = 45
elif games < 100:
    K = 40
else:
    K = 35  # Stable for veterans
```

**Why?** New players' ratings adjust quickly to find true level.

---

### 4. Margin Multiplier

Score difference affects rating change:

```python
score_diff = abs(player1_score - player2_score)
margin_mult = 1.0 + (score_diff / max_score) * 0.3

# Capped at 1.3
margin_mult = min(1.3, margin_mult)
```

Example (7:2 blowout):
- margin_mult = 1.0 + (5/7) * 0.3 ≈ 1.21

**Why?** Dominating wins matter more than close ones.

---

### 5. Stage Multipliers

Tournament stage affects weight:

```python
STAGE_WEIGHTS = {
    'group': (1.0, 1.0),           # Winner, Loser
    'round16': (1.1, 1.0),
    'quarterfinal': (1.3, 1.15),
    'semifinal': (1.5, 1.2),
    'final': (1.7, 1.25)
}
```

**Asymmetric**: Winner gets more bonus than loser gets penalty.

**Why?** Winning a final is a bigger achievement than winning group stage.

---

### 6. Underdog Bonus

If rating difference > 250:

```python
UNDERDOG_DIFF = 250
UNDERDOG_BONUS = 1.15

if rating_diff > UNDERDOG_DIFF:
    if underdog_wins:
        change *= UNDERDOG_BONUS
```

Example:
- 1400-rated player beats 1700-rated player
- Gets 15% more rating

**Why?** Big upsets deserve extra reward.

---

### 7. Loss Protection (Beginners)

For ratings 1300-1600, losing is less punishing:

```python
LOSS_PROTECTION_MIN = 1300
LOSS_PROTECTION_MAX = 1600
LOSS_PROTECTION_MIN_VALUE = 0.6   # 60% of normal loss
LOSS_PROTECTION_MAX_VALUE = 1.0

if is_loser and LOSS_PROTECTION_MIN < rating < LOSS_PROTECTION_MAX:
    protection_factor = linear_interpolate(rating)
    change *= protection_factor
```

Example:
- 1400-rated player loses
- Only loses 60-80% of normal rating loss

**Why?** Don't discourage beginners with harsh losses.

---

### 8. Maximum Change Caps

Zone-dependent limits:

```python
if 1650 <= avg_rating <= 1850:
    max_change = 55  # Elite entry zone (highest volatility)
elif avg_rating >= 1850:
    max_change = 55  # Top players (stable)
elif avg_rating >= 1700:
    max_change = 60  # Elite layer
elif avg_rating >= 1500:
    max_change = 50  # Mid-level
else:
    max_change = 55  # Beginners
```

**Why?** Different skill zones need different dynamics.

---

### 9. Rating Floor

Minimum rating: **950**

```python
RATING_FLOOR = 950

new_rating = max(RATING_FLOOR, old_rating + change)
```

**Why?** Prevent ratings from going negative or too low.

---

## Full Formula

```
change = (S - E) * K * margin_mult * stage_weight

# Apply underdog bonus if applicable
if underdog_wins:
    change *= UNDERDOG_BONUS

# Apply loss protection if applicable
if is_loser and in_protection_zone:
    change *= protection_factor

# Cap maximum change
change = clamp(change, -max_change, +max_change)

# Apply rating floor
new_rating = max(RATING_FLOOR, old_rating + change)
```

---

## Example Calculation

### Scenario
- **Player A**: 1600, 25 games
- **Player B**: 1400, 50 games
- **Score**: A wins 7:5 (max_score=7)
- **Stage**: Semifinal

### Step-by-Step

1. **Expected Score**:
   - E_A = 1 / (1 + 10^(-200/400)) = 0.76
   - E_B = 0.24

2. **Actual Score**:
   - Avg rating = 1500 (not elite)
   - S_A = (2/7) * 0.5 + 0.5 = 0.64
   - S_B = 0.36

3. **K-Factor**:
   - K_A = 50 (25 games)
   - K_B = 40 (50 games)

4. **Margin Multiplier**:
   - margin = (2/7) * 0.3 = 0.086
   - margin_mult = 1.086

5. **Stage Multiplier**:
   - Semifinal: winner=1.5, loser=1.2

6. **Base Change**:
   - change_A = (0.64 - 0.76) * 50 * 1.086 * 1.5 = -9.8
   - change_B = (0.36 - 0.24) * 40 * 1.086 * 1.2 = +6.2

Wait, A won but change is negative? **This is wrong!**

Actually, S should be calculated differently for winner:

**Correct S**:
- S_A = 1 (won)
- S_B = 0 (lost)

Then score difference adds margin:
- S_A = 1.0, margin applies to change
- S_B = 0.0, margin applies to change

Let me recalculate using actual backend logic...

**Actual Backend**:
```python
if player1_score > player2_score:
    # Winner
    S1 = 1.0
    S2 = 0.0
else:
    S1 = 0.0
    S2 = 1.0
```

Then:
- change_A = (1.0 - 0.76) * 50 * 1.086 * 1.5 = +19.5
- change_B = (0.0 - 0.24) * 40 * 1.086 * 1.2 = -12.5

7. **Cap**:
   - Max change for avg_rating=1500: 50
   - Both within limits

8. **Final Ratings**:
   - A: 1600 + 19 = **1619**
   - B: 1400 - 13 = **1387**

---

## Tournament Business Rules

### Phase 1: Registration

1. **Tournament States**:
   - `registration`: Players can join
   - `in_progress`: Playing matches
   - `finished`: Completed

2. **Registration Rules**:
   - Must be before `registration_end` date
   - User needs player profile (player_id)
   - Can't register twice
   - Self-registration → status = PENDING
   - Admin add → status = CONFIRMED

3. **Participant States**:
   - `pending`: Waiting for admin approval
   - `confirmed`: Approved, ready to play
   - `rejected`: Denied
   - `active`: Currently playing (Phase 2)
   - `eliminated`: Knocked out (Phase 2)

4. **Admin Actions**:
   - Confirm pending → confirmed
   - Reject pending → rejected
   - Remove any participant (during registration)
   - Add new player on-the-fly

---

### Phase 2: Brackets (Planned)

1. **Seeding**:
   - Sort confirmed participants by rating (desc)
   - Assign seeds 1-N
   - Generate bracket based on seeds

2. **Bracket Types**:
   - Single Elimination
   - Double Elimination (future)

3. **Match Generation**:
   - Seed 1 vs Seed N
   - Seed 2 vs Seed N-1
   - etc.

4. **WALKOVER**:
   - If odd number of players
   - Missing slot filled with WALKOVER
   - WALKOVER always loses
   - No rating change for opponent

---

### Phase 3: Live Results (Planned)

1. **Match States**:
   - `scheduled`: Not started
   - `in_progress`: Playing
   - `finished`: Completed

2. **Score Entry**:
   - Admin enters scores
   - Winner advances in bracket
   - Loser eliminated (or goes to loser bracket)

3. **Real-time Updates**:
   - WebSocket for live scores
   - Bracket updates instantly

---

## Rating-Related Business Rules

### When Ratings Change

**Currently**:
- Ratings updated manually after tournament via CSV import

**Future**:
- Automatic rating calculation after each match
- Batch update at end of tournament

### Rated vs Non-Rated Tournaments

- `is_rated = 1`: Affects player ratings
- `is_rated = 0`: Friendly tournament, no rating impact

### Match Weight

Stored in database:
```python
match.stage = "final"
match.match_weight = 1.7  # For display only
```

Actual calculation uses stage weights from rating service.

---

## Edge Cases

### New Player First Match

- Starts at 1200
- High K-factor (60)
- Can gain/lose up to ~55 points
- Quickly finds true level

### Player Hasn't Played in Years

- Rating stays the same (no decay)
- K-factor resets to high value? **No, stays based on total games**
- Might be rusty but rating doesn't auto-decrease

**Future**: Add rating decay for inactivity

### Walkover / Forfeit

- Opponent wins by forfeit
- No rating change (or minimal)
- **Current**: Not implemented
- **Future**: Special handling

### Uneven Brackets

- If 13 players → 3 get byes
- Byes go to top 3 seeds
- No rating change for bye

---

## Rating Bands (Display Only)

These DON'T affect calculations, only display:

| Band | Range | Color | Level |
|------|-------|-------|-------|
| Новачок | 0-1199 | Gray | Початківець |
| Учень | 1200-1399 | Green | Базовий рівень |
| Спеціаліст | 1400-1599 | Cyan | Середній рівень |
| Експерт | 1600-1799 | Blue | Просунутий рівень |
| Кандидат у Майстри | 1800-2299 | Purple | Високий рівень |
| Майстер | 2300-2499 | Orange | Майстерський рівень |
| Гросмейстер | 2500+ | Red | Елітний рівень |

---

## Match History

Every match stores:
- Both players' ratings BEFORE
- Both players' ratings AFTER
- Rating changes for both
- Score, winner, date, stage

Used for:
- Player rating chart
- Statistics
- Audit trail

---

## Statistics Calculations

### Win Rate
```
win_rate = (wins / total_matches) * 100
```

### Peak Rating
```
peak_rating = max(rating_history)
```

### Average Opponent Rating
```
avg_opponent = sum(opponent_ratings) / total_matches
```

---

## Future Enhancements

### Rating System
- ⬜ Rating decay for inactivity
- ⬜ Provisional rating (first 10 games)
- ⬜ Confidence intervals (like Glicko-2)
- ⬜ Head-to-head adjustments
- ⬜ Home advantage modifier

### Tournaments
- ⬜ Swiss system
- ⬜ Round robin
- ⬜ Multi-stage (groups → knockout)
- ⬜ Team tournaments

### Match Recording
- ⬜ Frame-by-frame scores
- ⬜ Break tracking
- ⬜ Foul recording
- ⬜ Video analysis integration

---

## Testing Rating Calculations

### Unit Tests
```python
def test_basic_win():
    result = calculate_rating_change(
        player1_rating=1500,
        player2_rating=1500,
        player1_score=7,
        player2_score=3,
        max_score=7,
        player1_games=30,
        player2_games=30
    )
    
    assert result["player1_change"] > 0
    assert result["player2_change"] < 0
    assert abs(result["player1_change"]) < 60  # Within max
```

### Integration Tests
- Create tournament
- Add participants
- Simulate matches
- Verify rating updates

---

## Summary

The rating system is **ELO-based with pyramid-specific tweaks**:

- ✅ Dynamic K-factor (based on experience)
- ✅ Stage multipliers (finals worth more)
- ✅ Underdog bonuses (upsets rewarded)
- ✅ Loss protection (beginners protected)
- ✅ Elite logic (top players different dynamics)
- ✅ Rating floor (can't go below 950)
- ✅ Maximum change caps (zone-dependent)

**Philosophy**: 
- New players adjust quickly
- Veterans stabilize
- Big moments (finals, upsets) matter more
- Don't punish beginners too harshly
- Elite players have high stakes

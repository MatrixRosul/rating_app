import sys
import os
import csv
from datetime import datetime

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, engine, Base
from app.models import Player, Match
from app.services.rating import calculate_rating_change, RATING_CONFIG

# 🏆 Список КМС (Кандидатів у Майстри Спорту) - реальні звання
CMS_PLAYERS = [
    ("Василь", "Єгоров"),
    ("Степан", "Ковач"),
    ("Віталій", "Балко"),
    ("Софія", "Дудченко"),
    ("Марія", "Левківська"),
    ("Максим", "Король"),
    ("Микола", "Шикітка"),
    ("Володимир", "Коротя"),
    ("Артур", "Зелінко"),
    ("Євген", "Драгула"),
    ("Михайло", "Сличко"),
    ("Микола", "Гуденко"),
    ("Стефанія", "Церковник"),
    ("Іван", "Пелінкевич"),
    ("Юлій", "Гараксим"),
    ("Олександр", "Сайков"),
    ("Микола", "Леміш"),
]

def is_cms_player(full_name: str) -> bool:
    """Перевірка чи є гравець КМС"""
    parts = full_name.split()
    if len(parts) >= 2:
        first_name = parts[0]
        last_name = parts[1]
        return (first_name, last_name) in CMS_PLAYERS
    return False

def get_stage_order(stage: str) -> int:
    """Порядок стадій для сортування (важливо для однакових дат)"""
    order = {
        'group': 1,
        'round16': 2,
        'quarterfinal': 3,
        'semifinal': 4,
        'final': 5
    }
    
    if not stage:
        return 0
    
    normalized = stage.lower().strip()
    return order.get(normalized, 0)

def import_csv_data():
    """Import players and matches from CSV file"""
    
    # Create tables
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Read CSV file - it's in the project root, not in backend/
        csv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 
                               "data", "match_results.csv")
        
        print(f"Reading CSV from: {csv_path}")
        
        players_dict = {}  # name -> player object
        matches_data = []
        
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            
            for row in reader:
                player1_name = row["Ім'я Фамілія 1"].strip()
                player2_name = row["Ім'я Фамілія 2"].strip()
                score1 = int(row['Результат 1'])
                score2 = int(row['Результат 2'])
                
                # Parse date and stage
                date_str = row.get('Дата', '').strip()
                stage = row.get('Стадія', '').strip().lower()
                tournament = row.get('Турнір', '').strip()
                
                # Parse date (format: YYYY-MM-DD)
                try:
                    match_date = datetime.strptime(date_str, '%Y-%m-%d') if date_str else datetime.utcnow()
                except ValueError:
                    match_date = datetime.utcnow()
                
                # Determine winner
                winner_name = player1_name if score1 > score2 else player2_name
                
                # Add players to dict if not exists
                if player1_name not in players_dict:
                    players_dict[player1_name] = {
                        'name': player1_name,
                        'matches_played': 0,
                        'wins': 0,
                        'losses': 0
                    }
                
                if player2_name not in players_dict:
                    players_dict[player2_name] = {
                        'name': player2_name,
                        'matches_played': 0,
                        'wins': 0,
                        'losses': 0
                    }
                
                # Update stats
                players_dict[player1_name]['matches_played'] += 1
                players_dict[player2_name]['matches_played'] += 1
                
                if winner_name == player1_name:
                    players_dict[player1_name]['wins'] += 1
                    players_dict[player2_name]['losses'] += 1
                else:
                    players_dict[player2_name]['wins'] += 1
                    players_dict[player1_name]['losses'] += 1
                
                matches_data.append({
                    'player1': player1_name,
                    'player2': player2_name,
                    'winner': winner_name,
                    'score1': score1,
                    'score2': score2,
                    'date': match_date,
                    'stage': stage,
                    'tournament': tournament
                })
        
        # 🔥 СОРТУВАННЯ МАТЧІВ — як на фронтенді (дата → стадія)
        print(f"Sorting {len(matches_data)} matches by date and stage...")
        matches_data.sort(key=lambda m: (m['date'], get_stage_order(m.get('stage', ''))))
        
        # Insert players
        print(f"Inserting {len(players_dict)} players...")
        
        player_objects = {}
        for name, stats in players_dict.items():
            # 🔥 НЕ ВКАЗУЄМО ID - PostgreSQL сам згенерує через auto-increment
            
            # 🏆 КМС починають з 1600, інші з 1300
            starting_rating = 1600.0 if is_cms_player(name) else 1300.0
            
            player = Player(
                name=name,
                rating=starting_rating,
                initial_rating=starting_rating,
                peak_rating=starting_rating,
                is_cms=is_cms_player(name)
            )
            db.add(player)
            player_objects[name] = player
        
        db.commit()
        
        # Refresh to get IDs
        for player in player_objects.values():
            db.refresh(player)
        
        print(f"Players inserted successfully!")
        print(f"Total players: {len(players_dict)}")
        print(f"Total matches to import: {len(matches_data)}")
        
        # Calculate ratings match by match using ПРАВИЛЬНИЙ АЛГОРИТМ v3.1.1
        print("Processing matches and calculating ratings...")
        
        # 🔥 Початкові рейтинги: КМС - 1600, інші - 1300
        current_ratings = {name: (1600.0 if is_cms_player(name) else 1300.0) for name in players_dict.keys()}
        matches_count = {name: 0 for name in players_dict.keys()}  # Кількість зіграних матчів
        
        for idx, match_data in enumerate(matches_data):
            player1_name = match_data['player1']
            player2_name = match_data['player2']
            winner_name = match_data['winner']
            score1 = match_data['score1']
            score2 = match_data['score2']
            match_date = match_data['date']
            stage = match_data.get('stage', None)  # Стадія турніру
            tournament = match_data.get('tournament', None)  # Назва турніру
            
            player1 = player_objects[player1_name]
            player2 = player_objects[player2_name]
            winner = player_objects[winner_name]
            
            # Get current ratings
            rating1 = int(current_ratings[player1_name])
            rating2 = int(current_ratings[player2_name])
            
            # Визначаємо max_score (до чого грали)
            max_score = max(score1, score2)
            
            # 🔥 ВИКОРИСТОВУЄМО ПРАВИЛЬНИЙ АЛГОРИТМ з rating.py + STAGE
            rating_changes = calculate_rating_change(
                player1_rating=rating1,
                player2_rating=rating2,
                player1_score=score1,
                player2_score=score2,
                max_score=max_score,
                player1_games=matches_count[player1_name],
                player2_games=matches_count[player2_name],
                stage=stage  # 🔥 ПЕРЕДАЄМО СТАДІЮ
            )
            
            change1 = rating_changes['player1_change']
            change2 = rating_changes['player2_change']
            
            # New ratings з RATING_FLOOR
            new_rating1 = max(RATING_CONFIG["RATING_FLOOR"], rating1 + change1)
            new_rating2 = max(RATING_CONFIG["RATING_FLOOR"], rating2 + change2)
            
            # Оновлюємо кількість матчів
            matches_count[player1_name] += 1
            matches_count[player2_name] += 1
            
            # Create match record (БЕЗ ID - auto-increment)
            # tournament_id залишаємо NULL - це звичайні матчі, не турнірні
            match = Match(
                player1_id=player1.id,
                player2_id=player2.id,
                player1_name=player1_name,
                player2_name=player2_name,
                winner_id=winner.id,
                player1_score=score1,
                player2_score=score2,
                max_score=max_score,
                player1_rating_before=float(rating1),
                player2_rating_before=float(rating2),
                player1_rating_after=float(new_rating1),  # 🔥 РЕЙТИНГ ПІСЛЯ
                player2_rating_after=float(new_rating2),  # 🔥 РЕЙТИНГ ПІСЛЯ
                player1_rating_change=float(change1),
                player2_rating_change=float(change2),
                date=match_date,  # 🔥 РЕАЛЬНА ДАТА З CSV
                stage=stage,  # 🔥 СТАДІЯ ТУРНІРУ
                tournament_name=tournament  # 🔥 НАЗВА ТУРНІРУ (текст, не зв'язок)
            )
            db.add(match)
            
            # Update current ratings
            current_ratings[player1_name] = new_rating1
            current_ratings[player2_name] = new_rating2
            
            # Update peak rating
            if new_rating1 > player1.peak_rating:
                player1.peak_rating = new_rating1
            if new_rating2 > player2.peak_rating:
                player2.peak_rating = new_rating2
            
            # Commit every 100 matches
            if (idx + 1) % 100 == 0:
                db.commit()
                print(f"Processed {idx + 1}/{len(matches_data)} matches...")
        
        db.commit()
        
        # Update final ratings for all players
        print("Updating player ratings...")
        for name, final_rating in current_ratings.items():
            player = player_objects[name]
            player.rating = final_rating
        
        db.commit()
        
        print(f"\n✅ Import completed successfully!")
        print(f"   - Players: {len(players_dict)}")
        print(f"   - Matches: {len(matches_data)}")
        
        # Show top 5 players
        top_players = db.query(Player).order_by(Player.rating.desc()).limit(5).all()
        print("\n🏆 Top 5 Players:")
        for i, p in enumerate(top_players, 1):
            matches_played = len([m for m in matches_data if m['player1'] == p.name or m['player2'] == p.name])
            wins = len([m for m in matches_data if m['winner'] == p.name])
            print(f"   {i}. {p.name} - Rating: {p.rating:.0f} (Matches: {matches_played}, Wins: {wins})")
        
    except Exception as e:
        print(f"❌ Error during import: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    import_csv_data()

import json
import sys

# Convert JSON to SQL INSERT statements
with open('players_backup.json', 'r', encoding='utf-8') as f:
    players = json.load(f)

with open('players_import.sql', 'w', encoding='utf-8') as f:
    for p in players:
        name = p['name'].replace("'", "''")
        city = p.get('city') or ''
        if city:
            city = city.replace("'", "''")
            city_val = f"'{city}'"
        else:
            city_val = 'NULL'
        
        year = p.get('year_of_birth')
        year_val = str(year) if year else 'NULL'
        
        f.write(f"INSERT INTO players (id, name, rating, initial_rating, peak_rating, is_cms, city, year_of_birth, created_at, updated_at) VALUES ('{p['id']}', '{name}', {p['rating']}, {p['initial_rating']}, {p['peak_rating']}, {p['is_cms']}, {city_val}, {year_val}, '{p['created_at']}', '{p['updated_at']}');\n")

print(f"✅ Створено players_import.sql: {len(players)} гравців")

with open('matches_backup.json', 'r', encoding='utf-8') as f:
    matches = json.load(f)

with open('matches_import.sql', 'w', encoding='utf-8') as f:
    for m in matches:
        p1_name = m['player1_name'].replace("'", "''")
        p2_name = m['player2_name'].replace("'", "''")
        
        tournament = m.get('tournament') or ''
        if tournament:
            tournament = tournament.replace("'", "''")
            tourn_val = f"'{tournament}'"
        else:
            tourn_val = 'NULL'
        
        stage = m.get('stage') or ''
        stage_val = f"'{stage}'" if stage else 'NULL'
        
        m_id = str(m['id'])
        p1_id = m['player1_id']
        p2_id = m['player2_id']
        w_id = m['winner_id']
        f.write(f"INSERT INTO matches (id, player1_id, player2_id, player1_name, player2_name, player1_score, player2_score, max_score, player1_rating_before, player2_rating_before, player1_rating_after, player2_rating_after, player1_rating_change, player2_rating_change, winner_id, date, tournament, stage, created_at) VALUES ('{m_id}', '{p1_id}', '{p2_id}', '{p1_name}', '{p2_name}', {m.get('player1_score', 0)}, {m.get('player2_score', 0)}, {m.get('max_score', 0)}, {m.get('player1_rating_before', 1600)}, {m.get('player2_rating_before', 1600)}, {m.get('player1_rating_after', 1600)}, {m.get('player2_rating_after', 1600)}, {m.get('player1_rating_change', 0)}, {m.get('player2_rating_change', 0)}, '{w_id}', '{m['date']}', {tourn_val}, {stage_val}, '{m.get('created_at', m['date'])}');\n")

print(f"✅ Створено matches_import.sql: {len(matches)} матчів")

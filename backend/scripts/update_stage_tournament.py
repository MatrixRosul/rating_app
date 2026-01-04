"""
Update existing matches with tournament and stage information from CSV
"""
import csv
import os
from sqlalchemy import text
from app.database import SessionLocal, engine

def update_matches_from_csv():
    # Повний шлях до CSV файлу
    csv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'data', 'match_results.csv')
    
    print(f"📂 Читаємо CSV: {csv_path}")
    
    db = SessionLocal()
    updated = 0
    
    try:
        with open(csv_path, 'r', encoding='utf-8') as file:
            csv_reader = csv.DictReader(file)
            
            for row in csv_reader:
                player1_name = f"{row['Ім\'я Фамілія 1'].strip()}"
                player2_name = f"{row['Ім\'я Фамілія 2'].strip()}"
                date_str = row['Дата'].strip()
                stage = row.get('Стадія', '').strip().lower()
                tournament = row.get('Турнір', '').strip()
                
                # Оновлюємо матч по іменах гравців та даті
                result = db.execute(
                    text("""
                        UPDATE matches 
                        SET tournament = :tournament, stage = :stage
                        WHERE player1_name = :player1_name 
                        AND player2_name = :player2_name
                        AND DATE(date) = DATE(:date)
                    """),
                    {
                        "tournament": tournament or None,
                        "stage": stage or None,
                        "player1_name": player1_name,
                        "player2_name": player2_name,
                        "date": date_str
                    }
                )
                updated += result.rowcount
                
        db.commit()
        print(f"✅ Оновлено {updated} матчів з tournament і stage")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Помилка: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("🔧 Оновлення матчів з tournament і stage...")
    update_matches_from_csv()
    print("✅ Готово!")

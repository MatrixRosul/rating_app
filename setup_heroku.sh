#!/bin/bash
# Setup production database with admin user and players

echo "🚀 Setting up production database..."
echo ""

# Run from backend directory
cd backend

# Import players
echo "1️⃣ Importing players..."
python scripts/import_players_sql.py

echo ""

# Create admin user
echo "2️⃣ Creating admin user..."
python scripts/create_admin.py

echo ""
echo "✅ Setup complete!"
echo ""
echo "📊 Database ready with:"
echo "   - 151 players with ratings"
echo "   - Admin user for management"
echo ""
echo "📝 Login credentials:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""

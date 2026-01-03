#!/bin/bash
# Setup production database with admin user and verify data

echo "🚀 Setting up production database..."
echo ""

# Run from backend directory
cd backend

# Create admin user
echo "1️⃣ Creating admin user..."
python scripts/create_admin.py

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Login credentials:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""

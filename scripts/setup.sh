#!/bin/bash
set -e

echo "🚀 Philand Database Setup"
echo "========================="
echo ""

if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    echo "Please copy .env.example to .env and configure your database"
    exit 1
fi

source .env
DB_URL_CLEAN=$(echo $DB_URL | sed 's/"//g')

USER=$(echo $DB_URL_CLEAN | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
PASS=$(echo $DB_URL_CLEAN | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
HOST=$(echo $DB_URL_CLEAN | sed -n 's/.*@\([^:]*\):.*/\1/p')
PORT=$(echo $DB_URL_CLEAN | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB=$(echo $DB_URL_CLEAN | sed -n 's/.*\/\([^?]*\).*/\1/p')

echo "📊 Database: $DB"
echo "🌐 Host: $HOST:$PORT"
echo ""

echo "📝 Running schema migration..."
mysql -h "$HOST" -P "$PORT" -u "$USER" -p"$PASS" "$DB" < migrations/schema.sql

if [ $? -eq 0 ]; then
    echo "✅ Database setup complete!"
    echo ""
    echo "Next steps:"
    echo "  1. cargo build --release"
    echo "  2. ./target/release/philand"
    echo "  3. cd web && npm run dev"
else
    echo "❌ Setup failed!"
    exit 1
fi

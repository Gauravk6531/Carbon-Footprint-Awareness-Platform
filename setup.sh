#!/bin/bash

# EcoMind AI Setup Script
echo "🌱 EcoMind AI - Setup"
echo "===================="
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3.9 or later."
    exit 1
fi

# Check Node
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 16 or later."
    exit 1
fi

echo "✅ Python and Node found"
echo ""

# Backend setup
echo "Setting up backend..."
cd backend

# Create venv
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

echo "✅ Backend dependencies installed"
echo ""

# Ask for Gemini API key
echo "🔑 Gemini API Key Setup"
echo "Get a free key at: https://makersuite.google.com/app/apikey"
read -p "Enter your GEMINI_API_KEY (or press Enter to skip): " gemini_key

if [ ! -z "$gemini_key" ]; then
    echo "GEMINI_API_KEY=$gemini_key" > .env
    echo "✅ Gemini API key configured"
else
    cp .env.example .env
    echo "⚠️  Using .env.example (chat features will be limited)"
fi

cd ..
echo ""

# Frontend setup
echo "Setting up frontend..."
cd frontend
npm install
echo "✅ Frontend dependencies installed"
cd ..

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Backend: cd backend && python run.py"
echo "2. Frontend: cd frontend && npm run dev"
echo ""
echo "Then open: http://localhost:5173"

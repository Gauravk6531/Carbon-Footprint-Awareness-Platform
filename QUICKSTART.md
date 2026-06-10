#!/bin/bash
# Quick Start Guide for EcoMind AI

cat << "EOF"

╔══════════════════════════════════════════════════════════════╗
║           🌱 EcoMind AI - Carbon Footprint Coach            ║
║                   Quick Start Guide                         ║
╚══════════════════════════════════════════════════════════════╝

📋 PREREQUISITES
================
✓ Python 3.9 or later
✓ Node.js 16 or later  
✓ Gemini API Key (free from https://makersuite.google.com/app/apikey)

🚀 SETUP (5 minutes)
=====================

1️⃣  Backend Setup
   cd backend
   python -m venv venv
   source venv/bin/activate          # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   
2️⃣  Configure API Key
   export GEMINI_API_KEY="your-key-here"    # Windows: set GEMINI_API_KEY=your-key
   
3️⃣  Frontend Setup
   cd ../frontend
   npm install

🎯 RUNNING
===========

Terminal 1 - Backend:
   cd backend
   source venv/bin/activate          # Windows: venv\Scripts\activate
   python run.py
   
   ✅ Running on http://localhost:8000
   📚 Docs at http://localhost:8000/docs

Terminal 2 - Frontend:
   cd frontend
   npm run dev
   
   ✅ Running on http://localhost:5173
   🌐 Open http://localhost:5173

📚 USAGE
========

1. Chat Coach
   - Tell the AI about your lifestyle
   - Get your carbon footprint instantly
   - See personalized recommendations

2. Calculator
   - Fill detailed form if you prefer
   - Get comprehensive breakdown
   - View calculation transparency

3. What-If Scenarios
   - Switch to electric car → See savings
   - Use public transport → See impact
   - Compare multiple options

4. Dashboard
   - Track your progress
   - Earn badges
   - See streaks and goals

🧪 TESTING
===========

Run all tests:
   cd backend
   pytest tests/ -v

Expected:
   ✓ 9 carbon engine tests
   ✓ 5 API tests
   ✓ All validation tests

📊 PROJECT STRUCTURE
=====================

EcoMind AI/
├── backend/
│   ├── app/
│   │   ├── main.py          ← API endpoints
│   │   ├── carbon_engine.py  ← Calculations
│   │   ├── gemini_ai.py      ← AI integration
│   │   ├── database.py       ← Data models
│   │   └── ...
│   ├── tests/               ← Unit tests
│   ├── requirements.txt
│   └── run.py
│
├── frontend/
│   ├── src/
│   │   ├── components/      ← React components
│   │   ├── context/         ← App state
│   │   ├── services/        ← API client
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── README.md                ← Full documentation
├── ARCHITECTURE.md          ← Technical design
├── DEMO.md                  ← Demo walkthrough
└── SUBMISSION.md            ← Hackathon checklist

🔑 API ENDPOINTS
=================

POST /api/chat
   Input: { message, session_id, user_id }
   Output: Carbon extraction + recommendations

POST /api/calculate
   Input: { carbon_input }
   Output: Emissions + breakdown

POST /api/what-if
   Input: { baseline_data, scenario_changes }
   Output: Comparison + savings

GET /api/history/{session_id}
   Output: Chat conversation history

🎨 UI TOUR
===========

Chat Tab
   ✨ Natural language interface
   💭 Gemini-powered extraction
   📊 Instant calculations

Calculator Tab
   📋 Form-based input
   🎯 Multi-category support
   📈 Regional options

What-If Tab
   🔄 Scenario buttons
   📉 Real-time comparison
   💰 Savings calculation

Dashboard Tab
   📊 Progress metrics
   🏆 Badge system
   🔥 Streaks & goals

💡 TIPS
========

✅ Start with Chat for quick demo
✅ Try multiple scenarios to see impact
✅ Use Bangalore/Mumbai for India examples
✅ Check Dashboard for progress tracking
✅ Run tests to verify calculations

🛠️ TROUBLESHOOTING
===================

Port already in use?
   Backend: python run.py --port 8001
   Frontend: npm run dev -- --port 5174

Gemini API errors?
   1. Check key is set: echo $GEMINI_API_KEY
   2. Verify at makersuite.google.com
   3. Calculator works without it

Dependencies not installing?
   Backend: pip install --upgrade -r requirements.txt
   Frontend: npm install --force

❌ No data showing?
   1. Check both services are running
   2. Check browser console for errors
   3. Check backend logs for API issues

📱 TESTING ON MOBILE
=====================

Get your computer's IP:
   Mac/Linux: ifconfig | grep inet
   Windows: ipconfig | findstr IPv4

Then on phone:
   http://YOUR_IP:5173

🌐 DEPLOYMENT
==============

Frontend:
   npm run build
   Deploy dist/ folder to Vercel/Netlify

Backend:
   Deploy to Railway/Render/Vercel
   Set GEMINI_API_KEY in environment

Database:
   SQLite in ./carbon_db.sqlite
   Can migrate to PostgreSQL if needed

📞 SUPPORT
===========

Documentation: See README.md
Architecture: See ARCHITECTURE.md
Demo Guide: See DEMO.md
Checklist: See SUBMISSION.md

❓ Questions?
   1. Check README for FAQ
   2. Review ARCHITECTURE.md
   3. Look at DEMO.md for usage

🎉 YOU'RE READY!
================

Your EcoMind AI is now running!
Open http://localhost:5173 and start exploring.

Go save the planet! 🌱

EOF

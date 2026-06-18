# 🌱 EcoMind AI - Carbon Footprint Awareness Platform

> **AI-Powered Carbon Coach** — Understand your environmental impact and get personalized actions to reduce it.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Tech Stack](https://img.shields.io/badge/FastAPI-React-blue)](#tech-stack)
[![Platform: Web](https://img.shields.io/badge/Platform-Web-brightgreen)](#)

## 🎯 Problem & Solution

**Problem:** Most carbon calculators are static tools that provide a number but no context, motivation, or actionable guidance. People don't know:
- What actually causes their emissions
- What actions have the most impact
- How their choices compare to others
- How to stay motivated to change

**Solution:** EcoMind AI combines:
1. ✅ **AI-powered extraction** — Natural language understanding to extract lifestyle data
2. ✅ **Smart calculations** — Deterministic, transparent carbon math (no black boxes)
3. ✅ **What-if scenarios** — Compare different lifestyle choices side-by-side
4. ✅ **Actionable plans** — Personalized, ranked recommendations
5. ✅ **Motivation system** — Goals, streaks, badges, and progress tracking
6. ✅ **Social features** — Share pledges and compare baselines

---

## 🎨 Key Features

### 1. **AI Carbon Coach** 🤖
- **Natural language input**: "I drive 18 km daily, use AC 8 hours, and fly twice a year"
- **Smart extraction**: Gemini parses unstructured input into structured data
- **Clarifying questions**: Asks only for missing critical information
- **Friendly summaries**: Explains footprint in plain language

### 2. **Carbon Footprint Calculator** 📊
- **Multi-category support**:
  - 🚗 Transportation (car, flights, public transit)
  - ⚡ Energy (electricity, AC, LPG/cooking)
  - 👥 Household factors
- **Region-aware**: Grid mix adjusts for India, US, EU, UK, Canada, Australia
- **Transparent assumptions**: Shows formula, factors, and confidence level
- **Major contributors**: Highlights top 3 emission sources

### 3. **What-If Simulator** 🎯
Compare scenarios like:
- Reduce car usage by 50%
- Switch to electric vehicle
- Use public transport instead
- No flights this year
- Renewable energy
- Better AC management

Shows:
- CO₂ reduction %
- Annual money saved
- Before/after comparison chart

### 4. **Habit & Goal System** 🎯
- **Weekly goals** and progress tracking
- **Streaks** for consistent action
- **Badge system**:
  - 🟢 Beginner
  - 🟡 Green Citizen
  - 🟠 Eco Warrior
  - 🔴 Climate Hero

### 5. **Action Plan Generator** 💡
For every calculation, generate:
- **3 highest impact actions** (biggest CO₂ reduction)
- **3 easiest actions** (low effort, quick wins)
- **Start today action** (immediate)
- **Next 30 days action** (medium-term)

Each includes:
- Estimated CO₂ reduction (kg)
- Cost/savings
- Effort level (easy/medium/hard)
- Motivation (why it matters)

### 6. **Transparency & Trust** 🔍
For every number shown:
- ✅ Emission factor source
- ✅ Calculation formula
- ✅ Assumptions used
- ✅ Confidence rating
- ✅ Regional context

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│          Frontend (React + Vite)                │
│  - Chat interface                              │
│  - Calculator form                             │
│  - What-if scenarios                           │
│  - Dashboard                                   │
│  - Responsive design                           │
└────────────────────┬────────────────────────────┘
                     │ HTTP/REST
┌────────────────────▼────────────────────────────┐
│       Backend (FastAPI + Python)                │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  API Endpoints                          │   │
│  │  - /api/chat          (Gemini powered)  │   │
│  │  - /api/calculate     (Carbon engine)   │   │
│  │  - /api/what-if       (Scenario sim)    │   │
│  │  - /api/pledge        (Social)          │   │
│  │  - /api/history       (Tracking)        │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌──────────────┐  ┌──────────────┐            │
│  │ Carbon Engine│  │ Gemini AI    │            │
│  │ Deterministic│  │ Extraction   │            │
│  │ Calculations │  │ & Summaries  │            │
│  └──────────────┘  └──────────────┘            │
│                                                 │
│  ┌──────────────┐  ┌──────────────┐            │
│  │  Database    │  │ Validation   │            │
│  │  SQLite      │  │ & Security   │            │
│  │  (SQLAlchemy)│  │              │            │
│  └──────────────┘  └──────────────┘            │
└─────────────────────────────────────────────────┘
```

### Data Flow
1. **User Input** → Natural language or form
2. **Extraction** → Gemini API parses text
3. **Calculation** → Carbon engine processes data
4. **Storage** → SQLite persists results
5. **Output** → Chat response + visualization
6. **Recommendation** → Personalized actions

---

## 🔧 Tech Stack

| Layer | Technology | Why? |
|-------|-----------|------|
| **Frontend** | React 18 + Vite | Fast, modern, responsive |
| **Styling** | Tailwind CSS | Clean, utility-first design |
| **Backend** | FastAPI | Fast, async, automatic docs |
| **AI** | Google Gemini Flash | Accurate, affordable, fast |
| **Database** | SQLite | Lightweight, zero-config |
| **ORM** | SQLAlchemy | Clean, Pythonic queries |
| **Testing** | Pytest | Comprehensive coverage |

### Key Design Decisions

✅ **No ML models** — Reduces complexity and size  
✅ **Deterministic calculations** — Transparent, reproducible  
✅ **Gemini for language only** — Not for emissions math  
✅ **SQLite locally** — No external DB required  
✅ **REST API** — Simple, scalable architecture  
✅ **Tailwind CSS** — No large CSS framework  
✅ **SVG icons** — No image assets  

---

## 📦 Project Structure

```
EcoMind-AI/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatInterface.jsx
│   │   │   ├── Calculator.jsx
│   │   │   ├── WhatIfSimulator.jsx
│   │   │   └── EmissionCard.jsx
│   │   ├── context/
│   │   │   └── AppContext.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── index.html
│
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app & endpoints
│   │   ├── carbon_engine.py      # Calculation logic
│   │   ├── gemini_ai.py          # Gemini integration
│   │   ├── models.py             # Pydantic models
│   │   ├── database.py           # SQLAlchemy setup
│   │   └── config.py             # Configuration
│   ├── tests/
│   │   ├── test_carbon_engine.py
│   │   └── test_api.py
│   ├── run.py
│   ├── requirements.txt
│   └── .env.example
│
├── .gitignore
├── README.md
└── LICENSE
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 16+
- Gemini API Key (free from [Google AI Studio](https://makersuite.google.com/app/apikey))

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variable
export GEMINI_API_KEY="your-key-here"  # On Windows: set GEMINI_API_KEY=your-key-here

# Run tests
pytest tests/

# Start server
python run.py
```

Backend runs on `http://localhost:8000`  
📚 API docs: `http://localhost:8000/docs`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs on `http://localhost:5173`

### 3. Usage

1. Open `http://localhost:5173` in browser
2. Start with **Chat Coach** for guidance
3. Use **Calculator** for detailed input
4. Try **What-If** scenarios
5. View **Dashboard** for progress

---

## 📊 Emission Factors & Assumptions

### Transportation
- 🚗 Petrol car: 0.192 kg CO₂e/km
- 🚗 Diesel car: 0.171 kg CO₂e/km
- 🔋 EV: 0.050 kg CO₂e/km
- ✈️ Domestic flight: 0.255 kg CO₂e/km
- ✈️ International flight: 0.195 kg CO₂e/km

### Electricity (Region-based)
- 🇮🇳 India: 0.659 kg CO₂e/kWh (coal-heavy)
- 🇺🇸 USA: 0.378 kg CO₂e/kWh
- 🇪🇺 EU: 0.278 kg CO₂e/kWh
- 🇬🇧 UK: 0.233 kg CO₂e/kWh

### Household
- AC: 0.415 kg CO₂e/kWh (grid dependent)
- LPG/Cooking: 2.04 kg CO₂e/kg

### Key Assumptions
✓ Car usage is averaged (not peak/offpeak)  
✓ Flights assume 1000 km (domestic), 8000 km (international)  
✓ AC = 1 kW constant power  
✓ Household energy is shared equally  
✓ No diet or waste included (MVP version)  

**Note:** All factors based on IPCC AR6 and EPA guidelines.

---

## 🔐 Security

✅ **API Key Protection**
- Never hardcoded
- Read from `GEMINI_API_KEY` environment variable only
- Never exposed in logs or UI

✅ **Security Headers** (via middleware)
- `X-Frame-Options: DENY` — Prevents clickjacking
- `X-Content-Type-Options: nosniff` — Prevents MIME sniffing
- `X-XSS-Protection: 1; mode=block` — XSS filter
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy` — Restricts resource loading

✅ **Input Validation**
- All Pydantic models validate types and ranges with `Field(ge=, le=)`
- User inputs bounded (e.g., AC: 0–24 hours, car km: 0–2000)
- User IDs validated with regex (`^[\w\-]{1,64}$`)
- Gemini output HTML-escaped before client delivery
- Chat messages length-limited (max 2000 chars)

✅ **Database Safety**
- SQLite local-only
- No sensitive data stored
- Anonymous user IDs supported
- UUID-based record IDs

✅ **Error Handling**
- Custom exception handler — never leaks stack traces
- Graceful failures with user-friendly messages
- Structured logging via Python `logging` module

---

## 📈 Demo Flow

### Scenario: "Priya" - Working Professional in Bangalore

```
1. Landing → Chat Coach
   User: "I drive 18 km to work daily, use AC 8 hours, 
           electricity bill is ₹5000/month, fly twice yearly"

2. AI Extraction
   → Carbon Coach summarizes lifestyle
   → Shows annual footprint: 5.2 tonnes CO₂e
   
3. Major Contributors
   → Transportation: 2.1 t (40%)
   → Electricity: 2.4 t (47%)
   → Flights: 0.7 t (13%)

4. Action Plan
   → Switch to public transport 3 days/week: -500 kg/year
   → AC at 26°C, use fans: -400 kg/year
   → LED bulbs: -200 kg/year

5. What-If Scenarios
   Scenario: "Electric car + public transport"
   → New footprint: 3.1 tonnes (40% reduction)
   → Annual savings: ₹12,500

6. Goal Setting
   → 30-day pledge: "Use public transport 3 days/week"
   → Earn badge: Green Citizen
   → Progress tracking enabled
```

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
python -m pytest tests/ -v --tb=short
```

### Frontend Tests
```bash
cd frontend
npx vitest run
```

Test coverage includes:

**Backend (75+ test cases):**
- ✅ Carbon engine calculations (parameterized, all fuel types)
- ✅ API endpoint integration tests
- ✅ Pydantic model validation (bounds, type coercion, defaults)
- ✅ Security headers verification (CSP, X-Frame-Options, etc.)
- ✅ Input sanitization and edge cases
- ✅ Household size adjustments
- ✅ Region-specific electricity factors
- ✅ Error handling and graceful failures

**Frontend (20+ test cases):**
- ✅ Component rendering tests (App, Calculator, Dashboard, EmissionCard)
- ✅ API service layer unit tests (all endpoints mocked)
- ✅ Form validation and interaction tests
- ✅ Navigation and routing tests
- ✅ Edge cases (null data, empty states)

---

## 📱 Responsive Design

✅ **Mobile** (< 640px)
- Stacked layout
- Touch-friendly buttons
- Single-column forms

✅ **Tablet** (640px - 1024px)
- Two-column layout where appropriate
- Optimized spacing

✅ **Desktop** (> 1024px)
- Full sidebar + content
- Multi-column cards
- Hover effects

---

## 🎨 Design System

### Colors
- **Primary Green**: `#22c55e` (action, positive)
- **Neutral Gray**: `#374151` (text, structure)
- **Light Gray**: `#f3f4f6` (backgrounds)
- **White**: `#ffffff` (cards, surfaces)

### Typography
- **Headings**: -apple-system, 18-32px bold
- **Body**: -apple-system, 14-16px regular
- **Captions**: 12px gray

### Components
- Rounded cards (12px border-radius)
- Gentle shadows (2px blur)
- Smooth transitions (200ms)
- Clear affordances (buttons, inputs)

---

## 📡 API Endpoints

### Chat & Extraction
```
POST /api/chat
Input: { message, session_id, user_id }
Output: { message, extracted_data, carbon_result, session_id }
```

### Calculator
```
POST /api/calculate
Input: { carbon_input, user_id }
Output: { monthly_kg, annual_tonnes, sources, recommendations }
```

### What-If Simulator
```
POST /api/what-if
Input: { baseline_data, scenario_changes, scenario_name }
Output: { baseline_monthly, scenario_monthly, percentage_reduction, money_saved }
```

### Pledges
```
POST /api/pledge
GET  /api/pledges/{user_id}
```

### Chat History
```
GET /api/history/{session_id}
```

---

## 🌍 Deployment

### Backend (Vercel, Railway, Render)
```bash
# Requires:
- Python 3.9+ runtime
- Environment variable: GEMINI_API_KEY
- Start command: python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### Frontend (Vercel, Netlify, GitHub Pages)
```bash
# Build
npm run build

# Deploy dist/ folder
# Environment: VITE_API_URL=https://your-backend.com/api
```

---

## 📊 Repository Stats

- **Backend**: ~800 lines (Python)
- **Frontend**: ~600 lines (React)
- **Tests**: ~200 lines
- **Total**: ~1600 lines
- **Size**: < 5 MB (without node_modules, venv)
- **Dependencies**: 12 (backend), 3 main (frontend)

---

## 🎓 What Makes This Different?

| Feature | EcoMind AI | Typical Calc |
|---------|-----------|-------------|
| Natural language input | ✅ Yes | ❌ No |
| Chat interface | ✅ Yes | ❌ No |
| What-if scenarios | ✅ Yes | ❌ No |
| Transparent math | ✅ Yes | ⚠️ Limited |
| Social features | ✅ Yes | ❌ No |
| AI recommendations | ✅ Personalized | ❌ Generic |
| Motivation system | ✅ Goals/badges | ❌ No |
| Regional awareness | ✅ 6 regions | ⚠️ Limited |
| Lightweight codebase | ✅ <2K lines | ❌ >20K lines |
| Open source ready | ✅ Yes | ⚠️ Often no |

---

## 🤝 Contributing

Contributions welcome! Areas for expansion:
- [ ] Diet & waste emissions
- [ ] More regions
- [ ] Social sharing
- [ ] Mobile app
- [ ] Offline support
- [ ] More AI-powered features

---

## 📝 License

MIT License - See LICENSE file for details

---

## 🙋 FAQ

**Q: Why no ML models?**  
A: Keeps it simple, fast, and explainable. Deterministic math is more trustworthy.

**Q: How accurate are the calculations?**  
A: ±20% typical error range based on IPCC factors. Regional data varies.

**Q: Can I use this offline?**  
A: Backend yes (except Gemini features). Frontend requires internet for AI features.

**Q: How do I get a Gemini API key?**  
A: Free from https://makersuite.google.com/app/apikey (includes free monthly credits)

**Q: Can I self-host?**  
A: Yes! Backend runs on any Python server. Frontend on any static host.

---

## 🎯 Hackathon Checklist

✅ **Functionality**
- [x] Carbon calculation engine
- [x] Gemini AI integration
- [x] What-if simulator
- [x] Responsive UI
- [x] Database persistence
- [x] Tests

✅ **Code Quality**
- [x] Clean, modular code with Google-style docstrings
- [x] Comprehensive comments and type annotations
- [x] ESLint (frontend) and Ruff (backend) linter configs
- [x] Structured logging (Python `logging` module)
- [x] Named constants (no magic numbers)
- [x] Modern SQLAlchemy 2.0 `DeclarativeBase`
- [x] Pydantic v2 with `Field` validators
- [x] Error handling and input validation
- [x] Security (no hardcoded keys, security headers)

✅ **Documentation**
- [x] Polished README
- [x] Architecture diagram
- [x] Setup instructions
- [x] API documentation
- [x] Assumptions listed

✅ **Design & Accessibility**
- [x] Professional Google Cloud-inspired UI
- [x] Responsive layout (mobile, tablet, desktop)
- [x] WCAG 2.1 AA accessibility compliance
- [x] Skip-to-content link for keyboard users
- [x] `focus-visible` outlines for keyboard navigation
- [x] `aria-live` regions for dynamic content
- [x] `prefers-reduced-motion` media query
- [x] Semantic HTML5 (header, nav, main, footer roles)
- [x] Consistent Google branding and smooth animations

✅ **Repository**
- [x] .gitignore configured
- [x] < 10 MB size
- [x] No secrets committed
- [x] Single branch
- [x] Clear folder structure

---

## 📞 Support

For issues or questions:
1. Check README & API docs
2. Review error messages
3. Check test cases
4. Open an issue on GitHub

---

**Made with 🌱 by EcoMind AI Team**  
*Empowering individuals to reduce their carbon footprint through AI-powered guidance*

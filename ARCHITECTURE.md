# ARCHITECTURE.md - EcoMind AI Technical Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Browser                           │
│                  (React 18 + Vite)                          │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST
                         │ (port 5173)
┌────────────────────────▼────────────────────────────────────┐
│              Backend API Server (FastAPI)                   │
│              Python 3.9+ (port 8000)                        │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ API Layer (main.py)                                 │   │
│  │ - /api/chat       → Chat interface                  │   │
│  │ - /api/calculate  → Emission calculation            │   │
│  │ - /api/what-if    → Scenario simulation             │   │
│  │ - /api/pledge     → Action pledges                  │   │
│  │ - /api/history    → Chat history                    │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Core Engines                                         │   │
│  │                                                      │   │
│  │ ┌─────────────────┐  ┌──────────────────────────┐   │   │
│  │ │ Carbon Engine   │  │ Gemini AI Client         │   │   │
│  │ │ (carbon_engine) │  │ (gemini_ai)              │   │   │
│  │ │                 │  │                          │   │   │
│  │ │ • Calculations  │  │ • Text extraction        │   │   │
│  │ │ • Formulas      │  │ • Summarization          │   │   │
│  │ │ • Scenarios     │  │ • Recommendations        │   │   │
│  │ │ • Validation    │  │ • Follow-up Q&A          │   │   │
│  │ └─────────────────┘  └──────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Data Layer                                           │   │
│  │ (database.py + models.py)                           │   │
│  │                                                      │   │
│  │ ┌─────────────────────────────────────────────────┐ │   │
│  │ │         SQLite Database                         │ │   │
│  │ │                                                 │ │   │
│  │ │ • user_footprints    (calculation history)     │ │   │
│  │ │ • user_pledges       (action tracking)         │ │   │
│  │ │ • chat_history       (conversation logs)       │ │   │
│  │ │ • user_profiles      (preferences)             │ │   │
│  │ └─────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────────┐
        │   Google Gemini API                │
        │   (Natural Language Processing)    │
        └────────────────────────────────────┘
```

## Component Architecture

### Frontend (React + Vite)

```
frontend/
├── src/
│   ├── components/
│   │   ├── ChatInterface.jsx      # Main chat UI
│   │   ├── Calculator.jsx         # Form-based input
│   │   ├── WhatIfSimulator.jsx    # Scenario comparison
│   │   ├── Dashboard.jsx          # Progress tracking
│   │   └── EmissionCard.jsx       # Result display
│   ├── context/
│   │   └── AppContext.jsx         # Global state
│   ├── services/
│   │   └── api.js                 # Backend communication
│   ├── App.jsx                    # Main app shell
│   └── main.jsx                   # React entry point
└── index.html
```

**Key Patterns:**
- Context API for global state
- Custom hooks for API calls
- Modular component design
- Tailwind CSS for styling
- Responsive grid layout

### Backend (FastAPI)

```
backend/
├── app/
│   ├── main.py              # FastAPI application + endpoints
│   ├── carbon_engine.py      # Carbon calculation logic
│   ├── gemini_ai.py          # Gemini integration
│   ├── database.py           # SQLAlchemy models
│   ├── models.py             # Pydantic schemas
│   ├── config.py             # Configuration
│   └── __init__.py           # Package init
├── tests/
│   ├── test_carbon_engine.py # Unit tests
│   └── test_api.py           # API tests
└── run.py                    # Entry point
```

## Data Flows

### 1. Chat Flow
```
User Message
    ↓
ChatInterface Component
    ↓
POST /api/chat
    ↓
Gemini API (extraction)
    ↓
Carbon Engine (calculation)
    ↓
Database (storage)
    ↓
Response to Frontend
    ↓
Display in Chat
```

### 2. Calculator Flow
```
Form Input
    ↓
Validation (Pydantic)
    ↓
Carbon Engine
    ↓
Recommendations Engine
    ↓
Database Storage
    ↓
Display Results Card
```

### 3. What-If Flow
```
Baseline Data + Changes
    ↓
Apply Scenario Changes
    ↓
Carbon Engine (recalculate)
    ↓
Compare Results
    ↓
Calculate Savings
    ↓
Display Comparison
```

## Calculation Engine

### Carbon Emission Factors

Stored in `carbon_engine.py`:

```python
EMISSION_FACTORS = {
    # Transportation (kg CO2e per km)
    "car_petrol": 0.192,
    "car_diesel": 0.171,
    "car_electric": 0.050,
    
    # Flights (kg CO2e per km)
    "flight_domestic": 0.255,
    "flight_international": 0.195,
    
    # Electricity (kg CO2e per kWh)
    "electricity_india": 0.659,
    "electricity_us": 0.378,
    "electricity_eu": 0.278,
    
    # Other (kg CO2e per unit)
    "lpg_cooking": 2.04,
    # ...more factors
}
```

### Calculation Process

```python
monthly_emissions = 0

# 1. Transportation
car_emissions = daily_km * 30 * emission_factor
flight_emissions = flights * avg_distance * emission_factor
transport_total = car_emissions + flight_emissions

# 2. Energy
electricity_emissions = kwh * region_factor
ac_emissions = hours * 30 * 1kW * region_factor
lpg_emissions = kg * emission_factor
energy_total = electricity_emissions + ac_emissions + lpg_emissions

# 3. Household Adjustment
per_capita = (transport_total + energy_total) / household_size

# 4. Annualization
annual = monthly * 12

@echo off
REM EcoMind AI Setup Script for Windows

echo.
echo 🌱 EcoMind AI - Setup
echo ====================
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python not found. Please install Python 3.9 or later.
    exit /b 1
)

REM Check Node
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found. Please install Node.js 16 or later.
    exit /b 1
)

echo ✅ Python and Node found
echo.

REM Backend setup
echo Setting up backend...
cd backend

REM Create venv
python -3.11 -m venv venv
call venv\Scripts\activate.bat

REM Install dependencies
pip install -r requirements.txt

echo ✅ Backend dependencies installed
echo.

REM Ask for Gemini API key
echo 🔑 Gemini API Key Setup
echo Get a free key at: https://makersuite.google.com/app/apikey
set /p gemini_key="Enter your GEMINI_API_KEY (or press Enter to skip): "

if not "%gemini_key%"=="" (
    (
        echo GEMINI_API_KEY=%gemini_key%
    ) > .env
    echo ✅ Gemini API key configured
) else (
    copy .env.example .env
    echo ⚠️  Using .env.example (chat features will be limited)
)

cd ..
echo.

REM Frontend setup
echo Setting up frontend...
cd frontend
call npm install
echo ✅ Frontend dependencies installed
cd ..

echo.
echo 🎉 Setup Complete!
echo.
echo Next steps:
echo 1. Backend: cd backend ^&^& python run.py
echo 2. Frontend: cd frontend ^&^& npm run dev
echo.
echo Then open: http://localhost:5173
echo.
pause

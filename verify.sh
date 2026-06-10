#!/bin/bash

# Test and build verification for EcoMind AI

echo "🧪 Running Tests..."
echo "===================="
echo ""

cd backend

# Run backend tests
echo "Running backend tests..."
python -m pytest tests/test_carbon_engine.py -v

if [ $? -ne 0 ]; then
    echo "❌ Backend tests failed"
    exit 1
fi

echo "✅ Backend tests passed"
echo ""

# Check repo size
echo "📦 Repository Size Check"
echo "========================"

# Calculate size excluding build/env folders
if du --help 2>&1 | grep -q -- "--exclude"; then
    # GNU du (Git Bash, Linux)
    du -sh --exclude="venv" --exclude=".pytest_cache" --exclude="*.sqlite" --exclude=".env" . | awk '{print "Backend (Clean): " $1}'
    du -sh --exclude="node_modules" --exclude="dist" ../frontend | awk '{print "Frontend (Clean): " $1}'
else
    # BSD du (macOS/BSD fallback)
    du -sh .
    du -sh ../frontend
fi

# Count lines of code
echo ""
echo "📊 Lines of Code"
echo "================"

echo "Backend:"
find app tests -name "*.py" | xargs wc -l | tail -1

echo "Frontend:"
cd ../frontend
find src -name "*.jsx" -o -name "*.js" | xargs wc -l | tail -1

echo ""
echo "✅ Verification complete!"

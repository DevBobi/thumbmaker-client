@echo off
echo ================================================
echo Starting Next.js Client
echo ================================================
echo.

echo [1/3] Checking dependencies...
if not exist node_modules (
    echo Installing dependencies...
    npm install --legacy-peer-deps
)

echo.
echo [2/3] Starting Next.js development server...
echo.
echo Client will be available at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

npm run dev

pause

@echo off
cd /d "%~dp0"
echo ==========================================
echo       Starting Mafifulus Application
echo ==========================================
echo Current Directory: %CD%

echo 1. Launching Backend (Port 5000)...
if exist "backend\package.json" (
    start "Mafifulus Backend" cmd /k "cd backend && npm start"
) else (
    echo ERROR: Could not find backend folder!
)

echo 2. Launching Frontend (Port 3000)...
if exist "package.json" (
    start "Mafifulus Frontend" cmd /k "npm run dev"
) else (
    echo ERROR: Could not find frontend package.json!
)

echo.
echo ==========================================
echo Servers are launching in new windows.
echo Please wait ~10 seconds then open:
echo http://localhost:3000
echo ==========================================
pause

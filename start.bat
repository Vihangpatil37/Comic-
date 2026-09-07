@echo off
title Comic Archive Launcher
echo ========================================================
echo               Starting Comic Archive
echo ========================================================
echo.

:: Determine base directory
set "ROOT_DIR=%~dp0"

if exist "%ROOT_DIR%comic-archive\backend" (
    set "BACKEND_DIR=%ROOT_DIR%comic-archive\backend"
    set "FRONTEND_DIR=%ROOT_DIR%comic-archive\frontend"
) else if exist "%ROOT_DIR%backend" (
    set "BACKEND_DIR=%ROOT_DIR%backend"
    set "FRONTEND_DIR=%ROOT_DIR%frontend"
) else (
    echo [ERROR] Could not find backend or frontend directories.
    pause
    exit /b 1
)

echo [1/2] Starting Backend (Port 4000)...
start "Comic Archive - Backend (Port 4000)" cmd /k "cd /d "%BACKEND_DIR%" && npm run dev"

echo [2/2] Starting Frontend (Port 3000)...
start "Comic Archive - Frontend (Port 3000)" cmd /k "cd /d "%FRONTEND_DIR%" && npm run dev"

echo.
echo ========================================================
echo   Services started!
echo   - Backend:  http://localhost:4000
echo   - Frontend: http://localhost:3000
echo ========================================================
echo.

timeout /t 3 /nobreak >nul
start http://localhost:3000

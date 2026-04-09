@echo off
title PRISM ERP Server Launcher
echo ==================================================
echo PRISM ERP - System Launcher
echo ==================================================
echo.

:: Start the backend server in a new command window
echo [~] Starting Backend Server...
start "PRISM Backend" cmd /k "cd /d %~dp0backend && node server.js"

:: Give the backend a second to start
timeout /t 2 /nobreak > nul

:: Start the frontend server in a new window and open preview
echo [~] Starting Frontend Development Server...
start "PRISM Frontend" cmd /k "cd /d %~dp0frontend && npm run dev -- --open"

echo.
echo ==================================================
echo Servers are launching in separate windows!
echo It may take a moment for the browser to open.
echo You can close this window now.
echo ==================================================
timeout /t 5

@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Please install Node.js, then run start.cmd again.
  pause
  exit /b 1
)
start "" "http://localhost:4173"
node server.js
pause

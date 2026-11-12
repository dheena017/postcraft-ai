@echo off
title PostCraft AI - Live Server
cd /d "%~dp0"
cls
echo ============================================================
echo   Starting PostCraft AI Live Development Server...
echo ============================================================
node scripts/server-runner.mjs %*
if %errorlevel% neq 0 (
  echo.
  echo [ERROR] Server exited with an error. Press any key to close.
  pause >nul
)


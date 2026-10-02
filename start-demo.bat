@echo off
setlocal

call "%~dp0start-all.bat"
echo Waiting for all services to initialize...
timeout /t 35 /nobreak >nul

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0check-all.ps1"
if errorlevel 1 (
  echo Demo startup is incomplete. Review the service terminals before presenting.
  pause
  exit /b 1
)

start "" "http://localhost:4203"
echo Reporting dashboard opened successfully.

@echo off
setlocal
set ROOT=%~dp0

echo ========================================
echo  Starting all PFE projects
echo ========================================
echo.

call "%ROOT%start-postgres.bat"

echo [OPM] Starting backend (port 3000)...
start "OPM Backend" cmd /k "cd /d "%ROOT%OPM\backend" && npm start"

echo [OPM] Starting frontend (port 4200)...
start "OPM Frontend" cmd /k "cd /d "%ROOT%OPM\frontend" && set NODE_OPTIONS=--openssl-legacy-provider && npx ng serve --port 4200"

echo [PTE] Starting backend (port 3001)...
start "PTE Backend" cmd /k "cd /d "%ROOT%PTE\PTE_Backend" && npm run server"

echo [PTE] Starting frontend (port 4201)...
start "PTE Frontend" cmd /k "cd /d "%ROOT%PTE\PTE_frontend" && npx ng serve --port 4201"

echo [PMA] Starting backend (port 3002)...
start "PMA Backend" cmd /k "cd /d "%ROOT%PMA\PMA-Backend" && npm run dev"

echo [PMA] Starting frontend (port 4202)...
start "PMA Frontend" cmd /k "cd /d "%ROOT%PMA\PMA-Frontend" && npx ng serve --port 4202"

echo [Reporting] Starting FastAPI backend (port 8000)...
start "Reporting Backend" cmd /k "cd /d "%ROOT%reporting-fastapi" && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

echo [Reporting] Starting frontend (port 4203)...
start "Reporting Frontend" cmd /k "cd /d "%ROOT%Reporting\reporting-frontend" && npx ng serve --port 4203"

echo.
echo ========================================
echo  8 terminals launched.
echo.
echo  Frontends:
echo    OPM  ->  http://localhost:4200
echo    PTE  ->  http://localhost:4201
echo    PMA  ->  http://localhost:4202
echo    Reporting -> http://localhost:4203
echo  Backends:
echo    OPM  ->  http://localhost:3000
echo    PTE  ->  http://localhost:3001
echo    PMA  ->  http://localhost:3002
echo    Reporting -> http://localhost:8000
echo ========================================

@echo off
setlocal

echo [1/4] Seeding OPM database...
cd /d "%~dp0OPM\backend"
node "scripts\seed_all_collections.js"
if errorlevel 1 goto :fail

echo [2/4] Seeding PTE database...
cd /d "%~dp0PTE\PTE_Backend"
node "scripts\seed_all_collections.js"
if errorlevel 1 goto :fail

echo [3/4] Seeding PMA database...
cd /d "%~dp0PMA\PMA-Backend"
node "scripts\seed_all_collections.js"
if errorlevel 1 goto :fail

echo [4/4] Refreshing FastAPI source tokens...
cd /d "%~dp0reporting-fastapi"
python "scripts\refresh_source_tokens.py"
if errorlevel 1 goto :fail

echo.
echo All databases reseeded and tokens refreshed successfully.
goto :eof

:fail
echo.
echo Seed process failed. Check the logs above.
exit /b 1

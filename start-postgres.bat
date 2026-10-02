@echo off
setlocal

set "PG_BIN=%~dp0.local-data\postgresql-portable-2\pgsql\bin"
set "PG_DATA=%~dp0.local-data\postgres-data"
set "PG_LOG=%~dp0.local-data\logs\postgres.log"

if not exist "%PG_BIN%\pg_ctl.exe" (
  echo Portable PostgreSQL was not found at: %PG_BIN%
  exit /b 1
)

"%PG_BIN%\pg_ctl.exe" -D "%PG_DATA%" status >nul 2>&1
if not errorlevel 1 (
  echo PostgreSQL is already running.
  exit /b 0
)

"%PG_BIN%\pg_ctl.exe" -D "%PG_DATA%" -l "%PG_LOG%" -o "-p 5432" start

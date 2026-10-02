@echo off
setlocal

set "DUMP_DIR=%~dp0.local-data\mongo-dump"

where mongorestore >nul 2>&1
if errorlevel 1 (
  echo MongoDB Database Tools are not installed or mongorestore is not in PATH.
  echo Install MongoDB Community Server with Database Tools, then run this file again.
  exit /b 1
)

if not exist "%DUMP_DIR%\pte" (
  echo MongoDB dump was not found at: %DUMP_DIR%
  exit /b 1
)

echo Restoring OPM, PTE, PMA and Reporting databases without deleting existing data...
mongorestore --uri="mongodb://127.0.0.1:27017" --nsInclude="opm.*" --nsInclude="pte.*" --nsInclude="pma.*" --nsInclude="reporting_etl.*" "%DUMP_DIR%"
if errorlevel 1 (
  echo Restore failed. Make sure MongoDB is running on port 27017.
  exit /b 1
)

echo Restore completed successfully.
echo Databases: opm, pte, pma, reporting_etl

@echo off
REM Helper batch file to run Python scripts with venv
REM Usage: run_scripts.bat generate-data
REM        run_scripts.bat etl

setlocal

set VENV_PYTHON=%~dp0venv\Scripts\python.exe

if not exist "%VENV_PYTHON%" (
    echo Error: Virtual environment not found at %VENV_PYTHON%
    exit /b 1
)

if "%1"=="generate-data" (
    echo Generating data...
    "%VENV_PYTHON%" scripts\generate_data.py
) else if "%1"=="etl" (
    echo Running ETL pipeline...
    "%VENV_PYTHON%" scripts\etl_pipeline.py
) else (
    echo Usage: run_scripts.bat [generate-data^|etl]
    exit /b 1
)

endlocal



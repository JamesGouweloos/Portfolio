# Helper script to run Python scripts with venv
# Usage: .\run_scripts.ps1 generate-data
#        .\run_scripts.ps1 etl

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("generate-data", "etl")]
    [string]$Script
)

$venvPython = Join-Path $PSScriptRoot "venv\Scripts\python.exe"

if (-not (Test-Path $venvPython)) {
    Write-Host "Error: Virtual environment not found at $venvPython" -ForegroundColor Red
    exit 1
}

switch ($Script) {
    "generate-data" {
        Write-Host "Generating data..." -ForegroundColor Green
        & $venvPython scripts\generate_data.py
    }
    "etl" {
        Write-Host "Running ETL pipeline..." -ForegroundColor Green
        & $venvPython scripts\etl_pipeline.py
    }
}



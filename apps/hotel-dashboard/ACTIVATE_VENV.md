# How to Activate Virtual Environment on Windows

## Problem
PowerShell execution policy prevents running activation scripts by default.

## Solutions

### Option 1: Bypass Execution Policy (Recommended for Development)

Run this command in PowerShell (as Administrator if needed):
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

This allows local scripts to run. You'll only need to do this once.

### Option 2: Use Command Prompt Instead

If you prefer not to change PowerShell settings, use Command Prompt (cmd):
```cmd
cd Hotel_Dashboard
venv\Scripts\activate.bat
```

### Option 3: Run Python Directly (No Activation Needed)

You can use the venv's Python directly without activating:
```powershell
# From Hotel_Dashboard directory
.\venv\Scripts\python.exe scripts/generate_data.py
.\venv\Scripts\python.exe scripts/etl_pipeline.py
```

### Option 4: Temporary Bypass (One-time)

For a single session, you can bypass the policy temporarily:
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
.\venv\Scripts\Activate.ps1
```

## Recommended Approach

For development, I recommend **Option 1** (set RemoteSigned policy) as it's the most convenient and secure approach. It allows local scripts to run while still requiring remote scripts to be signed.

## Verify It Works

After setting the policy, try activating:
```powershell
cd Hotel_Dashboard
.\venv\Scripts\Activate.ps1
```

You should see `(venv)` at the beginning of your prompt.



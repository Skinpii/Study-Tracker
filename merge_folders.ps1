// This script will move all files from backend/src copy and frontend into a new folder called 'skinpii-app'.
// It will preserve the structure under 'backend' and 'frontend' as subfolders of 'skinpii-app'.
// After running, you will have: skinpii-app/backend, skinpii-app/frontend, and server.ts at the root of skinpii-app.

// Windows PowerShell script

# Create the new merged folder
New-Item -ItemType Directory -Path .\skinpii-app

# Move backend/src copy to skinpii-app/backend
Move-Item -Path .\backend\src\ copy -Destination .\skinpii-app\backend

# Move frontend to skinpii-app/frontend
Move-Item -Path .\frontend -Destination .\skinpii-app\frontend

# Move server.ts to skinpii-app
Move-Item -Path .\server.ts -Destination .\skinpii-app\server.ts

# Move .env if needed
if (Test-Path .\.env) { Move-Item -Path .\.env -Destination .\skinpii-app\.env }

Write-Host "All files have been moved to skinpii-app."

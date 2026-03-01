<# Windows PowerShell runner for full phase 4 bootstrap #>
Write-Output "Starting full environment bootstrap (API + Frontend + Storybook + Docker)"

# Ensure dependencies
npm ci

# Start API and Frontend (in background)
npm run dev | Out-File -FilePath .

# Start Storybook
npm run storybook | Out-File -FilePath .

# Build Storybook (optional in background)
npm run build-storybook | Out-File -FilePath .

# Start Docker if available
if (Get-Command docker -ErrorAction SilentlyContinue) {
  docker-compose up --build -d
}

Write-Output "Bootstrap complete. Check logs for each service."

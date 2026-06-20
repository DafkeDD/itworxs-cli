# Installeert de itworxs-cli in een zichtbare map 'itworxs-cli/' in je project.
# Draai dit vanuit de root van je project:
#   powershell -ExecutionPolicy Bypass -File install.ps1
# of plak het blok hieronder rechtstreeks in PowerShell.

New-Item -ItemType Directory -Force itworxs-cli > $null
Push-Location itworxs-cli
npm init -y > $null
npm install --save-dev github:DafkeDD/itworxs-cli
Pop-Location

Write-Host ""
Write-Host "Klaar. De CLI staat nu in de map itworxs-cli/."
Write-Host "Gebruik:  cd itworxs-cli ; npx itworxs init"

# Installeert de itworxs-cli rechtstreeks van GitHub in de map 'itworxs-cli/'
# en start meteen de setup-wizard. Draai dit vanuit de root van je project:
#   powershell -ExecutionPolicy Bypass -File install.ps1

npm install --prefix itworxs-cli github:DafkeDD/itworxs-cli
Push-Location itworxs-cli
npx itworxs init
Pop-Location

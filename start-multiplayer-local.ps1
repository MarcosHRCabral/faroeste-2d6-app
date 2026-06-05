param(
  [int]$ClientPort = 5173,
  [int]$ServerPort = 3001,
  [switch]$SetupOnly,
  [switch]$NoInstall,
  [switch]$KeepPorts
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path

function Write-Step {
  param([string]$Message)
  Write-Host ""
  Write-Host "==> $Message" -ForegroundColor Cyan
}

function Write-Ok {
  param([string]$Message)
  Write-Host "OK  $Message" -ForegroundColor Green
}

function Stop-ListenersOnPort {
  param([int]$Port)

  $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue |
    Where-Object { $_.State -eq "Listen" }

  $processIds = $connections |
    Select-Object -ExpandProperty OwningProcess -Unique |
    Where-Object { $_ -and $_ -ne $PID }

  foreach ($processId in $processIds) {
    $process = Get-Process -Id $processId -ErrorAction SilentlyContinue

    if ($process) {
      Write-Host "Parando processo na porta ${Port}: $($process.ProcessName) ($processId)"
      Stop-Process -Id $processId -Force
    }
  }
}

function Test-CommandExists {
  param([string]$Command)
  return [bool](Get-Command $Command -ErrorAction SilentlyContinue)
}

Set-Location $Root

Write-Step "Preparando o multiplayer local do Faroeste +2D6"

if (-not (Test-CommandExists "node")) {
  throw "Node.js nao foi encontrado. Instale o Node.js LTS e rode este script de novo."
}

if (-not (Test-CommandExists "npm")) {
  throw "npm nao foi encontrado. Instale o Node.js LTS e rode este script de novo."
}

$clientOrigin = "http://localhost:$ClientPort,http://127.0.0.1:$ClientPort,http://localhost:3000,http://127.0.0.1:3000"
$envLocal = @"
VITE_SOCKET_URL=http://localhost:$ServerPort
PORT=$ServerPort
CLIENT_ORIGIN=$clientOrigin
"@

Write-Step "Criando .env.local"
Set-Content -Path (Join-Path $Root ".env.local") -Value $envLocal -Encoding UTF8
Write-Ok ".env.local aponta o frontend para http://localhost:$ServerPort"

if (-not $NoInstall -and -not (Test-Path (Join-Path $Root "node_modules"))) {
  Write-Step "Instalando dependencias"
  npm install
} else {
  Write-Ok "Dependencias ja estao prontas"
}

if (-not $KeepPorts) {
  Write-Step "Liberando portas antigas"
  Stop-ListenersOnPort -Port $ClientPort
  Stop-ListenersOnPort -Port $ServerPort
  Write-Ok "Portas $ClientPort e $ServerPort liberadas"
}

if ($SetupOnly) {
  Write-Step "Configuracao concluida"
  Write-Host "Para iniciar depois, rode: npm run dev:multiplayer"
  exit 0
}

$env:VITE_SOCKET_URL = "http://localhost:$ServerPort"
$env:PORT = "$ServerPort"
$env:CLIENT_ORIGIN = $clientOrigin

Write-Step "Subindo frontend e backend"
Write-Host "Frontend: http://localhost:$ClientPort"
Write-Host "Backend:  http://localhost:$ServerPort"
Write-Host ""
Write-Host "Quando aparecer o endereco do Vite, abra http://localhost:$ClientPort e entre em Sessao online."
Write-Host "Para parar, pressione Ctrl+C nesta janela."
Write-Host ""

npm run dev

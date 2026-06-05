@echo off
setlocal
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-multiplayer-local.ps1"
if errorlevel 1 (
  echo.
  echo O script encontrou um problema. Veja a mensagem acima.
  pause
)

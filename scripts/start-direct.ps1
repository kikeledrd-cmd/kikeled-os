$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

& "$PSScriptRoot\build-direct.ps1"

if (-not $env:PORT) {
  $env:PORT = "4002"
}

Write-Host "Kikeled OS listo en http://localhost:$env:PORT/"
node dist-server/server/index.js

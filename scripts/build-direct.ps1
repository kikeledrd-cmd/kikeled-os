param(
  [switch]$ClientOnly,
  [switch]$ServerOnly
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

if (-not $ServerOnly) {
  New-Item -ItemType Directory -Force -Path "dist-direct" | Out-Null

  & "node_modules\@esbuild\win32-x64\esbuild.exe" `
    "src/main.direct.tsx" `
    "--bundle" `
    "--outdir=dist-direct/assets" `
    "--format=esm" `
    "--splitting" `
    "--target=es2020" `
    "--loader:.tsx=tsx" `
    "--loader:.ts=ts"

  & "node_modules\.bin\tailwindcss.cmd" `
    "-i" "src\styles\index.css" `
    "-o" "dist-direct\assets\main.css" `
    "--minify"

  @"
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Kikeled Studio SRL | Letreros, interiores y soluciones digitales en RD</title>
    <link rel="stylesheet" href="/assets/main.css?v=20260614-phase1" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/assets/main.direct.js?v=20260614-phase1"></script>
  </body>
</html>
"@ | Set-Content -LiteralPath "dist-direct\index.html" -Encoding UTF8
}

if (-not $ClientOnly) {
  & npx.cmd tsc -p tsconfig.server.json
}

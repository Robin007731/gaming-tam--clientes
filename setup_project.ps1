$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$inputPath = Join-Path $root "cliente.html"

if (-not (Test-Path $inputPath)) {
  throw "No se encontró '$inputPath'. Asegúrate de que exista 'cliente.html' en la carpeta del proyecto."
}

$html = Get-Content -Path $inputPath -Raw -Encoding UTF8

# Extraer CSS del <style>...</style>
$styleMatch = [regex]::Match($html, "<style>(?<css>[\s\S]*?)</style>", "IgnoreCase")
if (-not $styleMatch.Success) { throw "No se encontró el bloque <style>...</style> en cliente.html" }
$css = $styleMatch.Groups["css"].Value.Trim()

# Extraer JS del <script type="module">...</script>
$scriptMatch = [regex]::Match($html, "<script\s+type\s*=\s*['""]module['""]\s*>(?<js>[\s\S]*?)</script>", "IgnoreCase")
if (-not $scriptMatch.Success) { throw "No se encontró el bloque <script type='module'>...</script> en cliente.html" }
$js = $scriptMatch.Groups["js"].Value.Trim()

# Crear carpetas
$cssDir = Join-Path $root "css"
$jsDir  = Join-Path $root "js"
New-Item -ItemType Directory -Force -Path $cssDir | Out-Null
New-Item -ItemType Directory -Force -Path $jsDir  | Out-Null

# Construir index.html:
# - Reemplazar el <style>...</style> por <link rel="stylesheet" href="css/styles.css">
# - Reemplazar el <script type="module">...</script> por <script type="module" src="js/app.js"></script>
$indexHtml = $html
$indexHtml = [regex]::Replace(
  $indexHtml,
  "<style>[\s\S]*?</style>",
  "    <link rel=`"stylesheet`" href=`"css/styles.css`">",
  "IgnoreCase"
)
$indexHtml = [regex]::Replace(
  $indexHtml,
  "<script\s+type\s*=\s*['""]module['""]\s*>[\s\S]*?</script>",
  "    <script type=`"module`" src=`"js/app.js`"></script>",
  "IgnoreCase"
)

# Guardar archivos
$indexPath = Join-Path $root "index.html"
$cssPath   = Join-Path $cssDir "styles.css"
$jsPath    = Join-Path $jsDir  "app.js"

Set-Content -Path $indexPath -Value $indexHtml -Encoding UTF8
Set-Content -Path $cssPath   -Value $css      -Encoding UTF8
Set-Content -Path $jsPath    -Value $js       -Encoding UTF8

Write-Host "Listo:"
Write-Host " - index.html"
Write-Host " - css\styles.css"
Write-Host " - js\app.js"

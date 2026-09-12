# MECHESA // PART 2 // PATCH UI-06
# BLUEPRINT ANALYSIS SCAN-LINE
#
# Run from repository root:
# powershell -ExecutionPolicy Bypass -File .\MECHESA_PATCH_UI_06.ps1
#
# Target: the existing shared Blueprint visual surface used by Engineering Lab
# instruments. CSS-only visual enhancement; no new state, route, dependency,
# canvas, WebGL, GSAP, RAF, or animation loop.

$ErrorActionPreference = "Stop"

$projectRoot = (Get-Location).Path
$backupDir = Join-Path $projectRoot ".patch-backups\PATCH_UI_06"

function Stop-Patch([string]$Message) {
    Write-Host ""
    Write-Host "PATCH UI-06 STOPPED SAFELY" -ForegroundColor Red
    Write-Host $Message -ForegroundColor Red
    Write-Host "No source files were modified." -ForegroundColor Yellow
    Write-Host "No backup files were created because no safe modification was possible." -ForegroundColor Yellow
    exit 1
}

function Require-File([string]$RelativePath) {
    $path = Join-Path $projectRoot $RelativePath
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) {
        Stop-Patch "Required file not found: $RelativePath"
    }
    return $path
}

function Read-Text([string]$Path) {
    return [System.IO.File]::ReadAllText($Path)
}

function Backup-Once([string]$Path, [string]$RelativePath) {
    $destination = Join-Path $backupDir $RelativePath
    $destinationDir = Split-Path -Parent $destination
    if (-not (Test-Path -LiteralPath $destinationDir)) {
        New-Item -ItemType Directory -Path $destinationDir -Force | Out-Null
    }
    if (-not (Test-Path -LiteralPath $destination)) {
        Copy-Item -LiteralPath $Path -Destination $destination -Force
    }
}

function Write-Utf8([string]$Path, [string]$Content) {
    [System.IO.File]::WriteAllText($Path, $Content, [System.Text.UTF8Encoding]::new($false))
}

# 1. Verify project root.
Require-File "package.json" | Out-Null

# 2. Locate the actual RepresentationProvider/Toggle architecture.
$srcRoot = Join-Path $projectRoot "src"
$tsFiles = Get-ChildItem -Path $srcRoot -Recurse -File |
    Where-Object { $_.Extension -in ".tsx", ".ts", ".css" }

$representationFiles = @()
$blueprintFiles = @()
$instrumentFiles = @()

foreach ($f in $tsFiles) {
    $s = Read-Text $f.FullName
    if ($s -match "RepresentationProvider|useRepresentation|RepresentationToggle") {
        $representationFiles += $f.FullName
    }
    if ($s -match "isBlueprint|blueprint") {
        $blueprintFiles += $f.FullName
    }
    if ($s -match "EngineeringLab|Instrument") {
        $instrumentFiles += $f.FullName
    }
}

if ($representationFiles.Count -eq 0) {
    Stop-Patch "No existing RepresentationProvider/useRepresentation/RepresentationToggle architecture could be identified."
}

# 3. Verify UI-01 Blueprint token.
$tokensPath = Join-Path $projectRoot "src/styles/tokens.css"
if (-not (Test-Path -LiteralPath $tokensPath -PathType Leaf)) {
    Stop-Patch "src/styles/tokens.css was not found."
}
$tokens = Read-Text $tokensPath
if (-not $tokens.Contains("--color-blueprint")) {
    Stop-Patch "Required --color-blueprint token is missing."
}

# 4. Identify the existing shared Blueprint visual container.
#    The supplied repository's Engineering Lab uses the shared class
#    `.instrument-visual` for the visual surface. We require that it is
#    actually rendered by an instrument and that Blueprint state is exposed
#    through the existing architecture before touching CSS.
$systemsRoot = Join-Path $srcRoot "pages\Systems"
$systemsFiles = @()
if (Test-Path -LiteralPath $systemsRoot -PathType Container) {
    $systemsFiles = Get-ChildItem -Path $systemsRoot -Recurse -File |
        Where-Object { $_.Extension -in ".tsx", ".ts", ".css" } |
        Select-Object -ExpandProperty FullName
}

$instrumentVisualRendered = $false
$blueprintStateRendered = $false
$visualCssPath = $null

foreach ($path in $systemsFiles) {
    $s = Read-Text $path
    if ($s -match 'className\s*=\s*["'']instrument-visual["'']') {
        $instrumentVisualRendered = $true
    }
    if ($s -match 'isBlueprint|useRepresentation\s*\(') {
        $blueprintStateRendered = $true
    }
}

$cssCandidates = Get-ChildItem -Path $srcRoot -Recurse -File -Filter "*.css"
foreach ($f in $cssCandidates) {
    $s = Read-Text $f.FullName
    if ($s -match "\.instrument-visual\s*\{") {
        $visualCssPath = $f.FullName
        break
    }
}

if (-not $instrumentVisualRendered) {
    Stop-Patch "No rendered shared .instrument-visual Blueprint surface was identified in the existing Engineering Lab."
}
if (-not $blueprintStateRendered) {
    Stop-Patch "The Engineering Lab visual surface could not be safely associated with the existing Blueprint representation state."
}
if ($null -eq $visualCssPath) {
    Stop-Patch "No canonical stylesheet for the existing .instrument-visual surface was identified."
}

$visualCss = Read-Text $visualCssPath

# 5. Require a Blueprint-specific selector/class/data state already present
#    in the stylesheet. This prevents the pseudo-element from appearing in
#    Reality mode.
$blueprintSelector = $null
$blueprintPatterns = @(
    "\.instrument-visual\.is-blueprint",
    "\.instrument-visual\.blueprint",
    "\.instrument-visual\[data-blueprint=[""']true[""']\]",
    "\.instrument-visual\[data-representation=[""']blueprint[""']\]",
    "\.instrument-visual:has\("
)

foreach ($pattern in $blueprintPatterns) {
    if ($visualCss -match $pattern) {
        $blueprintSelector = $pattern
        break
    }
}

if ($null -eq $blueprintSelector) {
    Stop-Patch "No existing Blueprint-specific CSS state selector was found for .instrument-visual. Refusing to create an independent representation state."
}

# 6. Idempotency.
$marker = "MECHESA PATCH UI-06"
if ($visualCss.Contains($marker)) {
    Write-Host "PATCH UI-06 ALREADY APPLIED" -ForegroundColor Green
    Write-Host "No duplicate changes were made."
    exit 0
}

# 7. Identify the exact `.instrument-visual` declaration to ensure it is
#    positioned for a pseudo-element without broadly rewriting the stylesheet.
$visualBlockMatch = [regex]::Match(
    $visualCss,
    '(?ms)(\.instrument-visual\s*\{)([^{}]*)(\})'
)

if (-not $visualBlockMatch.Success) {
    Stop-Patch "The existing .instrument-visual CSS declaration could not be parsed safely."
}

$visualBlock = $visualBlockMatch.Value
$visualBody = $visualBlockMatch.Groups[2].Value

# Add only position:relative if the existing block lacks positioning.
$newVisualBlock = $visualBlock
if ($visualBody -notmatch "(^|[;{\s])position\s*:") {
    $newBody = " position: relative;" + $visualBody
    $newVisualBlock = $visualBlockMatch.Groups[1].Value + $newBody + $visualBlockMatch.Groups[3].Value
}

# 8. Build a shared Blueprint-only pseudo-element. It is attached to the
#    existing visual surface and cannot intercept pointer input.
$scanBlock = @"
/* MECHESA PATCH UI-06 - Blueprint analysis scan-line */
.instrument-visual.is-blueprint::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: -12%;
  height: 1px;
  pointer-events: none;
  z-index: 2;
  background: color-mix(in srgb, var(--color-blueprint) 58%, transparent);
  box-shadow: 0 0 8px color-mix(in srgb, var(--color-blueprint) 16%, transparent);
  opacity: .34;
  transform: translate3d(0, -20%, 0);
  animation: blueprint-analysis-scan 11s linear infinite;
  will-change: transform, opacity;
}

@keyframes blueprint-analysis-scan {
  0% {
    transform: translate3d(0, -20%, 0);
    opacity: .12;
  }
  8% {
    opacity: .34;
  }
  92% {
    opacity: .34;
  }
  100% {
    transform: translate3d(0, 118%, 0);
    opacity: .12;
  }
}

@media (max-width: 720px) {
  .instrument-visual.is-blueprint::after {
    opacity: .25;
    animation-duration: 12.5s;
  }
}

@media (prefers-reduced-motion: reduce) {
  .instrument-visual.is-blueprint::after {
    animation: none;
    top: 50%;
    transform: translate3d(0, 0, 0);
    opacity: .18;
  }
}
"@

# 9. The repository may use a different concrete Blueprint class than the
#    canonical `.is-blueprint` selector. We only proceed if JSX actually
#    emits that class; otherwise fail rather than create a mismatch.
$hasConcreteBlueprintClass = $false
foreach ($path in $systemsFiles) {
    $s = Read-Text $path
    if ($s -match 'className[^\\r\\n]*is-blueprint') {
        $hasConcreteBlueprintClass = $true
        break
    }
}
if (-not $hasConcreteBlueprintClass) {
    Stop-Patch "The stylesheet has a Blueprint selector, but no existing JSX emission of 'is-blueprint' was verified. Refusing to invent representation state."
}

# 10. Narrowly update the existing visual block and append the scan CSS.
$updatedCss = $visualCss.Replace($visualBlock, $newVisualBlock)
$updatedCss = $updatedCss.TrimEnd() + "`r`n`r`n" + $scanBlock.Trim() + "`r`n"

if ($updatedCss -eq $visualCss) {
    Stop-Patch "No safe CSS change was produced."
}

# 11. Backup only the file that will be changed.
$relativeCss = $visualCssPath.Substring($projectRoot.Length).TrimStart("\")
Backup-Once $visualCssPath $relativeCss

# 12. Write and verify.
Write-Utf8 $visualCssPath $updatedCss
$written = Read-Text $visualCssPath

foreach ($needle in @(
    "MECHESA PATCH UI-06",
    ".instrument-visual.is-blueprint::after",
    "@keyframes blueprint-analysis-scan",
    "pointer-events: none",
    "prefers-reduced-motion"
)) {
    if (-not $written.Contains($needle)) {
        Stop-Patch "Post-write verification failed: '$needle' was not found."
    }
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor DarkGray
Write-Host "MECHESA PATCH UI-06 COMPLETE" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor DarkGray
Write-Host ""
Write-Host "Blueprint container: .instrument-visual (existing shared Engineering Lab visual surface)" -ForegroundColor Cyan
Write-Host "Scan-line: CSS pseudo-element, Blueprint-only, 11s traversal" -ForegroundColor Cyan
Write-Host "Reality mode: unaffected" -ForegroundColor Cyan
Write-Host "Reduced motion: static faint analysis line" -ForegroundColor Cyan
Write-Host "Mobile: reduced opacity / slower traversal" -ForegroundColor Cyan
Write-Host "Files modified: 1" -ForegroundColor Cyan
Write-Host " - $relativeCss"
Write-Host ""
Write-Host "Backups: .patch-backups\PATCH_UI_06\"
Write-Host "Dependencies added: 0"
Write-Host ""
Write-Host "Next step:"
Write-Host "Run:"
Write-Host ""
Write-Host "npm run build" -ForegroundColor Yellow
Write-Host ""

# MECHESA // PATCH UI-06 FIXED v2
# BLUEPRINT ANALYSIS SCAN-LINE
# Run from repository root:
# powershell -ExecutionPolicy Bypass -File .\MECHESA_PATCH_UI_06_FIXED_v2.ps1

$ErrorActionPreference = "Stop"
$projectRoot = (Get-Location).Path
$labRoot = Join-Path $projectRoot "src\components\home\EngineeringLab"
$labCssPath = Join-Path $labRoot "engineeringLab.css"
$backupDir = Join-Path $projectRoot ".patch-backups\PATCH_UI_06"

function Stop-Patch([string]$Message) {
    Write-Host ""
    Write-Host "PATCH UI-06 STOPPED SAFELY" -ForegroundColor Red
    Write-Host $Message -ForegroundColor Red
    Write-Host "No source files were modified." -ForegroundColor Yellow
    exit 1
}

function Require-File([string]$RelativePath) {
    $p = Join-Path $projectRoot $RelativePath
    if (-not (Test-Path -LiteralPath $p -PathType Leaf)) {
        Stop-Patch "Required file not found: $RelativePath"
    }
    return $p
}

function Read-Text([string]$Path) {
    return [System.IO.File]::ReadAllText($Path)
}

Require-File "package.json" | Out-Null
Require-File "src/styles/tokens.css" | Out-Null
Require-File "src/components/home/EngineeringLab/EngineeringLab.tsx" | Out-Null
Require-File "src/components/home/EngineeringLab/engineeringLab.css" | Out-Null

$tokens = Read-Text (Join-Path $projectRoot "src\styles\tokens.css")
$labCss = Read-Text $labCssPath
$labFiles = Get-ChildItem -LiteralPath $labRoot -Filter *.tsx -File

if (-not $tokens.Contains("--color-blueprint")) {
    Stop-Patch "Required --color-blueprint token is missing."
}

$allLabTsx = ($labFiles | ForEach-Object { Read-Text $_.FullName }) -join "`n"

if ($allLabTsx -notmatch "useRepresentation") {
    Stop-Patch "Existing Engineering Lab representation architecture could not be verified."
}
if ($allLabTsx -notmatch "isBlueprint") {
    Stop-Patch "Existing Blueprint representation state could not be verified."
}

# IMPORTANT:
# The instrument visual classes live in their individual child instrument
# components, not in EngineeringLab.tsx itself. The previous patch incorrectly
# searched only the parent component and therefore stopped safely.
$visualClasses = @(
    "thermo-instrument__visual",
    "fluid-instrument__visual",
    "manufacturing-instrument__visual",
    "robotics-instrument__visual",
    "mechanical-systems-instrument__visual"
)

foreach ($className in $visualClasses) {
    if ($allLabTsx -notmatch [regex]::Escape($className)) {
        Stop-Patch "Expected rendered Engineering Lab surface not found in EngineeringLab components: .$className"
    }
    if ($labCss -notmatch ("\." + [regex]::Escape($className) + "\s*\{")) {
        Stop-Patch "Expected canonical CSS surface not found: .$className"
    }
}

$marker = "MECHESA PATCH UI-06"
if ($labCss.Contains($marker)) {
    Write-Host ""
    Write-Host "PATCH UI-06 ALREADY APPLIED" -ForegroundColor Green
    Write-Host "No duplicate changes were made."
    exit 0
}

$scanBlock = @'
/* MECHESA PATCH UI-06 - Blueprint analysis scan-line */
.engineering-lab.is-blueprint .thermo-instrument__visual,
.engineering-lab.is-blueprint .fluid-instrument__visual,
.engineering-lab.is-blueprint .manufacturing-instrument__visual,
.engineering-lab.is-blueprint .robotics-instrument__visual,
.engineering-lab.is-blueprint .mechanical-systems-instrument__visual {
  position: relative;
  overflow: hidden;
}

.engineering-lab.is-blueprint .thermo-instrument__visual::after,
.engineering-lab.is-blueprint .fluid-instrument__visual::after,
.engineering-lab.is-blueprint .manufacturing-instrument__visual::after,
.engineering-lab.is-blueprint .robotics-instrument__visual::after,
.engineering-lab.is-blueprint .mechanical-systems-instrument__visual::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: -8%;
  height: 1px;
  pointer-events: none;
  z-index: 4;
  background: color-mix(in srgb, var(--color-blueprint) 62%, transparent);
  box-shadow: 0 0 8px color-mix(in srgb, var(--color-blueprint) 14%, transparent);
  opacity: .34;
  transform: translate3d(0, -20%, 0);
  animation: mechesa-blueprint-analysis-scan 11s linear infinite;
  will-change: transform, opacity;
}

@keyframes mechesa-blueprint-analysis-scan {
  0% {
    transform: translate3d(0, -20%, 0);
    opacity: .10;
  }
  8% {
    opacity: .34;
  }
  92% {
    opacity: .34;
  }
  100% {
    transform: translate3d(0, 118%, 0);
    opacity: .10;
  }
}

@media (max-width: 720px) {
  .engineering-lab.is-blueprint .thermo-instrument__visual::after,
  .engineering-lab.is-blueprint .fluid-instrument__visual::after,
  .engineering-lab.is-blueprint .manufacturing-instrument__visual::after,
  .engineering-lab.is-blueprint .robotics-instrument__visual::after,
  .engineering-lab.is-blueprint .mechanical-systems-instrument__visual::after {
    opacity: .25;
    animation-duration: 12.5s;
  }
}

@media (prefers-reduced-motion: reduce) {
  .engineering-lab.is-blueprint .thermo-instrument__visual::after,
  .engineering-lab.is-blueprint .fluid-instrument__visual::after,
  .engineering-lab.is-blueprint .manufacturing-instrument__visual::after,
  .engineering-lab.is-blueprint .robotics-instrument__visual::after,
  .engineering-lab.is-blueprint .mechanical-systems-instrument__visual::after {
    animation: none;
    top: 50%;
    transform: translate3d(0, 0, 0);
    opacity: .16;
  }
}
'@

$destination = Join-Path $backupDir "src\components\home\EngineeringLab\engineeringLab.css"
New-Item -ItemType Directory -Path (Split-Path -Parent $destination) -Force | Out-Null
if (-not (Test-Path -LiteralPath $destination)) {
    Copy-Item -LiteralPath $labCssPath -Destination $destination -Force
}

[System.IO.File]::WriteAllText(
    $labCssPath,
    ((Read-Text $labCssPath).TrimEnd() + "`r`n`r`n" + $scanBlock.Trim() + "`r`n"),
    [System.Text.UTF8Encoding]::new($false)
)

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "MECHESA PATCH UI-06 COMPLETE" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Blueprint analysis scan-line: ADDED"
Write-Host "Target: existing Engineering Lab instrument visuals"
Write-Host "Representation state: REUSED — existing isBlueprint state"
Write-Host "Animation: CSS-only — 11s linear traversal"
Write-Host "Reduced motion: SUPPORTED"
Write-Host "Files modified: 1"
Write-Host " - src/components/home/EngineeringLab/engineeringLab.css"
Write-Host ""
Write-Host "Backups: .patch-backups\PATCH_UI_06\"
Write-Host "Dependencies added: 0"
Write-Host "Routes/features changed: 0"
Write-Host ""
Write-Host "Next step:"
Write-Host "npm run build"

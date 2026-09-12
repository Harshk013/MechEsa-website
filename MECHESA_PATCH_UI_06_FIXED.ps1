# MECHESA // PART 2 // PATCH UI-06
# BLUEPRINT ANALYSIS SCAN-LINE
#
# Run from repository root:
# powershell -ExecutionPolicy Bypass -File .\MECHESA_PATCH_UI_06.ps1

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

Require-File "package.json" | Out-Null

$labRoot = Join-Path $projectRoot "src\components\home\EngineeringLab"
$labTsxPath = Join-Path $labRoot "EngineeringLab.tsx"
$labCssPath = Join-Path $labRoot "engineeringLab.css"

if (-not (Test-Path -LiteralPath $labRoot -PathType Container)) {
    Stop-Patch "Existing Engineering Lab directory was not found."
}

Require-File "src/components/home/EngineeringLab/EngineeringLab.tsx" | Out-Null
Require-File "src/components/home/EngineeringLab/engineeringLab.css" | Out-Null
Require-File "src/styles/tokens.css" | Out-Null

$labTsx = Read-Text $labTsxPath
$labCss = Read-Text $labCssPath
$tokens = Read-Text (Join-Path $projectRoot "src\styles\tokens.css")

if (-not $tokens.Contains("--color-blueprint")) {
    Stop-Patch "Required --color-blueprint token is missing."
}

if ($labTsx -notmatch "useRepresentation") {
    Stop-Patch "EngineeringLab is not connected to the existing useRepresentation architecture."
}

if ($labTsx -notmatch "isBlueprint") {
    Stop-Patch "EngineeringLab does not expose the existing Blueprint representation state."
}

# These are the actual visual surfaces in the current Engineering Lab.
$visualClasses = @(
    "thermo-instrument__visual",
    "fluid-instrument__visual",
    "manufacturing-instrument__visual",
    "robotics-instrument__visual",
    "mechanical-systems-instrument__visual"
)

foreach ($className in $visualClasses) {
    if ($labTsx -notmatch [regex]::Escape($className)) {
        Stop-Patch "Expected rendered Engineering Lab surface not found: .$className"
    }
    if ($labCss -notmatch ("\." + [regex]::Escape($className) + "\s*\{")) {
        Stop-Patch "Expected canonical CSS surface not found: .$className"
    }
}

# The parent already carries the existing Blueprint state.
if ($labTsx -notmatch "engineering-lab") {
    Stop-Patch "Existing Engineering Lab wrapper could not be identified."
}
if ($labTsx -notmatch "is-blueprint") {
    Stop-Patch "Existing Engineering Lab Blueprint wrapper state could not be identified."
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

Backup-Once $labCssPath "src/components/home/EngineeringLab/engineeringLab.css"
Write-Utf8 $labCssPath ((Read-Text $labCssPath).TrimEnd() + "`r`n`r`n" + $scanBlock.Trim() + "`r`n")

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "MECHESA PATCH UI-06 COMPLETE" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Blueprint analysis scan-line: ADDED — existing Engineering Lab visuals"
Write-Host "Representation state: REUSED — no independent Blueprint state"
Write-Host "Animation: CSS-only — 11s linear vertical traversal"
Write-Host "Reduced motion: SUPPORTED — static faint analysis line"
Write-Host "Files modified: 1"
Write-Host " - src/components/home/EngineeringLab/engineeringLab.css"
Write-Host ""
Write-Host "Backups: .patch-backups\PATCH_UI_06\"
Write-Host "Dependencies added: 0"
Write-Host "Routes/features changed: 0"
Write-Host ""
Write-Host "Next step:"
Write-Host "Run:"
Write-Host ""
Write-Host "npm run build"

# MECHESA // PART 2 // PATCH UI-05
# SITE-WIDE AMBIENT ENGINEERING ENVIRONMENT
#
# Run from repository root:
# powershell -ExecutionPolicy Bypass -File .\MECHESA_PATCH_UI_05.ps1
#
# This patch reuses the repository's existing AmbientEnvironment. It adds
# CSS-only atmospheric and grid layers; it does not add a new component,
# animation library, route, canvas, particle engine, or animation loop.

$ErrorActionPreference = "Stop"

$projectRoot = (Get-Location).Path
$backupDir = Join-Path $projectRoot ".patch-backups\PATCH_UI_05"

function Stop-Patch([string]$Message) {
    Write-Host ""
    Write-Host "PATCH UI-05 STOPPED SAFELY" -ForegroundColor Red
    Write-Host $Message -ForegroundColor Red
    Write-Host "No source files were modified by this run." -ForegroundColor Yellow
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
    [System.IO.File]::WriteAllText(
        $Path,
        $Content,
        [System.Text.UTF8Encoding]::new($false)
    )
}

# 1. Verify repository root and canonical files.
Require-File "package.json" | Out-Null
$globalsPath = Require-File "src/styles/globals.css"
$ambientPath = Require-File "src/components/ambient/AmbientEnvironment.tsx"
$tokensPath = Require-File "src/styles/tokens.css"
$engineeringGridPath = Require-File "src/components/mechanical/EngineeringGrid.tsx"

# 2. Verify UI-01/UI-02 token architecture needed by the ambient system.
$tokens = Read-Text $tokensPath
foreach ($token in @("--color-bg", "--color-bg-deep", "--color-blueprint", "--color-signal", "--z-background")) {
    if (-not $tokens.Contains($token)) {
        Stop-Patch "Required design token '$token' is missing."
    }
}

# 3. Inspect and reuse the existing global ambient architecture.
$globals = Read-Text $globalsPath
$ambient = Read-Text $ambientPath
$grid = Read-Text $engineeringGridPath

if (-not $ambient.Contains('className="ambient-environment"')) {
    Stop-Patch "Existing AmbientEnvironment component could not be verified."
}
if (-not $ambient.Contains('ambient-environment__light')) {
    Stop-Patch "Existing ambient light layer could not be verified."
}
if (-not $ambient.Contains('ambient-environment__grid')) {
    Stop-Patch "Existing EngineeringGrid ambient layer could not be verified."
}
if (-not $grid.Contains("className")) {
    Stop-Patch "EngineeringGrid implementation could not be verified."
}
if (-not $globals.Contains(".ambient-environment")) {
    Stop-Patch "Canonical global ambient CSS implementation could not be located."
}

# 4. Confirm the ambient layer is already mounted globally. We only enhance it.
$appPath = Require-File "src/app/App.tsx"
$app = Read-Text $appPath
if (-not $app.Contains("<AmbientEnvironment />")) {
    Stop-Patch "AmbientEnvironment is not mounted in the application root; refusing to create a duplicate global environment."
}

# 5. Idempotency.
$marker = "MECHESA PATCH UI-05"
if ($globals.Contains($marker)) {
    Write-Host "PATCH UI-05 ALREADY APPLIED" -ForegroundColor Green
    Write-Host "No duplicate changes were made."
    exit 0
}

# 6. Do not modify the existing AmbientEnvironment.tsx. Its pointer-driven
#    light is existing teammate functionality. UI-05 adds no new JS loop.
#    We only need the global stylesheet.
#
# 7. Narrow insertion anchor: immediately after the existing ambient marks.
$anchor = ".ambient-environment__mark--br { right: 20px; bottom: 18px; }"
if (-not $globals.Contains($anchor)) {
    Stop-Patch "The expected ambient CSS anchor was not found. Refusing a broad global stylesheet replacement."
}

$patchBlock = @"
/* MECHESA PATCH UI-05 - site-wide ambient engineering environment */
.ambient-environment::before {
  content: '';
  position: absolute;
  inset: -18%;
  pointer-events: none;
  z-index: 0;
  background:
    radial-gradient(circle at 34% 24%, color-mix(in srgb, var(--color-blueprint) 3.2%, transparent) 0%, transparent 28%),
    radial-gradient(circle at 78% 76%, color-mix(in srgb, var(--color-signal) 1.6%, transparent) 0%, transparent 24%);
  opacity: .9;
  transform: translate3d(0, 0, 0) scale(1);
  animation: ambient-engineering-drift 52s ease-in-out infinite alternate;
  will-change: transform;
}

.ambient-environment::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  opacity: .12;
  background-image:
    repeating-linear-gradient(
      90deg,
      transparent 0,
      transparent 95px,
      color-mix(in srgb, var(--color-blueprint) 8%, transparent) 96px,
      transparent 97px
    ),
    repeating-linear-gradient(
      0deg,
      transparent 0,
      transparent 95px,
      color-mix(in srgb, var(--color-blueprint) 8%, transparent) 96px,
      transparent 97px
    );
  background-position: 0 0, 0 0;
  animation: ambient-engineering-grid-drift 44s linear infinite;
}

.ambient-environment__light {
  z-index: 2;
}

.ambient-environment__grid {
  z-index: 3;
}

.ambient-environment__mark {
  z-index: 4;
}

@keyframes ambient-engineering-drift {
  0% {
    transform: translate3d(-1.2%, -0.6%, 0) scale(1);
  }
  50% {
    transform: translate3d(.6%, .4%, 0) scale(1.018);
  }
  100% {
    transform: translate3d(1.2%, .8%, 0) scale(1.035);
  }
}

@keyframes ambient-engineering-grid-drift {
  from {
    background-position: 0 0, 0 0;
  }
  to {
    background-position: 96px 48px, 48px 96px;
  }
}

@media (max-width: 720px) {
  .ambient-environment::before {
    inset: -28%;
    opacity: .68;
  }

  .ambient-environment::after {
    opacity: .075;
  }
}

@media (max-width: 480px) {
  .ambient-environment::before {
    opacity: .55;
  }

  .ambient-environment::after {
    opacity: .055;
    background-size: 128px 128px, 128px 128px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ambient-environment::before {
    animation: none;
    transform: none;
  }

  .ambient-environment::after {
    animation: none;
    background-position: 0 0, 0 0;
  }
}
"@

# 8. Backup immediately before the only source modification.
Backup-Once $globalsPath "src/styles/globals.css"

# 9. Apply one narrow insertion. No other source file is changed.
$newGlobals = $globals.Replace($anchor, $anchor + "`r`n" + $patchBlock)
if ($newGlobals -eq $globals) {
    Stop-Patch "Global stylesheet did not change after the exact ambient insertion."
}

Write-Utf8 $globalsPath $newGlobals

# 10. Post-write verification.
$written = Read-Text $globalsPath
foreach ($needle in @(
    "MECHESA PATCH UI-05",
    "ambient-engineering-drift",
    "ambient-engineering-grid-drift",
    ".ambient-environment::before",
    ".ambient-environment::after",
    "@media (prefers-reduced-motion: reduce)"
)) {
    if (-not $written.Contains($needle)) {
        Stop-Patch "Post-write verification failed: '$needle' was not found."
    }
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor DarkGray
Write-Host "MECHESA PATCH UI-05 COMPLETE" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor DarkGray
Write-Host ""
Write-Host "Ambient environment: ENHANCED — CSS-only slow blueprint/amber atmosphere" -ForegroundColor Cyan
Write-Host "Engineering grid: ADDED — very faint drifting technical grid" -ForegroundColor Cyan
Write-Host "Particles: SKIPPED — no new particle engine introduced" -ForegroundColor Cyan
Write-Host "Reduced motion: SUPPORTED — drift/grid movement disabled" -ForegroundColor Cyan
Write-Host "Files modified: 1" -ForegroundColor Cyan
Write-Host " - src/styles/globals.css"
Write-Host ""
Write-Host "Backups: .patch-backups\PATCH_UI_05\"
Write-Host "Dependencies added: 0"
Write-Host "Routes/features changed: 0"
Write-Host ""
Write-Host "Next step:"
Write-Host "Run:"
Write-Host ""
Write-Host "npm run build" -ForegroundColor Yellow
Write-Host ""

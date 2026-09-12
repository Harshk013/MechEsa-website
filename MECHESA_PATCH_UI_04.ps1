# MECHESA // PART 2 // PATCH UI-04
# HERO ATMOSPHERE + MECHANICAL CORE WARMTH
#
# Run from repository root:
# powershell -ExecutionPolicy Bypass -File .\MECHESA_PATCH_UI_04.ps1
#
# This patch is intentionally targeted and idempotent. It modifies only:
#   src/pages/Home/home.css
#   src/components/home/MechanicalCoreStage.tsx
#   src/components/home/MechanicalCoreStage/mechanicalCore.css
#
# No dependencies, routes, calculations, interaction logic, or scroll systems
# are changed.

$ErrorActionPreference = "Stop"

$projectRoot = (Get-Location).Path

function Stop-Patch([string]$Message) {
    Write-Host ""
    Write-Host "PATCH UI-04 STOPPED SAFELY" -ForegroundColor Red
    Write-Host $Message -ForegroundColor Red
    Write-Host "No source files were modified by this run." -ForegroundColor Yellow
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

# 1. Verify project root and canonical files.
Require-File "package.json" | Out-Null
$homeCssPath = Require-File "src/pages/Home/home.css"
$coreTsxPath = Require-File "src/components/home/MechanicalCoreStage.tsx"
$coreCssPath = Require-File "src/components/home/MechanicalCoreStage/mechanicalCore.css"
$tokensPath = Require-File "src/styles/tokens.css"

# 2. Verify UI-01 tokens.
$tokens = Read-Text $tokensPath
foreach ($token in @("--color-signal", "--color-signal-glow", "--color-blueprint")) {
    if (-not $tokens.Contains($token)) {
        Stop-Patch "Required PATCH UI-01 token '$token' is missing."
    }
}

# 3. Verify actual hero architecture.
$homeCss = Read-Text $homeCssPath
$coreTsx = Read-Text $coreTsxPath
$coreCss = Read-Text $coreCssPath

if (-not $homeCss.Contains(".home-hero")) {
    Stop-Patch "The current homepage stylesheet does not contain .home-hero."
}
if (-not $homeCss.Contains(".home-hero__atmosphere")) {
    Stop-Patch "The current homepage stylesheet does not contain .home-hero__atmosphere."
}
if (-not $coreTsx.Contains("MechanicalCoreScene")) {
    Stop-Patch "MechanicalCoreStage.tsx does not match the expected existing Mechanical Core architecture."
}
if (-not $coreTsx.Contains('className="core-stage__canvas-wrap"')) {
    Stop-Patch "The existing Mechanical Core canvas wrapper was not found."
}
if (-not $coreCss.Contains(".core-stage__canvas-wrap")) {
    Stop-Patch "The Mechanical Core stylesheet does not contain .core-stage__canvas-wrap."
}

# 4. Idempotency: if this exact patch marker is already present in all
#    target areas, exit successfully without creating duplicate CSS/markup.
$marker = "MECHESA PATCH UI-04"
if ($homeCss.Contains($marker) -and $coreTsx.Contains($marker) -and $coreCss.Contains($marker)) {
    Write-Host "PATCH UI-04 ALREADY APPLIED" -ForegroundColor Green
    Write-Host "No source changes required."
    exit 0
}

# 5. Refuse to patch a partially-applied state; this avoids duplicate or
#    ambiguous modifications after a manually edited/partial run.
$partialMarkers = @(
    "home-hero__atmosphere::after",
    "core-stage__signal--blue",
    "core-stage__signal--amber",
    "core-stage__signal"
)
$partialFound = $false
foreach ($p in $partialMarkers) {
    if ($homeCss.Contains($p) -or $coreTsx.Contains($p) -or $coreCss.Contains($p)) {
        $partialFound = $true
    }
}
if ($partialFound) {
    Stop-Patch "A partial UI-04 implementation appears to exist. Review the target files manually before rerunning."
}

# 6. Exact anchors. These are deliberately narrow to preserve teammate work.
$homeAnchor = ".home-hero__atmosphere{position:absolute;inset:0;background:radial-gradient(circle at 50% 44%,rgba(201,208,211,.08),transparent 30%),radial-gradient(circle at 20% 30%,rgba(130,169,199,.045),transparent 28%);pointer-events:none}"
$homeReplacement = @"
$homeAnchor
/* MECHESA PATCH UI-04 - warm workshop atmosphere */
.home-hero__atmosphere::after{content:'';position:absolute;inset:-18%;pointer-events:none;background:radial-gradient(circle at 78% 82%,color-mix(in srgb,var(--color-signal) 3%,transparent),transparent 24%);opacity:.95;transform:translate3d(0,0,0);animation:home-warm-worklight 16s ease-in-out infinite alternate;will-change:transform}
@keyframes home-warm-worklight{from{transform:translate3d(-1.5%,-1%,0) scale(1)}to{transform:translate3d(1.5%,1%,0) scale(1.035)}}
"@

if (-not $homeCss.Contains($homeAnchor)) {
    Stop-Patch "The expected exact .home-hero__atmosphere declaration was not found; refusing a broad replacement."
}

$coreAnchor = '<BlueprintMachineOverlay />'
$coreReplacement = @"
<BlueprintMachineOverlay />
        {/* MECHESA PATCH UI-04 - restrained blueprint/amber core signal layers */}
        <div className="core-stage__signal core-stage__signal--blue" aria-hidden="true" />
        <div className="core-stage__signal core-stage__signal--amber" aria-hidden="true" />
"@

if (-not $coreTsx.Contains($coreAnchor)) {
    Stop-Patch "The MechanicalCoreStage BlueprintMachineOverlay anchor was not found."
}

$coreCssAnchor = ".core-stage__canvas-wrap { position: absolute; inset: 0; overflow: hidden; border: 1px solid color-mix(in srgb, var(--color-border-strong) 72%, transparent); background: radial-gradient(circle at 50% 48%, rgba(201,208,211,.065), transparent 50%); box-shadow: inset 0 0 90px rgba(0,0,0,.3); }"
$coreCssReplacement = @"
$coreCssAnchor
/* MECHESA PATCH UI-04 - mechanical core warmth */
.core-stage__signal{position:absolute;inset:0;z-index:2;pointer-events:none;mix-blend-mode:screen}
.core-stage__signal--blue{background:radial-gradient(circle at 50% 50%,color-mix(in srgb,var(--color-blueprint) 7%,transparent) 0%,transparent 19%);opacity:.75;animation:core-signal-blue 12s ease-in-out infinite}
.core-stage__signal--amber{background:radial-gradient(circle at 50% 50%,color-mix(in srgb,var(--color-signal) 5%,transparent) 0%,transparent 17%);opacity:.16;animation:core-signal-amber 12s ease-in-out infinite}
@keyframes core-signal-blue{0%,100%{opacity:.72}50%{opacity:.42}}
@keyframes core-signal-amber{0%,100%{opacity:.12}50%{opacity:.34}}
.core-stage__canvas-wrap[data-representation="blueprint"] .core-stage__signal--amber{opacity:.06}
"@

if (-not $coreCss.Contains($coreCssAnchor)) {
    Stop-Patch "The expected exact .core-stage__canvas-wrap declaration was not found; refusing a broad replacement."
}

$coreCssReducedMotion = "@media (prefers-reduced-motion: reduce) { .core-stage__scanline { display: none; } .core-stage__engage { transition: none; } }"
$coreCssReducedMotionReplacement = @"
@media (prefers-reduced-motion: reduce) {
  .core-stage__scanline { display: none; }
  .core-stage__engage { transition: none; }
  .core-stage__signal--blue { animation: none; opacity: .58; }
  .core-stage__signal--amber { animation: none; opacity: .16; }
}
"@

if (-not $coreCss.Contains($coreCssReducedMotion)) {
    Stop-Patch "The expected reduced-motion block was not found; refusing to alter the existing motion architecture."
}

# 7. Home reduced-motion: preserve warm atmosphere, remove only its motion.
$homeReducedMotionAnchor = "@media (prefers-reduced-motion:reduce){.home-section[data-motion] .home-section-header__meta,.home-section[data-motion] .home-section-header__title,.home-section[data-motion] .home-section-header__description{animation:none;clip-path:none;transform:none;opacity:1}"
if (-not $homeCss.Contains($homeReducedMotionAnchor)) {
    Stop-Patch "The expected homepage reduced-motion block was not found."
}

$homeReducedMotionReplacement = $homeReducedMotionAnchor + ".home-hero__atmosphere::after{animation:none;transform:none}"

# 8. Create backups only after all validation has passed.
$backupDir = Join-Path $projectRoot ".patch-backups\PATCH_UI_04"
Backup-Once $homeCssPath "src/pages/Home/home.css"
Backup-Once $coreTsxPath "src/components/home/MechanicalCoreStage.tsx"
Backup-Once $coreCssPath "src/components/home/MechanicalCoreStage/mechanicalCore.css"

$changed = New-Object System.Collections.Generic.List[string]

# 9. Apply exact targeted changes.
$newHomeCss = $homeCss.Replace($homeAnchor, $homeReplacement)
$newHomeCss = $newHomeCss.Replace($homeReducedMotionAnchor, $homeReducedMotionReplacement)
if ($newHomeCss -eq $homeCss) {
    Stop-Patch "Homepage CSS did not change after exact targeted replacements."
}

$newCoreTsx = $coreTsx.Replace($coreAnchor, $coreReplacement)
if ($newCoreTsx -eq $coreTsx) {
    Stop-Patch "MechanicalCoreStage.tsx did not change after the exact targeted replacement."
}

$newCoreCss = $coreCss.Replace($coreCssAnchor, $coreCssReplacement)
$newCoreCss = $newCoreCss.Replace($coreCssReducedMotion, $coreCssReducedMotionReplacement)
if ($newCoreCss -eq $coreCss) {
    Stop-Patch "Mechanical Core CSS did not change after exact targeted replacements."
}

# 10. Write atomically enough for normal local patch use.
Write-Utf8 $homeCssPath $newHomeCss
$changed.Add("src/pages/Home/home.css")

Write-Utf8 $coreTsxPath $newCoreTsx
$changed.Add("src/components/home/MechanicalCoreStage.tsx")

Write-Utf8 $coreCssPath $newCoreCss
$changed.Add("src/components/home/MechanicalCoreStage/mechanicalCore.css")

# 11. Verify markers and required tokens after writing.
foreach ($path in @($homeCssPath, $coreTsxPath, $coreCssPath)) {
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) {
        Stop-Patch "A modified file could not be verified after writing: $path"
    }
}

if (-not (Read-Text $homeCssPath).Contains("MECHESA PATCH UI-04")) {
    Stop-Patch "Post-write verification failed for homepage CSS."
}
if (-not (Read-Text $coreTsxPath).Contains("MECHESA PATCH UI-04")) {
    Stop-Patch "Post-write verification failed for MechanicalCoreStage.tsx."
}
if (-not (Read-Text $coreCssPath).Contains("MECHESA PATCH UI-04")) {
    Stop-Patch "Post-write verification failed for Mechanical Core CSS."
}

Write-Host ""
Write-Host "PATCH UI-04 APPLIED" -ForegroundColor Green
Write-Host ""
Write-Host "Changed files:" -ForegroundColor Cyan
foreach ($file in $changed) {
    Write-Host " - $file"
}
Write-Host ""
Write-Host "Backups:" -ForegroundColor Cyan
Write-Host " - .patch-backups\PATCH_UI_04\"
Write-Host ""
Write-Host "No dependencies added."
Write-Host "No routes, calculations, pointer logic, scroll choreography, or existing Mechanical Core geometry were changed."
Write-Host ""
Write-Host "Next validation:"
Write-Host "npm run build"

$ErrorActionPreference = "Stop"

# MECHESA // PART 2 // PATCH UI-02
# COMPONENT INTERACTION + SEMANTIC COLOR
# Windows PowerShell 5.1 safe: UTF-8 with BOM / ASCII source.
#
# Run from the existing repository root:
# powershell -ExecutionPolicy Bypass -File .\MECHESA_PATCH_UI_02_FIXED.ps1

$projectRoot = (Get-Location).Path
$backupDir = Join-Path $projectRoot ".patch-backups\PATCH_UI_02"

function Stop-Patch([string]$Message) {
    Write-Host ""
    Write-Host "PATCH FAILED:" -ForegroundColor Red
    Write-Host $Message -ForegroundColor Red
    Write-Host "No files were modified." -ForegroundColor Yellow
    exit 1
}

function Require-File([string]$RelativePath) {
    $path = Join-Path $projectRoot $RelativePath
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) {
        Stop-Patch "Required file not found: $RelativePath"
    }
    return $path
}

function Read-Utf8([string]$Path) {
    return [System.IO.File]::ReadAllText($Path)
}

function Write-Utf8([string]$Path, [string]$Content) {
    [System.IO.File]::WriteAllText($Path, $Content, [System.Text.UTF8Encoding]::new($false))
}

function Backup-IfNeeded([string]$Path, [string]$RelativeBackupName) {
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    $destination = Join-Path $backupDir $RelativeBackupName
    Copy-Item -LiteralPath $Path -Destination $destination -Force
}

function Append-Once([string]$Content, [string]$Marker, [string]$Block) {
    if ($Content.Contains($Marker)) {
        return $Content
    }
    return $Content.TrimEnd() + "`r`n`r`n" + $Block.Trim() + "`r`n"
}

function Replace-ExactOnce([string]$Content, [string]$Old, [string]$New, [string]$Description) {
    $count = [regex]::Matches($Content, [regex]::Escape($Old)).Count
    if ($count -eq 0) {
        Stop-Patch "Expected source pattern was not found for $Description. No files were modified."
    }
    if ($count -gt 1) {
        Stop-Patch "Expected source pattern for $Description occurred $count times. Refusing an unsafe broad replacement."
    }
    return $Content.Replace($Old, $New)
}

# ---------------------------------------------------------------------------
# 1. Verify repository + PATCH UI-01 tokens.
# ---------------------------------------------------------------------------

Require-File "package.json" | Out-Null
$tokensPath = Require-File "src/styles/tokens.css"
$tokens = Read-Utf8 $tokensPath

$requiredTokens = @(
    "--color-signal",
    "--color-signal-soft",
    "--color-signal-glow",
    "--color-blueprint",
    "--sys-design",
    "--sys-materials",
    "--sys-manufacturing",
    "--sys-mechatronics",
    "--sys-robotics",
    "--sys-automotive",
    "--sys-thermodynamics",
    "--sys-fluid"
)

foreach ($token in $requiredTokens) {
    if (-not $tokens.Contains($token)) {
        Stop-Patch "PATCH UI-01 token '$token' is missing. Apply PATCH UI-01 before PATCH UI-02."
    }
}

# ---------------------------------------------------------------------------
# 2. Locate actual current files from the inspected repository.
# ---------------------------------------------------------------------------

$buttonCssPath = Require-File "src/components/mechanical/mechanical.css"
$indicatorCssPath = $buttonCssPath
$navCssPath = Require-File "src/styles/globals.css"
$footerCssPath = Require-File "src/components/navigation/siteFooter.css"
$homePagePath = Require-File "src/pages/Home/HomePage.tsx"
$homeCssPath = Require-File "src/pages/Home/home.css"
$dataPath = Require-File "src/data/home.ts"

$buttonCss = Read-Utf8 $buttonCssPath
$navCss = Read-Utf8 $navCssPath
$footerCss = Read-Utf8 $footerCssPath
$homePage = Read-Utf8 $homePagePath
$homeCss = Read-Utf8 $homeCssPath
$data = Read-Utf8 $dataPath

# Verify the canonical eight systems without changing the data.
$ids = @("design","materials","manufacturing","mechatronics","robotics","automotive","thermodynamics","fluid")
foreach ($id in $ids) {
    if ($data -notmatch ("id\s*:\s*['""]" + [regex]::Escape($id) + "['""]")) {
        Stop-Patch "Canonical engineeringSystems data is missing expected ID '$id'. No data changes were made."
    }
}

# The current repository uses a simple homepage systems teaser rather than the
# full interactive systems network. UI-02 only patches that existing teaser.
if (-not $homePage.Contains("systems-teaser__domains")) {
    Stop-Patch "Expected existing homepage systems teaser markup was not found. No files were modified."
}
if (-not $homePage.Contains("engineeringSystems.map")) {
    Stop-Patch "Expected data-driven engineeringSystems.map rendering was not found. No files were modified."
}

# ---------------------------------------------------------------------------
# 3. MechanicalButton: primary signal + restrained tactile interaction.
# ---------------------------------------------------------------------------

$buttonMarker = "/* MECHESA PATCH UI-02 - semantic button interaction */"
$buttonBlock = @'
/* MECHESA PATCH UI-02 - semantic button interaction */
.mechanical-button--primary {
  background: var(--color-signal);
  color: var(--color-bg-deep);
  border-color: var(--color-signal);
}
.mechanical-button--primary:hover:not(:disabled),
.mechanical-button--primary:focus-visible {
  background: var(--color-signal);
  border-color: var(--color-signal);
  box-shadow:
    0 0 0 1px var(--color-signal-soft),
    0 0 24px var(--color-signal-glow);
}
.mechanical-button:hover:not(:disabled) {
  border-color: color-mix(in srgb, var(--button-border) 68%, var(--color-signal));
}
.mechanical-button:focus-visible {
  outline: 1px solid var(--color-signal);
  outline-offset: 2px;
}
.mechanical-button:active:not(:disabled),
.mechanical-button--primary:active:not(:disabled),
.mechanical-button--secondary:active:not(:disabled),
.mechanical-button--technical:active:not(:disabled),
.mechanical-button--ghost:active:not(:disabled),
.mechanical-button--danger:active:not(:disabled) {
  transform: scale(.98);
  box-shadow: inset 0 2px 8px rgba(0,0,0,.22);
}
@media (prefers-reduced-motion: reduce) {
  .mechanical-button {
    transition: none;
  }
}
'@
$buttonCss = Append-Once $buttonCss $buttonMarker $buttonBlock

# ---------------------------------------------------------------------------
# 4. SystemIndicator: semantic state hierarchy.
# ---------------------------------------------------------------------------

$indicatorMarker = "/* MECHESA PATCH UI-02 - semantic status states */"
$indicatorBlock = @'
/* MECHESA PATCH UI-02 - semantic status states */
.system-indicator--active {
  color: var(--color-signal);
}
.system-indicator--active .system-indicator__light {
  animation: system-indicator-active-pulse 2.1s var(--ease-ui) infinite;
  box-shadow: 0 0 9px var(--color-signal-glow);
}
.system-indicator--online,
.system-indicator--processing {
  color: var(--color-success);
}
.system-indicator--online .system-indicator__light,
.system-indicator--processing .system-indicator__light {
  box-shadow: 0 0 9px color-mix(in srgb, var(--color-success) 55%, transparent);
}
.system-indicator--offline,
.system-indicator--idle {
  color: var(--color-text-dim);
}
.system-indicator--warning {
  color: var(--color-warning);
}
@keyframes system-indicator-active-pulse {
  0%, 100% {
    opacity: .62;
    box-shadow: 0 0 5px var(--color-signal-soft);
  }
  50% {
    opacity: 1;
    box-shadow: 0 0 11px var(--color-signal-glow);
  }
}
@media (prefers-reduced-motion: reduce) {
  .system-indicator--active .system-indicator__light {
    animation: none;
    opacity: 1;
    box-shadow: 0 0 7px var(--color-signal-soft);
  }
}
'@
$buttonCss = Append-Once $buttonCss $indicatorMarker $indicatorBlock

# ---------------------------------------------------------------------------
# 5. Navigation: signal active state, subtle hover/focus tint.
# ---------------------------------------------------------------------------

$navMarker = "/* MECHESA PATCH UI-02 - navigation signal hierarchy */"
$navBlock = @'
/* MECHESA PATCH UI-02 - navigation signal hierarchy */
.mechanical-nav__item > span {
  color: var(--color-signal);
}
.mechanical-nav__item i {
  background: var(--color-signal);
}
.mechanical-nav__item:hover,
.mechanical-nav__item:focus-visible {
  color: var(--color-text);
  background: color-mix(in srgb, var(--color-signal) 7%, transparent);
}
.mechanical-nav__item.is-active {
  color: var(--color-text);
  background: color-mix(in srgb, var(--color-signal) 10%, transparent);
}
.mechanical-nav__item:focus-visible {
  outline: 1px solid var(--color-signal);
  outline-offset: -2px;
}
'@
$navCss = Append-Once $navCss $navMarker $navBlock

# ---------------------------------------------------------------------------
# 6. Footer: signal signature.
# ---------------------------------------------------------------------------

$footerMarker = "/* MECHESA PATCH UI-02 - footer signal signature */"
$footerBlock = @'
/* MECHESA PATCH UI-02 - footer signal signature */
.site-footer__identity h2 em {
  color: var(--color-signal);
}
'@
$footerCss = Append-Once $footerCss $footerMarker $footerBlock

# ---------------------------------------------------------------------------
# 7. Homepage systems teaser: deterministic data-system attribute + keyboard
#    focus. No data changes and no independent color state.
# ---------------------------------------------------------------------------

$teaserOld = '<div key={s.id} className="systems-teaser__domain">'
$teaserNew = '<div key={s.id} className="systems-teaser__domain" data-system={s.id} tabIndex={0}>'

if (-not $homePage.Contains('data-system={s.id}')) {
    $homePage = Replace-ExactOnce $homePage $teaserOld $teaserNew "engineering systems teaser identity/focus markup"
}

$teaserMarker = "/* MECHESA PATCH UI-02 - eight-system identity markers */"
$teaserBlock = @'
/* MECHESA PATCH UI-02 - eight-system identity markers */
.systems-teaser__domain {
  position: relative;
  border-left: 2px solid var(--system-color, var(--color-border));
  box-shadow: inset 1px 0 0 color-mix(in srgb, var(--system-color, var(--color-border)) 30%, transparent);
  transition:
    background var(--duration-fast) var(--ease-ui),
    border-color var(--duration-fast) var(--ease-ui),
    box-shadow var(--duration-fast) var(--ease-ui);
}
.systems-teaser__domain::before {
  content: "";
  position: absolute;
  left: -4px;
  top: 15px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--system-color, var(--color-border));
}
.systems-teaser__domain span {
  color: color-mix(in srgb, var(--system-color, var(--color-accent)) 72%, var(--color-text-dim));
}
.systems-teaser__domain:hover,
.systems-teaser__domain:focus-visible {
  background: color-mix(in srgb, var(--system-color, transparent) 6%, var(--color-panel));
  border-left-color: var(--system-color, var(--color-border-strong));
  box-shadow:
    inset 2px 0 0 var(--system-color, var(--color-border-strong)),
    0 0 12px color-mix(in srgb, var(--system-color, transparent) 10%, transparent);
}
.systems-teaser__domain:focus-visible {
  outline: 1px solid var(--system-color, var(--color-accent));
  outline-offset: 2px;
}
.systems-teaser__domain[data-system="design"] { --system-color: var(--sys-design); }
.systems-teaser__domain[data-system="materials"] { --system-color: var(--sys-materials); }
.systems-teaser__domain[data-system="manufacturing"] { --system-color: var(--sys-manufacturing); }
.systems-teaser__domain[data-system="mechatronics"] { --system-color: var(--sys-mechatronics); }
.systems-teaser__domain[data-system="robotics"] { --system-color: var(--sys-robotics); }
.systems-teaser__domain[data-system="automotive"] { --system-color: var(--sys-automotive); }
.systems-teaser__domain[data-system="thermodynamics"] { --system-color: var(--sys-thermodynamics); }
.systems-teaser__domain[data-system="fluid"] { --system-color: var(--sys-fluid); }
'@
$homeCss = Append-Once $homeCss $teaserMarker $teaserBlock

# A second marker is used only to document that the text marker remains
# restrained; it does not alter typography.
$teaserTextMarker = "/* MECHESA PATCH UI-02 - system identity text marker */"
$teaserTextBlock = @'
/* MECHESA PATCH UI-02 - system identity text marker */
.systems-teaser__domain strong {
  color: color-mix(in srgb, var(--color-text) 94%, var(--system-color, var(--color-text)));
}
'@
$homeCss = Append-Once $homeCss $teaserTextMarker $teaserTextBlock

# ---------------------------------------------------------------------------
# 8. Validate all edits before writing.
# ---------------------------------------------------------------------------

if (-not $buttonCss.Contains($buttonMarker)) { Stop-Patch "Button patch validation failed." }
if (-not $buttonCss.Contains("--color-signal")) { Stop-Patch "Button signal token validation failed." }
if (-not $buttonCss.Contains("scale(.98)")) { Stop-Patch "Button press-state validation failed." }
if (-not $buttonCss.Contains("system-indicator-active-pulse")) { Stop-Patch "SystemIndicator active-state validation failed." }
if (-not $navCss.Contains($navMarker)) { Stop-Patch "Navigation patch validation failed." }
if (-not $footerCss.Contains($footerMarker)) { Stop-Patch "Footer patch validation failed." }
if (-not $homePage.Contains("data-system={s.id}")) { Stop-Patch "Systems teaser identity binding validation failed." }

foreach ($token in @(
    "--sys-design",
    "--sys-materials",
    "--sys-manufacturing",
    "--sys-mechatronics",
    "--sys-robotics",
    "--sys-automotive",
    "--sys-thermodynamics",
    "--sys-fluid"
)) {
    if (-not $homeCss.Contains("var($token)")) {
        Stop-Patch "Systems teaser token validation failed for $token."
    }
}

# Ensure the existing eight-system data is still untouched in the source file.
$dataBefore = Read-Utf8 $dataPath
if ($dataBefore -ne $data) {
    Stop-Patch "Canonical engineeringSystems data changed unexpectedly during validation."
}

# ---------------------------------------------------------------------------
# 9. Back up only files that will actually change, then write atomically.
# ---------------------------------------------------------------------------

$changes = @(
    @{ Path = $buttonCssPath; Relative = "src/components/mechanical/mechanical.css"; Content = $buttonCss; Backup = "mechanical.css.bak" },
    @{ Path = $navCssPath; Relative = "src/styles/globals.css"; Content = $navCss; Backup = "globals.css.bak" },
    @{ Path = $footerCssPath; Relative = "src/components/navigation/siteFooter.css"; Content = $footerCss; Backup = "siteFooter.css.bak" },
    @{ Path = $homePagePath; Relative = "src/pages/Home/HomePage.tsx"; Content = $homePage; Backup = "HomePage.tsx.bak" },
    @{ Path = $homeCssPath; Relative = "src/pages/Home/home.css"; Content = $homeCss; Backup = "home.css.bak" }
)

$changedFiles = New-Object System.Collections.Generic.List[string]

foreach ($item in $changes) {
    $original = Read-Utf8 $item.Path
    if ($original -ne $item.Content) {
        Backup-IfNeeded $item.Path $item.Backup
        Write-Utf8 $item.Path $item.Content
        $changedFiles.Add($item.Relative)
    }
}

# ---------------------------------------------------------------------------
# 10. Generate the required report only after successful modification.
# ---------------------------------------------------------------------------

$reportPath = Join-Path $projectRoot "PATCH_UI_02_REPORT.md"
$report = @'
# MECHESA // PATCH UI-02

## Status

PATCH APPLIED

## Purpose

Applied semantic color and tactile interaction styling to existing UI components.

## Updated

- Primary MechanicalButton styling
- Button press state
- Button hover/focus treatment
- SystemIndicator semantic states
- Active navigation state
- Footer wordmark
- Homepage system teaser identity colors

## Color Language

- Signal amber = primary / active
- Blueprint blue = technical information
- Success green = live
- Neutral grey = standby
- Eight system identity colors = discipline classification

## Preserved

- Existing layout
- Existing routes
- Existing animations
- Engineering Motion
- Engineering Lab
- Mechanical Core
- Blueprint architecture
- Teammate changes

## Features Added

None.

## Dependencies Added

None.

## Next

PATCH UI-03 will apply the eight-system color language to the homepage systems network and inspector.
'@
Write-Utf8 $reportPath $report

Write-Host ""
Write-Host "PATCH APPLIED" -ForegroundColor Green
Write-Host ""
Write-Host "Changed files:" -ForegroundColor Cyan
if ($changedFiles.Count -eq 0) {
    Write-Host "  (none - PATCH UI-02 was already applied)"
} else {
    foreach ($file in $changedFiles) {
        Write-Host "  $file"
    }
}
Write-Host ""
Write-Host "Backups: .patch-backups\PATCH_UI_02\" -ForegroundColor Green
Write-Host "Report: PATCH_UI_02_REPORT.md" -ForegroundColor Green
Write-Host "Dependencies added: none" -ForegroundColor Green
Write-Host ""
Write-Host "Run npm run build to validate the project." -ForegroundColor Cyan

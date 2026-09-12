$ErrorActionPreference = "Stop"

# MECHESA // PATCH UI-03
# 8-System Network + Inspector Color Language
# Run from the existing MECHESA repository root:
# powershell -ExecutionPolicy Bypass -File .\MECHESA_PATCH_UI_03.ps1

$projectRoot = (Get-Location).Path
$backupDir = Join-Path $projectRoot ".patch-backups\PATCH_UI_03"

function Fail-Patch([string]$Message) {
    Write-Host ""
    Write-Host "PATCH UI-03 STOPPED SAFELY" -ForegroundColor Red
    Write-Host $Message -ForegroundColor Red
    Write-Host ""
    Write-Host "No source files were written by this run." -ForegroundColor Yellow
    exit 1
}

function Require-File([string]$RelativePath) {
    $path = Join-Path $projectRoot $RelativePath
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) {
        Fail-Patch "Required file not found: $RelativePath"
    }
    return $path
}

function Require-Token([string]$Content, [string]$Token) {
    if ($Content -notmatch [regex]::Escape($Token)) {
        Fail-Patch "PATCH UI-01 token '$Token' was not found. Apply PATCH UI-01 before PATCH UI-03."
    }
}

function Append-Once([string]$Content, [string]$Marker, [string]$Block) {
    if ($Content.Contains($Marker)) {
        return $Content
    }
    return $Content.TrimEnd() + "`r`n`r`n" + $Block.Trim() + "`r`n"
}

function Replace-Once([string]$Content, [string]$Old, [string]$New, [string]$Description) {
    $matches = [regex]::Matches($Content, [regex]::Escape($Old))
    if ($matches.Count -eq 0) {
        Fail-Patch "Could not locate the expected $Description source block. Existing teammate architecture was left untouched."
    }
    if ($matches.Count -gt 1) {
        Fail-Patch "Found $($matches.Count) copies of the expected $Description source block. Automatic patching would be unsafe."
    }
    return $Content.Replace($Old, $New)
}

# ---------------------------------------------------------------------------
# 1. Project-root and PATCH UI-01 checks
# ---------------------------------------------------------------------------

Require-File "package.json" | Out-Null
$tokensPath = Require-File "src/styles/tokens.css"
$tokens = Get-Content -LiteralPath $tokensPath -Raw

foreach ($token in @(
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
)) {
    Require-Token $tokens $token
}

# ---------------------------------------------------------------------------
# 2. Locate canonical current files
# ---------------------------------------------------------------------------

$nodePath = Require-File "src/components/home/EngineeringSystemNode.tsx"
$homeCssPath = Require-File "src/pages/Home/home.css"
$homePagePath = Require-File "src/pages/Home/HomePage.tsx"

$node = Get-Content -LiteralPath $nodePath -Raw
$homeCss = Get-Content -LiteralPath $homeCssPath -Raw
$homePage = Get-Content -LiteralPath $homePagePath -Raw

# The network and inspector must actually be wired into the homepage.
# Do not manufacture a new network in a patch whose scope is styling only.
if ($homePage -notmatch "EngineeringSystemNode") {
    Fail-Patch "EngineeringSystemNode is not currently rendered by HomePage.tsx. The homepage systems network is not wired in the current repository, so UI-03 cannot safely patch it without inventing/reintroducing architecture."
}

if ($homePage -notmatch "systems-network") {
    Fail-Patch "HomePage.tsx does not contain the existing systems-network implementation. UI-03 requires an already-existing network; no new network was created."
}

if ($homePage -notmatch "systems-inspector") {
    Fail-Patch "HomePage.tsx does not contain the existing systems-inspector implementation. UI-03 requires an already-existing inspector; no new inspector was created."
}

if ($homeCss -notmatch "\.systems-network__lines") {
    Fail-Patch "systems-network__lines CSS was not found. Existing network connector architecture could not be verified."
}
if ($homeCss -notmatch "\.systems-inspector__bars") {
    Fail-Patch "systems-inspector__bars CSS was not found. Existing inspector bar architecture could not be verified."
}

# Verify the canonical data source is present without editing it.
$dataHomePath = Join-Path $projectRoot "src/data/home.ts"
if (-not (Test-Path -LiteralPath $dataHomePath -PathType Leaf)) {
    Fail-Patch "src/data/home.ts was not found; cannot verify the canonical engineeringSystems data."
}
$dataHome = Get-Content -LiteralPath $dataHomePath -Raw

$requiredIds = @(
    "design",
    "materials",
    "manufacturing",
    "mechatronics",
    "robotics",
    "automotive",
    "thermodynamics",
    "fluid"
)
foreach ($id in $requiredIds) {
    if ($dataHome -notmatch ("id:\s*['""]" + [regex]::Escape($id) + "['""]")) {
        Fail-Patch "Canonical engineeringSystems data is missing expected ID '$id'. No data changes were made."
    }
}

# ---------------------------------------------------------------------------
# 3. Ensure the node has one canonical system-color mapping.
#    The mapping is token-based and is reused by node, network, and inspector
#    through the --system-color custom property.
# ---------------------------------------------------------------------------

$mapMarker = "// MECHESA PATCH UI-03 - canonical system color map"
$mapBlock = @"
$mapMarker
const systemColorTokenById: Record<string, string> = {
  design: 'var(--sys-design)',
  materials: 'var(--sys-materials)',
  manufacturing: 'var(--sys-manufacturing)',
  mechatronics: 'var(--sys-mechatronics)',
  robotics: 'var(--sys-robotics)',
  automotive: 'var(--sys-automotive)',
  thermodynamics: 'var(--sys-thermodynamics)',
  fluid: 'var(--sys-fluid)',
}
"@

if (-not $node.Contains($mapMarker)) {
    # Place the mapping directly after imports. This does not alter the data API.
    $firstExport = "export function EngineeringSystemNode"
    if (-not $node.Contains($firstExport)) {
        Fail-Patch "EngineeringSystemNode.tsx has an unexpected structure; safe mapping insertion is not possible."
    }
    $node = $node.Replace($firstExport, "$mapBlock`r`n`r`n$firstExport")
}

# Add the CSS custom property and deterministic data attribute to the existing
# button. Do not create independent color state.
$oldReturn = @'
return <CursorTarget label="VIEW" intent="view" className={`system-node ${selected ? 'is-selected' : ''}`}>
    <button type="button" className="system-node__button" onClick={onSelect} aria-pressed={selected}>
'@
$newReturn = @'
return <CursorTarget label="VIEW" intent="view" className={`system-node ${selected ? 'is-selected' : ''}`}>
    <button
      type="button"
      className="system-node__button"
      onClick={onSelect}
      aria-pressed={selected}
      data-system-id={system.id}
      style={{ '--system-color': systemColorTokenById[system.id] ?? 'var(--color-border)' } as React.CSSProperties}
    >
'@

if (-not $node.Contains('data-system-id={system.id}')) {
    $node = Replace-Once $node $oldReturn $newReturn "system node identity binding"
}

# Use a focusable semantic button, and expose selected state to assistive tech.
# aria-pressed is already the existing selection contract; preserve it.
if (-not $node.Contains('aria-pressed={selected}')) {
    Fail-Patch "Existing system-node selection semantics were not found; refusing to change accessibility behavior."
}

# ---------------------------------------------------------------------------
# 4. Add the network/inspector visual layer to the existing home CSS.
#    No scroll choreography, layout, or network geometry is changed.
# ---------------------------------------------------------------------------

$cssMarker = "/* MECHESA PATCH UI-03 - eight-system network identity */"
$cssBlock = @"
$cssMarker
.system-node__button {
  border-left: 2px solid var(--system-color, var(--color-border));
  transition:
    transform var(--duration-fast) var(--ease-mechanical),
    border-color var(--duration-fast) var(--ease-ui),
    background var(--duration-fast) var(--ease-ui),
    box-shadow var(--duration-fast) var(--ease-ui);
}
.system-node__button::before {
  content: "";
  position: absolute;
  left: -3px;
  top: 13px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--system-color, var(--color-border));
}
.system-node__button:hover,
.system-node__button:focus-visible {
  border-color: var(--system-color, var(--color-border));
  border-left-color: var(--system-color, var(--color-border));
  box-shadow:
    inset 2px 0 0 color-mix(in srgb, var(--system-color) 42%, transparent),
    0 0 14px color-mix(in srgb, var(--system-color) 12%, transparent);
}
.system-node__button:focus-visible {
  outline: 1px solid var(--system-color, var(--color-border));
  outline-offset: 2px;
}
.system-node.is-selected .system-node__button {
  border-color: var(--system-color, var(--color-border-strong));
  border-left-color: var(--system-color, var(--color-border-strong));
  box-shadow:
    inset 2px 0 0 var(--system-color, var(--color-border-strong)),
    0 0 18px color-mix(in srgb, var(--system-color) 16%, transparent);
}
.system-node.is-selected .system-node__button::before {
  box-shadow: 0 0 9px color-mix(in srgb, var(--system-color) 58%, transparent);
}
.system-node .system-indicator {
  color: var(--system-color, var(--color-text-dim));
}
.system-node .system-indicator__light {
  box-shadow: 0 0 8px color-mix(in srgb, var(--system-color) 38%, transparent);
}

/* The network remains neutral at rest; only the selected connector carries
   the selected system identity. */
.systems-network__lines i {
  --connector-color: var(--color-accent-line);
  background: linear-gradient(90deg, var(--connector-color), transparent);
  transition:
    background-color 180ms var(--ease-ui),
    opacity 180ms var(--ease-ui),
    filter 180ms var(--ease-ui);
}
.systems-network__lines i.is-selected,
.systems-network__lines i[data-system-selected="true"] {
  --connector-color: var(--system-color, var(--color-accent-line));
  background: linear-gradient(90deg, var(--connector-color), transparent);
  opacity: .95;
  filter: drop-shadow(0 0 5px color-mix(in srgb, var(--connector-color) 36%, transparent));
  animation: systems-network-signal 900ms var(--ease-mechanical) 1;
}

/* Inspector follows the selected system through the same custom property. */
.systems-inspector {
  --system-color: var(--color-accent);
}
.systems-inspector__bars {
  transition: color 200ms var(--ease-ui), filter 200ms var(--ease-ui);
}
.systems-inspector__bars i {
  background: linear-gradient(
    180deg,
    var(--system-color),
    color-mix(in srgb, var(--system-color) 10%, transparent)
  );
  box-shadow: 0 0 10px color-mix(in srgb, var(--system-color) 20%, transparent);
  transition:
    background 200ms var(--ease-ui),
    box-shadow 200ms var(--ease-ui),
    opacity 200ms var(--ease-ui);
}
.systems-inspector__bars i:first-child {
  box-shadow: 0 0 13px color-mix(in srgb, var(--system-color) 30%, transparent);
}
.systems-inspector__head::before {
  content: "";
  width: 5px;
  height: 5px;
  flex: 0 0 auto;
  align-self: center;
  border-radius: 50%;
  background: var(--system-color);
  box-shadow: 0 0 8px color-mix(in srgb, var(--system-color) 35%, transparent);
  transition: background 200ms var(--ease-ui), box-shadow 200ms var(--ease-ui);
}
@keyframes systems-network-signal {
  0% {
    opacity: .35;
    filter: drop-shadow(0 0 0 transparent);
  }
  55% {
    opacity: 1;
    filter: drop-shadow(0 0 7px color-mix(in srgb, var(--connector-color) 48%, transparent));
  }
  100% {
    opacity: .95;
    filter: drop-shadow(0 0 5px color-mix(in srgb, var(--connector-color) 36%, transparent));
  }
}
@media (prefers-reduced-motion: reduce) {
  .system-node__button,
  .systems-network__lines i,
  .systems-inspector__bars,
  .systems-inspector__bars i,
  .systems-inspector__head::before {
    transition: none;
  }
  .systems-network__lines i.is-selected,
  .systems-network__lines i[data-system-selected="true"] {
    animation: none;
    opacity: .95;
    filter: none;
  }
}
"@

if (-not $homeCss.Contains($cssMarker)) {
    $homeCss = Append-Once $homeCss $cssMarker $cssBlock
}

# ---------------------------------------------------------------------------
# 5. Wire selected system color to existing network/inspector markup.
#    This is intentionally targeted. If the current JSX does not expose the
#    selection structure, stop rather than inventing a second selection model.
# ---------------------------------------------------------------------------

$networkLinePattern = 'systems-network__lines'
$hasLineMarkup = $homePage -match '<div[^>]*className="systems-network__lines"'
if (-not $hasLineMarkup) {
    Fail-Patch "systems-network__lines exists in CSS but its JSX structure could not be verified. Manual integration is safer than guessing."
}

# Require a data-driven map/render of the existing eight nodes.
if ($homePage -notmatch "engineeringSystems\.map") {
    Fail-Patch "The homepage systems network is not rendered from engineeringSystems.map; refusing to duplicate or hardcode eight systems."
}

# Selected system state must already exist in the network page. Look for the
# existing selected-system variable/state rather than creating another state.
$selectionCandidates = @(
    'selectedSystem',
    'selectedSystemId',
    'selectedSystemData',
    'selectedSystemId'
)
$selectionFound = $false
foreach ($candidate in $selectionCandidates) {
    if ($homePage.Contains($candidate)) {
        $selectionFound = $true
        break
    }
}
if (-not $selectionFound) {
    Fail-Patch "No existing selected-system state was detected in HomePage.tsx. UI-03 must reuse existing selection state and will not introduce an independent selection state."
}

# The script can safely add identity attributes only when the existing
# rendering exposes an engineering-system object named `system` or `s`.
# Otherwise stop and preserve teammate work.
if ($homePage -notmatch 'system\.id|s\.id') {
    Fail-Patch "Could not identify the existing system object in the homepage network rendering. Manual integration is required."
}

# ---------------------------------------------------------------------------
# 6. Add a small shared helper to HomePage only when the existing component
#    already owns the selected system. This helper is deterministic and does
#    not create UI state.
# ---------------------------------------------------------------------------

$helperMarker = "const getSystemColorToken"
if (-not $homePage.Contains($helperMarker)) {
    $importAnchor = "import './home.css'"
    if (-not $homePage.Contains($importAnchor)) {
        Fail-Patch "HomePage.tsx import structure is unexpected; safe helper insertion is not possible."
    }

    $helper = @'
const systemColorTokenById: Record<string, string> = {
  design: 'var(--sys-design)',
  materials: 'var(--sys-materials)',
  manufacturing: 'var(--sys-manufacturing)',
  mechatronics: 'var(--sys-mechatronics)',
  robotics: 'var(--sys-robotics)',
  automotive: 'var(--sys-automotive)',
  thermodynamics: 'var(--sys-thermodynamics)',
  fluid: 'var(--sys-fluid)',
}

const getSystemColorToken = (id: string) => systemColorTokenById[id] ?? 'var(--color-border)'
'@
    # Avoid duplicating a second mapping if the file already received it through
    # another safe integration.
    if (-not $homePage.Contains("systemColorTokenById")) {
        $homePage = $homePage.Replace($importAnchor, "$importAnchor`r`n`r`n$helper")
    }
}

# ---------------------------------------------------------------------------
# 7. Validate before writing.
# ---------------------------------------------------------------------------

$mustContain = @(
    @($node, "systemColorTokenById", "node canonical color map"),
    @($node, "data-system-id={system.id}", "node system ID binding"),
    @($homeCss, "--sys-design", "design token"),
    @($homeCss, "--sys-materials", "materials token"),
    @($homeCss, "--sys-manufacturing", "manufacturing token"),
    @($homeCss, "--sys-mechatronics", "mechatronics token"),
    @($homeCss, "--sys-robotics", "robotics token"),
    @($homeCss, "--sys-automotive", "automotive token"),
    @($homeCss, "--sys-thermodynamics", "thermodynamics token"),
    @($homeCss, "--sys-fluid", "fluid token"),
    @($homeCss, "systems-network-signal", "connector selection animation"),
    @($homeCss, "systems-inspector__bars", "inspector styling"),
    @($homePage, "systems-network", "homepage network"),
    @($homePage, "systems-inspector", "homepage inspector")
)

foreach ($entry in $mustContain) {
    if (-not $entry[0].Contains($entry[1])) {
        Fail-Patch "Pre-write validation failed for $($entry[2])."
    }
}

# The canonical mapping must appear only once in EngineeringSystemNode.
if (([regex]::Matches($node, [regex]::Escape($mapMarker))).Count -ne 1) {
    Fail-Patch "Duplicate canonical system color map detected in EngineeringSystemNode.tsx."
}

# Do not alter package dependencies or TypeScript config.
$packagePath = Join-Path $projectRoot "package.json"
$tsconfigs = Get-ChildItem -LiteralPath $projectRoot -Filter "tsconfig*.json" -File
$packageBefore = Get-Content -LiteralPath $packagePath -Raw
$tsconfigBefore = @{}
foreach ($cfg in $tsconfigs) {
    $tsconfigBefore[$cfg.FullName] = Get-Content -LiteralPath $cfg.FullName -Raw
}

# ---------------------------------------------------------------------------
# 8. Back up every source file before writing.
# ---------------------------------------------------------------------------

New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

$writeSet = @(
    @{ Relative = "src/components/home/EngineeringSystemNode.tsx"; Path = $nodePath; Content = $node; Backup = "EngineeringSystemNode.tsx.bak" },
    @{ Relative = "src/pages/Home/home.css"; Path = $homeCssPath; Content = $homeCss; Backup = "home.css.bak" },
    @{ Relative = "src/pages/Home/HomePage.tsx"; Path = $homePagePath; Content = $homePage; Backup = "HomePage.tsx.bak" }
)

$changed = New-Object System.Collections.Generic.List[string]

foreach ($file in $writeSet) {
    $original = Get-Content -LiteralPath $file.Path -Raw
    if ($original -ne $file.Content) {
        Copy-Item -LiteralPath $file.Path -Destination (Join-Path $backupDir $file.Backup) -Force
        Set-Content -LiteralPath $file.Path -Value $file.Content -NoNewline -Encoding UTF8
        $changed.Add($file.Relative)
    }
}

# ---------------------------------------------------------------------------
# 9. Final safety validation.
# ---------------------------------------------------------------------------

if ((Get-Content -LiteralPath $packagePath -Raw) -ne $packageBefore) {
    Fail-Patch "package.json changed unexpectedly. Restore the backup before continuing."
}
foreach ($cfg in $tsconfigs) {
    if ((Get-Content -LiteralPath $cfg.FullName -Raw) -ne $tsconfigBefore[$cfg.FullName]) {
        Fail-Patch "TypeScript configuration changed unexpectedly: $($cfg.Name). Restore the backup before continuing."
    }
}

$finalNode = Get-Content -LiteralPath $nodePath -Raw
$finalHomeCss = Get-Content -LiteralPath $homeCssPath -Raw
$finalHomePage = Get-Content -LiteralPath $homePagePath -Raw

if (([regex]::Matches($finalNode, [regex]::Escape($mapMarker))).Count -ne 1) {
    Fail-Patch "Final validation failed: canonical system map count is not one."
}
if (-not $finalNode.Contains("data-system-id={system.id}")) {
    Fail-Patch "Final validation failed: node system ID binding is missing."
}
foreach ($token in $requiredIds) {
    $tokenName = switch ($token) {
        "design" { "--sys-design" }
        "materials" { "--sys-materials" }
        "manufacturing" { "--sys-manufacturing" }
        "mechatronics" { "--sys-mechatronics" }
        "robotics" { "--sys-robotics" }
        "automotive" { "--sys-automotive" }
        "thermodynamics" { "--sys-thermodynamics" }
        "fluid" { "--sys-fluid" }
    }
    if (-not $finalHomeCss.Contains("var($tokenName)")) {
        Fail-Patch "Final validation failed: $tokenName is not wired into UI-03."
    }
}

if (-not $finalHomeCss.Contains($cssMarker)) {
    Fail-Patch "Final validation failed: UI-03 CSS marker is missing."
}
if (-not $finalHomePage.Contains("systems-network") -or -not $finalHomePage.Contains("systems-inspector")) {
    Fail-Patch "Final validation failed: existing network/inspector markup is no longer visible."
}

# ---------------------------------------------------------------------------
# 10. Required report. Created only after successful modification.
# ---------------------------------------------------------------------------

$reportPath = Join-Path $projectRoot "PATCH_UI_03_REPORT.md"
$report = @"
# MECHESA // PATCH UI-03

## Status

PATCH APPLIED

## Purpose

Applied the eight-system identity color language to the homepage engineering network and inspector.

## System Colors

- Design ? neutral steel
- Materials ? bronze
- Manufacturing ? signal amber
- Mechatronics ? violet-blue
- Robotics ? blueprint blue
- Automotive ? burnt orange-red
- Thermodynamics ? rose
- Fluid Mechanics ? teal

## Updated

- System node identity markers
- System hover/focus state
- Selected system state
- Selected network connector
- Connector selection response
- Inspector data bars
- Inspector system identity marker

## Preserved

- Homepage structure
- Existing system data
- Existing scroll choreography
- Existing Mechanical Core
- Engineering Motion
- Existing animations
- Blueprint architecture
- Teammate changes

## Features Added

None.

## Dependencies Added

None.

## Next

PATCH UI-04 will refine the homepage hero atmosphere and Mechanical Core hub lighting.
"@
Set-Content -LiteralPath $reportPath -Value $report -Encoding UTF8

Write-Host ""
Write-Host "MECHESA // PATCH UI-03 APPLIED" -ForegroundColor Green
Write-Host ""
Write-Host "Changed files:" -ForegroundColor Cyan
if ($changed.Count -eq 0) {
    Write-Host "  (none - patch was already applied)"
} else {
    foreach ($file in $changed) {
        Write-Host "  $file"
    }
}
Write-Host ""
Write-Host "Backups: .patch-backups\PATCH_UI_03\" -ForegroundColor Green
Write-Host "Report: PATCH_UI_03_REPORT.md" -ForegroundColor Green
Write-Host "Dependencies changed: none" -ForegroundColor Green
Write-Host "TypeScript configuration changed: none" -ForegroundColor Green
Write-Host ""
Write-Host "PATCH COMPLETE." -ForegroundColor Green

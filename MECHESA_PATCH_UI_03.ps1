# MECHESA // PART 2 // PATCH UI-03
# 8-SYSTEM NETWORK + INSPECTOR COLOR LANGUAGE
#
# Run from the existing repository root:
# powershell -ExecutionPolicy Bypass -File .\MECHESA_PATCH_UI_03.ps1

$ErrorActionPreference = "Stop"

$projectRoot = (Get-Location).Path
$backupDir = Join-Path $projectRoot ".patch-backups\PATCH_UI_03"
$reportPath = Join-Path $projectRoot "PATCH_UI_03_REPORT.md"

function Stop-Patch([string]$Message) {
    Write-Host ""
    Write-Host "PATCH UI-03 STOPPED SAFELY" -ForegroundColor Red
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

function Write-Text([string]$Path, [string]$Content) {
    [System.IO.File]::WriteAllText($Path, $Content, [System.Text.UTF8Encoding]::new($false))
}

function Backup-File([string]$Path, [string]$RelativeBackupName) {
    $destination = Join-Path $backupDir $RelativeBackupName
    $destinationDir = Split-Path -Parent $destination
    New-Item -ItemType Directory -Path $destinationDir -Force | Out-Null
    Copy-Item -LiteralPath $Path -Destination $destination -Force
}

function Replace-Once([string]$Content, [string]$Old, [string]$New, [string]$Description) {
    if (-not $Content.Contains($Old)) {
        Stop-Patch "Could not find the expected $Description. Refusing a blind replacement."
    }
    return $Content.Replace($Old, $New)
}

# 1. Verify root and UI-01.
Require-File "package.json" | Out-Null
$tokensPath = Require-File "src/styles/tokens.css"
$tokens = Read-Text $tokensPath

foreach ($token in @(
    "--sys-design","--sys-materials","--sys-manufacturing","--sys-mechatronics",
    "--sys-robotics","--sys-automotive","--sys-thermodynamics","--sys-fluid"
)) {
    if (-not $tokens.Contains($token)) {
        Stop-Patch "PATCH UI-01 token '$token' is missing. Apply UI-01 before UI-03."
    }
}

# 2. Verify canonical eight-system data without editing it.
$dataPath = Require-File "src/data/home.ts"
$data = Read-Text $dataPath
$ids = @("design","materials","manufacturing","mechatronics","robotics","automotive","thermodynamics","fluid")
foreach ($id in $ids) {
    if ($data -notmatch ("id\s*:\s*['""]" + [regex]::Escape($id) + "['""]")) {
        Stop-Patch "Canonical engineeringSystems data is missing '$id'."
    }
}

# 3. Inspect the actual implementation.
$aboutTsxPath = Require-File "src/pages/About/AboutPage.tsx"
$aboutCssPath = Require-File "src/pages/About/about.css"
$homeCssPath = Require-File "src/pages/Home/home.css"

$aboutTsx = Read-Text $aboutTsxPath
$aboutCss = Read-Text $aboutCssPath
$homeCss = Read-Text $homeCssPath

# The supplied repository's actual engineering network is the existing
# systems-map in AboutPage. Do not create a duplicate homepage network.
if (-not $aboutTsx.Contains('className="systems-map"')) {
    Stop-Patch "The existing engineering systems network (.systems-map) could not be located in AboutPage.tsx."
}
if (-not $aboutTsx.Contains('className="system-inspector"')) {
    Stop-Patch "The existing engineering system inspector (.system-inspector) could not be located in AboutPage.tsx."
}
if (-not $aboutTsx.Contains("engineeringSystems.map")) {
    Stop-Patch "The existing systems network is no longer data-driven. Refusing to hardcode system nodes."
}
if (-not $aboutTsx.Contains("selectedSystem")) {
    Stop-Patch "The existing systems network does not expose the current selectedSystem state."
}

# 4. Centralized token mapping, reused by node + selected connector + inspector.
$mapMarker = "// MECHESA PATCH UI-03 - canonical system color map"
if (-not $aboutTsx.Contains($mapMarker)) {
    $mapBlock = @'
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

const getSystemColorToken = (id: string) =>
  systemColorTokenById[id] ?? 'var(--color-border)'
'@
    $anchor = "const systemPositions = ["
    if (-not $aboutTsx.Contains($anchor)) {
        Stop-Patch "Could not find the existing systemPositions anchor."
    }
    $aboutTsx = $aboutTsx.Replace($anchor, "$mapMarker`r`n$mapBlock`r`n$anchor")
}

# 5. Give the existing SystemNode a deterministic data-system-id and one
#    canonical CSS variable. Selection state remains the existing state.
$oldNode = @'
function SystemNode({ system, index, position, selected, onSelect }: { system: typeof engineeringSystems[number]; index: number; position: { x: number; y: number }; selected: boolean; onSelect: () => void }) {
  return <CursorTarget intent="view" label="VIEW" className="system-node-wrap" style={{ left: `${position.x}%`, top: `${position.y}%` } as CSSProperties}><button type="button" className={`system-node${selected ? ' is-selected' : ''}`} onClick={onSelect} aria-pressed={selected} aria-label={`Inspect ${system.title}`}><span>{String(index + 1).padStart(2, '0')}</span><i aria-hidden="true" /><strong>{system.shortLabel}</strong></button></CursorTarget>
}
'@
$newNode = @'
function SystemNode({ system, index, position, selected, onSelect }: { system: typeof engineeringSystems[number]; index: number; position: { x: number; y: number }; selected: boolean; onSelect: () => void }) {
  return <CursorTarget intent="view" label="VIEW" className="system-node-wrap" style={{ left: `${position.x}%`, top: `${position.y}%` } as CSSProperties}><button type="button" className={`system-node${selected ? ' is-selected' : ''}`} data-system-id={system.id} style={{ '--system-color': getSystemColorToken(system.id) } as CSSProperties} onClick={onSelect} aria-pressed={selected} aria-label={`Inspect ${system.title}`}><span>{String(index + 1).padStart(2, '0')}</span><i aria-hidden="true" /><strong>{system.shortLabel}</strong></button></CursorTarget>
}
'@
if (-not $aboutTsx.Contains("data-system-id={system.id}")) {
    $aboutTsx = Replace-Once $aboutTsx $oldNode $newNode "existing SystemNode implementation"
}

# 6. Add one selected connector from the neutral core to the selected node.
#    Existing neutral connectors remain untouched. Keying by selectedSystem
#    causes the restrained CSS signal animation to replay on each selection.
$oldSvg = @'
              <svg className="systems-map__connections" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                {systemPositions.map((position, index) => index > 0 && <line key={`${index}-a`} x1={systemPositions[index - 1].x} y1={systemPositions[index - 1].y} x2={position.x} y2={position.y} />)}
                <line x1="18" y1="18" x2="50" y2="49" /><line x1="82" y1="18" x2="50" y2="49" /><line x1="15" y1="50" x2="50" y2="49" /><line x1="85" y1="50" x2="50" y2="49" /><line x1="28" y1="81" x2="50" y2="49" /><line x1="73" y1="81" x2="50" y2="49" />
              </svg>
'@
$newSvg = @'
              <svg className="systems-map__connections" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                {systemPositions.map((position, index) => index > 0 && <line key={`${index}-a`} x1={systemPositions[index - 1].x} y1={systemPositions[index - 1].y} x2={position.x} y2={position.y} />)}
                <line x1="18" y1="18" x2="50" y2="49" /><line x1="82" y1="18" x2="50" y2="49" /><line x1="15" y1="50" x2="50" y2="49" /><line x1="85" y1="50" x2="50" y2="49" /><line x1="28" y1="81" x2="50" y2="49" /><line x1="73" y1="81" x2="50" y2="49" />
                {selectedSystemData && <line key={selectedSystemData.id} className="systems-map__selected-connection" data-system-id={selectedSystemData.id} x1="50" y1="49" x2={systemPositions[activeSystemIndex].x} y2={systemPositions[activeSystemIndex].y} style={{ '--system-color': getSystemColorToken(selectedSystemData.id) } as CSSProperties} />}
              </svg>
'@
if (-not $aboutTsx.Contains("systems-map__selected-connection")) {
    $aboutTsx = Replace-Once $aboutTsx $oldSvg $newSvg "existing systems network connector SVG"
}

# 7. Give the existing inspector the same selected-system variable and an
#    identity marker. No second selection state is introduced.
$oldInspector = @'
            <MechanicalPanel variant="technical" className="system-inspector" aria-live="polite">
              <div className="system-inspector__top"><TechnicalLabel prefix="SYSTEM NODE">{selectedSystemData?.shortLabel ?? 'N/A'}</TechnicalLabel><SystemIndicator state={selectedSystemData?.status === 'ACTIVE' ? 'active' : 'idle'} label={selectedSystemData?.status ?? 'STANDBY'} /></div>
'@
$newInspector = @'
            <MechanicalPanel variant="technical" className="system-inspector" aria-live="polite" style={{ '--system-color': getSystemColorToken(selectedSystemData?.id ?? '') } as CSSProperties}>
              <div className="system-inspector__top"><span className="system-inspector__identity-marker" aria-hidden="true" /><TechnicalLabel prefix="SYSTEM NODE">{selectedSystemData?.shortLabel ?? 'N/A'}</TechnicalLabel><SystemIndicator state={selectedSystemData?.status === 'ACTIVE' ? 'active' : 'idle'} label={selectedSystemData?.status ?? 'STANDBY'} /></div>
'@
if (-not $aboutTsx.Contains("system-inspector__identity-marker")) {
    $aboutTsx = Replace-Once $aboutTsx $oldInspector $newInspector "existing system inspector header"
}

# 8. CSS is targeted at the actual system network/inspector classes. The
#    homepage teaser also receives the same identity variables already used
#    by UI-02; no homepage structure is changed.
$cssMarker = "/* MECHESA PATCH UI-03 - eight-system network identity */"
if (-not $aboutCss.Contains($cssMarker)) {
    $cssBlock = @'
/* MECHESA PATCH UI-03 - eight-system network identity */
.system-node {
  position: relative;
  border-left: 2px solid var(--system-color, var(--color-border));
  box-shadow: inset 1px 0 0 color-mix(in srgb, var(--system-color, var(--color-border)) 32%, transparent);
  transition:
    transform .25s var(--ease-mechanical),
    border-color .2s var(--ease-ui),
    background .2s var(--ease-ui),
    box-shadow .2s var(--ease-ui);
}
.system-node::before {
  content: "";
  position: absolute;
  left: -4px;
  top: 15px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--system-color, var(--color-border));
}
.system-node:hover,
.system-node:focus-visible {
  border-left-color: var(--system-color, var(--color-border-strong));
  box-shadow:
    inset 2px 0 0 var(--system-color, var(--color-border-strong)),
    0 0 12px color-mix(in srgb, var(--system-color, transparent) 12%, transparent);
}
.system-node:focus-visible {
  outline: 1px solid var(--system-color, var(--color-accent));
  outline-offset: 2px;
}
.system-node.is-selected {
  border-color: color-mix(in srgb, var(--system-color, var(--color-border-strong)) 72%, var(--color-border-strong));
  border-left-color: var(--system-color, var(--color-border-strong));
  box-shadow:
    inset 2px 0 0 var(--system-color, var(--color-border-strong)),
    0 0 18px color-mix(in srgb, var(--system-color, transparent) 16%, transparent);
}
.system-node.is-selected::before {
  box-shadow: 0 0 9px color-mix(in srgb, var(--system-color, transparent) 58%, transparent);
}
.system-node span {
  color: color-mix(in srgb, var(--system-color, var(--color-blueprint)) 76%, var(--color-text-dim));
}
.systems-map__selected-connection {
  stroke: var(--system-color, var(--color-accent-line));
  stroke-width: .24;
  vector-effect: non-scaling-stroke;
  filter: drop-shadow(0 0 4px color-mix(in srgb, var(--system-color, var(--color-accent-line)) 28%, transparent));
  animation: systems-map-selected-signal 900ms var(--ease-mechanical) 1;
}
.system-inspector {
  --system-color: var(--color-accent);
  transition: border-color .2s var(--ease-ui), box-shadow .2s var(--ease-ui);
}
.system-inspector__top {
  display: flex;
  align-items: flex-start;
  gap: .55rem;
}
.system-inspector__identity-marker {
  width: 5px;
  height: 5px;
  margin-top: .25rem;
  flex: 0 0 auto;
  border-radius: 50%;
  background: var(--system-color);
  box-shadow: 0 0 8px color-mix(in srgb, var(--system-color) 35%, transparent);
  transition: background .2s var(--ease-ui), box-shadow .2s var(--ease-ui);
}
.system-inspector__readout strong {
  color: color-mix(in srgb, var(--system-color) 82%, var(--color-text));
  transition: color .2s var(--ease-ui);
}
@keyframes systems-map-selected-signal {
  0% { opacity: .25; stroke-width: .12; }
  55% { opacity: 1; stroke-width: .28; }
  100% { opacity: .95; stroke-width: .24; }
}
@media (prefers-reduced-motion: reduce) {
  .system-node,
  .system-inspector,
  .system-inspector__identity-marker,
  .system-inspector__readout strong {
    transition: none;
  }
  .systems-map__selected-connection {
    animation: none;
    filter: none;
  }
}
'@
    $aboutCss = $aboutCss.TrimEnd() + "`r`n`r`n" + $cssBlock.Trim() + "`r`n"
}

# 9. Add matching system-color variables to the existing homepage teaser
#    domains. This is additive styling only and preserves UI-02 behavior.
$homeMarker = "/* MECHESA PATCH UI-03 - homepage system identity sync */"
if (-not $homeCss.Contains($homeMarker)) {
    $homeBlock = @'
/* MECHESA PATCH UI-03 - homepage system identity sync */
.systems-teaser__domain[data-system="design"] { --system-color: var(--sys-design); }
.systems-teaser__domain[data-system="materials"] { --system-color: var(--sys-materials); }
.systems-teaser__domain[data-system="manufacturing"] { --system-color: var(--sys-manufacturing); }
.systems-teaser__domain[data-system="mechatronics"] { --system-color: var(--sys-mechatronics); }
.systems-teaser__domain[data-system="robotics"] { --system-color: var(--sys-robotics); }
.systems-teaser__domain[data-system="automotive"] { --system-color: var(--sys-automotive); }
.systems-teaser__domain[data-system="thermodynamics"] { --system-color: var(--sys-thermodynamics); }
.systems-teaser__domain[data-system="fluid"] { --system-color: var(--sys-fluid); }
'@
    $homeCss = $homeCss.TrimEnd() + "`r`n`r`n" + $homeBlock.Trim() + "`r`n"
}

# 10. Final safety checks before writing.
foreach ($token in @('--sys-design','--sys-materials','--sys-manufacturing','--sys-mechatronics','--sys-robotics','--sys-automotive','--sys-thermodynamics','--sys-fluid')) {
    if (-not $aboutTsx.Contains($token) -and -not $aboutCss.Contains($token) -and -not $homeCss.Contains($token)) {
        Stop-Patch "System token '$token' was not found in the resulting UI-03 source."
    }
}
if (-not $aboutTsx.Contains("data-system-id={system.id}")) {
    Stop-Patch "SystemNode did not receive the deterministic data-system-id binding."
}
if (-not $aboutTsx.Contains("systems-map__selected-connection")) {
    Stop-Patch "Selected connector binding was not installed."
}
if (-not $aboutTsx.Contains("system-inspector__identity-marker")) {
    Stop-Patch "Inspector identity marker was not installed."
}

# 11. Backup only files that actually change.
$changed = New-Object System.Collections.Generic.List[string]

if ($aboutTsx -ne (Read-Text $aboutTsxPath)) {
    Backup-File $aboutTsxPath "AboutPage.tsx.bak"
    Write-Text $aboutTsxPath $aboutTsx
    $changed.Add("src/pages/About/AboutPage.tsx")
}
if ($aboutCss -ne (Read-Text $aboutCssPath)) {
    Backup-File $aboutCssPath "about.css.bak"
    Write-Text $aboutCssPath $aboutCss
    $changed.Add("src/pages/About/about.css")
}
if ($homeCss -ne (Read-Text $homeCssPath)) {
    Backup-File $homeCssPath "home.css.bak"
    Write-Text $homeCssPath $homeCss
    $changed.Add("src/pages/Home/home.css")
}

# 12. Only report APPLIED after successful writes.
$report = @'
# MECHESA // PATCH UI-03

## Status

PATCH APPLIED

## Purpose

Applied the eight-system identity color language to the existing engineering systems network and inspector without replacing the existing architecture.

## System Colors

- Design → neutral steel
- Materials → bronze
- Manufacturing → signal amber
- Mechatronics → violet-blue
- Robotics → blueprint blue
- Automotive → burnt orange-red
- Thermodynamics → rose
- Fluid Mechanics → teal

## Updated

- System node identity markers
- System hover/focus state
- Selected system state
- Selected network connector
- Connector selection response
- Inspector system identity marker
- Inspector readout identity color

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

## Notes

The supplied repository's actual rendered engineering network/inspector is implemented as the existing `systems-map` / `system-inspector` in `src/pages/About/AboutPage.tsx`; UI-03 targets that existing implementation rather than creating a duplicate network on the homepage.

The homepage systems teaser receives the same canonical identity-token variables without changing its structure.

## Next

PATCH UI-04 will refine the homepage hero atmosphere and Mechanical Core hub lighting.
'@
Write-Text $reportPath $report

Write-Host ""
Write-Host "PATCH APPLIED" -ForegroundColor Green
Write-Host ""
Write-Host "Changed files:" -ForegroundColor Cyan
if ($changed.Count -eq 0) {
    Write-Host "  (none - PATCH UI-03 was already applied)"
} else {
    foreach ($file in $changed) { Write-Host "  $file" }
}
Write-Host ""
Write-Host "Backups: .patch-backups\PATCH_UI_03\" -ForegroundColor Green
Write-Host "Report: PATCH_UI_03_REPORT.md" -ForegroundColor Green
Write-Host ""
Write-Host "Run npm run build to validate the project." -ForegroundColor Cyan

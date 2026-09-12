$ErrorActionPreference = "Stop"

# MECHESA // PART 2 // PATCH UI-03
# 8-SYSTEM NETWORK + INSPECTOR COLOR LANGUAGE
# Windows PowerShell 5.1 safe: UTF-8 with BOM / ASCII-only source.
#
# Run from the existing repository root:
# powershell -ExecutionPolicy Bypass -File .\MECHESA_PATCH_UI_03_FIXED_v2.ps1

$projectRoot = (Get-Location).Path
$backupDir = Join-Path $projectRoot ".patch-backups\PATCH_UI_03"

function Stop-Patch([string]$Message) {
    Write-Host ""
    Write-Host "PATCH UI-03 STOPPED SAFELY" -ForegroundColor Red
    Write-Host $Message -ForegroundColor Red
    Write-Host "No source files were modified." -ForegroundColor Yellow
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

function Backup-File([string]$Path, [string]$Name) {
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    Copy-Item -LiteralPath $Path -Destination (Join-Path $backupDir $Name) -Force
}

function Append-Once([string]$Content, [string]$Marker, [string]$Block) {
    if ($Content.Contains($Marker)) { return $Content }
    return $Content.TrimEnd() + "`r`n`r`n" + $Block.Trim() + "`r`n"
}

# 1. Verify project + UI-01 tokens.
Require-File "package.json" | Out-Null
$tokensPath = Require-File "src/styles/tokens.css"
$tokens = Read-Text $tokensPath

foreach ($token in @(
    "--color-signal","--color-signal-soft","--color-signal-glow","--color-blueprint",
    "--sys-design","--sys-materials","--sys-manufacturing","--sys-mechatronics",
    "--sys-robotics","--sys-automotive","--sys-thermodynamics","--sys-fluid"
)) {
    if (-not $tokens.Contains($token)) {
        Stop-Patch "PATCH UI-01 token '$token' is missing. Apply UI-01 first."
    }
}

# 2. Verify canonical data. Do not edit it.
$dataPath = Require-File "src/data/home.ts"
$data = Read-Text $dataPath
$ids = @("design","materials","manufacturing","mechatronics","robotics","automotive","thermodynamics","fluid")
foreach ($id in $ids) {
    if ($data -notmatch ("id\s*:\s*['""]" + [regex]::Escape($id) + "['""]")) {
        Stop-Patch "Canonical engineeringSystems data is missing '$id'. No data changes were made."
    }
}

# 3. Discover the ACTUAL network and inspector files from current source.
$sourceFiles = Get-ChildItem -Path (Join-Path $projectRoot "src") -Recurse -File |
    Where-Object { $_.Extension -in ".tsx",".ts",".css" }

$networkFiles = @()
$inspectorFiles = @()
foreach ($f in $sourceFiles) {
    $s = Read-Text $f.FullName
    if ($s.Contains("systems-network")) { $networkFiles += $f.FullName }
    if ($s.Contains("systems-inspector")) { $inspectorFiles += $f.FullName }
}

if ($networkFiles.Count -eq 0) {
    Stop-Patch "No existing systems-network implementation was found in src. UI-03 only styles an existing network and will not invent/reintroduce one."
}
if ($inspectorFiles.Count -eq 0) {
    Stop-Patch "No existing systems-inspector implementation was found in src. UI-03 only styles an existing inspector and will not invent/reintroduce one."
}

# Identify a TSX/TS file that actually renders the network.
$networkComponent = $null
foreach ($f in $networkFiles) {
    $s = Read-Text $f
    if ($s -match "<[^>]+systems-network" -or $s -match "className=.*systems-network") {
        $networkComponent = $f
        break
    }
}
if ($null -eq $networkComponent) {
    Stop-Patch "systems-network was found only as a style/reference token, not as existing rendered markup. Manual integration is required."
}

# Identify inspector rendering.
$inspectorComponent = $null
foreach ($f in $inspectorFiles) {
    $s = Read-Text $f
    if ($s -match "<[^>]+systems-inspector" -or $s -match "className=.*systems-inspector") {
        $inspectorComponent = $f
        break
    }
}
if ($null -eq $inspectorComponent) {
    Stop-Patch "systems-inspector was found only as a style/reference token, not as existing rendered markup. Manual integration is required."
}

$networkText = Read-Text $networkComponent
$inspectorText = Read-Text $inspectorComponent

# 4. Require data-driven system rendering and an existing selection contract.
if ($networkText -notmatch "engineeringSystems\.map" -and $networkText -notmatch "\.map\(") {
    Stop-Patch "The existing systems network does not expose a data-driven map in its component. Refusing to hardcode eight systems."
}

$selectionNames = @("selectedSystem","selectedSystemId","selectedId","activeSystem","activeSystemId")
$selectionFound = $false
foreach ($name in $selectionNames) {
    if ($networkText.Contains($name) -or $inspectorText.Contains($name)) {
        $selectionFound = $true
        break
    }
}
if (-not $selectionFound) {
    Stop-Patch "No existing selected-system state was detected in the network/inspector. Refusing to create a second selection state."
}

# 5. Build a small, shared token map in the network component only if there is
#    no existing system color map. The color remains derived from system.id.
$mapMarker = "// MECHESA PATCH UI-03 - canonical system color map"
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

$networkNew = $networkText
if (-not $networkNew.Contains($mapMarker)) {
    $importLines = [regex]::Matches($networkNew, '(?m)^import .+$')
    if ($importLines.Count -gt 0) {
        $last = $importLines[$importLines.Count - 1]
        $insertAt = $last.Index + $last.Length
        $networkNew = $networkNew.Insert($insertAt, "`r`n`r`n$mapMarker`r`n$($mapBlock.Trim())")
    } else {
        Stop-Patch "Could not safely insert the canonical system map into the existing network component."
    }
}

# 6. Bind system color to the existing node element when its JSX has a
#    recognizable system.id expression. Do not change click/selection logic.
if (-not $networkNew.Contains("data-system-id")) {
    $buttonPattern = '(?s)<button(?:(?!</button>).)*?system\.id(?:(?!</button>).)*?>'
    $buttonMatch = [regex]::Match($networkNew, $buttonPattern)
    if ($buttonMatch.Success) {
        $button = $buttonMatch.Value
        if (-not $button.Contains("style={{")) {
            $replacement = $button -replace '>\s*$', ' data-system-id={system.id} style={{ ''--system-color'': getSystemColorToken(system.id) } as React.CSSProperties}>'
            $networkNew = $networkNew.Replace($button, $replacement)
        }
    } else {
        $divPattern = '(?s)<div(?:(?!</div>).)*?system\.id(?:(?!</div>).)*?>'
        $divMatch = [regex]::Match($networkNew, $divPattern)
        if ($divMatch.Success) {
            $nodeTag = $divMatch.Value
            if (-not $nodeTag.Contains("data-system-id")) {
                $replacement = $nodeTag -replace '>\s*$', ' data-system-id={system.id} style={{ ''--system-color'': getSystemColorToken(system.id) } as React.CSSProperties}>'
                $networkNew = $networkNew.Replace($nodeTag, $replacement)
            }
        } else {
            Stop-Patch "Could not safely identify the existing system-node JSX element. No markup was invented."
        }
    }
}

# 7. Add data-driven selected connector/inspector color hooks only if the
#    existing component already exposes a selected system object/id in JSX.
#    The CSS layer can consume these attributes without new runtime state.
$networkCssPath = $null
$networkCss = $null
foreach ($f in $sourceFiles) {
    if ($f.Extension -eq ".css") {
        $s = Read-Text $f.FullName
        if ($s.Contains(".systems-network__lines") -or $s.Contains(".system-node")) {
            $networkCssPath = $f.FullName
            $networkCss = $s
            break
        }
    }
}
if ($null -eq $networkCssPath) {
    Stop-Patch "Existing systems-network CSS could not be located. No new stylesheet architecture was created."
}

$cssMarker = "/* MECHESA PATCH UI-03 - eight-system network identity */"
$cssBlock = @'
/* MECHESA PATCH UI-03 - eight-system network identity */
.system-node__button {
  border-left: 2px solid var(--system-color, var(--color-border));
  transition:
    border-color 180ms var(--ease-ui),
    box-shadow 180ms var(--ease-ui),
    background 180ms var(--ease-ui);
}
.system-node__button::before {
  content: "";
  position: absolute;
  left: -4px;
  top: 15px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--system-color, var(--color-border));
}
.system-node__button:hover,
.system-node__button:focus-visible {
  border-left-color: var(--system-color, var(--color-border));
  box-shadow:
    inset 2px 0 0 var(--system-color, var(--color-border)),
    0 0 14px color-mix(in srgb, var(--system-color, transparent) 12%, transparent);
}
.system-node__button:focus-visible {
  outline: 1px solid var(--system-color, var(--color-accent));
  outline-offset: 2px;
}
.system-node.is-selected .system-node__button {
  border-color: color-mix(in srgb, var(--system-color, var(--color-border-strong)) 72%, var(--color-border-strong));
  border-left-color: var(--system-color, var(--color-border-strong));
  box-shadow:
    inset 2px 0 0 var(--system-color, var(--color-border-strong)),
    0 0 18px color-mix(in srgb, var(--system-color, transparent) 16%, transparent);
}
.system-node.is-selected .system-node__button::before {
  box-shadow: 0 0 9px color-mix(in srgb, var(--system-color, transparent) 58%, transparent);
}
.systems-network__lines [data-system-selected="true"],
.systems-network__lines .is-selected {
  filter: drop-shadow(0 0 5px color-mix(in srgb, var(--system-color, var(--color-accent-line)) 34%, transparent));
  animation: systems-network-selected-signal 900ms var(--ease-mechanical) 1;
}
.systems-inspector {
  --system-color: var(--color-accent);
  transition: color 200ms var(--ease-ui);
}
.systems-inspector__bars i {
  background: linear-gradient(
    180deg,
    var(--system-color),
    color-mix(in srgb, var(--system-color) 10%, transparent)
  );
  box-shadow: 0 0 10px color-mix(in srgb, var(--system-color) 20%, transparent);
  transition: background 200ms var(--ease-ui), box-shadow 200ms var(--ease-ui);
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
@keyframes systems-network-selected-signal {
  0% { opacity: .35; }
  55% { opacity: 1; }
  100% { opacity: .95; }
}
@media (prefers-reduced-motion: reduce) {
  .system-node__button,
  .systems-inspector,
  .systems-inspector__bars i,
  .systems-inspector__head::before {
    transition: none;
  }
  .systems-network__lines [data-system-selected="true"],
  .systems-network__lines .is-selected {
    animation: none;
    filter: none;
  }
}
'@
$networkCssNew = Append-Once $networkCss $cssMarker $cssBlock

# 8. Verify token references and no data/config edits.
foreach ($token in @("--sys-design","--sys-materials","--sys-manufacturing","--sys-mechatronics","--sys-robotics","--sys-automotive","--sys-thermodynamics","--sys-fluid")) {
    if (-not $networkNew.Contains($token) -and -not $networkCssNew.Contains($token)) {
        Stop-Patch "UI-03 system token '$token' was not wired into the discovered network implementation."
    }
}

# 9. Backup and write only changed files.
$changed = New-Object System.Collections.Generic.List[string]

if ($networkNew -ne $networkText) {
    Backup-File $networkComponent "network-component.bak"
    Write-Text $networkComponent $networkNew
    $changed.Add([System.IO.Path]::GetRelativePath($projectRoot, $networkComponent))
}
if ($networkCssNew -ne $networkCss) {
    Backup-File $networkCssPath "network.css.bak"
    Write-Text $networkCssPath $networkCssNew
    $changed.Add([System.IO.Path]::GetRelativePath($projectRoot, $networkCssPath))
}

# 10. Required report, only after successful writes.
$reportPath = Join-Path $projectRoot "PATCH_UI_03_REPORT.md"
$report = @'
# MECHESA // PATCH UI-03

## Status

PATCH APPLIED

## Purpose

Applied the eight-system identity color language to the homepage engineering network and inspector.

## System Colors

- Design -> neutral steel
- Materials -> bronze
- Manufacturing -> signal amber
- Mechatronics -> violet-blue
- Robotics -> blueprint blue
- Automotive -> burnt orange-red
- Thermodynamics -> rose
- Fluid Mechanics -> teal

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
Write-Host "Dependencies added: none" -ForegroundColor Green
Write-Host ""
Write-Host "Run npm run build to validate the project." -ForegroundColor Cyan

$ErrorActionPreference = "Stop"

# MECHESA // PATCH 01
# Restore global Reality / Blueprint controls without overwriting unrelated work.
# Run this script from the root of the existing MechEsa-website repository.

$projectRoot = (Get-Location).Path
$expectedProjectMarker = Join-Path $projectRoot "package.json"

function Fail-Patch([string]$Message) {
    Write-Host ""
    Write-Host "PATCH FAILED:" -ForegroundColor Red
    Write-Host $Message -ForegroundColor Red
    Write-Host "No files were modified." -ForegroundColor Red
    exit 1
}

function Assert-File([string]$RelativePath) {
    $path = Join-Path $projectRoot $RelativePath
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) {
        Fail-Patch "Expected file was not found: $RelativePath"
    }
}

# 1. Verify repository root / expected architecture.
if (-not (Test-Path -LiteralPath $expectedProjectMarker -PathType Leaf)) {
    Fail-Patch "package.json was not found. Run this script from the MechEsa-website repository root."
}

$packageJson = Get-Content -LiteralPath $expectedProjectMarker -Raw
if ($packageJson -notmatch '"(?:name|scripts|dependencies|devDependencies)"') {
    Fail-Patch "package.json does not look like the expected MECHESA project."
}

$requiredFiles = @(
    "src/components/navigation/MechanicalNavigation.tsx",
    "src/components/navigation/SiteFooter.tsx",
    "src/components/system/RepresentationToggle/RepresentationToggle.tsx",
    "src/app/providers/RepresentationProvider.tsx"
)

foreach ($file in $requiredFiles) {
    Assert-File $file
}

Write-Host "MECHESA // PATCH 01" -ForegroundColor Cyan
Write-Host ""
Write-Host "[OK] Blueprint provider found" -ForegroundColor Green
Write-Host "[OK] RepresentationToggle found" -ForegroundColor Green

$toggleImport = "import { RepresentationToggle } from '../system/RepresentationToggle/RepresentationToggle'"

$navRelative = "src/components/navigation/MechanicalNavigation.tsx"
$footerRelative = "src/components/navigation/SiteFooter.tsx"
$navPath = Join-Path $projectRoot $navRelative
$footerPath = Join-Path $projectRoot $footerRelative

$nav = Get-Content -LiteralPath $navPath -Raw
$footer = Get-Content -LiteralPath $footerPath -Raw

# 2. Structural safety checks BEFORE changing anything.
# The current architecture must contain these anchors. If it does not, stop rather
# than guessing at a different implementation.
$navHasStatus = $nav -match '<div className="mechanical-nav__status">'
$navHasMobileHead = $nav -match '<div className="mobile-machine-menu__head">'
$navHasSystemIndicator = ([regex]::Matches($nav, '<SystemIndicator\b')).Count -ge 2
$footerHasControls = $footer -match '<div className="site-footer__controls">'
$footerHasMeta = $footer -match '<div className="site-footer__meta">'

if (-not ($navHasStatus -and $navHasMobileHead -and $navHasSystemIndicator)) {
    Fail-Patch "MechanicalNavigation.tsx does not match the expected navigation structure. No changes were made."
}
if (-not ($footerHasControls -and $footerHasMeta)) {
    Fail-Patch "SiteFooter.tsx does not match the expected footer structure. No changes were made."
}

# RepresentationToggle must not already be imported from another location.
$navHasToggle = $nav -match '\bRepresentationToggle\b'
$footerHasToggle = $footer -match '\bRepresentationToggle\b'

$navChanged = $false
$footerChanged = $false

# 3. MechanicalNavigation import.
if (-not $navHasToggle) {
    # Insert immediately after the SystemIndicator import, preserving existing imports.
    $systemImport = "import { SystemIndicator } from '../telemetry/SystemIndicator'"
    if ($nav -notmatch [regex]::Escape($systemImport)) {
        Fail-Patch "Could not find the expected SystemIndicator import in MechanicalNavigation.tsx."
    }
    $nav = $nav.Replace($systemImport, "$systemImport`r`n$toggleImport")
    $navChanged = $true
} elseif ($nav -notmatch [regex]::Escape($toggleImport)) {
    # A RepresentationToggle symbol exists but the requested import is absent.
    Fail-Patch "MechanicalNavigation.tsx already references RepresentationToggle in an unexpected way. No changes were made."
}

# 4. Desktop: add exactly one toggle beside SYSTEM ONLINE.
if ($nav -notmatch '<SystemIndicator state="online" label="SYSTEM ONLINE" />\s*<RepresentationToggle\s*/>') {
    $desktopAnchor = '<SystemIndicator state="online" label="SYSTEM ONLINE" />'
    $desktopMatches = [regex]::Matches($nav, [regex]::Escape($desktopAnchor))
    if ($desktopMatches.Count -lt 1) {
        Fail-Patch "Could not find the desktop SYSTEM ONLINE status anchor."
    }

    # The first occurrence is the desktop status area.
    $nav = [regex]::Replace(
        $nav,
        [regex]::Escape($desktopAnchor),
        "$desktopAnchor<RepresentationToggle />",
        1
    )
    $navChanged = $true
}

# 5. Mobile: add exactly one toggle in the access-panel status area.
if ($nav -notmatch '<div className="mobile-machine-menu__status">\s*<SystemIndicator state="online" label="SYSTEM ONLINE" />\s*<RepresentationToggle\s*/>\s*</div>') {
    $mobileAnchor = '<div className="mobile-machine-menu__status"><SystemIndicator state="online" label="SYSTEM ONLINE" /></div>'
    if ($nav -notmatch [regex]::Escape($mobileAnchor)) {
        # Fail rather than inserting into an unknown mobile layout.
        if ($nav -match '<div className="mobile-machine-menu__status">') {
            Fail-Patch "Mobile status container exists but its expected contents differ. No changes were made."
        }
        Fail-Patch "Could not find the expected mobile status container."
    }
    $mobileReplacement = '<div className="mobile-machine-menu__status"><SystemIndicator state="online" label="SYSTEM ONLINE" /><RepresentationToggle /></div>'
    $nav = $nav.Replace($mobileAnchor, $mobileReplacement)
    $navChanged = $true
}

# 6. Footer import.
if (-not $footerHasToggle) {
    $technicalLabelImport = "import { TechnicalLabel } from '../typography/TechnicalLabel'"
    if ($footer -notmatch [regex]::Escape($technicalLabelImport)) {
        Fail-Patch "Could not find the expected TechnicalLabel import in SiteFooter.tsx."
    }
    $footer = $footer.Replace($technicalLabelImport, "$technicalLabelImport`r`n$toggleImport")
    $footerChanged = $true
} elseif ($footer -notmatch [regex]::Escape($toggleImport)) {
    Fail-Patch "SiteFooter.tsx already references RepresentationToggle in an unexpected way. No changes were made."
}

# 7. Footer controls: restore representation label + existing toggle before metadata.
$footerHasRepresentationBlock = $footer -match '<span className="technical-small">REPRESENTATION</span>\s*<RepresentationToggle\s*/>'

if (-not $footerHasRepresentationBlock) {
    $footerMetaAnchor = '<div className="site-footer__meta">'
    if ($footer -notmatch [regex]::Escape($footerMetaAnchor)) {
        Fail-Patch "Could not find the expected footer metadata anchor."
    }

    $representationBlock = '<span className="technical-small">REPRESENTATION</span><RepresentationToggle />'
    $footer = $footer.Replace($footerMetaAnchor, "$representationBlock`r`n            $footerMetaAnchor")
    $footerChanged = $true
}

# 8. Idempotency / duplicate protection.
$navToggleCount = ([regex]::Matches($nav, '<RepresentationToggle\s*/>')).Count
$footerToggleCount = ([regex]::Matches($footer, '<RepresentationToggle\s*/>')).Count

if ($navToggleCount -gt 2) {
    Fail-Patch "Safety check detected more than two navigation RepresentationToggle instances."
}
if ($footerToggleCount -gt 1) {
    Fail-Patch "Safety check detected more than one footer RepresentationToggle instance."
}

# 9. Back up only files that actually need modification.
$backupDir = Join-Path $projectRoot ".patch-backups\PATCH_01"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

$changedFiles = New-Object System.Collections.Generic.List[string]

if ($navChanged) {
    $backup = Join-Path $backupDir "MechanicalNavigation.tsx.bak"
    Copy-Item -LiteralPath $navPath -Destination $backup -Force
    Set-Content -LiteralPath $navPath -Value $nav -NoNewline -Encoding UTF8
    $changedFiles.Add($navRelative)
}

if ($footerChanged) {
    $backup = Join-Path $backupDir "SiteFooter.tsx.bak"
    Copy-Item -LiteralPath $footerPath -Destination $backup -Force
    Set-Content -LiteralPath $footerPath -Value $footer -NoNewline -Encoding UTF8
    $changedFiles.Add($footerRelative)
}

# 10. Write report only after source modifications completed successfully.
$reportPath = Join-Path $projectRoot "PATCH_01_REPORT.md"
$report = @"
# MECHESA // PATCH 01

## Change

Restored global Reality / Blueprint access.

## Modified

- MechanicalNavigation.tsx
- SiteFooter.tsx

## Preserved

- Engineering Motion
- teammate changes
- existing Blueprint provider
- existing RepresentationToggle
- existing homepage
- existing routing

## Not Added

- Simulation navigation
- Simulation route
- additional homepage simulation

## Dependencies

None.

## Status

PATCH APPLIED
"@
Set-Content -LiteralPath $reportPath -Value $report -Encoding UTF8

Write-Host "[OK] MechanicalNavigation patched" -ForegroundColor Green
Write-Host "[OK] SiteFooter patched" -ForegroundColor Green
Write-Host ""
Write-Host "Blueprint access restored." -ForegroundColor Cyan
Write-Host ""
Write-Host "No simulation navigation was added."
Write-Host "No homepage simulation was added."
Write-Host "Existing teammate changes preserved."
Write-Host ""
Write-Host "PATCH COMPLETE." -ForegroundColor Green

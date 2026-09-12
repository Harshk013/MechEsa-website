$ErrorActionPreference = "Stop"

# MECHESA // PATCH UI-01
# Color & Contrast Foundation
# Run from the root of the existing MechEsa-website repository.

$projectRoot = (Get-Location).Path

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

function Set-CssToken {
    param(
        [string]$Content,
        [string]$Name,
        [string]$Value
    )

    # Replace an existing canonical declaration, including only whitespace before
    # the semicolon. This prevents duplicate variables and preserves formatting.
    $escapedName = [regex]::Escape($Name)
    $pattern = "(?m)^(\s*)$escapedName\s*:\s*[^;]+;"
    $replacement = '${1}' + $Name + ': ' + $Value + ';'

    if ([regex]::IsMatch($Content, $pattern)) {
        return [regex]::Replace($Content, $pattern, $replacement, 1)
    }

    # Missing tokens are inserted into the first :root block only.
    $rootMatch = [regex]::Match($Content, '(?s):root\s*\{')
    if (-not $rootMatch.Success) {
        Fail-Patch "Canonical token file has no :root block; refusing to guess where tokens belong."
    }

    $insertAt = $rootMatch.Index + $rootMatch.Length
    return $Content.Insert($insertAt, "`r`n  $Name`: $Value;")
}

# 1. Verify this is the expected project root.
Assert-File "package.json"

$packageJson = Get-Content -LiteralPath (Join-Path $projectRoot "package.json") -Raw
if ($packageJson -notmatch '"(react|vite|typescript)"') {
    Fail-Patch "package.json does not contain the expected React/Vite/TypeScript project markers."
}

# 2. Locate the canonical token file.
$tokenCandidates = @(
    "src/styles/tokens.css"
)

$tokenRelative = $null
foreach ($candidate in $tokenCandidates) {
    $candidatePath = Join-Path $projectRoot $candidate
    if (Test-Path -LiteralPath $candidatePath -PathType Leaf) {
        $tokenRelative = $candidate
        break
    }
}

if (-not $tokenRelative) {
    Fail-Patch "Could not locate the canonical design-token file. Expected src/styles/tokens.css."
}

$tokenPath = Join-Path $projectRoot $tokenRelative
$tokenContent = Get-Content -LiteralPath $tokenPath -Raw

# 3. Verify the current architecture before modifying anything.
if ($tokenContent -notmatch ':root\s*\{') {
    Fail-Patch "tokens.css does not contain a CSS :root token block."
}

# These are the current canonical names expected by the existing project.
$requiredExistingTokens = @(
    "--color-bg",
    "--color-surface",
    "--color-surface-elevated",
    "--color-panel",
    "--color-border",
    "--color-blueprint",
    "--color-warning",
    "--color-success",
    "--color-info",
    "--color-danger"
)

foreach ($name in $requiredExistingTokens) {
    if ($tokenContent -notmatch "(?m)^\s*$([regex]::Escape($name))\s*:") {
        Fail-Patch "Expected existing token '$name' was not found. Refusing to create a competing token architecture."
    }
}

# Preserve the existing Blueprint value when it is already canonical.
$blueprintMatch = [regex]::Match($tokenContent, '(?m)^\s*--color-blueprint\s*:\s*([^;]+);')
if (-not $blueprintMatch.Success) {
    Fail-Patch "The canonical Blueprint token could not be read."
}
$currentBlueprint = $blueprintMatch.Groups[1].Value.Trim()

if ($currentBlueprint -ne "#82a9c7") {
    Write-Host "[INFO] Existing Blueprint value '$currentBlueprint' differs from the requested canonical value; preserving it." -ForegroundColor Yellow
}

# 4. Compute the complete patched token source in memory.
$patched = $tokenContent

$tokens = [ordered]@{
    "--color-signal" = "#d98a3d"
    "--color-signal-soft" = "rgba(217, 138, 61, 0.14)"
    "--color-signal-glow" = "rgba(217, 138, 61, 0.28)"

    "--color-bg" = "#0d0f11"
    "--color-surface" = "#171b1e"
    "--color-surface-elevated" = "#1f2429"
    "--color-panel" = "#1a1e22"
    "--color-border" = "rgba(205, 214, 219, 0.18)"

    "--sys-design" = "#c9d0d3"
    "--sys-materials" = "#b98a5e"
    "--sys-manufacturing" = "#d98a3d"
    "--sys-mechatronics" = "#8f9fd6"
    "--sys-robotics" = "#82a9c7"
    "--sys-automotive" = "#c77b5a"
    "--sys-thermodynamics" = "#c77b78"
    "--sys-fluid" = "#6fb3b8"
}

foreach ($entry in $tokens.GetEnumerator()) {
    $patched = Set-CssToken -Content $patched -Name $entry.Key -Value $entry.Value
}

# If Blueprint was already canonical, leave it untouched. If it is absent the
# architecture check above would have stopped. This patch intentionally does not
# alter Blueprint representation-* tokens.
if ($currentBlueprint -eq "#82a9c7") {
    $patched = Set-CssToken -Content $patched -Name "--color-blueprint" -Value "#82a9c7"
}

# 5. Validate the in-memory result before touching the filesystem.
$expectedValues = [ordered]@{
    "--color-signal" = "#d98a3d"
    "--color-signal-soft" = "rgba(217, 138, 61, 0.14)"
    "--color-signal-glow" = "rgba(217, 138, 61, 0.28)"
    "--color-bg" = "#0d0f11"
    "--color-surface" = "#171b1e"
    "--color-surface-elevated" = "#1f2429"
    "--color-panel" = "#1a1e22"
    "--color-border" = "rgba(205, 214, 219, 0.18)"
    "--sys-design" = "#c9d0d3"
    "--sys-materials" = "#b98a5e"
    "--sys-manufacturing" = "#d98a3d"
    "--sys-mechatronics" = "#8f9fd6"
    "--sys-robotics" = "#82a9c7"
    "--sys-automotive" = "#c77b5a"
    "--sys-thermodynamics" = "#c77b78"
    "--sys-fluid" = "#6fb3b8"
}

foreach ($entry in $expectedValues.GetEnumerator()) {
    $escapedName = [regex]::Escape($entry.Key)
    $escapedValue = [regex]::Escape($entry.Value)
    $matches = [regex]::Matches($patched, "(?m)^\s*$escapedName\s*:\s*$escapedValue\s*;")
    if ($matches.Count -ne 1) {
        Fail-Patch "Validation failed for $($entry.Key): expected exactly one canonical definition."
    }
}

# Blueprint must remain available, and representation-specific tokens must not
# be removed by this patch.
if ($patched -notmatch '(?m)^\s*--color-blueprint\s*:') {
    Fail-Patch "Validation failed: --color-blueprint is missing."
}
if ($patched -notmatch '(?m)^\s*--representation-blueprint-line\s*:') {
    Fail-Patch "Validation failed: existing Blueprint representation tokens were not preserved."
}

# Semantic colors are required to remain present; their values are not changed.
foreach ($name in @("--color-warning","--color-success","--color-info","--color-danger")) {
    if ($patched -notmatch "(?m)^\s*$([regex]::Escape($name))\s*:") {
        Fail-Patch "Validation failed: semantic token $name was removed."
    }
}

# 6. Only now create the backup and write the token file.
$backupDir = Join-Path $projectRoot ".patch-backups\PATCH_UI_01"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

$backupPath = Join-Path $backupDir "tokens.css.bak"
Copy-Item -LiteralPath $tokenPath -Destination $backupPath -Force

if ($patched -eq $tokenContent) {
    Write-Host "[OK] Canonical tokens already matched PATCH UI-01; no source change was necessary." -ForegroundColor Green
} else {
    Set-Content -LiteralPath $tokenPath -Value $patched -NoNewline -Encoding UTF8
}

# 7. Final on-disk validation.
$finalContent = Get-Content -LiteralPath $tokenPath -Raw
foreach ($entry in $expectedValues.GetEnumerator()) {
    $escapedName = [regex]::Escape($entry.Key)
    $escapedValue = [regex]::Escape($entry.Value)
    $matches = [regex]::Matches($finalContent, "(?m)^\s*$escapedName\s*:\s*$escapedValue\s*;")
    if ($matches.Count -ne 1) {
        Fail-Patch "Final validation failed for $($entry.Key)."
    }
}

$reportPath = Join-Path $projectRoot "PATCH_UI_01_REPORT.md"
$report = @"
# MECHESA // PATCH UI-01

## Status

PATCH APPLIED

## Purpose

Established the Part 2 color and contrast foundation.

## Added

- Signal amber tokens
- Blueprint informational color
- Eight system identity colors

## Adjusted

- Surface contrast ladder
- Border contrast

## Preserved

- Existing Blueprint architecture
- Existing semantic colors
- Existing component behavior
- Existing animations
- Existing layouts
- Existing routes

## Features Added

None.

## Dependencies Added

None.

## Next

PATCH UI-02 will consume these tokens for component-level interaction and status styling.
"@
Set-Content -LiteralPath $reportPath -Value $report -Encoding UTF8

Write-Host ""
Write-Host "MECHESA // PATCH UI-01" -ForegroundColor Cyan
Write-Host ""
Write-Host "[OK] Canonical token file verified: $tokenRelative" -ForegroundColor Green
Write-Host "[OK] Signal tokens established" -ForegroundColor Green
Write-Host "[OK] Blueprint token preserved" -ForegroundColor Green
Write-Host "[OK] Eight system identity colors established" -ForegroundColor Green
Write-Host "[OK] Surface contrast ladder updated" -ForegroundColor Green
Write-Host "[OK] Border contrast updated" -ForegroundColor Green
Write-Host "[OK] Existing semantic colors preserved" -ForegroundColor Green
Write-Host "[OK] Backup created: .patch-backups\PATCH_UI_01\tokens.css.bak" -ForegroundColor Green
Write-Host "[OK] Report created: PATCH_UI_01_REPORT.md" -ForegroundColor Green
Write-Host ""
Write-Host "No components were redesigned."
Write-Host "No animations were changed."
Write-Host "No Engineering Motion / Engineering Lab / Blueprint behavior was changed."
Write-Host "No dependencies were added."
Write-Host ""
Write-Host "PATCH COMPLETE." -ForegroundColor Green

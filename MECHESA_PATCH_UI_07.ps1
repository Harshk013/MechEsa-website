# MECHESA // PATCH UI-07
# MECHANICAL POWER-ON / PAGE INITIALIZATION
#
# Run from repository root:
# powershell -ExecutionPolicy Bypass -File .\MECHESA_PATCH_UI_07.ps1

$ErrorActionPreference = "Stop"
$projectRoot = (Get-Location).Path
$backupDir = Join-Path $projectRoot ".patch-backups\PATCH_UI_07"

function Stop-Patch([string]$Message) {
    Write-Host ""
    Write-Host "==================================================" -ForegroundColor Red
    Write-Host "PATCH UI-07 STOPPED SAFELY" -ForegroundColor Red
    Write-Host "==================================================" -ForegroundColor Red
    Write-Host ""
    Write-Host $Message -ForegroundColor Yellow
    Write-Host ""
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
$initPath = Require-File "src/components/transitions/InitializationOverlay.tsx"
$globalsPath = Require-File "src/styles/globals.css"
$motionPath = Require-File "src/app/providers/MotionProvider.tsx"
$reducedPath = Require-File "src/hooks/useReducedMotion.ts"

$init = Read-Text $initPath
$globals = Read-Text $globalsPath
$motion = Read-Text $motionPath
$reduced = Read-Text $reducedPath

# Verify this is the existing transition architecture.
if ($init -notmatch "InitializationOverlay") {
    Stop-Patch "Existing InitializationOverlay component could not be verified."
}
if ($init -notmatch "AnimatePresence" -or $init -notmatch "motion\.") {
    Stop-Patch "Existing Framer Motion initialization architecture could not be verified."
}
if ($motion -notmatch "useReducedMotion" -or $reduced -notmatch "prefers-reduced-motion") {
    Stop-Patch "Existing reduced-motion architecture could not be verified."
}
if ($globals -notmatch "\.initialization\s*\{" -or $globals -notmatch "\.initialization__frame\s*\{") {
    Stop-Patch "Existing initialization CSS surface could not be verified."
}

$marker = "MECHESA PATCH UI-07"
if ($init.Contains($marker) -or $globals.Contains($marker)) {
    Write-Host ""
    Write-Host "==================================================" -ForegroundColor Green
    Write-Host "MECHESA PATCH UI-07 — ALREADY SATISFIED" -ForegroundColor Green
    Write-Host "==================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Existing UI-07 implementation marker found."
    Write-Host "No duplicate transition created."
    Write-Host ""
    Write-Host "Next step:"
    Write-Host "npm run build"
    exit 0
}

# Safety: do not patch an unknown initialization component. The current
# implementation is known and targeted below.
$requiredInitFragments = @(
    "const SESSION_KEY = 'mechesa-init-v03'",
    "useState(readInitializationState)",
    "requestAnimationFrame",
    "secondFrame = requestAnimationFrame",
    'className="initialization"'
)

foreach ($fragment in $requiredInitFragments) {
    if (-not $init.Contains($fragment)) {
        Stop-Patch "InitializationOverlay.tsx differs from the inspected architecture. Missing expected fragment: $fragment"
    }
}

# Replace only the known existing initialization component.
$newInit = @'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useMotionSettings } from '../../app/providers/MotionProvider'

const checks = ['CORE', 'MOTION SYSTEM', 'INTERFACE', 'NAVIGATION']
const SESSION_KEY = 'mechesa-init-v04'
const POWER_ON_MS = 520

function readInitializationState() {
  if (typeof window === 'undefined') return true
  try {
    return window.sessionStorage.getItem(SESSION_KEY) !== '1'
  } catch {
    return true
  }
}

export function InitializationOverlay() {
  const { reducedMotion } = useMotionSettings()
  const [visible, setVisible] = useState(readInitializationState)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!visible) return
    if (reducedMotion) {
      try { window.sessionStorage.setItem(SESSION_KEY, '1') } catch { /* Storage may be unavailable. */ }
      setVisible(false)
      return
    }
    setReady(true)
  }, [visible, reducedMotion])

  return <AnimatePresence>
    {visible && <motion.div
      className="initialization"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: .16, ease: [0.2, 0.8, 0.2, 1] }}
      onAnimationComplete={() => {
        if (!reducedMotion) {
          try { window.sessionStorage.setItem(SESSION_KEY, '1') } catch { /* Storage may be unavailable. */ }
          setVisible(false)
        }
      }}
      role="status"
      aria-live="polite"
    >
      <div className="initialization__frame">
        <div className="initialization__head">
          <span className="technical-small">MECHESA // POWER-ON</span>
          <span className="technical-small">SYSTEM 01</span>
        </div>

        <h1>ENGINEERING SYSTEM ONLINE</h1>

        <div className="initialization__checks">
          {checks.map((item) => <div key={item}>
            <span>{item}</span>
            <motion.b
              initial={{ opacity: 0, x: -3 }}
              animate={{ opacity: ready ? 1 : 0, x: ready ? 0 : -3 }}
              transition={{ duration: .12, delay: .04 }}
            >
              READY
            </motion.b>
          </div>)}
        </div>

        <div className="initialization__bar">
          <motion.i
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: POWER_ON_MS / 1000, ease: [0.2, 0.8, 0.2, 1] }}
          />
        </div>

        <div className="initialization__foot">
          <span className="technical-small">SYSTEM ONLINE</span>
          <span className="technical-small">MECHESA // ENGINEERED MOTION</span>
        </div>
      </div>
    </motion.div>}
  </AnimatePresence>
}
'@

# Use a targeted CSS replacement for only the existing initialization block.
$cssPattern = '(?s)/\* MECHESA PATCH UI-07 \*/.*?(?=\r?\n@media \(max-width: 980px\))'
if ($globals -match $cssPattern) {
    Stop-Patch "A partial UI-07 CSS block already exists but the TypeScript marker does not. Refusing to risk duplicate/partial patching."
}

$cssOld = @'
.initialization { position: fixed; inset: 0; z-index: var(--z-transition); display: grid; place-items: center; padding: 24px; background: var(--color-bg-deep); }
.initialization__frame { width: min(620px, 100%); padding: 24px; border: 1px solid var(--color-border-strong); background: linear-gradient(180deg, var(--color-panel), var(--color-panel-technical)); box-shadow: var(--shadow-deep); }
.initialization__head, .initialization__foot { display: flex; justify-content: space-between; gap: 1rem; color: var(--color-text-dim); }
.initialization h1 { margin: 42px 0 28px; max-width: 520px; font-size: clamp(1.6rem, 5vw, 3rem); line-height: .98; letter-spacing: -.035em; }
.initialization__checks { display: grid; border-top: 1px solid var(--color-border); }
.initialization__checks > div { display: flex; justify-content: space-between; gap: 1rem; padding: 11px 0; border-bottom: 1px solid var(--color-border); color: var(--color-text-muted); font: 10px/1 var(--font-mono); letter-spacing: .12em; }
.initialization__checks b { color: var(--color-accent); font-weight: 500; }
.initialization__bar { height: 2px; margin: 24px 0; background: var(--color-border); overflow: hidden; }
.initialization__bar i { display: block; height: 100%; background: var(--color-accent); transform-origin: left; box-shadow: 0 0 16px var(--color-accent-glow); }
'@

if (-not $globals.Contains($cssOld.TrimEnd())) {
    Stop-Patch "Existing initialization CSS does not match the inspected current block. Refusing broad replacement."
}

$cssNew = @'
/* MECHESA PATCH UI-07 — mechanical power-on */
.initialization { position: fixed; inset: 0; z-index: var(--z-transition); display: grid; place-items: center; padding: 20px; pointer-events: none; background: radial-gradient(circle at 50% 46%, rgba(130,169,199,.035), transparent 48%), linear-gradient(180deg, color-mix(in srgb, var(--color-bg-deep) 96%, transparent), var(--color-bg-deep)); }
.initialization::before { content: ''; position: absolute; left: 0; right: 0; top: 50%; height: 1px; background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--color-blueprint) 30%, transparent), color-mix(in srgb, var(--color-signal) 34%, transparent), transparent); transform: scaleX(.18); transform-origin: center; animation: mechesa-power-line 520ms cubic-bezier(.2,.8,.2,1) both; }
.initialization__frame { position: relative; width: min(520px, 100%); padding: 18px; border: 1px solid color-mix(in srgb, var(--color-border-strong) 72%, transparent); background: color-mix(in srgb, var(--color-panel-technical) 82%, transparent); box-shadow: var(--shadow-deep); animation: mechesa-power-frame 520ms cubic-bezier(.2,.8,.2,1) both; }
.initialization__head, .initialization__foot { display: flex; justify-content: space-between; gap: 1rem; color: var(--color-text-dim); }
.initialization h1 { margin: 26px 0 18px; max-width: 520px; font-size: clamp(1.35rem, 4vw, 2.25rem); line-height: .98; letter-spacing: -.025em; }
.initialization__checks { display: grid; border-top: 1px solid var(--color-border); }
.initialization__checks > div { display: flex; justify-content: space-between; gap: 1rem; padding: 8px 0; border-bottom: 1px solid var(--color-border); color: var(--color-text-muted); font: 9px/1 var(--font-mono); letter-spacing: .12em; }
.initialization__checks b { color: var(--color-signal); font-weight: 500; }
.initialization__bar { height: 1px; margin: 18px 0; background: var(--color-border); overflow: hidden; }
.initialization__bar i { display: block; height: 100%; background: linear-gradient(90deg, var(--color-blueprint), var(--color-signal)); transform-origin: left; box-shadow: 0 0 10px var(--color-signal-glow); }
@keyframes mechesa-power-line { 0% { transform: scaleX(.04); opacity: 0; } 22% { opacity: .7; } 100% { transform: scaleX(1); opacity: .18; } }
@keyframes mechesa-power-frame { 0% { opacity: .28; transform: translateY(5px); } 100% { opacity: 1; transform: translateY(0); } }
@media (max-width: 640px) {
  .initialization { padding: 12px; }
  .initialization__frame { width: min(460px, 100%); padding: 14px; }
  .initialization h1 { margin: 20px 0 14px; font-size: clamp(1.15rem, 7vw, 1.7rem); }
  .initialization__checks > div { padding: 7px 0; font-size: 8px; }
  .initialization__bar { margin: 14px 0; }
}
@media (prefers-reduced-motion: reduce) {
  .initialization::before, .initialization__frame { animation: none; }
  .initialization::before { transform: scaleX(1); opacity: .12; }
}
'@

$newGlobals = $globals.Replace($cssOld.TrimEnd(), $cssNew.TrimEnd())

# Backup only files being modified.
Backup-Once $initPath "src/components/transitions/InitializationOverlay.tsx"
Backup-Once $globalsPath "src/styles/globals.css"

Write-Utf8 $initPath $newInit
Write-Utf8 $globalsPath $newGlobals

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "MECHESA PATCH UI-07 COMPLETE" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Transition architecture: REUSED — existing InitializationOverlay + Framer Motion"
Write-Host "Initialization: 520ms restrained mechanical power-on"
Write-Host "First entry: SESSION-scoped via existing initialization pattern"
Write-Host "Internal navigation: UNCHANGED — existing PageTransition preserved"
Write-Host "Reduced motion: IMMEDIATE — no startup wait"
Write-Host "Mobile: SIMPLIFIED compact treatment"
Write-Host "Files modified: 2"
Write-Host " - src/components/transitions/InitializationOverlay.tsx"
Write-Host " - src/styles/globals.css"
Write-Host ""
Write-Host "Backups: .patch-backups\PATCH_UI_07"
Write-Host "Dependencies added: 0"
Write-Host "Routes/features changed: 0"
Write-Host ""
Write-Host "Next step:"
Write-Host "Run:"
Write-Host ""
Write-Host "npm run build"

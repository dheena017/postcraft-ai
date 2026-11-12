# ============================================================
#   PostCraft AI - Live Server Launcher (PowerShell)
# ============================================================
$ErrorActionPreference = "Stop"
Set-Location -Path $PSScriptRoot

Write-Host "============================================================" -ForegroundColor Magenta
Write-Host "  Starting PostCraft AI Live Development Server..." -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Magenta

try {
    node scripts/server-runner.mjs $args
} catch {
    Write-Host "`n[ERROR] Server stopped with error: $_" -ForegroundColor Red
}


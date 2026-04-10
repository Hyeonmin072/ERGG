# ERGG 백엔드 Windows 실행 파일 빌드 (PyInstaller, one-folder)
# 사용: backend 폴더에서 PowerShell로 실행
#   .\build_backend_exe.ps1
$ErrorActionPreference = "Stop"
$BackendRoot = $PSScriptRoot
Set-Location $BackendRoot

$venvPy = Join-Path $BackendRoot ".venv\Scripts\python.exe"

Write-Host "Installing PyInstaller (if needed)..."
if (Test-Path $venvPy) {
    & $venvPy -m pip install -q "pyinstaller>=6.0"
    Write-Host "Building ERGG-Backend..."
    & $venvPy -m PyInstaller --clean --noconfirm "$BackendRoot\ergg_backend.spec"
} else {
    & py -3 -m pip install -q "pyinstaller>=6.0"
    Write-Host "Building ERGG-Backend..."
    & py -3 -m PyInstaller --clean --noconfirm "$BackendRoot\ergg_backend.spec"
}

Write-Host ""
Write-Host "Done. Run: dist\ERGG-Backend\ERGG-Backend.exe"
Write-Host "Place backend\.env next to ERGG-Backend.exe (same folder as the exe) or set ERG_BACKEND_ROOT."

@echo off
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"

if not defined HOST set "HOST=0.0.0.0"
if not defined PORT set "PORT=8000"
set "ERG_BACKEND_ROOT=%~dp0"
if "%ERG_BACKEND_ROOT:~-1%"=="\" set "ERG_BACKEND_ROOT=%ERG_BACKEND_ROOT:~0,-1%"

if exist ".venv\Scripts\python.exe" (
  ".venv\Scripts\python.exe" -m uvicorn app.main:app --reload --host "!HOST!" --port "!PORT!"
  goto :done
)

where py >nul 2>&1
if !errorlevel! equ 0 (
  py -3 -m uvicorn app.main:app --reload --host "!HOST!" --port "!PORT!"
  goto :done
)

where python >nul 2>&1
if !errorlevel! equ 0 (
  python -m uvicorn app.main:app --reload --host "!HOST!" --port "!PORT!"
  goto :done
)

echo Python을 찾을 수 없습니다. 다음 중 하나를 하세요:
echo   1^) https://www.python.org/downloads/ 에서 Python 3 설치 후 PATH 등록
echo   2^) backend 폴더에서: py -3 -m venv .venv ^& .venv\Scripts\pip install ...
echo.
pause
exit /b 1

:done
if errorlevel 1 (
  echo.
  echo 서버 시작에 실패했습니다. 위 메시지를 확인하세요.
  pause
)

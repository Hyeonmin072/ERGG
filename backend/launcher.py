"""
Windows 실행 파일(PyInstaller) 또는 `python launcher.py`로 백엔드 기동.
개발 시에는 run_backend.bat + uvicorn --reload 권장.
"""
from __future__ import annotations

import os
import sys
from pathlib import Path


def _backend_root() -> Path:
    if getattr(sys, "frozen", False):
        return Path(sys.executable).resolve().parent
    return Path(__file__).resolve().parent


def main() -> None:
    root = _backend_root()
    os.chdir(root)
    os.environ["ERG_BACKEND_ROOT"] = str(root)

    host = os.environ.get("HOST", "0.0.0.0")
    port = int(os.environ.get("PORT", "8000"))

    import uvicorn

    uvicorn.run("app.main:app", host=host, port=port, reload=False)


if __name__ == "__main__":
    main()

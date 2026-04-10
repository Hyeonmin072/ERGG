# -*- mode: python ; coding: utf-8 -*-
"""PyInstaller spec: backend 폴더에서 `pyinstaller ergg_backend.spec` 실행."""
import pathlib

from PyInstaller.utils.hooks import collect_all, collect_submodules

block_cipher = None

spec_dir = pathlib.Path(SPECPATH)

datas: list = []
binaries: list = []
hiddenimports: list = list(collect_submodules("app"))


def safe_collect(name: str) -> None:
    global datas, binaries, hiddenimports
    try:
        d, b, h = collect_all(name)
        datas += d
        binaries += b
        hiddenimports += h
    except Exception:
        pass


for pkg in (
    "uvicorn",
    "fastapi",
    "starlette",
    "httpx",
    "httpcore",
    "h11",
    "sqlalchemy",
    "asyncpg",
    "redis",
    "supabase",
    "pydantic",
    "pydantic_settings",
    "anyio",
    "certifi",
    "idna",
    "sniffio",
    "gotrue",
    "postgrest",
    "realtime",
    "storage3",
    "supabase_auth",
    "jwt",
    "cryptography",
    "google_generativeai",
    "numpy",
    "xgboost",
):
    safe_collect(pkg)

hiddenimports += [
    "uvicorn.protocols.http.h11_impl",
    "uvicorn.protocols.websockets.websockets_impl",
    "uvicorn.loops.auto",
]

a = Analysis(
    ["launcher.py"],
    pathex=[str(spec_dir)],
    binaries=binaries,
    datas=datas,
    hiddenimports=hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name="ERGG-Backend",
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=False,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=False,
    upx_exclude=[],
    name="ERGG-Backend",
)

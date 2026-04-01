"""
character 테이블의 nameKo를 한국어명으로 채운다.

소스:
- frontend/lib/characterDefaultMini.ts 의
  COMBO_CHARACTER_DEFAULT_DIRS 매핑(예: "재키": "001.Jackie")
"""

from __future__ import annotations

import os
import re
from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client


def _norm(s: str) -> str:
    return re.sub(r"[^a-z0-9]", "", s.lower())


def load_ko_to_english_alias() -> dict[str, str]:
    ts_path = Path(__file__).resolve().parents[1] / "frontend" / "lib" / "characterDefaultMini.ts"
    text = ts_path.read_text(encoding="utf-8")
    # 예:  재키: "001.Jackie",
    pattern = re.compile(r'^\s*("?[^"\n]+"?)\s*:\s*"(\d{3})\.([^"]+)"', re.MULTILINE)
    aliases: dict[str, str] = {}
    for m in pattern.finditer(text):
        raw_ko = m.group(1).strip()
        ko = raw_ko.strip('"')
        eng = m.group(3)
        aliases[_norm(eng)] = ko

    # 파일명/로마자 표기 차이 보정
    aliases[_norm("Hyunwoo")] = "현우"
    aliases[_norm("Isaac")] = "아이작"
    aliases[_norm("Ian")] = "이안"
    aliases[_norm("Kenneth")] = "케네스"
    aliases[_norm("Nia")] = "니아"
    return aliases


def main() -> None:
    load_dotenv(Path(__file__).resolve().parent / ".env")

    url = os.getenv("SUPABASE_URL", "").strip() or os.getenv("NEXT_PUBLIC_SUPABASE_URL", "").strip()
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip()
    if not url or not key:
        raise RuntimeError("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 설정 필요")

    sb = create_client(url, key)
    aliases = load_ko_to_english_alias()
    if not aliases:
        raise RuntimeError("한국어명 매핑 로딩 실패")

    # 이전 잘못 매핑을 제거하고 다시 채운다.
    sb.table("character").update({"nameKo": None}).neq("characterNum", -1).execute()

    rows = sb.table("character").select("characterNum,name").execute().data or []
    updated = 0
    for row in rows:
        cnum = row.get("characterNum")
        en_name = str(row.get("name") or "")
        ko = aliases.get(_norm(en_name))
        if not ko:
            continue
        sb.table("character").update({"nameKo": ko}).eq("characterNum", cnum).execute()
        updated += 1
    print(f"[done] nameKo update attempts: {updated}")


if __name__ == "__main__":
    main()

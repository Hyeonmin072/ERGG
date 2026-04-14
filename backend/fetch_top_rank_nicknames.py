"""
BSER Open API /v1/rank/top/{seasonId}/{matchingTeamMode} 를 호출해
상위 랭킹 유저 닉네임을 CSV로 저장한다.

DAK.GG Playwright 크롤러(dakgg_leaderboard_crawler.py) 대체용.

실행:
  python3 backend/fetch_top_rank_nicknames.py

출력:
  backend/dakgg_asia_season10_top1000.csv  (헤더: nickname)
"""

from __future__ import annotations

import csv
import os
from pathlib import Path

import httpx
from dotenv import load_dotenv

# ── 설정 ───────────────────────────────────────────────────────
# 시즌·모드 변경 시 여기만 수정
SEASON_ID = 37        # BSER API 내부 시즌 번호
TEAM_MODE = 3         # 1=솔로 2=듀오 3=스쿼드
BASE_URL = "https://open-api.bser.io"
OUT_CSV = Path(__file__).resolve().parent / "dakgg_asia_season10_top1000.csv"
TIMEOUT_SEC = 20.0
# ───────────────────────────────────────────────────────────────


def fetch_top_ranks(api_key: str) -> list[dict]:
    url = f"{BASE_URL}/v1/rank/top/{SEASON_ID}/{TEAM_MODE}"
    with httpx.Client(
        headers={"x-api-key": api_key, "Accept": "application/json"},
        timeout=TIMEOUT_SEC,
        follow_redirects=True,
    ) as client:
        resp = client.get(url)
        resp.raise_for_status()
    data = resp.json()
    if data.get("code") != 200:
        raise RuntimeError(
            f"API 오류 code={data.get('code')} message={data.get('message')}"
        )
    return data.get("topRanks", [])


def save_nicknames(rows: list[dict], path: Path) -> int:
    nicknames = [
        r["nickname"].strip()
        for r in rows
        if r.get("nickname", "").strip()
    ]
    with path.open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f)
        w.writerow(["nickname"])
        for nick in nicknames:
            w.writerow([nick])
    return len(nicknames)


def main() -> None:
    load_dotenv(Path(__file__).resolve().parent / ".env")

    api_key = os.getenv("ER_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError("API 키가 없습니다. backend/.env에 ER_API_KEY를 설정하세요.")

    print(f"[fetch] GET /v1/rank/top/{SEASON_ID}/{TEAM_MODE} ...")
    top_ranks = fetch_top_ranks(api_key)
    count = save_nicknames(top_ranks, OUT_CSV)
    print(f"[done]  {count}명 닉네임 저장 → {OUT_CSV}")


if __name__ == "__main__":
    main()

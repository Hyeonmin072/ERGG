"""
Fetch top ladder nicknames from BSER GET /v1/rank/top/{seasonId}/{matchingTeamMode}.

Writes: backend/dakgg_asia_season10_top1000.csv (header: nickname)

Run: python fetch_top_rank_nicknames.py
"""

from __future__ import annotations

import csv
import os
from pathlib import Path

import httpx
from dotenv import load_dotenv

SEASON_ID = 37
TEAM_MODE = 3
BASE_URL = "https://open-api.bser.io"
OUT_CSV = Path(__file__).resolve().parent / "dakgg_asia_season10_top1000.csv"
TIMEOUT_SEC = 20.0


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
            f"API error code={data.get('code')} message={data.get('message')}"
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
        raise RuntimeError("Missing ER_API_KEY (repo secret or backend/.env).")

    print(f"[fetch] GET /v1/rank/top/{SEASON_ID}/{TEAM_MODE} ...")
    top_ranks = fetch_top_ranks(api_key)
    count = save_nicknames(top_ranks, OUT_CSV)
    print(f"[done] wrote {count} nicknames -> {OUT_CSV}")


if __name__ == "__main__":
    main()

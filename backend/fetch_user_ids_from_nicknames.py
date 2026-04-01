"""
닉네임 CSV를 읽어 BSER Open API에서 userId를 수집한다.

요구사항 반영:
- 1초당 1회 요청
- 총 1000회 요청

입력:
  backend/dakgg_asia_season10_top1000.csv
  (헤더: nickname)

출력:
  backend/dakgg_asia_season10_user_ids.csv
  (nickname,userId,code,message)

실행:
  python3 backend/fetch_user_ids_from_nicknames.py
"""

from __future__ import annotations

import csv
import os
import time
import urllib.parse
from pathlib import Path

import httpx
from dotenv import load_dotenv


BASE_URL = "https://open-api.bser.io/v1/user/nickname"
INPUT_CSV = Path(__file__).resolve().parent / "dakgg_asia_season10_top1000.csv"
OUTPUT_CSV = Path(__file__).resolve().parent / "dakgg_asia_season10_user_ids.csv"
MAX_REQUESTS = 1000
REQUEST_INTERVAL_SEC = 1.0
TIMEOUT_SEC = 15.0


def load_nicknames(path: Path, limit: int) -> list[str]:
    with path.open("r", encoding="utf-8-sig", newline="") as f:
        rows = list(csv.DictReader(f))
    names = [r.get("nickname", "").strip() for r in rows]
    return [n for n in names if n][:limit]


def write_rows(path: Path, rows: list[dict[str, str | int | None]]) -> None:
    with path.open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f)
        w.writerow(["userId"])
        for r in rows:
            w.writerow([r.get("userId") or ""])


def fetch_one(client: httpx.Client, nickname: str) -> dict[str, str | int | None]:
    # 기본 시도: query 파라미터 방식
    r = client.get(BASE_URL, params={"query": nickname})
    data = r.json()

    # fallback: 사용자가 안내한 "nickname?뒤에 바로 닉네임" 방식
    if (data.get("code") != 200 or not data.get("user")) and nickname:
        raw_url = f"{BASE_URL}?{urllib.parse.quote(nickname)}"
        r2 = client.get(raw_url)
        data2 = r2.json()
        if data2.get("code") == 200 and data2.get("user"):
            data = data2

    user = data.get("user") or {}
    return {
        "nickname": nickname,
        "userId": user.get("userId"),
        "code": data.get("code"),
        "message": data.get("message"),
    }


def main() -> None:
    load_dotenv(Path(__file__).resolve().parent / ".env")

    nicknames = load_nicknames(INPUT_CSV, MAX_REQUESTS)
    if not nicknames:
        raise RuntimeError(f"닉네임이 없습니다: {INPUT_CSV}")

    # 프로젝트 표준 키명(ER_API_KEY) 우선, 과거 키명(BSER_API_KEY) fallback
    api_key = os.getenv("ER_API_KEY", "").strip() or os.getenv("BSER_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError(
            "API 키가 없습니다. backend/.env에 ER_API_KEY를 설정하세요."
        )

    headers = {"Accept": "application/json"}
    headers["x-api-key"] = api_key

    rows: list[dict[str, str | int | None]] = []
    with httpx.Client(headers=headers, timeout=TIMEOUT_SEC, follow_redirects=True) as client:
        for idx, nickname in enumerate(nicknames, start=1):
            started = time.perf_counter()
            try:
                item = fetch_one(client, nickname)
            except Exception as e:  # noqa: BLE001
                item = {
                    "nickname": nickname,
                    "userId": None,
                    "code": -1,
                    "message": f"request_error: {e}",
                }
            rows.append(item)

            # 실시간 확인 가능하도록 매 요청마다 저장
            write_rows(OUTPUT_CSV, rows)
            print(
                f"[{idx}/{len(nicknames)}] "
                f"nickname={nickname} code={item['code']} userId={'Y' if item['userId'] else 'N'}"
            )

            elapsed = time.perf_counter() - started
            sleep_for = REQUEST_INTERVAL_SEC - elapsed
            if sleep_for > 0:
                time.sleep(sleep_for)

    print(f"[done] saved={len(rows)} -> {OUTPUT_CSV}")


if __name__ == "__main__":
    main()


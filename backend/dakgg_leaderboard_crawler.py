"""
DAK.GG 이터널 리턴 랭킹(Asia / 시즌 10) 닉네임 수집 스크립트.

의존성:
  pip install playwright
  python -m playwright install chromium

실행:
  python backend/dakgg_leaderboard_crawler.py
"""

from __future__ import annotations

import csv
import logging
import re
import time
from dataclasses import dataclass
from pathlib import Path
from playwright.sync_api import Locator, Page, TimeoutError, sync_playwright


URL = "https://dak.gg/er/leaderboard"
# 닥지지 URL 쿼리 기준: Asia(서울) + 시즌10(내부 시즌 코드)
TEAM_MODE = "SQUAD"
SEASON_CODE = "SEASON_19"
SERVER_NAME = "seoul"
TARGET_COUNT = 1000
OUT_CSV = Path(__file__).resolve().parent / "dakgg_asia_season10_top1000.csv"

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] %(levelname)s %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("dakgg-crawler")


@dataclass
class LeaderboardRow:
    rank: int
    nickname: str


def _parse_rank(text: str) -> int | None:
    m = re.search(r"\b(\d{1,4})\b", text)
    if not m:
        return None
    n = int(m.group(1))
    return n if 1 <= n <= 1000 else None


def _row_candidates(page: Page) -> Locator:
    # 테이블 기반 우선, 실패 시 div row fallback
    table_rows = page.locator("table tbody tr")
    if table_rows.count() > 0:
        return table_rows
    return page.locator("[class*='leaderboard'] [class*='row']")


def _extract_rows(page: Page) -> list[LeaderboardRow]:
    rows: list[LeaderboardRow] = []
    candidates = _row_candidates(page)
    count = candidates.count()

    for i in range(count):
        row = candidates.nth(i)
        txt = row.inner_text().strip()
        if not txt:
            continue

        lines = [ln.strip() for ln in txt.splitlines() if ln.strip()]
        if not lines:
            continue

        rank = _parse_rank(lines[0])
        nickname = lines[1] if len(lines) > 1 else ""
        if not nickname:
            continue
        if rank is None:
            continue

        rows.append(LeaderboardRow(rank=rank, nickname=nickname))

    return rows


def _build_page_url(page_no: int) -> str:
    return (
        f"{URL}?teamMode={TEAM_MODE}"
        f"&season={SEASON_CODE}"
        f"&serverName={SERVER_NAME}"
        f"&page={page_no}"
    )


def crawl() -> list[LeaderboardRow]:
    seen: set[int] = set()
    result: list[LeaderboardRow] = []
    page_no = 1

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        )

        while len(result) < TARGET_COUNT:
            page_url = _build_page_url(page_no)
            logger.info("navigate page=%s url=%s", page_no, page_url)
            page.goto(page_url, wait_until="networkidle", timeout=60000)
            try:
                page.wait_for_timeout(300)
                rows = _extract_rows(page)
            except TimeoutError:
                rows = []

            if not rows:
                logger.warning("no rows extracted on page=%s, stop", page_no)
                break

            added = 0
            for row in rows:
                if row.rank in seen:
                    continue
                seen.add(row.rank)
                result.append(row)
                added += 1

            result.sort(key=lambda r: r.rank)
            result = [r for r in result if 1 <= r.rank <= TARGET_COUNT][:TARGET_COUNT]
            seen = {r.rank for r in result}

            logger.info(
                "page=%s extracted=%s added=%s collected=%s",
                page_no,
                len(rows),
                added,
                len(result),
            )
            if len(result) >= TARGET_COUNT:
                logger.info("target reached: %s", TARGET_COUNT)
                break

            # URL 기반 페이지네이션: 새 페이지에서 추가 수집이 전혀 없으면 종료
            if added == 0:
                logger.info("no new rank on page=%s, stop", page_no)
                break
            page_no += 1
            time.sleep(0.15)

        browser.close()

    return result


def save_csv(rows: list[LeaderboardRow], path: Path) -> None:
    with path.open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f)
        w.writerow(["nickname"])
        for r in sorted(rows, key=lambda x: x.rank):
            w.writerow([r.nickname])


def main() -> None:
    logger.info(
        "start crawl teamMode=%s season=%s server=%s target=%s",
        TEAM_MODE,
        SEASON_CODE,
        SERVER_NAME,
        TARGET_COUNT,
    )
    rows = crawl()
    save_csv(rows, OUT_CSV)
    logger.info("done rows=%s output=%s", len(rows), OUT_CSV)


if __name__ == "__main__":
    main()


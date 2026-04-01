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
MAX_PAGES = 60
MAX_CONSECUTIVE_EMPTY_ADDS = 6
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
    table_rows = page.locator("table tbody tr")
    if table_rows.count() > 0:
        for i in range(table_rows.count()):
            row = table_rows.nth(i)
            tds = row.locator("td")
            if tds.count() < 2:
                continue

            rank_txt = tds.nth(0).inner_text().strip()
            nick_txt = tds.nth(1).inner_text().strip()
            rank = _parse_rank(rank_txt)
            if rank is None or not nick_txt:
                continue
            rows.append(LeaderboardRow(rank=rank, nickname=nick_txt))
        return rows

    # fallback: div row 구조
    candidates = _row_candidates(page)
    for i in range(candidates.count()):
        row = candidates.nth(i)
        txt = row.inner_text().strip()
        if not txt:
            continue
        lines = [ln.strip() for ln in txt.splitlines() if ln.strip()]
        if len(lines) < 2:
            continue
        rank = _parse_rank(lines[0])
        nickname = lines[1]
        if rank is None or not nickname:
            continue
        rows.append(LeaderboardRow(rank=rank, nickname=nickname))

    return rows


def _wait_rows_ready(page: Page, timeout_ms: int = 15000) -> None:
    """
    networkidle 대신 실제 랭킹 행 렌더를 대기한다.
    닥지지 페이지는 백그라운드 요청이 이어져 networkidle 타임아웃이 자주 발생함.
    """
    table_rows = page.locator("table tbody tr")
    div_rows = page.locator("[class*='leaderboard'] [class*='row']")

    start = time.time()
    while (time.time() - start) * 1000 < timeout_ms:
        if table_rows.count() > 0 or div_rows.count() > 0:
            return
        page.wait_for_timeout(200)

    raise TimeoutError(f"rows not ready within {timeout_ms}ms")


def _build_page_url(page_no: int) -> str:
    return (
        f"{URL}?teamMode={TEAM_MODE}"
        f"&season={SEASON_CODE}"
        f"&serverName={SERVER_NAME}"
        f"&page={page_no}"
    )


def crawl() -> list[LeaderboardRow]:
    seen_nicknames: set[str] = set()
    result: list[LeaderboardRow] = []
    page_no = 1
    empty_add_streak = 0

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        )

        while len(result) < TARGET_COUNT and page_no <= MAX_PAGES:
            page_url = _build_page_url(page_no)
            logger.info("navigate page=%s url=%s", page_no, page_url)
            # NOTE: networkidle은 해당 사이트에서 안정적이지 않아 사용하지 않음
            page.goto(page_url, wait_until="domcontentloaded", timeout=60000)
            try:
                _wait_rows_ready(page, timeout_ms=20000)
                rows = _extract_rows(page)
            except TimeoutError:
                logger.warning("rows wait timeout on page=%s", page_no)
                rows = []

            if not rows:
                logger.warning("no rows extracted on page=%s, stop", page_no)
                break

            added = 0
            for row in rows:
                key = row.nickname.strip()
                if not key or key in seen_nicknames:
                    continue
                seen_nicknames.add(key)
                result.append(row)
                added += 1

            result.sort(key=lambda r: r.rank)
            result = [r for r in result if 1 <= r.rank <= TARGET_COUNT][:TARGET_COUNT]
            seen_nicknames = {r.nickname.strip() for r in result if r.nickname.strip()}
            save_csv(result, OUT_CSV)

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

            # 일부 페이지에서 파싱 실패/중복만 나오는 경우가 있어 즉시 종료하지 않는다.
            if added == 0:
                empty_add_streak += 1
                logger.warning(
                    "no new rank on page=%s (streak=%s/%s)",
                    page_no,
                    empty_add_streak,
                    MAX_CONSECUTIVE_EMPTY_ADDS,
                )
                if empty_add_streak >= MAX_CONSECUTIVE_EMPTY_ADDS:
                    logger.info("too many consecutive empty pages, stop")
                    break
            else:
                empty_add_streak = 0
            page_no += 1
            time.sleep(0.15)

        if page_no > MAX_PAGES:
            logger.info("reached max pages=%s, stop", MAX_PAGES)

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


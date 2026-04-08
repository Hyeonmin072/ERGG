"""
game_details(+games)에서 스쿼드 3인 팀 단위 데이터셋을 만들어 CSV로 저장한다.

- 한 행 = 한 판에서 한 팀(동일 gameId + teamNumber).
- 캐릭터·무기는 (characterNum, bestWeapon) 튜플 3개를 정렬해 comboKey 생성 (순서 무관).
- 1등: min(gameRank) == 1 → isFirstPlace

DB 조회: Supabase 실제 컬럼(snake_case)과 동기화 camelCase 둘 다 지원.
CSV 출력: 학습용으로 camelCase 헤더 유지.

실행:
  cd backend && python3 build_squad_combo_dataset.py

다음 단계(XGBoost):
  pip install -r requirements.txt
  python3 train_combo_xgboost.py

옵션:
  --output PATH
  --all-modes
"""

from __future__ import annotations

import argparse
import csv
from collections import defaultdict
from pathlib import Path


def _row_get(row: dict, *keys: str, default=None):
    for k in keys:
        if k in row and row[k] is not None:
            return row[k]
    return default


def _to_int(v, default: int = 0) -> int:
    if v is None:
        return default
    try:
        return int(v)
    except (TypeError, ValueError):
        return default


def _fetch_all_rows(sb, table: str, columns: str, batch_size: int = 1000) -> list[dict]:
    rows: list[dict] = []
    start = 0
    while True:
        end = start + batch_size - 1
        resp = sb.table(table).select(columns).range(start, end).execute()
        data = resp.data or []
        rows.extend(data)
        if len(data) < batch_size:
            break
        start += batch_size
    return rows


def _ranked_squad_game_ids(games_rows: list[dict]) -> set[int]:
    out: set[int] = set()
    for g in games_rows:
        mid = _to_int(_row_get(g, "matchingMode", "matching_mode"), -1)
        tid = _to_int(_row_get(g, "matchingTeamMode", "matching_team_mode"), -1)
        if mid == 3 and tid == 3:
            gid = _to_int(_row_get(g, "gameId", "game_id"), -1)
            if gid >= 0:
                out.add(gid)
    return out


def main() -> None:
    parser = argparse.ArgumentParser(description="스쿼드 3인 조합 데이터셋 CSV 생성")
    parser.add_argument(
        "--output",
        type=Path,
        default=None,
        help="출력 CSV (기본: datasets/squadComboTeams.csv)",
    )
    parser.add_argument(
        "--all-modes",
        action="store_true",
        help="랭크+스쿼드 필터 없이 game_details 전체",
    )
    args = parser.parse_args()

    backend_root = Path(__file__).resolve().parent
    out_path = args.output or (backend_root / "datasets" / "squadComboTeams.csv")
    out_path.parent.mkdir(parents=True, exist_ok=True)

    from dotenv import load_dotenv

    load_dotenv(backend_root / ".env")

    from app.clients.supabase_client import get_supabase_client

    sb = get_supabase_client()

    if not args.all_modes:
        # 실제 DB가 snake_case(game_id, …)인 경우가 많음
        games_rows = _fetch_all_rows(
            sb, "games", "game_id,matching_mode,matching_team_mode"
        )
        allowed_games = _ranked_squad_game_ids(games_rows)
        print(f"[info] 랭크 스쿼드 게임 수: {len(allowed_games)}")
    else:
        allowed_games = None
        print("[warn] --all-modes: games 필터 없음")

    gd_cols = (
        "game_id,team_number,character_num,best_weapon,game_rank,victory,user_id"
    )
    detail_rows = _fetch_all_rows(sb, "game_details", gd_cols)
    print(f"[info] game_details 행 수: {len(detail_rows)}")

    teams: dict[tuple[int, int], list[dict]] = defaultdict(list)
    skipped_mode = 0
    for r in detail_rows:
        gid = _to_int(_row_get(r, "gameId", "game_id"), -1)
        if gid < 0:
            continue
        if allowed_games is not None and gid not in allowed_games:
            skipped_mode += 1
            continue
        tid = _to_int(_row_get(r, "teamNumber", "team_number"), -1)
        if tid < 0:
            continue
        teams[(gid, tid)].append(r)

    out_rows: list[dict] = []
    skipped_n_players: dict[int, int] = defaultdict(int)
    for (gid, team_num), members in teams.items():
        n = len(members)
        if n != 3:
            skipped_n_players[n] += 1
            continue

        triples: list[tuple[int, int]] = []
        ranks: list[int] = []
        for m in members:
            c = _to_int(_row_get(m, "characterNum", "character_num"), 0)
            w = _to_int(_row_get(m, "bestWeapon", "best_weapon"), 0)
            gr = _to_int(_row_get(m, "gameRank", "game_rank"), 999)
            triples.append((c, w))
            ranks.append(gr)

        triples.sort(key=lambda t: (t[0], t[1]))
        team_rank = min(ranks)
        is_first = 1 if team_rank == 1 else 0

        (c1, w1), (c2, w2), (c3, w3) = triples
        combo_key = f"{c1}:{w1}|{c2}:{w2}|{c3}:{w3}"

        out_rows.append(
            {
                "gameId": gid,
                "teamNumber": team_num,
                "characterNum1": c1,
                "bestWeapon1": w1,
                "characterNum2": c2,
                "bestWeapon2": w2,
                "characterNum3": c3,
                "bestWeapon3": w3,
                "comboKey": combo_key,
                "gameRank": team_rank,
                "isFirstPlace": is_first,
            }
        )

    print(f"[info] 모드 필터로 제외된 행(대략): {skipped_mode}")
    print(f"[info] 팀 수(정확히 3인): {len(out_rows)}")
    if skipped_n_players:
        print(f"[info] 인원 수 != 3 인 팀: {dict(skipped_n_players)}")

    fieldnames = [
        "gameId",
        "teamNumber",
        "characterNum1",
        "bestWeapon1",
        "characterNum2",
        "bestWeapon2",
        "characterNum3",
        "bestWeapon3",
        "comboKey",
        "gameRank",
        "isFirstPlace",
    ]
    with out_path.open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        w.writerows(out_rows)

    first_count = sum(1 for r in out_rows if r["isFirstPlace"] == 1)
    print(f"[done] 저장: {out_path} (1등 팀 {first_count} / {len(out_rows)})")


if __name__ == "__main__":
    main()

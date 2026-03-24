"""
옥타곤 6축 점수 산출 서비스.
최근 20게임 game_detail 레코드를 입력받아 0~100 점수 + 등급을 반환한다.
"""
from __future__ import annotations
from dataclasses import dataclass
from typing import Any


@dataclass
class OctagonResult:
    combat: float
    takedown: float
    hunting: float
    vision: float
    mastery: float
    survival: float
    center_grade: str
    games_analyzed: int


def _clamp(v: float) -> float:
    return max(0.0, min(100.0, v))


def _grade(avg: float) -> str:
    if avg >= 85: return "S+"
    if avg >= 75: return "S"
    if avg >= 65: return "A+"
    if avg >= 55: return "A"
    if avg >= 45: return "B+"
    if avg >= 35: return "B"
    if avg >= 25: return "C+"
    return "C"


def calculate(game_details: list[dict[str, Any]]) -> OctagonResult:
    """
    game_details: list of dicts with fields from GameDetail model.
    Returns OctagonResult with 0-100 scores.
    """
    n = len(game_details)
    if n == 0:
        return OctagonResult(0, 0, 0, 0, 0, 0, "C", 0)

    def avg(field: str, default: float = 0.0) -> float:
        return sum(g.get(field, default) for g in game_details) / n

    # ── 1. 전투 (Combat) ─────────────────────────────────────────────────────
    # avg damage * 0.6 + avg kill * 8.0 * 0.4
    raw_combat = (avg("damage_to_player") / 1000) * 0.6 + avg("player_kill") * 8.0 * 0.4

    # ── 2. 결투 (Takedown) ────────────────────────────────────────────────────
    # kill participation + tactical skill usage per minute
    participations = []
    for g in game_details:
        tk = max(g.get("team_kill", 0), 1)
        kp = min((g.get("player_kill", 0) + g.get("player_assistant", 0)) / tk, 1.0)
        participations.append(kp)
    avg_participation = sum(participations) / n

    avg_tac = avg("tactical_skill_use_count")
    avg_pt = max(avg("play_time"), 60)
    tac_per_min = avg_tac / (avg_pt / 60)
    raw_takedown = avg_participation * 100 * 0.5 + min(tac_per_min * 100, 100) * 0.5

    # ── 3. 사냥 (Hunting) ────────────────────────────────────────────────────
    raw_hunting = avg("monster_kill") * 4.0 * 0.5 + (avg("total_gain_vf_credit") / 300) * 50 * 0.5

    # ── 4. 시야 (Vision) ─────────────────────────────────────────────────────
    cameras = avg("add_surveillance_camera") + avg("add_telephoto_camera")
    raw_vision = cameras * 10 * 0.6 + avg("view_contribution") * 20 * 0.4

    # ── 5. 마스터리 (Mastery) ─────────────────────────────────────────────────
    raw_mastery = avg("best_weapon_level") * 5.0 * 0.6 + (avg("character_level") / 20 * 100) * 0.4

    # ── 6. 생존 (Survival) ───────────────────────────────────────────────────
    avg_rank = avg("game_rank")
    rank_pct = (1 - (avg_rank - 1) / 23) * 100
    raw_survival = rank_pct * 0.6 + (avg("survivable_time") / 600 * 100) * 0.4

    scores = [
        _clamp(raw_combat),
        _clamp(raw_takedown),
        _clamp(raw_hunting),
        _clamp(raw_vision),
        _clamp(raw_mastery),
        _clamp(raw_survival),
    ]
    grade = _grade(sum(scores) / 6)

    return OctagonResult(
        combat=round(scores[0], 1),
        takedown=round(scores[1], 1),
        hunting=round(scores[2], 1),
        vision=round(scores[3], 1),
        mastery=round(scores[4], 1),
        survival=round(scores[5], 1),
        center_grade=grade,
        games_analyzed=n,
    )

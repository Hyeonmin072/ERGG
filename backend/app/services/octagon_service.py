"""
옥타곤 5축 점수 산출 서비스.

- 입력: 최대 20판(랭크 모드 필터는 라우터에서 선행). **각 지표는 판마다 계산한 뒤 산술평균**으로 집계한다.
- 교전·사냥·시야·생존·내구 (무기/캐릭터 레벨 기반 '마스터리' 축은 제거 — 교전·사냥과 정보 중복)
"""
from __future__ import annotations
from dataclasses import dataclass
from typing import Any


@dataclass
class OctagonResult:
    engagement: float
    hunting: float
    vision: float
    survival: float
    sustain: float
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


def _pick(g: dict[str, Any], *names: str, default: Any = 0) -> Any:
    for n in names:
        if n in g and g[n] is not None:
            return g[n]
    return default


def normalize_er_user_game_for_octagon(g: dict[str, Any]) -> dict[str, Any]:
    """
    ER /v1/user/games 응답(userGames 원소)은 camelCase.
    calculate()는 snake_case game_detail 키를 기대하므로 통일한다.
    """
    tac = _pick(g, "tacticalSkillUseCount", "tactical_skill_use_count", default=None)
    if tac is None:
        tac = int(_pick(g, "tacticalSkillLevel", "tactical_skill_level", default=0) or 0)

    return {
        "damage_to_player": float(_pick(g, "damageToPlayer", "damage_to_player", default=0) or 0),
        "damage_to_player_skill": float(_pick(g, "damageToPlayer_skill", "damage_to_player_skill", default=0) or 0),
        "player_kill": int(_pick(g, "playerKill", "player_kill", default=0) or 0),
        "team_kill": int(_pick(g, "teamKill", "team_kill", default=0) or 0),
        "player_assistant": int(_pick(g, "playerAssistant", "player_assistant", default=0) or 0),
        "tactical_skill_use_count": float(tac),
        "play_time": float(_pick(g, "playTime", "play_time", default=0) or 0),
        "monster_kill": int(_pick(g, "monsterKill", "monster_kill", default=0) or 0),
        "total_gain_vf_credit": float(_pick(g, "totalGainVFCredit", "total_gain_vf_credit", default=0) or 0),
        "add_surveillance_camera": int(_pick(g, "addSurveillanceCamera", "add_surveillance_camera", default=0) or 0),
        "add_telephoto_camera": int(_pick(g, "addTelephotoCamera", "add_telephoto_camera", default=0) or 0),
        "view_contribution": float(_pick(g, "viewContribution", "view_contribution", default=0) or 0),
        "game_rank": int(_pick(g, "gameRank", "game_rank", default=0) or 0),
        "survivable_time": float(_pick(g, "survivableTime", "survivable_time", default=0) or 0),
        "cc_time_to_player": float(_pick(g, "ccTimeToPlayer", "cc_time_to_player", default=0) or 0),
        "heal_amount": float(_pick(g, "healAmount", "heal_amount", default=0) or 0),
        "protect_absorb": float(_pick(g, "protectAbsorb", "protect_absorb", default=0) or 0),
        "team_recover": float(_pick(g, "teamRecover", "team_recover", default=0) or 0),
    }


def calculate(game_details: list[dict[str, Any]]) -> OctagonResult:
    """
    game_details: list of dicts with fields from normalize_er_user_game_for_octagon / GameDetail.
    Returns OctagonResult with 0-100 scores (5 axes).
    """
    n = len(game_details)
    if n == 0:
        return OctagonResult(0, 0, 0, 0, 0, "C", 0)

    def avg(field: str, default: float = 0.0) -> float:
        return sum(g.get(field, default) for g in game_details) / n

    DPM_CAP = 2200.0
    KILL_CAP = 8.0
    ASSIST_CAP = 12.0
    CC_CAP = 5.0

    # ── 서브: 전투 출력 (DPM·킬·스킬딜 비중) ──────────────────────────────────
    dpms: list[float] = []
    skill_shares: list[float] = []
    for g in game_details:
        dtp = float(g.get("damage_to_player", 0) or 0)
        pt_min = max(float(g.get("play_time", 0) or 0) / 60.0, 1.0 / 60.0)
        dpms.append(dtp / pt_min)
        dsk = float(g.get("damage_to_player_skill", 0) or 0)
        skill_shares.append(0.0 if dtp <= 0 else min(dsk / dtp, 1.0))

    avg_dpm = sum(dpms) / n
    avg_kill = avg("player_kill")
    avg_skill_share = sum(skill_shares) / n
    s_dpm = min(avg_dpm / DPM_CAP, 1.0) * 100.0
    s_kill = min(avg_kill / KILL_CAP, 1.0) * 100.0
    s_skill = avg_skill_share * 100.0
    raw_output = s_dpm * 0.45 + s_kill * 0.35 + s_skill * 0.20

    # ── 서브: 교전 기여 (킬관여·어시·전술·CC) ─────────────────────────────────
    participations: list[float] = []
    for g in game_details:
        tk = max(g.get("team_kill", 0), 1)
        kp = min((g.get("player_kill", 0) + g.get("player_assistant", 0)) / tk, 1.0)
        participations.append(kp)
    avg_participation = sum(participations) / n
    avg_tac = avg("tactical_skill_use_count")
    avg_pt = max(avg("play_time"), 60)
    tac_per_min = avg_tac / (avg_pt / 60)
    s_tac = min(tac_per_min * 25.0, 100.0)
    avg_assist = avg("player_assistant")
    s_assist = min(avg_assist / ASSIST_CAP, 1.0) * 100.0
    avg_cc = avg("cc_time_to_player")
    s_cc = min(avg_cc / CC_CAP, 1.0) * 100.0
    raw_engagement_dim = (
        avg_participation * 100.0 * 0.42
        + s_tac * 0.33
        + s_assist * 0.20
        + s_cc * 0.05
    )

    # ── 1. 교전 (전투·결투 통합) ──
    raw_engagement = 0.50 * raw_output + 0.50 * raw_engagement_dim

    # ── 2. 사냥 ── (동물킬 평균 50+ 구간을 중·상으로: MK/VF 각각 0~100 정규화 후 합성)
    MK_CAP = 88.0
    VF_CAP = 460.0
    avg_mk = avg("monster_kill")
    avg_vf_gain = avg("total_gain_vf_credit")
    s_mk = min(avg_mk / MK_CAP, 1.0) * 100.0
    s_vf = min(avg_vf_gain / VF_CAP, 1.0) * 100.0
    raw_hunting = s_mk * 0.50 + s_vf * 0.50

    # ── 3. 시야 ── (이터니티급 평균 시야축 ≈25점이 되도록 view·카메라 가중 완화)
    cam_avg = avg("add_surveillance_camera") + avg("add_telephoto_camera")
    view_avg = avg("view_contribution")
    raw_vision = cam_avg * 5.5 + view_avg * 0.48

    # ── 4. 생존 ──
    avg_rank = avg("game_rank")
    rank_pct = (1 - (avg_rank - 1) / 23) * 100
    raw_survival = rank_pct * 0.6 + (avg("survivable_time") / 600 * 100) * 0.4

    # ── 5. 내구 (회복·보호·팀 회복, HPM 평균) ──
    hpms: list[float] = []
    for g in game_details:
        h = float(g.get("heal_amount", 0) or 0)
        pt_m = max(float(g.get("play_time", 0) or 0) / 60.0, 1.0 / 60.0)
        hpms.append(h / pt_m)
    avg_hpm = sum(hpms) / n
    s_heal = min(avg_hpm / 1200.0, 1.0) * 100.0
    avg_prot = avg("protect_absorb")
    s_absorb = min(avg_prot / 2800.0, 1.0) * 100.0
    avg_tr = avg("team_recover")
    s_team_rec = min(avg_tr / 900.0, 1.0) * 100.0
    raw_sustain = s_heal * 0.50 + s_absorb * 0.35 + s_team_rec * 0.15

    scores = [
        _clamp(raw_engagement),
        _clamp(raw_hunting),
        _clamp(raw_vision),
        _clamp(raw_survival),
        _clamp(raw_sustain),
    ]
    grade = _grade(sum(scores) / 5)

    return OctagonResult(
        engagement=round(scores[0], 1),
        hunting=round(scores[1], 1),
        vision=round(scores[2], 1),
        survival=round(scores[3], 1),
        sustain=round(scores[4], 1),
        center_grade=grade,
        games_analyzed=n,
    )

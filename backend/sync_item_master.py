"""
ER Open API ItemWeapon/ItemArmor -> Supabase item 테이블 동기화.

저장 컬럼:
- type: weapon | armor
- kind: 무기군(Dagger...) / 방어구 부위(Head/Chest/Arm/Leg)
- name_kr: 아이템 한글 이름
- name_en: 아이템 영어 이름
- image_path: 프론트 정적 이미지 경로(/images/...)
- code: 아이템 코드

실행:
  cd backend && PYTHONPATH=. python3 sync_item_master.py

l10n (선택):
  리포트 루트에 l10n-English.txt / l10n-Korean.txt 가 있으면 Item/Name/{code} 키로
  name_en / name_kr 을 대조해 저장하고, 영문명 기준으로 image_path 를 맞춘다.
  경로는 L10N_EN_PATH / L10N_KR_PATH 로 재정의 가능.
"""

from __future__ import annotations

import os
import re
import unicodedata
import time
import random
import csv
from difflib import SequenceMatcher
from pathlib import Path
from typing import Any
from time import perf_counter

import httpx
from dotenv import load_dotenv
from supabase import create_client

BASE_URL = "https://open-api.bser.io"
_LAST_REQUEST_TS: float = 0.0
_MIN_REQUEST_INTERVAL_SEC = 1.05  # ER Open API: 초당 1회 제한 대응
WEAPON_KIND_TO_FOLDER: dict[str, str] = {
    "OneHandSword": "01. Dagger",
    "TwoHandSword": "02. Two-handed Sword",
    "Axe": "03. Axe",
    "DualSword": "04. Dual Swords",
    "Pistol": "05. Pistol",
    "AssaultRifle": "06. Assault Rifle",
    "SniperRifle": "07. Sniper Rifle",
    "Rapier": "08. Rapier",
    "Spear": "09. Spear",
    "Hammer": "10. Hammer",
    "Bat": "11. Bat",
    "HighAngleFire": "12. Throw",
    "DirectFire": "13. Shuriken",
    "Bow": "14. Bow",
    "CrossBow": "15. Crossbow",
    "Glove": "16. Glove",
    "Tonfa": "17. Tonfa",
    "Guitar": "18. Guitar",
    "Nunchaku": "19. Nunchaku",
    "Whip": "20. Whip",
    "Camera": "21. Camera",
    "Arcana": "22. Arcana",
    "VFArm": "23. VF Prosthetic",
}
ARMOR_KIND_TO_FOLDER: dict[str, str] = {
    "Chest": "01. Chest",
    "Head": "02. Head",
    "Arm": "03. Arm, Accessory",
    "Leg": "04. Leg",
}

L10N_ITEM_NAME_PREFIX = "Item/Name/"
# l10n 줄 구분자(세로 막대 U+2503)
L10N_SEP = "\u2503"


def _log(msg: str) -> None:
    print(f"[sync_item_master] {msg}")


def _respect_rate_limit() -> None:
    global _LAST_REQUEST_TS
    now = perf_counter()
    elapsed = now - _LAST_REQUEST_TS
    if elapsed < _MIN_REQUEST_INTERVAL_SEC:
        wait_s = _MIN_REQUEST_INTERVAL_SEC - elapsed
        _log(f"요청 간격 대기: {wait_s:.2f}s")
        time.sleep(wait_s)
    _LAST_REQUEST_TS = perf_counter()


def _extract_rows(payload: Any) -> list[dict[str, Any]]:
    if isinstance(payload, dict) and isinstance(payload.get("data"), list):
        return [x for x in payload["data"] if isinstance(x, dict)]
    if isinstance(payload, list):
        return [x for x in payload if isinstance(x, dict)]
    return []


def _fetch_data(endpoint: str, api_key: str, locale: str) -> list[dict[str, Any]]:
    headers = {"accept": "application/json"}
    if api_key:
        headers["x-api-key"] = api_key
    with httpx.Client(timeout=30.0) as client:
        _log(f"조회 시작: {endpoint} locale={locale}")
        t0 = perf_counter()
        max_attempts = 6
        for attempt in range(1, max_attempts + 1):
            _respect_rate_limit()
            resp = client.get(f"{BASE_URL}{endpoint}", params={"locale": locale}, headers=headers)
            if resp.status_code == 429:
                wait_s = min(2 ** attempt, 30) + random.uniform(0, 0.6)
                _log(f"요청 제한(429): {endpoint} locale={locale} 시도={attempt}/{max_attempts} 대기={wait_s:.1f}s")
                time.sleep(wait_s)
                continue
            resp.raise_for_status()
            rows = _extract_rows(resp.json())
            _log(f"조회 완료: {endpoint} locale={locale} rows={len(rows)} 소요={perf_counter()-t0:.2f}s")
            return rows
        raise RuntimeError(f"조회 실패(429 반복): {endpoint} locale={locale}")


def _weapon_kind_from_row(row: dict[str, Any]) -> str:
    # v2/data/ItemWeapon 에 weaponType(type 문자열)가 포함될 수 있어 우선 사용
    raw = row.get("weaponType") or row.get("type")
    if raw is None:
        return "UnknownWeapon"
    return str(raw).strip() or "UnknownWeapon"


def _armor_kind_from_row(row: dict[str, Any]) -> str:
    raw = row.get("armorType")
    if raw is None:
        return "UnknownArmor"
    return str(raw).strip() or "UnknownArmor"


def _name_from_row(row: dict[str, Any], fallback: str) -> str:
    name = row.get("name")
    if name is None:
        return fallback
    out = str(name).strip()
    return out if out else fallback


def _optional_name_from_row(row: dict[str, Any]) -> str | None:
    if not row:
        return None
    name = row.get("name")
    if name is None:
        return None
    out = str(name).strip()
    return out or None


def _parse_numbered_pngs(folder: Path, web_prefix: str) -> list[tuple[int, str, str]]:
    out: list[tuple[int, str, str]] = []
    if not folder.exists():
        return out
    for p in folder.glob("*.png"):
        m = re.match(r"^(\d+)\.\s*(.+)\.png$", p.name)
        if not m:
            continue
        idx = int(m.group(1))
        name_en = m.group(2).strip()
        out.append((idx, name_en, f"{web_prefix}/{p.name}"))
    out.sort(key=lambda x: x[0])
    return out


def _collect_numbered_pngs_recursive(
    item_root: Path,
    *,
    weapons: bool,
    exclude_weapon_group: bool = True,
) -> list[tuple[int, str, str]]:
    """
    `NNN. 영문이름.png` 만 수집. 파일명에서 순번을 떼면 영문 표기(스템) — l10n name_en 과 동일 비교용.
    무기: 00. Weapon Group(타입 아이콘)은 기본 제외.
    """
    sub = "01. Weapons" if weapons else "02. Armor"
    base = item_root / sub
    out: list[tuple[int, str, str]] = []
    if not base.is_dir():
        return out
    for p in base.rglob("*.png"):
        if exclude_weapon_group and weapons and "00. Weapon Group" in p.parts:
            continue
        m = re.match(r"^(\d+)\.\s*(.+)\.png$", p.name)
        if not m:
            continue
        idx = int(m.group(1))
        stem = m.group(2).strip()
        rel = p.relative_to(item_root)
        web = "/images/Item/" + rel.as_posix()
        out.append((idx, stem, web))
    out.sort(key=lambda x: (x[2], x[0]))
    return out


def _nfc(s: str) -> str:
    return unicodedata.normalize("NFC", (s or "").strip())


def _normalize_name(s: str) -> str:
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode("ascii")
    s = s.lower().replace("&", " and ").replace("_", " ").replace("-", " ")
    s = re.sub(r"[^a-z0-9 ]+", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def _parse_l10n_item_names(path: Path) -> dict[int, str]:
    """
    l10n-*.txt 에서 Item/Name/{code}┃표시이름 줄만 추출.
    """
    if not path.is_file():
        return {}
    out: dict[int, str] = {}
    with path.open("r", encoding="utf-8", errors="replace") as f:
        for raw in f:
            line = raw.strip("\r\n")
            if not line.startswith(L10N_ITEM_NAME_PREFIX):
                continue
            sep_idx = line.find(L10N_SEP)
            if sep_idx < 0:
                continue
            key_part = line[len(L10N_ITEM_NAME_PREFIX) : sep_idx]
            val = line[sep_idx + len(L10N_SEP) :].strip()
            if not val:
                continue
            m = re.fullmatch(r"(\d+)", key_part.strip())
            if not m:
                continue
            code = int(m.group(1))
            out[code] = val
    return out


def _apply_l10n_names(
    rows: list[dict[str, Any]],
    en_by_code: dict[int, str],
    kr_by_code: dict[int, str],
) -> int:
    """행에 l10n 기반 name_kr / name_en 반영. 반환: 갱신된 행 수(이름이 하나라도 바뀐 경우 카운트)."""
    n = 0
    for row in rows:
        code = int(row["code"])
        changed = False
        if code in kr_by_code:
            row["name_kr"] = kr_by_code[code]
            changed = True
        if code in en_by_code:
            row["name_en"] = en_by_code[code]
            changed = True
        if changed:
            n += 1
    return n


def _l10n_en_matches_png_stem(name_en: str, file_stem: str) -> bool:
    """
    l10n `Item/Name` 영문과 파일명에서 순번(`NNN. `)을 뺀 스템이 같은지.
    macOS 파일명 NFD vs l10n NFC 차이는 NFC로 통일 후 비교.
    """
    a = _nfc(name_en)
    b = _nfc(file_stem)
    if not a or not b:
        return False
    if a.casefold() == b.casefold():
        return True
    na = _normalize_name(a)
    nb = _normalize_name(b)
    return bool(na) and na == nb


def _apply_l10n_image_mapping(rows: list[dict[str, Any]], backend_dir: Path) -> None:
    """
    l10n name_en 과 `NNN. {영문}.png` 스템이 같으면 해당 image_path 저장 (유사도 없음).
    먼저 API kind에 해당하는 하위 폴더만 보고, 없으면 무기/방어구 트리 전체에서 동일 규칙으로 재탐색.
    """
    _log("l10n 영문명 기준 이미지 매핑 시작 (스템=영문 일치, 폴더 우선 후 전체 탐색)")
    repo_root = backend_dir.parent
    item_root = repo_root / "frontend" / "public" / "images" / "Item"
    weapon_root = item_root / "01. Weapons"
    armor_root = item_root / "02. Armor"

    all_weapon_pngs = _collect_numbered_pngs_recursive(item_root, weapons=True)
    all_armor_pngs = _collect_numbered_pngs_recursive(item_root, weapons=False)

    grouped: dict[tuple[str, str], list[dict[str, Any]]] = {}
    for row in rows:
        grouped.setdefault((str(row.get("type")), str(row.get("kind"))), []).append(row)
    for arr in grouped.values():
        arr.sort(key=lambda r: int(r["code"]))

    def pick_png(name_en: str, pngs: list[tuple[int, str, str]]) -> str | None:
        ne = name_en.strip()
        if not ne or not pngs:
            return None
        for _, stem, web in pngs:
            if _l10n_en_matches_png_stem(ne, stem):
                return web
        return None

    filled = 0
    for kind, folder in WEAPON_KIND_TO_FOLDER.items():
        arr = grouped.get(("weapon", kind))
        if not arr:
            continue
        local_pngs = _parse_numbered_pngs(weapon_root / folder, f"/images/Item/01. Weapons/{folder}")
        for row in arr:
            if row.get("image_path"):
                continue
            ne = (row.get("name_en") or "").strip()
            if not ne:
                continue
            path = pick_png(ne, local_pngs) or pick_png(ne, all_weapon_pngs)
            if path:
                row["image_path"] = path
                filled += 1

    for kind, folder in ARMOR_KIND_TO_FOLDER.items():
        arr = grouped.get(("armor", kind))
        if not arr:
            continue
        local_pngs = _parse_numbered_pngs(armor_root / folder, f"/images/Item/02. Armor/{folder}")
        for row in arr:
            if row.get("image_path"):
                continue
            ne = (row.get("name_en") or "").strip()
            if not ne:
                continue
            path = pick_png(ne, local_pngs) or pick_png(ne, all_armor_pngs)
            if path:
                row["image_path"] = path
                filled += 1

    _log(f"l10n 영문명 이미지 매핑 완료: 신규 설정 {filled}건")


def _translate_ko_to_en(text: str, cache: dict[str, str]) -> str | None:
    t = text.strip()
    if not t:
        return None
    if t in cache:
        return cache[t]
    try:
        resp = httpx.get(
            "https://translate.googleapis.com/translate_a/single",
            params={
                "client": "gtx",
                "sl": "ko",
                "tl": "en",
                "dt": "t",
                "q": t,
            },
            timeout=10.0,
        )
        resp.raise_for_status()
        body = resp.json()
        # [[["translated","original",...]],...]
        translated = "".join(part[0] for part in (body[0] or []) if isinstance(part, list) and part)
        out = translated.strip() or None
        cache[t] = out or ""
        return out
    except Exception:
        cache[t] = ""
        return None


def _score_name_match(target: str, candidate: str) -> float:
    nt = _normalize_name(target)
    nc = _normalize_name(candidate)
    if not nt or not nc:
        return 0.0
    ratio = SequenceMatcher(None, nt, nc).ratio()
    # token overlap bonus
    ts = set(nt.split())
    cs = set(nc.split())
    if ts and cs:
        overlap = len(ts & cs) / len(ts)
        ratio = max(ratio, (ratio * 0.7) + (overlap * 0.3))
    return ratio


def _apply_local_image_mapping(rows: list[dict[str, Any]], backend_dir: Path) -> None:
    _log("휴리스틱 이미지 매핑 시작")
    repo_root = backend_dir.parent
    item_root = repo_root / "frontend" / "public" / "images" / "Item"
    weapon_root = item_root / "01. Weapons"
    armor_root = item_root / "02. Armor"

    grouped: dict[tuple[str, str], list[dict[str, Any]]] = {}
    for row in rows:
        grouped.setdefault((str(row.get("type")), str(row.get("kind"))), []).append(row)
    for arr in grouped.values():
        arr.sort(key=lambda r: int(r["code"]))
    _log(f"그룹 분류 완료: {len(grouped)}개 그룹")

    translate_cache: dict[str, str] = {}
    strict_min_score = float(os.getenv("ITEM_MAP_MIN_SCORE", "0.80"))
    strict_min_gap = float(os.getenv("ITEM_MAP_MIN_GAP", "0.08"))
    review_rows: list[dict[str, Any]] = []

    def apply_group(arr: list[dict[str, Any]], pngs: list[tuple[int, str, str]]) -> None:
        if not arr or not pngs:
            return
        # row별 best/second 후보를 구해 고신뢰만 자동 반영
        row_infos: list[dict[str, Any]] = []
        for ri, row in enumerate(arr):
            if row.get("image_path"):
                row_infos.append({"ri": ri, "cands": [], "translated_en": "", "skip": True})
                continue
            base_name_en = (row.get("name_en") or "").strip()
            translated_en = _translate_ko_to_en(str(row.get("name_kr") or ""), translate_cache) or ""
            targets = [x for x in [base_name_en, translated_en] if x]
            if not targets:
                row_infos.append({"ri": ri, "cands": [], "translated_en": translated_en})
                continue
            cands: list[tuple[float, int]] = []  # (score, png_idx)
            for pi, (_, file_name_en, _) in enumerate(pngs):
                score = max(_score_name_match(t, file_name_en) for t in targets)
                if score >= 0.55:
                    cands.append((score, pi))
            cands.sort(reverse=True, key=lambda x: x[0])
            row_infos.append({"ri": ri, "cands": cands, "translated_en": translated_en})

        used_rows: set[int] = set()
        used_pngs: set[int] = set()

        # 1차: 고신뢰 후보만 반영
        strong_pool: list[tuple[float, float, int, int]] = []  # (score, gap, ri, pi)
        for info in row_infos:
            cands = info["cands"]
            if not cands:
                continue
            best_score, best_pi = cands[0]
            second_score = cands[1][0] if len(cands) > 1 else 0.0
            gap = best_score - second_score
            if best_score >= strict_min_score and gap >= strict_min_gap:
                strong_pool.append((best_score, gap, info["ri"], best_pi))
        strong_pool.sort(reverse=True, key=lambda x: (x[0], x[1]))

        for score, gap, ri, pi in strong_pool:
            if ri in used_rows or pi in used_pngs:
                continue
            _, file_name_en, image_path = pngs[pi]
            row = arr[ri]
            row["image_path"] = image_path
            if not row.get("name_en"):
                row["name_en"] = file_name_en
            used_rows.add(ri)
            used_pngs.add(pi)

        # 2차: 미매칭/저신뢰 항목은 리포트로 남김
        for info in row_infos:
            if info.get("skip"):
                continue
            ri = info["ri"]
            if ri in used_rows:
                continue
            row = arr[ri]
            cands = info["cands"]
            if cands:
                best_score, best_pi = cands[0]
                _, best_name, best_path = pngs[best_pi]
                second_score = cands[1][0] if len(cands) > 1 else 0.0
                gap = best_score - second_score
            else:
                best_score, second_score, gap, best_name, best_path = 0.0, 0.0, 0.0, "", ""
            review_rows.append(
                {
                    "type": row.get("type"),
                    "kind": row.get("kind"),
                    "code": row.get("code"),
                    "name_kr": row.get("name_kr"),
                    "translated_en": info.get("translated_en") or "",
                    "best_score": f"{best_score:.4f}",
                    "second_score": f"{second_score:.4f}",
                    "score_gap": f"{gap:.4f}",
                    "best_candidate_name": best_name,
                    "best_candidate_path": best_path,
                    "reason": "low_confidence_or_ambiguous",
                }
            )
        _log(f"그룹 매핑 결과: 행={len(arr)} 이미지={len(pngs)} 자동매칭={len(used_rows)} 검토대상={len(arr)-len(used_rows)}")

    for kind, folder in WEAPON_KIND_TO_FOLDER.items():
        arr = grouped.get(("weapon", kind))
        if not arr:
            continue
        _log(f"무기 그룹 처리: {kind} ({folder}) 행={len(arr)}")
        pngs = _parse_numbered_pngs(weapon_root / folder, f"/images/Item/01. Weapons/{folder}")
        apply_group(arr, pngs)

    for kind, folder in ARMOR_KIND_TO_FOLDER.items():
        arr = grouped.get(("armor", kind))
        if not arr:
            continue
        _log(f"방어구 그룹 처리: {kind} ({folder}) 행={len(arr)}")
        pngs = _parse_numbered_pngs(armor_root / folder, f"/images/Item/02. Armor/{folder}")
        apply_group(arr, pngs)
    if review_rows:
        review_path = backend_dir / "item_mapping_review.csv"
        with review_path.open("w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(
                f,
                fieldnames=[
                    "type",
                    "kind",
                    "code",
                    "name_kr",
                    "translated_en",
                    "best_score",
                    "second_score",
                    "score_gap",
                    "best_candidate_name",
                    "best_candidate_path",
                    "reason",
                ],
            )
            writer.writeheader()
            writer.writerows(review_rows)
        _log(f"검토 리포트 저장: {review_path} ({len(review_rows)}건)")
    _log(f"휴리스틱 이미지 매핑 완료; 번역 캐시={len(translate_cache)}개")


def _merge_locale_rows(
    type_name: str,
    rows_kr: list[dict[str, Any]],
    rows_en: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    en_by_code: dict[int, dict[str, Any]] = {}
    for row in rows_en:
        code = row.get("code")
        if code is None:
            continue
        try:
            en_by_code[int(code)] = row
        except (TypeError, ValueError):
            continue

    out: list[dict[str, Any]] = []
    for row in rows_kr:
        code = row.get("code")
        if code is None:
            continue
        try:
            code_i = int(code)
        except (TypeError, ValueError):
            continue
        en_row = en_by_code.get(code_i, {})
        if type_name == "weapon":
            kind = _weapon_kind_from_row(row)
            fallback = f"Weapon {code_i}"
        else:
            kind = _armor_kind_from_row(row)
            fallback = f"Armor {code_i}"
        out.append(
            {
                "type": type_name,
                "kind": kind,
                "name_kr": _name_from_row(row, fallback),
                # ER v2 Item API는 locale=en 이어도 name이 한글인 경우가 많아
                # 동일값이면 영문명 부재로 보고 NULL 저장한다.
                "name_en": (
                    None
                    if (_optional_name_from_row(en_row) is None)
                    else (
                        None
                        if _optional_name_from_row(en_row) == _name_from_row(row, fallback)
                        else _optional_name_from_row(en_row)
                    )
                ),
                "image_path": None,
                "code": code_i,
            }
        )
    return out


def build_item_rows(api_key: str, backend_dir: Path) -> list[dict[str, Any]]:
    weapon_rows_kr = _fetch_data("/v2/data/ItemWeapon", api_key, "ko")
    # Item API는 locale=en 이어도 name이 한글로 오는 경우가 많아 추가 호출 생략(요청량 절감).
    weapon_rows_en: list[dict[str, Any]] = []
    armor_rows_kr = _fetch_data("/v2/data/ItemArmor", api_key, "ko")
    armor_rows_en: list[dict[str, Any]] = []

    out: list[dict[str, Any]] = []
    out.extend(_merge_locale_rows("weapon", weapon_rows_kr, weapon_rows_en))
    out.extend(_merge_locale_rows("armor", armor_rows_kr, armor_rows_en))
    # type+code 기준 중복 방지
    uniq: dict[tuple[str, int], dict[str, Any]] = {}
    for row in out:
        uniq[(row["type"], row["code"])] = row
    rows = list(uniq.values())

    repo_root = backend_dir.parent
    l10n_env = os.getenv("ENABLE_L10N", "true").strip().lower()
    enable_l10n = l10n_env in {"1", "true", "yes", "on", ""}
    if enable_l10n:
        en_path = Path(os.getenv("L10N_EN_PATH", str(repo_root / "l10n-English.txt")))
        kr_path = Path(os.getenv("L10N_KR_PATH", str(repo_root / "l10n-Korean.txt")))
        en_map = _parse_l10n_item_names(en_path)
        kr_map = _parse_l10n_item_names(kr_path)
        if en_map or kr_map:
            n = _apply_l10n_names(rows, en_map, kr_map)
            _log(
                f"l10n 이름 적용: 파일 EN={en_path.name}({len(en_map)}키) KR={kr_path.name}({len(kr_map)}키) 갱신행={n}"
            )
        else:
            _log(f"l10n 이름 스킵: EN/KR 파일 없음 또는 Item/Name 항목 없음 ({en_path}, {kr_path})")

    l10n_img_env = os.getenv("ENABLE_L10N_IMAGE_MAPPING", "true").strip().lower()
    if l10n_img_env in {"1", "true", "yes", "on", ""}:
        _apply_l10n_image_mapping(rows, backend_dir)

    # 순서 추정·번역 기반 매핑은 아이템별 오매칭 가능성이 있어 기본 비활성화.
    # 필요 시 환경변수 ENABLE_HEURISTIC_IMAGE_MAPPING=true 로 켠다 (image_path 미설정 행만).
    if os.getenv("ENABLE_HEURISTIC_IMAGE_MAPPING", "").strip().lower() in {"1", "true", "yes", "on"}:
        _apply_local_image_mapping(rows, backend_dir)

    return rows


def _apply_db_overrides(rows: list[dict[str, Any]], sb_client) -> None:
    """
    item_image_override(type, code)의 image_path/name_en 를 최우선 반영.
    """
    try:
        _log("오버라이드 조회 시작: item_image_override")
        resp = (
            sb_client.table("item_image_override")
            .select("type,code,image_path,name_en")
            .execute()
        )
        data = resp.data or []
        _log(f"오버라이드 조회 완료: {len(data)}행")
    except Exception:
        _log("오버라이드 조회 실패: 건너뜀")
        return

    ov_map: dict[tuple[str, int], dict[str, Any]] = {}
    for r in data:
        try:
            t = str((r or {}).get("type") or "").strip()
            c = int((r or {}).get("code"))
        except (TypeError, ValueError):
            continue
        if t not in {"weapon", "armor"} or c <= 0:
            continue
        ov_map[(t, c)] = r

    if not ov_map:
        return

    for row in rows:
        key = (str(row.get("type")), int(row.get("code") or 0))
        ov = ov_map.get(key)
        if not ov:
            continue
        image_path = (ov.get("image_path") or "").strip() if isinstance(ov.get("image_path"), str) else None
        if image_path:
            row["image_path"] = image_path
        name_en = (ov.get("name_en") or "").strip() if isinstance(ov.get("name_en"), str) else None
        if name_en:
            row["name_en"] = name_en
    _log(f"오버라이드 적용 완료: {len(ov_map)}개 키")


def main() -> None:
    all_t0 = perf_counter()
    env_path = Path(__file__).resolve().parent / ".env"
    load_dotenv(env_path)

    api_key = os.getenv("ER_API_KEY", "").strip()
    supabase_url = os.getenv("SUPABASE_URL", "").strip() or os.getenv("NEXT_PUBLIC_SUPABASE_URL", "").strip()
    service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip()

    if not supabase_url or not service_key:
        raise RuntimeError("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 설정이 필요합니다.")

    backend_dir = Path(__file__).resolve().parent
    _log("아이템 행 생성 시작")
    rows = build_item_rows(api_key, backend_dir)
    _log(f"아이템 행 생성 완료: 총 {len(rows)}행")
    if not rows:
        raise RuntimeError("ItemWeapon/ItemArmor 데이터가 비어 있습니다.")

    sb = create_client(supabase_url, service_key)
    _log("DB 오버라이드 적용 시작")
    _apply_db_overrides(rows, sb)
    _log("item 업서트 시작")
    sb.table("item").upsert(rows, on_conflict="type,code").execute()
    _log("item 업서트 완료")

    w = sum(1 for r in rows if r["type"] == "weapon")
    a = sum(1 for r in rows if r["type"] == "armor")
    print(f"[done] item upsert: total={len(rows)} weapon={w} armor={a} elapsed={perf_counter()-all_t0:.2f}s")


if __name__ == "__main__":
    main()


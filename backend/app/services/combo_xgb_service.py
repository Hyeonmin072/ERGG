"""
스쿼드 3인 (characterNum, bestWeapon) × 3 → XGBoost P(1등).

모델: backend/ml_models/combo_first_place/xgb_combo_first.json
환경변수 COMBO_XGB_MODEL_PATH 로 경로 덮어쓰기 가능.
"""

from __future__ import annotations

import os
from pathlib import Path
from typing import TYPE_CHECKING, Optional

if TYPE_CHECKING:
    import numpy as np

def _backend_root() -> Path:
    override = (os.getenv("ERG_BACKEND_ROOT") or "").strip()
    if override:
        return Path(override).resolve()
    return Path(__file__).resolve().parent.parent.parent


_BACKEND_ROOT = _backend_root()
_MODEL = None  # type: ignore[assignment]


def get_model_path() -> Path:
    custom = (os.getenv("COMBO_XGB_MODEL_PATH") or "").strip()
    if custom:
        return Path(custom)
    return _BACKEND_ROOT / "ml_models" / "combo_first_place" / "xgb_combo_first.json"


def get_model():
    """모델 없거나 로드 실패 시 None."""
    global _MODEL
    if _MODEL is not None:
        return _MODEL
    path = get_model_path()
    if not path.is_file():
        return None
    try:
        import xgboost as xgb
    except Exception:
        return None
    try:
        clf = xgb.XGBClassifier()
        clf.load_model(str(path))
        _MODEL = clf
    except Exception:
        return None
    return _MODEL


def predict_win_probability(character_nums: list[int], best_weapons: list[int]) -> float:
    """학습 시와 동일하게 (캐릭터, 무기) 3쌍을 정렬한 뒤 6특징으로 추론."""
    import numpy as np

    if len(character_nums) != 3 or len(best_weapons) != 3:
        raise ValueError("characterNums·bestWeapons 각 3개 필요")
    pairs = sorted(
        zip(character_nums, best_weapons),
        key=lambda t: (t[0], t[1]),
    )
    flat: list[int] = []
    for c, w in pairs:
        flat.extend([c, w])
    x = np.array([flat], dtype=np.float32)
    m = get_model()
    if m is None:
        raise RuntimeError("combo xgboost model not loaded")
    return float(m.predict_proba(x)[0, 1])

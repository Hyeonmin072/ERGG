"""
학습된 XGBoost 모델로 스쿼드 3인 (캐릭터·무기) 조합의 1등(승리) 확률 P ∈ [0,1] 추정.

- 학습 라벨은 0/1이지만, 서비스에서 쓸 값은 항상 predict_proba[:, 1] (확률)이다.
- 0/1 예측(predict)이 아니라 연속 확률이 목적이면 이 스크립트와 동일하게 proba만 사용.

모델: ml_models/combo_first_place/xgb_combo_first.json

사용 예:
  python3 predict_combo_first.py --c1 5 --w1 12 --c2 7 --w2 3 --c3 15 --w3 5
  (세 (캐릭터, 무기) 쌍을 정렬하지 않아도 됨 — 학습과 동일하게 내부 정렬)

FastAPI 등에서는 XGBClassifier.load_model 후 predict_proba 동일.
"""

from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
import xgboost as xgb


def _sorted_triples(c1: int, w1: int, c2: int, w2: int, c3: int, w3: int) -> list[int]:
    triples = sorted([(c1, w1), (c2, w2), (c3, w3)], key=lambda t: (t[0], t[1]))
    out: list[int] = []
    for c, w in triples:
        out.extend([c, w])
    return out


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--model-dir", type=Path, default=None)
    p.add_argument("--c1", type=int, required=True)
    p.add_argument("--w1", type=int, required=True)
    p.add_argument("--c2", type=int, required=True)
    p.add_argument("--w2", type=int, required=True)
    p.add_argument("--c3", type=int, required=True)
    p.add_argument("--w3", type=int, required=True)
    args = p.parse_args()

    backend_root = Path(__file__).resolve().parent
    model_dir = args.model_dir or (backend_root / "ml_models" / "combo_first_place")
    model_path = model_dir / "xgb_combo_first.json"
    if not model_path.is_file():
        raise SystemExit(f"모델 없음: {model_path} — train_combo_xgboost.py 먼저 실행")

    feat = np.array(
        [_sorted_triples(args.c1, args.w1, args.c2, args.w2, args.c3, args.w3)],
        dtype=np.float32,
    )
    booster = xgb.XGBClassifier()
    booster.load_model(str(model_path))
    p_win = float(booster.predict_proba(feat)[0, 1])
    print(f"P(승리·1등) = {p_win:.4f}  ({p_win * 100:.2f}%)")


if __name__ == "__main__":
    main()

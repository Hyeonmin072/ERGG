"""
조합 데이터셋 CSV(squadComboTeams.csv)로 XGBoost 학습.

- 특징: 정렬된 (characterNum, bestWeapon) × 3 → 6개 정수 컬럼
- 라벨(학습용): isFirstPlace — 0 또는 1 (해당 판에서 1등 여부)
- 산출(서비스 목적): 승리(1등) 확률 P ∈ [0, 1] — binary:logistic + predict_proba[:, 1]
  (0/1 하드 분류가 아니라 조건에 대한 1등 확률이 필요하면 반드시 predict_proba 사용)

사전 작업:
  cd backend && python3 build_squad_combo_dataset.py

학습:
  cd backend && python3 train_combo_xgboost.py

옵션:
  --csv PATH          입력 CSV (기본: datasets/squadComboTeams.csv)
  --out-dir DIR       모델 저장 (기본: ml_models/combo_first_place)
  --test-size 0.2     검증 비율
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    brier_score_loss,
    classification_report,
    log_loss,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
import xgboost as xgb


FEATURE_COLS = [
    "characterNum1",
    "bestWeapon1",
    "characterNum2",
    "bestWeapon2",
    "characterNum3",
    "bestWeapon3",
]
TARGET_COL = "isFirstPlace"


def main() -> None:
    parser = argparse.ArgumentParser(description="조합 1등 확률 XGBoost 학습")
    parser.add_argument(
        "--csv",
        type=Path,
        default=None,
        help="데이터셋 CSV 경로",
    )
    parser.add_argument(
        "--out-dir",
        type=Path,
        default=None,
        help="모델·메타 JSON 저장 디렉터리",
    )
    parser.add_argument(
        "--test-size",
        type=float,
        default=0.2,
        help="검증 세트 비율",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=42,
    )
    args = parser.parse_args()

    backend_root = Path(__file__).resolve().parent
    csv_path = args.csv or (backend_root / "datasets" / "squadComboTeams.csv")
    out_dir = args.out_dir or (backend_root / "ml_models" / "combo_first_place")

    if not csv_path.is_file():
        print(
            f"[error] CSV 없음: {csv_path}\n"
            "  먼저 실행: cd backend && python3 build_squad_combo_dataset.py",
            file=sys.stderr,
        )
        sys.exit(1)

    df = pd.read_csv(csv_path)
    for c in FEATURE_COLS + [TARGET_COL]:
        if c not in df.columns:
            print(f"[error] 컬럼 없음: {c} (CSV 헤더 확인)", file=sys.stderr)
            sys.exit(1)

    X = df[FEATURE_COLS].astype(np.int32)
    y = df[TARGET_COL].astype(np.int32)

    n_pos = int(y.sum())
    n_neg = len(y) - n_pos
    if n_pos == 0 or n_neg == 0:
        print("[error] 라벨이 한 클래스뿐이라 학습 불가.", file=sys.stderr)
        sys.exit(1)

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=args.test_size,
        random_state=args.seed,
        stratify=y,
    )

    # 불균형 완화
    scale = (y_train == 0).sum() / max((y_train == 1).sum(), 1)

    clf = xgb.XGBClassifier(
        n_estimators=300,
        max_depth=8,
        learning_rate=0.05,
        subsample=0.85,
        colsample_bytree=0.85,
        min_child_weight=2,
        objective="binary:logistic",
        eval_metric="auc",
        random_state=args.seed,
        n_jobs=-1,
        scale_pos_weight=float(scale),
    )
    clf.fit(X_train, y_train)

    # 1등 확률 (서비스에서 쓸 값과 동일)
    proba = clf.predict_proba(X_test)[:, 1]
    # 참고용: 임계값 0.5 이진 예측 (확률 자체가 목적이면 부차 지표)
    pred = (proba >= 0.5).astype(np.int32)

    acc = accuracy_score(y_test, pred)
    try:
        auc = roc_auc_score(y_test, proba)
    except ValueError:
        auc = float("nan")
    try:
        ll = log_loss(y_test, proba)
    except ValueError:
        ll = float("nan")
    try:
        brier = brier_score_loss(y_test, proba)
    except ValueError:
        brier = float("nan")

    print("[metrics] validation (확률 품질 위주)")
    print(f"  log_loss (낮을수록 좋음): {ll:.4f}")
    print(f"  brier_score (낮을수록 좋음): {brier:.4f}")
    print(f"  roc_auc:  {auc:.4f}")
    print(f"  accuracy@0.5 (참고): {acc:.4f}")
    print(classification_report(y_test, pred, digits=4))
    print("[note] 추론 시 출력: clf.predict_proba(X)[:, 1] = P(1등)")

    out_dir.mkdir(parents=True, exist_ok=True)
    model_path = out_dir / "xgb_combo_first.json"
    clf.save_model(str(model_path))

    meta = {
        "featureCols": FEATURE_COLS,
        "targetCol": TARGET_COL,
        "outputType": "probability",
        "inference": {
            "description": "스쿼드 조건에서 해당 판 1등(승리) 확률",
            "method": "XGBClassifier.predict_proba(X)[:, 1]",
            "range": "[0.0, 1.0]",
        },
        "nSamples": int(len(df)),
        "nPositive": n_pos,
        "nNegative": n_neg,
        "testSize": args.test_size,
        "metrics": {
            "logLoss": ll,
            "brierScore": brier,
            "rocAuc": auc,
            "accuracyAt05": acc,
        },
        "csvPath": str(csv_path.resolve()),
    }
    (out_dir / "meta.json").write_text(
        json.dumps(meta, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    print(f"[done] 모델: {model_path}")
    print(f"[done] 메타: {out_dir / 'meta.json'}")


if __name__ == "__main__":
    main()

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { UsersRound, ArrowLeft, Search, X, Sparkles, RotateCcw } from "lucide-react";
import {
  COMBO_ROSTER_NAMES,
  filterComboRoster,
  mockComboWinRatePercent,
} from "@/lib/comboRoster";

type Slot = string | null;

export default function ComboWinratePage() {
  const [slots, setSlots] = useState<[Slot, Slot, Slot]>([null, null, null]);
  const [filter, setFilter] = useState("");
  const [demoRate, setDemoRate] = useState<number | null>(null);

  const filtered = useMemo(() => filterComboRoster(filter), [filter]);

  const filled =
    slots[0] !== null && slots[1] !== null && slots[2] !== null;
  const trio: [string, string, string] | null = filled
    ? [slots[0]!, slots[1]!, slots[2]!]
    : null;

  const toggleCharacter = (name: string) => {
    setDemoRate(null);
    setSlots((prev) => {
      const idx = prev.indexOf(name);
      if (idx >= 0) {
        const next: [Slot, Slot, Slot] = [...prev];
        next[idx] = null;
        return next;
      }
      const empty = prev.findIndex((s) => !s);
      if (empty >= 0) {
        const next: [Slot, Slot, Slot] = [...prev];
        next[empty] = name;
        return next;
      }
      const next: [Slot, Slot, Slot] = [...prev];
      next[2] = name;
      return next;
    });
  };

  const clearSlot = (i: 0 | 1 | 2) => {
    setDemoRate(null);
    setSlots((prev) => {
      const next: [Slot, Slot, Slot] = [...prev];
      next[i] = null;
      return next;
    });
  };

  const resetAll = () => {
    setSlots([null, null, null]);
    setFilter("");
    setDemoRate(null);
  };

  const runEstimate = () => {
    if (!trio) return;
    setDemoRate(mockComboWinRatePercent(trio));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 fade-in">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs mb-6 transition-opacity hover:opacity-80"
        style={{ color: "var(--text-secondary)" }}
      >
        <ArrowLeft size={14} />
        홈
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div
          className="p-2.5 rounded-xl"
          style={{ background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.35)" }}
        >
          <UsersRound size={20} style={{ color: "#a78bfa" }} />
        </div>
        <div>
          <h1 className="text-xl font-black" style={{ color: "var(--text-primary)" }}>
            조합 승률 예측
          </h1>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            스쿼드(3인) 실험체 조합별 기대 승률을 추정합니다 · 실험체 {COMBO_ROSTER_NAMES.length}종
          </p>
        </div>
      </div>

      {/* 스쿼드 슬롯 */}
      <div
        className="card p-5 mb-4"
        style={{
          background: "linear-gradient(180deg, rgba(20,29,53,0.70) 0%, rgba(15,22,41,0.55) 100%)",
          borderColor: "rgba(167,139,250,0.2)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold" style={{ color: "#a78bfa" }}>
            스쿼드 구성
          </span>
          <button
            type="button"
            onClick={resetAll}
            className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg transition-colors hover:bg-white/5"
            style={{ color: "var(--text-secondary)" }}
          >
            <RotateCcw size={12} />
            초기화
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {([0, 1, 2] as const).map((i) => (
            <div
              key={i}
              className="relative rounded-xl px-3 py-4 text-center min-h-[72px] flex flex-col items-center justify-center gap-1"
              style={{
                background: "rgba(20,29,53,0.55)",
                border: slots[i]
                  ? "1px solid rgba(167,139,250,0.45)"
                  : "1px dashed rgba(255,255,255,0.12)",
              }}
            >
              <span className="text-[10px] font-bold" style={{ color: "var(--text-secondary)" }}>
                {i + 1}번
              </span>
              {slots[i] ? (
                <>
                  <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                    {slots[i]}
                  </span>
                  <button
                    type="button"
                    onClick={() => clearSlot(i)}
                    className="absolute top-1.5 right-1.5 p-0.5 rounded-md hover:bg-white/10 transition-colors"
                    aria-label={`${slots[i]} 제거`}
                  >
                    <X size={12} style={{ color: "var(--text-secondary)" }} />
                  </button>
                </>
              ) : (
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  선택
                </span>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          disabled={!filled}
          onClick={runEstimate}
          className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: filled
              ? "linear-gradient(135deg, rgba(167,139,250,0.5), rgba(255,255,255,0.15))"
              : "rgba(255,255,255,0.06)",
            color: filled ? "var(--text-primary)" : "var(--text-secondary)",
            border: "1px solid rgba(167,139,250,0.35)",
            boxShadow: filled ? "0 12px 40px rgba(0,0,0,0.25)" : "none",
          }}
        >
          <Sparkles size={16} style={{ color: "#a78bfa" }} />
          승률 추정하기
        </button>

        {demoRate != null && trio && (
          <div
            className="mt-4 p-4 rounded-xl text-center"
            style={{
              background: "rgba(167,139,250,0.08)",
              border: "1px solid rgba(167,139,250,0.25)",
            }}
          >
            <p className="text-[11px] mb-1" style={{ color: "var(--text-secondary)" }}>
              데모 추정치 (서버 메타 연동 전)
            </p>
            <p className="text-3xl font-black tabular-nums" style={{ color: "#c4b5fd" }}>
              {demoRate}%
            </p>
            <p className="text-xs mt-2 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {trio.join(" · ")}
            </p>
          </div>
        )}
      </div>

      {/* 실험체 선택 */}
      <div
        className="card p-5"
        style={{
          background: "linear-gradient(180deg, rgba(20,29,53,0.70) 0%, rgba(15,22,41,0.55) 100%)",
          borderColor: "rgba(255,255,255,0.10)",
          backdropFilter: "blur(10px)",
        }}
      >
        <p className="text-xs font-bold mb-3" style={{ color: "var(--text-secondary)" }}>
          실험체 목록 · 탭하면 슬롯에 담기고, 다시 누르면 해제됩니다
        </p>
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2.5 mb-3"
          style={{
            backgroundColor: "rgba(20,29,53,0.55)",
            border: "1px solid rgba(255,255,255,0.10)",
          }}
        >
          <Search size={16} style={{ color: "var(--text-secondary)" }} />
          <input
            type="text"
            placeholder="이름 검색…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "var(--text-primary)" }}
          />
        </div>
        <div
          className="max-h-[min(52vh,420px)] overflow-y-auto pr-1 grid grid-cols-3 sm:grid-cols-4 gap-2"
          style={{ scrollbarGutter: "stable" }}
        >
          {filtered.length === 0 ? (
            <p className="col-span-full text-xs py-6 text-center" style={{ color: "var(--text-secondary)" }}>
              검색 결과 없음
            </p>
          ) : (
            filtered.map((name) => {
              const active = slots.includes(name);
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => toggleCharacter(name)}
                  className="text-xs font-medium py-2.5 px-2 rounded-lg transition-all text-center leading-tight"
                  style={{
                    background: active ? "rgba(167,139,250,0.22)" : "rgba(255,255,255,0.05)",
                    border: active
                      ? "1px solid rgba(167,139,250,0.55)"
                      : "1px solid rgba(255,255,255,0.08)",
                    color: "var(--text-primary)",
                    boxShadow: active ? "0 0 12px rgba(167,139,250,0.12)" : "none",
                  }}
                >
                  {name}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

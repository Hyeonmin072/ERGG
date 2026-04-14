"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import CountUp from "react-countup";
import {
  FlaskConical,
  ArrowLeft,
  Search,
  X,
  RotateCcw,
  ChevronRight,
} from "lucide-react";
import {
  COMBO_ROSTER_NAMES,
  filterComboRoster,
} from "@/lib/comboRoster";
import { getCharacterDefaultMiniSrc } from "@/lib/characterDefaultMini";
import {
  getCharacterCatalog,
  getComboWinProbability,
  getWeaponCatalog,
  ApiError,
} from "@/lib/api";
import type { CharacterCatalogItem } from "@/lib/types";
import { getMasteryWeaponCodesForCharacter } from "@/lib/characterWeaponChoices";
import { getWeaponGroupIconSrcEncoded } from "@/lib/weaponGroupIcon";
import "./combo-lab.css";

/** 슬롯 하나: 실험체 + 해당 슬롯에서 고른 무기 타입 코드(bestWeapon) */
type SlotPick = { name: string; weaponCode: number } | null;

const accent = "#2dd4bf";
const accentSoft = "rgba(45, 212, 191, 0.4)";
const panelBorder = "rgba(45, 212, 191, 0.12)";
const panelBorderStrong = "rgba(45, 212, 191, 0.22)";
const gridBg = {
  backgroundImage: [
    "linear-gradient(rgba(45,212,191,0.06) 1px, transparent 1px)",
    "linear-gradient(90deg, rgba(45,212,191,0.06) 1px, transparent 1px)",
  ].join(","),
  backgroundSize: "28px 28px",
};

function ComboCharacterThumb({ name, size = 38 }: { name: string; size?: number }) {
  const src = getCharacterDefaultMiniSrc(name);
  if (!src) {
    return (
      <div
        className="shrink-0 rounded-lg flex items-center justify-center font-mono font-bold text-[11px]"
        style={{
          width: size,
          height: size,
          background: "rgba(45,212,191,0.06)",
          color: "var(--text-secondary)",
          border: `1px solid ${panelBorder}`,
        }}
      >
        {name.slice(0, 1)}
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt={name}
      width={size}
      height={size}
      className="shrink-0 rounded-lg object-cover object-top transition-transform duration-300 group-hover:scale-105"
      style={{ border: `1px solid ${panelBorder}` }}
      draggable={false}
    />
  );
}

function characterNumForName(
  name: string,
  catalogItems: CharacterCatalogItem[]
): number {
  const item = catalogItems.find(
    (i) => (i.nameKo && i.nameKo === name) || i.name === name
  );
  const idx = COMBO_ROSTER_NAMES.indexOf(
    name as (typeof COMBO_ROSTER_NAMES)[number]
  );
  return item?.characterNum ?? (idx >= 0 ? idx + 1 : 1);
}

function defaultWeaponCodeForName(
  name: string,
  catalogItems: CharacterCatalogItem[]
): number {
  const num = characterNumForName(name, catalogItems);
  const allowed = getMasteryWeaponCodesForCharacter(num, catalogItems);
  return allowed[0] ?? 1;
}

function buildComboPayload(
  slots: [SlotPick, SlotPick, SlotPick],
  catalogItems: CharacterCatalogItem[]
): { characterNums: [number, number, number]; bestWeapons: [number, number, number] } {
  const nums: number[] = [];
  const weapons: number[] = [];
  for (const s of slots) {
    if (!s) continue;
    nums.push(characterNumForName(s.name, catalogItems));
    weapons.push(s.weaponCode);
  }
  return {
    characterNums: nums as [number, number, number],
    bestWeapons: weapons as [number, number, number],
  };
}

function WeaponIconButton({
  code,
  selected,
  label,
  src,
  panelBorder,
  accentSoft,
  accent,
  onPick,
}: {
  code: number;
  selected: boolean;
  label: string;
  src: string | null;
  panelBorder: string;
  accentSoft: string;
  accent: string;
  onPick: () => void;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const showImg = Boolean(src) && !imgFailed;

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onPick}
      className="relative rounded-lg overflow-hidden transition-all duration-150 shrink-0 flex items-center justify-center"
      style={{
        width: 44,
        height: 44,
        border: selected ? `2px solid ${accent}` : `1px solid ${panelBorder}`,
        boxShadow: selected ? `0 0 16px ${accentSoft}` : "none",
        background: selected ? "rgba(45,212,191,0.12)" : "rgba(0,0,0,0.35)",
      }}
    >
      {showImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src!}
          alt=""
          className="w-full h-full object-contain p-1"
          draggable={false}
          onError={() => setImgFailed(true)}
        />
      ) : (
        <span
          className="text-[10px] font-mono tabular-nums"
          style={{ color: "var(--text-secondary)" }}
        >
          {code}
        </span>
      )}
    </button>
  );
}

function WeaponIconPicker({
  selectedCode,
  codes,
  weaponNameByCode,
  panelBorder,
  accentSoft,
  accent,
  onPick,
}: {
  selectedCode: number;
  codes: number[];
  weaponNameByCode: Map<number, string>;
  panelBorder: string;
  accentSoft: string;
  accent: string;
  onPick: (code: number) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {codes.map((code) => (
        <WeaponIconButton
          key={code}
          code={code}
          selected={selectedCode === code}
          label={weaponNameByCode.get(code) ?? `무기 #${code}`}
          src={getWeaponGroupIconSrcEncoded(code)}
          panelBorder={panelBorder}
          accentSoft={accentSoft}
          accent={accent}
          onPick={() => onPick(code)}
        />
      ))}
    </div>
  );
}

export default function ComboWinratePage() {
  const [slots, setSlots] = useState<[SlotPick, SlotPick, SlotPick]>([
    null,
    null,
    null,
  ]);
  const [filter, setFilter] = useState("");
  const [demoRate, setDemoRate] = useState<number | null>(null);
  const [estimateKey, setEstimateKey] = useState(0);
  const [catalogItems, setCatalogItems] = useState<CharacterCatalogItem[]>([]);
  const [weaponNameByCode, setWeaponNameByCode] = useState<Map<number, string>>(
    () => new Map()
  );
  const [estimateLoading, setEstimateLoading] = useState(false);
  const [estimateError, setEstimateError] = useState<string | null>(null);

  useEffect(() => {
    getCharacterCatalog()
      .then((r) => setCatalogItems(r.items))
      .catch(() => setCatalogItems([]));
  }, []);

  useEffect(() => {
    getWeaponCatalog()
      .then((r) => {
        const m = new Map<number, string>();
        for (const w of r.items) {
          const n = (w.name || "").trim();
          if (n) m.set(w.code, n);
        }
        setWeaponNameByCode(m);
      })
      .catch(() => setWeaponNameByCode(new Map()));
  }, []);

  useEffect(() => {
    if (!catalogItems.length) return;
    setSlots((prev) => {
      let changed = false;
      const next = prev.map((s) => {
        if (!s) return s;
        const num = characterNumForName(s.name, catalogItems);
        const allowed = getMasteryWeaponCodesForCharacter(num, catalogItems);
        if (allowed.length && !allowed.includes(s.weaponCode)) {
          changed = true;
          return { ...s, weaponCode: allowed[0]! };
        }
        return s;
      }) as [SlotPick, SlotPick, SlotPick];
      return changed ? next : prev;
    });
  }, [catalogItems]);

  const filtered = useMemo(() => filterComboRoster(filter), [filter]);

  const filled =
    slots[0] !== null && slots[1] !== null && slots[2] !== null;
  const trio: [string, string, string] | null = filled
    ? [slots[0]!.name, slots[1]!.name, slots[2]!.name]
    : null;

  const statusLabel = !filled
    ? "대기 — 스쿼드 미편성"
    : demoRate == null
      ? "준비 — 분석 가능"
      : "완료 — 결과 반영";

  const toggleCharacter = (name: string) => {
    setDemoRate(null);
    setEstimateError(null);
    setSlots((prev) => {
      const idx = prev.findIndex((s) => s?.name === name);
      if (idx >= 0) {
        const next: [SlotPick, SlotPick, SlotPick] = [...prev];
        next[idx] = null;
        return next;
      }
      const empty = prev.findIndex((s) => !s);
      const pick: SlotPick = {
        name,
        weaponCode: defaultWeaponCodeForName(name, catalogItems),
      };
      if (empty >= 0) {
        const next: [SlotPick, SlotPick, SlotPick] = [...prev];
        next[empty] = pick;
        return next;
      }
      const next: [SlotPick, SlotPick, SlotPick] = [...prev];
      next[2] = pick;
      return next;
    });
  };

  const setWeaponForSlot = (i: 0 | 1 | 2, weaponCode: number) => {
    setDemoRate(null);
    setEstimateError(null);
    setSlots((prev) => {
      const next = [...prev] as [SlotPick, SlotPick, SlotPick];
      if (next[i]) next[i] = { ...next[i]!, weaponCode };
      return next;
    });
  };

  const clearSlot = (i: 0 | 1 | 2) => {
    setDemoRate(null);
    setEstimateError(null);
    setSlots((prev) => {
      const next: [SlotPick, SlotPick, SlotPick] = [...prev];
      next[i] = null;
      return next;
    });
  };

  const resetAll = () => {
    setSlots([null, null, null]);
    setFilter("");
    setDemoRate(null);
    setEstimateError(null);
  };

  const runEstimate = async () => {
    if (!trio) return;
    setEstimateError(null);
    setEstimateLoading(true);
    setDemoRate(null);
    try {
      const body = buildComboPayload(slots, catalogItems);
      const res = await getComboWinProbability(body);
      setDemoRate(res.winProbability * 100);
      setEstimateKey((k) => k + 1);
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? String(e.message)
          : "분석 요청에 실패했습니다.";
      setEstimateError(msg);
    } finally {
      setEstimateLoading(false);
    }
  };

  return (
    <div
      className="combo-lab-root relative flex flex-col overflow-hidden px-4 sm:px-6 lg:px-10"
      style={{
        ...gridBg,
        backgroundColor: "rgba(4, 14, 18, 0.98)",
        height: "calc(100dvh - 3.75rem)",
        maxHeight: "calc(100dvh - 3.75rem)",
      }}
    >
      <div className="combo-lab-vignette" />
      <div className="combo-lab-scanlines" />

      <div className="relative z-[2] flex flex-col flex-1 min-h-0 max-w-[min(1320px,100%)] mx-auto w-full py-5 lg:py-6">
        <header className="shrink-0 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-5 lg:mb-6">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase mb-3 transition-all hover:text-teal-300/90"
              style={{ color: "var(--text-secondary)" }}
            >
              <ArrowLeft size={14} />
              ER.GG / 홈
            </Link>
            <div className="flex items-center gap-4">
              <div
                className="hidden sm:flex w-14 h-14 rounded-2xl items-center justify-center shrink-0 transition-transform duration-500 hover:scale-105"
                style={{
                  background: "linear-gradient(145deg, rgba(45,212,191,0.15), rgba(6,78,82,0.4))",
                  border: `1px solid ${panelBorderStrong}`,
                  boxShadow: "0 0 32px rgba(45,212,191,0.15), inset 0 1px 0 rgba(255,255,255,0.06)",
                }}
              >
                <FlaskConical className="w-7 h-7" style={{ color: accent }} strokeWidth={1.75} />
              </div>
              <div>
                <p
                  className="font-mono text-[10px] sm:text-[11px] tracking-[0.22em] uppercase mb-1"
                  style={{ color: accent }}
                >
                  ER Lab · Combo Analytics
                </p>
                <h1
                  className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight"
                  style={{ color: "var(--text-primary)" }}
                >
                  조합 승률 분석
                </h1>
                <p className="mt-1.5 text-xs sm:text-sm max-w-lg" style={{ color: "var(--text-secondary)" }}>
                  연구용 데모 모델 · 실험체{" "}
                  <span className="font-mono text-teal-300/90">{COMBO_ROSTER_NAMES.length}</span>종 ·                   스쿼드 3인 · 슬롯마다 무기 타입 선택 후 분석
                </p>
              </div>
            </div>
          </div>
          <div
            className="font-mono text-[10px] sm:text-[11px] px-4 py-3 rounded-xl shrink-0 self-start sm:self-auto"
            style={{
              background: "rgba(6, 28, 32, 0.75)",
              border: `1px solid ${panelBorderStrong}`,
              color: "var(--text-secondary)",
              boxShadow: "inset 0 0 24px rgba(45,212,191,0.04)",
            }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="combo-status-led inline-block w-2 h-2 rounded-sm"
                style={{ background: accent, boxShadow: `0 0 10px ${accent}` }}
              />
              <span className="tracking-widest">LAB_STATUS</span>
            </div>
            <div className="text-xs sm:text-[13px] font-bold leading-snug" style={{ color: "#e2e8f0" }}>
              {statusLabel}
            </div>
          </div>
        </header>

        <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-12 gap-5 lg:gap-6 min-h-0 items-stretch">
          {/* 01 실험체 — 모바일은 이 블록 높이 캡 + 내부만 스크롤, xl은 열 높이에 맞춤 */}
          <section
            className="xl:col-span-7 flex flex-col min-h-0 max-h-[min(40vh,460px)] xl:max-h-none xl:h-full rounded-2xl overflow-hidden"
            style={{
              background: "linear-gradient(160deg, rgba(12,32,38,0.88) 0%, rgba(6,18,24,0.95) 100%)",
              border: `1px solid ${panelBorderStrong}`,
              boxShadow: "0 20px 60px rgba(0,0,0,0.45), inset 0 1px 0 rgba(45,212,191,0.08)",
              backdropFilter: "blur(14px)",
            }}
          >
            <div
              className="shrink-0 flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 py-3.5 border-b"
              style={{ borderColor: panelBorder }}
            >
              <div>
                <span className="font-mono text-[10px] tracking-[0.35em]" style={{ color: accent }}>
                  01
                </span>
                <h2 className="text-base sm:text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                  실험체 라이브러리
                </h2>
              </div>
            </div>
            <div className="shrink-0 p-3 sm:px-4 pt-2.5 pb-2.5 border-b" style={{ borderColor: panelBorder }}>
              <div
                className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition-[box-shadow] duration-300 focus-within:shadow-[0_0_0_1px_rgba(45,212,191,0.35)]"
                style={{
                  background: "rgba(0,0,0,0.28)",
                  border: `1px solid ${panelBorder}`,
                }}
              >
                <Search size={17} style={{ color: accent }} className="shrink-0 opacity-85" />
                <input
                  type="text"
                  placeholder="실험체 이름 검색"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="flex-1 bg-transparent text-sm sm:text-base outline-none placeholder:opacity-35"
                  style={{ color: "var(--text-primary)" }}
                />
              </div>
            </div>
            <div
              className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-3 sm:p-4 pt-2.5"
              style={{ scrollbarGutter: "stable" }}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1 pb-2">
                {filtered.length === 0 ? (
                  <p
                    className="col-span-full py-20 text-center text-xs font-mono combo-animate-fade-up"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    검색 결과 없음
                  </p>
                ) : (
                  filtered.map((name) => {
                    const active = slots.some((s) => s?.name === name);
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => toggleCharacter(name)}
                        className={`group w-full max-w-[104px] mx-auto rounded-xl p-1.5 flex flex-col items-center gap-1 text-left duration-200 ${
                          active ? "combo-animate-pick" : ""
                        } hover:scale-[1.02] active:scale-[0.98]`}
                        style={{
                          background: active ? "rgba(45,212,191,0.12)" : "rgba(255,255,255,0.03)",
                          border: active ? `1px solid ${accentSoft}` : `1px solid ${panelBorder}`,
                          boxShadow: active ? "0 0 20px rgba(45,212,191,0.12)" : "none",
                        }}
                      >
                        <ComboCharacterThumb name={name} size={46} />
                        <span
                          className="text-[12px] sm:text-[13px] font-semibold leading-snug text-center w-full line-clamp-2"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {name}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </section>

          {/* 02 분석 콘솔 */}
          <section className="xl:col-span-5 flex flex-col min-h-0 flex-1 gap-4 overflow-y-auto xl:overflow-hidden xl:min-h-0">
            <div
              className="rounded-2xl overflow-hidden flex flex-col min-h-0 xl:flex-1 xl:min-h-0"
              style={{
                background: "linear-gradient(165deg, rgba(14,36,40,0.9) 0%, rgba(6,16,22,0.96) 100%)",
                border: `1px solid ${panelBorderStrong}`,
                boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                backdropFilter: "blur(14px)",
              }}
            >
              <div
                className="shrink-0 flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 border-b"
                style={{ borderColor: panelBorder }}
              >
                <div>
                  <span className="font-mono text-[10px] tracking-[0.35em]" style={{ color: accent }}>
                    02
                  </span>
                  <h2 className="text-base sm:text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                    스쿼드 버퍼
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={resetAll}
                  className="flex items-center gap-2 text-[10px] font-mono px-3 py-2 rounded-lg transition-all hover:bg-teal-500/10 hover:border-teal-500/25"
                  style={{ color: "var(--text-secondary)", border: `1px solid ${panelBorder}` }}
                >
                  <RotateCcw size={13} />
                  초기화
                </button>
              </div>

              <div className="p-4 sm:p-5 flex flex-col gap-3 flex-1 min-h-0 overflow-y-auto">
                <div className="grid grid-cols-1 gap-2.5">
                  {(
                    [
                      ["A", 0],
                      ["B", 1],
                      ["C", 2],
                    ] as const
                  ).map(([label, i]) => (
                    <div
                      key={`${label}-${slots[i]?.name ?? "empty"}`}
                      className={`relative rounded-xl p-3.5 sm:p-4 flex items-start gap-3 min-h-[120px] ${
                        slots[i] ? "combo-animate-slot-in" : ""
                      }`}
                      style={{
                        background: slots[i] ? "rgba(45,212,191,0.07)" : "rgba(0,0,0,0.22)",
                        border: slots[i]
                          ? `1px solid ${accentSoft}`
                          : `1px dashed ${panelBorder}`,
                      }}
                    >
                      <span
                        className="font-mono text-[10px] w-7 shrink-0 tracking-wider pt-1"
                        style={{ color: accent }}
                      >
                        {label}
                      </span>
                      {slots[i] ? (
                        <>
                          <ComboCharacterThumb name={slots[i]!.name} size={44} />
                          <div className="flex-1 min-w-0 flex flex-col gap-2">
                            <div className="flex items-start justify-between gap-2">
                              <p
                                className="text-base sm:text-lg font-bold truncate"
                                style={{ color: "var(--text-primary)" }}
                              >
                                {slots[i]!.name}
                              </p>
                              <button
                                type="button"
                                onClick={() => clearSlot(i)}
                                className="p-2 rounded-lg hover:bg-white/10 transition-colors shrink-0 -mt-1"
                                aria-label={`${slots[i]!.name} 제거`}
                              >
                                <X size={17} style={{ color: "var(--text-secondary)" }} />
                              </button>
                            </div>
                            <label
                              className="text-[10px] font-mono tracking-wide"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              사용 가능 무기
                            </label>
                            <WeaponIconPicker
                              selectedCode={slots[i]!.weaponCode}
                              codes={getMasteryWeaponCodesForCharacter(
                                characterNumForName(slots[i]!.name, catalogItems),
                                catalogItems
                              )}
                              weaponNameByCode={weaponNameByCode}
                              panelBorder={panelBorder}
                              accentSoft={accentSoft}
                              accent={accent}
                              onPick={(code) => setWeaponForSlot(i, code)}
                            />
                          </div>
                        </>
                      ) : (
                        <div className="flex-1 flex items-center justify-between gap-2">
                          <p className="text-xs sm:text-sm" style={{ color: "var(--text-secondary)" }}>
                            좌측 목록에서 선택
                          </p>
                          <ChevronRight size={15} className="opacity-25 shrink-0" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* 승률 분석 버튼 자리 = 결과 표시 영역 */}
                <div
                  className="mt-1 rounded-xl flex flex-col items-center justify-center min-h-[168px] sm:min-h-[188px] px-4 py-5 transition-all duration-500"
                  style={{
                    background: "rgba(0,0,0,0.3)",
                    border: `1px solid ${demoRate != null ? accentSoft : panelBorder}`,
                    boxShadow:
                      demoRate != null
                        ? "inset 0 0 40px rgba(45,212,191,0.06), 0 0 24px rgba(45,212,191,0.08)"
                        : "inset 0 1px 0 rgba(255,255,255,0.03)",
                  }}
                >
                  {estimateLoading ? (
                    <p
                      className="text-sm font-mono"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      분석 중…
                    </p>
                  ) : estimateError ? (
                    <div className="w-full max-w-sm text-center space-y-4">
                      <p className="text-sm leading-relaxed" style={{ color: "#fca5a5" }}>
                        {estimateError}
                      </p>
                      <button
                        type="button"
                        disabled={!filled}
                        onClick={runEstimate}
                        className="w-full py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-35"
                        style={{
                          background: `linear-gradient(135deg, ${accent} 0%, #0d9488 100%)`,
                          color: "rgba(4, 18, 20, 0.95)",
                        }}
                      >
                        다시 시도
                      </button>
                    </div>
                  ) : demoRate == null ? (
                    <button
                      type="button"
                      disabled={!filled || estimateLoading}
                      onClick={runEstimate}
                      className="w-full max-w-sm py-4 sm:py-4 rounded-xl text-sm sm:text-base font-black tracking-wide transition-all duration-300 disabled:opacity-35 disabled:cursor-not-allowed enabled:hover:brightness-110 enabled:active:scale-[0.98] enabled:hover:shadow-[0_12px_40px_rgba(45,212,191,0.25)]"
                      style={{
                        background: filled
                          ? `linear-gradient(135deg, ${accent} 0%, #0d9488 55%, #0f766e 100%)`
                          : "rgba(255,255,255,0.06)",
                        color: filled ? "rgba(4, 18, 20, 0.95)" : "var(--text-secondary)",
                        border: filled ? "none" : `1px solid ${panelBorder}`,
                      }}
                    >
                      승률 분석
                    </button>
                  ) : (
                    <div
                      key={estimateKey}
                      className="combo-animate-fade-up combo-countup-wrap w-full text-center"
                    >
                      <p
                        className="font-mono text-[10px] tracking-[0.28em] uppercase mb-3"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        추정 1등 확률
                      </p>
                      <div
                        className="combo-countup-num flex items-baseline justify-center gap-0.5 text-5xl sm:text-6xl font-black tabular-nums leading-none"
                        style={{
                          color: "#99f6e4",
                          textShadow:
                            "0 0 40px rgba(45,212,191,0.5), 0 0 80px rgba(45,212,191,0.2)",
                        }}
                      >
                        <CountUp
                          start={0}
                          end={demoRate}
                          decimals={1}
                          duration={1.35}
                          decimal="."
                          separator=""
                        />
                        <span className="text-2xl sm:text-3xl font-bold opacity-90" style={{ color: accent }}>
                          %
                        </span>
                      </div>
                      {trio && (
                        <p
                          className="mt-5 text-xs sm:text-sm font-mono leading-relaxed px-2"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {trio.join("  ·  ")}
                        </p>
                      )}
                      <p className="mt-3 text-[10px] font-mono opacity-55" style={{ color: "var(--text-secondary)" }}>
                        * 백엔드 XGBoost · 각 슬롯에서 선택한 무기(bestWeapon) 코드로 추정
                      </p>
                      <button
                        type="button"
                        onClick={runEstimate}
                        className="mt-5 text-[11px] font-mono px-4 py-2 rounded-lg border transition-all hover:bg-teal-500/10"
                        style={{ color: accent, borderColor: panelBorderStrong }}
                      >
                        동일 조합 재분석
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

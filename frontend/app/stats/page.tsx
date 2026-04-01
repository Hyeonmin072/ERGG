"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  PieChart,
  ArrowLeft,
  Search,
  Database,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { getCharacterDefaultMiniSrc } from "@/lib/characterDefaultMini";
import { getCharacterCatalog, getCharacterStats } from "@/lib/api";
import {
  buildCharacterCatalogMap,
  resolveCharacterDisplayName,
  type CharacterCatalogMap,
} from "@/lib/characterDisplay";
import type { CharacterStatsRow } from "@/lib/types";

const accent = "#93c5fd";
const border = "rgba(148,163,184,0.24)";
const borderHi = "rgba(148,163,184,0.38)";

const THUMB_PX = 40;

function StatThumb({ nameKo }: { nameKo: string }) {
  const src = getCharacterDefaultMiniSrc(nameKo);
  const frameClass =
    "relative shrink-0 overflow-hidden rounded-full border border-solid aspect-square h-10 w-10 min-h-[2.5rem] min-w-[2.5rem] box-border";

  if (!src) {
    return (
      <div
        className={`${frameClass} flex items-center justify-center text-[10px] font-mono font-bold`}
        style={{
          background: "rgba(52,211,153,0.08)",
          borderColor: border,
          color: "var(--text-secondary)",
        }}
      >
        {nameKo.slice(0, 1)}
      </div>
    );
  }
  return (
    <div className={frameClass} style={{ borderColor: border }}>
      <Image
        src={src}
        alt={nameKo}
        fill
        sizes={`${THUMB_PX}px`}
        className="object-cover object-top"
        draggable={false}
      />
    </div>
  );
}

/** 통계 수치: 정수면 그대로, 소수부가 있으면 소수 첫째 자리까지 */
function fmtStat(n: number): string {
  if (!Number.isFinite(n)) return "—";
  const rounded = Math.round(n);
  if (Math.abs(n - rounded) < 1e-6) {
    return rounded.toLocaleString("ko-KR");
  }
  return n.toLocaleString("ko-KR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

function NumCell({ children, mono }: { children: ReactNode; mono?: boolean }) {
  return (
    <span
      className={mono ? "font-mono tabular-nums text-[13px]" : ""}
      style={{ color: "var(--text-primary)" }}
    >
      {children}
    </span>
  );
}

/** 티어 등급 정렬용 (낮을수록 상위) */
const TIER_ORDER: Record<string, number> = {
  "S+": 0,
  S: 1,
  A: 2,
  B: 3,
  C: 4,
  D: 5,
};

type SortColumn =
  | "label"
  | "games"
  | "tierGrade"
  | "tierScore"
  | "pickRatePct"
  | "winRatePct"
  | "top3RatePct"
  | "avgRank"
  | "avgKill"
  | "avgTk"
  | "avgRpGain"
  | "avgDamage";

function rowLabelKey(r: CharacterStatsRow, catalog: CharacterCatalogMap): string {
  const char = resolveCharacterDisplayName(r.characterNum, catalog);
  return `${r.weaponName ?? ""} ${char}`.trim().toLowerCase();
}

/** 오름차순 기준 비교 (a < b 이면 음수). 동률이면 캐릭터·무기 id로 안정 정렬 */
function compareRows(
  a: CharacterStatsRow,
  b: CharacterStatsRow,
  col: SortColumn,
  catalog: CharacterCatalogMap
): number {
  let c = 0;
  switch (col) {
    case "label":
      c = rowLabelKey(a, catalog).localeCompare(rowLabelKey(b, catalog), "ko");
      break;
    case "games":
      c = a.games - b.games;
      break;
    case "tierGrade":
      c = (TIER_ORDER[a.tierGrade] ?? 99) - (TIER_ORDER[b.tierGrade] ?? 99);
      break;
    case "tierScore":
      c = a.tierScore - b.tierScore;
      break;
    case "pickRatePct":
      c = a.pickRatePct - b.pickRatePct;
      break;
    case "winRatePct":
      c = a.winRatePct - b.winRatePct;
      break;
    case "top3RatePct":
      c = a.top3RatePct - b.top3RatePct;
      break;
    case "avgRank":
      c = a.avgRank - b.avgRank;
      break;
    case "avgKill":
      c = a.avgKill - b.avgKill;
      break;
    case "avgTk":
      c = a.avgTk - b.avgTk;
      break;
    case "avgRpGain":
      c = a.avgRpGain - b.avgRpGain;
      break;
    case "avgDamage":
      c = a.avgDamage - b.avgDamage;
      break;
    default:
      c = 0;
  }
  if (c !== 0) return c;
  return a.characterNum - b.characterNum || a.weaponId - b.weaponId;
}

function tierBadgeStyle(grade: string): { color: string; bg: string; border: string } {
  if (grade === "S+") return { color: "#fde68a", bg: "rgba(245, 158, 11, 0.18)", border: "rgba(245, 158, 11, 0.45)" };
  if (grade === "S") return { color: "#fcd34d", bg: "rgba(234, 179, 8, 0.18)", border: "rgba(234, 179, 8, 0.42)" };
  if (grade === "A") return { color: "#93c5fd", bg: "rgba(59, 130, 246, 0.16)", border: "rgba(59, 130, 246, 0.38)" };
  if (grade === "B") return { color: "#86efac", bg: "rgba(34, 197, 94, 0.16)", border: "rgba(34, 197, 94, 0.34)" };
  if (grade === "C") return { color: "#cbd5e1", bg: "rgba(148, 163, 184, 0.16)", border: "rgba(148, 163, 184, 0.34)" };
  return { color: "#fca5a5", bg: "rgba(239, 68, 68, 0.16)", border: "rgba(239, 68, 68, 0.34)" };
}

function SortTh({
  col,
  align = "right",
  className = "",
  children,
  activeColumn,
  sortDir,
  onSort,
}: {
  col: SortColumn | null;
  align?: "left" | "right";
  className?: string;
  children: React.ReactNode;
  activeColumn: SortColumn | null;
  sortDir: "asc" | "desc";
  onSort: (col: SortColumn | null) => void;
}) {
  const active = col === null ? activeColumn === null : activeColumn === col;
  return (
    <th
      className={`py-3 sticky top-0 z-20 cursor-pointer select-none transition-opacity hover:opacity-90 ${
        align === "right" ? "text-right" : "text-left"
      } ${className}`}
      style={{ background: "rgba(17,24,39,0.98)", color: "var(--text-secondary)" }}
      scope="col"
      onClick={() => onSort(col)}
    >
      <span
        className={`inline-flex items-center gap-0.5 text-[10px] font-mono uppercase tracking-wider ${
          align === "right" ? "justify-end w-full" : ""
        }`}
      >
        {children}
        {active && (sortDir === "asc" ? <ChevronUp size={14} className="shrink-0" style={{ color: "var(--text-primary)" }} /> : <ChevronDown size={14} className="shrink-0" style={{ color: "var(--text-primary)" }} />)}
      </span>
    </th>
  );
}

export default function StatsPage() {
  const [charQ, setCharQ] = useState("");
  const [charCatalog, setCharCatalog] = useState<CharacterCatalogMap>({});
  const [rows, setRows] = useState<CharacterStatsRow[]>([]);
  /** 전체 game_details 행 수(랭크·스쿼드만). API totalGames */
  const [totalGamesAll, setTotalGamesAll] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const handleSortClick = (col: SortColumn | null) => {
    if (col === null) {
      setSortColumn(null);
      setSortDir("desc");
      return;
    }
    if (sortColumn === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(col);
      setSortDir(col === "label" ? "asc" : "desc");
    }
  };

  useEffect(() => {
    getCharacterCatalog()
      .then((r) => setCharCatalog(buildCharacterCatalogMap(r.items ?? [])))
      .catch(() => setCharCatalog({}));
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getCharacterStats(10, 200);
        if (!mounted) return;
        setRows(data.items ?? []);
        setTotalGamesAll(typeof data.totalGames === "number" ? data.totalGames : null);
      } catch (e) {
        if (!mounted) return;
        const msg = e instanceof Error ? e.message : "통계 로드에 실패했습니다.";
        setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const c = charQ.trim();
    return rows.filter((row) => {
      const name = resolveCharacterDisplayName(row.characterNum, charCatalog);
      const weapon = row.weaponName ?? "";
      const label = `${weapon} ${name}`.trim();
      if (c && !label.includes(c) && !String(row.characterNum).includes(c)) return false;
      return true;
    });
  }, [charQ, rows, charCatalog]);

  const sortedRows = useMemo(() => {
    const list = [...filtered];
    if (!sortColumn) {
      list.sort(
        (a, b) =>
          b.tierScore - a.tierScore ||
          b.games - a.games ||
          a.characterNum - b.characterNum ||
          a.weaponId - b.weaponId
      );
      return list;
    }
    const mult = sortDir === "asc" ? 1 : -1;
    list.sort((a, b) => mult * compareRows(a, b, sortColumn, charCatalog));
    return list;
  }, [filtered, sortColumn, sortDir, charCatalog]);

  /** 화면에 보이는 행들의 games 합(상위 N개 조합만 포함, 전체 DB와 다름) */
  const totals = useMemo(() => {
    const g = filtered.reduce((s, r) => s + r.games, 0);
    const wr = g > 0 ? filtered.reduce((s, r) => s + (r.winRatePct / 100) * r.games, 0) / g : 0;
    return { games: g, blendedWin: g > 0 ? Math.round(wr * 1000) / 10 : 0 };
  }, [filtered]);

  return (
    <div
      className="min-h-[calc(100dvh-3.75rem)] fade-in px-4 sm:px-6 lg:px-10 py-8"
      style={{
        background:
          "radial-gradient(ellipse 70% 45% at 50% -8%, rgba(52,211,153,0.07), transparent 50%), var(--bg-primary)",
      }}
    >
      <div className="max-w-[1200px] mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[11px] font-mono tracking-wide mb-6 transition-opacity hover:opacity-80"
          style={{ color: "var(--text-secondary)" }}
        >
          <ArrowLeft size={14} />
          홈
        </Link>

        <header className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
          <div className="flex items-start gap-4">
            <div
              className="p-3 rounded-2xl shrink-0"
              style={{
                background: "rgba(52,211,153,0.1)",
                border: `1px solid ${borderHi}`,
              }}
            >
              <PieChart size={26} style={{ color: accent }} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span
                  className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md tracking-widest"
                  style={{
                    background: "rgba(52,211,153,0.15)",
                    color: accent,
                    border: `1px solid ${border}`,
                  }}
                >
                  LIVE
                </span>
                <span className="text-[10px] font-mono" style={{ color: "var(--text-secondary)" }}>
                  Supabase aggregate
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>
                무기 · 캐릭터 평균 통계
              </h1>
              <p className="text-sm mt-2 max-w-2xl" style={{ color: "var(--text-secondary)" }}>
                DB에 적재된 실제 경기 데이터 기반 통계입니다.
              </p>
            </div>
          </div>
          <div
            className="text-[11px] font-mono px-4 py-3 rounded-xl shrink-0"
            style={{
              background: "rgba(15,30,28,0.75)",
              border: `1px solid ${border}`,
              color: "var(--text-secondary)",
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Database size={13} style={{ color: accent }} />
              집계 스냅샷
            </div>
            <div style={{ color: "var(--text-primary)" }}>{loading ? "로딩 중..." : "로드 완료"}</div>
            <div className="mt-2 opacity-80 space-y-1">
              <div>
                전체 표본(랭크·스쿼드):{" "}
                {totalGamesAll != null ? fmtStat(totalGamesAll) : "—"}판
              </div>
              <div>
                표시 조합 {filtered.length}행 · 표본 합계(표시 행만) {fmtStat(totals.games)} · 가중 승률{" "}
                {fmtStat(totals.blendedWin)}%
              </div>
            </div>
          </div>
        </header>

        <div
          className="flex flex-col sm:flex-row gap-3 mb-6"
          style={{ borderBottom: `1px solid ${border}`, paddingBottom: "1rem" }}
        >
          <div
            className="flex-1 flex items-center gap-3 rounded-xl px-4 py-3"
            style={{ background: "rgba(12,28,24,0.6)", border: `1px solid ${border}` }}
          >
            <Search size={17} style={{ color: accent }} className="shrink-0 opacity-85" />
            <input
              value={charQ}
              onChange={(e) => setCharQ(e.target.value)}
              placeholder="무기/캐릭터 필터 (예: 쌍검 유키)"
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: "var(--text-primary)" }}
            />
          </div>
        </div>

        <div
          className="flex gap-2 items-start mb-4 text-[11px]"
          style={{ color: "var(--text-secondary)" }}
        >
          <Info size={14} className="shrink-0 mt-0.5" style={{ color: accent }} />
          <span>
            무기 + 캐릭터 조합 기준입니다. 집계는 랭크 매칭·스쿼드만 포함하며, 표는 최대 200개 조합·조합당 최소
            10판만 노출합니다. 상단 &quot;전체 표본&quot;이 DB에 쌓인 랭크 스쿼드 판 수입니다.
          </span>
        </div>
        {error && (
          <p className="mb-4 text-sm" style={{ color: "#f87171" }}>
            오류: {error}
          </p>
        )}

        {/* 데스크톱 테이블 */}
        <div
          className="hidden md:block rounded-xl overflow-hidden"
          style={{
            border: `1px solid ${borderHi}`,
            background: "linear-gradient(180deg, rgba(17,24,39,0.94) 0%, rgba(15,23,42,0.96) 100%)",
          }}
        >
          <div className="max-h-[68vh] overflow-auto">
            <table className="w-full text-left text-sm border-collapse min-w-[780px]">
              <thead>
                <tr
                  style={{
                    borderBottom: `1px solid ${border}`,
                    background: "rgba(0,0,0,0.25)",
                  }}
                >
                  <SortTh
                    col={null}
                    align="right"
                    className="px-3"
                    activeColumn={sortColumn}
                    sortDir={sortDir}
                    onSort={handleSortClick}
                  >
                    순위
                  </SortTh>
                  <SortTh
                    col="label"
                    align="left"
                    className="px-4 w-[220px]"
                    activeColumn={sortColumn}
                    sortDir={sortDir}
                    onSort={handleSortClick}
                  >
                    무기 · 실험체
                  </SortTh>
                  <SortTh col="games" className="px-3" activeColumn={sortColumn} sortDir={sortDir} onSort={handleSortClick}>
                    표본
                  </SortTh>
                  <SortTh col="tierGrade" className="px-3" activeColumn={sortColumn} sortDir={sortDir} onSort={handleSortClick}>
                    티어
                  </SortTh>
                  <SortTh col="tierScore" className="px-3" activeColumn={sortColumn} sortDir={sortDir} onSort={handleSortClick}>
                    티어점수
                  </SortTh>
                  <SortTh col="pickRatePct" className="px-3" activeColumn={sortColumn} sortDir={sortDir} onSort={handleSortClick}>
                    전체픽률
                  </SortTh>
                  <SortTh col="winRatePct" className="px-3" activeColumn={sortColumn} sortDir={sortDir} onSort={handleSortClick}>
                    승률
                  </SortTh>
                  <SortTh col="top3RatePct" className="px-3" activeColumn={sortColumn} sortDir={sortDir} onSort={handleSortClick}>
                    Top3%
                  </SortTh>
                  <SortTh col="avgRank" className="px-3" activeColumn={sortColumn} sortDir={sortDir} onSort={handleSortClick}>
                    평균순위
                  </SortTh>
                  <SortTh col="avgKill" className="px-3" activeColumn={sortColumn} sortDir={sortDir} onSort={handleSortClick}>
                    평균 킬
                  </SortTh>
                  <SortTh col="avgTk" className="px-3" activeColumn={sortColumn} sortDir={sortDir} onSort={handleSortClick}>
                    평균 TK
                  </SortTh>
                  <SortTh col="avgRpGain" className="px-3" activeColumn={sortColumn} sortDir={sortDir} onSort={handleSortClick}>
                    평균 RP
                  </SortTh>
                  <SortTh col="avgDamage" className="px-3" activeColumn={sortColumn} sortDir={sortDir} onSort={handleSortClick}>
                    평균딜(플레이어)
                  </SortTh>
                </tr>
              </thead>
              <tbody>
                {sortedRows.map((row, idx) => (
                  <tr
                    key={`${row.characterNum}-${row.weaponId}-${idx}`}
                    style={{
                      borderBottom: "1px solid rgba(148,163,184,0.18)",
                      background: idx % 2 === 0 ? "rgba(255,255,255,0.01)" : "rgba(255,255,255,0.03)",
                    }}
                  >
                    <td className="px-3 py-3 text-right">
                      <NumCell mono>{idx + 1}</NumCell>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <StatThumb
                          nameKo={resolveCharacterDisplayName(row.characterNum, charCatalog)}
                        />
                        <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                          {(row.weaponName ?? `#${row.weaponId}`) +
                            " " +
                            resolveCharacterDisplayName(row.characterNum, charCatalog)}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <NumCell mono>{fmtStat(row.games)}</NumCell>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <span
                        className="inline-flex items-center justify-center min-w-[38px] px-2 py-0.5 rounded-md text-xs font-black tracking-wide"
                        style={{
                          color: tierBadgeStyle(row.tierGrade).color,
                          background: tierBadgeStyle(row.tierGrade).bg,
                          border: `1px solid ${tierBadgeStyle(row.tierGrade).border}`,
                        }}
                      >
                        {row.tierGrade}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <NumCell mono>{fmtStat(row.tierScore)}</NumCell>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <NumCell mono>{fmtStat(row.pickRatePct)}%</NumCell>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <NumCell mono>
                        <span style={{ color: row.winRatePct >= 50 ? "#60a5fa" : "var(--text-primary)" }}>
                          {fmtStat(row.winRatePct)}%
                        </span>
                      </NumCell>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <NumCell mono>{fmtStat(row.top3RatePct)}%</NumCell>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <NumCell mono>{fmtStat(row.avgRank)}</NumCell>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <NumCell mono>{fmtStat(row.avgKill)}</NumCell>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <NumCell mono>{fmtStat(row.avgTk)}</NumCell>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <NumCell mono>{fmtStat(row.avgRpGain)}</NumCell>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <NumCell mono>{fmtStat(row.avgDamage)}</NumCell>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {sortedRows.length === 0 && (
            <p className="text-center py-16 text-sm" style={{ color: "var(--text-secondary)" }}>
              조건에 맞는 행이 없습니다.
            </p>
          )}
        </div>

        {/* 모바일 카드 */}
        <div className="md:hidden space-y-3">
          {sortedRows.map((row, idx) => (
            <div
              key={`${row.characterNum}-${row.weaponId}-m-${idx}`}
              className="rounded-xl p-4"
              style={{
                border: `1px solid ${border}`,
                background: "rgba(12,28,24,0.55)",
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <StatThumb
                  nameKo={resolveCharacterDisplayName(row.characterNum, charCatalog)}
                />
                <div>
                  <div className="font-bold" style={{ color: "var(--text-primary)" }}>
                    {(row.weaponName ?? `#${row.weaponId}`) +
                      " " +
                      resolveCharacterDisplayName(row.characterNum, charCatalog)}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: accent }}>
                    characterNum: {row.characterNum}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono" style={{ color: "var(--text-secondary)" }}>
                <div>
                  표본 <span style={{ color: "var(--text-primary)" }}>{fmtStat(row.games)}</span>
                </div>
                <div>
                  티어{" "}
                  <span
                    className="inline-flex items-center justify-center min-w-[34px] px-1.5 py-0.5 rounded-md text-[11px] font-black"
                    style={{
                      color: tierBadgeStyle(row.tierGrade).color,
                      background: tierBadgeStyle(row.tierGrade).bg,
                      border: `1px solid ${tierBadgeStyle(row.tierGrade).border}`,
                    }}
                  >
                    {row.tierGrade}
                  </span>
                </div>
                <div>
                  티어점수 <span style={{ color: "var(--text-primary)" }}>{fmtStat(row.tierScore)}</span>
                </div>
                <div>
                  전체픽률 <span style={{ color: "var(--text-primary)" }}>{fmtStat(row.pickRatePct)}%</span>
                </div>
                <div>
                  승률 <span style={{ color: accent }}>{fmtStat(row.winRatePct)}%</span>
                </div>
                <div>
                  TOP3 <span style={{ color: "var(--text-primary)" }}>{fmtStat(row.top3RatePct)}%</span>
                </div>
                <div>
                  평균순위 <span style={{ color: "var(--text-primary)" }}>{fmtStat(row.avgRank)}</span>
                </div>
                <div>
                  평균킬 <span style={{ color: "var(--text-primary)" }}>{fmtStat(row.avgKill)}</span>
                </div>
                <div>
                  평균TK <span style={{ color: "var(--text-primary)" }}>{fmtStat(row.avgTk)}</span>
                </div>
                <div>
                  평균RP <span style={{ color: "var(--text-primary)" }}>{fmtStat(row.avgRpGain)}</span>
                </div>
                <div>
                  딜(플레이어) <span style={{ color: "var(--text-primary)" }}>{fmtStat(row.avgDamage)}</span>
                </div>
              </div>
            </div>
          ))}
          {sortedRows.length === 0 && (
            <p className="text-center py-12 text-sm" style={{ color: "var(--text-secondary)" }}>
              조건에 맞는 행이 없습니다.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

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
} from "lucide-react";
import { getCharacterDefaultMiniSrc } from "@/lib/characterDefaultMini";
import { getCharacterStats } from "@/lib/api";
import type { CharacterStatsRow } from "@/lib/types";

const accent = "#93c5fd";
const border = "rgba(148,163,184,0.24)";
const borderHi = "rgba(148,163,184,0.38)";

function StatThumb({ nameKo }: { nameKo: string }) {
  const src = getCharacterDefaultMiniSrc(nameKo);
  if (!src) {
    return (
      <div
        className="rounded-lg flex items-center justify-center text-[10px] font-mono font-bold shrink-0"
        style={{
          width: 40,
          height: 40,
          background: "rgba(52,211,153,0.08)",
          border: `1px solid ${border}`,
          color: "var(--text-secondary)",
        }}
      >
        {nameKo.slice(0, 1)}
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt={nameKo}
      width={40}
      height={40}
      className="rounded-lg object-cover object-top shrink-0"
      style={{ border: `1px solid ${border}` }}
    />
  );
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

function tierBadgeStyle(grade: string): { color: string; bg: string; border: string } {
  if (grade === "S+") return { color: "#fde68a", bg: "rgba(245, 158, 11, 0.18)", border: "rgba(245, 158, 11, 0.45)" };
  if (grade === "S") return { color: "#fcd34d", bg: "rgba(234, 179, 8, 0.18)", border: "rgba(234, 179, 8, 0.42)" };
  if (grade === "A") return { color: "#93c5fd", bg: "rgba(59, 130, 246, 0.16)", border: "rgba(59, 130, 246, 0.38)" };
  if (grade === "B") return { color: "#86efac", bg: "rgba(34, 197, 94, 0.16)", border: "rgba(34, 197, 94, 0.34)" };
  if (grade === "C") return { color: "#cbd5e1", bg: "rgba(148, 163, 184, 0.16)", border: "rgba(148, 163, 184, 0.34)" };
  return { color: "#fca5a5", bg: "rgba(239, 68, 68, 0.16)", border: "rgba(239, 68, 68, 0.34)" };
}

export default function StatsPage() {
  const [charQ, setCharQ] = useState("");
  const [rows, setRows] = useState<CharacterStatsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getCharacterStats(10, 200);
        if (!mounted) return;
        setRows(data.items ?? []);
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
      const name = row.character_name ?? "";
      if (c && !name.includes(c) && !String(row.character_num).includes(c)) return false;
      return true;
    });
  }, [charQ, rows]);

  const totals = useMemo(() => {
    const g = filtered.reduce((s, r) => s + r.games, 0);
    const wr = g > 0 ? filtered.reduce((s, r) => s + (r.win_rate_pct / 100) * r.games, 0) / g : 0;
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
                캐릭터 평균 통계
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
            <div className="mt-2 opacity-80">
              필터 행 {filtered.length} · 표본 합계 {totals.games.toLocaleString()} · 가중 승률{" "}
              {totals.blendedWin}%
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
              placeholder="실험체 이름 필터"
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
            character 테이블에 이름이 있으면 함께 표시하며, 없으면 character_num 기준으로 노출합니다.
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
            <table className="w-full text-left text-sm border-collapse min-w-[920px]">
              <thead>
                <tr
                  className="text-[10px] font-mono uppercase tracking-wider"
                  style={{
                    color: "var(--text-secondary)",
                    borderBottom: `1px solid ${border}`,
                    background: "rgba(0,0,0,0.25)",
                  }}
                >
                  <th className="px-3 py-3 text-right sticky top-0 z-20" style={{ background: "rgba(17,24,39,0.98)" }}>순위</th>
                  <th className="px-4 py-3 w-[200px] sticky top-0 z-20" style={{ background: "rgba(17,24,39,0.98)" }}>실험체</th>
                  <th className="px-3 py-3 text-right sticky top-0 z-20" style={{ background: "rgba(17,24,39,0.98)" }}>표본</th>
                  <th className="px-3 py-3 text-right sticky top-0 z-20" style={{ background: "rgba(17,24,39,0.98)" }}>티어</th>
                  <th className="px-3 py-3 text-right sticky top-0 z-20" style={{ background: "rgba(17,24,39,0.98)" }}>티어점수</th>
                  <th className="px-3 py-3 text-right sticky top-0 z-20" style={{ background: "rgba(17,24,39,0.98)" }}>픽률</th>
                  <th className="px-3 py-3 text-right sticky top-0 z-20" style={{ background: "rgba(17,24,39,0.98)" }}>승률</th>
                  <th className="px-3 py-3 text-right sticky top-0 z-20" style={{ background: "rgba(17,24,39,0.98)" }}>Top3%</th>
                  <th className="px-3 py-3 text-right sticky top-0 z-20" style={{ background: "rgba(17,24,39,0.98)" }}>평균순위</th>
                  <th className="px-3 py-3 text-right sticky top-0 z-20" style={{ background: "rgba(17,24,39,0.98)" }}>평균 킬</th>
                  <th className="px-3 py-3 text-right sticky top-0 z-20" style={{ background: "rgba(17,24,39,0.98)" }}>평균 TK</th>
                  <th className="px-3 py-3 text-right sticky top-0 z-20" style={{ background: "rgba(17,24,39,0.98)" }}>평균 RP</th>
                  <th className="px-3 py-3 text-right sticky top-0 z-20" style={{ background: "rgba(17,24,39,0.98)" }}>평균딜(플레이어)</th>
                  <th className="px-4 py-3 text-right sticky top-0 z-20" style={{ background: "rgba(17,24,39,0.98)" }}>평균딜(동물)</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, idx) => (
                  <tr
                    key={`${row.character_num}-${idx}`}
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
                        <StatThumb nameKo={row.character_name ?? String(row.character_num)} />
                        <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                          {row.character_name ?? `#${row.character_num}`}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <NumCell mono>{row.games.toLocaleString()}</NumCell>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <span
                        className="inline-flex items-center justify-center min-w-[38px] px-2 py-0.5 rounded-md text-xs font-black tracking-wide"
                        style={{
                          color: tierBadgeStyle(row.tier_grade).color,
                          background: tierBadgeStyle(row.tier_grade).bg,
                          border: `1px solid ${tierBadgeStyle(row.tier_grade).border}`,
                        }}
                      >
                        {row.tier_grade}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <NumCell mono>{row.tier_score}</NumCell>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <NumCell mono>{row.pick_rate_pct}%</NumCell>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <NumCell mono>
                        <span style={{ color: row.win_rate_pct >= 50 ? "#60a5fa" : "var(--text-primary)" }}>
                          {row.win_rate_pct}%
                        </span>
                      </NumCell>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <NumCell mono>{row.top3_rate_pct}%</NumCell>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <NumCell mono>{row.avg_rank}</NumCell>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <NumCell mono>{row.avg_kill}</NumCell>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <NumCell mono>{row.avg_tk}</NumCell>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <NumCell mono>{row.avg_rp_gain}</NumCell>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <NumCell mono>{Math.round(row.avg_damage).toLocaleString()}</NumCell>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <NumCell mono>{Math.round(row.avg_damage_to_monster).toLocaleString()}</NumCell>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <p className="text-center py-16 text-sm" style={{ color: "var(--text-secondary)" }}>
              조건에 맞는 행이 없습니다.
            </p>
          )}
        </div>

        {/* 모바일 카드 */}
        <div className="md:hidden space-y-3">
          {filtered.map((row, idx) => (
            <div
              key={`${row.character_num}-m-${idx}`}
              className="rounded-xl p-4"
              style={{
                border: `1px solid ${border}`,
                background: "rgba(12,28,24,0.55)",
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <StatThumb nameKo={row.character_name ?? String(row.character_num)} />
                <div>
                  <div className="font-bold" style={{ color: "var(--text-primary)" }}>
                    {row.character_name ?? `#${row.character_num}`}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: accent }}>
                    character_num: {row.character_num}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono" style={{ color: "var(--text-secondary)" }}>
                <div>
                  표본 <span style={{ color: "var(--text-primary)" }}>{row.games}</span>
                </div>
                <div>
                  티어{" "}
                  <span
                    className="inline-flex items-center justify-center min-w-[34px] px-1.5 py-0.5 rounded-md text-[11px] font-black"
                    style={{
                      color: tierBadgeStyle(row.tier_grade).color,
                      background: tierBadgeStyle(row.tier_grade).bg,
                      border: `1px solid ${tierBadgeStyle(row.tier_grade).border}`,
                    }}
                  >
                    {row.tier_grade}
                  </span>
                </div>
                <div>
                  티어점수 <span style={{ color: "var(--text-primary)" }}>{row.tier_score}</span>
                </div>
                <div>
                  픽률 <span style={{ color: "var(--text-primary)" }}>{row.pick_rate_pct}%</span>
                </div>
                <div>
                  승률 <span style={{ color: accent }}>{row.win_rate_pct}%</span>
                </div>
                <div>
                  TOP3 <span style={{ color: "var(--text-primary)" }}>{row.top3_rate_pct}%</span>
                </div>
                <div>
                  평균순위 <span style={{ color: "var(--text-primary)" }}>{row.avg_rank}</span>
                </div>
                <div>
                  평균킬 <span style={{ color: "var(--text-primary)" }}>{row.avg_kill}</span>
                </div>
                <div>
                  평균TK <span style={{ color: "var(--text-primary)" }}>{row.avg_tk}</span>
                </div>
                <div>
                  평균RP <span style={{ color: "var(--text-primary)" }}>{row.avg_rp_gain}</span>
                </div>
                <div>
                  딜(플레이어) <span style={{ color: "var(--text-primary)" }}>{Math.round(row.avg_damage).toLocaleString()}</span>
                </div>
                <div>
                  딜(동물) <span style={{ color: "var(--text-primary)" }}>{Math.round(row.avg_damage_to_monster).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-center py-12 text-sm" style={{ color: "var(--text-secondary)" }}>
              조건에 맞는 행이 없습니다.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

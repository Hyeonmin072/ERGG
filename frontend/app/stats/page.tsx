"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import {
  PieChart,
  ArrowLeft,
  Search,
  Database,
  Swords,
  Info,
} from "lucide-react";
import { getCharacterDefaultMiniSrc } from "@/lib/characterDefaultMini";
import { IN1000_META, WEAPON_IN1000_MOCK_ROWS } from "@/lib/statsIn1000Mock";

const accent = "#34d399";
const border = "rgba(52,211,153,0.14)";
const borderHi = "rgba(52,211,153,0.28)";

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

export default function StatsPage() {
  const [charQ, setCharQ] = useState("");
  const [weaponQ, setWeaponQ] = useState("");

  const filtered = useMemo(() => {
    const c = charQ.trim();
    const w = weaponQ.trim();
    return WEAPON_IN1000_MOCK_ROWS.filter((row) => {
      if (c && !row.characterKo.includes(c)) return false;
      if (w && !row.weaponName.includes(w)) return false;
      return true;
    });
  }, [charQ, weaponQ]);

  const totals = useMemo(() => {
    const g = filtered.reduce((s, r) => s + r.games, 0);
    const wr =
      g > 0
        ? (filtered.reduce((s, r) => s + (r.winRate / 100) * r.games, 0) / g) * 100
        : 0;
    return { games: g, blendedWin: g > 0 ? Math.round(wr * 10) / 10 : 0 };
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
                  {IN1000_META.label}
                </span>
                <span className="text-[10px] font-mono" style={{ color: "var(--text-secondary)" }}>
                  {IN1000_META.seasonLabel}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>
                실험체 · 무기 평균 통계
              </h1>
              <p className="text-sm mt-2 max-w-2xl" style={{ color: "var(--text-secondary)" }}>
                {IN1000_META.description}. 표본·승률·딜 등은 UI 확인용 가상 수치입니다.
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
            <div style={{ color: "var(--text-primary)" }}>갱신일 {IN1000_META.lastUpdated}</div>
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
          <div
            className="flex-1 flex items-center gap-3 rounded-xl px-4 py-3"
            style={{ background: "rgba(12,28,24,0.6)", border: `1px solid ${border}` }}
          >
            <Swords size={17} style={{ color: accent }} className="shrink-0 opacity-85" />
            <input
              value={weaponQ}
              onChange={(e) => setWeaponQ(e.target.value)}
              placeholder="무기 이름 필터"
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
            캐릭터 초상은 <span className="font-mono">public/images/character/default</span>의 미니 이미지를
            사용합니다. 매핑 없는 실험체는 이니셜로 표시됩니다.
          </span>
        </div>

        {/* 데스크톱 테이블 */}
        <div
          className="hidden md:block rounded-xl overflow-hidden"
          style={{
            border: `1px solid ${borderHi}`,
            background: "linear-gradient(180deg, rgba(16,32,28,0.85) 0%, rgba(8,18,16,0.92) 100%)",
          }}
        >
          <div className="overflow-x-auto">
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
                  <th className="px-4 py-3 w-[200px]">실험체</th>
                  <th className="px-3 py-3 w-[120px]">무기</th>
                  <th className="px-3 py-3 text-right">표본</th>
                  <th className="px-3 py-3 text-right">무기비중</th>
                  <th className="px-3 py-3 text-right">승률</th>
                  <th className="px-3 py-3 text-right">평균순위</th>
                  <th className="px-3 py-3 text-right">평균K</th>
                  <th className="px-3 py-3 text-right">평균A</th>
                  <th className="px-3 py-3 text-right">평균D</th>
                  <th className="px-4 py-3 text-right">평균딜</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, idx) => (
                  <tr
                    key={`${row.characterKo}-${row.weaponName}-${idx}`}
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                    }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <StatThumb nameKo={row.characterKo} />
                        <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                          {row.characterKo}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3" style={{ color: "var(--text-primary)" }}>
                      {row.weaponName}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <NumCell mono>{row.games.toLocaleString()}</NumCell>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <NumCell mono>{row.weaponSharePct}%</NumCell>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <NumCell mono>
                        <span style={{ color: row.winRate >= 50 ? accent : "var(--text-primary)" }}>
                          {row.winRate}%
                        </span>
                      </NumCell>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <NumCell mono>{row.avgRank}</NumCell>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <NumCell mono>{row.avgKill}</NumCell>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <NumCell mono>{row.avgAssist}</NumCell>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <NumCell mono>{row.avgDeath}</NumCell>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <NumCell mono>{row.avgDamage.toLocaleString()}</NumCell>
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
              key={`${row.characterKo}-${row.weaponName}-m-${idx}`}
              className="rounded-xl p-4"
              style={{
                border: `1px solid ${border}`,
                background: "rgba(12,28,24,0.55)",
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <StatThumb nameKo={row.characterKo} />
                <div>
                  <div className="font-bold" style={{ color: "var(--text-primary)" }}>
                    {row.characterKo}
                  </div>
                  <div className="text-xs flex items-center gap-1.5 mt-0.5" style={{ color: accent }}>
                    <Swords size={12} />
                    {row.weaponName}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono" style={{ color: "var(--text-secondary)" }}>
                <div>
                  표본 <span style={{ color: "var(--text-primary)" }}>{row.games}</span>
                </div>
                <div>
                  무기비중 <span style={{ color: "var(--text-primary)" }}>{row.weaponSharePct}%</span>
                </div>
                <div>
                  승률 <span style={{ color: accent }}>{row.winRate}%</span>
                </div>
                <div>
                  평균순위 <span style={{ color: "var(--text-primary)" }}>{row.avgRank}</span>
                </div>
                <div>
                  K/A/D{" "}
                  <span style={{ color: "var(--text-primary)" }}>
                    {row.avgKill}/{row.avgAssist}/{row.avgDeath}
                  </span>
                </div>
                <div>
                  평균딜 <span style={{ color: "var(--text-primary)" }}>{row.avgDamage.toLocaleString()}</span>
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

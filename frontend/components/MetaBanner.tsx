"use client";
import type { CharacterStatsResponse } from "@/lib/types";

interface Props {
  stats: CharacterStatsResponse | null;
  loading: boolean;
}

function StatItem({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-black mb-1" style={{ color }}>
        {value}
      </div>
      <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
        {label}
      </div>
    </div>
  );
}

export default function MetaBanner({ stats, loading }: Props) {
  const p = "—";

  const totalGames = loading ? p : stats ? stats.totalGames.toLocaleString() : p;
  const comboCount = loading ? p : stats ? stats.count.toLocaleString() : p;
  const topChar = loading ? p : (stats?.items[0]?.characterName ?? p);
  const topWinRate = loading ? p : stats?.items[0] ? `${stats.items[0].adjWinRatePct.toFixed(1)}%` : p;

  return (
    <div
      className="w-full flex justify-center gap-10 sm:gap-16 py-5 rounded-2xl"
      style={{
        background: "rgba(20,29,53,0.55)",
        border: "1px solid rgba(255,255,255,0.07)",
        backdropFilter: "blur(10px)",
      }}
    >
      <StatItem value={totalGames} label="총 분석 전적" color="#60a5fa" />
      <StatItem value={comboCount} label="실험체 조합" color="#a78bfa" />
      <StatItem value={topChar} label="현재 1위 실험체" color="#22c55e" />
      <StatItem value={topWinRate} label="1위 조합 승률" color="#f87171" />
    </div>
  );
}

"use client";
import Image from "next/image";
import Link from "next/link";
import type { CharacterStatsResponse } from "@/lib/types";
import { getCharacterDefaultMiniSrc } from "@/lib/characterDefaultMini";
import { getGradeColor } from "@/lib/mock";

interface Props {
  stats: CharacterStatsResponse | null;
  loading: boolean;
}

function SkeletonCard() {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl animate-pulse"
      style={{
        background: "rgba(20,29,53,0.55)",
        border: "1px solid rgba(255,255,255,0.06)",
        minWidth: 200,
      }}
    >
      <div className="w-5 h-4 rounded" style={{ background: "rgba(255,255,255,0.06)" }} />
      <div className="w-8 h-8 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }} />
      <div className="flex-1">
        <div className="h-3 w-24 rounded mb-1" style={{ background: "rgba(255,255,255,0.06)" }} />
        <div className="h-3 w-12 rounded" style={{ background: "rgba(255,255,255,0.06)" }} />
      </div>
    </div>
  );
}

export default function TopCharacterCards({ stats, loading }: Props) {
  if (loading) {
    return (
      <div className="w-full flex flex-wrap gap-3">
        {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (!stats || stats.items.length === 0) return null;

  const top5 = stats.items.slice(0, 5);

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-3">
        {top5.map((item, idx) => {
          const imgSrc = item.characterName ? getCharacterDefaultMiniSrc(item.characterName) : null;
          const gradeColor = getGradeColor(item.tierGrade);
          const label = [item.weaponName, item.characterName].filter(Boolean).join(" ");

          return (
            <Link
              key={`${item.characterNum}-${item.weaponId}`}
              href="/stats"
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:brightness-110 no-underline"
              style={{
                background: "rgba(20,29,53,0.70)",
                border: "1px solid rgba(255,255,255,0.07)",
                backdropFilter: "blur(8px)",
              }}
            >
              <span
                className="text-xs font-bold w-5 text-right shrink-0"
                style={{ color: "var(--text-secondary)" }}
              >
                #{idx + 1}
              </span>
              <div
                className="w-8 h-8 rounded-full overflow-hidden shrink-0 flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}
              >
                {imgSrc ? (
                  <Image src={imgSrc} alt={item.characterName ?? ""} width={32} height={32} className="object-cover" />
                ) : (
                  <span className="text-[10px]" style={{ color: "var(--text-secondary)" }}>
                    {item.characterName?.slice(0, 1) ?? "?"}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                  {label}
                </div>
                <div className="text-xs" style={{ color: "#22c55e" }}>
                  {item.adjWinRatePct.toFixed(1)}%
                </div>
              </div>
              <span
                className="ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0"
                style={{
                  background: `${gradeColor}22`,
                  color: gradeColor,
                  border: `1px solid ${gradeColor}44`,
                }}
              >
                {item.tierGrade}
              </span>
            </Link>
          );
        })}
      </div>
      <div className="mt-3 text-right">
        <Link href="/stats" className="text-xs no-underline hover:underline" style={{ color: "var(--text-secondary)" }}>
          전체 통계 보기 →
        </Link>
      </div>
    </div>
  );
}

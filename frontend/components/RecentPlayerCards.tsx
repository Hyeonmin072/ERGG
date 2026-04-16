"use client";
import Link from "next/link";
import Image from "next/image";
import type { RecentSearchEntry } from "@/hooks/useRecentSearches";
import { getTierColorFromRankOrRP, getTierImageFromRankOrRP } from "@/lib/mock";

interface Props {
  searches: RecentSearchEntry[];
}

export default function RecentPlayerCards({ searches }: Props) {
  if (searches.length === 0) return null;

  return (
    <div className="w-full">
      <div className="mb-3">
        <h2 className="text-sm font-bold" style={{ color: "var(--text-secondary)" }}>
          최근 검색
        </h2>
      </div>
      <div className="flex flex-wrap gap-3">
        {searches.map((entry) => {
          const hasTier = entry.tier != null && entry.rankPoint != null;
          const tierColor = hasTier
            ? getTierColorFromRankOrRP(entry.rankPoint!, null)
            : "rgba(255,255,255,0.4)";
          const tierImg = hasTier
            ? getTierImageFromRankOrRP(entry.rankPoint!, null)
            : null;

          return (
            <Link
              key={entry.nickname}
              href={`/player/${encodeURIComponent(entry.nickname)}`}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:brightness-110 no-underline"
              style={{
                background: "rgba(20,29,53,0.70)",
                border: "1px solid rgba(255,255,255,0.07)",
                backdropFilter: "blur(8px)",
                minWidth: 160,
              }}
            >
              <div className="w-8 h-8 shrink-0 flex items-center justify-center">
                {tierImg ? (
                  <Image src={tierImg} alt={entry.tier ?? ""} width={32} height={32} style={{ objectFit: "contain" }} />
                ) : (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-secondary)" }}
                  >
                    {entry.nickname.slice(0, 1)}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold truncate" style={{ color: "var(--text-primary)" }}>
                  {entry.nickname}
                </div>
                {hasTier ? (
                  <div className="text-xs" style={{ color: tierColor }}>
                    {entry.tier} · {entry.rankPoint!.toLocaleString()} RP
                  </div>
                ) : (
                  <div className="text-xs" style={{ color: "var(--text-secondary)" }}>—</div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

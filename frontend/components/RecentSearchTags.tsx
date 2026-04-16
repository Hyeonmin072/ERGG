"use client";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import type { RecentSearchEntry } from "@/hooks/useRecentSearches";

interface Props {
  searches: RecentSearchEntry[];
  onRemove: (nickname: string) => void;
  onClearAll: () => void;
}

export default function RecentSearchTags({ searches, onRemove, onClearAll }: Props) {
  const router = useRouter();

  if (searches.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap mt-3">
      <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
        최근:
      </span>
      {searches.map((entry) => (
        <span
          key={entry.nickname}
          className="flex items-center gap-1 rounded-full px-3 py-1 text-xs"
          style={{
            background: "rgba(20,29,53,0.80)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "var(--text-secondary)",
          }}
        >
          <button
            type="button"
            onClick={() =>
              router.push(`/player/${encodeURIComponent(entry.nickname)}`)
            }
            className="hover:text-white transition-colors"
          >
            {entry.nickname}
          </button>
          <button
            type="button"
            onClick={() => onRemove(entry.nickname)}
            className="ml-0.5 opacity-50 hover:opacity-100 transition-opacity"
            aria-label={`${entry.nickname} 삭제`}
          >
            <X size={10} />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="text-xs transition-colors hover:text-white"
        style={{ color: "var(--text-secondary)", opacity: 0.5 }}
      >
        전체삭제
      </button>
    </div>
  );
}

"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, Target, LineChart, UsersRound, PieChart } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) router.push(`/player/${encodeURIComponent(trimmed)}`);
  };

  return (
    <nav
      className="sticky top-0 z-50 border-b"
      style={{
        background: "linear-gradient(180deg, rgba(15,22,41,0.82) 0%, rgba(15,22,41,0.68) 100%)",
        borderColor: "rgba(255,255,255,0.08)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span
            className="text-xl font-black tracking-widest"
            style={{ letterSpacing: "0.15em" }}
          >
            ER.GG
          </span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-sm">
          <div
            className="flex items-center rounded-lg px-3 py-1.5 gap-2"
            style={{
              background: "rgba(20,29,53,0.55)",
              border: "1px solid rgba(255,255,255,0.10)",
              backdropFilter: "blur(8px)",
            }}
          >
            <Search size={14} style={{ color: "var(--text-secondary)" }} />
            <input
              type="text"
              placeholder="닉네임 검색..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-transparent text-sm flex-1 placeholder:opacity-40"
              style={{ color: "var(--text-primary)" }}
            />
          </div>
        </form>

        {/* Nav links */}
        <div className="flex items-center gap-0.5 sm:gap-1 ml-auto flex-wrap justify-end">
          <Link
            href="/ai/defeat"
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-white/5"
            style={{
              color: "var(--text-secondary)",
              border: "1px solid transparent",
            }}
          >
            <Target size={13} style={{ color: "#f87171" }} />
            <span className="hidden sm:inline">패배 분석</span>
          </Link>
          <Link
            href="/ai/personal"
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-white/5"
            style={{
              color: "var(--text-secondary)",
              border: "1px solid transparent",
            }}
          >
            <LineChart size={13} style={{ color: "#60a5fa" }} />
            <span className="hidden sm:inline">개인 지표</span>
          </Link>
          <Link
            href="/ai/combo"
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-white/5"
            style={{
              color: "var(--text-secondary)",
              border: "1px solid transparent",
            }}
          >
            <UsersRound size={13} style={{ color: "#a78bfa" }} />
            <span className="hidden sm:inline">조합 예측</span>
          </Link>
          <Link
            href="/stats"
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-white/5"
            style={{
              color: "var(--text-secondary)",
              border: "1px solid transparent",
            }}
          >
            <PieChart size={13} style={{ color: "#34d399" }} />
            <span className="hidden sm:inline">통계</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

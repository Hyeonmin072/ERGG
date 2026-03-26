"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Zap, BarChart2, Map, ChevronRight } from "lucide-react";
import HeroGeometry from "@/components/HeroGeometry";

const RECENT_SEARCHES = ["김현민", "나쟈장인", "ElenaKing", "현우고수"];

const FEATURES = [
  {
    icon: <div className="text-2xl">⬡</div>,
    title: "옥타곤 지표",
    desc: "최근 20게임 기반 6가지 플레이 스타일 분석 — 전투·결투·사냥·시야·마스터리·생존",
  },
  {
    icon: <Zap size={22} style={{ color: "var(--home-accent)" }} />,
    title: "나쟈의 독설",
    desc: "AI가 당신의 패배 원인을 냉정하게 분석합니다. 감정 없이 데이터로만 판단합니다.",
  },
  {
    icon: <BarChart2 size={22} style={{ color: "#00ff88" }} />,
    title: "실시간 메타 브리핑",
    desc: "오늘 Asia 서버 상위권에서 급부상한 실험체·아이템 빌드를 매일 요약합니다.",
  },
  {
    icon: <Map size={22} style={{ color: "#ffa726" }} />,
    title: "AI 루트 컨설턴트",
    desc: '자연어로 요청하세요. "현우 초반 교전 루트 알려줘" → 최적 루트 즉시 추천.',
  },
];

export default function HomePage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const handleSearch = (nick: string) => {
    const trimmed = nick.trim();
    if (trimmed) router.push(`/player/${encodeURIComponent(trimmed)}`);
  };

  return (
    <div
      className="flex flex-col items-center min-h-screen pt-24 pb-20 px-4 relative overflow-hidden"
      style={{
        ["--home-accent" as any]: "rgba(255,255,255,0.92)",
        ["--home-accent-soft" as any]: "rgba(255,255,255,0.22)",
        ["--home-border" as any]: "rgba(255,255,255,0.10)",
        background: [
          "radial-gradient(ellipse 85% 55% at 50% 0%, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.00) 62%)",
          "linear-gradient(180deg, rgba(10,14,26,0.00) 0%, rgba(10,14,26,0.35) 55%, rgba(10,14,26,0.65) 100%)",
        ].join(", "),
      }}
    >
      {/* ── 회전 정이십면체 배경 ── */}
      <div
        className="absolute flex items-start justify-center"
        style={{ top: "-80px", left: "50%", transform: "translateX(-50%)", zIndex: 0, opacity: 0.9 }}
      >
        <HeroGeometry size={700} />
      </div>

      {/* ── 텍스트 가시성을 위한 중앙 다크 오버레이 ── */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 0,
          background:
            "radial-gradient(ellipse 60% 45% at 50% 22%, rgba(10,14,26,0.72) 0%, rgba(10,14,26,0.35) 55%, transparent 100%)",
        }}
      />

      {/* Hero */}
      <div className="text-center mb-12 fade-in relative" style={{ zIndex: 1 }}>
        <div
          className="text-6xl font-black tracking-widest mb-3 neon-text"
          style={{
            letterSpacing: "0.2em",
            color: "var(--home-accent)",
            textShadow: "0 0 28px rgba(255,255,255,0.18), 0 2px 12px rgba(0,0,0,0.92)",
          }}
        >
          ER.GG
        </div>
        <p
          className="text-lg mb-1"
          style={{
            color: "rgba(226,232,240,0.95)",
            textShadow: "0 1px 8px rgba(0,0,0,0.95), 0 0 20px rgba(0,0,0,0.8)",
          }}
        >
          이터널리턴 Asia 서버 전적 분석 플랫폼
        </p>
        <p
          className="text-sm"
          style={{
            color: "#94a3b8",
            textShadow: "0 1px 6px rgba(0,0,0,0.95)",
          }}
        >
          AI가 당신의 승리를 설계합니다
        </p>
      </div>

      {/* Search box */}
      <div className="w-full max-w-xl mb-8 fade-in relative" style={{ animationDelay: "0.1s", zIndex: 1 }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(query);
          }}
          className="relative"
        >
          <div
            className="flex items-center rounded-2xl px-5 py-4 gap-3 transition-all duration-200"
            style={{
              background: "linear-gradient(180deg, rgba(20,29,53,0.78) 0%, rgba(20,29,53,0.58) 100%)",
              border: focused
                ? "1.5px solid rgba(255,255,255,0.28)"
                : "1.5px solid var(--home-border)",
              boxShadow: focused ? "0 0 0 6px rgba(255,255,255,0.06), 0 18px 50px rgba(0,0,0,0.35)" : "0 18px 50px rgba(0,0,0,0.30)",
              backdropFilter: "blur(10px)",
            }}
          >
            <Search size={18} style={{ color: focused ? "var(--home-accent)" : "var(--text-secondary)" }} />
            <input
              type="text"
              placeholder="닉네임을 입력하세요..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              className="flex-1 bg-transparent text-base"
              style={{ color: "var(--text-primary)" }}
              autoFocus
            />
            <button
              type="submit"
              disabled={!query.trim()}
              className="px-5 py-2 rounded-xl text-sm font-bold transition-all duration-200"
              style={{
                background: query.trim()
                  ? "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.72))"
                  : "rgba(255,255,255,0.08)",
                color: query.trim() ? "rgba(10,14,26,0.95)" : "var(--text-secondary)",
                cursor: query.trim() ? "pointer" : "not-allowed",
                border: query.trim() ? "1px solid rgba(255,255,255,0.25)" : "1px solid var(--home-border)",
                boxShadow: query.trim() ? "0 10px 28px rgba(0,0,0,0.35)" : "none",
              }}
            >
              검색
            </button>
          </div>
        </form>

        {/* Recent searches */}
        <div className="flex flex-wrap gap-2 mt-3 justify-center">
          {RECENT_SEARCHES.map((nick) => (
            <button
              key={nick}
              onClick={() => handleSearch(nick)}
              className="text-xs px-3 py-1 rounded-full transition-colors"
              style={{
                background: "rgba(20,29,53,0.55)",
                color: "var(--text-secondary)",
                border: "1px solid var(--home-border)",
                backdropFilter: "blur(8px)",
              }}
            >
              {nick}
            </button>
          ))}
        </div>
      </div>

      {/* Feature cards */}
      <div
        className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 gap-4 fade-in relative"
        style={{ animationDelay: "0.2s", zIndex: 1 }}
      >
        {FEATURES.map((f, i) => (
          <div
            key={i}
            className="card card-hover home-card p-5 flex items-start gap-4 cursor-pointer group"
            style={{
              background: "linear-gradient(180deg, rgba(20,29,53,0.70) 0%, rgba(15,22,41,0.55) 100%)",
              borderColor: "var(--home-border)",
              boxShadow: "0 18px 50px rgba(0,0,0,0.28)",
              backdropFilter: "blur(10px)",
            }}
          >
            <div
              className="mt-0.5 p-2 rounded-lg"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {f.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                  {f.title}
                </h3>
                <ChevronRight
                  size={14}
                  style={{ color: "var(--text-secondary)" }}
                  className="group-hover:translate-x-0.5 transition-transform"
                />
              </div>
              <p className="text-xs leading-5" style={{ color: "var(--text-secondary)" }}>
                {f.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Asia server badge */}
      <div
        className="mt-12 flex items-center gap-2 px-4 py-2 rounded-full text-xs relative"
        style={{
          zIndex: 1,
          background: "rgba(20,29,53,0.55)",
          border: "1px solid var(--home-border)",
          color: "var(--text-secondary)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div
          className="w-2 h-2 rounded-full pulse-neon"
          style={{ backgroundColor: "var(--home-accent)" }}
        />
        Asia 서버 전용 · 실시간 데이터
      </div>
    </div>
  );
}

"use client";
import { BarChart2, TrendingUp, Swords, Calendar } from "lucide-react";
import { MOCK_META } from "@/lib/mock";

export default function MetaPage() {
  const meta = MOCK_META;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div
          className="p-2.5 rounded-xl"
          style={{ background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.3)" }}
        >
          <BarChart2 size={20} style={{ color: "#00ff88" }} />
        </div>
        <div>
          <h1 className="text-xl font-black" style={{ color: "var(--text-primary)" }}>
            실시간 메타 브리핑
          </h1>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            Asia 서버 상위권 트렌드 요약
          </p>
        </div>
        <div
          className="ml-auto flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border)",
            color: "var(--text-secondary)",
          }}
        >
          <Calendar size={11} />
          {meta.date}
        </div>
      </div>

      {/* AI Summary */}
      <div
        className="card p-5 mb-6 mt-6"
        style={{
          borderColor: "rgba(0,255,136,0.25)",
          boxShadow: "0 0 20px rgba(0,255,136,0.05)",
          background: "linear-gradient(135deg, var(--bg-card), rgba(0,255,136,0.03))",
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: "#00ff88", boxShadow: "0 0 6px #00ff88" }}
          />
          <span className="text-xs font-bold" style={{ color: "#00ff88" }}>
            오늘의 메타 요약
          </span>
        </div>
        <p className="text-sm leading-7" style={{ color: "var(--text-primary)" }}>
          {meta.summary}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Top Pick Rate */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={14} style={{ color: "var(--neon-cyan)" }} />
            <h2 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
              상위 픽률
            </h2>
          </div>
          <div className="flex flex-col gap-3">
            {meta.topPicks.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className="w-5 h-5 rounded flex items-center justify-center text-xs font-black shrink-0"
                  style={{
                    backgroundColor:
                      i === 0 ? "#ffd70022" : i === 1 ? "#c0c0c022" : "var(--bg-secondary)",
                    color: i === 0 ? "#ffd700" : i === 1 ? "#c0c0c0" : "var(--text-secondary)",
                    border: `1px solid ${i === 0 ? "#ffd70033" : i === 1 ? "#c0c0c033" : "var(--border)"}`,
                  }}
                >
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-bold truncate" style={{ color: "var(--text-primary)" }}>
                      {item.characterName}
                    </span>
                    <span className="text-xs font-bold" style={{ color: "var(--neon-cyan)" }}>
                      {item.pickRate}%
                    </span>
                  </div>
                  <div
                    className="h-1 rounded-full"
                    style={{ backgroundColor: "var(--border)" }}
                  >
                    <div
                      className="h-1 rounded-full"
                      style={{
                        width: `${(item.pickRate / meta.topPicks[0].pickRate) * 100}%`,
                        background: "linear-gradient(90deg, rgba(0,212,255,0.5), var(--neon-cyan))",
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Win Rate */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Swords size={14} style={{ color: "#00ff88" }} />
            <h2 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
              상위 승률
            </h2>
          </div>
          <div className="flex flex-col gap-3">
            {meta.topWinRate.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className="w-5 h-5 rounded flex items-center justify-center text-xs font-black shrink-0"
                  style={{
                    backgroundColor:
                      i === 0 ? "#ffd70022" : i === 1 ? "#c0c0c022" : "var(--bg-secondary)",
                    color: i === 0 ? "#ffd700" : i === 1 ? "#c0c0c0" : "var(--text-secondary)",
                    border: `1px solid ${i === 0 ? "#ffd70033" : i === 1 ? "#c0c0c033" : "var(--border)"}`,
                  }}
                >
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-bold truncate" style={{ color: "var(--text-primary)" }}>
                      {item.characterName}
                    </span>
                    <span className="text-xs font-bold" style={{ color: "#00ff88" }}>
                      {item.winRate}%
                    </span>
                  </div>
                  <div
                    className="h-1 rounded-full"
                    style={{ backgroundColor: "var(--border)" }}
                  >
                    <div
                      className="h-1 rounded-full"
                      style={{
                        width: `${((item.winRate - 40) / 30) * 100}%`,
                        background: "linear-gradient(90deg, rgba(0,255,136,0.4), #00ff88)",
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

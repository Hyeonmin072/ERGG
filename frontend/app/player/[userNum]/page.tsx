"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import OctagonChart from "@/components/OctagonChart";
import GameHistoryRow from "@/components/GameHistoryRow";
import Image from "next/image";
import { MOCK_PLAYER, getTierColor, getTierImage, formatNumber } from "@/lib/mock";
import { RefreshCw, ChevronRight, Trophy, Sword, Target, Clock } from "lucide-react";

export default function PlayerPage() {
  const { userNum } = useParams<{ userNum: string }>();
  const [refreshing, setRefreshing] = useState(false);

  // Mock: treat any input as the mock player
  const player = { ...MOCK_PLAYER, nickname: decodeURIComponent(userNum) };
  const tierColor = getTierColor(player.tier);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 fade-in">
      {/* Player header */}
      <div
        className="card p-6 mb-6"
        style={{
          background: `linear-gradient(135deg, var(--bg-card) 70%, ${tierColor}11)`,
          borderColor: `${tierColor}40`,
        }}
      >
        <div className="flex items-start gap-5">
          {/* 티어 이미지 */}
          <div className="w-16 h-16 shrink-0 flex items-center justify-center">
            <Image
              src={getTierImage(player.tier)}
              alt={player.tier}
              width={64}
              height={64}
              style={{ objectFit: "contain" }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h1 className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>
                {player.nickname}
              </h1>
              <span
                className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
                style={{
                  background: `${tierColor}22`,
                  color: tierColor,
                  border: `1px solid ${tierColor}44`,
                }}
              >
                <Image
                  src={getTierImage(player.tier)}
                  alt={player.tier}
                  width={16}
                  height={16}
                  style={{ objectFit: "contain" }}
                />
                {player.tier}
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-secondary)" }}
              >
                Lv.{player.accountLevel}
              </span>
            </div>

            <div className="flex items-center gap-1 text-sm mb-3">
              <span style={{ color: tierColor }} className="font-bold text-lg">
                {player.rankPoint.toLocaleString()}
              </span>
              <span style={{ color: "var(--text-secondary)" }}>RP</span>
            </div>

            {/* Quick stats */}
            <div className="flex flex-wrap gap-4 text-xs">
              {[
                { icon: <Trophy size={11} />, label: "승률", val: `${player.winRate}%`, color: "#00ff88" },
                { icon: <Target size={11} />, label: "총 게임", val: `${player.totalGames}판`, color: "var(--neon-cyan)" },
                { icon: <Sword size={11} />, label: "평균 킬", val: player.avgKill.toFixed(1), color: "#ffa726" },
                { icon: <Target size={11} />, label: "평균 딜", val: formatNumber(player.avgDamage), color: "#ffa726" },
                { icon: <Clock size={11} />, label: "평균 순위", val: `${player.avgRank.toFixed(1)}위`, color: "var(--text-secondary)" },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-1">
                  <span style={{ color: stat.color }}>{stat.icon}</span>
                  <span style={{ color: "var(--text-secondary)" }}>{stat.label}</span>
                  <span style={{ color: stat.color }} className="font-bold">{stat.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Refresh + AI Coach */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors"
              style={{
                backgroundColor: "var(--bg-secondary)",
                color: "var(--text-secondary)",
                border: "1px solid var(--border)",
              }}
            >
              <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "동기화 중..." : "갱신"}
            </button>
            <Link
              href={`/ai/coach?userNum=${player.userNum}`}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-bold transition-all"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #00d4ff)",
                color: "#fff",
              }}
            >
              나쟈의 독설 받기
              <ChevronRight size={11} />
            </Link>
          </div>
        </div>
      </div>

      {/* Main content: Octagon + Games */}
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
        {/* Left: Octagon */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
              옥타곤 지표
            </h2>
            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
              최근 {player.octagon.gamesAnalyzed}게임
            </span>
          </div>
          <OctagonChart
            scores={player.octagon}
            grade={player.octagon.centerGrade}
            size={280}
          />
        </div>

        {/* Right: Recent games */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
              최근 전적
            </h2>
            <Link
              href={`/player/${userNum}/games`}
              className="text-xs flex items-center gap-1"
              style={{ color: "var(--neon-cyan)" }}
            >
              더보기
              <ChevronRight size={11} />
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {player.recentGames.map((game) => (
              <GameHistoryRow key={game.gameId} game={game} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

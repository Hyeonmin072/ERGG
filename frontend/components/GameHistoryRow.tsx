"use client";
import type { GameSummary } from "@/lib/types";
import { formatDuration, formatNumber, CHARACTER_NAMES } from "@/lib/mock";
import { Sword, Shield, Skull } from "lucide-react";

interface GameHistoryRowProps {
  game: GameSummary;
}

export default function GameHistoryRow({ game }: GameHistoryRowProps) {
  const isWin = game.victory === 1 || game.gameRank === 1;
  const charName = CHARACTER_NAMES[game.characterNum] ?? `#${game.characterNum}`;
  const kda =
    game.teamKill > 0
      ? `${((game.playerKill + game.playerAssistant) / game.teamKill * 100).toFixed(0)}%`
      : "—";

  return (
    <div
      className={`card-hover rounded-lg px-4 py-3 flex items-center gap-4 text-sm ${
        isWin ? "win-bg" : "loss-bg"
      }`}
    >
      {/* Win/Loss + Rank */}
      <div className="shrink-0 flex flex-col items-center w-10">
        <span
          className="text-xs font-bold"
          style={{ color: isWin ? "#00ff88" : "#ff3b3b" }}
        >
          {isWin ? "WIN" : `${game.gameRank}위`}
        </span>
        <span style={{ color: "var(--text-secondary)", fontSize: "10px" }}>
          {formatDuration(game.duration)}
        </span>
      </div>

      {/* Character */}
      <div className="shrink-0 flex flex-col items-center w-16">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold"
          style={{ backgroundColor: "var(--bg-secondary)", color: "var(--neon-cyan)" }}
        >
          {game.characterNum}
        </div>
        <span className="text-xs mt-0.5 truncate w-16 text-center" style={{ color: "var(--text-secondary)" }}>
          {charName}
        </span>
      </div>

      {/* KDA */}
      <div className="flex flex-col items-center w-20 shrink-0">
        <div className="flex items-center gap-1 font-bold" style={{ color: "var(--text-primary)" }}>
          <Sword size={10} />
          <span>{game.playerKill}</span>
          <span style={{ color: "var(--text-secondary)" }}>/</span>
          <Skull size={10} style={{ color: "#ff3b3b" }} />
          <span style={{ color: "#ff3b3b" }}>?</span>
          <span style={{ color: "var(--text-secondary)" }}>/</span>
          <Shield size={10} style={{ color: "#00d4ff" }} />
          <span style={{ color: "#00d4ff" }}>{game.playerAssistant}</span>
        </div>
        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
          킬관여 {kda}
        </span>
      </div>

      {/* Damage */}
      <div className="flex flex-col items-center w-20 shrink-0">
        <span className="font-bold" style={{ color: "#ffa726" }}>
          {formatNumber(game.damageToPlayer)}
        </span>
        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>딜량</span>
      </div>

      {/* Monster kills */}
      <div className="flex flex-col items-center w-16 shrink-0 hidden sm:flex">
        <span className="font-bold" style={{ color: "var(--neon-green)" }}>
          {game.monsterKill}
        </span>
        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>사냥</span>
      </div>

      {/* Weapon */}
      <div className="flex flex-col items-center w-16 shrink-0 hidden md:flex">
        <span className="font-bold" style={{ color: "var(--neon-cyan)" }}>
          Lv.{game.bestWeaponLevel}
        </span>
        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>최고무기</span>
      </div>

      {/* MMR */}
      <div className="ml-auto flex flex-col items-end shrink-0">
        <span
          className="text-sm font-bold"
          style={{ color: game.mmrGain >= 0 ? "#00ff88" : "#ff3b3b" }}
        >
          {game.mmrGain >= 0 ? "+" : ""}{game.mmrGain}
        </span>
        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>RP</span>
      </div>
    </div>
  );
}

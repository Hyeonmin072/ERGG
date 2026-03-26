"use client";
import type { UserGame } from "@/lib/types";
import {
  formatDuration, formatNumber, CHARACTER_NAMES,
  calcKillParticipation, getTeamModeLabel,
} from "@/lib/mock";
import { Sword, Shield, Skull } from "lucide-react";

interface GameHistoryRowProps {
  game: UserGame;
}

export default function GameHistoryRow({ game }: GameHistoryRowProps) {
  const isWin = game.victory === 1 || game.gameRank === 1;
  const charName = CHARACTER_NAMES[game.characterNum] ?? `#${game.characterNum}`;
  const kp = calcKillParticipation(game);
  const teamModeLabel = getTeamModeLabel(game.matchingTeamMode);

  return (
    <div
      className={`card-hover rounded-lg px-4 py-3 flex items-center gap-4 text-sm ${
        isWin ? "win-bg" : "loss-bg"
      }`}
    >
      {/* 승패 + 순위 + 시간 */}
      <div className="shrink-0 flex flex-col items-center w-12">
        <span
          className="text-xs font-bold"
          style={{ color: isWin ? "#00ff88" : "#ff3b3b" }}
        >
          {isWin ? "WIN" : `${game.gameRank}위`}
        </span>
        <span style={{ color: "var(--text-secondary)", fontSize: "10px" }}>
          {formatDuration(game.duration)}
        </span>
        <span
          className="text-xs px-1 rounded mt-0.5"
          style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-secondary)", fontSize: "9px" }}
        >
          {teamModeLabel}
        </span>
      </div>

      {/* 캐릭터 */}
      <div className="shrink-0 flex flex-col items-center w-16">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold"
          style={{ backgroundColor: "var(--bg-secondary)", color: "var(--neon-cyan)" }}
        >
          {game.characterNum}
        </div>
        <span
          className="text-xs mt-0.5 truncate w-16 text-center"
          style={{ color: "var(--text-secondary)" }}
        >
          {charName}
        </span>
      </div>

      {/* KDA */}
      <div className="flex flex-col items-center w-24 shrink-0">
        <div className="flex items-center gap-1 font-bold" style={{ color: "var(--text-primary)" }}>
          <Sword size={10} />
          <span>{game.playerKill}</span>
          <span style={{ color: "var(--text-secondary)" }}>/</span>
          <Skull size={10} style={{ color: "#ff3b3b" }} />
          <span style={{ color: "#ff3b3b" }}>{game.playerDeaths}</span>
          <span style={{ color: "var(--text-secondary)" }}>/</span>
          <Shield size={10} style={{ color: "#00d4ff" }} />
          <span style={{ color: "#00d4ff" }}>{game.playerAssistant}</span>
        </div>
        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
          킬관여 {kp}
        </span>
      </div>

      {/* 딜량 */}
      <div className="flex flex-col items-center w-20 shrink-0">
        <span className="font-bold" style={{ color: "#ffa726" }}>
          {formatNumber(game.damageToPlayer)}
        </span>
        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>딜량</span>
      </div>

      {/* 사냥 (sm 이상) */}
      <div className="flex flex-col items-center w-14 shrink-0 hidden sm:flex">
        <span className="font-bold" style={{ color: "var(--neon-green)" }}>
          {game.monsterKill}
        </span>
        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>사냥</span>
      </div>

      {/* 최고 무기 레벨 (md 이상) */}
      <div className="flex flex-col items-center w-14 shrink-0 hidden md:flex">
        <span className="font-bold" style={{ color: "var(--neon-cyan)" }}>
          Lv.{game.bestWeaponLevel}
        </span>
        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>무기</span>
      </div>

      {/* 회복량 (lg 이상) */}
      <div className="flex flex-col items-center w-16 shrink-0 hidden lg:flex">
        <span className="font-bold" style={{ color: "#4ade80" }}>
          {formatNumber(game.healAmount)}
        </span>
        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>회복</span>
      </div>

      {/* MMR */}
      <div className="ml-auto flex flex-col items-end shrink-0">
        <span
          className="text-sm font-bold"
          style={{ color: game.mmrGain >= 0 ? "#00ff88" : "#ff3b3b" }}
        >
          {game.mmrGain >= 0 ? "+" : ""}{game.mmrGain}
        </span>
        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
          {game.rankPoint.toLocaleString()} RP
        </span>
      </div>
    </div>
  );
}

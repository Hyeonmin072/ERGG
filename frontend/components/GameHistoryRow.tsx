"use client";
import Image from "next/image";
import type { UserGame } from "@/lib/types";
import {
  formatDuration, formatNumber,
  calcKillParticipation, getMatchingModeLabel, getTeamModeLabel,
} from "@/lib/mock";
import { getCharacterDefaultMiniSrc } from "@/lib/characterDefaultMini";
import {
  resolveCharacterDisplayName,
  type CharacterCatalogMap,
} from "@/lib/characterDisplay";
import { Sword, Shield, Skull } from "lucide-react";

interface GameHistoryRowProps {
  game: UserGame;
  /** Supabase character 테이블 기반 (GET /catalog/characters) */
  catalog?: CharacterCatalogMap | null;
  /** 행 클릭 시 상세 모달 */
  onSelect?: (game: UserGame) => void;
}

/** 1위 금색 알지비 R208 G192 B138 */
const RANK_FIRST_GOLD = "#d0c08a";

/** 전적 행 공통 배경 (은은한 회색) */
const ROW_BG = "rgba(71, 85, 105, 0.22)";

/** 순위별 좌측 강조선 색만. 1금 2은 3동·그 외 회색 */
function rankBorderColor(gameRank: number): string {
  switch (gameRank) {
    case 1:
      return RANK_FIRST_GOLD;
    case 2:
      return "#cbd5e1";
    case 3:
      return "#b45309";
    default:
      return "#64748b";
  }
}

export default function GameHistoryRow({ game, catalog, onSelect }: GameHistoryRowProps) {
  const isWin = game.victory === 1 || game.gameRank === 1;
  const rankBorder = rankBorderColor(game.gameRank ?? 0);
  const charName = resolveCharacterDisplayName(game.characterNum, catalog);
  const miniSrc = getCharacterDefaultMiniSrc(charName);
  const kp = calcKillParticipation(game);
  const teamModeLabel = getTeamModeLabel(game.matchingTeamMode);
  const matchingModeLabel = getMatchingModeLabel(game.matchingMode);
  const equipmentRaw = (game as unknown as Record<string, unknown>).equipment;
  const equipmentImages = game.equipmentImages;
  const equipmentSlots = equipmentImages?.slots ?? {};
  const armorIcons = (equipmentRaw && typeof equipmentRaw === "object" && !Array.isArray(equipmentRaw))
    ? [0, 1, 2, 3, 4]
        .map((slot) => {
          if (slot === 0) {
            const weaponCode = Number((equipmentRaw as Record<string, unknown>)["0"]);
            const dbImagePath = equipmentSlots["0"]?.imagePath ?? null;
            if (!dbImagePath) return null;
            return { slot, code: Number.isFinite(weaponCode) && weaponCode > 0 ? weaponCode : game.bestWeapon, imagePath: dbImagePath };
          }
          const code = Number((equipmentRaw as Record<string, unknown>)[String(slot)]);
          if (!Number.isFinite(code) || code <= 0) return null;
          const dbSlotPath = equipmentSlots[String(slot)]?.imagePath ?? null;
          const imagePath = dbSlotPath ?? null;
          return imagePath ? { slot, code, imagePath } : null;
        })
        .filter((x): x is { slot: number; code: number; imagePath: string } => Boolean(x))
    : [];

  const isFirst = game.gameRank === 1;

  return (
    <div
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={onSelect ? () => onSelect(game) : undefined}
      onKeyDown={
        onSelect
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(game);
              }
            }
          : undefined
      }
      className={`card-hover rounded-lg px-4 py-3 flex items-center gap-4 text-sm ${
        isFirst ? "rank-first-shimmer" : ""
      } ${onSelect ? "cursor-pointer" : ""}`}
      style={{
        backgroundColor: ROW_BG,
        borderLeft: `3px solid ${rankBorder}`,
      }}
    >
      {/* 승패 + 순위 + 시간 */}
      <div className="shrink-0 flex flex-col items-center w-12">
        <span
          className={`text-xs font-bold ${isFirst ? "rank-first-label" : ""}`}
          style={{
            color:
              isFirst
                ? RANK_FIRST_GOLD
                : isWin
                  ? "#00ff88"
                  : "#ff3b3b",
          }}
        >
          {isFirst
            ? "1위"
            : isWin
              ? "WIN"
              : `${game.gameRank}위`}
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
        <span
          className="text-xs px-1 rounded mt-0.5 font-bold"
          style={{
            backgroundColor:
              matchingModeLabel === "랭크"
                ? "rgba(99,102,241,0.25)"
                : matchingModeLabel === "코발트"
                  ? "rgba(6,182,212,0.24)"
                  : "rgba(100,116,139,0.24)",
            color:
              matchingModeLabel === "랭크"
                ? "#c7d2fe"
                : matchingModeLabel === "코발트"
                  ? "#67e8f9"
                  : "#cbd5e1",
            border:
              matchingModeLabel === "랭크"
                ? "1px solid rgba(129,140,248,0.45)"
                : matchingModeLabel === "코발트"
                  ? "1px solid rgba(34,211,238,0.40)"
                  : "1px solid rgba(148,163,184,0.35)",
            fontSize: "9px",
          }}
        >
          {matchingModeLabel}
        </span>
      </div>

      {/* 캐릭터 (character 테이블 nameKo + 기본 미니 이미지) */}
      <div className="shrink-0 flex flex-col items-center w-16">
        <div
          className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center text-xs font-bold shrink-0"
          style={{ backgroundColor: "var(--bg-secondary)", color: "var(--neon-cyan)" }}
        >
          {miniSrc ? (
            <Image
              src={miniSrc}
              alt={charName}
              width={40}
              height={40}
              className="object-cover w-full h-full"
              unoptimized
            />
          ) : (
            game.characterNum
          )}
        </div>
        <span
          className="text-xs mt-0.5 truncate w-16 text-center"
          style={{ color: "var(--text-secondary)" }}
          title={charName}
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
        {armorIcons.length > 0 && (
          <div className="flex items-center gap-1 mb-1">
            {armorIcons.map((it) => (
              <img
                key={`${game.gameId}-${it.slot}-${it.code}`}
                src={encodeURI(it.imagePath)}
                alt={`equipment-${it.code}`}
                className="w-9 h-9 rounded object-cover"
              />
            ))}
          </div>
        )}
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

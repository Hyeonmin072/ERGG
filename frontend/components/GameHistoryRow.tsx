"use client";
import Image from "next/image";
import type { UserGame } from "@/lib/types";
import {
  formatDuration, formatNumber,
  getMatchingModeLabel,
} from "@/lib/mock";
import { getCharacterDefaultMiniSrc } from "@/lib/characterDefaultMini";
import {
  resolveCharacterDisplayName,
  type CharacterCatalogMap,
} from "@/lib/characterDisplay";
import { getEquipmentGradeBackground } from "@/lib/equipmentGradeStyle";
import { getWeaponGroupIconPathFromItemKind } from "@/lib/weaponKindGroupIcon";

interface GameHistoryRowProps {
  game: UserGame;
  /** Supabase character 테이블 기반 (GET /catalog/characters) */
  catalog?: CharacterCatalogMap | null;
  /** 행 클릭 시 상세 모달 */
  onSelect?: (game: UserGame) => void;
}

/** 1위만 살짝 강조 (나머지 순위·통계는 톤 통일) */
const RANK_FIRST_GOLD = "#c4b89a";

/** 카드·배경 톤 (슬레이트 글래스) */
const ROW_BG =
  "linear-gradient(180deg, rgba(30, 41, 59, 0.52) 0%, rgba(15, 23, 42, 0.44) 100%)";

const ROW_SHADOW =
  "0 2px 10px rgba(0, 0, 0, 0.32), 0 1px 3px rgba(0, 0, 0, 0.22)";

/** 순위 좌측 라인 — 채도 낮은 슬레이트 계열 */
function rankBorderColor(gameRank: number): string {
  switch (gameRank) {
    case 1:
      return RANK_FIRST_GOLD;
    case 2:
      return "rgba(148, 163, 184, 0.85)";
    case 3:
      return "rgba(100, 116, 139, 0.9)";
    default:
      return "rgba(71, 85, 105, 0.85)";
  }
}

const STAT_NUM = "var(--text-primary)";

const BADGE_SURFACE = {
  backgroundColor: "rgba(148, 163, 184, 0.1)",
  color: "var(--text-secondary)",
  border: "1px solid rgba(148, 163, 184, 0.2)",
} as const;

const BADGE_TERMINATE = {
  backgroundColor: BADGE_SURFACE.backgroundColor,
  border: BADGE_SURFACE.border,
  color: "var(--text-primary)",
} as const;

/** 정수 통계 — 천 단위 콤마 */
function fmtInt(n: number): string {
  if (!Number.isFinite(n)) return "0";
  return Math.trunc(n).toLocaleString("ko-KR");
}

/** 레벨 뱃지 — 불투명 검정 원, 이미지 모서리 밖으로 살짝 돌출 */
const LEVEL_CIRCLE_CHAR =
  "pointer-events-none absolute z-10 -bottom-1.5 -right-1.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-[11px] font-bold tabular-nums text-white shadow-sm";
const LEVEL_CIRCLE_WEAPON =
  "pointer-events-none absolute z-10 -bottom-2 -right-2 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-black/50 text-[8px] font-bold tabular-nums leading-none text-white/80 shadow-sm";

export default function GameHistoryRow({ game, catalog, onSelect }: GameHistoryRowProps) {
  const isWin = game.victory === 1 || game.gameRank === 1;
  const rankBorder = rankBorderColor(game.gameRank ?? 0);
  const charName = resolveCharacterDisplayName(game.characterNum, catalog);
  const miniSrc = getCharacterDefaultMiniSrc(charName);
  const matchingModeLabel = getMatchingModeLabel(game.matchingMode);
  const terminateDisplay = Math.max(
    game.terminateCount ?? 0,
    game.terminateCountCanNotEliminate ?? 0
  );
  const equipmentRaw = (game as unknown as Record<string, unknown>).equipment;
  const equipmentImages = game.equipmentImages;
  const equipmentSlots = equipmentImages?.slots ?? {};
  const weaponSlotMeta = equipmentSlots["0"];
  const weaponGroupPath = getWeaponGroupIconPathFromItemKind(weaponSlotMeta?.kind);
  const equipmentGrades = game.equipmentGrade ?? {};
  const slotGrade = (slot: number): number | undefined => {
    const raw = equipmentGrades[String(slot)];
    const n = typeof raw === "number" ? raw : Number(raw);
    return Number.isFinite(n) ? n : undefined;
  };
  const armorIcons = (equipmentRaw && typeof equipmentRaw === "object" && !Array.isArray(equipmentRaw))
    ? [0, 1, 2, 3, 4]
        .map((slot) => {
          const grade = slotGrade(slot);
          if (slot === 0) {
            const weaponCode = Number((equipmentRaw as Record<string, unknown>)["0"]);
            const dbImagePath = equipmentSlots["0"]?.imagePath ?? null;
            if (!dbImagePath) return null;
            return { slot, code: Number.isFinite(weaponCode) && weaponCode > 0 ? weaponCode : game.bestWeapon, imagePath: dbImagePath, grade };
          }
          const code = Number((equipmentRaw as Record<string, unknown>)[String(slot)]);
          if (!Number.isFinite(code) || code <= 0) return null;
          const dbSlotPath = equipmentSlots[String(slot)]?.imagePath ?? null;
          const imagePath = dbSlotPath ?? null;
          return imagePath ? { slot, code, imagePath, grade } : null;
        })
        .filter((x): x is { slot: number; code: number; imagePath: string; grade?: number } => Boolean(x))
    : [];

  /** 슬롯: 0 무기(윗줄 가운데) · 1~4 방어구 2×2(옷·모자 / 팔·다리) */
  type ArmorCell = (typeof armorIcons)[number] | null;
  const byEquipmentSlot = new Map(armorIcons.map((it) => [it.slot, it] as const));
  const weaponCell: ArmorCell = byEquipmentSlot.get(0) ?? null;
  const armorQuad: ArmorCell[] = [1, 2, 3, 4].map((s) => byEquipmentSlot.get(s) ?? null);
  const hasArmorSlot = armorQuad.some(Boolean);

  const isFirst = game.gameRank === 1;
  /** ER: matchingMode 3 = 랭크 — RP·MMR 등락은 랭크만 표시 */
  const isRanked = game.matchingMode === 3;

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
      className={`card-hover rounded-lg px-4 py-4 flex items-center gap-4 text-base min-h-[6rem] ${
        isFirst ? "rank-first-shimmer" : ""
      } ${onSelect ? "cursor-pointer" : ""}`}
      style={{
        background: ROW_BG,
        borderLeft: `3px solid ${rankBorder}`,
        boxShadow: ROW_SHADOW,
      }}
    >
      {/* 승패 + 순위 + 시간 */}
      <div className="shrink-0 flex flex-col items-center w-14">
        <span
          className={`text-sm font-bold ${isFirst ? "rank-first-label" : ""}`}
          style={{
            color: isFirst
              ? RANK_FIRST_GOLD
              : isWin
                ? "rgba(167, 243, 208, 0.92)"
                : "var(--text-primary)",
          }}
        >
          {isFirst
            ? "1위"
            : isWin
              ? "WIN"
              : `${game.gameRank}위`}
        </span>
        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
          {formatDuration(game.duration)}
        </span>
        <span className="mt-0.5 rounded px-1.5 py-0.5 text-[11px] font-semibold" style={BADGE_SURFACE}>
          {matchingModeLabel}
        </span>
      </div>

      {/* 캐릭터 + 무기 — 세로 기준 서로 중앙 정렬 */}
      <div className="flex shrink-0 items-center gap-2">
        <div className="flex w-[60px] shrink-0 flex-col items-center">
          <div className="relative h-[60px] w-[60px] shrink-0">
            <div
              className="flex h-full w-full items-center justify-center overflow-hidden rounded-xl text-sm font-bold"
              style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-secondary)" }}
            >
              {miniSrc ? (
                <Image
                  src={miniSrc}
                  alt={charName}
                  width={60}
                  height={60}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              ) : (
                game.characterNum
              )}
            </div>
            <span className={LEVEL_CIRCLE_CHAR} title={`레벨 ${game.characterLevel}`}>
              {game.characterLevel}
            </span>
          </div>
          <span
            className="mt-0.5 w-[60px] truncate text-center text-sm leading-tight"
            style={{ color: "var(--text-secondary)" }}
            title={charName}
          >
            {charName}
          </span>
        </div>
        {weaponGroupPath && (
          <div className="relative h-[30px] w-[30px] shrink-0">
            <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-lg bg-black/20 p-0.5">
              <img
                src={encodeURI(weaponGroupPath)}
                alt={weaponSlotMeta?.nameKr ?? "무기 종류"}
                className="h-full w-full object-contain"
              />
            </div>
            <span
              className={LEVEL_CIRCLE_WEAPON}
              title={`무기 레벨 ${game.bestWeaponLevel}`}
              style={{
                WebkitTextStroke: "0.35px rgba(255, 255, 255, 0.85)",
                paintOrder: "stroke fill",
              }}
            >
              {game.bestWeaponLevel}
            </span>
          </div>
        )}
      </div>

      {/* TK / K / A / D + 터미네이트 뱃지 */}
      <div className="flex w-auto min-w-0 shrink-0 flex-col items-stretch gap-0.5">
        <div className="flex flex-col items-start gap-px text-xs leading-tight">
          <div className="flex items-baseline gap-1 tabular-nums">
            <span className="w-4 shrink-0 font-normal" style={{ color: "var(--text-secondary)" }}>
              TK
            </span>
            <span className="min-w-[1.5ch] text-right text-sm font-bold" style={{ color: STAT_NUM }}>
              {fmtInt(game.teamKill)}
            </span>
          </div>
          <div className="flex items-baseline gap-1 tabular-nums">
            <span className="w-4 shrink-0 font-normal" style={{ color: "var(--text-secondary)" }}>
              K
            </span>
            <span className="min-w-[1.5ch] text-right text-sm font-bold" style={{ color: STAT_NUM }}>
              {fmtInt(game.playerKill)}
            </span>
          </div>
          <div className="flex items-baseline gap-1 tabular-nums">
            <span className="w-4 shrink-0 font-normal" style={{ color: "var(--text-secondary)" }}>
              A
            </span>
            <span className="min-w-[1.5ch] text-right text-sm font-bold" style={{ color: STAT_NUM }}>
              {fmtInt(game.playerAssistant)}
            </span>
          </div>
          <div className="flex items-baseline gap-1 tabular-nums">
            <span className="w-4 shrink-0 font-normal" style={{ color: "var(--text-secondary)" }}>
              D
            </span>
            <span className="min-w-[1.5ch] text-right text-sm font-bold" style={{ color: STAT_NUM }}>
              {fmtInt(game.playerDeaths)}
            </span>
          </div>
        </div>
        {terminateDisplay > 0 && (
          <div
            className="mt-1 flex w-full flex-wrap justify-center gap-1"
            title="터미네이트 팀 수"
            aria-label={`터미네이트 ${terminateDisplay}회`}
          >
            <span
              className="inline-flex min-h-[1.25rem] items-center justify-center rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums leading-none"
              style={BADGE_TERMINATE}
            >
              T {terminateDisplay}
            </span>
          </div>
        )}
      </div>

      {/* 딜량 */}
      <div className="flex w-[5.5rem] shrink-0 flex-col items-center">
        <span className="font-bold tabular-nums" style={{ color: STAT_NUM }}>
          {formatNumber(game.damageToPlayer)}
        </span>
        <span className="text-sm" style={{ color: "var(--text-secondary)" }}>딜량</span>
      </div>

      {/* 회복 + 랭크 시 RP·MMR (lg 이상, 나란히) */}
      <div className="hidden shrink-0 items-center gap-3 lg:flex">
        <div className="flex w-[4.5rem] shrink-0 flex-col items-center">
          <span className="font-bold tabular-nums" style={{ color: STAT_NUM }}>
            {formatNumber(game.healAmount)}
          </span>
          <span className="text-sm" style={{ color: "var(--text-secondary)" }}>회복</span>
        </div>
        {isRanked && (
          <div className="flex shrink-0 flex-col items-center justify-center gap-0.5 border-l border-white/15 pl-3">
            <span
              className="text-base font-bold tabular-nums"
              style={{
                color:
                  game.mmrGain >= 0 ? "rgba(167, 243, 208, 0.95)" : "rgba(248, 180, 180, 0.9)",
              }}
            >
              {game.mmrGain >= 0 ? "+" : ""}
              {game.mmrGain}
            </span>
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {game.rankPoint.toLocaleString()} RP
            </span>
          </div>
        )}
      </div>

      {/* 장비 아이콘 (우측) */}
      <div className="ml-auto flex flex-col items-end justify-center shrink-0">
        {armorIcons.length > 0 && (
          <div className="mb-1 flex w-[6rem] flex-col gap-y-1.5">
            {weaponCell && (
              <div className="flex w-full justify-center">
                <div
                  className="h-7 w-11 shrink-0 overflow-hidden rounded border border-white/28 p-[2px] shadow-[0_2px_8px_rgba(0,0,0,0.55),0_1px_2px_rgba(0,0,0,0.35)]"
                  style={{ background: getEquipmentGradeBackground(weaponCell.grade) }}
                >
                  <img
                    src={encodeURI(weaponCell.imagePath)}
                    alt={`equipment-${weaponCell.code}`}
                    className="h-full w-full rounded-[3px] object-cover object-center"
                  />
                </div>
              </div>
            )}
            {hasArmorSlot && (
              <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 place-items-center">
                {armorQuad.map((it, idx) =>
                  it ? (
                    <div
                      key={`${game.gameId}-${it.slot}-${it.code}`}
                      className="h-7 w-11 shrink-0 overflow-hidden rounded border border-white/28 p-[2px] shadow-[0_2px_8px_rgba(0,0,0,0.55),0_1px_2px_rgba(0,0,0,0.35)]"
                      style={{ background: getEquipmentGradeBackground(it.grade) }}
                    >
                      <img
                        src={encodeURI(it.imagePath)}
                        alt={`equipment-${it.code}`}
                        className="h-full w-full rounded-[3px] object-cover object-center"
                      />
                    </div>
                  ) : (
                    <div
                      key={`${game.gameId}-armor-empty-${idx}`}
                      className="h-7 w-11 shrink-0"
                      aria-hidden
                    />
                  ),
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

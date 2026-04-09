"use client";
import Image from "next/image";
import type { UserGame } from "@/lib/types";
import {
  formatDuration,
  formatGameEndedRelativeKo,
  formatNumber,
  getMatchingModeLabel,
} from "@/lib/mock";
import { getCharacterDefaultMiniSrc } from "@/lib/characterDefaultMini";
import {
  resolveCharacterDisplayName,
  type CharacterCatalogMap,
} from "@/lib/characterDisplay";
import { getEquipmentGradeBackground } from "@/lib/equipmentGradeStyle";
import { getWeaponGroupIconPathFromItemKind } from "@/lib/weaponKindGroupIcon";
import { getTacticalSkillImagePath, getTacticalSkillNameKr } from "@/lib/tacticalSkillImage";
import { getTraitImagePath, getTraitNameKr } from "@/lib/traitImage";

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

/** 핵심 특성 — 살짝 큼 */
const TRAIT_ICON_CORE =
  "relative flex h-[28px] w-[28px] shrink-0 items-center justify-center overflow-hidden rounded-md border border-white/24 bg-black/38 p-[2px] shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]";
/** 서브 특성 — 더 작게 */
const TRAIT_ICON_SUB =
  "relative flex h-[20px] w-[20px] shrink-0 items-center justify-center overflow-hidden rounded border border-white/18 bg-black/32 p-px shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]";

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

type HonorBadge = {
  label: string;
  conditionKo: string;
};

/** 게임 결과 칭호 줄 — 조건 충족한 칭호를 모두 표시 */
function gameHonorLabels(game: UserGame): HonorBadge[] {
  const labels: HonorBadge[] = [];
  const raw = game as unknown as Record<string, unknown>;

  if ((game.remoteDroneUseVFCreditMySelf ?? 0) >= 200) {
    labels.push({
      label: "배달의 민족",
      conditionKo: "조건: 개인 원격 드론 사용 크레딧 200 이상",
    });
  }

  if ((game.useEmoticonCount ?? 0) >= 15) {
    labels.push({
      label: "소통해요",
      conditionKo: "조건: 이모트 사용 횟수 15회 이상",
    });
  }

  const monitoringCount =
    (game.useReconDrone ?? 0) + (game.useEmpDrone ?? 0) + (game.addTelephotoCamera ?? 0);
  if (monitoringCount >= 20) {
    labels.push({
      label: "모니터링",
      conditionKo: "조건: 정찰 드론 + EMP 드론 + 망원 카메라 합계 20 이상",
    });
  }

  const mmrGainInGameRaw = Number(raw.mmrGainInGame ?? Number.NaN);
  if (game.matchingMode === 3 && Number.isFinite(mmrGainInGameRaw) && mmrGainInGameRaw >= 150) {
    labels.push({
      label: "물로켓",
      conditionKo: "조건: 랭크 게임에서 판당 MMR 획득 150 이상",
    });
  }

  // 퍼펙트 플레이어: 한 판 무데스 + 1위
  if (game.playerDeaths === 0 && game.gameRank === 1) {
    labels.push({
      label: "퍼펙트 플레이어",
      conditionKo: "조건: 한 판에서 0데스 + 최종 1위",
    });
  }

  return labels;
}

const HONOR_BADGE = {
  backgroundColor: "rgba(99, 102, 241, 0.12)",
  color: "rgba(199, 210, 254, 0.95)",
  border: "1px solid rgba(129, 140, 248, 0.28)",
} as const;

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

  const traitCore = game.traitFirstCore ?? 0;
  const traitFirstSub = Array.isArray(game.traitFirstSub) ? game.traitFirstSub : [];
  const traitSecondSub = Array.isArray(game.traitSecondSub) ? game.traitSecondSub : [];
  const hasTraitRow =
    (Number.isFinite(traitCore) && traitCore > 0) ||
    traitFirstSub.length > 0 ||
    traitSecondSub.length > 0;

  const tacticalImgPath = getTacticalSkillImagePath(game.tacticalSkillGroup);
  const tacticalNameKr = getTacticalSkillNameKr(game.tacticalSkillGroup);
  const endOffsetSec =
    game.duration > 0 ? game.duration : game.playTime > 0 ? game.playTime : 0;
  const gameEndedRelativeKo = formatGameEndedRelativeKo(game.startDtm, endOffsetSec);
  const honorLabels = gameHonorLabels(game);
  const traitCoreCode = Number(traitCore);

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
      className={`card-hover rounded-lg px-4 py-3 flex min-h-[5.5rem] flex-col gap-2 text-base ${
        isFirst ? "rank-first-shimmer" : ""
      } ${onSelect ? "cursor-pointer" : ""}`}
      style={{
        background: ROW_BG,
        borderLeft: `3px solid ${rankBorder}`,
        boxShadow: ROW_SHADOW,
      }}
    >
      <div className="flex w-full min-w-0 flex-1 items-center gap-3">
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
        {gameEndedRelativeKo ? (
          <span
            className="mt-1 max-w-[4.5rem] text-center text-[10px] leading-tight"
            style={{ color: "var(--text-secondary)" }}
            title={`종료 시각 기준 · ${game.startDtm}${endOffsetSec ? ` + ${endOffsetSec}s` : ""}`}
          >
            {gameEndedRelativeKo}
          </span>
        ) : null}
      </div>

      {/* 캐릭터 + 무기·전술 + 특성(옆줄, 카드 높이 증가 없음) */}
      <div className="flex min-w-0 shrink-0 items-start gap-2">
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
            className="mt-0.5 w-[60px] truncate text-center text-[13px] leading-tight"
            style={{ color: "var(--text-secondary)" }}
            title={charName}
          >
            {charName}
          </span>
        </div>
        <div className="flex min-w-0 items-center gap-1.5">
          <div className="flex shrink-0 flex-col items-center gap-1">
            {weaponGroupPath && (
              <div className="relative h-[30px] w-[30px] shrink-0">
                <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-lg border border-white/25 bg-black/35 p-0.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                  <img
                    src={encodeURI(weaponGroupPath)}
                    alt={weaponSlotMeta?.nameKr ?? "무기 종류"}
                    className="h-full w-full rounded-[3px] object-contain"
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
            {/* 전술 스킬 — 무기 종류 바로 아래 30×30 (이미지: public/images/tacticalSkill/{한글명}.webp) */}
            <div className="relative h-[30px] w-[30px] shrink-0">
              <div
                className="flex h-full w-full items-center justify-center overflow-hidden rounded-lg border border-white/25 bg-black/35 p-0.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                title={
                  tacticalNameKr
                    ? `${tacticalNameKr} · Lv.${game.tacticalSkillLevel} (#${game.tacticalSkillGroup})`
                    : `전술 스킬 그룹 ${game.tacticalSkillGroup}`
                }
              >
                {tacticalImgPath ? (
                  <img
                    src={encodeURI(tacticalImgPath)}
                    alt={tacticalNameKr ?? "전술 스킬"}
                    className="h-full w-full rounded-[3px] object-cover"
                  />
                ) : (
                  <span className="text-[10px] font-bold tabular-nums leading-none text-white/90">
                    {game.tacticalSkillGroup}
                  </span>
                )}
              </div>
              <span
                className={LEVEL_CIRCLE_WEAPON}
                title={`전술 스킬 레벨 ${game.tacticalSkillLevel}`}
                style={{
                  WebkitTextStroke: "0.35px rgba(255, 255, 255, 0.85)",
                  paintOrder: "stroke fill",
                }}
              >
                {game.tacticalSkillLevel}
              </span>
            </div>
          </div>
          {hasTraitRow && (
            <div
              className="flex w-11 shrink-0 translate-x-[2px] flex-col items-center justify-center gap-0.5 leading-none"
              aria-label="특성"
              title="특성"
            >
              {/* 핵심(큼) / 서브1×2 / 서브2×2 — 동일 기준선(w-11) 안에서 가운데 정렬 */}
              {traitCore > 0 && (
                <div className="flex w-full items-center justify-center">
                  <div
                    className={TRAIT_ICON_CORE}
                    title={getTraitNameKr(traitCoreCode) ?? String(traitCoreCode)}
                    aria-label={`핵심 특성 ${getTraitNameKr(traitCoreCode) ?? traitCoreCode}`}
                  >
                    {getTraitImagePath(traitCoreCode) ? (
                      <img
                        src={encodeURI(getTraitImagePath(traitCoreCode) as string)}
                        alt={getTraitNameKr(traitCoreCode) ?? "핵심 특성"}
                        className="h-full w-full rounded-[4px] object-cover"
                      />
                    ) : (
                      <span className="text-[10px] font-bold tabular-nums leading-none text-white/90">
                        {traitCoreCode}
                      </span>
                    )}
                  </div>
                </div>
              )}
              {traitFirstSub.length > 0 && (
                <div className="flex w-full items-center justify-center gap-0.5">
                  {traitFirstSub.map((id) => {
                    const code = Number(id);
                    const name = getTraitNameKr(code);
                    const imgPath = getTraitImagePath(code);
                    return (
                      <div
                        key={`s1-${id}`}
                        className={TRAIT_ICON_SUB}
                        title={name ?? String(id)}
                        aria-label={`서브 특성 1 · ${name ?? id}`}
                      >
                        {imgPath ? (
                          <img
                            src={encodeURI(imgPath)}
                            alt={name ?? "서브 특성"}
                            className="h-full w-full rounded-[3px] object-cover"
                          />
                        ) : (
                          <span className="text-[8px] font-bold tabular-nums leading-none text-white/90">
                            {id}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              {traitSecondSub.length > 0 && (
                <div className="flex w-full items-center justify-center gap-0.5">
                  {traitSecondSub.map((id) => {
                    const code = Number(id);
                    const name = getTraitNameKr(code);
                    const imgPath = getTraitImagePath(code);
                    return (
                      <div
                        key={`s2-${id}`}
                        className={TRAIT_ICON_SUB}
                        title={name ?? String(id)}
                        aria-label={`서브 특성 2 · ${name ?? id}`}
                      >
                        {imgPath ? (
                          <img
                            src={encodeURI(imgPath)}
                            alt={name ?? "서브 특성"}
                            className="h-full w-full rounded-[3px] object-cover"
                          />
                        ) : (
                          <span className="text-[8px] font-bold tabular-nums leading-none text-white/90">
                            {id}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
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

      {/* 딜량 · 루트 · RP(MMR 등락) — 동일 너비·정렬(숫자 위 / 라벨 아래) */}
      <div className="flex shrink-0 items-stretch gap-1 sm:gap-2">
        <div className="flex w-[5.5rem] shrink-0 flex-col items-center">
          <span className="font-bold tabular-nums" style={{ color: STAT_NUM }}>
            {formatNumber(game.damageToPlayer)}
          </span>
          <span className="text-sm" style={{ color: "var(--text-secondary)" }}>딜량</span>
        </div>
        <div className="flex w-[5.5rem] shrink-0 flex-col items-center">
          <span
            className="font-bold tabular-nums"
            style={{ color: STAT_NUM }}
            title={`routeIdOfStart ${game.routeIdOfStart}`}
          >
            {Number.isFinite(game.routeIdOfStart) ? Math.trunc(game.routeIdOfStart) : "—"}
          </span>
          <span className="text-sm" style={{ color: "var(--text-secondary)" }}>루트</span>
        </div>
        <div className="flex w-[5.5rem] shrink-0 flex-col items-center">
          {isRanked ? (
            <>
              <span
                className="font-bold tabular-nums"
                style={{
                  color:
                    game.mmrGain >= 0 ? "rgba(167, 243, 208, 0.95)" : "rgba(248, 180, 180, 0.9)",
                }}
              >
                {game.mmrGain >= 0 ? "+" : ""}
                {game.mmrGain}
              </span>
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>RP</span>
            </>
          ) : (
            <>
              <span className="font-bold tabular-nums" style={{ color: STAT_NUM }}>
                —
              </span>
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>RP</span>
            </>
          )}
        </div>
      </div>

      {/* 장비 — 우측 */}
      <div className="ml-auto flex min-w-0 shrink-0 flex-col items-end justify-center pl-3 lg:pl-5">
        <div className="flex flex-col items-end justify-center shrink-0 pl-1">
          {armorIcons.length > 0 && (
            <div className="flex w-[6rem] flex-col gap-y-1.5">
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
      </div>

      {honorLabels.length > 0 && (
        <div
          className="flex w-full min-w-0 flex-wrap items-center gap-1.5 border-t border-white/10 pt-2"
          aria-label="게임 칭호"
        >
          {honorLabels.map((honor, i) => (
            <span
              key={`${game.gameId}-honor-${i}`}
              className="inline-flex max-w-full items-center truncate rounded-md px-2 py-0.5 text-[11px] font-medium leading-tight"
              style={HONOR_BADGE}
              title={honor.conditionKo}
            >
              {honor.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

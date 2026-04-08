import type { UserGame } from "./types";
import {
  resolveCharacterDisplayName,
  type CharacterCatalogMap,
} from "./characterDisplay";

function equipmentSlotLabel(slot: string): string {
  const n = Number(slot);
  if (!Number.isFinite(n)) return `슬롯 ${slot}`;
  const map: Record<number, string> = {
    0: "무기",
    1: "옷",
    2: "머리",
    3: "팔",
    4: "다리",
  };
  return map[n] ?? `슬롯 ${slot}`;
}

/** 섹션 표시 순서 */
export const GAME_DETAIL_SECTION_ORDER: string[] = [
  "플레이어·매칭",
  "캐릭터",
  "게임 결과",
  "킬·전투",
  "페이즈별 킬/데스",
  "무기",
  "시간",
  "MMR·랭크",
  "최종 스탯",
  "딜 — 플레이어에게",
  "딜 — 플레이어에게서 받음",
  "딜 — 몬스터",
  "회복·보호막·CC",
  "제작",
  "경험치·코인",
  "맵·오브젝트",
  "전술 스킬",
  "치료·실드 팩",
  "루트",
  "VF 크레딧",
  "특성",
  "JSON / 상세 맵",
  "배열 데이터",
  "배틀존",
  "킬·사망 정보",
  "기타",
];

/** 값 표시용 포맷 (API에 있는 필드 전부 대응) */
export function formatGameFieldValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "예" : "아니오";
  if (typeof value === "number") {
    if (Number.isInteger(value) && Math.abs(value) > 1e6) return value.toLocaleString("ko-KR");
    if (Number.isFinite(value) && !Number.isInteger(value)) return String(value);
    return value.toLocaleString("ko-KR");
  }
  if (typeof value === "string") return value === "" ? "—" : value;
  if (Array.isArray(value)) {
    if (value.length === 0) return "—";
    return value.map((v) => formatGameFieldValue(v)).join(", ");
  }
  if (typeof value === "object") {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

function humanizeKey(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ");
}

/** 필드명 → 섹션 제목 */
export function sectionTitleForKey(key: string): string {
  if (
    /^(nickname|userNum|gameId|seasonId|matchingMode|matchingTeamMode|accountLevel|serverName|language|versionMajor|versionMinor)$/.test(
      key
    )
  ) {
    return "플레이어·매칭";
  }
  if (/^(characterNum|skinCode|characterLevel)$/.test(key)) return "캐릭터";
  if (
    /^(gameRank|victory|giveUp|teamSpectator|teamNumber|preMade|escapeState)$/.test(key)
  ) {
    return "게임 결과";
  }
  if (
    /^(playerKill|playerAssistant|monsterKill|playerDeaths|teamKill|totalFieldKill|teamElimination|teamDown|totalDoubleKill|totalTripleKill|totalQuadraKill|totalExtraKill|killGamma)$/.test(
      key
    )
  ) {
    return "킬·전투";
  }
  if (/^(killsPhase|deathsPhase)/.test(key)) return "페이즈별 킬/데스";
  if (/^(bestWeapon|bestWeaponLevel)$/.test(key)) return "무기";
  if (/^(startDtm|duration|playTime|watchTime|totalTime|survivableTime|expireDtm)$/.test(key)) {
    return "시간";
  }
  if (/^(mmrBefore|mmrGain|mmrAfter|rankPoint|mmrAvg|matchSize|gainedNormalMmrKFactor)$/.test(key)) {
    return "MMR·랭크";
  }
  if (
    /^(maxHp|maxSp|attackPower|defense|hpRegen|spRegen|attackSpeed|moveSpeed|outOfCombatMoveSpeed|sightRange|attackRange|criticalStrikeChance|criticalStrikeDamage|coolDownReduction|lifeSteal|normalLifeSteal|skillLifeSteal|amplifierToMonster|trapDamage|adaptiveForce|adaptiveForceAttack|adaptiveForceAmplify|skillAmp)$/.test(
      key
    )
  ) {
    return "최종 스탯";
  }
  if (key.startsWith("damageToPlayer")) return "딜 — 플레이어에게";
  if (key.startsWith("damageFromPlayer")) return "딜 — 플레이어에게서 받음";
  if (key.startsWith("damageToMonster") || key.startsWith("damageFromMonster") || key.startsWith("damageOffset")) {
    return "딜 — 몬스터";
  }
  if (/^(healAmount|teamRecover|protectAbsorb|ccTimeToPlayer)$/.test(key)) {
    return "회복·보호막·CC";
  }
  if (/^craft/.test(key)) return "제작";
  if (/^(gainExp|baseExp|bonusExp|bonusCoin)$/.test(key)) return "경험치·코인";
  if (
    /^(addSurveillanceCamera|addTelephotoCamera|removeSurveillanceCamera|removeTelephotoCamera|useHyperLoop|useSecurityConsole|usedPairLoop|totalTurbineTakeOver|fishingCount|useEmoticonCount)$/.test(
      key
    )
  ) {
    return "맵·오브젝트";
  }
  if (/^(tacticalSkillGroup|tacticalSkillLevel)$/.test(key)) return "전술 스킬";
  if (/^used.*Pack$/.test(key)) return "치료·실드 팩";
  if (/^(routeIdOfStart|routeSlotId|placeOfStart)$/.test(key)) return "루트";
  if (
    key.includes("VFCredit") ||
    key === "activelyGainedCredits" ||
    key === "sumUsedVFCredits" ||
    key === "totalGainVFCredit" ||
    key === "totalUseVFCredit"
  ) {
    return "VF 크레딧";
  }
  if (/^(traitFirstCore|traitFirstSub|traitSecondSub)$/.test(key)) return "특성";
  if (
    /^(masteryLevel|equipment|equipmentGrade|skillLevelInfo|skillOrderInfo|killMonsters|eventMissionResult|boughtInfusion|equipFirstItemForLog)$/.test(
      key
    )
  ) {
    return "JSON / 상세 맵";
  }
  if (
    /^(airSupplyOpenCount|foodCraftCount|beverageCraftCount|totalVFCredits|usedVFCredits|scoredPoint)$/.test(key)
  ) {
    return "배열 데이터";
  }
  if (/^battleZone/.test(key)) return "배틀존";
  if (
    /^killer/.test(key) ||
    /^(killDetails|deathDetails|causeOfDeath|placeOfDeath|killDetail)$/.test(key)
  ) {
    return "킬·사망 정보";
  }
  if (/^(botAdded|botRemain|restrictedAreaAccelerated|safeAreas|collectItemForLog|itemTransferred)/.test(key)) {
    return "기타";
  }
  return "기타";
}

export interface GameDetailSectionRow {
  key: string;
  label: string;
  value: string;
  equipmentItems?: {
    slot: string;
    slotLabel: string;
    itemCode: number;
    name: string;
    itemGrade: string;
    armorType: string;
    imagePath: string | null;
  }[];
}

export function buildGameDetailSections(
  game: UserGame,
  catalog?: CharacterCatalogMap | null
): { title: string; rows: GameDetailSectionRow[] }[] {
  const raw = game as unknown as Record<string, unknown>;
  const keys = Object.keys(raw).sort((a, b) => a.localeCompare(b, "en"));
  const bySection = new Map<string, GameDetailSectionRow[]>();

  for (const key of keys) {
    const v = raw[key];
    if (v === undefined) continue;
    const title = sectionTitleForKey(key);
    const rows = bySection.get(title) ?? [];
    let value = formatGameFieldValue(v);
    let equipmentItems: GameDetailSectionRow["equipmentItems"] | undefined;
    if (key === "characterNum" && (typeof v === "number" || typeof v === "string")) {
      const n = Number(v);
      if (Number.isFinite(n)) {
        const resolved = resolveCharacterDisplayName(n, catalog ?? null);
        if (resolved !== `#${n}`) {
          value = `${n} — ${resolved}`;
        }
      }
    }
    if (key === "equipment" && v && typeof v === "object" && !Array.isArray(v)) {
      const parts: string[] = [];
      const eqObj = v as Record<string, unknown>;
      const weaponCode = Number(eqObj["0"]);
      const equipmentImages = game.equipmentImages;
      const equipmentSlots = equipmentImages?.slots ?? {};
      const weaponImagePath = equipmentSlots["0"]?.imagePath ?? null;
      const weaponName = equipmentSlots["0"]?.nameKr || "무기";
      const weaponItem =
        Number.isFinite(weaponCode) && weaponCode > 0
          ? {
              slot: "0",
              slotLabel: "무기",
              itemCode: weaponCode,
              name: weaponName,
              itemGrade: "-",
              armorType: "Weapon",
              imagePath: weaponImagePath,
            }
          : null;
      if (weaponItem) {
        parts.push(`무기(slot0): ${weaponCode} (${weaponItem.name})`);
      }
      equipmentItems = Object.entries(eqObj)
        .map(([slot, codeValue]) => {
          if (slot === "0") return null;
          const itemCode = Number(codeValue);
          if (!Number.isFinite(itemCode) || itemCode <= 0) return null;
          const slotLabel = equipmentSlotLabel(slot);
          const dbSlot =
            equipmentSlots[slot];
          const name = dbSlot?.nameKr || "알 수 없는 아이템";
          parts.push(`${slotLabel}: ${itemCode}${dbSlot?.nameKr ? ` (${name})` : ""}`);
          return {
            slot,
            slotLabel,
            itemCode,
            name,
            itemGrade: "-",
            armorType: "-",
            imagePath: dbSlot?.imagePath ?? null,
          };
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item));
      if (weaponItem) {
        equipmentItems = [weaponItem, ...(equipmentItems ?? [])];
      }
      if (parts.length) {
        value = parts.join("\n");
      }
    }
    rows.push({
      key,
      label: humanizeKey(key),
      value,
      equipmentItems,
    });
    bySection.set(title, rows);
  }

  const ordered: { title: string; rows: GameDetailSectionRow[] }[] = [];
  for (const title of GAME_DETAIL_SECTION_ORDER) {
    const rows = bySection.get(title);
    if (rows?.length) ordered.push({ title, rows });
  }
  for (const [title, rows] of bySection) {
    if (!GAME_DETAIL_SECTION_ORDER.includes(title) && rows.length) {
      ordered.push({ title, rows });
    }
  }
  return ordered;
}

/**
 * 백엔드 octagon_service.calculate 와 동일한 5축 산출.
 * 랭크 전적 최대 20판: 판별 지표 → 산술평균.
 *
 * - 교전(engagement): 전투 출력(DPM·킬·스킬딜비) + 결투 기여(킬관여·어시·전술·CC) 50:50 통합
 * - 내구(sustain): 분당 회복, 보호막 흡수, 팀 회복
 * (마스터리 축 없음)
 */
import type { OctagonScore, UserGame } from "./types";

function clamp(v: number): number {
  return Math.max(0, Math.min(100, v));
}

function gradeFromAvg(avg: number): string {
  if (avg >= 85) return "S+";
  if (avg >= 75) return "S";
  if (avg >= 65) return "A+";
  if (avg >= 55) return "A";
  if (avg >= 45) return "B+";
  if (avg >= 35) return "B";
  if (avg >= 25) return "C+";
  return "C";
}

function pickNum(g: UserGame, ...keys: string[]): number {
  const raw = g as unknown as Record<string, unknown>;
  for (const k of keys) {
    const v = raw[k];
    if (v !== undefined && v !== null) {
      const n = typeof v === "number" ? v : Number(v);
      if (!Number.isNaN(n)) return n;
    }
  }
  return 0;
}

function tacticalUseCount(g: UserGame): number {
  const raw = g as unknown as Record<string, unknown>;
  if (raw.tacticalSkillUseCount != null) return Number(raw.tacticalSkillUseCount) || 0;
  if (raw.tactical_skill_use_count != null) return Number(raw.tactical_skill_use_count) || 0;
  return g.tacticalSkillLevel ?? 0;
}

const DPM_CAP = 1400;
const KILL_CAP = 6;
const ASSIST_CAP = 8;
const CC_CAP = 5;

export interface ComputeOctagonOpts {
  userId: string;
  matchingMode?: number;
}

export function computeOctagonFromUserGames(
  games: UserGame[],
  opts: ComputeOctagonOpts
): OctagonScore | null {
  const mode = opts.matchingMode ?? 3;
  const slice = games.filter((g) => g.matchingMode === mode).slice(0, 20);
  const n = slice.length;
  if (n === 0) return null;

  const avgKeys = (...keys: string[]) =>
    slice.reduce((s, g) => s + pickNum(g, ...keys), 0) / n;

  // --- [수정] 화력 출력 (Output) 계산: 스킬 비중 제거 및 비율 조정 ---
  const dpms: number[] = [];
  for (const g of slice) {
    const dtp = pickNum(g, "damageToPlayer", "damage_to_player");
    const ptMin = Math.max(pickNum(g, "playTime", "play_time") / 60, 1 / 60);
    dpms.push(dtp / ptMin);
  }
  const avgDpm = dpms.reduce((a, b) => a + b, 0) / n;
  const avgKill = avgKeys("playerKill", "player_kill");

  const sDpm = Math.min(avgDpm / DPM_CAP, 1) * 100;
  const sKill = Math.min(avgKill / KILL_CAP, 1) * 100;

  // DPM 60% : 킬 40% 비율로 화력 점수 산출 (스킬 비중 제거)
  const rawOutput = sDpm * 0.6 + sKill * 0.4;

  // --- [수정] 결투 기여 (Engagement Dim) 계산: 전술 스킬 제거 및 비율 조정 ---
  const participations = slice.map((g) => {
    const tk = Math.max(pickNum(g, "teamKill", "team_kill"), 1);
    return Math.min(
      (pickNum(g, "playerKill", "player_kill") + pickNum(g, "playerAssistant", "player_assistant")) / tk,
      1
    );
  });
  const avgParticipation = participations.reduce((a, b) => a + b, 0) / n;
  const avgAssist = avgKeys("playerAssistant", "player_assistant");
  const sAssist = Math.min(avgAssist / ASSIST_CAP, 1) * 100;
  const avgCc = avgKeys("ccTimeToPlayer", "cc_time_to_player");
  const sCc = Math.min(avgCc / CC_CAP, 1) * 100;

  // 관여율 60% : 어시스트 30% : CC기여 10% 비율로 기여 점수 산출 (전술 스킬 제거)
  const rawEngagementDim = (avgParticipation * 100 * 0.6) + (sAssist * 0.3) + (sCc * 0.1);

  // 최종 교전 점수 (화력 50% : 기여 50%)
  const rawEngagement = 0.5 * rawOutput + 0.5 * rawEngagementDim;

  const MK_CAP = 88;
  const VF_CAP = 460;
  const avgMk = avgKeys("monsterKill", "monster_kill");
  const avgVfGain = avgKeys("totalGainVFCredit", "total_gain_vf_credit");
  const sMk = Math.min(avgMk / MK_CAP, 1) * 100;
  const sVf = Math.min(avgVfGain / VF_CAP, 1) * 100;
  const rawHunting = sMk * 0.5 + sVf * 0.5;

  const camAvg =
    avgKeys("addSurveillanceCamera", "add_surveillance_camera") +
    avgKeys("addTelephotoCamera", "add_telephoto_camera");
  const avgView = avgKeys("viewContribution", "view_contribution");
  const rawVision = camAvg * 5.5 + avgView * 0.48;

  const avgRank = avgKeys("gameRank", "game_rank");
  const rankPct = (1 - (avgRank - 1) / 7) * 100;
  const timePct = Math.min(avgKeys("playTime", "play_time") / 1080 * 100, 100);
  const rawSurvival = (rankPct * 0.4) + (timePct * 0.6);

  const hpms: number[] = [];
  for (const g of slice) {
    const h = pickNum(g, "healAmount", "heal_amount");
    const ptM = Math.max(pickNum(g, "playTime", "play_time") / 60, 1 / 60);
    hpms.push(h / ptM);
  }
  const avgHpm = hpms.reduce((a, b) => a + b, 0) / n;
  const sHeal = Math.min(avgHpm / 1200, 1) * 100;
  const avgProt = avgKeys("protectAbsorb", "protect_absorb");
  const sAbsorb = Math.min(avgProt / 2800, 1) * 100;
  const avgTr = avgKeys("teamRecover", "team_recover");
  const sTeamRec = Math.min(avgTr / 900, 1) * 100;
  const rawSustain = sHeal * 0.5 + sAbsorb * 0.35 + sTeamRec * 0.15;

  const scores = [
    clamp(rawEngagement),
    clamp(rawHunting),
    clamp(rawVision),
    clamp(rawSurvival),
    clamp(rawSustain),
  ];
  const grade = gradeFromAvg(scores.reduce((a, b) => a + b, 0) / 5);

  return {
    userId: opts.userId,
    seasonId: slice[0]?.seasonId ?? 33,
    matchingMode: mode,
    engagement: Math.round(scores[0] * 10) / 10,
    hunting: Math.round(scores[1] * 10) / 10,
    vision: Math.round(scores[2] * 10) / 10,
    survival: Math.round(scores[3] * 10) / 10,
    sustain: Math.round(scores[4] * 10) / 10,
    centerGrade: grade,
    gamesAnalyzed: n,
  };
}

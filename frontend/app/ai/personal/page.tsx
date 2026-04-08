"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  LineChart,
  ArrowLeft,
  Search,
  Loader2,
  ExternalLink,
  Crosshair,
  Eye,
  Skull,
  HeartPulse,
  Target,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import {
  searchPlayer,
  getPlayerGamesByUserId,
  getOctagonScoreByUserId,
  getCharacterCatalog,
  ApiError,
} from "@/lib/api";
import { buildCharacterCatalogMap, type CharacterCatalogMap } from "@/lib/characterDisplay";
import { MOCK_PLAYER, calcProfileStats, getTierFromRankOrRP } from "@/lib/mock";
import type { PlayerStats, UserGame, OctagonScore } from "@/lib/types";
import {
  aggregateCombatMetrics,
  characterUsageFromGames,
  characterUsageFromStats,
  recentGamesMetrics,
  type CharacterUsageRow,
} from "@/lib/personalMetrics";
import OctagonChart from "@/components/OctagonChart";
import { computeOctagonFromUserGames } from "@/lib/octagonFromGames";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";
/** 더미(김현민)로 화면을 바로 채움: 로컬 개발 또는 목 API 모드 */
const PREFILL_DUMMY = USE_MOCK || process.env.NODE_ENV === "development";
const DEMO_NICKNAME = "김현민";

const accent = "#38bdf8";
const border = "rgba(56,189,248,0.15)";
const borderHi = "rgba(56,189,248,0.28)";

function pickLadderRank(game?: UserGame | null): number | null {
  if (!game) return null;
  const raw = game as unknown as Record<string, unknown>;
  const candidates = [raw.rank, raw.userRank, raw.ranking, raw.ladderRank];
  for (const v of candidates) {
    const n = Number(v);
    if (Number.isFinite(n) && n > 0) return Math.floor(n);
  }
  return null;
}

function MetricCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: ReactNode;
}) {
  return (
    <div
      className="rounded-xl p-4 sm:p-5 transition-shadow hover:shadow-[0_0_24px_rgba(56,189,248,0.08)]"
      style={{
        background: "linear-gradient(165deg, rgba(20,35,48,0.85) 0%, rgba(12,22,32,0.92) 100%)",
        border: `1px solid ${border}`,
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-[11px] font-mono uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
          {label}
        </span>
        <span className="opacity-70" style={{ color: accent }}>
          {icon}
        </span>
      </div>
      <p className="text-2xl sm:text-3xl font-black tabular-nums tracking-tight" style={{ color: "var(--text-primary)" }}>
        {value}
      </p>
      {sub && (
        <p className="text-[11px] mt-1 font-mono" style={{ color: "var(--text-secondary)" }}>
          {sub}
        </p>
      )}
    </div>
  );
}

function UsageBar({ row, maxCount }: { row: CharacterUsageRow; maxCount: number }) {
  const w = maxCount > 0 ? Math.max(8, Math.round((row.count / maxCount) * 100)) : 0;
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex justify-between text-xs mb-1 gap-2">
        <span className="font-medium truncate" style={{ color: "var(--text-primary)" }}>
          {row.name}
        </span>
        <span className="font-mono shrink-0" style={{ color: "var(--text-secondary)" }}>
          {row.count}판 · {row.pct}%
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.35)" }}>
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${w}%`,
            background: `linear-gradient(90deg, ${accent}, rgba(14,165,233,0.5))`,
            boxShadow: `0 0 12px rgba(56,189,248,0.35)`,
          }}
        />
      </div>
    </div>
  );
}

function buildDummyDashboard() {
  const g = MOCK_PLAYER.recentGames;
  return {
    nickname: DEMO_NICKNAME,
    userId: MOCK_PLAYER.userId,
    games: g,
    stats: null as PlayerStats | null,
    octagon: MOCK_PLAYER.octagon,
    profileRollup: calcProfileStats(g),
    rankPoint: MOCK_PLAYER.rankPoint,
  };
}

const INITIAL_DUMMY_STATE = PREFILL_DUMMY ? buildDummyDashboard() : null;

export default function PersonalMetricsPage() {
  const [q, setQ] = useState(DEMO_NICKNAME);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nickname, setNickname] = useState<string | null>(INITIAL_DUMMY_STATE?.nickname ?? null);
  const [userId, setUserId] = useState<string | null>(INITIAL_DUMMY_STATE?.userId ?? null);
  const [games, setGames] = useState<UserGame[]>(INITIAL_DUMMY_STATE?.games ?? []);
  const [stats, setStats] = useState<PlayerStats | null>(INITIAL_DUMMY_STATE?.stats ?? null);
  const [octagon, setOctagon] = useState<OctagonScore | null>(INITIAL_DUMMY_STATE?.octagon ?? null);
  const [profileRollup, setProfileRollup] = useState<ReturnType<typeof calcProfileStats> | null>(
    INITIAL_DUMMY_STATE?.profileRollup ?? null
  );
  const [rankPoint, setRankPoint] = useState(INITIAL_DUMMY_STATE?.rankPoint ?? 0);
  const [charCatalog, setCharCatalog] = useState<CharacterCatalogMap>({});

  useEffect(() => {
    getCharacterCatalog()
      .then((r) => setCharCatalog(buildCharacterCatalogMap(r.items)))
      .catch(() => setCharCatalog({}));
  }, []);

  const load = useCallback(async () => {
    const nick = q.trim();
    if (!nick) {
      setError("닉네임을 입력하세요.");
      return;
    }
    setLoading(true);
    setError(null);

    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 450));
      const g = MOCK_PLAYER.recentGames;
      const roll = calcProfileStats(g);
      setNickname(nick);
      setUserId(MOCK_PLAYER.userId);
      setGames(g);
      setStats(null);
      setOctagon(
        computeOctagonFromUserGames(g, {
          userId: MOCK_PLAYER.userId ?? "",
          matchingMode: 3,
        }) ?? MOCK_PLAYER.octagon
      );
      setProfileRollup(roll);
      setRankPoint(MOCK_PLAYER.rankPoint);
      setLoading(false);
      return;
    }

    try {
      const searchResult = await searchPlayer(nick);
      const resolvedUserId = searchResult.userId?.trim() || null;
      if (!resolvedUserId) {
        setError(`"${nick}" 플레이어의 userId를 찾을 수 없습니다.`);
        setNickname(null);
        setUserId(null);
        setGames([]);
        setStats(null);
        setOctagon(null);
        setProfileRollup(null);
        setRankPoint(0);
        setLoading(false);
        return;
      }
      const [gamesRes, octRes] = await Promise.allSettled([
        getPlayerGamesByUserId(resolvedUserId),
        getOctagonScoreByUserId(resolvedUserId),
      ]);
      if (gamesRes.status === "rejected") {
        throw gamesRes.reason;
      }
      const gd = gamesRes.status === "fulfilled" ? gamesRes.value : null;
      const ocApi = octRes.status === "fulfilled" ? octRes.value : null;
      const list = gd?.games ?? [];
      const ocFromGames = computeOctagonFromUserGames(list, {
        userId: resolvedUserId,
        matchingMode: 3,
      });
      setNickname(nick);
      setUserId(resolvedUserId);
      setGames(list);
      setStats(null);
      setOctagon(ocFromGames ?? ocApi);
      setProfileRollup(calcProfileStats(list));
      const latestRankedGame = list.find((g) => g.matchingMode === 3);
      setRankPoint(latestRankedGame?.rankPoint ?? list[0]?.rankPoint ?? 0);
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.status === 404 ? `"${nick}" 플레이어를 찾을 수 없습니다.` : e.message);
      } else {
        setError("불러오기에 실패했습니다.");
      }
      setNickname(null);
      setUserId(null);
      setGames([]);
      setStats(null);
      setOctagon(null);
      setProfileRollup(null);
      setRankPoint(0);
    } finally {
      setLoading(false);
    }
  }, [q]);

  const combat = aggregateCombatMetrics(games);
  const usageFromApi = characterUsageFromStats(stats, 10);
  const usageFromGames = characterUsageFromGames(games, 10, charCatalog);
  const usage = usageFromApi.length > 0 ? usageFromApi : usageFromGames;
  const maxUsage = usage[0]?.count ?? 1;
  const recent = recentGamesMetrics(games, 14, charCatalog);
  const maxDmg = Math.max(1, ...recent.map((r) => r.damage));

  const latestRankedGame = games.find((g) => g.matchingMode === 3);
  const ladderRank = pickLadderRank(latestRankedGame);
  const tier = getTierFromRankOrRP(rankPoint, ladderRank);

  return (
    <div
      className="min-h-[calc(100dvh-3.75rem)] fade-in px-4 sm:px-6 lg:px-10 py-8"
      style={{
        background:
          "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(56,189,248,0.08), transparent 55%), var(--bg-primary)",
      }}
    >
      <div className="max-w-6xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[11px] font-mono tracking-wide mb-6 transition-opacity hover:opacity-80"
          style={{ color: "var(--text-secondary)" }}
        >
          <ArrowLeft size={14} />
          홈
        </Link>

        <header className="flex flex-col sm:flex-row sm:items-end gap-4 sm:justify-between mb-8">
          <div className="flex items-start gap-4">
            <div
              className="p-3 rounded-2xl shrink-0"
              style={{
                background: "rgba(56,189,248,0.1)",
                border: `1px solid ${borderHi}`,
              }}
            >
              <LineChart size={26} style={{ color: accent }} />
            </div>
            <div>
              <p className="text-[10px] font-mono tracking-[0.2em] uppercase mb-1" style={{ color: accent }}>
                Personal Metrics Lab
              </p>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>
                개인 지표 분석
              </h1>
              <p className="text-sm mt-2 max-w-xl" style={{ color: "var(--text-secondary)" }}>
                최근 전적을 바탕으로 딜·힐·시야·픽 분포 등을 한 화면에서 요약합니다. 백엔드 연동 시 자동 갱신됩니다.
              </p>
            </div>
          </div>
        </header>

        {/* 검색 */}
        <form
          className="flex flex-col sm:flex-row gap-3 mb-10"
          onSubmit={(e) => {
            e.preventDefault();
            load();
          }}
        >
          <div
            className="flex-1 flex items-center gap-3 rounded-xl px-4 py-3.5"
            style={{
              background: "rgba(15,25,35,0.75)",
              border: `1px solid ${border}`,
            }}
          >
            <Search size={18} style={{ color: accent }} className="shrink-0 opacity-80" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="닉네임 입력 후 분석"
              className="flex-1 bg-transparent outline-none text-base"
              style={{ color: "var(--text-primary)" }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 sm:min-w-[140px]"
            style={{
              background: `linear-gradient(135deg, ${accent}, #0ea5e9)`,
              color: "rgba(6,16,24,0.95)",
              boxShadow: "0 12px 32px rgba(14,165,233,0.25)",
            }}
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : null}
            분석 불러오기
          </button>
        </form>

        {PREFILL_DUMMY && nickname === DEMO_NICKNAME && profileRollup && (
          <p
            className="text-[11px] font-mono mb-8 -mt-5 px-1"
            style={{ color: "var(--text-secondary)" }}
          >
            미리보기: <span style={{ color: accent }}>{DEMO_NICKNAME}</span> 더미 전적(MOCK_PLAYER)으로 화면이 채워져 있습니다. 다른 닉네임은
            {USE_MOCK ? " 목 모드에서도 동일 샘플이 표시됩니다." : " 분석 불러오기로 API를 조회합니다."}
          </p>
        )}

        {error && (
          <div
            className="mb-8 rounded-xl px-4 py-3 text-sm"
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.25)",
              color: "#fecaca",
            }}
          >
            {error}
          </div>
        )}

        {nickname && userId != null && profileRollup && (
          <div className="space-y-8 fade-in">
            <div
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl px-4 py-4"
              style={{
                background: "rgba(12,22,32,0.65)",
                border: `1px solid ${borderHi}`,
              }}
            >
              <div>
                <p className="text-xs font-mono" style={{ color: "var(--text-secondary)" }}>
                  TARGET · userId {userId}
                </p>
                <p className="text-xl font-black mt-0.5" style={{ color: "var(--text-primary)" }}>
                  {nickname}
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                  RP {rankPoint.toLocaleString()} · {tier}
                </p>
              </div>
              <Link
                href={`/player/${encodeURIComponent(nickname)}`}
                className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg transition-colors hover:bg-white/5"
                style={{ color: accent, border: `1px solid ${border}` }}
              >
                전적 상세
                <ExternalLink size={14} />
              </Link>
            </div>

            {/* 옥타곤 — 최상단 */}
            <section>
              <h2 className="text-xs font-mono tracking-widest uppercase mb-4" style={{ color: accent }}>
                01 · 옥타곤 지표
              </h2>
              {octagon ? (
                <div
                  className="rounded-xl p-5 sm:p-8 max-w-2xl mx-auto"
                  style={{
                    background: "linear-gradient(165deg, rgba(18,32,44,0.92) 0%, rgba(10,18,26,0.97) 100%)",
                    border: `1px solid ${borderHi}`,
                    boxShadow: "inset 0 1px 0 rgba(56,189,248,0.06)",
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <BarChart3 size={18} style={{ color: accent }} />
                      <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                        옥타곤 평가 지표
                      </span>
                    </div>
                    <p className="text-[11px] font-mono" style={{ color: "var(--text-secondary)" }}>
                      최근 {octagon.gamesAnalyzed}게임 · 시즌 {octagon.seasonId} · 모드 {octagon.matchingMode}
                    </p>
                  </div>
                  <OctagonChart
                    scores={{
                      engagement: octagon.engagement,
                      hunting: octagon.hunting,
                      vision: octagon.vision,
                      survival: octagon.survival,
                      sustain: octagon.sustain,
                    }}
                    grade={octagon.centerGrade}
                    size={300}
                  />
                </div>
              ) : (
                <div
                  className="rounded-xl p-8 text-center text-sm max-w-xl mx-auto"
                  style={{
                    background: "rgba(12,22,32,0.55)",
                    border: `1px dashed ${border}`,
                    color: "var(--text-secondary)",
                  }}
                >
                  옥타곤 지표를 불러오지 못했습니다. 백엔드{" "}
                  <span className="font-mono text-[11px]" style={{ color: accent }}>
                    /api/octagon/by-user-id
                  </span>{" "}
                  연동 후 표시됩니다.
                </div>
              )}
            </section>

            {/* 요약 KPI */}
            <section>
              <h2 className="text-xs font-mono tracking-widest uppercase mb-4" style={{ color: accent }}>
                02 · 요약 지표
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <MetricCard
                  label="승률 (최근)"
                  value={`${profileRollup.winRate}%`}
                  sub={`${profileRollup.totalGames}게임 샘플`}
                  icon={<TrendingUp size={16} />}
                />
                <MetricCard
                  label="평균 순위"
                  value={profileRollup.avgRank.toFixed(1)}
                  sub="낮을수록 상위"
                  icon={<Target size={16} />}
                />
                <MetricCard
                  label="평균 킬"
                  value={profileRollup.avgKill.toFixed(1)}
                  sub={`평균 딜 ${formatNum(profileRollup.avgDamage)}`}
                  icon={<Crosshair size={16} />}
                />
                <MetricCard
                  label="평균 어시스트"
                  value={combat ? combat.avgAssist.toFixed(1) : "—"}
                  sub={combat ? `K/D ${combat.kdRatio}` : undefined}
                  icon={<Skull size={16} />}
                />
              </div>
            </section>

            {/* 전투 롤업 */}
            {combat && (
              <section>
                <h2 className="text-xs font-mono tracking-widest uppercase mb-4" style={{ color: accent }}>
                  03 · 전투·성장 롤업
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <MetricCard
                    label="평균 플레이어 딜"
                    value={formatNum(combat.avgDamage)}
                    sub="damageToPlayer"
                    icon={<Crosshair size={16} />}
                  />
                  <MetricCard
                    label="평균 힐"
                    value={formatNum(combat.avgHeal)}
                    sub="healAmount"
                    icon={<HeartPulse size={16} />}
                  />
                  <MetricCard
                    label="평균 시야"
                    value={`${combat.avgSight}`}
                    sub="sightRange (게임 종료 시점)"
                    icon={<Eye size={16} />}
                  />
                  <MetricCard
                    label="평균 몬스터 킬"
                    value={`${combat.avgMonsterKill}`}
                    sub={`평균 데스 ${combat.avgDeaths}`}
                    icon={<Target size={16} />}
                  />
                </div>
              </section>
            )}

            <section>
              <h2 className="text-xs font-mono tracking-widest uppercase mb-4" style={{ color: accent }}>
                04 · 실험체 픽 분포
              </h2>
              <div
                className="rounded-xl p-4 sm:p-5 max-w-3xl"
                style={{
                  background: "linear-gradient(165deg, rgba(18,32,44,0.9) 0%, rgba(10,18,26,0.95) 100%)",
                  border: `1px solid ${border}`,
                }}
              >
                {usage.length === 0 ? (
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    표시할 픽 데이터가 없습니다.
                  </p>
                ) : (
                  usage.map((row) => <UsageBar key={row.characterNum} row={row} maxCount={maxUsage} />)
                )}
              </div>
            </section>

            {/* 최근 경기 */}
            <section>
              <h2 className="text-xs font-mono tracking-widest uppercase mb-4" style={{ color: accent }}>
                05 · 최근 경기 딜·순위
              </h2>
              <div
                className="rounded-xl overflow-hidden"
                style={{
                  border: `1px solid ${border}`,
                  background: "rgba(10,18,26,0.6)",
                }}
              >
                <div
                  className="grid grid-cols-[48px_minmax(0,1fr)_72px] sm:grid-cols-[56px_minmax(0,1fr)_84px_100px] gap-2 px-3 py-2 text-[10px] font-mono uppercase tracking-wider"
                  style={{ color: "var(--text-secondary)", borderBottom: `1px solid ${border}` }}
                >
                  <span>순위</span>
                  <span>딜량 (막대)</span>
                  <span className="text-right">K/A/D</span>
                  <span className="hidden sm:block text-right col-start-4">실험체</span>
                </div>
                <div className="max-h-[min(420px,50vh)] overflow-y-auto">
                  {recent.map((r, idx) => (
                    <div
                      key={`${r.gameId}-${idx}`}
                      className="grid grid-cols-[48px_minmax(0,1fr)_72px] sm:grid-cols-[56px_minmax(0,1fr)_84px_100px] gap-2 px-3 py-2.5 items-center text-xs"
                      style={{
                        borderBottom: `1px solid rgba(255,255,255,0.04)`,
                        background: r.victory ? "rgba(34,197,94,0.04)" : undefined,
                      }}
                    >
                      <span
                        className="font-mono font-bold tabular-nums"
                        style={{ color: r.rank <= 3 ? accent : "var(--text-primary)" }}
                      >
                        {r.rank}위
                      </span>
                      <div>
                        <div className="flex justify-between gap-2 mb-1">
                          <span className="font-mono text-[11px]" style={{ color: "var(--text-secondary)" }}>
                            {formatNum(r.damage)}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.35)" }}>
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${Math.round((r.damage / maxDmg) * 100)}%`,
                              background: `linear-gradient(90deg, ${accent}, transparent)`,
                              opacity: 0.9,
                            }}
                          />
                        </div>
                        <span className="sm:hidden text-[10px] mt-1 block truncate" style={{ color: "var(--text-secondary)" }}>
                          {r.characterName}
                        </span>
                      </div>
                      <span className="font-mono text-right text-[11px]" style={{ color: "var(--text-secondary)" }}>
                        {r.kills}/{r.assists}/{r.deaths}
                      </span>
                      <span
                        className="hidden sm:block text-right truncate text-[11px]"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {r.characterName}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

function formatNum(n: number): string {
  return n.toLocaleString("ko-KR");
}

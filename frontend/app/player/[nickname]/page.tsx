"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { buildCharacterCatalogMap, type CharacterCatalogMap } from "@/lib/characterDisplay";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import OctagonChart from "@/components/OctagonChart";
import GameHistoryRow from "@/components/GameHistoryRow";
import GameDetailModal from "@/components/GameDetailModal";
import { computeOctagonFromUserGames } from "@/lib/octagonFromGames";
import {
  MOCK_PLAYER,
  getTierColorFromRankOrRP,
  getTierImageFromRankOrRP,
  formatNumber,
  getTierFromRankOrRP,
  calcProfileStats,
} from "@/lib/mock";
import {
  searchPlayer,
  getPlayerGamesByUserId,
  getOctagonScoreByUserId,
  refreshPlayerByUserId,
  getCharacterCatalog,
  ApiError,
} from "@/lib/api";
import { useRecentSearches } from "@/hooks/useRecentSearches";
import type { PlayerProfile, UserGame } from "@/lib/types";
import { RefreshCw, Trophy, AlertCircle } from "lucide-react";
import { resolveCharacterDisplayName } from "@/lib/characterDisplay";
import { getCharacterDefaultMiniSrc } from "@/lib/characterDefaultMini";

// ── 개발 환경 목 모드 ─────────────────────────────────────────
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";
const WHITE_ACCENT = "rgba(255,255,255,0.92)";

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

function formatElapsedSinceSync(syncAt: string | null): string {
  if (!syncAt) return "최근 갱신";
  const ts = new Date(syncAt).getTime();
  if (!Number.isFinite(ts)) return "갱신 필요";
  const diffMs = Date.now() - ts;
  if (!Number.isFinite(diffMs) || diffMs < 0) return "갱신 필요";
  const totalMin = Math.floor(diffMs / 60000);
  if (totalMin < 1) return "최근 갱신";
  if (totalMin < 60) return `${totalMin}분 전 갱신`;
  const totalHours = Math.floor(totalMin / 60);
  if (totalHours < 24) return `${totalHours}시간 전 갱신`;
  const totalDays = Math.floor(totalHours / 24);
  return `${totalDays}일 전 갱신`;
}

export default function PlayerPage() {
  const { nickname: rawParam } = useParams<{ nickname: string }>();
  const nickname = decodeURIComponent(
    Array.isArray(rawParam) ? rawParam[0] : rawParam
  ).trim();

  const [player, setPlayer] = useState<PlayerProfile | null>(null);
  const [games, setGames] = useState<UserGame[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [charCatalog, setCharCatalog] = useState<CharacterCatalogMap>({});
  const [detailGame, setDetailGame] = useState<UserGame | null>(null);
  const { updateTierInfo } = useRecentSearches();

  /** 로드된 전적 목록 기준 랭크 최대 20판 — 더보기 후에도 최신 20판 유지 */
  const displayOctagon = useMemo(() => {
    if (!player?.userId) return null;
    if (games.length > 0) {
      return (
        computeOctagonFromUserGames(games, { userId: player.userId, matchingMode: 3 }) ??
        player.octagon
      );
    }
    return player.octagon;
  }, [player?.userId, player?.octagon, games]);

  const mostPlayedChars = useMemo(() => {
    if (games.length === 0) return [];
    const map = new Map<number, { charNum: number; name: string; games: number; wins: number }>();
    games.forEach((g) => {
      const charNum = g.characterNum ?? 0;
      if (!charNum) return;
      if (!map.has(charNum)) {
        map.set(charNum, {
          charNum,
          name: resolveCharacterDisplayName(charNum, charCatalog),
          games: 0,
          wins: 0,
        });
      }
      const entry = map.get(charNum)!;
      entry.games++;
      if (g.gameRank === 1 || g.victory === 1) entry.wins++;
    });
    return Array.from(map.values())
      .sort((a, b) => b.games - a.games)
      .slice(0, 5);
  }, [games, charCatalog]);

  useEffect(() => {
    getCharacterCatalog()
      .then((r) => setCharCatalog(buildCharacterCatalogMap(r.items ?? [])))
      .catch(() => setCharCatalog({}));
  }, []);

  // ── 데이터 로드 ──────────────────────────────────────────────
  const loadPlayer = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 600));
      const recentGames = MOCK_PLAYER.recentGames;
      const octagonFromGames = computeOctagonFromUserGames(recentGames, {
        userId: MOCK_PLAYER.userId ?? "",
        matchingMode: 3,
      });
      setPlayer({
        ...MOCK_PLAYER,
        nickname,
        octagon: octagonFromGames ?? MOCK_PLAYER.octagon,
      });
      setGames(recentGames);
      setLoading(false);
      return;
    }

    try {
      const searchResult = await searchPlayer(nickname);
      const userId = searchResult.userId?.trim() || null;

      if (!userId) {
        setError(`"${nickname}" 플레이어의 userId를 찾을 수 없습니다.`);
        return;
      }

      const gamesPromise = getPlayerGamesByUserId(userId, undefined, 2, {
        persistToSupabase: true,
      });
      const octagonPromise = getOctagonScoreByUserId(userId);

      const [gamesResult, octagonResult] = await Promise.allSettled([
        gamesPromise,
        octagonPromise,
      ]);

      const gamesData = gamesResult.status === "fulfilled" ? gamesResult.value : null;
      const octagonApi = octagonResult.status === "fulfilled" ? octagonResult.value : null;

      if (gamesResult.status === "rejected") {
        throw gamesResult.reason;
      }

      const recentGames = gamesData?.games ?? [];
      const { winRate, totalGames, avgKill, avgDamage, avgRank } = calcProfileStats(recentGames);

      // 최근 1판이 일반전이면 rankPoint가 0/미제공일 수 있어, 가장 최신 랭크전 값을 우선 사용한다.
      const latestRankedGame = recentGames.find((g) => g.matchingMode === 3);
      const rankPoint = latestRankedGame?.rankPoint ?? recentGames[0]?.rankPoint ?? 0;
      const ladderRank = gamesData?.ladderRank ?? pickLadderRank(latestRankedGame);
      const tier = getTierFromRankOrRP(rankPoint, ladderRank);

      const octagonFromGames = computeOctagonFromUserGames(recentGames, {
        userId,
        matchingMode: 3,
      });
      const octagon = octagonFromGames ?? octagonApi;

      setPlayer({
        userId,
        nickname: searchResult.nickname || nickname,
        accountLevel: recentGames[0]?.accountLevel ?? 0,
        rankPoint,
        ladderRank,
        tier,
        lastSyncAt: gamesData?.refreshedAt ?? null,
        stats: null,
        octagon,
        recentGames,
        winRate,
        totalGames,
        avgKill,
        avgDamage,
        avgRank,
      });
      setGames(recentGames);
      setNextCursor(gamesData?.next ?? null);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.status === 404 ? `"${nickname}" 플레이어를 찾을 수 없습니다.` : err.message);
      } else {
        setError("데이터를 불러오는 중 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  }, [nickname]);

  useEffect(() => { loadPlayer(); }, [loadPlayer]);

  useEffect(() => {
    if (player?.nickname && player.tier && player.rankPoint != null) {
      updateTierInfo(player.nickname, player.tier, player.rankPoint);
    }
  }, [player?.nickname, player?.tier, player?.rankPoint, updateTierInfo]);

  // ── 갱신 ─────────────────────────────────────────────────────
  const handleRefresh = async () => {
    if (!player || refreshing || !player.userId) return;
    setRefreshing(true);
    if (!USE_MOCK) {
      try {
        await refreshPlayerByUserId(player.userId);
      } catch {}
    }
    await loadPlayer();
    setRefreshing(false);
  };

  // ── 더보기 (ER 응답의 next 를 cursor 로 전달) ─────────────────
  const handleLoadMore = async () => {
    if (!player?.userId || !nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const more = await getPlayerGamesByUserId(player.userId, nextCursor);
      setGames((prev) => [...prev, ...more.games]);
      setNextCursor(more.next);
    } catch {}
    setLoadingMore(false);
  };

  // ── 로딩 / 에러 상태 ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center gap-4">
        <div
          className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "rgba(255,255,255,0.35)", borderTopColor: "transparent" }}
        />
        <p style={{ color: "var(--text-secondary)" }}>
          <span style={{ color: WHITE_ACCENT }}>{nickname}</span> 전적 불러오는 중...
        </p>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center gap-4">
        <AlertCircle size={40} style={{ color: "#ff3b3b" }} />
        <p style={{ color: "var(--text-primary)" }}>{error ?? "알 수 없는 오류"}</p>
        <Link href="/" className="text-sm" style={{ color: WHITE_ACCENT }}>
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  const latestRankedGame = games.find((g) => g.matchingMode === 3);
  const ladderRank = player.ladderRank ?? pickLadderRank(latestRankedGame);
  const tierColor = getTierColorFromRankOrRP(player.rankPoint, ladderRank);
  const tierImageSrc = getTierImageFromRankOrRP(player.rankPoint, ladderRank);
  const hasSyncTimestamp =
    typeof player.lastSyncAt === "string" &&
    Number.isFinite(new Date(player.lastSyncAt).getTime());
  const syncLabel = formatElapsedSinceSync(player.lastSyncAt);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 fade-in">
      {/* 플레이어 헤더 */}
      <div
        className="relative mb-6 rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(20,29,53,0.96) 0%, rgba(15,22,41,0.90) 100%)",
          border: `1px solid ${tierColor}2a`,
          boxShadow: `0 0 0 1px rgba(255,255,255,0.05), 0 24px 64px rgba(0,0,0,0.50), 0 0 120px ${tierColor}10`,
        }}
      >
        {/* 티어 컬러 상단 강조선 */}
        <div
          style={{
            height: 3,
            background: `linear-gradient(90deg, ${tierColor} 0%, ${tierColor}55 50%, transparent 100%)`,
          }}
        />

        <div className="px-6 pt-5 pb-4">
          <div className="flex items-start gap-5">
            {/* 티어 엠블럼 */}
            <div
              className="shrink-0 rounded-2xl flex items-center justify-center"
              style={{
                background: `radial-gradient(circle at 40% 40%, ${tierColor}18 0%, rgba(15,22,41,0.70) 100%)`,
                border: `1px solid ${tierColor}28`,
                width: 88,
                height: 88,
              }}
            >
              <Image src={tierImageSrc} alt={player.tier} width={72} height={72} style={{ objectFit: "contain" }} />
            </div>

            {/* 플레이어 정보 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1
                  className="text-2xl font-black tracking-tight"
                  style={{
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-display), 'Noto Sans KR', sans-serif",
                  }}
                >
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
                  <Image src={tierImageSrc} alt={player.tier} width={12} height={12} />
                  {player.tier}
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    color: "var(--text-secondary)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  Lv.{player.accountLevel}
                </span>
              </div>

              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span
                  className="text-3xl font-black tabular-nums leading-none"
                  style={{
                    color: tierColor,
                    fontFamily: "var(--font-display), sans-serif",
                  }}
                >
                  {player.rankPoint.toLocaleString()}
                </span>
                <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>RP</span>
                {ladderRank && (
                  <>
                    <span className="mx-1" style={{ color: "rgba(255,255,255,0.10)" }}>·</span>
                    <Trophy size={12} style={{ color: "var(--text-secondary)" }} />
                    <span className="text-sm font-bold" style={{ color: "var(--text-secondary)" }}>
                      #{ladderRank.toLocaleString()}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* 전적 갱신 */}
            <div className="flex flex-col items-end shrink-0">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing || syncLabel === "최근 갱신"}
                className="flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-xl transition-all disabled:opacity-55 disabled:cursor-not-allowed"
                style={{
                  background: refreshing
                    ? "linear-gradient(135deg, rgba(148,163,184,0.35), rgba(71,85,105,0.45))"
                    : "linear-gradient(135deg, rgba(0,255,136,0.42), rgba(255,255,255,0.88))",
                  color: refreshing ? "rgba(226,232,240,0.9)" : "rgba(10,14,26,0.95)",
                  border: "1px solid rgba(255,255,255,0.22)",
                  boxShadow: refreshing
                    ? "0 8px 24px rgba(0,0,0,0.25)"
                    : "0 0 0 1px rgba(0,255,136,0.15), 0 12px 36px rgba(0,255,136,0.18), 0 18px 48px rgba(0,0,0,0.35)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <RefreshCw size={16} className={refreshing ? "animate-spin shrink-0" : "shrink-0"} />
                {refreshing ? "갱신 중..." : "전적 갱신"}
              </button>
              <span className="mt-2 text-[11px]" style={{ color: "var(--text-secondary)" }}>
                {syncLabel}
              </span>
            </div>
          </div>

          {/* 요약 통계 그리드 */}
          <div className="mt-5 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="grid grid-cols-5 gap-2">
              {[
                {
                  label: "승률",
                  val: `${player.winRate}%`,
                  color:
                    player.winRate >= 60
                      ? "#34d399"
                      : player.winRate >= 50
                        ? "var(--text-primary)"
                        : "#f87171",
                },
                { label: "총 게임", val: `${player.totalGames}판`, color: "var(--text-primary)" },
                { label: "평균 킬", val: player.avgKill.toFixed(1), color: "#fbbf24" },
                { label: "평균 딜", val: formatNumber(player.avgDamage), color: "#fb923c" },
                { label: "평균 순위", val: `${player.avgRank.toFixed(1)}위`, color: "var(--text-secondary)" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex flex-col items-center py-2.5 rounded-lg"
                  style={{ background: "rgba(255,255,255,0.03)" }}
                >
                  <span
                    className="text-lg font-black tabular-nums leading-none mb-1"
                    style={{
                      color: s.color,
                      fontFamily: "var(--font-display), sans-serif",
                    }}
                  >
                    {s.val}
                  </span>
                  <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 옥타곤 + 전적 */}
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
        {/* 왼쪽: 옥타곤 + 모스트 캐릭터 */}
        <div className="flex flex-col gap-4">
          {/* 옥타곤 */}
          <div
            className="card p-5"
            style={{
              background: "linear-gradient(180deg, rgba(20,29,53,0.70) 0%, rgba(15,22,41,0.55) 100%)",
              borderColor: "rgba(255,255,255,0.10)",
              boxShadow: "0 18px 50px rgba(0,0,0,0.28)",
              backdropFilter: "blur(10px)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                옥타곤 지표
              </h2>
              {displayOctagon && (
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  최근 {displayOctagon.gamesAnalyzed}게임
                </span>
              )}
            </div>
            {displayOctagon ? (
              <OctagonChart
                scores={displayOctagon}
                grade={displayOctagon.centerGrade}
                size={280}
              />
            ) : (
              <div className="flex items-center justify-center h-48">
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  데이터 없음
                </p>
              </div>
            )}
          </div>

          {/* 모스트 캐릭터 */}
          {mostPlayedChars.length > 0 && (
            <div
              className="card p-4"
              style={{
                background: "linear-gradient(180deg, rgba(20,29,53,0.70) 0%, rgba(15,22,41,0.55) 100%)",
                borderColor: "rgba(255,255,255,0.10)",
                boxShadow: "0 18px 50px rgba(0,0,0,0.28)",
                backdropFilter: "blur(10px)",
              }}
            >
              <h2
                className="text-xs font-bold mb-3"
                style={{
                  color: "var(--text-secondary)",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                모스트 캐릭터
              </h2>
              <div className="flex flex-col gap-2.5">
                {mostPlayedChars.map((char, idx) => {
                  const winRate =
                    char.games > 0 ? Math.round((char.wins / char.games) * 100) : 0;
                  const miniSrc = getCharacterDefaultMiniSrc(char.name);
                  const rateColor =
                    winRate >= 60 ? "#34d399" : winRate >= 50 ? "var(--text-primary)" : "#f87171";
                  return (
                    <div key={char.charNum} className="flex items-center gap-2.5">
                      <span
                        className="text-xs tabular-nums w-4 shrink-0 font-bold"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {idx + 1}
                      </span>
                      <div
                        className="w-9 h-9 rounded-lg overflow-hidden shrink-0"
                        style={{ background: "var(--bg-secondary)" }}
                      >
                        {miniSrc ? (
                          <Image
                            src={miniSrc}
                            alt={char.name}
                            width={36}
                            height={36}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center text-xs font-bold"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {char.name.slice(0, 1)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span
                            className="text-xs font-bold truncate"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {char.name}
                          </span>
                          <span
                            className="text-xs font-bold ml-2 shrink-0 tabular-nums"
                            style={{ color: rateColor }}
                          >
                            {winRate}%
                          </span>
                        </div>
                        <div
                          className="relative h-1 rounded-full overflow-hidden"
                          style={{ background: "rgba(255,255,255,0.07)" }}
                        >
                          <div
                            className="absolute inset-y-0 left-0 rounded-full"
                            style={{
                              width: `${winRate}%`,
                              background:
                                winRate >= 60
                                  ? "#34d399"
                                  : winRate >= 50
                                    ? "#60a5fa"
                                    : "#f87171",
                            }}
                          />
                        </div>
                      </div>
                      <span
                        className="text-[11px] tabular-nums shrink-0"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {char.games}게임
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 최근 전적 */}
        <div
          className="card p-5"
          style={{
            background: "linear-gradient(180deg, rgba(20,29,53,0.70) 0%, rgba(15,22,41,0.55) 100%)",
            borderColor: "rgba(255,255,255,0.10)",
            boxShadow: "0 18px 50px rgba(0,0,0,0.28)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
              최근 전적
            </h2>
            {games.length >= 3 && (
              <div className="flex items-center gap-2">
                <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                  최근 폼
                </span>
                <div className="flex gap-0.5">
                  {games.slice(0, 10).map((g, i) => {
                    const isW = g.gameRank === 1 || g.victory === 1;
                    return (
                      <div
                        key={i}
                        className="w-2 h-4 rounded-sm"
                        style={{
                          background: isW ? "#34d399" : "rgba(248,113,113,0.65)",
                        }}
                        title={isW ? "승" : `${g.gameRank}위`}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {games.map((game) => (
              <GameHistoryRow
                key={game.gameId}
                game={game}
                catalog={charCatalog}
                onSelect={setDetailGame}
              />
            ))}
          </div>

          {/* 더보기 버튼 */}
          {nextCursor && (
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="w-full mt-4 py-2 rounded-lg text-xs transition-colors disabled:opacity-50"
              style={{
                backgroundColor: "rgba(20,29,53,0.55)",
                color: "var(--text-secondary)",
                border: "1px solid rgba(255,255,255,0.10)",
                backdropFilter: "blur(8px)",
              }}
            >
              {loadingMore ? "불러오는 중..." : "더보기"}
            </button>
          )}
        </div>
      </div>

      <GameDetailModal
        game={detailGame}
        catalog={charCatalog}
        onClose={() => setDetailGame(null)}
      />
    </div>
  );
}

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
import type { PlayerProfile, UserGame } from "@/lib/types";
import { RefreshCw, ChevronRight, Trophy, Sword, Target, Clock, AlertCircle } from "lucide-react";

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

      const gamesPromise = getPlayerGamesByUserId(userId);
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
        lastSyncAt: new Date().toISOString(),
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 fade-in">
      {/* 플레이어 헤더 */}
      <div
        className="card p-6 mb-6"
        style={{
          background: `linear-gradient(180deg, rgba(20,29,53,0.70) 0%, rgba(15,22,41,0.55) 100%)`,
          borderColor: "rgba(255,255,255,0.10)",
          boxShadow: "0 18px 50px rgba(0,0,0,0.28)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div className="flex items-start gap-5">
          {/* 티어 이미지 */}
          <div className="w-16 h-16 shrink-0 flex items-center justify-center">
            <Image
              src={tierImageSrc}
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
                <Image src={tierImageSrc} alt={player.tier} width={14} height={14} />
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
              {ladderRank && (
                <>
                  <span style={{ color: "var(--text-secondary)" }}>·</span>
                  <span style={{ color: "var(--text-secondary)" }}>
                    #{ladderRank.toLocaleString()}위
                  </span>
                </>
              )}
            </div>

            {/* 요약 통계 */}
            <div className="flex flex-wrap gap-4 text-xs">
              {[
                { icon: <Trophy size={11} />, label: "승률", val: `${player.winRate}%`, color: "#00ff88" },
                { icon: <Target size={11} />, label: "총 게임", val: `${player.totalGames}판`, color: WHITE_ACCENT },
                { icon: <Sword size={11} />, label: "평균 킬", val: player.avgKill.toFixed(1), color: "#ffa726" },
                { icon: <Target size={11} />, label: "평균 딜", val: formatNumber(player.avgDamage), color: "#ffa726" },
                { icon: <Clock size={11} />, label: "평균 순위", val: `${player.avgRank.toFixed(1)}위`, color: "var(--text-secondary)" },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-1">
                  <span style={{ color: s.color }}>{s.icon}</span>
                  <span style={{ color: "var(--text-secondary)" }}>{s.label}</span>
                  <span style={{ color: s.color }} className="font-bold">{s.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 갱신 + 패배 분석 */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
              style={{
                backgroundColor: "rgba(20,29,53,0.55)",
                color: "var(--text-secondary)",
                border: "1px solid rgba(255,255,255,0.10)",
                backdropFilter: "blur(8px)",
              }}
            >
              <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "갱신 중..." : "갱신"}
            </button>
            {player.userId && (
            <Link
              href={`/ai/defeat?userId=${encodeURIComponent(player.userId)}`}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-bold transition-all"
              style={{
                background: "linear-gradient(135deg, rgba(248,113,113,0.35), rgba(255,255,255,0.78))",
                color: "rgba(10,14,26,0.95)",
                border: "1px solid rgba(255,255,255,0.18)",
                boxShadow: "0 18px 55px rgba(0,0,0,0.34)",
              }}
            >
              AI 패배 원인 분석
              <ChevronRight size={11} />
            </Link>
            )}
          </div>
        </div>
      </div>

      {/* 옥타곤 + 전적 */}
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
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

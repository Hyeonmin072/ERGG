"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import OctagonChart from "@/components/OctagonChart";
import GameHistoryRow from "@/components/GameHistoryRow";
import { MOCK_PLAYER, getTierColor, getTierImage, formatNumber, getTierFromRP, calcProfileStats } from "@/lib/mock";
import { searchPlayer, getPlayerStats, getPlayerGames, getOctagonScore, refreshPlayer, ApiError } from "@/lib/api";
import type { PlayerProfile, UserGame } from "@/lib/types";
import { RefreshCw, ChevronRight, Trophy, Sword, Target, Clock, AlertCircle } from "lucide-react";

// ── 개발 환경 목 모드 ─────────────────────────────────────────
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";
const WHITE_ACCENT = "rgba(255,255,255,0.92)";

export default function PlayerPage() {
  const { userNum: rawParam } = useParams<{ userNum: string }>();
  const nickname = decodeURIComponent(rawParam);

  const [player, setPlayer] = useState<PlayerProfile | null>(null);
  const [games, setGames] = useState<UserGame[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── 데이터 로드 ──────────────────────────────────────────────
  const loadPlayer = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (USE_MOCK) {
      // Todo : 백엔드 데이터(검색/스탯/전적/옥타곤) 정상화 이후 목 데이터 제거
      await new Promise((r) => setTimeout(r, 600));
      setPlayer({ ...MOCK_PLAYER, nickname });
      setGames(MOCK_PLAYER.recentGames);
      setLoading(false);
      return;
    }

    try {
      // 1) 닉네임 → userNum 조회
      const searchResult = await searchPlayer(nickname);
      const uid = searchResult.userNum;

      // 2) 스탯 + 게임 + 옥타곤 병렬 요청
      const [statsResult, gamesResult, octagonResult] = await Promise.allSettled([
        getPlayerStats(uid),
        getPlayerGames(uid),
        getOctagonScore(uid),
      ]);

      const stats = statsResult.status === "fulfilled" ? statsResult.value : null;
      const gamesData = gamesResult.status === "fulfilled" ? gamesResult.value : null;
      const octagon = octagonResult.status === "fulfilled" ? octagonResult.value : null;

      const recentGames = gamesData?.games ?? [];
      const { winRate, totalGames, avgKill, avgDamage, avgRank } = calcProfileStats(recentGames);

      const rankPoint = stats?.rankPoint ?? 0;
      const tier = getTierFromRP(rankPoint);

      setPlayer({
        userNum: uid,
        nickname,
        accountLevel: recentGames[0]?.accountLevel ?? 0,
        rankPoint,
        tier,
        lastSyncAt: new Date().toISOString(),
        stats,
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
    if (!player || refreshing) return;
    setRefreshing(true);
    if (!USE_MOCK) {
      try { await refreshPlayer(player.userNum); } catch {}
    }
    await loadPlayer();
    setRefreshing(false);
  };

  // ── 더보기 ───────────────────────────────────────────────────
  const handleLoadMore = async () => {
    if (!player || !nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const more = await getPlayerGames(player.userNum, nextCursor);
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

  const tierColor = getTierColor(player.tier);

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
              src={getTierImage(player.tier)}
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
                <Image src={getTierImage(player.tier)} alt={player.tier} width={14} height={14} />
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

          {/* 갱신 + AI 코치 */}
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
            <Link
              href={`/ai/coach?userNum=${player.userNum}`}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-bold transition-all"
              style={{
                background: "linear-gradient(135deg, rgba(124,58,237,0.95), rgba(255,255,255,0.78))",
                color: "rgba(10,14,26,0.95)",
                border: "1px solid rgba(255,255,255,0.18)",
                boxShadow: "0 18px 55px rgba(0,0,0,0.34)",
              }}
            >
              나쟈의 독설 받기
              <ChevronRight size={11} />
            </Link>
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
            {player.octagon && (
              <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                최근 {player.octagon.gamesAnalyzed}게임
              </span>
            )}
          </div>
          {player.octagon ? (
            <OctagonChart
              scores={player.octagon}
              grade={player.octagon.centerGrade}
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
              <GameHistoryRow key={game.gameId} game={game} />
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
    </div>
  );
}

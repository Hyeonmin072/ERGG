// ============================================================
// ERGG API 클라이언트
// FastAPI 백엔드 (http://localhost:8000) 호출
// ============================================================
import type {
  PlayerSearchResult,
  PlayerStats,
  PlayerGamesResponse,
  OctagonScore,
  CharacterStatsResponse,
} from "./types";

function normalizeBaseUrl(raw?: string): string {
  const fallback = "http://localhost:8000/api/v1";
  if (!raw) return fallback;
  const trimmed = raw.replace(/\/+$/, "");
  if (trimmed.endsWith("/api/v1")) return trimmed;
  if (trimmed.endsWith("/api")) return `${trimmed}/v1`;
  return trimmed;
}

const BASE_URL = normalizeBaseUrl(process.env.NEXT_PUBLIC_API_URL);

// ── 공통 fetch 래퍼 ──────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(res.status, err.detail ?? "알 수 없는 오류");
  }

  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}


// ── 플레이어 API ─────────────────────────────────────────────

/**
 * 닉네임으로 플레이어 검색
 * GET /api/players/search?nickname={nickname}
 */
export async function searchPlayer(
  nickname: string
): Promise<PlayerSearchResult> {
  return apiFetch<PlayerSearchResult>(
    `/players/search?nickname=${encodeURIComponent(nickname)}`
  );
}

/**
 * 플레이어 랭크 스탯 조회
 * GET /api/players/{userNum}?season_id={seasonId}&mode={mode}
 */
export async function getPlayerStats(
  userNum: number,
  seasonId = 33,
  mode = 3
): Promise<PlayerStats> {
  return apiFetch<PlayerStats>(
    `/players/${userNum}?season_id=${seasonId}&mode=${mode}`
  );
}

/**
 * 플레이어 게임 목록 조회 (커서 페이지네이션)
 * GET /api/players/{userNum}/games?cursor={cursor}
 */
export async function getPlayerGames(
  userNum: number,
  cursor?: string
): Promise<PlayerGamesResponse> {
  const qs = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
  return apiFetch<PlayerGamesResponse>(`/players/${userNum}/games${qs}`);
}

/**
 * 플레이어 캐시 갱신 요청
 * POST /api/players/{userNum}/refresh
 */
export async function refreshPlayer(
  userNum: number
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/players/${userNum}/refresh`, {
    method: "POST",
  });
}


// ── 옥타곤 API ───────────────────────────────────────────────

/**
 * 플레이어 옥타곤 지표 조회
 * GET /api/octagon/{userNum}?season_id={seasonId}&mode={mode}
 */
export async function getOctagonScore(
  userNum: number,
  seasonId = 33,
  mode = 3
): Promise<OctagonScore> {
  return apiFetch<OctagonScore>(
    `/octagon/${userNum}?season_id=${seasonId}&mode=${mode}`
  );
}


// ── AI Lab API ───────────────────────────────────────────────

export interface CoachRequest {
  user_num: number;
  game_count?: number;
  season_id?: number;
  mode?: number;
}

export interface CoachResponse {
  feedback: string;
  weakAxis: string;
  scores: Record<string, number>;
}

/**
 * 나쟈의 독설 (AI 코칭)
 * POST /api/ai/coach
 */
export async function getAiCoach(
  req: CoachRequest
): Promise<CoachResponse> {
  return apiFetch<CoachResponse>("/ai/coach", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

/**
 * 메타 브리핑
 * GET /api/ai/meta
 */
export async function getMetaBriefing(): Promise<{
  briefing: string;
  date: string;
}> {
  return apiFetch("/ai/meta");
}

/**
 * AI 루트 추천
 * POST /api/ai/route
 */
export async function getRouteRecommendation(prompt: string): Promise<{
  response: string;
}> {
  return apiFetch("/ai/route", {
    method: "POST",
    body: JSON.stringify({ prompt }),
  });
}

/**
 * 캐릭터 통계 조회
 * GET /api/stats/characters?min_games={minGames}&limit={limit}
 */
export async function getCharacterStats(
  minGames = 10,
  limit = 100
): Promise<CharacterStatsResponse> {
  return apiFetch<CharacterStatsResponse>(
    `/stats/characters?min_games=${minGames}&limit=${limit}`
  );
}

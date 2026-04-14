// ============================================================
// ERGG API 클라이언트 — 브라우저 → 이 저장소의 FastAPI 백엔드만 호출합니다.
//
// 이터널리턴 Open API(https://open-api.bser.io)는 백엔드가 서버에서 호출합니다.
// (ER_API_KEY는 브라우저에 노출되면 안 되므로 프론트에서 ER 직통 요청을 하지 않습니다.)
// ============================================================
import type {
  PlayerSearchResult,
  PlayerGamesResponse,
  OctagonScore,
  CharacterStatsResponse,
  CharacterCatalogResponse,
  WeaponCatalogResponse,
  ComboWinProbabilityRequest,
  ComboWinProbabilityResponse,
} from "./types";

function normalizeBaseUrl(raw?: string): string {
  const fallback = "/api-ergg/api/v1";
  if (!raw) return fallback;
  const trimmed = raw.replace(/\/+$/, "");
  // 상대 경로(프록시): /api-ergg → /api-ergg/api/v1
  if (trimmed.startsWith("/")) {
    if (trimmed.endsWith("/api/v1")) return trimmed;
    if (trimmed.endsWith("/api")) return `${trimmed}/v1`;
    return `${trimmed}/api/v1`;
  }
  if (trimmed.endsWith("/api/v1")) return trimmed;
  if (trimmed.endsWith("/api")) return `${trimmed}/v1`;
  try {
    const withProto = trimmed.includes("://") ? trimmed : `http://${trimmed}`;
    const u = new URL(withProto);
    if (u.pathname === "/" || u.pathname === "") {
      return `${u.origin}/api/v1`;
    }
  } catch {
    /* keep trimmed */
  }
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
 * userId(닉네임 검색 userId) 기준 전적.
 * 백엔드가 ER: GET /v1/user/games/uid/{userId} → next 있으면 ?next= 로 2페이지까지 합침(기본).
 * GET /api/v1/players/games/by-user-id?userId=&maxPages= | &cursor=
 */
export async function getPlayerGamesByUserId(
  userId: string,
  cursor?: string,
  /** cursor 없을 때 합칠 ER 페이지 수(1≈10판). 기본 2 → 최대 ~20판 */
  maxPages = 2
): Promise<PlayerGamesResponse> {
  const sp = new URLSearchParams({ userId });
  if (cursor) {
    sp.set("cursor", cursor);
  } else {
    sp.set("maxPages", String(maxPages));
  }
  return apiFetch<PlayerGamesResponse>(`/players/games/by-user-id?${sp.toString()}`);
}

/**
 * 플레이어·옥타곤 캐시 갱신 (userId)
 * POST /api/v1/players/refresh/by-user-id?userId=
 */
export async function refreshPlayerByUserId(
  userId: string
): Promise<{ message: string }> {
  const sp = new URLSearchParams({ userId });
  return apiFetch<{ message: string }>(`/players/refresh/by-user-id?${sp.toString()}`, {
    method: "POST",
  });
}


// ── 캐릭터 마스터 (Supabase character 테이블) ─────────────────

/**
 * GET /api/v1/catalog/characters
 */
export async function getCharacterCatalog(): Promise<CharacterCatalogResponse> {
  return apiFetch<CharacterCatalogResponse>("/catalog/characters");
}

/**
 * GET /api/v1/catalog/weapons — best_weapon 코드별 한글·영문 이름
 */
export async function getWeaponCatalog(): Promise<WeaponCatalogResponse> {
  return apiFetch<WeaponCatalogResponse>("/catalog/weapons");
}


// ── 옥타곤 API ───────────────────────────────────────────────

/**
 * 플레이어 옥타곤 지표 조회 (userId)
 * GET /api/v1/octagon/by-user-id?userId=&seasonId=&mode=
 */
export async function getOctagonScoreByUserId(
  userId: string,
  seasonId = 33,
  mode = 3
): Promise<OctagonScore> {
  const sp = new URLSearchParams({
    userId,
    seasonId: String(seasonId),
    mode: String(mode),
  });
  return apiFetch<OctagonScore>(`/octagon/by-user-id?${sp.toString()}`);
}


// ── AI Lab API ───────────────────────────────────────────────

export interface CoachRequest {
  userId: string;
  gameCount?: number;
  seasonId?: number;
  mode?: number;
}

export interface CoachResponse {
  nickname: string;
  gamesAnalyzed: number;
  feedback: string;
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
 * 스쿼드 3인 조합 1등 확률 (XGBoost)
 * POST /api/v1/ai/combo-win-probability
 */
export async function getComboWinProbability(
  body: ComboWinProbabilityRequest
): Promise<ComboWinProbabilityResponse> {
  return apiFetch<ComboWinProbabilityResponse>("/ai/combo-win-probability", {
    method: "POST",
    body: JSON.stringify(body),
  });
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
 * GET /api/stats/characters?minGames={minGames}&limit={limit}
 */
export async function getCharacterStats(
  minGames = 10,
  limit = 100
): Promise<CharacterStatsResponse> {
  return apiFetch<CharacterStatsResponse>(
    `/stats/characters?minGames=${minGames}&limit=${limit}`
  );
}

"use client";
import { useEffect, useMemo, useState } from "react";
import { Zap, User, ChevronRight, AlertCircle } from "lucide-react";
import { getAiCoach } from "@/lib/api";

const MOCK_FEEDBACK = `
[최근 20게임 분석 결과 — 직접적으로 말하겠습니다]

**핵심 문제: 2일 차 이전에 죽는 비율 73%**

당신의 평균 생존 시간은 391초입니다. 게임의 중반조차 보지 못하고 있어요.

1. **초반 사냥 루트가 비효율적입니다.** 크레딧 획득량 상위 20%의 플레이어 대비 32% 낮습니다. 시작 루트를 재설계하지 않으면 장비 격차로 인해 계속 교전에서 불리합니다.

2. **시야 설치가 거의 없습니다 (평균 0.3개).** 카메라 없이 교전에 뛰어드는 건 눈 감고 운전하는 것과 같습니다. 상위 동티어 플레이어 평균은 2.1개입니다.

3. **킬 참여율 42%는 팀의 짐입니다.** 같은 MMR 구간 평균은 61%입니다. 당신이 구경하는 동안 팀원들이 죽어가고 있습니다.

**개선 방안:**
- 루트 시작 전 최소 1개 카메라 설치를 습관화
- 1일 차에 곰 사냥 포기하고 크레딧 효율 높은 닭·멧돼지 루트 우선
- 교전 전 팀원 위치 확인 후 합류 타이밍 개선

당신이 바뀌지 않으면 MMR은 계속 내려갑니다.
`.trim();

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

export default function CoachPage() {
  const [nickname, setNickname] = useState("");
  const [gameCount, setGameCount] = useState(20);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const accent = useMemo(() => "rgba(255,255,255,0.92)", []);

  useEffect(() => {
    // Todo : 백엔드 연동 시 URL 쿼리(userNum)로 자동 분석 지원
  }, []);

  const handleAnalyze = () => {
    if (!nickname.trim()) return;
    setLoading(true);
    setFeedback(null);
    (async () => {
      try {
        if (USE_MOCK) {
          await new Promise((r) => setTimeout(r, 900));
          setFeedback(MOCK_FEEDBACK);
          return;
        }
        // Todo : nickname → userNum 검색(searchPlayer) 후 getAiCoach 호출로 교체
        // 현재 백엔드 스펙은 user_num 기반이라 임시 더미를 유지합니다.
        await getAiCoach({ user_num: 0, game_count: gameCount });
        setFeedback(MOCK_FEEDBACK);
      } catch {
        setFeedback(MOCK_FEEDBACK);
      } finally {
        setLoading(false);
      }
    })();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div
          className="p-2.5 rounded-xl"
          style={{
            background: "linear-gradient(135deg, rgba(124,58,237,0.28), rgba(255,255,255,0.10))",
            border: "1px solid rgba(255,255,255,0.10)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Zap size={20} style={{ color: accent }} />
        </div>
        <div>
          <h1 className="text-xl font-black" style={{ color: "var(--text-primary)" }}>
            나쟈의 독설
          </h1>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            AI가 당신의 패배를 냉정하게 분석합니다
          </p>
        </div>
      </div>

      {/* Input form */}
      <div
        className="card p-6 mb-6"
        style={{
          background: "linear-gradient(180deg, rgba(20,29,53,0.70) 0%, rgba(15,22,41,0.55) 100%)",
          borderColor: "rgba(255,255,255,0.10)",
          boxShadow: "0 18px 50px rgba(0,0,0,0.28)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold mb-2 block" style={{ color: "var(--text-secondary)" }}>
              닉네임
            </label>
            <div
              className="flex items-center gap-2 rounded-xl px-4 py-3"
              style={{
                backgroundColor: "rgba(20,29,53,0.55)",
                border: "1px solid rgba(255,255,255,0.10)",
                backdropFilter: "blur(8px)",
              }}
            >
              <User size={14} style={{ color: "var(--text-secondary)" }} />
              <input
                type="text"
                placeholder="분석할 플레이어 닉네임..."
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="flex-1 bg-transparent text-sm"
                style={{ color: "var(--text-primary)" }}
                onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold mb-2 block" style={{ color: "var(--text-secondary)" }}>
              분석 게임 수
            </label>
            <div className="flex gap-2">
              {[10, 20, 30].map((n) => (
                <button
                  key={n}
                  onClick={() => setGameCount(n)}
                  className="px-4 py-2 rounded-lg text-sm font-bold transition-all"
                  style={{
                    backgroundColor: gameCount === n ? "rgba(255,255,255,0.86)" : "rgba(20,29,53,0.55)",
                    color: gameCount === n ? "rgba(10,14,26,0.95)" : "var(--text-secondary)",
                    border: `1px solid ${gameCount === n ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.10)"}`,
                    boxShadow: gameCount === n ? "0 10px 28px rgba(0,0,0,0.32)" : "none",
                  }}
                >
                  {n}게임
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!nickname.trim() || loading}
            className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all"
            style={{
              background: nickname.trim() && !loading
                ? "linear-gradient(135deg, rgba(124,58,237,0.95), rgba(255,255,255,0.78))"
                : "rgba(255,255,255,0.08)",
              color: nickname.trim() && !loading ? "rgba(10,14,26,0.95)" : "var(--text-secondary)",
              cursor: nickname.trim() && !loading ? "pointer" : "not-allowed",
              border: nickname.trim() && !loading ? "1px solid rgba(255,255,255,0.18)" : "1px solid rgba(255,255,255,0.10)",
              boxShadow: nickname.trim() && !loading ? "0 18px 55px rgba(0,0,0,0.34)" : "none",
            }}
          >
            {loading ? (
              <>
                <div
                  className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
                  style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "transparent" }}
                />
                나쟈가 분석 중...
              </>
            ) : (
              <>
                <Zap size={14} />
                독설 받기
                <ChevronRight size={14} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Disclaimer */}
      <div
        className="flex items-start gap-2 p-3 rounded-lg mb-6 text-xs"
        style={{
          backgroundColor: "rgba(124,58,237,0.1)",
          border: "1px solid rgba(124,58,237,0.3)",
          color: "var(--text-secondary)",
        }}
      >
        <AlertCircle size={13} className="shrink-0 mt-0.5" style={{ color: "#7c3aed" }} />
        <span>AI 피드백은 게임 데이터 기반으로 생성됩니다. 개인 성향이나 상황적 요인은 반영되지 않을 수 있습니다.</span>
      </div>

      {/* Feedback result */}
      {feedback && (
        <div
          className="card p-6 fade-in"
          style={{
            borderColor: "rgba(255,255,255,0.12)",
            boxShadow: "0 18px 55px rgba(0,0,0,0.34)",
            background: "linear-gradient(180deg, rgba(20,29,53,0.70) 0%, rgba(15,22,41,0.55) 100%)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black"
              style={{
                background: "linear-gradient(135deg, rgba(124,58,237,0.90), rgba(255,255,255,0.75))",
                color: "rgba(10,14,26,0.95)",
                border: "1px solid rgba(255,255,255,0.18)",
              }}
            >
              N
            </div>
            <div>
              <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>나쟈</div>
              <div className="text-xs" style={{ color: "var(--text-secondary)" }}>AI 코치 · {gameCount}게임 분석</div>
            </div>
          </div>
          <div
            className="text-sm leading-7 whitespace-pre-line"
            style={{ color: "var(--text-primary)" }}
          >
            {feedback.split("**").map((part, i) =>
              i % 2 === 1 ? (
                <strong key={i} style={{ color: accent }}>{part}</strong>
              ) : (
                <span key={i}>{part}</span>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

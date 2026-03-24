"use client";
import { useState } from "react";
import { Zap, User, ChevronRight, AlertCircle } from "lucide-react";

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

export default function CoachPage() {
  const [nickname, setNickname] = useState("");
  const [gameCount, setGameCount] = useState(20);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleAnalyze = () => {
    if (!nickname.trim()) return;
    setLoading(true);
    setFeedback(null);
    setTimeout(() => {
      setLoading(false);
      setFeedback(MOCK_FEEDBACK);
    }, 2200);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div
          className="p-2.5 rounded-xl"
          style={{ background: "linear-gradient(135deg, #7c3aed44, #00d4ff22)" }}
        >
          <Zap size={20} style={{ color: "#00d4ff" }} />
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
      <div className="card p-6 mb-6">
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold mb-2 block" style={{ color: "var(--text-secondary)" }}>
              닉네임
            </label>
            <div
              className="flex items-center gap-2 rounded-xl px-4 py-3"
              style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)" }}
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
                    backgroundColor: gameCount === n ? "var(--neon-cyan)" : "var(--bg-secondary)",
                    color: gameCount === n ? "#0a0e1a" : "var(--text-secondary)",
                    border: `1px solid ${gameCount === n ? "var(--neon-cyan)" : "var(--border)"}`,
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
                ? "linear-gradient(135deg, #7c3aed, #00d4ff)"
                : "var(--border)",
              color: nickname.trim() && !loading ? "#fff" : "var(--text-secondary)",
              cursor: nickname.trim() && !loading ? "pointer" : "not-allowed",
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
          style={{ borderColor: "rgba(124,58,237,0.4)", boxShadow: "0 0 20px rgba(124,58,237,0.1)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black"
              style={{ background: "linear-gradient(135deg, #7c3aed, #00d4ff)", color: "#fff" }}
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
                <strong key={i} style={{ color: "var(--neon-cyan)" }}>{part}</strong>
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

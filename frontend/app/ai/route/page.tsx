"use client";
import { useState } from "react";
import { Map, ChevronRight, MapPin, Sword, Package } from "lucide-react";

const CHARACTER_OPTIONS = [
  { num: 12, name: "현우" }, { num: 13, name: "나쟈" }, { num: 35, name: "엘레나" },
  { num: 78, name: "아키하바라" }, { num: 2, name: "핀" }, { num: 4, name: "재클린" },
];

const STYLE_OPTIONS = ["초반 교전", "안전한 성장", "사냥 위주", "팀 지원"];
const WEAPON_OPTIONS = ["검", "둔기", "총기", "활", "단검", "권투글러브", "창", "단검", "라피어"];

const MOCK_ROUTE = {
  routeId: 12299,
  startArea: "교회 (190번 구역)",
  tacticalSkillGroup: 30,
  tacticalSkillName: "폭발물 보급",
  priorityItems: ["실크 조각", "철판", "인조 가죽"],
  reasoning: `190번 교회 출발은 초반 교전 강화 루트의 핵심 시작점입니다.

인근 학교, 사원, 연구실을 순회하며 철판 계열 재료를 빠르게 수급할 수 있어 1일 차 내에 레어 등급 무기 제작이 가능합니다.

전술 스킬 30번(폭발물 보급)은 교전 진입 전 포지셔닝 이점을 제공하며, 2일 차 초반 교전에서 상대를 선제 압박하는 데 효과적입니다.

주의: 첫 번째 안전구역이 해변 방향으로 형성될 경우 루트 중반에 이동 경로를 조정해야 합니다.`,
};

export default function RoutePage() {
  const [characterNum, setCharacterNum] = useState<number | null>(null);
  const [style, setStyle] = useState("");
  const [weapon, setWeapon] = useState("");
  const [customQuery, setCustomQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<typeof MOCK_ROUTE | null>(null);

  const isReady = characterNum !== null && style !== "";

  const handleSubmit = () => {
    if (!isReady) return;
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      setLoading(false);
      setResult(MOCK_ROUTE);
    }, 1800);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div
          className="p-2.5 rounded-xl"
          style={{ background: "rgba(255,167,38,0.1)", border: "1px solid rgba(255,167,38,0.3)" }}
        >
          <Map size={20} style={{ color: "#ffa726" }} />
        </div>
        <div>
          <h1 className="text-xl font-black" style={{ color: "var(--text-primary)" }}>
            AI 루트 컨설턴트
          </h1>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            최적의 시작 루트와 전술 스킬을 추천해드립니다
          </p>
        </div>
      </div>

      {/* Natural language input */}
      <div className="card p-5 mb-5">
        <label className="text-xs font-bold mb-2 block" style={{ color: "var(--text-secondary)" }}>
          자연어로 요청하기 (선택)
        </label>
        <div
          className="flex items-center gap-2 rounded-xl px-4 py-3 mb-2"
          style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)" }}
        >
          <input
            type="text"
            placeholder='예: "현우 초반 교전 강한 루트 알려줘"'
            value={customQuery}
            onChange={(e) => setCustomQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm"
            style={{ color: "var(--text-primary)" }}
          />
        </div>
        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
          또는 아래 조건을 직접 선택하세요
        </p>
      </div>

      {/* Form */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col gap-5">
          {/* Character */}
          <div>
            <label className="text-xs font-bold mb-2 block" style={{ color: "var(--text-secondary)" }}>
              실험체 선택
            </label>
            <div className="flex flex-wrap gap-2">
              {CHARACTER_OPTIONS.map((c) => (
                <button
                  key={c.num}
                  onClick={() => setCharacterNum(c.num)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                  style={{
                    backgroundColor: characterNum === c.num ? "rgba(0,212,255,0.2)" : "var(--bg-secondary)",
                    color: characterNum === c.num ? "var(--neon-cyan)" : "var(--text-secondary)",
                    border: `1px solid ${characterNum === c.num ? "rgba(0,212,255,0.5)" : "var(--border)"}`,
                  }}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Style */}
          <div>
            <label className="text-xs font-bold mb-2 block" style={{ color: "var(--text-secondary)" }}>
              플레이 스타일
            </label>
            <div className="flex flex-wrap gap-2">
              {STYLE_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                  style={{
                    backgroundColor: style === s ? "rgba(255,167,38,0.2)" : "var(--bg-secondary)",
                    color: style === s ? "#ffa726" : "var(--text-secondary)",
                    border: `1px solid ${style === s ? "rgba(255,167,38,0.5)" : "var(--border)"}`,
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Weapon */}
          <div>
            <label className="text-xs font-bold mb-2 block" style={{ color: "var(--text-secondary)" }}>
              선호 무기 (선택)
            </label>
            <div className="flex flex-wrap gap-2">
              {WEAPON_OPTIONS.map((w) => (
                <button
                  key={w}
                  onClick={() => setWeapon(weapon === w ? "" : w)}
                  className="px-3 py-1.5 rounded-lg text-xs transition-all"
                  style={{
                    backgroundColor: weapon === w ? "rgba(124,58,237,0.2)" : "var(--bg-secondary)",
                    color: weapon === w ? "#a78bfa" : "var(--text-secondary)",
                    border: `1px solid ${weapon === w ? "rgba(124,58,237,0.4)" : "var(--border)"}`,
                  }}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!isReady || loading}
            className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all"
            style={{
              background: isReady && !loading
                ? "linear-gradient(135deg, #ffa726, #ff6d00)"
                : "var(--border)",
              color: isReady && !loading ? "#fff" : "var(--text-secondary)",
              cursor: isReady && !loading ? "pointer" : "not-allowed",
            }}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "transparent" }} />
                루트 분석 중...
              </>
            ) : (
              <>
                <Map size={14} />
                루트 추천받기
                <ChevronRight size={14} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div
          className="card p-6 fade-in"
          style={{ borderColor: "rgba(255,167,38,0.4)", boxShadow: "0 0 20px rgba(255,167,38,0.08)" }}
        >
          <h2 className="font-bold text-sm mb-5" style={{ color: "#ffa726" }}>
            추천 루트
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div
              className="p-3 rounded-lg flex items-center gap-3"
              style={{ backgroundColor: "var(--bg-secondary)" }}
            >
              <MapPin size={16} style={{ color: "#ffa726" }} />
              <div>
                <div className="text-xs" style={{ color: "var(--text-secondary)" }}>시작 위치</div>
                <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                  {result.startArea}
                </div>
              </div>
            </div>
            <div
              className="p-3 rounded-lg flex items-center gap-3"
              style={{ backgroundColor: "var(--bg-secondary)" }}
            >
              <Sword size={16} style={{ color: "var(--neon-cyan)" }} />
              <div>
                <div className="text-xs" style={{ color: "var(--text-secondary)" }}>전술 스킬</div>
                <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                  {result.tacticalSkillName} (#{result.tacticalSkillGroup})
                </div>
              </div>
            </div>
          </div>

          <div className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              <Package size={13} style={{ color: "var(--neon-green)" }} />
              <span className="text-xs font-bold" style={{ color: "var(--text-secondary)" }}>
                우선 수집 아이템
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.priorityItems.map((item) => (
                <span
                  key={item}
                  className="text-xs px-2.5 py-1 rounded-lg"
                  style={{
                    backgroundColor: "rgba(0,255,136,0.1)",
                    color: "var(--neon-green)",
                    border: "1px solid rgba(0,255,136,0.3)",
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-bold mb-2" style={{ color: "var(--text-secondary)" }}>
              루트 해설
            </div>
            <p className="text-sm leading-7 whitespace-pre-line" style={{ color: "var(--text-primary)" }}>
              {result.reasoning}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

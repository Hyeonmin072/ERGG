"use client";
import Link from "next/link";
import { Target, ArrowLeft } from "lucide-react";

export default function DefeatAnalysisPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 fade-in">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs mb-6 transition-opacity hover:opacity-80"
        style={{ color: "var(--text-secondary)" }}
      >
        <ArrowLeft size={14} />
        홈
      </Link>
      <div className="flex items-center gap-3 mb-8">
        <div
          className="p-2.5 rounded-xl"
          style={{ background: "rgba(248,113,113,0.12)", border: "1px solid rgba(248,113,113,0.35)" }}
        >
          <Target size={20} style={{ color: "#f87171" }} />
        </div>
        <div>
          <h1 className="text-xl font-black" style={{ color: "var(--text-primary)" }}>
            AI 패배 원인 분석
          </h1>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            최근 전적 기반으로 패턴·실수 포인트를 요약합니다
          </p>
        </div>
      </div>
      <div
        className="card p-6"
        style={{
          background: "linear-gradient(180deg, rgba(20,29,53,0.70) 0%, rgba(15,22,41,0.55) 100%)",
          borderColor: "rgba(255,255,255,0.10)",
          backdropFilter: "blur(10px)",
        }}
      >
        <p className="text-sm leading-7" style={{ color: "var(--text-secondary)" }}>
          상단 검색에서 플레이어를 선택한 뒤, 이 화면에서 상세 분석을 연결할 예정입니다.
        </p>
      </div>
    </div>
  );
}

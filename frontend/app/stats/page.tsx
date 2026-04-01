"use client";
import Link from "next/link";
import { PieChart, ArrowLeft } from "lucide-react";

export default function StatsPage() {
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
          style={{ background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.35)" }}
        >
          <PieChart size={20} style={{ color: "#34d399" }} />
        </div>
        <div>
          <h1 className="text-xl font-black" style={{ color: "var(--text-primary)" }}>
            통계
          </h1>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            전체 픽률·승률·트렌드 집계
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
          서버·시즌 단위 통계와 랭킹 요약을 이 탭에서 제공할 예정입니다.
        </p>
      </div>
    </div>
  );
}

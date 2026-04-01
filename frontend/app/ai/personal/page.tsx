"use client";
import Link from "next/link";
import { LineChart, ArrowLeft } from "lucide-react";

export default function PersonalMetricsPage() {
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
          style={{ background: "rgba(96,165,250,0.12)", border: "1px solid rgba(96,165,250,0.35)" }}
        >
          <LineChart size={20} style={{ color: "#60a5fa" }} />
        </div>
        <div>
          <h1 className="text-xl font-black" style={{ color: "var(--text-primary)" }}>
            개인 지표 분석
          </h1>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            KDA·딜·시야 등 개인 스탯을 구간별로 시각화합니다
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
          닉네임 검색 후 플레이어 상세와 연동되는 개인 지표 대시보드를 구축할 예정입니다.
        </p>
      </div>
    </div>
  );
}

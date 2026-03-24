import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "ER.GG — 이터널리턴 전적 분석",
  description: "AI 기반 이터널리턴 Asia 서버 전적 분석 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full flex flex-col" style={{ backgroundColor: "var(--bg-primary)" }}>
        <Navbar />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}

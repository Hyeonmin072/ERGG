import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Rajdhani, Noto_Sans_KR } from "next/font/google";

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ER.GG — 이터널리턴 전적 분석",
  description: "AI 기반 이터널리턴 전적 분석 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`h-full ${rajdhani.variable} ${notoSansKR.variable}`}>
      <body className="min-h-full flex flex-col" style={{ backgroundColor: "var(--bg-primary)" }}>
        <Navbar />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}

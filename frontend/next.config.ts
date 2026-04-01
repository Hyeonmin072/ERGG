import type { NextConfig } from "next";
import path from "path";

/** 브라우저 → Next와 같은 호스트로만 요청하고, 여기서 FastAPI로 넘깁니다 (CORS·localhost 이슈 완화). */
const backendOrigin =
  process.env.BACKEND_URL?.replace(/\/+$/, "") || "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  async rewrites() {
    return [
      {
        source: "/api-ergg/:path*",
        destination: `${backendOrigin}/:path*`,
      },
    ];
  },
};

export default nextConfig;

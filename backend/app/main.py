from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .routers import players, octagon, ai_lab, stats, catalog

app = FastAPI(
    title="ER.GG API",
    description="이터널리턴 Asia 서버 전적 분석 플랫폼",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(players.router, prefix="/api/v1/players", tags=["players"])
app.include_router(octagon.router, prefix="/api/v1/octagon", tags=["octagon"])
app.include_router(ai_lab.router, prefix="/api/v1/ai", tags=["ai"])
app.include_router(stats.router, prefix="/api/v1/stats", tags=["stats"])
app.include_router(catalog.router, prefix="/api/v1/catalog", tags=["catalog"])


@app.get("/health")
async def health():
    return {"status": "ok", "service": "ER.GG API"}

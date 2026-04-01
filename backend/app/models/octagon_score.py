from __future__ import annotations

from datetime import datetime
from sqlalchemy import BigInteger, Integer, String, DateTime, Numeric, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..core.database import Base


class OctagonScore(Base):
    __tablename__ = "octagon_scores"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(
        "userId", String(200), ForeignKey('players."userId"'), nullable=False, index=True
    )
    user_num: Mapped[int | None] = mapped_column("userNum", BigInteger, nullable=True, index=True)
    season_id: Mapped[int] = mapped_column("seasonId", Integer, nullable=False)
    matching_mode: Mapped[int] = mapped_column("matchingMode", Integer, nullable=False)

    combat_score: Mapped[float] = mapped_column("combatScore", Numeric(6, 3), default=0)
    takedown_score: Mapped[float] = mapped_column("takedownScore", Numeric(6, 3), default=0)
    hunting_score: Mapped[float] = mapped_column("huntingScore", Numeric(6, 3), default=0)
    vision_score: Mapped[float] = mapped_column("visionScore", Numeric(6, 3), default=0)
    mastery_score: Mapped[float] = mapped_column("masteryScore", Numeric(6, 3), default=0)
    survival_score: Mapped[float] = mapped_column("survivalScore", Numeric(6, 3), default=0)
    craft_score: Mapped[float] = mapped_column("craftScore", Numeric(6, 3), default=0)
    support_score: Mapped[float] = mapped_column("supportScore", Numeric(6, 3), default=0)

    center_grade: Mapped[str] = mapped_column("centerGrade", String(5), default="C")
    games_analyzed: Mapped[int] = mapped_column("gamesAnalyzed", Integer, default=0)
    calculated_at: Mapped[datetime] = mapped_column(
        "calculatedAt", DateTime(timezone=True), server_default=func.now()
    )

    player: Mapped["Player"] = relationship("Player", back_populates="octagon_scores")  # noqa: F821

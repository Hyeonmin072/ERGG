from __future__ import annotations

from datetime import datetime
from sqlalchemy import BigInteger, Integer, Float, String, DateTime, func, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..core.database import Base


class OctagonScore(Base):
    __tablename__ = "octagon_scores"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String(200), ForeignKey("players.user_id"), nullable=False, index=True)
    user_num: Mapped[int | None] = mapped_column(BigInteger, nullable=True, index=True)
    season_id: Mapped[int] = mapped_column(Integer, nullable=False)
    matching_mode: Mapped[int] = mapped_column(Integer, nullable=False)

    combat_score: Mapped[float] = mapped_column(Float, default=0.0)
    takedown_score: Mapped[float] = mapped_column(Float, default=0.0)
    hunting_score: Mapped[float] = mapped_column(Float, default=0.0)
    vision_score: Mapped[float] = mapped_column(Float, default=0.0)
    mastery_score: Mapped[float] = mapped_column(Float, default=0.0)
    survival_score: Mapped[float] = mapped_column(Float, default=0.0)

    center_grade: Mapped[str] = mapped_column(String(5), default="C")
    games_analyzed: Mapped[int] = mapped_column(Integer, default=0)
    calculated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    player: Mapped["Player"] = relationship("Player", back_populates="octagon_scores")  # noqa: F821

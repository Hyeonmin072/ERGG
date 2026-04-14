from __future__ import annotations

from datetime import datetime
from sqlalchemy import BigInteger, Integer, String, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..core.database import Base


class Player(Base):
    __tablename__ = "players"

    user_id: Mapped[str] = mapped_column("user_id", String(200), primary_key=True)
    nickname: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    account_level: Mapped[int] = mapped_column("account_level", Integer, default=0)
    rank_point: Mapped[int] = mapped_column("rank_point", Integer, default=0)
    server_name: Mapped[str] = mapped_column("server_name", String(20), default="Asia")
    last_sync_at: Mapped[datetime | None] = mapped_column("last_sync_at", DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column("created_at", DateTime(timezone=True), server_default=func.now())

    game_details: Mapped[list["GameDetail"]] = relationship(  # noqa: F821
        "GameDetail", back_populates="player", lazy="selectin"
    )
    octagon_scores: Mapped[list["OctagonScore"]] = relationship(  # noqa: F821
        "OctagonScore", back_populates="player", lazy="selectin"
    )

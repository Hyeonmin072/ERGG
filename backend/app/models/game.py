from datetime import datetime
from sqlalchemy import BigInteger, Integer, String, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..core.database import Base


class Game(Base):
    __tablename__ = "games"

    game_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    season_id: Mapped[int] = mapped_column(Integer, nullable=False)
    matching_mode: Mapped[int] = mapped_column(Integer, nullable=False)       # 3=랭크
    matching_team_mode: Mapped[int] = mapped_column(Integer, nullable=False)  # 1=솔로 2=듀오 3=스쿼드
    start_dtm: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    duration: Mapped[int] = mapped_column(Integer, default=0)
    game_version: Mapped[str] = mapped_column(String(20), default="")
    match_size: Mapped[int] = mapped_column(Integer, default=24)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    game_details: Mapped[list["GameDetail"]] = relationship(  # noqa: F821
        "GameDetail", back_populates="game", lazy="selectin"
    )

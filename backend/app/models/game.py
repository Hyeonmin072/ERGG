from datetime import datetime
from sqlalchemy import BigInteger, SmallInteger, Integer, String, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..core.database import Base


class Game(Base):
    """게임 세션 메타데이터"""
    __tablename__ = "games"

    game_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    season_id: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    matching_mode: Mapped[int] = mapped_column(SmallInteger, nullable=False)        # 2=일반, 3=랭크
    matching_team_mode: Mapped[int] = mapped_column(SmallInteger, nullable=False)   # 1=솔로, 3=스쿼드
    server_name: Mapped[str] = mapped_column(String(20), default="Asia")
    version_major: Mapped[int] = mapped_column(SmallInteger, default=0)
    version_minor: Mapped[int] = mapped_column(SmallInteger, default=0)
    start_dtm: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    duration: Mapped[int] = mapped_column(Integer, default=0)          # 게임 전체 지속 시간(초)
    match_size: Mapped[int] = mapped_column(SmallInteger, default=24)  # 총 참여 인원
    bot_added: Mapped[int] = mapped_column(SmallInteger, default=0)
    bot_remain: Mapped[int] = mapped_column(SmallInteger, default=0)
    restricted_area_accelerated: Mapped[int] = mapped_column(SmallInteger, default=0)
    safe_areas: Mapped[int] = mapped_column(SmallInteger, default=0)
    mmr_avg: Mapped[int] = mapped_column(Integer, default=0)           # 매치 평균 MMR
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    game_details: Mapped[list["GameDetail"]] = relationship(  # noqa: F821
        "GameDetail", back_populates="game", lazy="selectin"
    )

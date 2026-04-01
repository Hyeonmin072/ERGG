from sqlalchemy import BigInteger, SmallInteger, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..core.database import Base


class GameDetailBattleZone(Base):
    """배틀존 정보 - 게임당 최대 3개 구역"""
    __tablename__ = "game_detail_battle_zones"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    game_detail_id: Mapped[int] = mapped_column(
        "gameDetailId",
        BigInteger,
        ForeignKey("game_details.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    zone_number: Mapped[int] = mapped_column("zoneNumber", SmallInteger, nullable=False)

    area_code: Mapped[int] = mapped_column("areaCode", Integer, default=0)
    battle_mark: Mapped[int] = mapped_column("battleMark", Integer, default=0)
    battle_mark_count: Mapped[int] = mapped_column("battleMarkCount", Integer, default=0)
    winner: Mapped[int] = mapped_column(SmallInteger, default=0)
    item_codes: Mapped[list] = mapped_column("itemCodes", JSONB, default=list)

    __table_args__ = (
        UniqueConstraint("gameDetailId", "zoneNumber", name="uq_battle_zone"),
    )

    game_detail: Mapped["GameDetail"] = relationship(  # noqa: F821
        "GameDetail", back_populates="battle_zones"
    )

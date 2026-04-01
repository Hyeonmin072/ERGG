from sqlalchemy import BigInteger, SmallInteger, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..core.database import Base


class GameDetailKiller(Base):
    """킬러 정보 - 게임당 최대 3명"""
    __tablename__ = "game_detail_killers"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    game_detail_id: Mapped[int] = mapped_column(
        "gameDetailId",
        BigInteger,
        ForeignKey("game_details.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    killer_order: Mapped[int] = mapped_column("killerOrder", SmallInteger, nullable=False)

    killer_user_num: Mapped[int] = mapped_column("killerUserNum", BigInteger, default=0)
    killer_type: Mapped[str] = mapped_column("killerType", String(20), default="")
    kill_detail: Mapped[str] = mapped_column("killDetail", String(100), default="")
    cause_of_death: Mapped[str] = mapped_column("causeOfDeath", String(200), default="")
    place_of_death: Mapped[str] = mapped_column("placeOfDeath", String(10), default="")
    killer_character: Mapped[str] = mapped_column("killerCharacter", String(50), default="")
    killer_weapon: Mapped[str] = mapped_column("killerWeapon", String(50), default="")

    __table_args__ = (
        UniqueConstraint("gameDetailId", "killerOrder", name="uq_killer_order"),
    )

    game_detail: Mapped["GameDetail"] = relationship(  # noqa: F821
        "GameDetail", back_populates="killers"
    )

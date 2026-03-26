from sqlalchemy import BigInteger, SmallInteger, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..core.database import Base


class GameDetailKiller(Base):
    """킬러 정보 - 게임당 최대 3명 (killerUserNum, killerUserNum2, killerUserNum3)"""
    __tablename__ = "game_detail_killers"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    game_detail_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("game_details.id", ondelete="CASCADE"), nullable=False, index=True
    )
    killer_order: Mapped[int] = mapped_column(SmallInteger, nullable=False)  # 1, 2, 3

    killer_user_num: Mapped[int] = mapped_column(BigInteger, default=0)  # 0이면 봇/환경
    killer_type: Mapped[str] = mapped_column(String(20), default="")      # 'player', 'bot' 등
    kill_detail: Mapped[str] = mapped_column(String(100), default="")     # 킬러 닉네임 또는 지역명
    cause_of_death: Mapped[str] = mapped_column(String(200), default="")  # 사망 원인
    place_of_death: Mapped[str] = mapped_column(String(10), default="")   # 사망 지역 코드
    killer_character: Mapped[str] = mapped_column(String(50), default="") # 킬러 캐릭터명
    killer_weapon: Mapped[str] = mapped_column(String(50), default="")    # 킬러 무기

    __table_args__ = (
        UniqueConstraint("game_detail_id", "killer_order", name="uq_killer_order"),
    )

    # Relationship
    game_detail: Mapped["GameDetail"] = relationship(  # noqa: F821
        "GameDetail", back_populates="killers"
    )

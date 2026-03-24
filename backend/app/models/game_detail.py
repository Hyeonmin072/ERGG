from sqlalchemy import BigInteger, Integer, SmallInteger, String, Float, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..core.database import Base


class GameDetail(Base):
    __tablename__ = "game_details"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    game_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("games.game_id"), nullable=False, index=True)
    user_num: Mapped[int] = mapped_column(BigInteger, ForeignKey("players.user_num"), nullable=False, index=True)

    # Character
    character_num: Mapped[int] = mapped_column(Integer, default=0)
    character_level: Mapped[int] = mapped_column(Integer, default=0)
    skin_code: Mapped[int] = mapped_column(Integer, default=0)

    # Result
    game_rank: Mapped[int] = mapped_column(Integer, default=0)
    victory: Mapped[int] = mapped_column(SmallInteger, default=0)  # 0 or 1
    team_number: Mapped[int] = mapped_column(Integer, default=0)

    # Kill/Assist
    player_kill: Mapped[int] = mapped_column(Integer, default=0)
    player_assistant: Mapped[int] = mapped_column(Integer, default=0)
    monster_kill: Mapped[int] = mapped_column(Integer, default=0)
    team_kill: Mapped[int] = mapped_column(Integer, default=0)
    total_field_kill: Mapped[int] = mapped_column(Integer, default=0)
    player_deaths: Mapped[int] = mapped_column(Integer, default=0)
    total_double_kill: Mapped[int] = mapped_column(Integer, default=0)
    total_triple_kill: Mapped[int] = mapped_column(Integer, default=0)
    total_quadra_kill: Mapped[int] = mapped_column(Integer, default=0)

    # Weapon
    best_weapon: Mapped[int] = mapped_column(Integer, default=0)
    best_weapon_level: Mapped[int] = mapped_column(Integer, default=0)

    # Damage
    damage_to_player: Mapped[int] = mapped_column(BigInteger, default=0)
    damage_to_player_skill: Mapped[int] = mapped_column(BigInteger, default=0)
    damage_to_player_basic: Mapped[int] = mapped_column(BigInteger, default=0)
    damage_to_player_trap: Mapped[int] = mapped_column(BigInteger, default=0)
    damage_from_player: Mapped[int] = mapped_column(BigInteger, default=0)
    damage_to_monster: Mapped[int] = mapped_column(BigInteger, default=0)
    damage_from_monster: Mapped[int] = mapped_column(BigInteger, default=0)

    # Healing
    heal_amount: Mapped[int] = mapped_column(Integer, default=0)
    team_recover: Mapped[int] = mapped_column(Integer, default=0)
    protect_absorb: Mapped[int] = mapped_column(Integer, default=0)

    # Vision
    add_surveillance_camera: Mapped[int] = mapped_column(Integer, default=0)
    add_telephoto_camera: Mapped[int] = mapped_column(Integer, default=0)
    remove_surveillance_camera: Mapped[int] = mapped_column(Integer, default=0)
    view_contribution: Mapped[int] = mapped_column(Integer, default=0)

    # Tactical skill
    tactical_skill_group: Mapped[int] = mapped_column(Integer, default=0)
    tactical_skill_level: Mapped[int] = mapped_column(Integer, default=0)
    tactical_skill_use_count: Mapped[int] = mapped_column(Integer, default=0)

    # JSON fields
    mastery_level: Mapped[dict] = mapped_column(JSON, default=dict)
    equipment: Mapped[dict] = mapped_column(JSON, default=dict)
    equipment_grade: Mapped[dict] = mapped_column(JSON, default=dict)
    skill_level_info: Mapped[dict] = mapped_column(JSON, default=dict)
    skill_order_info: Mapped[dict] = mapped_column(JSON, default=dict)
    kill_monsters: Mapped[dict] = mapped_column(JSON, default=dict)

    # MMR
    mmr_before: Mapped[int] = mapped_column(Integer, default=0)
    mmr_gain: Mapped[int] = mapped_column(Integer, default=0)
    mmr_after: Mapped[int] = mapped_column(Integer, default=0)
    rank_point: Mapped[int] = mapped_column(Integer, default=0)

    # Time
    play_time: Mapped[int] = mapped_column(Integer, default=0)
    survivable_time: Mapped[int] = mapped_column(Integer, default=0)

    # Route
    route_id_of_start: Mapped[int] = mapped_column(Integer, default=0)
    place_of_start: Mapped[str] = mapped_column(String(10), default="")
    place_of_death: Mapped[str] = mapped_column(String(10), default="")

    # Craft
    craft_uncommon: Mapped[int] = mapped_column(Integer, default=0)
    craft_rare: Mapped[int] = mapped_column(Integer, default=0)
    craft_epic: Mapped[int] = mapped_column(Integer, default=0)
    craft_legend: Mapped[int] = mapped_column(Integer, default=0)
    craft_mythic: Mapped[int] = mapped_column(Integer, default=0)

    # Credits
    total_gain_vf_credit: Mapped[int] = mapped_column(Integer, default=0)

    # Death info
    killer_character: Mapped[str] = mapped_column(String(50), default="")
    cause_of_death: Mapped[str] = mapped_column(String(100), default="")

    # Stats
    max_hp: Mapped[int] = mapped_column(Integer, default=0)
    attack_power: Mapped[int] = mapped_column(Integer, default=0)
    defense: Mapped[int] = mapped_column(Integer, default=0)
    move_speed: Mapped[float] = mapped_column(Float, default=0.0)
    cc_time_to_player: Mapped[float] = mapped_column(Float, default=0.0)

    # Server
    server_name: Mapped[str] = mapped_column(String(20), default="Asia")

    # Relationships
    game: Mapped["Game"] = relationship("Game", back_populates="game_details")  # noqa: F821
    player: Mapped["Player"] = relationship("Player", back_populates="game_details")  # noqa: F821

from __future__ import annotations

from sqlalchemy import (
    BigInteger, Integer, SmallInteger, String, Float, Numeric,
    Boolean, Text, ForeignKey, UniqueConstraint
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..core.database import Base


class GameDetail(Base):
    """게임당 플레이어 상세 통계 (핵심 테이블)"""
    __tablename__ = "game_details"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    game_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("games.game_id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[str] = mapped_column(String(200), ForeignKey("players.user_id"), nullable=False, index=True)
    user_num: Mapped[int | None] = mapped_column(BigInteger, nullable=True, index=True)

    # ── 캐릭터
    character_num: Mapped[int] = mapped_column(Integer, default=0)
    character_level: Mapped[int] = mapped_column(SmallInteger, default=0)
    skin_code: Mapped[int] = mapped_column(Integer, default=0)

    # ── 게임 결과
    game_rank: Mapped[int] = mapped_column(SmallInteger, default=0)
    victory: Mapped[int] = mapped_column(SmallInteger, default=0)
    give_up: Mapped[int] = mapped_column(SmallInteger, default=0)
    team_spectator: Mapped[int] = mapped_column(SmallInteger, default=0)
    team_number: Mapped[int] = mapped_column(SmallInteger, default=0)
    pre_made: Mapped[int] = mapped_column(SmallInteger, default=0)
    escape_state: Mapped[int] = mapped_column(SmallInteger, default=0)

    # ── 킬 / 어시 / 데스
    player_kill: Mapped[int] = mapped_column(SmallInteger, default=0)
    player_assistant: Mapped[int] = mapped_column(SmallInteger, default=0)
    monster_kill: Mapped[int] = mapped_column(SmallInteger, default=0)
    player_deaths: Mapped[int] = mapped_column(SmallInteger, default=0)
    team_kill: Mapped[int] = mapped_column(SmallInteger, default=0)
    total_field_kill: Mapped[int] = mapped_column(SmallInteger, default=0)
    team_elimination: Mapped[int] = mapped_column(SmallInteger, default=0)
    team_down: Mapped[int] = mapped_column(SmallInteger, default=0)
    team_battle_zone_down: Mapped[int] = mapped_column(SmallInteger, default=0)
    team_repeat_down: Mapped[int] = mapped_column(SmallInteger, default=0)

    # 멀티킬
    total_double_kill: Mapped[int] = mapped_column(SmallInteger, default=0)
    total_triple_kill: Mapped[int] = mapped_column(SmallInteger, default=0)
    total_quadra_kill: Mapped[int] = mapped_column(SmallInteger, default=0)
    total_extra_kill: Mapped[int] = mapped_column(SmallInteger, default=0)
    kill_gamma: Mapped[bool] = mapped_column(Boolean, default=False)

    # 페이즈별 킬/데스
    kills_phase_one: Mapped[int] = mapped_column(SmallInteger, default=0)
    kills_phase_two: Mapped[int] = mapped_column(SmallInteger, default=0)
    kills_phase_three: Mapped[int] = mapped_column(SmallInteger, default=0)
    deaths_phase_one: Mapped[int] = mapped_column(SmallInteger, default=0)
    deaths_phase_two: Mapped[int] = mapped_column(SmallInteger, default=0)
    deaths_phase_three: Mapped[int] = mapped_column(SmallInteger, default=0)

    # ── 무기
    best_weapon: Mapped[int] = mapped_column(Integer, default=0)
    best_weapon_level: Mapped[int] = mapped_column(SmallInteger, default=0)

    # ── 시간 (초 단위)
    play_time: Mapped[int] = mapped_column(Integer, default=0)
    watch_time: Mapped[int] = mapped_column(Integer, default=0)
    total_time: Mapped[int] = mapped_column(Integer, default=0)
    survivable_time: Mapped[int] = mapped_column(Integer, default=0)

    # ── MMR
    mmr_before: Mapped[int] = mapped_column(Integer, default=0)
    mmr_gain: Mapped[int] = mapped_column(Integer, default=0)
    mmr_after: Mapped[int] = mapped_column(Integer, default=0)
    rank_point: Mapped[int] = mapped_column(Integer, default=0)
    gained_normal_mmr_k_factor: Mapped[float] = mapped_column(Numeric(8, 4), default=0)

    # ── 최종 스탯
    max_hp: Mapped[int] = mapped_column(Integer, default=0)
    max_sp: Mapped[int] = mapped_column(Integer, default=0)
    attack_power: Mapped[float] = mapped_column(Numeric(8, 2), default=0)
    defense: Mapped[float] = mapped_column(Numeric(8, 2), default=0)
    hp_regen: Mapped[float] = mapped_column(Numeric(8, 4), default=0)
    sp_regen: Mapped[float] = mapped_column(Numeric(8, 4), default=0)
    attack_speed: Mapped[float] = mapped_column(Numeric(6, 4), default=0)
    move_speed: Mapped[float] = mapped_column(Numeric(6, 4), default=0)
    out_of_combat_move_speed: Mapped[float] = mapped_column(Numeric(6, 4), default=0)
    sight_range: Mapped[float] = mapped_column(Numeric(6, 2), default=0)
    attack_range: Mapped[float] = mapped_column(Numeric(6, 2), default=0)
    critical_strike_chance: Mapped[float] = mapped_column(Numeric(6, 4), default=0)
    critical_strike_damage: Mapped[float] = mapped_column(Numeric(6, 4), default=0)
    cool_down_reduction: Mapped[float] = mapped_column(Numeric(6, 4), default=0)
    life_steal: Mapped[float] = mapped_column(Numeric(6, 4), default=0)
    normal_life_steal: Mapped[float] = mapped_column(Numeric(6, 4), default=0)
    skill_life_steal: Mapped[float] = mapped_column(Numeric(6, 4), default=0)
    amplifier_to_monster: Mapped[float] = mapped_column(Numeric(8, 2), default=0)
    trap_damage: Mapped[float] = mapped_column(Numeric(8, 2), default=0)
    adaptive_force: Mapped[float] = mapped_column(Numeric(8, 2), default=0)
    adaptive_force_attack: Mapped[float] = mapped_column(Numeric(8, 2), default=0)
    adaptive_force_amplify: Mapped[float] = mapped_column(Numeric(8, 2), default=0)
    skill_amp: Mapped[float] = mapped_column(Numeric(8, 2), default=0)

    # ── 플레이어 대상 데미지
    damage_to_player: Mapped[int] = mapped_column(BigInteger, default=0)
    damage_to_player_trap: Mapped[int] = mapped_column(BigInteger, default=0)
    damage_to_player_basic: Mapped[int] = mapped_column(BigInteger, default=0)
    damage_to_player_skill: Mapped[int] = mapped_column(BigInteger, default=0)
    damage_to_player_item_skill: Mapped[int] = mapped_column(BigInteger, default=0)
    damage_to_player_direct: Mapped[int] = mapped_column(BigInteger, default=0)
    damage_to_player_unique_skill: Mapped[int] = mapped_column(BigInteger, default=0)
    damage_to_player_shield: Mapped[int] = mapped_column(BigInteger, default=0)

    # ── 플레이어에게 받은 데미지
    damage_from_player: Mapped[int] = mapped_column(BigInteger, default=0)
    damage_from_player_trap: Mapped[int] = mapped_column(BigInteger, default=0)
    damage_from_player_basic: Mapped[int] = mapped_column(BigInteger, default=0)
    damage_from_player_skill: Mapped[int] = mapped_column(BigInteger, default=0)
    damage_from_player_item_skill: Mapped[int] = mapped_column(BigInteger, default=0)
    damage_from_player_direct: Mapped[int] = mapped_column(BigInteger, default=0)
    damage_from_player_unique_skill: Mapped[int] = mapped_column(BigInteger, default=0)

    # ── 몬스터 대상 / 수신 데미지
    damage_to_monster: Mapped[int] = mapped_column(BigInteger, default=0)
    damage_to_monster_trap: Mapped[int] = mapped_column(BigInteger, default=0)
    damage_to_monster_basic: Mapped[int] = mapped_column(BigInteger, default=0)
    damage_to_monster_skill: Mapped[int] = mapped_column(BigInteger, default=0)
    damage_to_monster_item_skill: Mapped[int] = mapped_column(BigInteger, default=0)
    damage_to_monster_direct: Mapped[int] = mapped_column(BigInteger, default=0)
    damage_to_monster_unique_skill: Mapped[int] = mapped_column(BigInteger, default=0)
    damage_from_monster: Mapped[int] = mapped_column(BigInteger, default=0)
    damage_offset_by_shield_player: Mapped[int] = mapped_column(BigInteger, default=0)
    damage_offset_by_shield_monster: Mapped[int] = mapped_column(BigInteger, default=0)

    # ── 회복 / 보호막 / CC
    heal_amount: Mapped[int] = mapped_column(Integer, default=0)
    team_recover: Mapped[int] = mapped_column(Integer, default=0)
    protect_absorb: Mapped[int] = mapped_column(Integer, default=0)
    cc_time_to_player: Mapped[float] = mapped_column(Float, default=0.0)

    # ── 제작
    craft_uncommon: Mapped[int] = mapped_column(SmallInteger, default=0)
    craft_rare: Mapped[int] = mapped_column(SmallInteger, default=0)
    craft_epic: Mapped[int] = mapped_column(SmallInteger, default=0)
    craft_legend: Mapped[int] = mapped_column(SmallInteger, default=0)
    craft_mythic: Mapped[int] = mapped_column(SmallInteger, default=0)

    # ── 경험치
    gain_exp: Mapped[int] = mapped_column(Integer, default=0)
    base_exp: Mapped[int] = mapped_column(Integer, default=0)
    bonus_exp: Mapped[int] = mapped_column(Integer, default=0)
    bonus_coin: Mapped[int] = mapped_column(Integer, default=0)

    # ── 오브젝트 / 맵 상호작용
    add_surveillance_camera: Mapped[int] = mapped_column(SmallInteger, default=0)
    add_telephoto_camera: Mapped[int] = mapped_column(SmallInteger, default=0)
    remove_surveillance_camera: Mapped[int] = mapped_column(SmallInteger, default=0)
    remove_telephoto_camera: Mapped[int] = mapped_column(SmallInteger, default=0)
    use_hyper_loop: Mapped[int] = mapped_column(SmallInteger, default=0)
    use_security_console: Mapped[int] = mapped_column(SmallInteger, default=0)
    used_pair_loop: Mapped[int] = mapped_column(SmallInteger, default=0)
    total_turbine_take_over: Mapped[int] = mapped_column(SmallInteger, default=0)
    fishing_count: Mapped[int] = mapped_column(SmallInteger, default=0)
    use_emoticon_count: Mapped[int] = mapped_column(SmallInteger, default=0)

    # ── 전술 스킬
    tactical_skill_group: Mapped[int] = mapped_column(Integer, default=0)
    tactical_skill_level: Mapped[int] = mapped_column(SmallInteger, default=0)

    # ── 치료팩 / 실드팩
    used_normal_heal_pack: Mapped[int] = mapped_column(SmallInteger, default=0)
    used_reinforced_heal_pack: Mapped[int] = mapped_column(SmallInteger, default=0)
    used_normal_shield_pack: Mapped[int] = mapped_column(SmallInteger, default=0)
    used_reinforce_shield_pack: Mapped[int] = mapped_column(SmallInteger, default=0)

    # ── 루트
    route_id_of_start: Mapped[int] = mapped_column(Integer, default=0)
    route_slot_id: Mapped[int] = mapped_column(SmallInteger, default=0)
    place_of_start: Mapped[str] = mapped_column(String(10), default="")

    # ── 배틀존 요약
    battle_zone_player_kill: Mapped[int] = mapped_column(SmallInteger, default=0)
    battle_zone_deaths: Mapped[int] = mapped_column(SmallInteger, default=0)

    # ── VF 크레딧 요약
    total_gain_vf_credit: Mapped[int] = mapped_column(Integer, default=0)
    total_use_vf_credit: Mapped[int] = mapped_column(Integer, default=0)
    sum_used_vf_credits: Mapped[int] = mapped_column(Integer, default=0)
    actively_gained_credits: Mapped[int] = mapped_column(Integer, default=0)
    kill_player_gain_vf_credit: Mapped[int] = mapped_column(Integer, default=0)
    kill_chicken_gain_vf_credit: Mapped[int] = mapped_column(Integer, default=0)
    kill_boar_gain_vf_credit: Mapped[int] = mapped_column(Integer, default=0)
    kill_wild_dog_gain_vf_credit: Mapped[int] = mapped_column(Integer, default=0)
    kill_wolf_gain_vf_credit: Mapped[int] = mapped_column(Integer, default=0)
    kill_bear_gain_vf_credit: Mapped[int] = mapped_column(Integer, default=0)
    kill_omega_gain_vf_credit: Mapped[int] = mapped_column(Integer, default=0)
    kill_bat_gain_vf_credit: Mapped[int] = mapped_column(Integer, default=0)
    kill_wickline_gain_vf_credit: Mapped[int] = mapped_column(Integer, default=0)
    kill_alpha_gain_vf_credit: Mapped[int] = mapped_column(Integer, default=0)
    kill_item_bounty_gain_vf_credit: Mapped[int] = mapped_column(Integer, default=0)
    kill_drone_gain_vf_credit: Mapped[int] = mapped_column(Integer, default=0)
    kill_gamma_gain_vf_credit: Mapped[int] = mapped_column(Integer, default=0)
    kill_turret_gain_vf_credit: Mapped[int] = mapped_column(Integer, default=0)
    item_shredder_gain_vf_credit: Mapped[int] = mapped_column(Integer, default=0)
    remote_drone_use_vf_credit_myself: Mapped[int] = mapped_column(Integer, default=0)
    remote_drone_use_vf_credit_ally: Mapped[int] = mapped_column(Integer, default=0)
    transfer_console_from_material_use_vf_credit: Mapped[int] = mapped_column(Integer, default=0)
    transfer_console_from_escape_key_use_vf_credit: Mapped[int] = mapped_column(Integer, default=0)
    transfer_console_from_revival_use_vf_credit: Mapped[int] = mapped_column(Integer, default=0)
    tactical_skill_upgrade_use_vf_credit: Mapped[int] = mapped_column(Integer, default=0)
    infusion_reroll_use_vf_credit: Mapped[int] = mapped_column(Integer, default=0)
    infusion_trait_use_vf_credit: Mapped[int] = mapped_column(Integer, default=0)
    infusion_relic_use_vf_credit: Mapped[int] = mapped_column(Integer, default=0)
    infusion_store_use_vf_credit: Mapped[int] = mapped_column(Integer, default=0)

    # ── 서버 / 언어
    server_name: Mapped[str] = mapped_column(String(20), default="Asia")
    language: Mapped[str] = mapped_column(String(20), default="Korean")

    # ── JSONB 필드
    equipment: Mapped[dict] = mapped_column(JSONB, default=dict)
    equipment_grade: Mapped[dict] = mapped_column(JSONB, default=dict)
    mastery_level: Mapped[dict] = mapped_column(JSONB, default=dict)
    skill_level_info: Mapped[dict] = mapped_column(JSONB, default=dict)
    skill_order_info: Mapped[dict] = mapped_column(JSONB, default=dict)
    kill_monsters: Mapped[dict] = mapped_column(JSONB, default=dict)
    trait_first_core: Mapped[int] = mapped_column(Integer, default=0)
    trait_first_sub: Mapped[list] = mapped_column(JSONB, default=list)
    trait_second_sub: Mapped[list] = mapped_column(JSONB, default=list)
    air_supply_open_count: Mapped[list] = mapped_column(JSONB, default=list)
    food_craft_count: Mapped[list] = mapped_column(JSONB, default=list)
    beverage_craft_count: Mapped[list] = mapped_column(JSONB, default=list)
    total_vf_credits: Mapped[list] = mapped_column(JSONB, default=list)
    used_vf_credits: Mapped[list] = mapped_column(JSONB, default=list)
    scored_point: Mapped[list] = mapped_column(JSONB, default=list)
    credit_source: Mapped[dict] = mapped_column(JSONB, default=dict)
    event_mission_result: Mapped[dict] = mapped_column(JSONB, default=dict)
    item_transferred_console: Mapped[list] = mapped_column(JSONB, default=list)
    item_transferred_drone: Mapped[list] = mapped_column(JSONB, default=list)
    collect_item_for_log: Mapped[list] = mapped_column(JSONB, default=list)
    equip_first_item_for_log: Mapped[dict] = mapped_column(JSONB, default=dict)
    bought_infusion: Mapped[dict] = mapped_column(JSONB, default=dict)
    kill_details: Mapped[str] = mapped_column(Text, default="{}")
    death_details: Mapped[str] = mapped_column(Text, default="{}")
    expire_dtm: Mapped[str | None] = mapped_column(String(50), nullable=True)

    __table_args__ = (
        UniqueConstraint("game_id", "user_id", name="uq_game_user"),
    )

    # Relationships
    game: Mapped["Game"] = relationship("Game", back_populates="game_details")          # noqa: F821
    player: Mapped["Player"] = relationship("Player", back_populates="game_details")    # noqa: F821
    killers: Mapped[list["GameDetailKiller"]] = relationship(
        "GameDetailKiller", back_populates="game_detail", lazy="selectin", cascade="all, delete-orphan"
    )
    battle_zones: Mapped[list["GameDetailBattleZone"]] = relationship(
        "GameDetailBattleZone", back_populates="game_detail", lazy="selectin", cascade="all, delete-orphan"
    )

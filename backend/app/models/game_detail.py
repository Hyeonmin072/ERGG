from __future__ import annotations

from sqlalchemy import (
    BigInteger, Integer, SmallInteger, String, Float, Numeric,
    Boolean, Text, DateTime, ForeignKey, UniqueConstraint
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..core.database import Base


class GameDetail(Base):
    """게임당 플레이어 상세 통계 (핵심 테이블) — DB 컬럼명은 ER API camelCase"""
    __tablename__ = "game_details"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    game_id: Mapped[int] = mapped_column(
        "game_id",
        BigInteger,
        ForeignKey("games.game_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id: Mapped[str] = mapped_column(
        "user_id",
        String(200),
        ForeignKey("players.user_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    character_num: Mapped[int] = mapped_column("character_num", Integer, default=0)
    character_level: Mapped[int] = mapped_column("characterLevel", SmallInteger, default=0)
    skin_code: Mapped[int] = mapped_column("skinCode", Integer, default=0)

    game_rank: Mapped[int] = mapped_column("gameRank", SmallInteger, default=0)
    victory: Mapped[int] = mapped_column(SmallInteger, default=0)
    give_up: Mapped[int] = mapped_column("giveUp", SmallInteger, default=0)
    team_spectator: Mapped[int] = mapped_column("teamSpectator", SmallInteger, default=0)
    team_number: Mapped[int] = mapped_column("teamNumber", SmallInteger, default=0)
    pre_made: Mapped[int] = mapped_column("preMade", SmallInteger, default=0)
    escape_state: Mapped[int] = mapped_column("escapeState", SmallInteger, default=0)

    player_kill: Mapped[int] = mapped_column("playerKill", SmallInteger, default=0)
    player_assistant: Mapped[int] = mapped_column("playerAssistant", SmallInteger, default=0)
    monster_kill: Mapped[int] = mapped_column("monsterKill", SmallInteger, default=0)
    player_deaths: Mapped[int] = mapped_column("playerDeaths", SmallInteger, default=0)
    team_kill: Mapped[int] = mapped_column("teamKill", SmallInteger, default=0)
    total_field_kill: Mapped[int] = mapped_column("totalFieldKill", SmallInteger, default=0)
    team_elimination: Mapped[int] = mapped_column("teamElimination", SmallInteger, default=0)
    team_down: Mapped[int] = mapped_column("teamDown", SmallInteger, default=0)
    team_battle_zone_down: Mapped[int] = mapped_column("teamBattleZoneDown", SmallInteger, default=0)
    team_repeat_down: Mapped[int] = mapped_column("teamRepeatDown", SmallInteger, default=0)

    total_double_kill: Mapped[int] = mapped_column("totalDoubleKill", SmallInteger, default=0)
    total_triple_kill: Mapped[int] = mapped_column("totalTripleKill", SmallInteger, default=0)
    total_quadra_kill: Mapped[int] = mapped_column("totalQuadraKill", SmallInteger, default=0)
    total_extra_kill: Mapped[int] = mapped_column("totalExtraKill", SmallInteger, default=0)
    kill_gamma: Mapped[bool] = mapped_column("killGamma", Boolean, default=False)

    kills_phase_one: Mapped[int] = mapped_column("killsPhaseOne", SmallInteger, default=0)
    kills_phase_two: Mapped[int] = mapped_column("killsPhaseTwo", SmallInteger, default=0)
    kills_phase_three: Mapped[int] = mapped_column("killsPhaseThree", SmallInteger, default=0)
    deaths_phase_one: Mapped[int] = mapped_column("deathsPhaseOne", SmallInteger, default=0)
    deaths_phase_two: Mapped[int] = mapped_column("deathsPhaseTwo", SmallInteger, default=0)
    deaths_phase_three: Mapped[int] = mapped_column("deathsPhaseThree", SmallInteger, default=0)

    best_weapon: Mapped[int] = mapped_column("bestWeapon", Integer, default=0)
    best_weapon_level: Mapped[int] = mapped_column("bestWeaponLevel", SmallInteger, default=0)

    play_time: Mapped[int] = mapped_column("playTime", Integer, default=0)
    watch_time: Mapped[int] = mapped_column("watchTime", Integer, default=0)
    total_time: Mapped[int] = mapped_column("totalTime", Integer, default=0)
    survivable_time: Mapped[int] = mapped_column("survivableTime", Integer, default=0)

    mmr_before: Mapped[int] = mapped_column("mmrBefore", Integer, default=0)
    mmr_gain: Mapped[int] = mapped_column("mmrGain", Integer, default=0)
    mmr_after: Mapped[int] = mapped_column("mmrAfter", Integer, default=0)
    rank_point: Mapped[int] = mapped_column("rankPoint", Integer, default=0)
    gained_normal_mmr_k_factor: Mapped[float] = mapped_column(
        "gainedNormalMmrKFactor", Numeric(8, 4), default=0
    )

    max_hp: Mapped[int] = mapped_column("maxHp", Integer, default=0)
    max_sp: Mapped[int] = mapped_column("maxSp", Integer, default=0)
    attack_power: Mapped[float] = mapped_column("attackPower", Numeric(8, 2), default=0)
    defense: Mapped[float] = mapped_column(Numeric(8, 2), default=0)
    hp_regen: Mapped[float] = mapped_column("hpRegen", Numeric(8, 4), default=0)
    sp_regen: Mapped[float] = mapped_column("spRegen", Numeric(8, 4), default=0)
    attack_speed: Mapped[float] = mapped_column("attackSpeed", Numeric(6, 4), default=0)
    move_speed: Mapped[float] = mapped_column("moveSpeed", Numeric(6, 4), default=0)
    out_of_combat_move_speed: Mapped[float] = mapped_column(
        "outOfCombatMoveSpeed", Numeric(6, 4), default=0
    )
    sight_range: Mapped[float] = mapped_column("sightRange", Numeric(6, 2), default=0)
    attack_range: Mapped[float] = mapped_column("attackRange", Numeric(6, 2), default=0)
    critical_strike_chance: Mapped[float] = mapped_column(
        "criticalStrikeChance", Numeric(6, 4), default=0
    )
    critical_strike_damage: Mapped[float] = mapped_column(
        "criticalStrikeDamage", Numeric(6, 4), default=0
    )
    cool_down_reduction: Mapped[float] = mapped_column("coolDownReduction", Numeric(6, 4), default=0)
    life_steal: Mapped[float] = mapped_column("lifeSteal", Numeric(6, 4), default=0)
    normal_life_steal: Mapped[float] = mapped_column("normalLifeSteal", Numeric(6, 4), default=0)
    skill_life_steal: Mapped[float] = mapped_column("skillLifeSteal", Numeric(6, 4), default=0)
    amplifier_to_monster: Mapped[float] = mapped_column("amplifierToMonster", Numeric(8, 2), default=0)
    trap_damage: Mapped[float] = mapped_column("trapDamage", Numeric(8, 2), default=0)
    adaptive_force: Mapped[float] = mapped_column("adaptiveForce", Numeric(8, 2), default=0)
    adaptive_force_attack: Mapped[float] = mapped_column("adaptiveForceAttack", Numeric(8, 2), default=0)
    adaptive_force_amplify: Mapped[float] = mapped_column("adaptiveForceAmplify", Numeric(8, 2), default=0)
    skill_amp: Mapped[float] = mapped_column("skillAmp", Numeric(8, 2), default=0)

    damage_to_player: Mapped[int] = mapped_column("damageToPlayer", BigInteger, default=0)
    damage_to_player_trap: Mapped[int] = mapped_column("damageToPlayer_trap", BigInteger, default=0)
    damage_to_player_basic: Mapped[int] = mapped_column("damageToPlayer_basic", BigInteger, default=0)
    damage_to_player_skill: Mapped[int] = mapped_column("damageToPlayer_skill", BigInteger, default=0)
    damage_to_player_item_skill: Mapped[int] = mapped_column(
        "damageToPlayer_itemSkill", BigInteger, default=0
    )
    damage_to_player_direct: Mapped[int] = mapped_column("damageToPlayer_direct", BigInteger, default=0)
    damage_to_player_unique_skill: Mapped[int] = mapped_column(
        "damageToPlayer_uniqueSkill", BigInteger, default=0
    )
    damage_to_player_shield: Mapped[int] = mapped_column("damageToPlayer_Shield", BigInteger, default=0)

    damage_from_player: Mapped[int] = mapped_column("damageFromPlayer", BigInteger, default=0)
    damage_from_player_trap: Mapped[int] = mapped_column("damageFromPlayer_trap", BigInteger, default=0)
    damage_from_player_basic: Mapped[int] = mapped_column("damageFromPlayer_basic", BigInteger, default=0)
    damage_from_player_skill: Mapped[int] = mapped_column("damageFromPlayer_skill", BigInteger, default=0)
    damage_from_player_item_skill: Mapped[int] = mapped_column(
        "damageFromPlayer_itemSkill", BigInteger, default=0
    )
    damage_from_player_direct: Mapped[int] = mapped_column("damageFromPlayer_direct", BigInteger, default=0)
    damage_from_player_unique_skill: Mapped[int] = mapped_column(
        "damageFromPlayer_uniqueSkill", BigInteger, default=0
    )

    damage_to_monster: Mapped[int] = mapped_column("damageToMonster", BigInteger, default=0)
    damage_to_monster_trap: Mapped[int] = mapped_column("damageToMonster_trap", BigInteger, default=0)
    damage_to_monster_basic: Mapped[int] = mapped_column("damageToMonster_basic", BigInteger, default=0)
    damage_to_monster_skill: Mapped[int] = mapped_column("damageToMonster_skill", BigInteger, default=0)
    damage_to_monster_item_skill: Mapped[int] = mapped_column(
        "damageToMonster_itemSkill", BigInteger, default=0
    )
    damage_to_monster_direct: Mapped[int] = mapped_column("damageToMonster_direct", BigInteger, default=0)
    damage_to_monster_unique_skill: Mapped[int] = mapped_column(
        "damageToMonster_uniqueSkill", BigInteger, default=0
    )
    damage_from_monster: Mapped[int] = mapped_column("damageFromMonster", BigInteger, default=0)
    damage_offset_by_shield_player: Mapped[int] = mapped_column(
        "damageOffsetedByShield_Player", BigInteger, default=0
    )
    damage_offset_by_shield_monster: Mapped[int] = mapped_column(
        "damageOffsetedByShield_Monster", BigInteger, default=0
    )

    heal_amount: Mapped[int] = mapped_column("healAmount", Integer, default=0)
    team_recover: Mapped[int] = mapped_column("teamRecover", Integer, default=0)
    protect_absorb: Mapped[int] = mapped_column("protectAbsorb", Integer, default=0)
    cc_time_to_player: Mapped[float] = mapped_column("ccTimeToPlayer", Float, default=0.0)

    craft_uncommon: Mapped[int] = mapped_column("craftUncommon", SmallInteger, default=0)
    craft_rare: Mapped[int] = mapped_column("craftRare", SmallInteger, default=0)
    craft_epic: Mapped[int] = mapped_column("craftEpic", SmallInteger, default=0)
    craft_legend: Mapped[int] = mapped_column("craftLegend", SmallInteger, default=0)
    craft_mythic: Mapped[int] = mapped_column("craftMythic", SmallInteger, default=0)

    gain_exp: Mapped[int] = mapped_column("gainExp", Integer, default=0)
    base_exp: Mapped[int] = mapped_column("baseExp", Integer, default=0)
    bonus_exp: Mapped[int] = mapped_column("bonusExp", Integer, default=0)
    bonus_coin: Mapped[int] = mapped_column("bonusCoin", Integer, default=0)

    add_surveillance_camera: Mapped[int] = mapped_column("addSurveillanceCamera", SmallInteger, default=0)
    add_telephoto_camera: Mapped[int] = mapped_column("addTelephotoCamera", SmallInteger, default=0)
    remove_surveillance_camera: Mapped[int] = mapped_column(
        "removeSurveillanceCamera", SmallInteger, default=0
    )
    remove_telephoto_camera: Mapped[int] = mapped_column("removeTelephotoCamera", SmallInteger, default=0)
    use_hyper_loop: Mapped[int] = mapped_column("useHyperLoop", SmallInteger, default=0)
    use_security_console: Mapped[int] = mapped_column("useSecurityConsole", SmallInteger, default=0)
    used_pair_loop: Mapped[int] = mapped_column("usedPairLoop", SmallInteger, default=0)
    total_turbine_take_over: Mapped[int] = mapped_column("totalTurbineTakeOver", SmallInteger, default=0)
    fishing_count: Mapped[int] = mapped_column("fishingCount", SmallInteger, default=0)
    use_emoticon_count: Mapped[int] = mapped_column("useEmoticonCount", SmallInteger, default=0)

    tactical_skill_group: Mapped[int] = mapped_column("tacticalSkillGroup", Integer, default=0)
    tactical_skill_level: Mapped[int] = mapped_column("tacticalSkillLevel", SmallInteger, default=0)

    used_normal_heal_pack: Mapped[int] = mapped_column("usedNormalHealPack", SmallInteger, default=0)
    used_reinforced_heal_pack: Mapped[int] = mapped_column(
        "usedReinforcedHealPack", SmallInteger, default=0
    )
    used_normal_shield_pack: Mapped[int] = mapped_column("usedNormalShieldPack", SmallInteger, default=0)
    used_reinforce_shield_pack: Mapped[int] = mapped_column(
        "usedReinforceShieldPack", SmallInteger, default=0
    )

    route_id_of_start: Mapped[int] = mapped_column("routeIdOfStart", Integer, default=0)
    route_slot_id: Mapped[int] = mapped_column("routeSlotId", SmallInteger, default=0)
    place_of_start: Mapped[str] = mapped_column("placeOfStart", String(10), default="")

    battle_zone_player_kill: Mapped[int] = mapped_column("battleZonePlayerKill", SmallInteger, default=0)
    battle_zone_deaths: Mapped[int] = mapped_column("battleZoneDeaths", SmallInteger, default=0)

    total_gain_vf_credit: Mapped[int] = mapped_column("totalGainVFCredit", Integer, default=0)
    total_use_vf_credit: Mapped[int] = mapped_column("totalUseVFCredit", Integer, default=0)
    sum_used_vf_credits: Mapped[int] = mapped_column("sumUsedVFCredits", Integer, default=0)
    actively_gained_credits: Mapped[int] = mapped_column("activelyGainedCredits", Integer, default=0)
    kill_player_gain_vf_credit: Mapped[int] = mapped_column("killPlayerGainVFCredit", Integer, default=0)
    kill_chicken_gain_vf_credit: Mapped[int] = mapped_column("killChickenGainVFCredit", Integer, default=0)
    kill_boar_gain_vf_credit: Mapped[int] = mapped_column("killBoarGainVFCredit", Integer, default=0)
    kill_wild_dog_gain_vf_credit: Mapped[int] = mapped_column("killWildDogGainVFCredit", Integer, default=0)
    kill_wolf_gain_vf_credit: Mapped[int] = mapped_column("killWolfGainVFCredit", Integer, default=0)
    kill_bear_gain_vf_credit: Mapped[int] = mapped_column("killBearGainVFCredit", Integer, default=0)
    kill_omega_gain_vf_credit: Mapped[int] = mapped_column("killOmegaGainVFCredit", Integer, default=0)
    kill_bat_gain_vf_credit: Mapped[int] = mapped_column("killBatGainVFCredit", Integer, default=0)
    kill_wickline_gain_vf_credit: Mapped[int] = mapped_column("killWicklineGainVFCredit", Integer, default=0)
    kill_alpha_gain_vf_credit: Mapped[int] = mapped_column("killAlphaGainVFCredit", Integer, default=0)
    kill_item_bounty_gain_vf_credit: Mapped[int] = mapped_column(
        "killItemBountyGainVFCredit", Integer, default=0
    )
    kill_drone_gain_vf_credit: Mapped[int] = mapped_column("killDroneGainVFCredit", Integer, default=0)
    kill_gamma_gain_vf_credit: Mapped[int] = mapped_column("killGammaGainVFCredit", Integer, default=0)
    kill_turret_gain_vf_credit: Mapped[int] = mapped_column("killTurretGainVFCredit", Integer, default=0)
    item_shredder_gain_vf_credit: Mapped[int] = mapped_column("itemShredderGainVFCredit", Integer, default=0)
    remote_drone_use_vf_credit_myself: Mapped[int] = mapped_column(
        "remoteDroneUseVFCreditMySelf", Integer, default=0
    )
    remote_drone_use_vf_credit_ally: Mapped[int] = mapped_column(
        "remoteDroneUseVFCreditAlly", Integer, default=0
    )
    transfer_console_from_material_use_vf_credit: Mapped[int] = mapped_column(
        "transferConsoleFromMaterialUseVFCredit", Integer, default=0
    )
    transfer_console_from_escape_key_use_vf_credit: Mapped[int] = mapped_column(
        "transferConsoleFromEscapeKeyUseVFCredit", Integer, default=0
    )
    transfer_console_from_revival_use_vf_credit: Mapped[int] = mapped_column(
        "transferConsoleFromRevivalUseVFCredit", Integer, default=0
    )
    tactical_skill_upgrade_use_vf_credit: Mapped[int] = mapped_column(
        "tacticalSkillUpgradeUseVFCredit", Integer, default=0
    )
    infusion_reroll_use_vf_credit: Mapped[int] = mapped_column(
        "infusionReRollUseVFCredit", Integer, default=0
    )
    infusion_trait_use_vf_credit: Mapped[int] = mapped_column(
        "infusionTraitUseVFCredit", Integer, default=0
    )
    infusion_relic_use_vf_credit: Mapped[int] = mapped_column(
        "infusionRelicUseVFCredit", Integer, default=0
    )
    infusion_store_use_vf_credit: Mapped[int] = mapped_column(
        "infusionStoreUseVFCredit", Integer, default=0
    )

    server_name: Mapped[str] = mapped_column("serverName", String(20), default="Asia")
    language: Mapped[str] = mapped_column(String(20), default="Korean")

    equipment: Mapped[dict] = mapped_column(JSONB, default=dict)
    equipment_grade: Mapped[dict] = mapped_column("equipmentGrade", JSONB, default=dict)
    mastery_level: Mapped[dict] = mapped_column("masteryLevel", JSONB, default=dict)
    skill_level_info: Mapped[dict] = mapped_column("skillLevelInfo", JSONB, default=dict)
    skill_order_info: Mapped[dict] = mapped_column("skillOrderInfo", JSONB, default=dict)
    kill_monsters: Mapped[dict] = mapped_column("killMonsters", JSONB, default=dict)
    trait_first_core: Mapped[int] = mapped_column("traitFirstCore", Integer, default=0)
    trait_first_sub: Mapped[list] = mapped_column("traitFirstSub", JSONB, default=list)
    trait_second_sub: Mapped[list] = mapped_column("traitSecondSub", JSONB, default=list)
    air_supply_open_count: Mapped[list] = mapped_column("airSupplyOpenCount", JSONB, default=list)
    food_craft_count: Mapped[list] = mapped_column("foodCraftCount", JSONB, default=list)
    beverage_craft_count: Mapped[list] = mapped_column("beverageCraftCount", JSONB, default=list)
    total_vf_credits: Mapped[list] = mapped_column("totalVFCredits", JSONB, default=list)
    used_vf_credits: Mapped[list] = mapped_column("usedVFCredits", JSONB, default=list)
    scored_point: Mapped[list] = mapped_column("scoredPoint", JSONB, default=list)
    credit_source: Mapped[dict] = mapped_column("creditSource", JSONB, default=dict)
    event_mission_result: Mapped[dict] = mapped_column("eventMissionResult", JSONB, default=dict)
    item_transferred_console: Mapped[list] = mapped_column("itemTransferredConsole", JSONB, default=list)
    item_transferred_drone: Mapped[list] = mapped_column("itemTransferredDrone", JSONB, default=list)
    collect_item_for_log: Mapped[list] = mapped_column("collectItemForLog", JSONB, default=list)
    equip_first_item_for_log: Mapped[dict] = mapped_column("equipFirstItemForLog", JSONB, default=dict)
    bought_infusion: Mapped[dict] = mapped_column("boughtInfusion", JSONB, default=dict)
    kill_details: Mapped[str] = mapped_column("killDetails", Text, default="{}")
    death_details: Mapped[str] = mapped_column("deathDetails", Text, default="{}")
    expire_dtm: Mapped[object | None] = mapped_column("expireDtm", DateTime(timezone=True), nullable=True)

    __table_args__ = (
        UniqueConstraint("gameId", "userId", name="uq_game_user"),
    )

    game: Mapped["Game"] = relationship("Game", back_populates="game_details")          # noqa: F821
    player: Mapped["Player"] = relationship("Player", back_populates="game_details")    # noqa: F821
    killers: Mapped[list["GameDetailKiller"]] = relationship(
        "GameDetailKiller", back_populates="game_detail", lazy="selectin", cascade="all, delete-orphan"
    )
    battle_zones: Mapped[list["GameDetailBattleZone"]] = relationship(
        "GameDetailBattleZone", back_populates="game_detail", lazy="selectin", cascade="all, delete-orphan"
    )

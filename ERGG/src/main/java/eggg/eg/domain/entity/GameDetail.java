package eggg.eg.domain.entity;

import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class GameDetail {

    @Id
    private int gameDetailId;

    @ManyToOne
    private Game game;

    private int gameRank;
    private int playerKill;
    private int playerAssistant;
    private int monsterKill;
    private int bestWeapon;
    private int bestWeaponLevel;
    private String serverName;

    private int maxHp;
    private int maxSp;
    private int attackPower;
    private int defense;
    private double hpRegen;
    private double spRegen;
    private double attackSpeed;
    private double moveSpeed;
    private double outOfCombatMoveSpeed;
    private double sightRange;
    private double attackRange;
    private int criticalStrikeChance;
    private int criticalStrikeDamage;
    private int coolDownReduction;
    private int lifeSteal;
    private int normalLifeSteal;
    private int amplifierToMonster;
    private int trapDamage;
    private int bonusCoin;
}

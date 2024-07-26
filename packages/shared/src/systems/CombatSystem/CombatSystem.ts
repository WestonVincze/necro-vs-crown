import {
  addComponent,
  defineQuery,
  entityExists,
  getRelationTargets,
  hasComponent,
  Not,
} from "bitecs";
import {
  Armor,
  AttackBonus,
  AttackCooldown,
  AttackRange,
  AttackSpeed,
  CritChance,
  CritDamage,
  Crown,
  DamageBonus,
  Health,
  MaxHit,
  Necro,
  Position,
  Transform,
} from "../../components";
import { checkIfWithinDistance, getPositionFromEid } from "../../utils";
import { CombatTarget } from "../../relations";
import { gameEvents } from "../../events";
import { RangedUnit } from "../../components";
import { createProjectileEntity, ProjectileName } from "../../entities";

export const createCombatSystem = () => {
  const attackerQuery = defineQuery([
    CombatTarget("*"),
    AttackSpeed,
    AttackRange,
    MaxHit,
    Position,
    Not(AttackCooldown),
  ]);
  const necroQuery = defineQuery([Necro, Health, Position, Armor]);
  const crownQuery = defineQuery([Crown, Health, Position, Armor]);

  return (world: World) => {
    for (const eid of attackerQuery(world)) {
      const targetEid = getRelationTargets(world, CombatTarget, eid)[0];
      const attackerPosition = getPositionFromEid(eid);
      const targetPosition = getPositionFromEid(targetEid);

      // TODO: accommodate for actual dimensions of sprites?
      // ranged units will also need to consider LoS
      if (
        !checkIfWithinDistance(
          attackerPosition,
          targetPosition,
          AttackRange.current[eid] + 30,
        )
      )
        continue;

      const attackBonus = AttackBonus.current[eid];
      const maxHit = MaxHit.current[eid];
      const damageBonus = DamageBonus.current[eid];
      const critChance = CritChance.current[eid];
      const critDamage = CritDamage.current[eid];

      const damage = rollDamage(maxHit, damageBonus, critChance, critDamage);

      if (hasComponent(world, RangedUnit, eid)) {
        // TODO: store data for commonly used offsets or create helper functions
        targetPosition.y -= Transform.height[targetEid] / 2;
        // set spawn point of the projectile based on entity position and spawn position offset
        attackerPosition.x += RangedUnit.spawnPositionOffsetX[eid];
        attackerPosition.y += RangedUnit.spawnPositionOffsetY[eid];
        // pre-roll damage
        // create arrow entity -- check the ranged unit for the type of projectile it should instantiate
        createProjectileEntity(
          world,
          ProjectileName.Arrow,
          attackerPosition,
          targetPosition,
          attackBonus,
          damage,
        );
      } else {
        attackEntity(world, targetEid, attackBonus, damage);
      }
      addComponent(world, AttackCooldown, eid);
      // TODO: move AttackSpeed (and perhaps other cooldowns) to a tick based system?
      AttackCooldown.ready[eid] =
        AttackSpeed.current[eid] * 200 + world.time.elapsed;
    }

    return world;
  };
};

/**
 * @returns `true` if the attack was **rolled**, `false` otherwise
 */
export const attackEntity = (
  world: World,
  targetEid: number,
  attackBonus: number,
  damage: number,
): boolean => {
  if (!entityExists(world, targetEid)) {
    console.debug(`Attack Failed: Target ${targetEid} does not exist.`);
    return false;
  }

  // TODO: consider using a "targetQuery" to check for Armor and Health, then use targets.includes(targetEid) (potentially better performance)
  // alternatively, we could add an "AttackRoll" component to queue the attack and defer the rest of this logic to another system
  if (
    !hasComponent(world, Armor, targetEid) ||
    !hasComponent(world, Health, targetEid)
  ) {
    console.debug(
      `Attack Failed: Target ${targetEid} is missing Health or Armor.`,
    );
    return false;
  }

  const amount = rollToHit(Armor.current[targetEid], attackBonus)
    ? damage * -1
    : 0;

  gameEvents.emitHealthChange({ eid: targetEid, amount });

  return true;
};

export const rollDamage = (
  maxHit: number,
  damageBonus: number,
  critChance?: number,
  critDamage: number = 1,
): number => {
  let damage = 0;
  let critMod = 1;

  damage = rollDice(maxHit, damageBonus);

  if (damage > 0 && critChance && rollToCrit(critChance)) {
    console.log("CRIT");
    critMod = critDamage;
  }

  return (damage *= critMod);
};

export const rollDice = (sides: number, bonus = 0) => {
  return Math.floor(Math.random() * (sides - 1)) + 1 + bonus;
};

export const rollToHit = (difficulty: number, bonus = 0) => {
  console.log(difficulty, bonus);
  return rollDice(20, bonus) >= difficulty;
};

export const rollToCrit = (critChance: number) => {
  return rollDice(100) + critChance >= 100;
};

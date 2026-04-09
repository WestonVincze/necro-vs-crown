import {
  addComponent,
  query,
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
  Damage,
  DamageBonus,
  Health,
  MaxHit,
  Necro,
  Position,
  Transform,
  RangedUnit,
  LifeSteal,
  Heal,
  Knockback,
  ExternalForce,
  Stunned,
} from "../../components";
import {
  checkIfWithinDistance,
  getPositionFromEid,
  normalizeForce,
} from "../../utils";
import { CombatTarget } from "../../relations";
import { createProjectileEntity, ProjectileName } from "../../entities";
import { rollDamage, rollToHit } from "../../utils";
import { type World } from "../../types";

/**
 * TODO: break down in more isolated systems
 * * AttackIntentSystem - checks cooldowns / attack speed and emits DamageEvent (with attack stats snapshotted)
 * * HitResolutionSystem - reads damageEvent, evaluates hit
 * * EffectSystem - handles effects and special cases
 * *
 */
export const createCombatSystem = () => {
  const attackerQuery = (world: World) =>
    query(world, [
      CombatTarget("*"),
      AttackSpeed,
      AttackRange,
      MaxHit,
      Position,
      Not(AttackCooldown),
    ]);

  return (world: World) => {
    for (const eid of attackerQuery(world)) {
      let wasAttackMade = false;
      const targetEid = getRelationTargets(world, eid, CombatTarget)[0];
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

      if (hasComponent(world, eid, RangedUnit)) {
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
        wasAttackMade = true;
      } else {
        const amount = attackEntity(world, targetEid, attackBonus, damage);

        wasAttackMade = !(amount === -1);

        /** EFFECTS */
        /* LifeSteal */
        if (amount > 0 && hasComponent(world, eid, LifeSteal)) {
          addComponent(world, eid, Heal);
          Heal.amount[eid] = LifeSteal.amount[eid] * amount;
        }

        /* Knockback */
        if (
          amount > 0 &&
          hasComponent(world, eid, Knockback) &&
          !hasComponent(world, targetEid, ExternalForce)
        ) {
          const duration = 100;
          const force = normalizeForce({
            x: targetPosition.x - attackerPosition.x,
            y: targetPosition.y - attackerPosition.y,
          });
          addComponent(world, targetEid, ExternalForce);
          ExternalForce.duration[targetEid] = duration;
          ExternalForce.x[targetEid] = force.x * Knockback.force[eid];
          ExternalForce.y[targetEid] = force.y * Knockback.force[eid];

          addComponent(world, targetEid, Stunned);
          Stunned.duration[targetEid] = duration;
        }
      }

      if (!wasAttackMade) continue;
      addComponent(world, eid, AttackCooldown);
      // TODO: move AttackSpeed (and perhaps other cooldowns) to a tick based system?
      AttackCooldown.timeUntilReady[eid] = AttackSpeed.current[eid] * 200;
    }

    return world;
  };
};

/**
 * If `targetEid` does not exist or does not have `Health` and `Armor` components the attack will not be rolled
 * Adds a `Damage` component to the target if the attack is rolled
 * @returns `true` if the attack was **rolled**, `false` otherwise
 */
export const attackEntity = (
  world: World,
  targetEid: number,
  attackBonus: number,
  damage: number,
): number => {
  if (!entityExists(world, targetEid)) {
    console.warn(`Attack Failed: Target ${targetEid} does not exist.`);
    return -1;
  }

  // TODO: consider using a "targetQuery" to check for Armor and Health, then use targets.includes(targetEid) (potentially better performance)
  // alternatively, we could add an "AttackRoll" component to queue the attack and defer the rest of this logic to another system
  if (
    !hasComponent(world, targetEid, Armor) ||
    !hasComponent(world, targetEid, Health)
  ) {
    console.warn(
      `Attack Failed: Target ${targetEid} is missing Health or Armor.`,
    );
    return -1;
  }

  const amount = rollToHit(Armor.current[targetEid], attackBonus) ? damage : 0;

  if (hasComponent(world, targetEid, Damage)) {
    Damage.amount[targetEid] += amount;
  } else {
    addComponent(world, targetEid, Damage);
    Damage.amount[targetEid] = amount;
  }

  return amount;
};

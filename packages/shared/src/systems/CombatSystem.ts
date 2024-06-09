import { defineQuery, defineSystem, hasComponent } from "bitecs";
import { Armor, AttackBonus, AttackRange, AttackSpeed, CritChance, CritDamage, Crown, DamageBonus, Health, MaxHit, Necro, Position, Target } from "../components";
import { checkIfWithinDistance } from "../utils/CollisionChecks";

export const createCombatSystem = () => {
  const attackerQuery = defineQuery([Target, AttackSpeed, AttackRange, MaxHit, Position]);
  const necroQuery = defineQuery([Necro, Health, Position, Armor]);
  const crownQuery = defineQuery([Crown, Health, Position, Armor]);
  return defineSystem(world => {
    const entities = attackerQuery(world);
    for (let i = 0; i < entities.length; i++) {
      const eid = entities[i];
      const targetEid = Target.eid[eid];
      const attacker = { x: Position.x[eid], y: Position.y[eid] };
      const target = { x: Position.x[targetEid], y: Position.y[targetEid] };

      if (!checkIfWithinDistance(attacker, target, AttackRange.current[eid])) continue;

      let damage = 0;
      let critMod = 1;

      if (!hasComponent(world, Armor, targetEid) || !hasComponent(world, Health, targetEid)) {
        console.debug(`Not found: Unable to attack with ${eid}, ${targetEid} is missing Health or Armor.`)
        continue;
      }

      if (rollToHit(Armor.current[targetEid], AttackBonus.current[eid])) {
        damage = rollDice(MaxHit.current[eid]);
      }

      if (damage > 0 &&
          hasComponent(world, CritChance, eid) &&
          hasComponent(world, CritDamage, eid) &&
          rollToCrit(CritChance.current[eid])) {
            critMod = CritDamage.current[eid];
      }

      damage = damage * critMod + DamageBonus.current[eid];
      // TODO: implement event emitter for that sweet, sweet reactive code
      Health.current[targetEid] -= damage;
    }

    return world;
  })
}

const rollDice = (sides: number, bonus = 0) => {
  return Math.floor(Math.random() * sides) + 1 + bonus;
}

const rollToHit = (difficulty: number, bonus = 0) => {
  return rollDice(20, bonus) >= difficulty;
}

const rollToCrit = (critChance: number) => {
  return rollDice(100) + critChance >= 100;
}

/**
export const attackTarget = (attackerStats, target) => {
  if (!target || !target.health) {
    console.error("invalid attack target")
    return false;
  }

  let damage = 0;
  let critMod = 1;

  if (rollToHit(target.stats.armor, attackerStats.attackBonus)) {
    damage = rollDice(attackerStats.maxHit);
  }

  if (damage > 0 && attackerStats.critChance && rollToCrit(attackerStats.critChance)) {
    critMod = attackerStats.critDamage;
  }

  damage = damage * critMod + attackerStats.damageBonus;
  target.health.takeDamage(damage, critMod > 1);

  // check for and apply effects like knockback...

  return true;
}
*/

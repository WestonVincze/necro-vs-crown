import { addComponent, defineQuery, entityExists, getRelationTargets, hasComponent, Not } from "bitecs";
import { Armor, AttackBonus, AttackCooldown, AttackRange, AttackSpeed, CritChance, CritDamage, Crown, DamageBonus, Health, MaxHit, Necro, Position } from "../components";
import { checkIfWithinDistance, getPositionFromEid } from "../utils";
import { CombatTarget } from "../relations";
import type { World } from "../types";
import { gameEvents } from "../events";
import { RangedUnit } from "../components";

export const createCombatSystem = () => {
  const attackerQuery = defineQuery([CombatTarget("*"), AttackSpeed, AttackRange, MaxHit, Position, Not(AttackCooldown)]);
  const necroQuery = defineQuery([Necro, Health, Position, Armor]);
  const crownQuery = defineQuery([Crown, Health, Position, Armor]);

  return (world: World) => {
    for (const eid of attackerQuery(world)) {
      const targetEid = getRelationTargets(world, CombatTarget, eid)[0];
      const attackerPosition = getPositionFromEid(eid);
      const targetPosition = getPositionFromEid(targetEid);

      // TODO: accommodate for actual dimensions of sprites?
      if (!checkIfWithinDistance(attackerPosition, targetPosition, AttackRange.current[eid] + 30)) continue;

      const attackBonus = AttackBonus.current[eid];
      const maxHit = MaxHit.current[eid];
      const damageBonus = DamageBonus.current[eid];
      const critChance = CritChance.current[eid];
      const critDamage = CritDamage.current[eid];
      console.log(critChance);
      if (hasComponent(world, RangedUnit, eid)) {
        // create arrow entity

      } else {
        attackEntity(world, targetEid, attackBonus, maxHit, damageBonus, critChance, critDamage);
      }
      addComponent(world, AttackCooldown, eid);
      // TODO: move AttackSpeed (and perhaps other cooldowns) to a tick based system?
      AttackCooldown.ready[eid] = (AttackSpeed.current[eid] * 200) + world.time.elapsed;
    }

    return world;
  }
}

const attackEntity = (
  world: World,
  targetEid: number,
  attackBonus: number,
  maxHit: number,
  damageBonus: number,
  critChance?: number,
  critDamage: number = 1,
): boolean => {
  let damage = 0;
  let critMod = 1;

  if (!entityExists(world, targetEid)) {
    console.debug(`Attack Failed: Target ${targetEid} does not exist.`)
    return false;
  }

  // TODO: consider using a "targetQuery" to check for Armor and Health, then use targets.includes(targetEid) (potentially better performance)
  // alternatively, we could add an "AttackRoll" component to queue the attack and defer the rest of this logic to another system
  if (!hasComponent(world, Armor, targetEid) || !hasComponent(world, Health, targetEid)) {
    console.debug(`Attack Failed: Target ${targetEid} is missing Health or Armor.`)
    return false;
  }

  if (rollToHit(Armor.current[targetEid], attackBonus)) {
    damage = rollDice(maxHit);
  }

  if (damage > 0 && critChance && rollToCrit(critChance)) {
    critMod = critDamage;
  }

  damage = damage * critMod + damageBonus;

  gameEvents.emitHealthChange({ eid: targetEid, amount: damage * -1 });
  return true;
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

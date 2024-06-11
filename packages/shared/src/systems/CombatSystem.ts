import { addComponent, defineQuery, defineSystem, entityExists, hasComponent, Not } from "bitecs";
import { Armor, AttackBonus, AttackCooldown, AttackRange, AttackSpeed, CritChance, CritDamage, Crown, DamageBonus, Health, MaxHit, Necro, Position, Target } from "../components";
import { checkIfWithinDistance } from "../utils/CollisionChecks";
import { healthChanges } from "../subjects";
import type { World } from "../types";

export const createCombatSystem = () => {
  const attackerQuery = defineQuery([Target, AttackSpeed, AttackRange, MaxHit, Position, Not(AttackCooldown)]);
  const necroQuery = defineQuery([Necro, Health, Position, Armor]);
  const crownQuery = defineQuery([Crown, Health, Position, Armor]);
  return defineSystem((world: World) => {
    const entities = attackerQuery(world);
    for (let i = 0; i < entities.length; i++) {
      const eid = entities[i];
      const targetEid = Target.eid[eid];
      const attacker = { x: Position.x[eid], y: Position.y[eid] };
      const target = { x: Position.x[targetEid], y: Position.y[targetEid] };

      // TODO: accommodate for actual dimensions of sprites?
      if (!checkIfWithinDistance(attacker, target, AttackRange.current[eid] + 30)) continue;

      let damage = 0;
      let critMod = 1;

      if (!entityExists(world, targetEid)) {
        console.debug(`Entity does not exist: Unable to attack with ${eid}, ${targetEid} does not exist.`)
        continue;
      }

      // TODO: consider using a "targetQuery" to check for Armor and Health, then use targets.includes(targetEid) (potentially better performance)
      // alternatively, we could add an "AttackRoll" component to queue the attack and defer the rest of this logic to another system
      if (!hasComponent(world, Armor, targetEid) || !hasComponent(world, Health, targetEid)) {
        console.debug(`Not found: Unable to attack with ${eid}, ${targetEid} is missing Health or Armor.`)
        continue;
      }

      addComponent(world, AttackCooldown, eid);
      // TODO: move AttackSpeed (and perhaps other cooldowns) to a tick based system?
      AttackCooldown.attackReady[eid] = (AttackSpeed.current[eid] * 200) + world.time.elapsed;
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

      healthChanges.next({ eid: targetEid, amount: damage * -1 })
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

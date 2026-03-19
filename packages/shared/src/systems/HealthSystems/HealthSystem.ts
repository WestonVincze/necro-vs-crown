import { addComponent, query, removeComponent } from "bitecs";
import { Damage, Dead, Heal, Health, HitSplat } from "../../components";

export const createHealthSystem = () => {
  const damageQuery = (world: World) => query(world, [Health, Damage]);
  const healQuery = (world: World) => query(world, [Health, Heal]);

  return (world: World) => {
    const damagedEntities = damageQuery(world);
    for (let i = 0; i < damagedEntities.length; i++) {
      const eid = damagedEntities[i];

      if (Damage.amount[eid] < 0) {
        console.warn(`Attempted to damage ${eid} with negative damage.`);
        continue;
      }

      Health.current[eid] = Math.max(
        0,
        Health.current[eid] - Damage.amount[eid],
      );

      addComponent(world, eid, HitSplat);
      HitSplat.amount[eid] = Damage.amount[eid];
      HitSplat.isCrit[eid] = Damage.isCrit[eid];
      removeComponent(world, eid, Damage);

      if (Health.current[eid] <= 0) {
        addComponent(world, eid, Dead);
      }
    }

    const healedEntities = healQuery(world);
    for (let i = 0; i < healedEntities.length; i++) {
      const eid = healedEntities[i];

      if (Heal.amount[eid] < 0) {
        console.warn(`Attempted to heal ${eid} with negative heal.`);
        continue;
      }

      Health.current[eid] = Math.min(
        Health.max[eid],
        Health.current[eid] + Heal.amount[eid],
      );

      removeComponent(world, eid, Heal);
    }

    return world;
  };
};

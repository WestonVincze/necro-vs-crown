import { observe, onAdd, onRemove, query } from "bitecs";
import { GameObjects } from "phaser";

import { Position, Collider } from "../../../../shared/src/components";
import { GameState } from "../../../../shared/src/managers";
import { type World } from "../../../../shared/src/types";

export const createDrawCollisionSystem = (
  world: World,
  scene: Phaser.Scene,
) => {
  const enterQueue: number[] = [];
  const exitQueue: number[] = [];

  observe(world, onAdd(Collider), (eid) => enterQueue.push(eid));
  observe(world, onRemove(Collider), (eid) => exitQueue.push(eid));

  const colliderGraphicsMap = new Map<number, GameObjects.Arc | null>();

  GameState.onDebugEnabled$.subscribe(() => {
    colliderGraphicsMap.forEach((_, eid) => {
      colliderGraphicsMap.set(
        eid,
        scene.add.circle(
          Position.x[eid] + Collider.offsetX[eid],
          Position.y[eid] + Collider.offsetY[eid],
          Collider.radius[eid],
          0xaa5555,
          0.3,
        ),
      );
    });
  });

  GameState.onDebugDisabled$.subscribe(() => {
    colliderGraphicsMap.forEach((arc) => arc?.destroy());
  });

  return (world: World) => {
    // TODO: create a "debugSystem" to enable/disable debugging features without having to create custom debug actions for each system
    const collisionsEntered = enterQueue.splice(0);
    for (const eid of collisionsEntered) {
      const arc = GameState.isDebugMode()
        ? scene.add.circle(
            Position.x[eid] + Collider.offsetX[eid],
            Position.y[eid] + Collider.offsetY[eid],
            Collider.radius[eid],
            0xaa5555,
            0.3,
          )
        : null;

      colliderGraphicsMap.set(eid, arc);
    }

    for (const eid of query(world, [Collider, Position])) {
      if (!GameState.isDebugMode()) continue;
      colliderGraphicsMap
        .get(eid)
        ?.setPosition(
          Position.x[eid] + Collider.offsetX[eid],
          Position.y[eid] + Collider.offsetY[eid],
        );
    }

    const collisionsExited = exitQueue.splice(0);
    for (const eid of collisionsExited) {
      colliderGraphicsMap.get(eid)?.destroy();
      colliderGraphicsMap.delete(eid);
    }

    return world;
  };
};

import { defineQuery, defineSystem, exitQuery, getRelationTargets } from "bitecs"
import { AttackRange, GridCell, Input, Position, Velocity } from "../components";
import { type Vector2 } from "../types";
import { Grid, AStarFinder, DiagonalMovement, Util } from "pathfinding";
import { type Scene, GameObjects, Geom } from "phaser";
import { MoveTarget } from "../relations";

const DEBUG_MODE = false;

const SEPARATION_THRESHOLD = 50;
const SEPARATION_THRESHOLD_SQUARED = SEPARATION_THRESHOLD ** 2;

// TODO: change Vector2 to Transform to compensate for height/width
const calculateSeparationForce = (self: Vector2, target: Vector2): Vector2 => {
  const separationForce = { x: 0, y: 0 };

  const dx = target.x - self.x;
  const dy = target.y - self.y;

  const distanceSquared = dx ** 2 + dy ** 2;

  if (distanceSquared > SEPARATION_THRESHOLD_SQUARED) return separationForce;

  const distance = Math.sqrt(distanceSquared);

  return { x: dx / distance, y: dy / distance};
}

const calculateFollowForce = (self: Vector2, target: Vector2, range: number): Vector2 => {
  const followForce = { x: 0, y: 0 };
  const dx = target.x - self.x;
  const dy = target.y - self.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // TODO: figure out how precise we need to be
  if (distance > range + 25) return { x: dx, y: dy };

  return followForce;
}

// TODO: remove scene reference or make it optional for debugging
export const createFollowTargetSystem = (scene: Scene, gridData: number[][]) => {
  const followTargetQuery = defineQuery([Position, GridCell, Input, Velocity, MoveTarget("*"), AttackRange]);

  const grid = new Grid(gridData);
  const finder = new AStarFinder(
    {
      diagonalMovement: DiagonalMovement.Always
    }
  );

  const pathsByEntityId = new Map<number, number[][]>();
  const graphicsById = new Map<number, GameObjects.Graphics>()

  return defineSystem(world => {
    const entities = followTargetQuery(world);
    for (let i = 0; i < entities.length; i++) {
      // get position data
      const eid = entities[i];
      const px = Position.x[eid];
      const py = Position.y[eid];
      const pxGrid = GridCell.x[eid];
      const pyGrid = GridCell.y[eid];

      // get target position data
      const targetEid = getRelationTargets(world, MoveTarget, eid)[0]; // FollowTarget.eid[eid];
      const txGrid = GridCell.x[targetEid];
      const tyGrid = GridCell.y[targetEid];

      let followForce = { x: 0, y: 0 }

      const path = pathsByEntityId.get(eid);

      if (grid.isWalkableAt(txGrid, tyGrid)) {
        // find a new path if no path exits, no steps remain, or the target position changed since initial calculation
        if (!path || path.length === 0 || path[path.length - 1][0] !== txGrid || path[path.length - 1][1] !== tyGrid) {
          const newPath = finder.findPath(pxGrid, pyGrid, txGrid, tyGrid, grid.clone());

          if (newPath.length === 0) {
            console.warn(`path not found for ${eid}...`);
            continue;
          }

          const smoothPath = Util.smoothenPath(grid.clone(), newPath);
          pathsByEntityId.set(eid, smoothPath);

          if (DEBUG_MODE) {
            if (!graphicsById.has(eid)) {
              graphicsById.set(eid, scene.add.graphics())
            }

            const graphics = graphicsById.get(eid);

            graphics?.clear();
            for (let i = 1; i < smoothPath.length; i++) {
              const lastX = smoothPath[Math.max(0, i - 1)][0] * 64 - 1504;
              const lastY = smoothPath[Math.max(0, i - 1)][1] * 64 - 1120;

              const line = new Geom.Line(lastX, lastY, smoothPath[i][0] * 64 - 1504, smoothPath[i][1] * 64 - 1120);
              graphics?.lineStyle(2, 0xaa00aa);
              graphics?.strokeLineShape(line);
            }

            for (let i = 0; i < newPath.length; i++) {
              const lastX = newPath[Math.max(0, i - 1)][0] * 64 - 1504;
              const lastY = newPath[Math.max(0, i - 1)][1] * 64 - 1120;

              const line = new Geom.Line(lastX, lastY, newPath[i][0] * 64 - 1504, newPath[i][1] * 64 - 1120);
              graphics?.lineStyle(2, 0x5555ee);
              graphics?.strokeLineShape(line);
            }
          }
        } else {
          const nextPoint = path[0];
          const direction = { x: (nextPoint[0] * 64 - 1504) - px, y: (nextPoint[1] * 64 - 1120) - py };

          if (direction.x !== 0 || direction.y !== 0) {
            const length = Math.sqrt(direction.x ** 2 + direction.y **2)
            followForce = { x: direction.x / length, y: direction.y / length };
          }

          // get the next point of our path if we are at the next point
          if (Math.abs(pxGrid - nextPoint[0]) < 1 && Math.abs(pyGrid - nextPoint[1]) < 1) {
            // console.log(`reached ${nextPoint[0]}, ${nextPoint[1]}`)
            pathsByEntityId.get(eid)?.shift();
          }
        }
      }

      // calculate separation force
      const separationForce: Vector2 = { x: 0, y: 0}
      const position = { x: px, y: py };

      // TODO: apply (half?) force to self and target, otherwise we only apply force to self and skip the calculation when the other entity targets self
      for (let j = 0; j < entities.length; j++) {
        const otherEid = entities[j];
        if (eid === otherEid) continue;
        const ox = Position.x[otherEid];
        const oy = Position.y[otherEid];
        const otherPosition = { x: ox, y: oy };

        const force = calculateSeparationForce(position, otherPosition);
        separationForce.x -= force.x;
        separationForce.y -= force.y;
      }

      Input.moveX[eid] = followForce.x + separationForce.x;
      Input.moveY[eid] = followForce.y + separationForce.y;
    }

    for (const eid of (exitQuery(followTargetQuery)(world))) {
      pathsByEntityId.delete(eid);
      graphicsById.get(eid)?.destroy();
      graphicsById.delete(eid);
    }

    return world;
  })
}

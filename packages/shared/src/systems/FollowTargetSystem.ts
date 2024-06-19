import { defineQuery, defineSystem, hasComponent } from "bitecs"
import { AttackRange, FollowTarget, Input, Position, Transform, Velocity } from "../components";
import { type Vector2 } from "../types";
import { Grid, AStarFinder } from "pathfinding";

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

export const createFollowTargetSystem = () => {
  const followTargetQuery = defineQuery([Position, Input, Velocity, FollowTarget, AttackRange]);

  let gridData = [];
  for (let y = 0; y < 36; y++) {
    let row = [];
    for (let x = 0; x < 48; x++) {
      row.push(0)
    }
    gridData.push(row);
  }
  const grid = new Grid(gridData);
  const finder = new AStarFinder();

  return defineSystem(world => {
    const entities = followTargetQuery(world);
    for (let i = 0; i < entities.length; i++) {
      // get required data
      const eid = entities[i];
      const targetEid = FollowTarget.eid[eid];
      const tx = Position.x[targetEid];
      const ty = Position.y[targetEid];
      const px = Position.x[eid];
      const py = Position.y[eid];

      const position = { x: px, y: py };
      // const target = { x: tx, y: ty };

      const txGrid = Math.floor((tx + 1536) / 64);
      const tyGrid = Math.floor((ty + 1152) / 64);
      const pxGrid = Math.floor((px + 1536) / 64);
      const pyGrid = Math.floor((py + 1152) / 64);
      const path = finder.findPath(pxGrid, pyGrid, txGrid, tyGrid, grid.clone());
      console.log(path);

      let followForce = { x: 0, y: 0 }
      if (path.length === 0) {
        console.warn(`path not found for ${eid}...`);
      } else {
        const nextPoint = path[1];
        const direction = { x: nextPoint[0] - px, y: nextPoint[1] - py };
        const length = Math.sqrt(direction.x ** 2 + direction.y **2)
        followForce = { x: direction.x / length, y: direction.y / length };
      }

      // calculate follow force
      /*
      const followForce: Vector2 = calculateFollowForce(position, target, AttackRange.current[eid]);
      */

      // calculate separation force
      const separationForce: Vector2 = { x: 0, y: 0}

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

      Input.moveX[eid] = followForce.x + separationForce.x * 2;
      Input.moveY[eid] = followForce.y + separationForce.y * 2;
    }

    return world;
  })
}

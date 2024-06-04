import { Not, defineQuery, defineSystem } from "bitecs";
import { Position, Velocity, Target, Player } from "../components";

type Vector2 = { x: number, y: number };

const normalizeForce = ({ x , y }: Vector2) => {
  if (x === 0 && y === 0) return { x, y };

  const magnitude = Math.sqrt(x * x + y * y);

  if (magnitude > 0) {
    x /= magnitude;
    y /= magnitude;
  }

  return { x, y }
}

const calculateFollowForce = (self: Vector2, target: Vector2) => {
  const followForce = { x: 0, y: 0 };
  const dx = target.x - self.x;
  const dy = target.y - self.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance > 0) {
    const directionX = dx / distance;
    const directionY = dy / distance;

    followForce.x = directionX;
    followForce.y = directionY;
  }

  return followForce;
}

export const createMovementSystem = () => {
  const movementQuery = defineQuery([Position, Velocity, Target, Not(Player)]);
  const separationThreshold = 50;

  return defineSystem((world) => {
    const entities = movementQuery(world);

    for (let i = 0; i < entities.length; i++) {
      // get required data
      const eid = entities[i];
      const tx = Target.x[eid];
      const ty = Target.y[eid];
      const px = Position.x[eid];
      const py = Position.y[eid];

      const position = { x: px, y: py };
      const target = { x: tx, y: ty };

      // calculate follow force
      const followForce: Vector2 = calculateFollowForce(position, target);

      // calculate separation force
      const separationForce: Vector2 = { x: 0, y: 0}

      for (let j = i + 1; j < entities.length; j++) {
        const otherEid = entities[j];
        if (eid === otherEid) continue;
        const ox = Position.x[otherEid];
        const oy = Position.y[otherEid];
        const otherPosition = { x: ox, y: oy };

        const dx = position.x - otherPosition.x;
        const dy = position.y - otherPosition.y;

        // distance unSquared
        // let distance = dx * dx + dy * dy;
        const distance = Math.hypot(dx, dy);

        if (distance < separationThreshold) {
          // distance = Math.sqrt(distance)
          const force = separationThreshold - distance;
          separationForce.x += (dx / distance) * force * 2;
          separationForce.y += (dy / distance) * force * 2;
        }
      }
      const normalizedForce = normalizeForce({ x: followForce.x + separationForce.x, y: followForce.y + separationForce.y });

      Velocity.x[eid] = normalizedForce.x;
      Velocity.y[eid] = normalizedForce.y;

      Position.x[eid] += Velocity.x[eid];
      Position.y[eid] += Velocity.y[eid];
    }

    return world;
  })
}

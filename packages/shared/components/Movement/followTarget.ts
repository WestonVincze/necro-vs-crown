import { normalizeForce } from '../../helpers';

type Vector2 = { x: number, y: number }

type Unit = {
  id: string
  width: number,
  height: number,
  vx?: number,
  vy?: number,
} & Vector2

type followTargetOptions = {
  followForce?: number,
  separationForce?: number,
  cohesionForce?: number,
  alignmentForce?: number,
  maxSpeed?: number
}
export const followTarget = async (
  self: Unit,
  target: Vector2,
  allUnits: Unit[],
  speed: number,
  delta: number,
  options?: followTargetOptions
) => {
  // get the sprites from our swarm
  // let { x: targetX, y: targetY } = target;

  const forces = {
    follow: { x: 0, y: 0 },
    separation: { x: 0, y: 0 },
    cohesion: { x: 0, y: 0 },
    alignment: {x: 0, y: 0 },
  }
  if (options?.followForce && options.followForce > 0) {
    forces.follow = calculateFollowForce(self, target);
    forces.follow.x *= options.followForce;
    forces.follow.y *= options.followForce;
  }

  if (options?.separationForce) {
    forces.separation = calculateSeparationForce(self, allUnits, 0);
    forces.separation.x *= options.separationForce;
    forces.separation.y *= options.separationForce;
  }

  /*
  if (options?.cohesion) {
    forces.cohesion = calculateCohesionForce(sprite, sprites, 200);
    forces.cohesion.x *= options.cohesion;
    forces.cohesion.y *= options.cohesion;
  }

  if (options?.alignment) {
    forces.alignment = calculateAlignmentForce(sprite, sprites, 400);
    forces.alignment.x *= options.alignment;
    forces.alignment.y *= options.alignment;
  }
  */

  const totalForceX = forces.follow.x + forces.separation.x + forces.alignment.x + forces.cohesion.x;
  const totalForceY = forces.follow.y + forces.separation.y + forces.alignment.y + forces.cohesion.y;

  const totalForceNormalized = normalizeForce({ x: totalForceX, y: totalForceY });

  self.vx += totalForceNormalized.x * speed * delta;
  self.vy += totalForceNormalized.y * speed * delta;

  // friction
  self.vx *= 0.95;
  self.vy *= 0.95;

  // Limit maximum speed
  if (options?.maxSpeed && options.maxSpeed > 0) {
    const magnitude = Math.sqrt(self.vx * self.vx + self.vy * self.vy);
    if (magnitude > options.maxSpeed) {
      const scale = options.maxSpeed / magnitude
      self.vx *= scale;
      self.vy *= scale;
    }
  }

  self.x += self.vx;
  self.y += self.vy;
}

export const calculateFollowForce = (self: Vector2, target: Vector2) => {
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

/*
const generateSymmetricKey = (index1, index2) => {
  const [ first, second ] = [index1, index2].sort();
  return `${first}-${second}`;
}
*/

// raycast at 4 points and if an overlap is detected apply separation force?
const calculateSeparationForce = (
  self: Unit,
  allUnits: Unit[],
  maxOverlapRatio: number
) => {
  const separationForce = { x: 0, y: 0 };

  // const index = flock.findIndex(s => s === sprite);
  allUnits.forEach((unit, i) => {
    if (unit.id !== self.id) {
      const dx = unit.x - self.x;
      const dy = unit.y - self.y;
      let distance = dx * dx + dy * dy;

      // check for collision
      let minDistance = self.width / 2 + unit.width / 2;
      if (distance < minDistance ** 2) {
        distance = Math.sqrt(distance);
        const overlapRatio = (minDistance - distance) / minDistance;

        if (overlapRatio > maxOverlapRatio) {
          const separationDirectionX = dx / distance;
          const separationDirectionY = dy / distance;

          separationForce.x -= separationDirectionX;
          separationForce.y -= separationDirectionY;
        }
      }
      // gameState.separationForceCache.set(id, separationForce);
    }
  })

  return separationForce;
}

/*
const calculateCohesionForce = (sprite, flock, cohesionRadius) => {
  const cohesionForce = { x: 0, y: 0 };
  const neighbors = [];

  flock.forEach(otherSprite => {
    if (otherSprite !== sprite) {
      const dx = otherSprite.x - sprite.x;
      const dy = otherSprite.y - sprite.y;
      let distance = dx * dx + dy * dy;

      if (distance < cohesionRadius ** 2) {
        neighbors.push(otherSprite);
      }
    }
  });

  if (neighbors.length > 0) {
    // Calculate average position of neighbors
    const avgPosition = neighbors.reduce((acc, neighbor) => {
      acc.x += neighbor.x;
      acc.y += neighbor.y;
      return acc;
    }, { x: 0, y: 0 });

    avgPosition.x /= neighbors.length;
    avgPosition.y /= neighbors.length;

    // Calculate cohesion force towards the average position
    cohesionForce.x = avgPosition.x - sprite.x;
    cohesionForce.y = avgPosition.y - sprite.y;
  }

  return cohesionForce;
};

const calculateAlignmentForce = (sprite, flock, alignmentRadius) => {
  const alignmentForce = { x: 0, y: 0 };
  const neighbors = [];

  flock.forEach(otherSprite => {
    if (otherSprite !== sprite) {
      const dx = otherSprite.x - sprite.x;
      const dy = otherSprite.y - sprite.y;
      const distance = dx * dx + dy * dy;

      if (distance < alignmentRadius ** 2) {
        neighbors.push(otherSprite);
      }
    }
  });

  if (neighbors.length > 0) {
    // Calculate average velocity of neighbors
    const avgVelocity = neighbors.reduce((acc, neighbor) => {
      acc.x += neighbor.vx;
      acc.y += neighbor.vy;
      return acc;
    }, { x: 0, y: 0 });

    avgVelocity.x /= neighbors.length;
    avgVelocity.y /= neighbors.length;

    // Calculate alignment force towards the average velocity
    alignmentForce.x = avgVelocity.x - sprite.vx;
    alignmentForce.y = avgVelocity.y - sprite.vy;
  }

  return alignmentForce;
};
*/

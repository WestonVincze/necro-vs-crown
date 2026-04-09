import { hasComponent, query } from "bitecs";
import { ExternalForce, Position, Transform } from "../../components";
import { clampToScreenSize } from "../../utils";

export const createExternalForceSystem = () => {
  return (world: World) => {
    for (const eid of query(world, [Position, ExternalForce])) {
      const bounds = { width: 0, height: 0 };
      if (hasComponent(world, eid, Transform)) {
        bounds.width = Transform.width[eid];
        bounds.height = Transform.height[eid];
      }

      const position = clampToScreenSize(
        {
          x: Position.x[eid] + ExternalForce.x[eid],
          y: Position.y[eid] + ExternalForce.y[eid],
        },
        bounds,
      );

      Position.x[eid] = position.x;
      Position.y[eid] = position.y;
    }
    return world;
  };
};

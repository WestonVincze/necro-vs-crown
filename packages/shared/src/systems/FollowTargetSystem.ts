import { defineQuery, exitQuery, getRelationTargets } from "bitecs";
import {
  AttackRange,
  GridCell,
  Input,
  Position,
  Velocity,
} from "../components";
import { Grid, AStarFinder, DiagonalMovement, Util } from "pathfinding";
import { type Scene, GameObjects, Geom } from "phaser";
import { MoveTarget } from "../relations";
import {
  areVectorsIdentical,
  getGridCellFromEid,
  getPositionFromEid,
  getPositionFromGridCell,
} from "../utils";
import { GameState } from "../managers";

const drawPathLines = (
  path: number[][],
  graphics: GameObjects.Graphics,
  color: number,
) => {
  for (let i = 0; i < path.length; i++) {
    const lastGridCell = {
      x: path[Math.max(0, i - 1)][0],
      y: path[Math.max(0, i - 1)][1],
    };
    const lastPosition = getPositionFromGridCell(lastGridCell);

    const currentGridCell = {
      x: path[i][0],
      y: path[i][1],
    };
    const currentPosition = getPositionFromGridCell(currentGridCell);

    const line = new Geom.Line(
      lastPosition.x,
      lastPosition.y,
      currentPosition.x,
      currentPosition.y,
    );
    graphics?.lineStyle(2, color);
    graphics?.strokeLineShape(line);
  }
};

// TODO: remove scene reference or make it optional for debugging
export const createFollowTargetSystem = (
  scene: Scene,
  gridData: number[][],
) => {
  const followTargetQuery = defineQuery([
    Position,
    GridCell,
    Input,
    Velocity,
    MoveTarget("*"),
    AttackRange,
  ]);

  const grid = new Grid(gridData);
  const finder = new AStarFinder({
    diagonalMovement: DiagonalMovement.Always,
  });

  const pathsByEntityId = new Map<number, number[][]>();
  const graphicsById = new Map<number, GameObjects.Graphics>();

  GameState.onDebugDisabled$.subscribe(() =>
    graphicsById.forEach((graphics) => graphics.destroy()),
  );

  return (world: World) => {
    const entities = followTargetQuery(world);
    for (const eid of entities) {
      // get position data
      const position = getPositionFromEid(eid);
      const gridCell = getGridCellFromEid(eid);

      // get target position data
      const targetEid = getRelationTargets(world, MoveTarget, eid)[0];
      const targetGridCell = getGridCellFromEid(targetEid);

      let followForce = { x: 0, y: 0 };

      const path = pathsByEntityId.get(eid);

      // check if we are already at the target position
      if (
        !areVectorsIdentical(gridCell, targetGridCell) &&
        grid.isWalkableAt(targetGridCell.x, targetGridCell.y)
      ) {
        // find a new path if no path exits, no steps remain, or the target position changed since initial calculation
        if (
          !path ||
          path.length === 0 ||
          path[path.length - 1][0] !== targetGridCell.x ||
          path[path.length - 1][1] !== targetGridCell.y
        ) {
          const newPath = finder.findPath(
            gridCell.x,
            gridCell.y,
            targetGridCell.x,
            targetGridCell.y,
            grid.clone(),
          );

          if (newPath.length === 0) {
            console.warn(`path not found for ${eid}...`);
            continue;
          }

          const smoothPath = Util.smoothenPath(grid.clone(), newPath);
          pathsByEntityId.set(eid, smoothPath);

          if (GameState.isDebugMode()) {
            if (!graphicsById.has(eid)) {
              graphicsById.set(eid, scene.add.graphics());
            }

            const graphics = graphicsById.get(eid);
            if (!graphics) {
              console.warn("unable to draw paths, graphics not found");
              continue;
            }

            graphics.clear();
            drawPathLines(smoothPath, graphics, 0xaa00aa);
            drawPathLines(newPath, graphics, 0x5555aa);
          }
        } else {
          const nextGridCell = { x: path[0][0], y: path[0][1] };
          const nextPosition = getPositionFromGridCell(nextGridCell);

          const direction = {
            x: nextPosition.x - position.x,
            y: nextPosition.y - position.y,
          };

          if (direction.x !== 0 || direction.y !== 0) {
            const length = Math.sqrt(direction.x ** 2 + direction.y ** 2);
            followForce = { x: direction.x / length, y: direction.y / length };
          }

          // get the next point of our path if we are at the next point
          if (
            Math.abs(gridCell.x - nextGridCell.x) < 1 &&
            Math.abs(gridCell.y - nextGridCell.y) < 1
          ) {
            pathsByEntityId.get(eid)?.shift();
          }
        }
      }

      Input.moveX[eid] = followForce.x;
      Input.moveY[eid] = followForce.y;
    }

    for (const eid of exitQuery(followTargetQuery)(world)) {
      Input.moveX[eid] = 0;
      Input.moveY[eid] = 0;
      pathsByEntityId.delete(eid);
      graphicsById.get(eid)?.destroy();
      graphicsById.delete(eid);
    }

    return world;
  };
};

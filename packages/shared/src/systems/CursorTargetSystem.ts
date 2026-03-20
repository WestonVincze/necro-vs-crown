import { addComponent, addEntity, query } from "bitecs";
import type { Scene } from "phaser";
import { fromEvent, map } from "rxjs";
import { Cursor, GridCell, Position } from "../components";
import { getGridCellFromPosition } from "../utils";

// TODO: this isn't a system, let's move it elsewhere
export const initializeNecroMouseControls = (world: World, scene: Scene) => {
  const canvas =
    document.getElementById("game-container") || document.documentElement;

  const rect = canvas.getBoundingClientRect();

  const mouseClick$ = fromEvent<MouseEvent>(canvas, "mousedown").pipe(
    map((event) =>
      scene.cameras.main.getWorldPoint(
        event.clientX - rect.left,
        event.clientY - rect.top,
      ),
    ),
  );

  const cursorEid = addEntity(world);
  addComponent(world, cursorEid, Cursor);
  addComponent(world, cursorEid, Position);
  addComponent(world, cursorEid, GridCell);

  Position.x[cursorEid] = 0;
  Position.y[cursorEid] = 0;
  GridCell.x[cursorEid] = 0;
  GridCell.y[cursorEid] = 0;

  const mouseClickSubscription = mouseClick$.subscribe(({ x, y }) => {
    Cursor.eid[cursorEid] = cursorEid;
    Position.x[cursorEid] = x;
    Position.y[cursorEid] = y;
    const gridCellPosition = getGridCellFromPosition({ x, y });
    GridCell.x[cursorEid] = gridCellPosition.x;
    GridCell.y[cursorEid] = gridCellPosition.y;
  });

  scene.events.once("shutdown", () => {
    mouseClickSubscription.unsubscribe();
  });
};

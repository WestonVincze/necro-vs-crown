import { addComponent, addEntity, defineQuery } from "bitecs";
import type { Scene } from "phaser";
import { fromEvent, map } from "rxjs";
import { Cursor, GridCell, Position } from "$components";

// TODO: this system feels a bit awkward, let's revisit later and see if we can come up with a better solution
export const createCursorTargetSystem = (scene: Scene) => {
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

  return (world: World) => {
    const cursorEid = addEntity(world);
    addComponent(world, Cursor, cursorEid);
    addComponent(world, Position, cursorEid);
    addComponent(world, GridCell, cursorEid);

    const mouseClickSubscription = mouseClick$.subscribe(({ x, y }) => {
      Cursor.eid[cursorEid] = cursorEid;
      Position.x[cursorEid] = x;
      Position.y[cursorEid] = y;
    });

    scene.events.once("shutdown", () => {
      mouseClickSubscription.unsubscribe();
    });

    return world;
  };
};

export const getCursorEid = (world: World) => {
  // there should only be one cursor
  const cursorQuery = defineQuery([Cursor]);

  const entities = cursorQuery(world);
  if (entities.length === 0) {
    console.warn(
      `Not found: Could not return Cursor eid, an instance of Cursor was not found.`,
    );
    return;
  }
  return entities[0];
};

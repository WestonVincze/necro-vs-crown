import { addComponent, addEntity, defineQuery, defineSystem, type IWorld } from 'bitecs';
import { fromEvent, map } from 'rxjs';
import { Behavior, Behaviors, Cursor, Position, Target } from '../components';
import { Necro } from '../components/Tags';
import type { World } from '../types';

/**
 * This pattern goes against the principles of how Systems should operate...
 * Systems are intended to run every frame, not reactively
 * 
 */
export const createCursorTargetSystem = (world: IWorld) => {
  const canvas = document.getElementById('game-container') || document.documentElement;

  const rect = canvas.getBoundingClientRect();

  const mouseClick$ = fromEvent<MouseEvent>(canvas, 'mousedown').pipe(
    map((event) => ({ x: event.clientX - rect.left, y: event.clientY - rect.top })),
  );

  const behaviorQuery = defineQuery([Behavior, Target, Necro])

  const cursorEid = addEntity(world);
  addComponent(world, Cursor, cursorEid);
  addComponent(world, Position, cursorEid);

  return defineSystem(world => {
    mouseClick$.subscribe(({ x, y }) => {
      Cursor.eid[cursorEid] = cursorEid;
      Position.x[cursorEid] = x;
      Position.y[cursorEid] = y;
    });
    return world;
  })
}

export const getCursorEid = (world: IWorld) => {
  // there should only be one cursor
  const cursorQuery = defineQuery([Cursor]);

  const entities = cursorQuery(world);
  if (entities.length === 0) {
    console.warn(`Not found: Could not return Cursor eid, an instance of Cursor was not found.`);
    return;
  }
  return entities[0];
}
import { defineQuery, defineSystem } from 'bitecs';
import { fromEvent, map, tap } from 'rxjs';
import { Behavior, Behaviors, Target } from '../components';
import { Necro } from '../components/Tags';

/**
 * This pattern goes against the principles of how Systems should operate...
 * Systems are intended to run every frame, not reactively
 * 
 */
export const createCursorTargetSystem = () => {
  const canvas = document.getElementById('game-container') || document.documentElement;

  const mouseClick$ = fromEvent<MouseEvent>(canvas, 'mousedown').pipe(
    tap(() => console.log("CLICKED")),
    map((event) => ({ x: event.clientX, y: event.clientY })),
    tap(({ x, y }) => console.log(`${x} ${y}`)),
  );

  const behaviorQuery = defineQuery([Behavior, Target, Necro])

  return defineSystem(world => {
    mouseClick$.subscribe(({ x, y }) => {
      const entities = behaviorQuery(world);
      for (let i = 0; i < entities.length; i++) {
        const eid = entities[i];
        if (Behavior.type[eid] === Behaviors.FollowCursor) {
          Target.x[eid] = x;
          Target.y[eid] = y;
        }
      }
    });
    return world;
  })
}
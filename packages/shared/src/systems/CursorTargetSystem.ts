import { defineQuery, defineSystem } from 'bitecs';
import { fromEvent, map } from 'rxjs';
import { Behavior, Behaviors, Position, Target } from '../components';
import { Necro } from '../components/Tags';

/**
 * This pattern goes against the principles of how Systems should operate...
 * Systems are intended to run every frame, not reactively
 * 
 */
export const createCursorTargetSystem = () => {
  const canvas = document.getElementById('game-container') || document.documentElement;

  const rect = canvas.getBoundingClientRect();

  const mouseClick$ = fromEvent<MouseEvent>(canvas, 'mousedown').pipe(
    map((event) => ({ x: event.clientX - rect.left, y: event.clientY - rect.top })),
  );

  const behaviorQuery = defineQuery([Behavior, Target, Necro])

  return defineSystem(world => {
    mouseClick$.subscribe(({ x, y }) => {
      const entities = behaviorQuery(world);
      for (let i = 0; i < entities.length; i++) {
        const eid = entities[i];
        if (Behavior.type[eid] === Behaviors.FollowCursor) {
          const targetEid = Target.eid[eid];
          Position.x[targetEid] = x;
          Position.y[targetEid] = y;
        }
      }
    });
    return world;
  })
}
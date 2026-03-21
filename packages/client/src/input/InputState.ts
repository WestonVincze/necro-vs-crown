import { distinctUntilChanged, fromEvent, map, merge } from "rxjs";

export type InputState = {
  moveX: number;
  moveY: number;
  castingSpell: boolean;
};

/**
 * Creates an Input observable that emits events when the state our inputs changes
 * e.g. pressing "d" emits an event with moveX: -1 in the payload, releasing "d" then emits an event with moveX: 0 in the payload
 */
export const createInputState = () => {
  const held = new Set<string>();

  function computeState(): InputState {
    return {
      moveX: (held.has("d") ? 1 : 0) - (held.has("a") ? 1 : 0),
      moveY: (held.has("s") ? 1 : 0) - (held.has("w") ? 1 : 0),
      castingSpell: held.has(" "),
    };
  }

  const keydown$ = fromEvent<KeyboardEvent>(window, "keydown").pipe(
    map((e) => {
      held.add(e.key);
      return computeState();
    }),
  );

  const keyup$ = fromEvent<KeyboardEvent>(window, "keyup").pipe(
    map((e) => {
      held.delete(e.key);
      return computeState();
    }),
  );

  return merge(keydown$, keyup$).pipe(
    distinctUntilChanged(
      (a, b) =>
        a.moveX === b.moveX &&
        a.moveY === b.moveY &&
        a.castingSpell === b.castingSpell,
    ),
  );
};

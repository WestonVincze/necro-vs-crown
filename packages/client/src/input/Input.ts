import {
  distinctUntilChanged,
  filter,
  fromEvent,
  map,
  merge,
  scan,
} from "rxjs";

export type action =
  | "moveLeft"
  | "moveRight"
  | "moveUp"
  | "moveDown"
  | "castSpell";

export type InputAction = Record<action, KeyboardEvent["key"][]>;

// TODO: change "wasd" to use "code" instead of "key" (e.g. "KeyW")
const defaultInputActions: InputAction = {
  moveLeft: ["a", "left"],
  moveRight: ["d"],
  moveUp: ["w"],
  moveDown: ["s"],
  castSpell: [" "],
};

export const createActiveActions = (inputActions = defaultInputActions) => {
  const inputs = Object.values(inputActions).flatMap((keys) => keys);

  const keyDown$ = fromEvent<KeyboardEvent>(document, "keydown").pipe(
    filter((e) => inputs.includes(e.key.toLowerCase())),
    map((e) => ({
      key: e.key.toLowerCase() as action,
      isDown: true,
    })),
  );

  const keyUp$ = fromEvent<KeyboardEvent>(document, "keyup").pipe(
    filter((e) => inputs.includes(e.key.toLocaleLowerCase())),
    map((e) => ({
      key: e.key.toLowerCase() as action,
      isDown: false,
    })),
  );

  return merge(keyDown$, keyUp$).pipe(
    distinctUntilChanged(
      (prev, curr) => prev.key === curr.key && prev.isDown === curr.isDown,
    ),
    scan(
      (acc, curr) => {
        for (const action in inputActions) {
          if (inputActions[action as action].includes(curr.key)) {
            acc[action as action] = curr.isDown;
          }
        }
        return acc;
      },
      {} as Record<action, boolean>,
    ),
  );
};

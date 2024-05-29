/*
import { distinctUntilChanged, filter, fromEvent, map, merge, scan } from "rxjs";
// TODO: label input actions to allow easy re-mapping
// other components should listen for named triggers, inputs will manage the actions
const inputActions = {
  moveLeft: ["a"],
  moveRight: ["d"],
  moveUp: ["w"],
  moveDown: ["s"],
  castSpell: [" "],
  pause: ["escape"],
  debugMode: ["`"],
}
// player input and observables
const inputs = ['w', 'a', 's', 'd', ' ', 'enter', 'escape', '`', 'q', 'e', 'f', '1', '2'];

type KeyMap = {
  key: string,
  isDown: boolean,
}

export const keyDown$ = fromEvent<KeyboardEvent>(document, 'keydown').pipe(
  filter(e => inputs.includes(e.key.toLowerCase())),
  map((e): KeyMap => ({
    key: e.key.toLowerCase(),
    isDown: true,
  }))
)

export const keyUp$ = fromEvent<KeyboardEvent>(document, 'keyup').pipe(
  filter(e => inputs.includes(e.key.toLowerCase())),
  map((e): KeyMap => ({
    key: e.key.toLowerCase(),
    isDown: false,
  }))
)

// tracking whether or not key is currently pressed
export const activeKeys$ = merge(keyDown$, keyUp$).pipe(
  distinctUntilChanged((prev, curr) => prev.key === curr.key && prev.isDown === curr.isDown),
  scan((acc, curr) => {
    (acc as any)[curr.key] = curr.isDown;
    return acc;
  }, {}),
)
*/

import { fromEvent, map, distinctUntilChanged, switchMap, tap, takeUntil, Observable } from 'rxjs';

type ActionCallback = () => void;

function createInputManager() {
  const pressedKeys: Set<string> = new Set();
  const actions: Map<string, ActionCallback> = new Map();

  const keydown$: Observable<string> = fromEvent<KeyboardEvent>(document, 'keydown').pipe(
    map(event => event.key.toLocaleLowerCase()),
    distinctUntilChanged()
  );
  const keyup$: Observable<string> = fromEvent<KeyboardEvent>(document, 'keyup').pipe(
    map(event => event.key.toLocaleLowerCase()),
    distinctUntilChanged()
  );

  const mousemove$: Observable<MouseEvent> = fromEvent<MouseEvent>(document, 'mousemove');
  const mousedown$: Observable<MouseEvent> = fromEvent<MouseEvent>(document, 'mousedown');
  const mouseup$: Observable<MouseEvent> = fromEvent<MouseEvent>(document, 'mouseup');
  const drag$: Observable<MouseEvent> = mousedown$.pipe(
    switchMap(startEvent => mousemove$.pipe(
      tap(moveEvent => onMouseDrag(startEvent, moveEvent)),
      takeUntil(mouseup$)
    ))
  );

  keydown$.subscribe(key => onKeyDown(key));
  keyup$.subscribe(key => onKeyUp(key));
  mousedown$.subscribe(event => onMouseDown(event));
  mouseup$.subscribe(event => onMouseUp(event));
  drag$.subscribe();

  function onKeyDown(key: string) {
    pressedKeys.add(key);
    if (actions.has(key)) {
      actions.get(key)!();
    }
  }

  function onKeyUp(key: string) {
    pressedKeys.delete(key);
  }

    function onMouseDown(event: MouseEvent) {
    if (actions.has('mousedown')) {
      actions.get('mousedown')!();
    }
  }

  function onMouseUp(event: MouseEvent) {
    if (actions.has('mouseup')) {
      actions.get('mouseup')!();
    }
  }

  function onMouseDrag(startEvent: MouseEvent, moveEvent: MouseEvent) {
    if (actions.has('drag')) {
      actions.get('drag')!();
    }
  }

  function isKeyPressed(key: string): boolean {
    return pressedKeys.has(key);
  }

  function bindAction(key: string, action: ActionCallback) {
    actions.set(key, action);
  }

  function unbindAction(key: string) {
    actions.delete(key);
  }

  return {
    isKeyPressed,
    bindAction,
    unbindAction
  };
}

const inputManager = createInputManager();

export { inputManager };

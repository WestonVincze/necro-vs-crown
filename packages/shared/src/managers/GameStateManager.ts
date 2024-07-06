// @ts-expect-error - no declaration file
import * as dat from 'dat.gui';
import { BehaviorSubject, distinctUntilChanged, filter, skip } from 'rxjs';

// right now this is only used for debugging, we may not ever need a global game state
const InitializeGameState = () => {
  let _debugMode = new BehaviorSubject<boolean>(false);
  const gui = new dat.GUI();

  const toggleDebug = (e: KeyboardEvent) => {
    if (e.key !== "`") return;

    _debugMode.next(!_debugMode.value);
  }

  window.addEventListener("keydown", toggleDebug);

  const destroyGameState = () => {
    window.removeEventListener("keydown", toggleDebug)
  }

  const onDebugEnabled$ = _debugMode.pipe(
    distinctUntilChanged(),
    filter(value => value === true)
  );

  const onDebugDisabled$ = _debugMode.pipe(
    skip(1),
    distinctUntilChanged(),
    filter(value => value === false)
  );

  return {
    gui,
    isDebugMode: () => _debugMode.value,
    destroyGameState,
    onDebugEnabled$,
    onDebugDisabled$
  }
}

export const GameState = InitializeGameState();

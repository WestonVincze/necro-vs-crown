// @ts-expect-error - no declaration file
import * as dat from 'dat.gui';
import { BehaviorSubject, filter } from 'rxjs';

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

  const onDebugEnabled$ = _debugMode.pipe(filter(value => value === true));
  const onDebugDisabled$ = _debugMode.pipe(filter(value => value === false));

  return { gui, isDebugMode: () => _debugMode.value, destroyGameState, onDebugEnabled$, onDebugDisabled$ }
}

export const GameState = InitializeGameState();

import * as dat from "dat.gui";
import { gameEvents } from "$events";
import { BehaviorSubject, distinctUntilChanged, filter, skip } from "rxjs";

// right now this is only used for debugging, we may not ever need a global game state
const InitializeGameState = () => {
  let _paused = false;
  let _debugMode = new BehaviorSubject<boolean>(false);
  let gui = new dat.GUI();

  const pauseSubscription = gameEvents.onTogglePause.subscribe(
    () => (_paused = !_paused),
  );

  const toggleDebug = (e: KeyboardEvent) => {
    if (e.key !== "`") return;

    _debugMode.next(!_debugMode.value);
  };

  if (window !== undefined) window.addEventListener("keydown", toggleDebug);

  const resetGUI = () => {
    gui = new dat.GUI();
  };

  const destroyGameState = () => {
    pauseSubscription.unsubscribe();
    if (window !== undefined)
      window.removeEventListener("keydown", toggleDebug);
    gui.destroy();
  };

  const onDebugEnabled$ = _debugMode.pipe(
    distinctUntilChanged(),
    filter((value) => value === true),
  );

  const onDebugDisabled$ = _debugMode.pipe(
    skip(1),
    distinctUntilChanged(),
    filter((value) => value === false),
  );

  return {
    gui,
    resetGUI,
    isDebugMode: () => _debugMode.value,
    isPaused: () => _paused,
    destroyGameState,
    onDebugEnabled$,
    onDebugDisabled$,
  };
};

export const GameState = InitializeGameState();

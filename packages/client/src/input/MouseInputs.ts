import { fromEvent, Observable, Subscription, switchMap, takeUntil, tap } from 'rxjs';
import { actions } from './Actions';

const createMouseManager = (element: HTMLElement = document.documentElement) => {
  const mouseActions = new Subscription();
  
  const mousedown$: Observable<MouseEvent> = fromEvent<MouseEvent>(element, 'mousedown');
  const mouseup$: Observable<MouseEvent> = fromEvent<MouseEvent>(element, 'mouseup');
  const mousemove$: Observable<MouseEvent> = fromEvent<MouseEvent>(element, 'mousemove');
  const dragstart$: Observable<MouseEvent> = fromEvent<MouseEvent>(element, 'dragstart');
  const dragend$: Observable<MouseEvent> = fromEvent<MouseEvent>(element, 'dragend');

  // TODO: audit the usefulness of having a drag event
  const drag$: Observable<MouseEvent> = mousedown$.pipe(
    switchMap(startEvent => mousemove$.pipe(
      tap(moveEvent => onMouseDrag(startEvent, moveEvent)),
      takeUntil(mouseup$)
    ))
  );

  mouseActions.add(mousedown$.subscribe(event => onMouseDown(event)));
  mouseActions.add(mouseup$.subscribe(event => onMouseUp(event)));
  mouseActions.add(mousemove$.subscribe(event => onMouseMove(event)));
  mouseActions.add(drag$.subscribe(event => onMouseDrag(undefined, event)));
  mouseActions.add(dragstart$.subscribe(event => onMouseDragStart(event)));
  mouseActions.add(dragend$.subscribe(event => onMouseDragEnd(event)));

  const onMouseDown = (event: MouseEvent) => {
    invokeMouseEventAction('mousedown', event);
  }

  const onMouseUp = (event: MouseEvent) => {
    invokeMouseEventAction('mouseup', event);
  }

  const onMouseMove = (event: MouseEvent) => {
    invokeMouseEventAction('mousemove', event);
  }

  const onMouseDrag = (startEvent: MouseEvent | undefined, moveEvent: MouseEvent) => {
    invokeMouseEventAction('drag', moveEvent, { startEvent });
  }

  const onMouseDragStart = (event: MouseEvent) => {
    invokeMouseEventAction('dragstart', event);
  }

  const onMouseDragEnd = (event: MouseEvent) => {
    invokeMouseEventAction('dragend', event);
  }

  const invokeMouseEventAction = (
    type: 'mousedown' | 'mouseup' | 'drag' | 'mousemove' | 'dragstart' | 'dragend',
    event: MouseEvent,
    extraData?: any
  ) => {
    Object.values(actions).forEach(({ mouseEvents, condition, callback }) => {
      if (mouseEvents?.includes(type) && (!condition || condition())) {
        callback(event, extraData);
      }
    });
  }

  /**
   * Removes all mouseActions registered to MouseInputs
   */
  const clearMouseActions = () => {
    mouseActions.unsubscribe();
  }

  return {
    clearMouseEvents: clearMouseActions
  };
}

// const mouseManager = createMouseManager();
export { createMouseManager };

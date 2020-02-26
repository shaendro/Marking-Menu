import { fromEvent, of, merge } from 'rxjs';
import {
  map,
  takeUntil,
  publishBehavior,
  filter,
  startWith
} from 'rxjs/operators';
import {
  createPEventFromMouseEvent,
  createPEventFromTouchEvent,
  createPEventFromPointerEvent
} from './pointer-events';

// Higher order observable tracking mouse drags.
export const mouseDrags = rootDOM =>
  fromEvent(rootDOM, 'mousedown').pipe(
    map(downEvt => {
      // Make sure we include the first mouse down event.
      const drag$ = merge(of(downEvt), fromEvent(rootDOM, 'mousemove')).pipe(
        takeUntil(fromEvent(rootDOM, 'mouseup')),
        // Publish it as a behavior so that any new subscription will
        // get the last drag position.
        publishBehavior()
      );
      drag$.connect();
      return drag$;
    }),
    map(o => o.pipe(map((...args) => createPEventFromMouseEvent(...args))))
  );

// Higher order observable tracking pointer drags.
export const pointerDrags = rootDOM =>
  fromEvent(rootDOM, 'pointerdown').pipe(
    filter(pointerEvt => { return pointerEvt.pointerType === 'pen' || pointerEvt.pointerType === 'mouse' && pointerEvt.which === 3 }),
    map(downEvt => {
      // Make sure we include the first pointer down event.
      const drag$ = merge(of(downEvt), fromEvent(rootDOM, 'pointermove')).pipe(
        takeUntil(fromEvent(rootDOM, 'pointerup')),
        // Publish it as a behavior so that any new subscription will
        // get the last drag position.
        publishBehavior()
      );
      drag$.connect();
      return drag$;
    }),
    map(o => o.pipe(map((...args) => createPEventFromPointerEvent(...args))))
  );

// Higher order observable tracking touch drags.
export const touchDrags = rootDOM =>
  fromEvent(rootDOM, 'touchstart').pipe(
    // Menu is supposed to have pointer-events: none so we can safely rely on
    // targetTouches.
    filter(evt => evt.targetTouches.length === 1),
    map(firstEvent => {
      const drag$ = fromEvent(rootDOM, 'touchmove').pipe(
        startWith(firstEvent),
        takeUntil(
          merge(
            fromEvent(rootDOM, 'touchend'),
            fromEvent(rootDOM, 'touchcancel'),
            fromEvent(rootDOM, 'touchstart')
          ).pipe(filter(evt => evt.targetTouches.length !== 1))
        ),
        publishBehavior()
      );
      // FIXME: the line below retains the subscription until next touch end.
      drag$.connect();
      return drag$;
    }),
    map(o => o.pipe(map(createPEventFromTouchEvent)))
  );

/**
 * @param {HTMLElement} rootDOM - the DOM element to observe pointer events on.
 * @return {Observable} A higher order observable that drag observables. The sub-observables are
 *                      published as behaviors so that any new subscription immediately get the last
 *                      position.
 * @param {function[]} [dragObsFactories] - factory to use to observe drags.
 */
const watchDrags = (rootDOM, dragObsFactories = [pointerDrags]) =>
  merge(...dragObsFactories.map(f => f(rootDOM)));

export default watchDrags;

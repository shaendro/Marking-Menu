import { dist } from './utils';
import { drag$ToAngleDrag$ } from './angle-drag';

const menuNav = (drag$, menu, config) => {
  const {
    minSelectionDist,
    minMenuSelectionDist,
    movementsThreshold,
    subMenuOpeningDelay
  } = config;
  const angleDrag$ = drag$ToAngleDrag$(drag$);

  // Start observable.
  const start$ = angleDrag$
    .first()
    .map(n => Object.assign({ type: 'open', menu }, n));

  // Analyse local movements.
  const moves$ = angleDrag$.scan((last, n) => {
    const distFromCenter = dist(n.center, n.position);
    const active =
      distFromCenter < minSelectionDist
        ? null
        : menu.getNearestChildren(n.alpha);
    const type = last && last.active === active ? 'move' : 'change';
    return Object.assign({ active, type, distFromCenter }, n);
  }, null);

  // Share this observable as it is used several times
  const startAndMove$ = start$.concat(moves$).share();

  const end$ = startAndMove$
    .startWith({})
    .last()
    .map(n =>
      Object.assign({}, n, {
        type: n.active && n.active.isLeaf() ? 'select' : 'cancel',
        selection: n.active
      })
    );

  // Fully observe the local navigation.
  const localNavigation$ = startAndMove$
    .merge(end$)
    .share();

  // Look for (sub)menu selection.
  const menuSelection$ = localNavigation$
    // Drop small movements.
    .distinctUntilChanged(
      (prev, cur) =>
        !movementsThreshold ||
        dist(prev.position, cur.position) <= movementsThreshold
    )
    // Wait for a pause in the movements.
    .debounceTime(subMenuOpeningDelay)
    // No menu selections once the local navigation is done.
    .takeUntil(localNavigation$.last())
    // Filter pauses occurring outside of the selection area.
    .filter(
      n =>
        n.active &&
        n.distFromCenter > minMenuSelectionDist &&
        !n.active.isLeaf()
    );

  // Higher order observable on navigation inside sub-menus.
  const subMenuNavigations$ = menuSelection$.map(n =>
    menuNav(drag$, n.active, config)
  );

  // Start with local navigation but switch to the first sub-menu navigation
  // (if any).
  return subMenuNavigations$.take(1).startWith(localNavigation$).switch();
};

/**
 * Create the marking menu controller.
 * @param {Observable} drags$ higher order observable on drag manipulations.
 * @param {{items, get, getNearest}} model
 * @param {Number} minSelectionDist the minimum distance from the center required to
 *                 trigger a selection.
 * @param {Number} minMenuSelectionDist the minimum distance from the center required to
 *                 trigger the opening of a sub-menu.
 * @param {Number} submenuOpeningDelay the delay in ms before opening a submenu.
 */
export default (drags$, ...navArgs) =>
  drags$.exhaustMap(drag$ => menuNav(drag$, ...navArgs));

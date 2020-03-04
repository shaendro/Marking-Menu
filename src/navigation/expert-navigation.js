import { merge } from 'rxjs';
import { startWith, last, map, share } from 'rxjs/operators';
import { draw } from '../move';
import recognize from '../recognizer';

/**
 * @param {Observable} drag$ - An observable of drag movements.
 * @param {MMItem} model - The model of the menu.
 * @param {List<number[]>} initStroke - Initial stroke.
 * @return {Observable} An observable on the gesture drawing and recognition.
 */
export default (drag$, model, initStroke = []) => {
	// Observable on gesture drawing.
	const draw$ = draw(drag$, { initStroke, type: 'draw' }).pipe(share());

	// Track the end of the drawing and attempt to recognize the gesture.
	const end$ = draw$.pipe(
		startWith(null),
		last(),
		map(e => {
			if (!e) return { type: 'cancel' };
			const strokeBegin = e.stroke[0];
			const strokeEnd = e.stroke[e.stroke.length - 1];
			const distance = Math.abs(Math.sqrt(Math.pow(strokeBegin[0] - strokeEnd[0], 2) + Math.pow(strokeBegin[1] - strokeEnd[1], 2)));
			if (distance > 30) {
				const selection = recognize(e.stroke, model);
				if (selection) {
					return { ...e, type: 'select', selection };
				}
			}
			return { ...e, type: 'cancel' };
		})
	);
	return merge(draw$, end$);
};

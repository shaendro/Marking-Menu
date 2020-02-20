import {
  createPEventFromMouseEvent,
  createPEventFromTouchEvent
} from './pointer-events';

describe('createPEventFromMouseEvent', () => {
  it('creates a pointer event from a mouse event', () => {
    const mouseEvt = {
      offsetX: 10,
      offsetY: 20,
      timeStamp: 1980
    };
    expect(createPEventFromMouseEvent(mouseEvt)).toEqual({
      position: [10, 20],
      timeStamp: 1980,
      originalEvent: mouseEvt
    });
    expect(createPEventFromMouseEvent(mouseEvt).originalEvent).toBe(mouseEvt);
  });
});

describe('createPEventFromTouchEvent', () => {
  it('creates a pointer event from a mouse event', () => {
    const touchEvent = {
      // Use an object instead of an array because it needs to work with
      // array-like objects (TouchEvent#targetTouches is not an array).
      targetTouches: {
        0: { offsetX: 23, offsetY: 12 },
        1: { offsetX: 0, offsetY: 2 },
        2: { offsetX: 10, offsetY: 4 },
        length: 3
      },
      timeStamp: 1990
    };
    expect(createPEventFromTouchEvent(touchEvent)).toEqual({
      position: [11, 6],
      timeStamp: 1990,
      originalEvent: touchEvent
    });
    expect(createPEventFromTouchEvent(touchEvent).originalEvent).toBe(
      touchEvent
    );
  });
});

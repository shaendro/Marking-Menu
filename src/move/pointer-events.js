// Create a custom pointer event from a touch event.
export const createPEventFromTouchEvent = touchEvt => {
  const touchList = Array.from(touchEvt.targetTouches);
  const sumX = touchList.reduce((acc, t) => acc + t.offsetX, 0);
  const sumY = touchList.reduce((acc, t) => acc + t.offsetY, 0);
  const meanX = sumX / touchList.length;
  const meanY = sumY / touchList.length;
  return {
    originalEvent: touchEvt,
    position: [meanX, meanY],
    timeStamp: touchEvt.timeStamp
  };
};

// Create a custom pointer from a mouse event.
export const createPEventFromMouseEvent = mouseEvt => ({
  originalEvent: mouseEvt,
  position: [mouseEvt.offsetX, mouseEvt.offsetY],
  timeStamp: mouseEvt.timeStamp
});

// Create a custom pointer from a pointer event.
export const createPEventFromPointerEvent = (rootDOM, pointerEvt) => {
  const bcr = rootDOM.getBoundingClientRect();
  return ({
    originalEvent: pointerEvt,
    position: [pointerEvt.clientX - bcr.left, pointerEvt.clientY - bcr.top],
    timeStamp: pointerEvt.timeStamp
  });
}

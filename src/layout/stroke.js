/**
 * @param {HTMLElement} parent - The parent node.
 * @param {Document} options - Options.
 * @param {Document} [options.doc=document] - The root document. Mostly useful for testing purposes.
 * @param {number} [options.lineWidth=2] - The width of the stroke.
 * @param {string} [options.lineColor='black'] - CSS representation of the stroke color.
 * @param {number} [options.startPointRadius=0] - The radius of the start point.
 * @param {number} [options.startPointColor=options.lineColor] - CSS representation of the start
 *                                                               point color.
 * @param {number} [options.ptSize=1 / devicePixelRatio] - The size of the canvas points
 *                                                         (px).
 * @return {{ clear, setStroke, remove }} The canvas methods.
 */
export default (
  parent,
  {
    doc = document,
    lineWidth = 2,
    lineColor = 'black',
    pointRadius = 0,
    pointColor = lineColor,
    ptSize = window.devicePixelRatio ? 1 / window.devicePixelRatio : 1
  }
) => {
  // Create the canvas.
  const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
  const canvas = doc.createElement('canvas');
  canvas.width = vw / ptSize;
  canvas.height = vh / ptSize;
  Object.assign(canvas.style, {
    position: 'fixed',
    left: 0,
    top: 0,
    width: '100vw',
    height: '100vh',
    'pointer-events': 'none'
  });
  parent.appendChild(canvas);

  // Get the canvas' context and set it up
  const ctx = canvas.getContext('2d');
  // Scale to the device pixel ratio.
  ctx.scale(1 / ptSize, 1 / ptSize);

  /**
   * @param {number[]} point - Position of the point to draw.
   * @return {undefined}
   */
  const drawPoint = ([x, y]) => {
    const bcr = parent.getBoundingClientRect();
    x += bcr.left;
    y += bcr.top;

    ctx.save();
    ctx.strokeStyle = 'none';
    ctx.fillStyle = pointColor;
    ctx.beginPath();
    ctx.moveTo(x + pointRadius, y);
    ctx.arc(x, y, pointRadius, 0, 360);
    ctx.fill();
    ctx.restore();
  };

  /**
   * Clear the canvas.
   *
   * @return {undefined}
   */
  const clear = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  /**
   * Draw the stroke.
   *
   * @param {List<number[]>} stroke - The new stroke.
   * @return {undefined}
   */
  const drawStroke = stroke => {
    if (stroke) {
      ctx.save();
      ctx.fillStyle = 'none';
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      stroke.forEach((point, i) => {
        const bcr = parent.getBoundingClientRect();
        const x = point[0] + bcr.left;
        const y = point[1] + bcr.top;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.restore();
    }
  };

  /**
   * Destroy the canvas.
   * @return {undefined}
   */
  const remove = () => {
    canvas.remove();
  };

  return { clear, drawStroke, drawPoint, remove };
};

const filter = require('./svg-filter');

function lines(svg) {
  const lineSVG = filter.onlyLines(svg);
  const lineElements = lineSVG.getElementsByTagName('line');

  return Array.prototype.slice.call(lineElements).map(lineEl => ({
    x1: lineEl.getAttribute('x1'),
    y1: lineEl.getAttribute('y1'),
    x2: lineEl.getAttribute('x2'),
    y2: lineEl.getAttribute('y2'),
  }));
}

module.exports = {
  lines,
};

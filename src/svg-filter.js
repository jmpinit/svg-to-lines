const pathToLines = require('./path-to-lines');

function createSVGElement(tag, opts) {
  const svgEl = document.createElementNS('http://www.w3.org/2000/svg', tag);

  if (tag === 'svg') {
    svgEl.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns', 'http://www.w3.org/2000/svg');
    svgEl.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:xlink', 'http://www.w3.org/1999/xlink');
  }

  Object.keys(opts || {}).forEach(attrName =>
    svgEl.setAttribute(attrName, opts[attrName]));

  return svgEl;
}

function naked(el) {
  return createSVGElement(el.nodeName);
}

function copyAttributes(a, b, attrs) {
  attrs.forEach((attrName) => {
    const value = b.getAttribute(attrName);

    if (value) {
      a.setAttribute(attrName, b.getAttribute(attrName));
    }
  });

  return a;
}

function filterLine(el) {
  const newLine = naked(el);
  copyAttributes(newLine, el, ['x1', 'y1', 'x2', 'y2']);
  return newLine;
}

function filterRect(el) {
  // TODO rounded corners using rx and ry
  const x = parseFloat(el.getAttribute('x'));
  const y = parseFloat(el.getAttribute('x'));
  const width = parseFloat(el.getAttribute('x'));
  const height = parseFloat(el.getAttribute('x'));

  const top = createSVGElement('line',
    { x1: x, y1: y, x2: x + width, y2: y });
  const bottom = createSVGElement('line',
    { x1: x, y1: y + height, x2: x + width, y2: y + height });
  const left = createSVGElement('line',
    { x1: x, y1: y, x2: x, y2: y + height });
  const right = createSVGElement('line',
    { x1: x + width, y1: y, x2: x + width, y2: y + height });

  const container = createSVGElement('g');

  [top, bottom, left, right].forEach(line => container.appendChild(line));

  return container;
}

function filterPath(el) {
  const lines = pathToLines(el.getAttribute('d'));

  if (lines.length === 0) {
    // Everything filtered away
    return undefined;
  }

  const lineGroup = createSVGElement('g');

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];

    // FIXME: handle points
    if (line.length > 1) {
      for (let j = 0; j < line.length - 1; j += 1) {
        const { x: x1, y: y1 } = line[j];
        const { x: x2, y: y2 } = line[j + 1];
        lineGroup.appendChild(createSVGElement('line', { x1, y1, x2, y2 }));
      }
    }
  }

  return lineGroup;
}

const tagHandlers = {
  // TODO circle
  line: filterLine,
  rect: filterRect,
  path: filterPath,
  svg: el => copyAttributes(naked(el), el, ['width', 'height']),
  g: naked,
};

function onlyLines(svgEl) {
  if (svgEl.nodeType !== Node.ELEMENT_NODE || !(svgEl.nodeName in tagHandlers)) {
    // Ignore it
    return undefined;
  }

  // Get an element made of lines without any children
  const filteredEl = tagHandlers[svgEl.nodeName](svgEl);

  // Add any children in their filtered form
  svgEl.childNodes.forEach((child) => {
    const filteredChild = onlyLines(child, filteredEl);

    if (filteredChild !== undefined) {
      filteredEl.appendChild(filteredChild);
    }
  });

  return filteredEl;
}

module.exports = { onlyLines };

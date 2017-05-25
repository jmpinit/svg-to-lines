const parse = require('svg-path-parser');
const Bezier = require('bezier-js');

class PathBot {
  constructor(density = 0.1) {
    this.density = density;

    this.x = 0;
    this.y = 0;

    this.currentPath = [];

    this.paths = [];
  }

  addPt(x, y) {
    this.currentPath.push({ x, y });
  }

  lastPt() {
    return this.currentPath[this.currentPath.length - 1];
  }

  finishPath() {
    if (this.currentPath.length > 0) {
      this.paths.push(this.currentPath);
      this.currentPath = [];
    }
  }

  moveto({ x, y, relative }) {
    this.finishPath();

    if (relative) {
      this.x += x;
      this.y += y;
    } else {
      this.x = x;
      this.y = y;
    }
  }

  lineto({ x, y, relative }) {
    this.addPt(this.x, this.y);

    if (relative) {
      this.x += x;
      this.y += y;
    } else {
      this.x = x;
      this.y = y;
    }

    this.addPt(this.x, this.y);
  }

  curveto({ relative, x1, y1, x2, y2, x, y }) {
    const startX = this.x;
    const startY = this.y;

    const endX = relative ? startX + x : x;
    const endY = relative ? startY + y : y;

    const curveX1 = relative ? this.x + x1 : x1;
    const curveY1 = relative ? this.y + y1 : y1;
    const curveX2 = relative ? this.x + x2 : x2;
    const curveY2 = relative ? this.y + y2 : y2;

    const isQuadratic = (x2 === undefined && y2 === undefined);

    const bezier = isQuadratic ?
      new Bezier(startX, startY,
        curveX1, curveY1,
        endX, endY) :
      new Bezier(startX, startY,
        curveX1, curveY1, curveX2, curveY2,
        endX, endY);

    this.addPt(this.x, this.y);

    bezier.getLUT(bezier.length() * this.density)
      .forEach(pt => this.addPt(pt.x, pt.y));

    const { x: lastX, y: lastY } = this.lastPt();
    this.x = lastX;
    this.y = lastY;
  }

  ellipticalArc({ relative, /* rx, ry, xAxisRotation, largeArc, sweep, */ x, y }) {
    // x = cx + rx * cos(theta) and y = cy + ry * sin(theta)
    // ends at x y
    // rx and ry are radii

    // FIXME placeholder for now
    this.addPt(this.x, this.y);
    this.x = relative ? this.x + x : x;
    this.y = relative ? this.y + y : y;
    this.addPt(this.x, this.y);
  }

  closepath() {
    if (this.currentPath.length > 0) {
      this.lineto(this.currentPath[0]);
    }

    this.finishPath();
  }

  do(command) {
    const commandName = command.command;

    if (commandName in this) {
      this[commandName](command);
    } else {
      const augCmd = Object.assign({}, command);

      // Commands which require augmentation
      switch (commandName) {
        case 'vertical moveto': {
          augCmd.x = this.x;
          this.moveto(augCmd);
          break;
        }
        case 'horizontal moveto': {
          augCmd.y = this.y;
          this.moveto(augCmd);
          break;
        }
        case 'vertical lineto': {
          augCmd.x = this.x;
          this.lineto(augCmd);
          break;
        }
        case 'horizontal lineto': {
          augCmd.y = this.y;
          this.lineto(augCmd);
          break;
        }
        case 'elliptical arc': {
          this.ellipticalArc(augCmd);
          break;
        }
        case 'smooth curveto': {
          // FIXME make based on previous command
          augCmd.x1 = this.x;
          augCmd.y1 = this.y;
          this.curveto(augCmd);
          break;
        }
        case 'quadratic curveto': {
          this.curveto(augCmd);
          break;
        }
        default:
          // console.warn(`Ignoring ${commandName}`);
          // Ignore unimplemented
          break;
      }
    }
  }
}

// d is the content of the "d" <path> attribute
function points(d) {
  const commands = parse(d);

  const svgBot = new PathBot();

  commands.forEach(cmd => svgBot.do(cmd));

  return svgBot.paths;
}

module.exports = points;

// tools/gorm2-dom.mjs - a canvas for tools/gorm2.mjs (claude/kingsfix): src/redraw/gorm_frames.js and kingswood_areas.js bake when they are imported (gorm2art), and Node has no document.
// tools/node-canvas.mjs does the pixel bakers; the gradients, paths and text the glow sprites use are no-ops here (this check reads logic, not pictures).
import { install } from './node-canvas.mjs';
install();
const P = Object.getPrototypeOf(document.createElement('canvas').getContext('2d'));
for (const k of ['createRadialGradient', 'createLinearGradient']) P[k] = () => ({ addColorStop() {} });
for (const k of ['beginPath', 'closePath', 'moveTo', 'lineTo', 'arc', 'ellipse', 'rect', 'roundRect', 'fill', 'stroke', 'fillText', 'strokeText', 'quadraticCurveTo', 'bezierCurveTo', 'clip']) P[k] = function () {};
P.measureText = () => ({ width: 0 });

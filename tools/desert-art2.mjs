// tools/desert-art2.mjs — renders src/redraw/desert2.js in Node: a contact sheet of every canvas (docs/desert-art2.png), x2.
// usage: node tools/desert-art2.mjs [out.png]
import { install, newCanvas, sheet, savePNG } from './node-canvas.mjs';
install();
const A = await import('../src/redraw/desert2.js');
const ui = A.bakeUI(), dust = A.bakeDustSheets();
const items = [A.bakeGreatRibcage(), A.bakeCaravanserai(), A.bakeArchPillar(), A.bakeWinch(), A.bakeCanopy(), A.bakeHollow(), dust.far, dust.near, A.bakeWell(), ...A.bakeMudWall(), A.bakeOasis(), ...ui.sun, ui.meter, ...ui.skin, ui.node];
const sh = sheet(items, { maxW: 640, bg: '#8fb8dc', pad: 6 }), big = newCanvas(sh.width * 2, sh.height * 2); big.getContext('2d').drawImage(sh, 0, 0, big.width, big.height);
savePNG(big, process.argv[2] || new URL('../docs/desert-art2.png', import.meta.url)); console.log('desert-art2:', items.length, 'canvases');

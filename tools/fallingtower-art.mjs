// tools/fallingtower-art.mjs — THE FALLING TOWER's own art rendered in Node, no browser (tools/node-canvas.mjs): the seven room back
// walls (src/redraw/fallen_tower.js), the tower's stone and slate ledge, and THE SEXTON's sheet (src/redraw/sexton.js), into
// docs/fallingtower/art/. Node renders are honest about construction and not about light (docs/AGENT-HANDOFF.md): the page captures
// (tools/fallingtower-shots.mjs) are the judge. Not in the suite: pictures are for eyes.   usage: node tools/fallingtower-art.mjs
import { install, sheet, savePNG } from './node-canvas.mjs';
import { mkdirSync } from 'fs';
import { join } from 'path';
import { ROOT } from './cdp.mjs';
install();
const FTW = await import('../src/redraw/fallen_tower.js'), { bakeSexton } = await import('../src/redraw/sexton.js');
const out = join(ROOT, 'docs/fallingtower/art'); mkdirSync(out, { recursive: true });
const rooms = ['library', 'reading', 'orrery', 'clock', 'lab', 'flip', 'dome'].map(st => { const c = document.createElement('canvas'); c.width = 768; c.height = 544; FTW.paintFallenRoom(c.getContext('2d'), st, 0, 0, 768, 544, 12, 50, 1.3); return c; });
savePNG(sheet(rooms.slice(0, 4), { maxW: 1560 }), join(out, 'rooms-1.png')); savePNG(sheet(rooms.slice(4), { maxW: 1560 }), join(out, 'rooms-2.png'));
const S = FTW.bakeFallenSkins(), Lg = FTW.bakeSlateLedge(); savePNG(sheet([...S.fallen, ...Lg.ledge], { scale: 6, maxW: 700 }), join(out, 'stone.png'));
savePNG(sheet(bakeSexton().R, { scale: 4, maxW: 2560 }), join(out, 'sexton.png'));
console.log('docs/fallingtower/art: rooms-1.png rooms-2.png stone.png sexton.png');

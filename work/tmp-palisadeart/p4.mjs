import { readFileSync, writeFileSync } from 'node:fs';
import { edit } from './patch.mjs';
const H = 'src/palisade-hands.js';
edit(H, "export const PROPS = {", "import * as PWB from './redraw/palisade_backdrop.js';   /* (claude/palisadeart) the skyline landmark is baked in src/redraw/palisade_backdrop.js */\nexport const PROPS = {");
let s = readFileSync(H, 'utf8'); const crlf = s.includes('\r\n');
const a = s.indexOf('  /* THE LANDMARK on the skyline'), b = s.indexOf('  return H;', a);
const nl = crlf ? '\r\n' : '\n';
const repl = ['  /* THE LANDMARK on the skyline (claude/palisadeart): THE PALISADE LINE and THE HALF-BUILT GATEHOUSE are baked and placed in src/redraw/palisade_backdrop.js (between the far wood and the mid row, so the trees stand in front of them);',
  '     this is what flies and smokes over the gatehouse: its rust pennant and the crew\'s fire */',
  '  H.drawSky = (g, cx, cy, VW, VH, time) => { PWB.drawLive(g, time || 0); };', ''].join(nl);
s = s.slice(0, a) + repl + s.slice(b); writeFileSync(H, s);

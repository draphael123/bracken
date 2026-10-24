import { readFileSync, writeFileSync } from 'node:fs';
import { edit } from './patch.mjs';
edit('src/redraw/palisade_world.js', "drawProp(g, ccx, ccy, lean, up, time, hash(d.id, 7)); }", "drawProp(g, ccx, ccy, lean, up, time, strHash(d.id)); }");
edit('src/redraw/palisade_world.js', "const GOLD = '#ffd36b'", "const strHash = k => { let h = 5381; for (let i = 0; i < k.length; i++) h = (Math.imul(h, 33) + k.charCodeAt(i)) >>> 0; return h; };\nconst GOLD = '#ffd36b'");
edit('src/redraw/palisade_world.js', "import { canvas, rect as RR, mulberry } from '../px.js';\nimport { WOOD, ROPE, IRON, RUST, LEAF, mix, hash } from './palisade_pal.js';", "import { canvas, mulberry } from '../px.js';\nimport { WOOD, ROPE, IRON, RUST, LEAF, mix } from './palisade_pal.js';");
const H = 'src/palisade-hands.js';
let s = readFileSync(H, 'utf8'); const crlf = s.includes('\r\n'), nl = crlf ? '\r\n' : '\n';
const a = s.indexOf('  /* ---------- DRAWING (GREYBOX'), b = s.indexOf("  /* the setter's mallet raised", a);
if (a < 0 || b < 0) throw new Error('markers');
const repl = ['  /* ---------- DRAWING (claude/palisadeart: every picture is in src/redraw/palisade_world.js; this file keeps the state and the rules) ---------- */',
  '  H.drawWorld = (g, cx, cy, VW, VH, time) => { if (!S) return; PWW.drawWorld({ g, S, lv: L(), ctx, cx, cy, VW, VH, time, propCells, PROPS, SETTER, standAt }); };', ''].join(nl);
s = s.slice(0, a) + repl + s.slice(b); s = s.replace("import * as PWB from './redraw/palisade_backdrop.js';", "import * as PWB from './redraw/palisade_backdrop.js'; import * as PWW from './redraw/palisade_world.js';");
writeFileSync(H, s);

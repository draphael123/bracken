// tools/lumber-vanish.mjs - A FELLED PINE NEVER VANISHES (claude/lumberfix, Daniel's playtest 10-19: "if a bridge falls or a tree falls, and you keep going, it seems to
// disappear visually. You go back and it reappears"). The prop draw culled every prop by its OWN x (+-40 px of the screen), and a felled pine's x is its STUMP: a trunk is up to
// 14 tiles long, so once the stump scrolled off the far end of the trunk stayed un-drawn until you came back. src/felling.js fellSpan() is the trunk's real span; main.js tests it.
// Pinned in the page: for each of the wood's trail pines, fell it, stand at its far end (and a few tiles past it), and assert the trunk sprite is drawn this frame while the stump
// is off the screen (the cull's case). Also a node-side check of fellSpan against fellCells.   node tools/lumber-vanish.mjs
import assert from 'node:assert/strict';
import { LEVELS, T } from '../src/level.js';
import { fellCells, fellSpan } from '../src/felling.js';
import { openPage } from './cdp.mjs';

const TS = 16, lv = LEVELS.find(l => l.id === 'wood'), L = lv.build(); let n = 0;
for (const e of L.ents.filter(q => q.t === 'felltree')) {   /* the span covers every cell the trunk lays, with slack, on every pine */
  const [x0, x1] = fellSpan(e), cells = fellCells(e, L.grid, L.W, T); assert.ok(cells.length > 0, e.role + ' lays cells');
  for (const [cx] of cells) assert.ok(cx * TS >= x0 && (cx + 1) * TS <= x1, e.role + ' cell ' + cx + ' is inside its span ' + x0 + '..' + x1); n++;
}
const pg = await openPage({ audio: false, fonts: false }); const fails = [], ok = (c, m) => { if (!c) fails.push(m); };
try {
  const r = await pg.evalp(`(async () => { const { LEVELS } = await import('/src/level.js'); const FE = await import('/src/felling.js'); const LTA = await import('/src/redraw/lumber_trail_art.js');
    BK.manualSimulation = true; BK.god = true; BK.SET.zoom = 'close'; BK.load(LEVELS.findIndex(l => l.id === 'wood')); BK.state = 'play'; BK.sim(60);
    const TS = 16, out = [], D = CanvasRenderingContext2D.prototype, di = D.drawImage;
    for (const pr of BK.props().filter(q => q.t === 'felltree' && q.ent.role !== 'hive')) {
      pr.felled = true; pr.fall = 1; pr.hp = 0; const e = pr.ent, R = FE.fellRamp(e), dir = pr.dir;
      let spr; if (!R) spr = LTA.trunkSprite(Math.max(4, pr.len), e.role); else { const a = R.foot, b = R.head, nn = Math.round(Math.hypot((b[0] + 1) * TS - a[0] * TS, b[1] * TS - a[1] * TS) / TS); spr = LTA.trunkSprite(Math.max(4, nn), e.role); }
      const far = R ? (dir > 0 ? R.head[0] + 1 : R.foot[0]) * TS : pr.x + dir * (pr.len * TS + 8), yy = R ? (dir > 0 ? R.head[1] : R.foot[1]) * TS : ((e.row !== undefined ? e.row : pr.ty) * TS);
      const rec = { role: e.role, len: pr.len, cases: [] };
      for (const past of [0, 3, 6]) {
        BK.P.x = far + dir * past * TS - dir * 6; BK.P.y = yy - 1; BK.P.vx = 0; BK.P.vy = 0; BK.step(45);
        const [cx] = BK.cam, VW = BK.view.VW, stumpOff = pr.x < cx - 40 || pr.x > cx + VW + 40; let drawn = 0;
        D.drawImage = function (im, ...a) { if (im === spr) drawn++; return di.call(this, im, ...a); }; try { BK.draw1(); } finally { D.drawImage = di; }
        const [s0, s1] = FE.fellSpan(e), shown = s1 >= cx && s0 <= cx + VW; rec.cases.push({ past, cx: Math.round(cx), VW, stumpOff, shown, drawn });
      }
      out.push(rec);
    }
    return out; })()`, 300000);
  let tested = 0;
  for (const p of r) for (const c of p.cases) { if (c.stumpOff && c.shown) { tested++; ok(c.drawn > 0, 'the ' + p.role + ' pine (' + p.len + ' tiles) VANISHED: its stump is off screen (cam ' + c.cx + ', ' + c.past + ' tiles past the crown) but part of the trunk is on screen and was not drawn'); } else if (c.shown) ok(c.drawn > 0, 'the ' + p.role + ' pine is on screen and was not drawn'); }
  console.log(r.map(p => p.role + ':' + p.cases.map(c => (c.stumpOff ? 'S' : 's') + (c.shown ? 'v' : '-') + c.drawn).join('/')).join('  ') + '  (S = stump culled, v = trunk in view, n = draws)');
  ok(tested >= 2, 'only ' + tested + ' stump-off-screen cases were exercised (the check would be vacuous)');
  ok(!pg.errors.length, 'the page threw: ' + pg.errors.slice(0, 3).join(' | '));
  n += tested;
} catch (e) { fails.push('lumber-vanish failed to run: ' + e.message); }
finally { await pg.close(); }
if (fails.length) { for (const f of fails) console.log('FAIL ' + f); process.exit(1); }
console.log('lumber-vanish: ' + n + ' assertions - a felled pine draws whenever any part of it is on screen.');

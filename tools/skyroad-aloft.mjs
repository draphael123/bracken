/* tools/skyroad-aloft.mjs - NOTHING IN THE SKY ROAD HANGS IN THE AIR (claude/skyroadart; the same idea as underwell-aloft / moor-aloft / unburied-aloft, Daniel's playtest 10-05: "this is floating").
   The Sky Road's ledges cross open sky; the art keys every one of them to the rock or to something that reaches it.
   NODE (no page):
     A  EVERY LEDGE STANDS ON SOMETHING   each end of every ONEWAY run is keyed into rock (a wall at its end or a solid tile under it: a corbel is drawn), or stands on a PIER that runs down to a
                                          solid top (<= 14 rows), or is STAYED (a cable to an iron ring set in a solid top <= 9 columns and <= 14 rows away), or - a short ledge let into a wall - is carried by a
                                          GIRDER back to that wall. A run longer than 8 tiles is held in the middle too where the floor is within 14 rows. 'none' is a ledge on nothing.
     B  EVERY PROP IS HELD UP             every dressing item the plan places stands on a solid / ledge top with air over it (floor kinds), hangs under a ledge (tails), or is fixed to a rock face
                                          (wall kinds); nothing stands on a sign, a stone, a checkpoint, a cage berth, a crumbling span or in a thermal's column.
     C  EVERY GROUNDED THING HAS A FOOTHOLD   signs, checkpoints, the stones and disc, the cloak and the loft, the masts, the Roc, and every foe that walks stand on a tile under their row that holds a foot.
   PAGE (PORT=<yours> node tools/skyroad-aloft.mjs --page):
     D  THE SUPPORTS ARE DRAWN            with the supports switched off (BK.skyroad().noSupports) and then on, the pixels under every pier differ - the picture really holds the ledge up.
   Run: node tools/skyroad-aloft.mjs [--page] */
import { install } from './node-canvas.mjs';
install();
const { LEVELS, T } = await import('../src/level.js');
const D = await import('../src/redraw/skyroad_dress.js');
const L = LEVELS.find(l => l.id === 'skyroad').build();
const at = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H ? T.SOLID : L.grid[y * L.W + x]);
let fails = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails++; };
const sup = D.planSupports(L, T);
const topOf = (x, y) => at(x, y) === T.SOLID && at(x, y - 1) !== T.SOLID;
/* A */
{ const bad = sup.filter(s => !s.ok), by = {}; for (const s of sup) for (const e of s.ends) by[e.how] = (by[e.how] || 0) + 1;
  ok(sup.length > 0 && bad.length === 0, sup.length + ' ledge runs, every end held (' + Object.entries(by).map(([k, v]) => v + ' ' + k).join(', ') + ')' + (bad.length ? ': ON NOTHING ' + bad.map(s => s.x0 + '-' + s.x1 + '@' + s.y).join('; ') : ''));
  const wrong = [];
  for (const s of sup) for (const e of s.ends) {
    if (e.how === 'post' && !(topOf(e.x, e.y1) && e.y1 - s.y <= 14)) wrong.push('pier ' + e.x + '@' + s.y);
    if (e.how === 'stay' && !(topOf(e.ax, e.ay) && Math.abs(e.ax - e.x) <= 9 && e.ay - s.y <= 14)) wrong.push('stay ' + e.x + '@' + s.y);
    if (e.how === 'girder' && !(at(e.wall, s.y) === T.SOLID && s.x1 - s.x0 + 1 <= 4)) wrong.push('girder ' + e.x + '@' + s.y);
    if (e.how === 'rock' && !(at(e.x - 1, s.y) === T.SOLID || at(e.x + 1, s.y) === T.SOLID || at(e.x, s.y + 1) === T.SOLID)) wrong.push('rock ' + e.x + '@' + s.y);
  }
  ok(!wrong.length, 'every pier stands on a solid top, every stay ends in a ring set in rock, every girder is let into a wall' + (wrong.length ? ': ' + wrong.join(', ') : ''));
  const long = sup.filter(s => s.x1 - s.x0 + 1 > 8 && !s.ends.some(e => e.x > s.x0 && e.x < s.x1) && (() => { for (let x = s.x0 + 6; x < s.x1 - 2; x += 6) for (let k = 1; k <= 14; k++) if (topOf(x, s.y + k)) return true; return false; })());
  ok(long.length === 0, 'a run over 8 tiles is held in the middle too where there is a floor to stand on' + (long.length ? ': ' + long.map(s => s.x0 + '-' + s.x1 + '@' + s.y).join('; ') : ''));
}
/* B */
const plan = D.planDress(L, T);
{
  const FLOOR = new Set(['cairn', 'bones', 'spool', 'kitefold', 'jar', 'sack', 'coil', 'tuft', 'rubble', 'anchor', 'nestb', 'brazier', 'lantern', 'pole']), WALL = new Set(['glyph', 'ring', 'streak']);
  const bad = [], ex = L.ents.filter(e => ['sign', 'check', 'sunstone', 'sundisc', 'cloak', 'loft', 'silver', 'stray', 'mast', 'gate'].includes(e.t)), therm = L.ents.filter(e => e.t === 'vent' && e.thermal);
  for (const it of plan.items) {
    const tx = Math.floor(it.x / 16), ty = Math.round(it.y / 16);
    if (FLOOR.has(it.k)) {
      const a = at(tx, ty), b = at(tx, ty - 1);
      if (!(a === T.SOLID || a === T.ONEWAY) || b !== T.AIR) bad.push(it.k + '@' + tx + ',' + ty + ' not on a top');
      if (it.k !== 'brazier' && it.k !== 'lantern' && ex.some(e => Math.abs(e.x - tx) <= 1 && Math.abs(e.y - (ty - 1)) <= 1)) bad.push(it.k + '@' + tx + ',' + ty + ' on an entity');
      if (therm.some(e => Math.abs(e.x - tx) <= 1 && Math.abs(e.y - (ty - 1)) <= 1)) bad.push(it.k + '@' + tx + ',' + ty + ' in a thermal foot');
      if ((L.crumbles || []).some(q => q.row === ty && tx >= q.x0 && tx <= q.x1)) bad.push(it.k + '@' + tx + ',' + ty + ' on a crumbling span');
    } else if (it.k === 'tails') {
      if (at(tx, ty - 1) !== T.ONEWAY && at(Math.floor((it.x + 8) / 16), ty - 1) !== T.ONEWAY) bad.push('tails@' + tx + ',' + ty + ' hangs from nothing');
    } else if (WALL.has(it.k)) {
      const wx = it.side < 0 ? Math.floor(it.x / 16) : Math.floor(it.x / 16) - 1, wy = Math.floor((it.y + 4) / 16);
      if (at(wx, wy) !== T.SOLID) bad.push(it.k + '@' + wx + ',' + wy + ' is not on a wall');
    } else bad.push('unknown kind ' + it.k);
  }
  ok(bad.length === 0, plan.items.length + ' dressing items, every one held up (' + [...new Set(plan.items.map(i => i.k))].length + ' kinds, ' + plan.lights.length + ' lights)' + (bad.length ? ': ' + bad.slice(0, 8).join('; ') : ''));
}
/* C */
{ const holds = t => t === T.SOLID || t === T.ONEWAY || t === T.PLANK;
  const GROUNDED = new Set(['sign', 'check', 'sunstone', 'sundisc', 'cloak', 'loft', 'mast', 'roc', 'shield', 'archer', 'rockgoblin', 'horn', 'goat', 'deco']);
  const bad = []; let n = 0;
  for (const e of L.ents) { if (!GROUNDED.has(e.t)) continue; n++; if (!holds(at(e.x, e.y + 1))) bad.push(e.t + ' at ' + e.x + ',' + e.y + ' has nothing under it (' + at(e.x, e.y + 1) + ')'); }
  ok(n > 40 && bad.length === 0, n + ' grounded things (signs, checkpoints, stones, disc, cloak, loft, masts, the Roc, the walking foes) each stand on a foothold' + (bad.length ? ': ' + bad.join('; ') : '')); }
/* D */
if (process.argv.includes('--page')) {
  const { openPage } = await import('./cdp.mjs'); const pg = await openPage({ audio: false });
  try {
    const todo = sup.filter(s => s.ends.some(e => e.how === 'post')).filter((s, i, a) => i % Math.max(1, Math.floor(a.length / 12)) === 0).slice(0, 12);
    const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true; BK.SET.hud = 'minimal'; BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'skyroad')); BK.state = 'play'; BK.god = true; BK.sim(90);
      for (const e of BK.enemies()) e.alive = false; const out = [], TS = 16, H = BK.skyroad();
      const grab = () => { const c = BK.view.buf, g = c.getContext('2d'); return g.getImageData(0, 0, c.width, c.height).data.slice(); };
      for (const s of ${JSON.stringify(todo)}) { for (const e of s.ends) { if (e.how !== 'post') continue;
        const x = e.x; BK.tp(x, s.y - 1); BK.sim(8); H.noSupports = true; const v = BK.look(x, s.y); const a = grab(); H.noSupports = false; BK.look(x, s.y); const b = grab();
        const vw = BK.view.VW, vh = BK.view.VH, col = Math.round(x * TS + 8 - v.cx), y0 = Math.round(e.y0 * TS - v.cy), y1 = Math.round(e.y1 * TS - v.cy); let rows = 0, diff = 0;
        for (let yy = Math.max(0, y0); yy < Math.min(vh, y1); yy++) { rows++; let d = 0; for (let dx = -6; dx <= 6; dx++) { const xx = col + dx; if (xx < 0 || xx >= vw) continue; const i = (yy * vw + xx) * 4; if (Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]) > 24) d = 1; } diff += d; }
        out.push({ run: s.x0 + '-' + s.x1 + '@' + s.y, how: e.how, x: e.x, rows, diff }); } }
      return out; })()`, 600000);
    const bad = r.filter(q => q.rows > 4 && q.diff < q.rows * 0.6);
    ok(r.length > 0 && bad.length === 0, r.length + ' piers sampled on the page, each drawn down its full length' + (bad.length ? ': ' + bad.map(q => q.run + ' col ' + q.x + ' ' + q.diff + '/' + q.rows).join('; ') : ''));
    if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
  } finally { pg.close(); }
}
console.log(fails ? '\nFAIL' : '\nskyroad-aloft: nothing floats');
process.exit(fails ? 1 : 0);

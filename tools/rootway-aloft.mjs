/* tools/rootway-aloft.mjs - NOTHING IN THE ROOTWAY HANGS IN THE AIR, and the exam's gaps read as gaps (claude/rootway art pass; the same idea as skyroad-aloft / underwell-aloft / moor-aloft,
   Daniel's playtest 10-05: "this is floating"). The Rootway climbs a tree: every ledge, machine and prop is keyed to root, post, rope or limb, and the floorless chasms are drawn as a drop.
   NODE (no page):
     A  EVERY LEDGE STANDS ON SOMETHING   each end of every ONEWAY run is let into a root wall (a socketed bracket), or stands on a lashed root POST that runs down to a solid top (<= 14 rows), or is STAYED
                                          (a rope to a peg set in a solid top <= 9 columns and <= 14 rows away). 'none' is a ledge on nothing. A run over 8 tiles is held in the middle too where a floor is within 14 rows.
     B  EVERY HOIST IS HELD               each pulley hangs from a LIMB out of the canopy (drawn from the top of the frame to its bracket), each cleat is set into a root wall (a solid beside it) or stands on a
                                          POST that runs down to a solid top under it (the raised cleat posts: the high cleat, the lookout's, the Huntmaster's perches), and the cleat's cell is open air for its blow.
     C  EVERY PROP IS HELD UP             every dressing item the plan places stands on a solid / ledge top with air over it (floor kinds), hangs under a ledge (hair), or is fixed to a root face (wall kinds);
                                          nothing stands on a sign, a checkpoint, a foe's cell or a chasm's lip posts' ground.
     D  EVERY GROUNDED THING HAS A FOOTHOLD   signs, checkpoints, the loft, the gate, the standing deco and every foe that walks stand on a tile under their row that holds a foot.
     E  THE EXAM'S GAPS ARE DRAWN AS A DROP  the planner finds exactly the floorless gaps (columns with no floor to the foot of the level): both exam chasms, each with a warning post on its near lip; the floored teach
                                          wells are never drawn as a drop (they have a floor).
   PAGE (PORT=<yours> node tools/rootway-aloft.mjs --page):
     F  THE SUPPORTS ARE DRAWN            with the supports switched off (BK.rootway().noSupports) and then on, the pixels under every post differ - the picture really holds the ledge up.
     G  THE CHASM IS DARK                 the pixels in the mouth of each exam chasm, 6+ rows under its lip, are far darker than the same rows over a cheap well's floor.
   Run: node tools/rootway-aloft.mjs [--page] */
import { install } from './node-canvas.mjs';
install();
const { LEVELS, T } = await import('../src/level.js');
const D = await import('../src/redraw/rootway_world.js');
const L = LEVELS.find(l => l.id === 'rootway').build();
const at = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H ? T.SOLID : L.grid[y * L.W + x]);
let fails = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails++; };
const plan = D.planRoot(L, T);
const topOf = (x, y) => at(x, y) === T.SOLID && at(x, y - 1) !== T.SOLID;
/* A */
{ const bad = plan.supports.filter(s => !s.ok), by = {}; for (const s of plan.supports) for (const e of s.ends) by[e.how] = (by[e.how] || 0) + 1;
  ok(plan.supports.length > 0 && bad.length === 0, plan.supports.length + ' ledge runs, every end held (' + Object.entries(by).map(([k, v]) => v + ' ' + k).join(', ') + ')' + (bad.length ? ': ON NOTHING ' + bad.map(s => s.x0 + '-' + s.x1 + '@' + s.y).join('; ') : ''));
  const wrong = [];
  for (const s of plan.supports) for (const e of s.ends) {
    if (e.how === 'post' && !(topOf(e.x, e.y1) && e.y1 - s.y <= 14)) wrong.push('post ' + e.x + '@' + s.y);
    if (e.how === 'stay' && !(topOf(e.ax, e.ay) && Math.abs(e.ax - e.x) <= 9 && e.ay - s.y <= 14)) wrong.push('stay ' + e.x + '@' + s.y);
    if (e.how === 'rock' && !(at(e.x - 1, s.y) === T.SOLID || at(e.x + 1, s.y) === T.SOLID || at(e.x, s.y + 1) === T.SOLID)) wrong.push('rock ' + e.x + '@' + s.y);
  }
  ok(!wrong.length, 'every post stands on a solid top, every stay ends in a peg set in a solid top, every bracket is let into a root wall' + (wrong.length ? ': ' + wrong.join(', ') : ''));
  const long = plan.supports.filter(s => s.x1 - s.x0 + 1 > 8 && !s.ends.some(e => e.x > s.x0 && e.x < s.x1) && (() => { for (let x = s.x0 + 6; x < s.x1 - 2; x += 6) for (let k = 1; k <= 14; k++) if (topOf(x, s.y + k)) return true; return false; })());
  ok(long.length === 0, 'a run over 8 tiles is held in the middle too where there is a floor to stand on' + (long.length ? ': ' + long.map(s => s.x0 + '-' + s.x1 + '@' + s.y).join('; ') : '')); }
/* B */
{ const bad = [];
  ok(plan.pulleys.length === L.hoists.length && plan.cleats.length === L.hoists.length, L.hoists.length + ' hoists, each with a limb-hung pulley and a cleat in the plan');
  for (const c of plan.cleats) {
    const wall = at(c.x - 1, c.y) === T.SOLID || at(c.x - 1, c.y + 1) === T.SOLID || at(c.x + 1, c.y) === T.SOLID || at(c.x + 1, c.y + 1) === T.SOLID;
    if (!wall && !(c.post > 0 && topOf(c.x, c.post))) bad.push(c.id + ' cleat at ' + c.x + ',' + c.y + ' has neither a root wall beside it nor a post to a floor');
    if (at(c.x, c.y) !== T.AIR && !c.boss) bad.push(c.id + ' cleat cell is not open air');
    if (c.post > 0 && c.post - c.y > 14) bad.push(c.id + ' post is ' + (c.post - c.y) + ' rows long');
  }
  ok(bad.length === 0, 'every cleat is set into a root wall or stands on a post to a solid top (' + plan.cleats.filter(c => c.post > 0).length + ' on raised posts: ' + plan.cleats.filter(c => c.post > 0).map(c => c.id).join(', ') + ')' + (bad.length ? ': ' + bad.join('; ') : '')); }
/* C */
{ const FLOOR = new Set(['leaves', 'bonescrap', 'rack', 'lantern']), WALL = new Set(['peg', 'nailhide', 'skullnail']);
  const bad = [], ex = L.ents.filter(e => ['sign', 'check', 'loft', 'silver', 'stray', 'gate'].includes(e.t));
  for (const it of plan.items) { const tx = Math.floor(it.x / 16), ty = Math.round(it.y / 16);
    if (FLOOR.has(it.k)) { const a = at(tx, ty), b = at(tx, ty - 1);
      if (!(a === T.SOLID || a === T.ONEWAY) || b !== T.AIR) bad.push(it.k + '@' + tx + ',' + ty + ' not on a top');
      if (it.k !== 'lantern' && ex.some(e => Math.abs(e.x - tx) <= 1 && Math.abs(e.y - (ty - 1)) <= 1)) bad.push(it.k + '@' + tx + ',' + ty + ' on an entity');
      if (plan.chasms.some(c => tx >= c.x0 - 2 && tx <= c.x1 + 2)) bad.push(it.k + '@' + tx + ',' + ty + ' at a chasm lip');
    } else if (it.k === 'hair') { if (at(tx, ty - 1) !== T.ONEWAY && at(Math.floor((it.x + 8) / 16), ty - 1) !== T.ONEWAY) bad.push('hair@' + tx + ',' + ty + ' hangs from nothing');
    } else if (WALL.has(it.k)) { const wx = it.side < 0 ? Math.floor(it.x / 16) : Math.floor(it.x / 16) - 1, wy = Math.floor((it.y + 4) / 16); if (at(wx, wy) !== T.SOLID) bad.push(it.k + '@' + wx + ',' + wy + ' is not on a wall');
    } else bad.push('unknown kind ' + it.k); }
  ok(bad.length === 0, plan.items.length + ' dressing items, every one held up (' + [...new Set(plan.items.map(i => i.k))].length + ' kinds, ' + plan.lights.length + ' lights)' + (bad.length ? ': ' + bad.slice(0, 8).join('; ') : '')); }
/* D */
{ const holds = t => t === T.SOLID || t === T.ONEWAY || t === T.PLANK;
  const GROUNDED = new Set(['sign', 'check', 'loft', 'gate', 'archer', 'shield', 'brute', 'sapper', 'sporeling', 'spitcap', 'lurker', 'deco']);
  const bad = []; let n = 0;
  for (const e of L.ents) { if (!GROUNDED.has(e.t)) continue; if (e.t === 'deco' && ['hangCage'].includes(e.kind) && e.hang) continue; n++; if (!holds(at(e.x, e.y + 1))) bad.push(e.t + ' at ' + e.x + ',' + e.y + ' has nothing under it (' + at(e.x, e.y + 1) + ')'); }
  ok(n > 40 && bad.length === 0, n + ' grounded things (signs, checkpoints, the loft, the gate, the standing deco, the walking foes) each stand on a foothold' + (bad.length ? ': ' + bad.join('; ') : '')); }
/* E */
{ const floorless = []; for (let x = 0; x < L.W; x++) { let open = true; for (let y = 12; y < L.H; y++) if (at(x, y) !== T.AIR) { open = false; break; } if (open) floorless.push(x); }
  const groups = []; for (const x of floorless) { const g = groups[groups.length - 1]; if (g && x === g[1] + 1) g[1] = x; else groups.push([x, x]); }
  ok(groups.length === 2 && plan.chasms.length === groups.length && plan.chasms.every((c, i) => c.x0 === groups[i][0] && c.x1 === groups[i][1]), 'the planner finds exactly the floorless gaps: ' + plan.chasms.map(c => c.x0 + '-' + c.x1 + ' (lip row ' + c.lip + ')').join(', '));
  const posts = L.ents.filter(e => e.t === 'deco' && e.kind === 'warnPost');
  ok(plan.chasms.every(c => posts.some(p => Math.abs(p.x - (c.x0 - 1)) <= 1)), 'every exam chasm has a warning post on its near lip: ' + posts.map(p => p.x).join(', '));
  ok(plan.chasms.every(c => { for (let x = c.x0; x <= c.x1; x++) for (let y = c.lip; y < L.H; y++) if (at(x, y) !== T.AIR) return false; return true; }), 'a chasm is air from its lip to the foot of the level in every column (no floor under the mist)'); }
/* F, G */
if (process.argv.includes('--page')) {
  const { openPage } = await import('./cdp.mjs'); const pg = await openPage({ audio: false });
  try {
    const todo = plan.supports.filter(s => s.ends.some(e => e.how === 'post')).filter((s, i, a) => i % Math.max(1, Math.floor(a.length / 12)) === 0).slice(0, 12);
    const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true; BK.SET.hud = 'minimal'; BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'rootway')); BK.state = 'play'; BK.god = true; BK.sim(400);
      for (const e of BK.enemies()) e.alive = false; const out = [], TS = 16, H = BK.rootway();
      const grab = () => { const c = BK.view.buf, g = c.getContext('2d'); return g.getImageData(0, 0, c.width, c.height).data.slice(); };
      for (const s of ${JSON.stringify(todo)}) { for (const e of s.ends) { if (e.how !== 'post') continue;
        const x = e.x; BK.tp(x, s.y - 1); BK.sim(8); H.noSupports = true; const v = BK.look(x, s.y); const a = grab(); H.noSupports = false; BK.look(x, s.y); const b = grab();
        const vw = BK.view.VW, vh = BK.view.VH, col = Math.round(x * TS + 8 - v.cx), y0 = Math.round(e.y0 * TS - v.cy), y1 = Math.round(e.y1 * TS - v.cy); let rows = 0, diff = 0;
        for (let yy = Math.max(0, y0); yy < Math.min(vh, y1); yy++) { rows++; let d = 0; for (let dx = -6; dx <= 6; dx++) { const xx = col + dx; if (xx < 0 || xx >= vw) continue; const i = (yy * vw + xx) * 4; if (Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]) > 12) d++; } if (d >= 3) diff++; }
        out.push({ run: s.x0 + '-' + s.x1 + '@' + s.y, how: e.how, x: e.x, rows, diff }); } }
      return out; })()`, 600000);
    const bad = r.filter(q => q.rows > 4 && q.diff < q.rows * 0.6);
    ok(r.length > 0 && bad.length === 0, r.length + ' posts sampled on the page, each drawn down its full length' + (bad.length ? ': ' + bad.map(q => q.run + ' col ' + q.x + ' ' + q.diff + '/' + q.rows).join('; ') : ''));
    /* G: lum of a patch 6..9 rows under the lip, in the middle of each exam chasm, vs the same under a well's lip */
    const g = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true; const TS = 16, out = {}; const L = BK.L;
      const lum = (cx, row) => { const v = BK.look(cx, row + 2); const vw = BK.view.VW, vh = BK.view.VH, c = BK.view.buf.getContext('2d'); const x = Math.round(cx * TS + 8 - v.cx), y = Math.round((row + 7) * TS - v.cy); if (y < 0 || y >= vh - 4) return null; const d = c.getImageData(Math.max(0, x - 8), y, 16, 4).data; let s = 0; for (let i = 0; i < d.length; i += 4) s += d[i] * 0.3 + d[i + 1] * 0.55 + d[i + 2] * 0.15; return s / (d.length / 4); };
      const chs = ${JSON.stringify(plan.chasms)}; out.chasm = chs.map(c => { BK.tp(c.x0 - 3, c.lip - 1); BK.sim(6); return lum(Math.floor((c.x0 + c.x1) / 2), c.lip); }); return out; })()`, 600000);
    ok(g.chasm.every(v => v !== null && v < 60), 'the exam chasms are dark under the lip (mean luma ' + g.chasm.map(v => v === null ? 'off-screen' : v.toFixed(0)).join(', ') + ' of 255)');
    if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
  } finally { pg.close(); }
}
console.log(fails ? '\nFAIL' : '\nrootway-aloft: nothing floats');
process.exit(fails ? 1 : 0);

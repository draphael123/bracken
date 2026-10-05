/* tools/underwell-aloft.mjs - NOTHING IN THE UNDERWELL HANGS IN THE AIR (claude/underwellart; the same idea as the unburied and moor lanes' aloft checks, Daniel's playtest 10-05:
   "this is floating"). The Underwell's scaffold boards and grated catwalks cross open halls; the art keys every one of them to the rock or to something that reaches it.
   NODE (no page):
     A  EVERY LEDGE STANDS ON SOMETHING   each end of every ONEWAY run is keyed into rock (a solid tile under it, or the wall at its end: a stone corbel / iron bracket is drawn), or is held
                                          by a POST that stands on a solid floor (<= 14 rows) or by CHAINS that hang from a solid ceiling (<= 16 rows) - src/redraw/underwell_dress.js
                                          planSupports(); a run longer than 12 tiles is held in the middle too. 'none' is a ledge on nothing.
     B  EVERY PROP IS HELD UP             every dressing item the plan places stands on a solid / ledge top with air over it (floor kinds), hangs from solid rock (ceilings), or is fixed to a
                                          wall face (wall kinds); nothing is placed on a rope, in a solid or in mid-air; nothing stands on a nest, a sign or a pickup.
   PAGE (PORT=<yours> node tools/underwell-aloft.mjs --page):
     C  THE SUPPORTS ARE DRAWN            with the supports switched off (BK.underwellHands().noSupports) and then on, the column under every post/chain end differs in >= 60% (chains: 40%, links have gaps) of its
                                          rows - the picture really holds the ledge up, it is not only a plan.
   Run: node tools/underwell-aloft.mjs [--page] */
import { install } from './node-canvas.mjs';
install();
const { LEVELS, T } = await import('../src/level.js');
const D = await import('../src/redraw/underwell_dress.js');
const L = LEVELS.find(l => l.id === 'underwell').build();
const at = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H ? T.SOLID : L.grid[y * L.W + x]);
let fails = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails++; };
const sup = D.planSupports(L, T);
/* A */
{ const bad = sup.filter(s => !s.ok), by = {}; for (const s of sup) for (const e of s.ends) by[e.how] = (by[e.how] || 0) + 1;
  ok(sup.length > 0 && bad.length === 0, sup.length + ' ledge runs, every end held (' + Object.entries(by).map(([k, v]) => v + ' ' + k).join(', ') + ')' + (bad.length ? ': ON NOTHING ' + bad.map(s => s.x0 + '-' + s.x1 + '@' + s.y).join('; ') : ''));
  /* the posts reach a floor and the chains a ceiling, really */
  const wrong = [];
  for (const s of sup) for (const e of s.ends) {
    if (e.how === 'post' && !(at(e.x, e.y1) === T.SOLID && at(e.x, e.y1 - 1) !== T.SOLID && e.y1 - s.y <= 14)) wrong.push('post ' + e.x + '@' + s.y);
    if (e.how === 'chain' && !(at(e.x, e.y0 - 1) === T.SOLID && s.y - e.y0 <= 16)) wrong.push('chain ' + e.x + '@' + s.y);
    if (e.how === 'strut' && !(at(e.wallX, s.y) === T.SOLID && at(e.wallX, e.y1) === T.SOLID)) wrong.push('strut ' + e.x + '@' + s.y);
  }
  ok(!wrong.length, 'every post stands on a solid floor, every chain hangs from a solid ceiling and every strut is let into the wall' + (wrong.length ? ': ' + wrong.join(', ') : ''));
  const long = sup.filter(s => s.x1 - s.x0 + 1 > 12 && !s.ends.some(e => e.x > s.x0 && e.x < s.x1));
  ok(long.length === 0, 'a run over 12 tiles is held in the middle too' + (long.length ? ': ' + long.map(s => s.x0 + '-' + s.x1 + '@' + s.y).join('; ') : ''));
  const keyedN = sup.filter(s => s.ends.every(e => e.how === 'rock' || e.how === 'corbel')).length;
  console.log('     (' + keyedN + ' runs keyed into rock at both ends)');
}
/* B */
{
  const plan = D.planDress(L, T);
  const FLOOR = new Set(['drum', 'drumTip', 'amph', 'pipeStub', 'spigot', 'rubble', 'husk', 'rack', 'coil', 'eggs', 'mound', 'stump', 'bucket']), CEIL = new Set(['pipeRun', 'chain']), WALL = new Set(['wallPipe', 'streak', 'niche', 'gouge']);
  const bad = [], ex = L.ents.filter(e => ['sign', 'check', 'skinwell', 'fountain', 'stray', 'silver', 'nestplug', 'oilfire', 'greatlamp', 'gate', 'sconce'].includes(e.t));
  for (const it of plan.items) {
    const tx = Math.floor(it.x / 16), ty = Math.round(it.y / 16);
    if (FLOOR.has(it.k)) {
      const a = at(tx, ty), b = at(tx, ty - 1);
      if (!(a === T.SOLID || a === T.ONEWAY) || b !== T.AIR) bad.push(it.k + '@' + tx + ',' + ty + ' not on a top');
      if (ex.some(e => Math.abs(e.x - tx) <= 1 && Math.abs(e.y - (ty - 1)) <= 1)) bad.push(it.k + '@' + tx + ',' + ty + ' on an entity');
      if (L.nests.some(m => tx >= m.x0 && tx <= m.x1 && ty - 1 >= m.y0 && ty - 1 <= m.y1)) bad.push(it.k + '@' + tx + ' in a nest');
    } else if (CEIL.has(it.k)) {
      const c = at(tx + (it.k === 'pipeRun' ? 1 : 0), ty - 1); if (c !== T.SOLID) bad.push(it.k + '@' + tx + ',' + ty + ' hangs from ' + c);
    } else if (it.k === 'web') {
      if (at(tx + (it.flip ? -1 : 0), ty - 1) !== T.SOLID) bad.push('web@' + tx + ',' + ty + ' hangs from nothing');
    } else if (WALL.has(it.k)) {
      const wx = it.k === 'wallPipe' ? Math.floor((it.x + 3) / 16) : Math.floor((it.x + 2) / 16), wy = Math.floor((it.y + 2) / 16);
      if (at(wx, wy) !== T.SOLID) bad.push(it.k + '@' + wx + ',' + wy + ' is not on a wall');
    } else bad.push('unknown kind ' + it.k);
  }
  ok(bad.length === 0, plan.items.length + ' dressing items, every one held up (' + [...new Set(plan.items.map(i => i.k))].length + ' kinds)' + (bad.length ? ': ' + bad.slice(0, 8).join('; ') : ''));
}
/* C */
if (process.argv.includes('--page')) {
  const { openPage } = await import('./cdp.mjs'); const pg = await openPage({ audio: false });
  try {
    const todo = sup.filter(s => s.ends.some(e => e.how === 'post' || e.how === 'chain')).filter((s, i, a) => i % Math.max(1, Math.floor(a.length / 14)) === 0).slice(0, 14);
    const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true; BK.SET.hud = 'minimal'; BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'underwell')); BK.state = 'play'; BK.god = true; BK.sim(90);
      for (const e of BK.enemies()) e.alive = false; const out = [], TS = 16, H = BK.underwellHands();
      const grab = () => { const c = BK.view.buf, g = c.getContext('2d'); return g.getImageData(0, 0, c.width, c.height).data.slice(); };
      for (const s of ${JSON.stringify(todo)}) { for (const e of s.ends) { if (e.how !== 'post' && e.how !== 'chain') continue;
        const x = e.x, y = s.y; BK.tp(x, y - 1); BK.sim(8); H.noSupports = true; const v = BK.look(x, y); const a = grab(); H.noSupports = false; BK.look(x, y); const b = grab();
        const vw = BK.view.VW, vh = BK.view.VH, col = Math.round(x * TS + 8 - v.cx), y0 = Math.round(e.y0 * TS - v.cy), y1 = Math.round(e.y1 * TS - v.cy); let rows = 0, diff = 0;
        for (let yy = Math.max(0, y0); yy < Math.min(vh, y1); yy++) { rows++; let d = 0; for (let dx = -5; dx <= 5; dx++) { const xx = col + dx; if (xx < 0 || xx >= vw) continue; const i = (yy * vw + xx) * 4; if (Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]) > 24) d = 1; } diff += d; }
        out.push({ run: s.x0 + '-' + s.x1 + '@' + s.y, how: e.how, x: e.x, rows, diff }); } }
      return out; })()`, 600000);
    const bad = r.filter(q => q.rows > 4 && q.diff < q.rows * (q.how === 'chain' ? 0.4 : 0.6));   /* a chain is links with gaps (about two rows in three); a post is solid but a prop may stand in front of it */
    ok(r.length > 0 && bad.length === 0, r.length + ' supports sampled on the page, each drawn down its full length' + (bad.length ? ': ' + bad.map(q => q.how + ' ' + q.run + ' col ' + q.x + ' ' + q.diff + '/' + q.rows).join('; ') : ''));
    if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
  } finally { pg.close(); }
}
console.log(fails ? '\nFAIL' : '\nunderwell-aloft: nothing floats');
process.exit(fails ? 1 : 0);

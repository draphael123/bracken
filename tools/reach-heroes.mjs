// tools/reach-heroes.mjs - EVERY HERO, HIS OWN LEGS, EVERY LEVEL (claude/reachcore, Daniel-approved 10-07).
// THE GLASS SEA's slide gap was frame-tight for every hero and passed every check: src/reachcore.js jumped SIX columns for everybody, counted a toe
// on the far lip as a landing, and had no slide. src/reachcore.js's opts.hero is the fix (src/reach-hero.js flies src/hero-move.js - the numbers
// main.js itself moves the hero by); this is its check.
//   A  THE NUMBERS: each hero's rise and running-jump carry, from a standstill, from a short run and at the sprint (Node). With --page (PORT) the same
//      jumps are taken in the game with real keys at full game speed and must agree within half a pixel - the model and the game share their numbers,
//      and this proves they share the arc too.
//   B  THE SLICK SLOPE: THE GLASS SEA's slide gap as it stood before claude/slickslope (the gentle three-row rise and the five-tile slick run, the old
//      slick glass that bled what it built) must NOT be crossed by any hero, and today's must be crossed by every hero - from the dune's crest.
//   C  EVERY LEVEL, EVERY HERO: what the shared fill reaches on the route (each checkpoint, the gate, the boss, a key, a gated elite) the hero's own fill
//      must reach too. Where it does not, the crossing the shared fill took is found (its path from the start, the first step the hero cannot take),
//      the fill is carried past it, and the next one is looked for - so the report is every crossing, not the first. Each comes with its margin:
//        TIGHT   a frame-perfect take-off lands, but with less than a hand's slack past the lip (a tile at a run): the Slick Slope class
//        SHORT   not even a toe on the lip from the very edge: the shared fill's six columns were a jump nobody has
//        RIDE    not a jump at all - a ride or a verb the fill follows for one model and not the other (a model gap)
//      Every crossing must be in KNOWN (with its reason: a level to fix, a model gap, a design call for Daniel) or the check fails; a KNOWN entry
//      that no longer happens fails too, so the list only shrinks.
//   node tools/reach-heroes.mjs [levels] [--heroes=knight,pyro] [--v] [--page]      (C is Node only; --page needs PORT)
import { LEVELS, T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';
import { heroJumps } from '../src/reach-hero.js';
import { HERO_MOVE_IDS, MOVE } from '../src/hero-move.js';

const args = process.argv.slice(2), only = args.find(a => !a.startsWith('--')), verbose = args.includes('--v');
const HEROES = (args.find(a => a.startsWith('--heroes=')) || '').slice(9).split(',').filter(Boolean);
const heroes = HEROES.length ? HEROES : HERO_MOVE_IDS, TS = 16;
let fails = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails++; };

/* ---- A. THE NUMBERS ---- */
{ console.log('== A. each hero\'s own jump (src/hero-move.js, flown by src/reach-hero.js at full game speed)');
  for (const h of heroes) { const J = heroJumps(h), st = J.fly(J.run(1)), run = J.fly(J.run(4)), sp = J.fly(J.run(24)), v = J.run(24).vx, slack = Math.max(TS, v * TS / MOVE.RUN);
    const widest = (f, need) => Math.floor((f.up[0] + 4 - need) / TS);   /* a flat gap, from the very edge: the centre a slack past the lip */
    console.log(`  ${h.padEnd(10)} rise ${J.risePx.toFixed(1)}px (${J.rise} rows)  carry: standing ${st.up[0].toFixed(0)}  run ${run.up[0].toFixed(0)} (${J.run(4).vx.toFixed(0)}px/s)  sprint ${sp.up[0].toFixed(0)} (${v.toFixed(0)}px/s)  widest flat gap with the slack: ${widest(run, TS)} at a run, ${widest(sp, slack)} at the sprint (a toe: ${widest(sp, -4)})`);
    ok(J.rise === 3 && sp.up[0] > run.up[0] - 0.01, h + ': three rows up, and the sprint carries at least as far as the run'); } }
if (args.includes('--page')) {
  /* the same jumps in the game, real keys, full game speed (SET.speed 1: the 0.6 default steps finer and carries a pixel or two further) */
  const { openPage } = await import('./cdp.mjs');
  const pg = await openPage({ audio: false, fonts: false });
  try { for (const h of heroes) {
    const r = await pg.evalp(`(async()=>{ const { LEVELS, T } = await import('/src/level.js');
      BK.manualSimulation = true; BK.setHero(${JSON.stringify(h)}); BK.reset({ fresh: true }); const S = BK.ui.settings(); const sp0 = S.speed; S.speed = 1;
      BK.load(LEVELS.findIndex(l => l.id === 'wood')); BK.state = 'play'; BK.god = true; BK.sim(5); for (const e of BK.enemies()) e.alive = false;
      const L = BK.level, W = L.W, at = (x, y) => L.grid[y * W + x]; let spot = null;
      for (let y = 6; y < L.H - 1 && !spot; y++) for (let x = 2; x < W - 45 && !spot; x++) { let ok = true; for (let k = 0; k < 40 && ok; k++) { if (at(x + k, y + 1) !== T.SOLID) ok = false; for (let d = 0; d < 6 && ok; d++) if (at(x + k, y - d) !== T.AIR) ok = false; } if (ok) spot = [x, y]; }
      const k = BK.keys, P = () => BK.P, clear = () => { for (const q of ['left', 'right', 'jump', 'down', 'up', 'atk', 'block']) k[q] = false; }, out = [];
      for (const run of [0, 24, 150]) { BK.tp(spot[0] + 1, spot[1]); clear(); P().vx = 0; P().vy = 0; BK.sim(20); P().runT = 0;
        for (let i = 0; i < run; i++) { k.right = true; BK.sim(1); }
        const x0 = P().x, y0 = P().y, vx0 = P().vx, rt = P().runT || 0; k.jump = true; BK.press('jump'); let top = y0;
        for (let j = 0; j < 200; j++) { k.right = true; k.jump = true; BK.sim(1); top = Math.min(top, P().y); if (j > 3 && P().ground) break; }
        out.push({ run, vx0, rt, dx: P().x - x0, rise: y0 - top }); clear(); }
      S.speed = sp0; return out; })()`, 180000);
    const J = heroJumps(h);
    for (const o of r) { const f = J.fly({ vx: o.vx0, runT: o.rt });   /* the model from the same take-off pace and run */
      ok(Math.abs(f.up[0] - o.dx) <= 0.5 && Math.abs(f.rise - o.rise) <= 0.5, `--page ${h}: after ${o.run} frames of run (${o.vx0.toFixed(0)}px/s) the game jumps ${o.dx.toFixed(1)}px across and ${o.rise.toFixed(1)} up; the model ${f.up[0].toFixed(1)} and ${f.rise.toFixed(1)}`); } }
  } finally { await pg.close(); }
}

/* ---- B. THE SLICK SLOPE, before and after claude/slickslope ---- */
/* THE GLASS SEA, columns 120-170, rows 28-40, as master 56c2cf92 built it (the gentle rise 128-133, the crest 134-136, five slick tiles 137-141, the foot 142,
   the crack 143-147, the landing 148 a row up). '#' rock, '=' plank, r/l steep slopes rising right/left, a/b the gentle pair rising right */
const PRE_SLIDE = [
  '...................................................',   // row 28
  '..............................######...............',   // row 29
  '...................................................',   // row 30
  '............ab###l....................===========..',   // row 31
  '..........ab######l................................',   // row 32
  '........ab#########l...............................',   // row 33
  '####################l....................r#########',   // row 34
  '#####################l......#######################',   // row 35
  '#######################.....#######################',   // row 36
  '#######################.....#######################',   // row 37
  '#######################.....#######################',   // row 38
  '#######################.....#######################',   // row 39
  '#######################.....#######################',   // row 40
];
{ console.log('== B. THE SLICK SLOPE: the Glass Sea\'s slide gap, from the dune\'s crest');
  const lv = LEVELS.find(l => l.id === 'glasssea'), now = lv.build(), TILE = { '.': T.AIR, '#': T.SOLID, '=': 2, r: 20, l: 21, a: 22, b: 23 };
  const pre = { ...now, grid: now.grid.slice() }; PRE_SLIDE.forEach((row, i) => { for (let k = 0; k < row.length; k++) pre.grid[(28 + i) * now.W + 120 + k] = TILE[row[k]]; });
  const OLD_GLASS = { acc: 300, cap: 1.3, keep: 1 };   /* the slick glass before claude/slickslope: slideStep bled anything over the hill's top speed, so the extra came to ~5 px/s */
  const crest = L => { for (let y = 0; y < L.H; y++) for (let x = 128; x <= 141; x++) { const t = L.grid[(y + 1) * L.W + x]; if (t === T.SOLID && L.grid[y * L.W + x] === T.AIR) return [x, y]; } };
  const gap = now.cracks.find(c => c.id === 'slideGap'), land = [gap.x1 + 2, gap.y - 2];   /* a tile in past the far lip (the lip itself is the toe), a row up */
  for (const [name, L, glass, want] of [['before (56c2cf92)', pre, OLD_GLASS, false], ['now', now, undefined, true]]) {
    const c = crest(L), shared = floodReach(L, T, { rides: true, seeds: [c] }).seen.has(land.join(','));
    console.log(`  --   ${name}: the shared fill (no slide, six columns) ${shared ? 'crosses' : 'does not cross'} it from the crest ${c} - it was never what passed it: glasssea-route's frame-perfect hand did`);
    for (const h of heroes) { const R = floodReach(L, T, { rides: true, hero: h, seeds: [c], heroGlass: glass }), got = R.seen.has(land.join(','));
      const m = R.heroMargin(gap.x0 - 1, gap.y - 1, land[0], land[1]);
      ok(got === want, `${name}: ${h} ${got ? 'crosses' : 'does not cross'} the slide gap from the crest (${m ? m.kind + ' ' + m.v + 'px/s, ' + (m.short > 0 ? Math.round(m.short) + 'px short of' : Math.round(-m.short) + 'px past') + ' a hand\'s slack past the lip' : '?'})`); } } }

/* ---- C. THE KNOWN CROSSINGS: 'level x,y>x,y': [the heroes it holds for, the reason]. From the sweep of 2026-10-08, each read on the map (claude/reachcore's report
   has the table). Every one is TIGHT - a frame-perfect take-off from the very edge lands (a toe on the lip, the mantle), a hand's slack past the lip does not: the old
   levels' standard four-wide gap is a hair short of Daniel's "a tile clear of the lip" for the slower legs. A fix at the level deletes its line (a stale line fails) ---- */
export const KNOWN = {
  'scree 220,2>226,3': ['knight warden pyro paladin pirate reaper geomancer', 'TIGHT (gap 3, down 1) to checkpoint 496,7: still there after claude/scree2's rework (the batch81 trial sweep, 10-09): frame-tight hops on the scree - QUESTION: narrow each gap a tile'],
  'scree 226,3>231,2': ['knight warden paladin pirate reaper geomancer', 'TIGHT (gap 3, up 1) to checkpoint 496,7: still there after claude/scree2's rework (the batch81 trial sweep, 10-09): frame-tight hops on the scree - QUESTION: narrow each gap a tile'],
  'scree 231,2>237,3': ['knight warden pyro paladin pirate reaper geomancer', 'TIGHT (gap 4, down 1) to checkpoint 496,7: still there after claude/scree2's rework (the batch81 trial sweep, 10-09): frame-tight hops on the scree - QUESTION: narrow each gap a tile'],
  'hanging 103,38>98,37': ['paladin', 'TIGHT (gap 3, up 1) to checkpoint 10,37: 9px short of the slack: a frame-perfect jump makes it (a toe on the lip, the mantle), a hand’s slack does not - QUESTION: narrow the gap a tile / lower the landing'],
  'spire 60,137>55,136': ['knight warden pyro paladin pirate reaper geomancer', 'TIGHT (gap 2, up 1) to checkpoint 6,131: 15px short of the slack: a frame-perfect jump makes it (a toe on the lip, the mantle), a hand’s slack does not - QUESTION: narrow the gap a tile / lower the landing'],
  'crown 168,59>174,59': ['knight warden paladin pirate reaper geomancer', 'TIGHT (gap 4, up 0) to checkpoint 242,63: 18px short of the slack: a frame-perfect jump makes it (a toe on the lip, the mantle), a hand’s slack does not - QUESTION: narrow the gap a tile / lower the landing'],
  'crown 134,63>139,62': ['paladin reaper', 'TIGHT (gap 4, up 1) to checkpoint 242,63: within 2px of the slack (the model is exact to a pixel at full game speed; the 0.6 default carries ~1.5px further): a hair - accept, or narrow the gap a tile'],
  'reef 457,16>462,15': ['knight warden paladin pirate reaper geomancer', 'TIGHT (gap 4, up 1) to checkpoint 484,25: 24px short of the slack: a frame-perfect jump makes it (a toe on the lip, the mantle), a hand’s slack does not - QUESTION: narrow the gap a tile / lower the landing'],
  'waymeet 138,35>143,34': ['paladin reaper', 'TIGHT (gap 4, up 1) to checkpoint 198,35: within 2px of the slack (the model is exact to a pixel at full game speed; the 0.6 default carries ~1.5px further): a hair - accept, or narrow the gap a tile'],
  'fields 33,33>39,33': ['knight warden paladin pirate reaper geomancer', 'TIGHT (gap 4, up 0) to checkpoint 66,33: 12px short of the slack: a frame-perfect jump makes it (a toe on the lip, the mantle), a hand’s slack does not - QUESTION: narrow the gap a tile / lower the landing'],
  'fields 126,23>131,22': ['knight warden paladin pirate reaper geomancer', 'TIGHT (gap 4, up 1) to checkpoint 291,33: 6px short of the slack: a frame-perfect jump makes it (a toe on the lip, the mantle), a hand’s slack does not - QUESTION: narrow the gap a tile / lower the landing'],
  'fields 142,23>147,22': ['knight warden paladin pirate reaper geomancer', 'TIGHT (gap 4, up 1) to checkpoint 291,33: 8px short of the slack: a frame-perfect jump makes it (a toe on the lip, the mantle), a hand’s slack does not - QUESTION: narrow the gap a tile / lower the landing'],
  'mage 568,10>574,10': ['paladin', 'TIGHT (gap 5, up 0) to checkpoint 589,10: within 2px of the slack (the model is exact to a pixel at full game speed; the 0.6 default carries ~1.5px further): a hair - accept, or narrow the gap a tile'],
  'fallingtower 24,149>30,149': ['knight warden pyro paladin pirate reaper geomancer', 'TIGHT (gap 5, up 0) to checkpoint 40,125: 18px short of the slack: a frame-perfect jump makes it (a toe on the lip, the mantle), a hand’s slack does not - QUESTION: narrow the gap a tile / lower the landing'],
  'fallingtower 30,149>36,149': ['knight warden pyro paladin pirate reaper geomancer', 'TIGHT (gap 5, up 0) to checkpoint 40,125: 18px short of the slack: a frame-perfect jump makes it (a toe on the lip, the mantle), a hand’s slack does not - QUESTION: narrow the gap a tile / lower the landing'],
  'fallingtower 36,149>42,149': ['knight warden pyro paladin pirate reaper geomancer', 'TIGHT (gap 5, up 0) to checkpoint 40,125: 18px short of the slack: a frame-perfect jump makes it (a toe on the lip, the mantle), a hand’s slack does not - QUESTION: narrow the gap a tile / lower the landing'],
  'fallingtower 42,149>48,149': ['knight warden pyro paladin pirate reaper geomancer', 'TIGHT (gap 5, up 0) to checkpoint 40,125: 18px short of the slack: a frame-perfect jump makes it (a toe on the lip, the mantle), a hand’s slack does not - QUESTION: narrow the gap a tile / lower the landing'],
  'witchlight 463,26>468,25': ['knight warden paladin pirate reaper geomancer', 'TIGHT (gap 4, up 1) to checkpoint 519,26: 8px short of the slack: a frame-perfect jump makes it (a toe on the lip, the mantle), a hand’s slack does not - QUESTION: narrow the gap a tile / lower the landing'],
  'unburied 33,36>39,36': ['paladin', 'TIGHT (gap 3, up 0) to checkpoint 142,36: within 2px of the slack (the model is exact to a pixel at full game speed; the 0.6 default carries ~1.5px further): a hair - accept, or narrow the gap a tile'],
  'fair 586,14>591,13': ['knight warden paladin pirate reaper geomancer', 'TIGHT (gap 4, up 1) to checkpoint 600,27: 8px short of the slack: a frame-perfect jump makes it (a toe on the lip, the mantle), a hand’s slack does not - QUESTION: narrow the gap a tile / lower the landing'],
  'fair 587,14>592,13': ['knight warden paladin pirate reaper geomancer', 'TIGHT (gap 3, up 1) to the boss 634,27: 8px short of the slack: a frame-perfect jump makes it (a toe on the lip, the mantle), a hand’s slack does not - QUESTION: narrow the gap a tile / lower the landing'],
  'fair 257,27>262,26': ['paladin reaper', 'TIGHT (gap 4, up 1) to checkpoint 383,27: within 2px of the slack (the model is exact to a pixel at full game speed; the 0.6 default carries ~1.5px further): a hair - accept, or narrow the gap a tile'],
  'fair 279,25>285,27': ['paladin reaper', 'TIGHT (gap 5, down 2) to checkpoint 383,27: 12px short of the slack: a frame-perfect jump makes it (a toe on the lip, the mantle), a hand’s slack does not - QUESTION: narrow the gap a tile / lower the landing'],
};

/* ---- C. the sweep ---- */
const ROUTE = { check: 'checkpoint', gate: 'the gate', key: 'a key' };
export function sweepLevel(L, hs = heroes, o = {}) {
  const base = floodReach(L, T, { rides: true, glassBeds: true }), W = L.W, key = (x, y) => x + ',' + y;   /* (glassBeds: the Glass Sea's fused beds and shard vault, as the hero fill has them - without it the shared fill stops at column 47 and the sweep had no target there) */
  const targets = L.ents.filter(e => ROUTE[e.t] || (e.elite && e.gate)).map(e => ({ x: e.x, y: e.y, what: ROUTE[e.t] || 'the elite ' + e.t }));
  if (L.arena && L.arena.boss) { const b = L.ents.find(e => e.t === L.arena.boss || e.t === L.arena.boss + 'lord'); if (b) targets.push({ x: b.x, y: b.y, what: 'the boss' }); }
  const tg = targets.filter(t => base.near(t.x, t.y));
  /* the shared fill's own tree, from the start: who reached whom */
  const parent = new Map(); { let sy = L.START.y; while (sy < L.H - 1 && !base.footing.has(key(L.START.x, sy))) sy++; const s0 = key(L.START.x, sy); parent.set(s0, null);
    const q = [[L.START.x, sy]]; while (q.length) { const [x, y] = q.shift(); base.expand(x, y, (a, b) => { const k = key(a, b); if (!base.footing.has(k) || parent.has(k)) return; parent.set(k, key(x, y)); q.push([a, b]); }); } }
  const cellNear = t => { let best = null, bd = 99; for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const k = key(t.x + dx, t.y + dy); if (parent.has(k) && Math.abs(dx) + Math.abs(dy) < bd) { bd = Math.abs(dx) + Math.abs(dy); best = k; } } return best; };
  const out = {};
  for (const hero of hs) {
    const seeds = [], spots = new Map(); let R = null;
    for (let it = 0; it < 60; it++) {
      R = floodReach(L, T, { rides: true, hero, seeds });
      const lost = tg.filter(t => !R.near(t.x, t.y)); if (!lost.length) break;
      let fresh = 0;
      for (const t of lost) { const c = cellNear(t); if (!c) continue; const path = []; for (let k = c; k; k = parent.get(k)) path.push(k); path.reverse();
        for (let i = 1; i < path.length; i++) if (R.seen.has(path[i - 1]) && !R.seen.has(path[i])) { const [ux, uy] = path[i - 1].split(',').map(Number), [vx, vy] = path[i].split(',').map(Number), id = path[i - 1] + '>' + path[i];
          if (!spots.has(id)) { const m = R.heroMargin(ux, uy, vx, vy); spots.set(id, { from: [ux, uy], to: [vx, vy], m, for: t.what + ' ' + t.x + ',' + t.y, cls: !m || m.high && m.short === Infinity ? 'RIDE' : m.toeShort <= 0 ? 'TIGHT' : 'SHORT' }); seeds.push([vx, vy]); fresh++; }
          break; } }
      if (!fresh) break;
    }
    const left = tg.filter(t => !R.near(t.x, t.y));
    out[hero] = { spots: [...spots.values()], left };
  }
  return { targets: tg, out };
}

const fmt = s => `${s.cls.padEnd(5)} ${s.from.join(',')}>${s.to.join(',')} (${s.m && s.m.lip !== undefined ? 'gap ' + (Math.abs(s.m.lip - s.from[0]) - 1) + ', ' : ''}${s.from[1] - s.to[1] >= 0 ? 'up ' : 'down '}${Math.abs(s.from[1] - s.to[1])})` + (s.m ? ` ${s.m.kind} ${s.m.v}px/s: ${s.m.short === Infinity ? 'over his head' : (s.m.short > 0 ? Math.round(s.m.short) + 'px short of the slack' : 'clear') + (s.m.toeShort > 0 ? ', ' + Math.round(s.m.toeShort) + 'px short of a toe' : '')}` : '') + '  [to ' + s.for + ']';

if (import.meta.url === 'file:///' + process.argv[1].replace(/\\/g, '/').replace(/^\//, '') || process.argv[1].endsWith('reach-heroes.mjs')) {
  console.log('== C. every level, every hero: the route the shared fill walks, in each hero\'s own legs');
  const seenKnown = new Set(); let total = 0;
  for (const lv of LEVELS) {
    if ((lv.hidden && !lv.secret) || (only && !only.split(',').includes(lv.id))) continue;
    const L = lv.build(), t0 = Date.now(), r = sweepLevel(L);
    const lines = [];
    for (const h of heroes) { const o = r.out[h]; for (const s of o.spots) { const id = lv.id + ' ' + h + ' ' + s.from.join(',') + '>' + s.to.join(','); total++;
        const kk = lv.id + ' ' + s.from.join(',') + '>' + s.to.join(','), kn = KNOWN[kk] && KNOWN[kk][0].split(' ').includes(h) ? KNOWN[kk] : null;
        if (kn) { seenKnown.add(id); if (verbose) lines.push('    known  ' + h.padEnd(9) + fmt(s) + '  - ' + kn[1]); }
        else { lines.push('    NEW    ' + h.padEnd(9) + fmt(s)); fails++; } }
      for (const t of o.left) lines.push('    LEFT   ' + h.padEnd(9) + t.what + ' ' + t.x + ',' + t.y + ' (no crossing found on the shared path)'); }
    console.log('  ' + lv.id.padEnd(13) + r.targets.length + ' route targets  ' + heroes.map(h => h.slice(0, 4) + ' ' + r.out[h].spots.length).join('  ') + '  (' + (Date.now() - t0) + 'ms)');
    for (const l of lines) console.log(l);
  }
  if (!only && !HEROES.length) for (const [k, [hs]] of Object.entries(KNOWN)) for (const h of hs.split(' ')) { const [l, c] = k.split(' '); if (!seenKnown.has(l + ' ' + h + ' ' + c)) { console.log('  FAIL STALE KNOWN ' + k + ' for ' + h + ': it no longer happens - take him off it'); fails++; } }
  console.log(fails ? '\nFAIL  reach-heroes: ' + fails : '\nok  reach-heroes: ' + total + ' known crossings, nothing new');
  process.exit(fails ? 1 : 0);
}

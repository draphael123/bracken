// tools/bc-bound-footing.mjs - THE SAND-BOUND STANDS ON WHAT IS DRAWN UNDER IT (claude/bc4fix, 2026-10-15; scratch/brief-buriedcity4fix-1015.md item 1).
// Daniel played Buried City 4 live: "sand-bound soldiers sometimes FLOAT". This loads the city, and for every SAND-BOUND (and, reported only with --all, every
// sand-drowned) stands a god hero by it and works every glass that moves the ground round it (its own glass, and every glass of a tilting dune / riser /
// sinker within 12 columns of it) - struck, run down, run out - with the hero beside it AND with the hero far off (a desert foe more than 420 px from the hero is
// not stepped by main.js: ground that moves under one then used to leave it hanging); then it STANDS the sand-bound ON the tilting dune by it and turns the dune
// both ways (the dune's turn used to lift whatever stood on it to the top of its slope TILE, up to 15 px over the drawn sand: src/buried-city-hands.js unbury).
// Every frame it measures the gap between the foe's feet and the footing under its body (solid, sand, one-way, or the slope's own surface at that x, across its
// width) - wherever the hero is. FAILS when a sand-bound stands (|vy| < 1, not knocked) more than 2 px over its footing for 3 frames running.
// `PORT=.. node tools/bc-bound-footing.mjs [--all]`. PROVED RED FIRST on master c33c3204 (the dune scenario; see work/claude/lane-done/claude-bc4fix.md).
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
const ALL = process.argv.includes('--all');
const pg = await openPage({ audio: false, fonts: false, seed: 7 });
let out;
try {
  out = await pg.evalp(`(async () => {
    const { LEVELS, T } = await import('/src/level.js'); const SL = await import('/src/slopes.js'); const TS = 16;
    BK.manualSimulation = true; BK.setHero('knight'); BK.reset({ fresh: true });
    const id = LEVELS.findIndex(l => l.id === 'buriedcity'); BK.load(id); BK.state = 'play'; BK.god = true; BK.sim(10);
    const L = BK.L, K = BK.buriedCity(), G = L.grid, W = L.W;
    const cell = (x, y) => (x < 0 || y < 0 || x >= W || y >= L.H) ? T.SOLID : G[y * W + x];
    const foot = t => t === T.SOLID || t === T.SOFT || t === T.CRATE || SL.isOneWay(t) || SL.isSlope(t);
    /* the footing's surface (px) under x, from a little above the feet down */
    const surf = (x, y) => { const tx = Math.floor(x / TS); for (let ty = Math.floor((y - 6) / TS); ty < L.H; ty++) { const t = cell(tx, ty); if (!foot(t)) continue;
        if (SL.isSlope(t)) { const s = SL.surfaceY(t, tx, ty, x); if (s < y - 6) continue; return s; } if (ty * TS < y - 6) continue; return ty * TS; } return 1e9; };
    const gapOf = e => { const hw = (e.w || 12) / 2 - 1; return Math.min(surf(e.x - hw, e.y), surf(e.x, e.y), surf(e.x + hw, e.y)) - e.y; };
    const foes = () => BK.enemies().filter(e => e.alive && e.t === 'ambusher' && (e.cnSkin === 'sandbound' || e.cnSkin === 'sanddrowned'));
    const rows = [];
    const watch = (tag, frames, onlyE) => { const streak = new Map();
      for (let f = 0; f < frames; f++) { if (BK.state === 'card') BK.cardClose(); BK.sim(1);
        for (const e of foes()) { if (onlyE && e !== onlyE) continue; const g = gapOf(e), standing = Math.abs(e.vy || 0) < 1 && !(e.stagger > 0);
          const k = (streak.get(e) || 0); if (standing && g > 2 && g < 1e8) { streak.set(e, k + 1); if (k + 1 === 3) rows.push({ tag, skin: e.cnSkin, at: Math.round(e.x / TS) + ',' + Math.round(e.y / TS), gap: Math.round(g), mode: e.st && e.st.mode, frame: f }); } else streak.set(e, 0); } } };
    const glassesNear = x => (K.glasses || []).filter(g => { const tiles = [...(K.tilts || []).filter(t => t.glass === g.id).map(t => [t.x0, t.x1]), ...(K.risers || []).filter(r => r.glass === g.id).map(r => [r.x0, r.x1])];
      return tiles.some(([a, b]) => x >= a - 12 && x <= b + 12); }).map(g => g.id);
    const strike = gid => { const g = K.glasses.find(q => q.id === gid); if (g) { g.t = g.dur; g.warned = false; } };
    const runOut = gid => { const g = K.glasses.find(q => q.id === gid); if (g) g.t = 0; };
    const seen = [], dunes = [];
    for (const e of foes()) {
      const tx = Math.floor(e.x / TS), bound = e.cnSkin === 'sandbound', gs = bound ? [...new Set([e.glass, ...glassesNear(tx)])].filter(Boolean) : [];
      seen.push({ skin: e.cnSkin, at: tx + ',' + Math.round(e.y / TS), glasses: gs, gap0: Math.round(gapOf(e)) });
      if (!bound && !${ALL}) continue;
      const tag = e.cnSkin + '@' + tx, row = Math.round(e.y / TS);
      /* the hero by it (on its own row, three tiles off: it wakes and comes at him) */
      BK.tp(tx - 3, row); watch(tag + ' woken', 240, e);
      for (const gid of gs) { strike(gid); watch(tag + ' ' + gid + ' struck (hero near)', 60 * 12, e); }
      /* the hero FAR off while every glass round it runs and runs out (measured all the while) */
      for (const gid of gs) { BK.tp(Math.max(2, tx - 40), row); BK.sim(5); strike(gid); watch(tag + ' ' + gid + ' struck (hero far)', 60 * 4, e); runOut(gid); watch(tag + ' ' + gid + ' ran out (hero far)', 120, e); }
      /* STOOD ON THE TILTING DUNE by it, the dune turned both ways - near and far */
      if (!bound) continue;
      for (const t of (K.tilts || []).filter(q => Math.abs(q.x0 - tx) <= 12 || Math.abs(q.x1 - tx) <= 12)) {
        for (const far of [false, true]) { strike(t.glass); BK.sim(30);
          const x = (t.x0 + 3) * TS + 4, s = surf(x, (t.lo - 6) * TS); e.x = x; e.y = s; e.vy = 0; if (e.st) { e.st.x = x; e.st.y = s; }
          BK.tp(far ? Math.max(2, t.x0 - 40) : t.x0 - 4, far ? row : t.lo - 1); BK.sim(2); dunes.push(tag + ' on the dune ' + t.x0 + (far ? ' (hero far)' : ' (hero near)'));
          runOut(t.glass); watch(tag + ' on the dune ' + t.x0 + ', it turned' + (far ? ' (hero far)' : ' (hero near)'), 90, e); strike(t.glass); watch(tag + ' on the dune ' + t.x0 + ', turned back' + (far ? ' (hero far)' : ' (hero near)'), 90, e); runOut(t.glass); BK.sim(30); }
        e.x = tx * TS + 8; e.y = row * TS; e.vy = 0; if (e.st) { e.st.x = e.x; e.st.y = e.y; } }
    }
    return { rows, seen, dunes, n: foes().filter(e => e.cnSkin === 'sandbound').length };
  })()`, 1800000);
  out.errors = pg.errors.slice(0, 3);
} finally { pg.close(); }
for (const s of out.seen) console.log('  ' + s.skin.padEnd(12) + ' at ' + s.at.padEnd(8) + ' gap as built ' + s.gap0 + ' px' + (s.glasses.length ? '  glasses round it: ' + s.glasses.join(' ') : ''));
console.log('  dune turns under a sand-bound: ' + out.dunes.length + ' (' + out.dunes.join('; ') + ')');
for (const r of out.rows) console.log('  FLOATS: ' + r.tag + ' - ' + r.skin + ' ' + r.gap + ' px over its footing at ' + r.at + ' (' + r.mode + ', frame ' + r.frame + ')');
assert.ok(out.n >= 4, 'the city has its four sand-bound (found ' + out.n + ')');
assert.ok(out.dunes.length >= 4, 'two sand-bound stood on a tilting dune, near and far (got ' + out.dunes.length + ')');
assert.deepEqual(out.errors, [], 'page errors');
assert.deepEqual(out.rows.filter(r => r.skin === 'sandbound'), [], 'a sand-bound stood more than 2 px over what is under it');
console.log('bc-bound-footing: every sand-bound (' + out.n + ') stands on its footing - its glasses and the dunes round it struck and run out with the hero near and far, and stood on a turning dune');

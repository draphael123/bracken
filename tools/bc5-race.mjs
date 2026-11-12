/* tools/bc5-race.mjs - BC5 WALK (claude/bc5-l, 11-12): THE REAL-PAGE RACE per hero (BRACKEN_BC5=1). Each hero is put left of a race's first glass, walks right and swings at it (the first swing in reach strikes it:
   the clock starts when BK.flip() reads that glass running), then RUNS: hold right, hop at a gap or a wall (read from the grid, no play bot - it waits at hazards), swing every 12 frames (a passing swing re-strikes a pad).
   Prints pass/fail, seconds from the strike to the far end, hp lost. Not the model's margin (tools/buried-city5.mjs has that table); it is what a hand that knows the room achieves.
   node tools/bc5-race.mjs [r2|r3|r4] [--heroes=knight,reaper,...] [--trace] [--scale=0.8: every glass run x0.8 (stress)] */
import { openPage } from './cdp.mjs';
const args = process.argv.slice(2), opt = (k, d) => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const which = args.find(a => /^r[1-4]$/.test(a)) || 'r2', heroes = opt('heroes', 'knight,warden,pyro,paladin,pirate,reaper,geomancer,berserker,ranger').split(',');
const RACES = { r1: { from: [165.5, 28], first: 'race1', end: 185, ey: 28 }, r2: { from: [598.5, 32], first: 'span', end: 610, ey: 32 }, r3: { from: [659.5, 32], first: 'r3a', end: 675, ey: 22 }, r4: { from: [820.5, 32], first: 'ante', end: 842, ey: 32 } };
const R = RACES[which], pg = await openPage();
try {
  for (const hero of heroes) {
    const d = await pg.evalp(`(async()=>{ BK.manualSimulation = true; BK.setHero(${JSON.stringify(hero)}); BK.reset({ fresh: true });
      const { LEVELS, T } = await import('/src/level.js');
      BK.load(LEVELS.findIndex(l => l.id === 'buriedcity')); BK.state = 'play'; BK.start(); BK.god = false; BK.reset(); BK.sim(900); for (const e of BK.enemies()) if (!e.boss) e.alive = false;
      BK.P.x = ${R.from[0]} * 16; BK.P.y = (${R.from[1]} + 1) * 16; BK.P.vx = BK.P.vy = 0; BK.sim(30);
      const SOL = new Set([T.SOLID, T.CRATE, T.PALISADE, T.PORT, T.SOFT, T.ICE]), cell = (c, r) => (c < 0 || c >= BK.L.W) ? T.SOLID : BK.L.grid[r * BK.L.W + c];
      const solid = (c, r) => SOL.has(cell(c, r)), hp0 = BK.P.hp, d0 = BK.stats().deaths, endX = ${R.end} * 16; let f = 0, got = -1, t0 = -1, ran = 0, jf = -99; const tr = [];
      for (; f < 1500; f++) {
        const P = BK.P, fl = BK.flip(), g = fl && fl.glasses.find(q => q.id === ${JSON.stringify(R.first)});
        if (t0 < 0 && g && g.t > 0) t0 = f;
        const col = Math.floor((P.x + (P.face > 0 ? 9 : -9)) / 16), row = Math.floor((P.y - 1) / 16);
        BK.keys.left = false; BK.keys.right = P.x < endX; BK.keys.jump = !P.ground && P.vy < 0 && f - jf < 40;   /* a hop is HELD while he rises (a tap is a short hop) */
        if (P.ground && (solid(col, row) || solid(col, row - 1) || !(solid(col, row + 1) || [T.ONEWAY, T.PLANK].includes(cell(col, row + 1))))) { BK.keys.jump = true; jf = f; BK.press('jump'); }
        const near = (BK.L.glasses || []).some(q => { const st = fl && fl.glasses.find(z => z.id === q.id); return Math.abs(q.x * 16 + 8 - P.x) < 30 && Math.abs(q.y * 16 - P.y) < 40 && !(st && st.t > 0.3); });
        if (near && f % 14 === 5) { P.face = 1; BK.press('atk'); }
        BK.sim(1); if (t0 >= 0) ran = f - t0;
        if (${args.includes('--trace')} && f % 15 === 0 && f < 900) tr.push(f + ':' + (P.x / 16).toFixed(1) + ',' + (P.y / 16).toFixed(1) + (P.ground ? 'g' : 'a') + (fl && fl.risers.filter(z => z.x0 >= 660 && z.x0 <= 674).map(z => ' R' + z.x0 + '=' + z.up + (z.solid ? 's' : '')).join('')));
        if (P.x >= endX && P.y <= ${R.ey} * 16 + 40) { got = f; break; } if (BK.stats().deaths > d0) break; }
      return { hero: ${JSON.stringify(hero)}, ok: got >= 0, secs: got >= 0 && t0 >= 0 ? +((got - t0) / 60).toFixed(2) : null, struckAt: t0, deaths: BK.stats().deaths - d0, hpLost: Math.round(hp0 - BK.P.hp), at: (BK.P.x / 16).toFixed(1) + ',' + (BK.P.y / 16).toFixed(1), tr: tr.join(' ') }; })()`);
    console.log(which, JSON.stringify(d));
  }
} finally { pg.close(); }

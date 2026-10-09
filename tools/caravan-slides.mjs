// tools/caravan-slides.mjs - THE SUNKEN CARAVAN's DUNE SLIDES, MEASURED PER HERO WITH REAL KEYS (claude/caravan2; Daniel 10-09: "big hills you slide down
// for jumps"). A page check (PORT). Every REQUIRED slide in L.duneSlides (the teach, the big dune, the exam's; 'beds' is optional - its pit has a wagon bed
// to hop) is driven for every hero (knight, warden, pyro, paladin, pirate, reaper, geomancer) on a fresh save, base movement, god and no foes, keys held as a
// hand holds them (BK.keys, BK.press - the keyboard's own path), from the dune's crest:
//   A  THE TEACH IS REAL: a plain run down the dune (no slide) and a jump - from ANY frame before the foot runs out - never makes the far side: it lands
//      in the quicksand (or short of the lip)
//   B  THE SLIDE CLEARS IT WITH ROOM: right + DOWN held from the crest, a full jump (26 frames) at the foot lands >= SPARE tiles past the pit's far lip
//   C  A HUMAN'S WINDOW: >= WINDOW frames of take-off clear it
//   D  A SHORTER PRESS: the same with the jump held 14 frames still clears from the foot
//   PORT=8787 node tools/caravan-slides.mjs [heroes]   exit 1 on any failure; prints the numbers per hero and slide
import { openPage } from './cdp.mjs';
const HEROES = (process.argv[2] || 'knight,warden,pyro,paladin,pirate,reaper,geomancer').split(',');
const SPARE = 0.75, WINDOW = 8;
let fails = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails++; };
const pg = await openPage({ audio: false, fonts: false });
try {
  for (const hero of HEROES) {
    const R = await pg.evalp(`(async()=>{
      const { LEVELS } = await import('/src/level.js'); const TS = 16;
      BK.manualSimulation = true; BK.setHero(${JSON.stringify(hero)}); BK.reset({ fresh: true });
      BK.load(LEVELS.findIndex(l => l.id === 'caravan')); BK.state = 'play'; BK.god = true; BK.sim(5);
      const L = BK.level, P = () => BK.P, k = BK.keys;
      const clear = () => { for (const q of ['left', 'right', 'jump', 'down', 'up', 'atk', 'block']) k[q] = false; };
      const top = x => { for (let y = 0; y < L.H; y++) { const t = L.grid[y * L.W + x]; if (t !== 0) return y; } return L.H; };
      const out = [];
      for (const s of (L.duneSlides || []).filter(s => s.id !== 'beds')) {
        for (const e of BK.enemies()) e.alive = false;
        const lipX = (s.gap[1] + 1) * TS, crestX = s.crest * TS + 8;
        const start = () => { for (const e of BK.enemies()) e.alive = false; BK.tp(s.crest, top(s.crest) - 1); P().vx = P().vy = 0; P().qsDepth = 0; clear(); BK.sim(12); let n = 0;
          while (Math.abs(P().x - crestX) > 2 && n++ < 200) { clear(); k[crestX > P().x ? 'right' : 'left'] = true; BK.sim(1); } clear(); P().vx = 0; BK.sim(8); };
        /* one try: hold right (+down when slide) for f frames, then the jump held hold frames; null when it left the ground first (ran off into the pit) */
        const one = (f, slide, hold) => { start();
          for (let i = 0; i < f; i++) { k.right = true; k.down = slide; BK.sim(1); if (!P().ground || P().qsDepth > 0) return null; }
          const x0 = P().x, vx0 = P().vx; k.down = false; k.jump = true; BK.press('jump'); let fell = false;
          for (let j = 0; j < 150; j++) { k.right = true; k.jump = j < hold; BK.sim(1); if (P().qsDepth > 0) { fell = true; break; } if (j > 4 && P().ground) break; }
          clear(); return { f, x0: +(x0 / TS).toFixed(2), vx0: Math.round(vx0), fell, spare: fell ? null : +((P().x - lipX) / TS).toFixed(2) }; };
        /* how many frames the run down takes before it leaves the ground at the foot: then only the last stretch is swept */
        const reach = slide => { start(); for (let i = 0; i < 400; i++) { k.right = true; k.down = slide; BK.sim(1); if (!P().ground || P().qsDepth > 0) { clear(); return i; } } clear(); return 400; };
        const sweep = (slide, hold) => { const n = reach(slide), res = []; for (let f = Math.max(0, n - 40); f <= n; f++) { const q = one(f, slide, hold); if (q) res.push(q); } return res; };
        out.push({ id: s.id, crest: s.crest, gap: s.gap, slide: sweep(true, 26), short: sweep(true, 14), run: sweep(false, 26) });
      }
      return out; })()`, 1800000);
    console.log('\n== ' + hero);
    const across = q => q && !q.fell && q.spare >= 0;
    for (const r of R) { const best = a => a.filter(across).sort((p, q) => q.spare - p.spare)[0], foot = a => a[a.length - 1];
      const runBest = best(r.run), sl = foot(r.slide), sh = foot(r.short), win = r.slide.filter(across).length, vmax = Math.max(...r.slide.map(q => q.vx0));
      ok(!runBest, r.id + ' (pit ' + r.gap.join('-') + '): A  a plain run and jump never makes the far side (' + (runBest ? 'IT DID, ' + runBest.spare + ' tiles past from x ' + runBest.x0 : 'best: ' + (r.run.some(q => !q.fell) ? 'short of the lip' : 'in the sand') + ', ' + r.run.length + ' take-offs') + ')');
      ok(across(sl) && sl.spare >= SPARE, r.id + ': B  the slide-jump off the foot lands ' + (sl ? (sl.fell ? 'IN THE SAND' : sl.spare + ' tiles past the lip') : 'nowhere (no take-off)') + ' (>= ' + SPARE + '), at ' + vmax + ' px/s');
      ok(win >= WINDOW, r.id + ': C  ' + win + ' frames of take-off clear it (>= ' + WINDOW + ')');
      ok(across(sh), r.id + ': D  a 14-frame jump off the foot lands ' + (sh ? (sh.fell ? 'IN THE SAND' : sh.spare + ' tiles past') : 'nowhere') + '; window ' + r.short.filter(across).length + ' frames');
      if (process.argv.includes('--v')) for (const k of ['slide', 'run']) console.log('   ' + k + ': ' + r[k].map(q => q.x0 + (q.fell ? 'X' : '>' + q.spare) + '@' + q.vx0).join(' ')); }
  }
} finally { await pg.close(); }
console.log(fails ? '\nFAIL  caravan-slides: ' + fails : '\nok  caravan-slides: every hero clears every required dune slide with room, and a plain jump does not');
process.exit(fails ? 1 : 0);

// PAGE TOOL: opens a headless Chrome (cdp.mjs). Run with BRACKEN_OWL4=1 for the flag ON row (claude/owl4-d; the OWL4 owed list item 1).
// tools/owl4-perch-walk.mjs - THE OWL REEVE'S FEET (OWL4 perch fix R1/R5), IN THE PAGE.
//   A. the real fight, hero in god mode walking the arena, THE OWL REEVE left to run: EVERY frame she is on a floor rest (descend, grounded, crash, perchDown, pinned,
//      stuckTalons, stoopLand, stoopDown, slammed, netted, a skim/swoop landed) the cell(s) under her feet must be solid and not over a drop column.
//   B. every floor-rest mode forced at every 16 px across the arena (hole edges included): after two frames she must stand on board, clear of a hole.
//   (R5, the draw foot vs the floor: by eye, tools/owl4-look.mjs scene perch-foot)
//   node tools/owl4-perch-walk.mjs [seconds=150]
import { openPage } from './cdp.mjs';
const secs = +(process.argv[2] || 150);
const pg = await openPage({ audio: false, fonts: false });
let R;
try {
  R = await pg.evalp(`(async()=>{
    const { LEVELS } = await import('/src/level.js'); const O4 = await import('/src/owl4.js');
    BK.manualSimulation = true; BK.SET.speed = 1; const out = { owl4: O4.owl4On() };
    const K = BK.keys, none = () => { for (const k of ['left','right','up','down','jump','block','atk','dodge']) K[k] = false; };
    BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'hanging')); BK.state = 'play'; BK.start(); BK.god = true; BK.sim(5); BK.reset();
    const L = BK.L, A = L.arena, FL = A.floor, W = L.W, row = Math.round(FL / 16);
    BK.tp(Math.round(A.trigger / 16) + 4, Math.round(FL / 16) - 1); BK.sim(150); none();
    const owl = BK.enemies().find(e => e.t === 'owl' && e.alive); if (!owl) return { err: 'no owl' };
    out.arena = { x0: A.x0, x1: A.x1, floor: FL, drops: A.drops };
    const REST = new Set(['descend','grounded','crash','perchDown','pinned','stuckTalons','stoopLand','stoopDown','slammed','netted']);
    const isRest = e => REST.has(e.mode) || (e.mode === 'skimTell' && e.skimAt) || (e.mode === 'swoopTell' && e.swAt);
    const cell = c => c >= 0 && c < W && !!L.grid[row * W + c];
    const overDrop = x => (A.drops || []).some(([a, b]) => x > a * 16 - 2 && x < (b + 1) * 16 + 2);
    const bad = (e) => { const x = e.x, c0 = Math.floor((x - 6) / 16), c1 = Math.floor((x + 6) / 16), mid = Math.floor(x / 16);
      const miss = []; for (let c = c0; c <= c1; c++) if (!cell(c)) miss.push(c);
      return (!cell(mid) || overDrop(x)) ? { x: Math.round(x), y: Math.round(e.y), mode: e.mode, miss, drop: overDrop(x) } : null; };
    /* A: the real fight */
    /* one move at a time (the bag holds just that move), both phases, the hero at 9 places across the arena */
    const seen = {}, viol = [], dy = {}, hist = {}; let t = 0, nseg = 0; const T = ${secs} * 60, MOVES = ['swoop','skim','plunge','stoop','net','gust','pellet','fan','bough','screech','ropecut','lampdrop'];
    const force = (move, p2, px) => { if (p2) { owl.hp = Math.floor(owl.maxHp * 0.49); owl.phase = 2; } else { owl.hp = owl.maxHp; owl.phase = 1; } owl.bag = [move]; owl.bagPh = p2 ? 2 : 1; owl.lastMove = ''; Object.assign(owl, { mode: 'sit', modeT: 0, hits: 0, ward: 0, perchI: 1 }); owl.x = owl.perches[1].x; owl.y = owl.perches[1].y; BK.P.x = px; BK.P.y = FL - 12; BK.P.vx = 0; BK.P.vy = 0; };
    outer: for (const p2 of [false, true]) for (const move of MOVES) for (let q = 0; q < 9; q++) { if (t >= T) break outer; const px = A.x0 + 60 + q * (A.x1 - A.x0 - 120) / 8; force(move, p2, px); nseg++;
      for (let k = 0; k < 420; k++, t++) { BK.P.inv = 5; BK.P.hp = BK.P.maxHp; BK.sim(1); hist[owl.mode] = (hist[owl.mode] || 0) + 1; if (!owl.alive) break;
        if (isRest(owl)) { seen[owl.mode] = (seen[owl.mode] || 0) + 1; if (owl.y >= FL - 12) { const d = Math.round(owl.y - (FL - 8)); dy[owl.mode] = dy[owl.mode] || {}; dy[owl.mode][d] = (dy[owl.mode][d] || 0) + 1; const b = bad(owl); if (b && viol.length < 12) viol.push(Object.assign({ t, move, p2, hero: Math.round(px) }, b)); } } } }
    out.modesSeen = hist;
    out.A ={ frames: t, segments: nseg, seen, viol, dy };
    /* B: forced */
    const calm = () => { for (const e of BK.enemies()) if (e !== owl) e.alive = false; };
    calm(); const B = {}; const modes = [...REST];
    for (const m of modes) { let n = 0, badN = 0, firstBad = null, stayed = 0;
      for (let x = A.x0 + 16; x <= A.x1 - 16; x += 16) {
        Object.assign(owl, { mode: m, modeT: 1.2, x, y: FL - 8, vx: 0, vy: 0, ward: 0, hp: owl.maxHp * 0.7, skimAt: 1, swAt: 1 });
        BK.P.x = A.x0 + 30; BK.P.y = FL - 12; BK.P.hp = BK.P.maxHp; BK.P.inv = 5; none();
        BK.sim(2); n++; if (owl.mode === m) stayed++; const b = owl.y >= FL - 12 ? bad(owl) : null; if (b) { badN++; if (!firstBad) firstBad = Object.assign({ from: x }, b); }
      }
      B[m] = { n, stayed, badN, firstBad }; }
    out.B = B;
    return out;
  })()`, (secs + 120) * 1000);
  console.log(JSON.stringify(R, null, 1));
  console.log('errors', JSON.stringify(pg.errors.slice(0, 5)));
} finally { pg.close(); }
